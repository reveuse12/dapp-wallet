# 🚀 DApp with Admin Authorization System

A Next.js DApp with Supabase-powered admin authorization and transfer request system.

**100% FREE - No blockchain costs!**

## ⚡ Quick Start

```bash
npm install @supabase/supabase-js
```

Then follow [GUIDE.md](./docs/GUIDE.md) for complete setup (5 minutes).

## 📋 What You Need

1. Supabase account (free)
2. 5 minutes
3. That's it!

## 🎯 Features

- ✅ User authorization system
- ✅ Admin dashboard  
- ✅ Transfer request system
- ✅ Real-time updates
- ✅ Beautiful UI
- ✅ **100% FREE**

## 📚 Documentation

- **[docs/](./docs/)** - All documentation and guides
- **[database/](./database/)** - SQL schemas and migrations

## 🔐 How It Works

### For Users:
1. Authorize admin (one-time)
2. See transfer requests
3. Approve/reject in wallet

### For Admin:
1. See authorized users
2. Request transfers
3. Wait for user approval

## 💡 Important

Users must approve each transfer in their wallet. This is a security feature - admins can REQUEST transfers, not execute them automatically.

## 🚀 Quick Setup

### 1. Install
```bash
npm install @supabase/supabase-js
```

### 2. Setup Supabase

Create account at [supabase.com](https://supabase.com) and run this SQL:

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

-- Policies (allow all for now)
CREATE POLICY "Allow all" ON authorizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON transfer_requests FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE authorizations;
ALTER PUBLICATION supabase_realtime ADD TABLE transfer_requests;
```

### 3. Configure

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_ADMIN_ADDRESS=your_admin_wallet
```

### 4. Run
```bash
npm run dev
```

## 🎉 Done!

See [docs/GUIDE.md](./docs/GUIDE.md) for detailed usage instructions.
