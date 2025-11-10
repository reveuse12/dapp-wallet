# Complete Setup & Usage Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Supabase
```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Copy Project URL and Anon Key

### 3. Setup Database
Run this SQL in Supabase SQL Editor:

```sql
-- Authorizations table
CREATE TABLE authorizations (
  id BIGSERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  admin_address TEXT NOT NULL,
  authorized BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_address, admin_address)
);

-- Transfer requests table
CREATE TABLE transfer_requests (
  id BIGSERIAL PRIMARY KEY,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_user_address ON authorizations(user_address);
CREATE INDEX idx_admin_address ON authorizations(admin_address);
CREATE INDEX idx_transfer_status ON transfer_requests(status);

-- Enable RLS
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all" ON authorizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON transfer_requests FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE authorizations;
ALTER PUBLICATION supabase_realtime ADD TABLE transfer_requests;
```

### 4. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_ADMIN_ADDRESS=your_admin_wallet
```

### 5. Run
```bash
npm run dev
```

---

## 📱 How to Use

### For Regular Users:

#### Step 1: Authorize Admin
1. Connect your wallet
2. Click "Authorize" tab
3. Click "Authorize Admin" button
4. Done! (stored in Supabase - FREE)

#### Step 2: Approve Transfer Requests
1. Click "Requests" tab
2. See pending requests from admin
3. Click "Approve" or "Reject"
4. If approved, wallet popup appears
5. Confirm transaction
6. Transfer complete!

### For Admin:

#### Step 1: View Authorized Users
1. Connect admin wallet
2. Click "Admin" tab
3. See list of users who authorized you

#### Step 2: Request Transfer
1. Select a user from the list
2. Enter amount
3. Click "Request Transfer from User"
4. Request sent! (stored in Supabase)
5. User will see it in their "Requests" tab

---

## 🔐 Security & How It Works

### Authorization Flow:
```
User → Authorize Admin → Stored in Supabase (FREE)
```

### Transfer Flow:
```
Admin → Request Transfer → Stored in Supabase
User → See Request → Approve in Wallet → Transfer Executes
```

### Important:
- ✅ Users maintain full control
- ✅ Users must approve EACH transfer
- ✅ Authorization = permission to REQUEST, not to TAKE
- ✅ This is standard Web3 security

---

## 💰 Cost Breakdown

| Action | Cost |
|--------|------|
| User authorizes admin | $0 |
| Admin requests transfer | $0 |
| User approves transfer | Gas fee only (~$0.10) |
| Database storage | $0 (free tier) |
| Real-time updates | $0 |

**Total: FREE** (except gas for actual transfers)

---

## 🎯 Features

- ✅ User authorization system
- ✅ Admin dashboard
- ✅ Transfer request system
- ✅ Real-time updates
- ✅ Pending requests view
- ✅ Approve/Reject transfers
- ✅ Beautiful UI
- ✅ Mobile responsive
- ✅ 100% FREE (no blockchain costs)

---

## 🛠️ Troubleshooting

### "Failed to fetch"
- Check Supabase URL and key in `.env.local`
- Restart dev server after changing env

### "No requests showing"
- Check if tables were created
- Verify RLS policies allow reads

### "Transfer failed"
- Check wallet has enough balance
- Verify user approved in wallet popup

---

## 📊 Database Structure

### authorizations table:
- `user_address` - User who authorized
- `admin_address` - Admin who was authorized
- `authorized` - true/false
- `created_at` - When authorized

### transfer_requests table:
- `from_address` - User to transfer from
- `to_address` - Admin to transfer to
- `amount` - Amount in BNB
- `status` - pending/completed/rejected
- `created_at` - When requested

---

## 🎓 Next Steps

1. Test with testnet first
2. Customize admin address
3. Add email notifications (optional)
4. Deploy to production
5. Share with users!

---

## ✅ That's It!

You now have a fully functional authorization and transfer request system, completely FREE with Supabase!
