# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in details and create

## Step 2: Create Database Tables

Go to SQL Editor and run:

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

-- Indexes for performance
CREATE INDEX idx_user_address ON authorizations(user_address);
CREATE INDEX idx_admin_address ON authorizations(admin_address);
CREATE INDEX idx_authorized ON authorizations(authorized);
CREATE INDEX idx_transfer_status ON transfer_requests(status);
CREATE INDEX idx_transfer_from ON transfer_requests(from_address);

-- Enable Row Level Security
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on authorizations" 
  ON authorizations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on transfer_requests" 
  ON transfer_requests FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE authorizations;
ALTER PUBLICATION supabase_realtime ADD TABLE transfer_requests;
```

## Step 3: Get API Keys

1. Go to Project Settings → API
2. Copy:
   - Project URL
   - Anon/Public Key

## Step 4: Configure Environment

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_ADMIN_ADDRESS=0xYourAdminWalletAddress
```

## Step 5: Install & Run

```bash
npm install @supabase/supabase-js
npm run dev
```

## ✅ Done!

Your app is now connected to Supabase. Test by:
1. Connecting a wallet
2. Authorizing admin
3. Checking Supabase dashboard to see the record

## 🔒 Security Tips

For production, update RLS policies:

```sql
-- Users can only authorize themselves
CREATE POLICY "Users manage own authorizations"
  ON authorizations FOR ALL
  USING (user_address = current_setting('request.jwt.claims')::json->>'wallet_address');

-- Only admins can create transfer requests
CREATE POLICY "Admins create requests"
  ON transfer_requests FOR INSERT
  WITH CHECK (to_address = current_setting('request.jwt.claims')::json->>'wallet_address');
```

## 📊 Free Tier Limits

- 500MB database
- 2GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

Perfect for most apps!
