-- Update payment_method check constraint from 'revolut' to 'durianbank'
-- Run this in Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE payment_intents DROP CONSTRAINT IF EXISTS payment_intents_payment_method_check;

-- Add the new constraint with 'durianbank' instead of 'revolut'
ALTER TABLE payment_intents ADD CONSTRAINT payment_intents_payment_method_check 
  CHECK (payment_method IN ('usdc', 'durianbank'));

-- Also update any existing records that have 'revolut' as payment method
UPDATE payment_intents SET payment_method = 'durianbank' WHERE payment_method = 'revolut';
