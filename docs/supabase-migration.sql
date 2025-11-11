-- Migration SQL for Address Book and Transfer History
-- Run this in your Supabase SQL Editor

-- Address Book table
CREATE TABLE address_book (
  id BIGSERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_address, contact_address)
);

-- Transfer History table (owner transfers)
CREATE TABLE transfer_history (
  id BIGSERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tx_hash)
);

-- Indexes for performance
CREATE INDEX idx_address_book_user ON address_book(user_address);
CREATE INDEX idx_transfer_history_user ON transfer_history(user_address);
CREATE INDEX idx_transfer_history_status ON transfer_history(status);

-- Enable RLS
ALTER TABLE address_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_history ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all" ON address_book FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON transfer_history FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE address_book;
ALTER PUBLICATION supabase_realtime ADD TABLE transfer_history;
