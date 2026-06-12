-- 001_create_transactions
-- Run this in Supabase SQL Editor: https://app.supabase.com → your project → SQL Editor

-- 1. Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     UUID NOT NULL DEFAULT auth.uid(),
  asset_type  TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto')),
  symbol      TEXT NOT NULL,
  name        TEXT NOT NULL DEFAULT '',
  tx_type     TEXT NOT NULL CHECK (tx_type IN ('buy', 'sell')),
  tx_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  price       DECIMAL(18,8) NOT NULL CHECK (price > 0),
  quantity    DECIMAL(18,8) NOT NULL CHECK (quantity > 0),
  fee         DECIMAL(18,8) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  notes       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 3. RLS policy: users can only read/write their own records
CREATE POLICY "users_own_data" ON transactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_asset
  ON transactions(user_id, asset_type);

CREATE INDEX IF NOT EXISTS idx_transactions_user_symbol
  ON transactions(user_id, asset_type, symbol);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON transactions(user_id, tx_date DESC);
