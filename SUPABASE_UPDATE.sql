-- Add admin_wallets table
CREATE TABLE admin_wallets (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your admin wallet
INSERT INTO admin_wallets (wallet_address) VALUES ('0x742d35Cc6634C0532925a3b8D91D0a74b4A3Bb31');

-- Enable RLS
ALTER TABLE admin_wallets ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow read admin_wallets" ON admin_wallets FOR SELECT USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE admin_wallets;
