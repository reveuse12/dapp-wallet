-- ============================================
-- PRODUCTION DATABASE SETUP
-- ============================================
-- Run this ONCE in Supabase SQL Editor
-- This will create all tables with proper structure

-- Drop existing tables if they exist
DROP TABLE IF EXISTS transfer_requests CASCADE;
DROP TABLE IF EXISTS transfer_history CASCADE;
DROP TABLE IF EXISTS address_book CASCADE;
DROP TABLE IF EXISTS authorizations CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;

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
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{"can_request_transfers": true, "can_view_users": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. AUTHORIZATIONS TABLE
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
  expiration_date TIMESTAMP WITH TIME ZONE,
  amount_limit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, admin_id)
);

-- ============================================
-- 4. TRANSFER REQUESTS TABLE
-- ============================================
CREATE TABLE transfer_requests (
  id BIGSERIAL PRIMARY KEY,
  authorization_id BIGINT REFERENCES authorizations(id) ON DELETE SET NULL,
  from_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_admin_id BIGINT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
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
-- 5. TRANSFER HISTORY TABLE
-- ============================================
CREATE TABLE transfer_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transfer_request_id BIGINT REFERENCES transfer_requests(id) ON DELETE SET NULL,
  user_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  amount TEXT NOT NULL,
  transfer_type TEXT DEFAULT 'owner',
  status TEXT DEFAULT 'pending',
  block_number TEXT,
  gas_used TEXT,
  gas_price TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ADDRESS BOOK TABLE
-- ============================================
CREATE TABLE address_book (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_address TEXT NOT NULL,
  contact_type TEXT DEFAULT 'personal',
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_address)
);

-- ============================================
-- 7. AUDIT LOG TABLE
-- ============================================
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
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
CREATE INDEX idx_admins_wallet ON admins(wallet_address);
CREATE INDEX idx_admins_user_id ON admins(user_id);
CREATE INDEX idx_authorizations_user ON authorizations(user_id);
CREATE INDEX idx_authorizations_admin ON authorizations(admin_id);
CREATE INDEX idx_authorizations_status ON authorizations(authorized);
CREATE INDEX idx_transfer_requests_from ON transfer_requests(from_user_id);
CREATE INDEX idx_transfer_requests_to ON transfer_requests(to_admin_id);
CREATE INDEX idx_transfer_requests_status ON transfer_requests(status);
CREATE INDEX idx_transfer_history_user ON transfer_history(user_id);
CREATE INDEX idx_address_book_user ON address_book(user_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations (using wallet-based auth, not Supabase auth)
CREATE POLICY "Allow all" ON users FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON admins FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON authorizations FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON transfer_requests FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON transfer_history FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON address_book FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON audit_log FOR ALL TO public USING (true) WITH CHECK (true);

-- ============================================
-- ENABLE REALTIME
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE users;
  ALTER PUBLICATION supabase_realtime ADD TABLE admins;
  ALTER PUBLICATION supabase_realtime ADD TABLE authorizations;
  ALTER PUBLICATION supabase_realtime ADD TABLE transfer_requests;
  ALTER PUBLICATION supabase_realtime ADD TABLE transfer_history;
  ALTER PUBLICATION supabase_realtime ADD TABLE address_book;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- SEED ADMIN DATA (YOUR ADMIN ADDRESS)
-- ============================================
-- Insert admin as a user
INSERT INTO users (wallet_address, metadata)
VALUES (
  LOWER('0x8668B2720B2Fe3B1Db0CDc11b7dc7cBa5685F679'),
  '{"role": "admin", "is_system_admin": true}'::jsonb
)
ON CONFLICT (wallet_address) DO NOTHING;

-- Create admin record
INSERT INTO admins (user_id, wallet_address, role, permissions)
SELECT 
  id,
  wallet_address,
  'super_admin',
  '{"can_request_transfers": true, "can_view_users": true, "can_manage_admins": true}'::jsonb
FROM users
WHERE wallet_address = LOWER('0x8668B2720B2Fe3B1Db0CDc11b7dc7cBa5685F679')
ON CONFLICT (wallet_address) DO NOTHING;

-- ============================================
-- VERIFY SETUP
-- ============================================
SELECT 'Setup complete!' as status;
SELECT * FROM users;
SELECT * FROM admins;
