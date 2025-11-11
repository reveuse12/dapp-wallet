# Production Architecture Overview

## System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER CONNECTS WALLET                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              useUserAuth Hook (Auto-triggered)               │
│  • Calls registerUserLogin()                                 │
│  • Creates/updates user in DB                                │
│  • Increments login count                                    │
│  • Checks admin status                                       │
│  • Logs audit event                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   UserProvider Context                       │
│  • Shares user state across app                             │
│  • Provides: user, isAdmin, isLoading                       │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│   Regular User   │          │   Admin User     │
└────────┬─────────┘          └────────┬─────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│ User Features:   │          │ Admin Features:  │
│ • Authorize      │          │ • View users     │
│ • View requests  │          │ • Request $      │
│ • Approve/Reject │          │ • Track status   │
│ • Address book   │          │ • Analytics      │
│ • History        │          │ • Audit logs     │
└──────────────────┘          └──────────────────┘
```

## Database Schema

```
┌──────────────┐
│    users     │ ← Main user table
├──────────────┤
│ id (PK)      │
│ wallet_addr  │
│ first_seen   │
│ last_seen    │
│ total_logins │
│ is_active    │
└──────┬───────┘
       │
       │ 1:N
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│    admins    │                  │ address_book │
├──────────────┤                  ├──────────────┤
│ id (PK)      │                  │ id (PK)      │
│ user_id (FK) │                  │ user_id (FK) │
│ wallet_addr  │                  │ contact_name │
│ role         │                  │ contact_addr │
│ permissions  │                  └──────────────┘
└──────┬───────┘
       │
       │ N:M (through authorizations)
       │
       ▼
┌──────────────────┐
│ authorizations   │ ← Links users to admins
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ admin_id (FK)    │
│ authorized       │
│ expiration_date  │
│ amount_limit     │
└────────┬─────────┘
         │
         │ 1:N
         │
         ▼
┌──────────────────┐
│transfer_requests │ ← Admin requests transfers
├──────────────────┤
│ id (PK)          │
│ auth_id (FK)     │
│ from_user_id(FK) │
│ to_admin_id (FK) │
│ amount           │
│ status           │
│ tx_hash          │
└────────┬─────────┘
         │
         │ 1:1
         │
         ▼
┌──────────────────┐
│transfer_history  │ ← Completed transfers
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ request_id (FK)  │
│ tx_hash          │
│ amount           │
│ status           │
└──────────────────┘

┌──────────────────┐
│   audit_log      │ ← All actions logged
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ action           │
│ entity_type      │
│ old_values       │
│ new_values       │
│ timestamp        │
└──────────────────┘
```

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                      │
│  (user-authorization, admin-dashboard, etc.)            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  user.service    │  │  auth.service    │            │
│  │  • register      │  │  • authorize     │            │
│  │  • login         │  │  • revoke        │            │
│  │  • getUser       │  │  • check         │            │
│  │  • isAdmin       │  │  • getAdmins     │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │transfer.service  │  │  audit.service   │            │
│  │  • create        │  │  • logEvent      │            │
│  │  • approve       │  │  • getHistory    │            │
│  │  • reject        │  │  • analytics     │            │
│  │  • complete      │  │                  │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Client                         │
│  • Database operations                                   │
│  • Real-time subscriptions                              │
│  • Row Level Security                                    │
└─────────────────────────────────────────────────────────┘
```

## Authorization Flow

```
┌──────────┐                                    ┌──────────┐
│   User   │                                    │  Admin   │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │ 1. Connect Wallet                             │
     ├──────────────────────────────────────────────►│
     │                                               │
     │ 2. Click "Authorize Admin"                    │
     ├──────────────────────────────────────────────►│
     │                                               │
     │ 3. Authorization saved to DB                  │
     │    (with optional expiration & limits)        │
     │◄──────────────────────────────────────────────┤
     │                                               │
     │                                               │ 4. Admin sees
     │                                               │    authorized user
     │                                               │
     │                                               │ 5. Admin creates
     │ 6. User sees transfer request ◄───────────────┤    transfer request
     │                                               │
     │ 7. User approves/rejects                      │
     ├──────────────────────────────────────────────►│
     │                                               │
     │ 8. If approved, wallet popup                  │
     │    User signs transaction                     │
     │                                               │
     │ 9. Transaction sent to blockchain             │
     ├──────────────────────────────────────────────►│
     │                                               │
     │ 10. Status updated in DB                      │
     │◄──────────────────────────────────────────────┤
     │                                               │
     │ 11. Both see completion                       │
     │◄──────────────────────────────────────────────┤
     │                                               │
```

## Data Flow

### User Login Flow
```
Wallet Connect
    ↓
useUserAuth hook triggered
    ↓
registerUserLogin(address)
    ↓
Check if user exists in DB
    ↓
    ├─ Exists → Update last_seen, increment logins
    └─ New → Create user record
    ↓
Check if user is admin
    ↓
Update UserContext
    ↓
Components re-render with user data
```

### Transfer Request Flow
```
Admin Dashboard
    ↓
Select user + enter amount
    ↓
createTransferRequest()
    ↓
Save to transfer_requests table
    ↓
Real-time subscription notifies user
    ↓
User sees request in "Requests" tab
    ↓
User clicks Approve
    ↓
approveTransferRequest()
    ↓
Wallet popup for signature
    ↓
Transaction sent to blockchain
    ↓
completeTransferRequest(txHash)
    ↓
Update status + save to transfer_history
    ↓
Both parties see completion
```

## Key Features

### 1. Automatic User Management
- ✅ Users registered on first wallet connect
- ✅ Login history tracked
- ✅ Last seen timestamp updated
- ✅ User statistics available

### 2. Role-Based Access
- ✅ Regular users vs admins
- ✅ Admin permissions configurable
- ✅ Multiple admin support
- ✅ Role-based UI rendering

### 3. Audit Trail
- ✅ All actions logged
- ✅ Old/new values tracked
- ✅ User agent captured
- ✅ Compliance ready

### 4. Data Integrity
- ✅ Foreign key constraints
- ✅ Cascade deletes
- ✅ Unique constraints
- ✅ Automatic timestamps

### 5. Real-time Updates
- ✅ Live authorization changes
- ✅ Instant transfer notifications
- ✅ Address book sync
- ✅ Multi-device support

## Security Layers

```
┌─────────────────────────────────────┐
│   1. Wallet Signature Required      │ ← User must sign with private key
├─────────────────────────────────────┤
│   2. Authorization Check            │ ← Admin must be authorized
├─────────────────────────────────────┤
│   3. Database Validation            │ ← Foreign keys, constraints
├─────────────────────────────────────┤
│   4. Row Level Security (RLS)       │ ← Supabase policies
├─────────────────────────────────────┤
│   5. Audit Logging                  │ ← All actions tracked
├─────────────────────────────────────┤
│   6. Blockchain Verification        │ ← Transaction on-chain
└─────────────────────────────────────┘
```

## Performance Optimizations

1. **Database Indexes**
   - All foreign keys indexed
   - Common query patterns indexed
   - Composite indexes where needed

2. **Real-time Subscriptions**
   - Filtered by user/admin
   - Only relevant data pushed
   - Automatic reconnection

3. **React Query Caching**
   - Balance queries cached
   - Automatic refetch on focus
   - Optimistic updates

4. **Service Layer**
   - Centralized logic
   - Reusable functions
   - Error handling

## Scalability Considerations

- **Horizontal Scaling**: Supabase handles DB scaling
- **Caching**: React Query for client-side caching
- **Pagination**: Implemented for large lists
- **Indexes**: Optimized for common queries
- **Connection Pooling**: Supabase manages connections

## Monitoring Points

1. **User Metrics**
   - Total users
   - Active users (DAU/MAU)
   - New registrations
   - Login frequency

2. **Transfer Metrics**
   - Request volume
   - Approval rate
   - Average amount
   - Completion time

3. **System Health**
   - Database response time
   - Real-time connection status
   - Error rates
   - Audit log growth

## Future Enhancements

- [ ] Email notifications
- [ ] SMS alerts for transfers
- [ ] Multi-signature support
- [ ] Scheduled transfers
- [ ] Recurring authorizations
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Export functionality
- [ ] API for third-party integrations
- [ ] Webhook support
