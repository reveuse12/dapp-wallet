-- ============================================
-- PRODUCTION-GRADE DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor
-- This will replace the existing tables with proper structure

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS transfer_requests CASCADE;
DROP TABLE IF EXISTS transfer_history CASCADE;
DROP TABLE IF EXISTS address_book CASCADE;
DROP TABLE IF EXISTS authorizations CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_logins INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ADMINS TABLE
-- ============================================
CREATE TABLE admins (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin', -- 'admin', 'super_admin', etc.
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{"can_request_transfers": true, "can_view_users": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. AUTHORIZATIONS TABLE (Redesigned)
-- ============================================
CREATE TABLE authorizations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id BIGINT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  admin_address TEXT NOT NULL,
  authorized BOOLEAN DEFAULT true,
  authorized_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE, -- Optional expiration
  amount_limit TEXT, -- Optional spending limit
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, admin_id)
);

-- ============================================
-- 4. TRANSFER REQUESTS TABLE (Enhanced)
-- ============================================
CREATE TABLE transfer_requests (
  id BIGSERIAL PRIMARY KEY,
  authorization_id BIGINT REFERENCES authorizations(id) ON DELETE SET NULL,
  from_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_admin_id BIGINT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed', 'failed'
  tx_hash TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. TRANSFER HISTORY TABLE (Enhanced)
-- ============================================
CREATE TABLE transfer_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transfer_request_id BIGINT REFERENCES transfer_requests(id) ON DELETE SET NULL,
  user_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  amount TEXT NOT NULL,
  transfer_type TEXT DEFAULT 'owner', -- 'owner', 'admin_request', 'regular'
  status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed'
  block_number TEXT,
  gas_used TEXT,
  gas_price TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ADDRESS BOOK TABLE (Enhanced)
-- ============================================
CREATE TABLE address_book (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_address TEXT NOT NULL,
  contact_type TEXT DEFAULT 'personal', -- 'personal', 'business', 'exchange'
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_address)
);

-- ============================================
-- 7. AUDIT LOG TABLE (New - for tracking all actions)
-- ============================================
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'login', 'authorize_admin', 'revoke_admin', 'transfer_request', etc.
  entity_type TEXT, -- 'user', 'admin', 'authorization', 'transfer'
  entity_id BIGINT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_last_seen ON users(last_seen_at);

CREATE INDEX idx_admins_wallet ON admins(wallet_address);
CREATE INDEX idx_admins_user_id ON admins(user_id);
CREATE INDEX idx_admins_active ON admins(is_active);

CREATE INDEX idx_authorizations_user ON authorizations(user_id);
CREATE INDEX idx_authorizations_admin ON authorizations(admin_id);
CREATE INDEX idx_authorizations_status ON authorizations(authorized);
CREATE INDEX idx_authorizations_addresses ON authorizations(user_address, admin_address);

CREATE INDEX idx_transfer_requests_from ON transfer_requests(from_user_id);
CREATE INDEX idx_transfer_requests_to ON transfer_requests(to_admin_id);
CREATE INDEX idx_transfer_requests_status ON transfer_requests(status);
CREATE INDEX idx_transfer_requests_created ON transfer_requests(created_at);

CREATE INDEX idx_transfer_history_user ON transfer_history(user_id);
CREATE INDEX idx_transfer_history_tx ON transfer_history(tx_hash);
CREATE INDEX idx_transfer_history_status ON transfer_history(status);

CREATE INDEX idx_address_book_user ON address_book(user_id);
CREATE INDEX idx_address_book_favorite ON address_book(is_favorite);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policies (Allow all for now - can be restricted later)
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON authorizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON transfer_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON transfer_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON address_book FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON audit_log FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE admins;
ALTER PUBLICATION supabase_realtime ADD TABLE authorizations;
ALTER PUBLICATION supabase_realtime ADD TABLE transfer_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE transfer_history;
ALTER PUBLICATION supabase_realtime ADD TABLE address_book;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authorizations_updated_at BEFORE UPDATE ON authorizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transfer_requests_updated_at BEFORE UPDATE ON transfer_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transfer_history_updated_at BEFORE UPDATE ON transfer_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_address_book_updated_at BEFORE UPDATE ON address_book
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED ADMIN DATA (Update with your admin address)
-- ============================================
-- First, insert admin as a user
INSERT INTO users (wallet_address, metadata)
VALUES (
  '0x742d35Cc6634C0532925a3b8D91D0a74b4A3Bb31', -- Replace with your admin address
  '{"role": "admin", "is_system_admin": true}'::jsonb
)
ON CONFLICT (wallet_address) DO NOTHING;

-- Then, create admin record
INSERT INTO admins (user_id, wallet_address, role, permissions)
SELECT 
  id,
  wallet_address,
  'super_admin',
  '{"can_request_transfers": true, "can_view_users": true, "can_manage_admins": true}'::jsonb
FROM users
WHERE wallet_address = '0x742d35Cc6634C0532925a3b8D91D0a74b4A3Bb31' -- Replace with your admin address
ON CONFLICT (wallet_address) DO NOTHING;

-- ============================================
-- VIEWS FOR EASY QUERYING
-- ============================================

-- View: Active authorizations with user and admin details
CREATE OR REPLACE VIEW active_authorizations AS
SELECT 
  a.id,
  a.user_id,
  a.admin_id,
  u.wallet_address as user_wallet,
  ad.wallet_address as admin_wallet,
  a.authorized,
  a.authorized_at,
  a.expiration_date,
  a.amount_limit
FROM authorizations a
JOIN users u ON a.user_id = u.id
JOIN admins ad ON a.admin_id = ad.id
WHERE a.authorized = true
  AND (a.expiration_date IS NULL OR a.expiration_date > NOW());

-- View: Transfer request summary
CREATE OR REPLACE VIEW transfer_request_summary AS
SELECT 
  tr.id,
  tr.status,
  tr.amount,
  u.wallet_address as from_wallet,
  ad.wallet_address as to_wallet,
  tr.requested_at,
  tr.completed_at,
  tr.tx_hash
FROM transfer_requests tr
JOIN users u ON tr.from_user_id = u.id
JOIN admins ad ON tr.to_admin_id = ad.id;

-- ============================================
-- DONE!
-- ============================================
-- Your production-grade database is ready!
