# Admin Authorization System

This document explains the two-part authorization system implemented in the DApp.

## Overview

The system allows users to authorize admins to transfer funds from their accounts, with the following components:

1. **User Authorization Component** - Allows users to grant/revoke admin access
2. **Admin Dashboard Component** - Allows admins to manage authorized user accounts

## How It Works

### User Authorization Flow

1. User connects their wallet to the DApp
2. User navigates to the "Authorize" tab
3. User sees the admin address and can click "Authorize Admin"
4. Authorization is stored in localStorage with key `auth_{user_wallet_address}`
5. User can revoke access at any time

### Admin Dashboard Flow

1. Admin connects with the pre-configured admin wallet address
2. Admin navigates to the "Admin" tab
3. Dashboard scans localStorage for all keys starting with `auth_`
4. Displays a list of all users who have authorized the admin
5. Admin can select any authorized user to view their balances
6. Admin can transfer funds from the selected user to themselves

## Technical Implementation

### Data Storage

For demonstration purposes, we use localStorage:
- User authorizations are stored as `auth_{wallet_address}: "true"`
- Admin dashboard scans all localStorage keys to build the user list
- This simulates what would be stored on-chain with smart contracts

### Security Model

The implementation follows these security principles:
- Users must explicitly authorize admins (opt-in)
- Authorization can be revoked at any time
- Only the specific admin address can access the admin features
- No private keys are ever shared or stored

## Components

### UserAuthorization Component

Located at `components/user-authorization.tsx`

Key features:
- Shows admin address for verification
- One-click authorization with visual confirmation
- Ability to revoke access
- No private key sharing required

### AdminDashboard Component

Located at `components/admin-dashboard.tsx`

Key features:
- Real-time list of authorized users
- Balance viewing for any authorized user
- Fund transfer functionality
- Automatic updates when new users authorize

## Configuration

The admin address is configured in:
- Environment variable: `NEXT_PUBLIC_ADMIN_ADDRESS` in `.env.local`
- Fallback value in `lib/config.ts`

## Future Improvements

1. Replace localStorage with actual smart contract storage
2. Add expiration dates for authorizations
3. Implement multi-signature authorization
4. Add transaction history for admin transfers
5. Implement role-based access control