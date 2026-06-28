ALTER TABLE public.donations_ledger
  DROP CONSTRAINT donations_ledger_provider_check,
  ADD CONSTRAINT donations_ledger_provider_check
    CHECK (provider IN ('CARD', 'MTN_MOMO', 'AIRTEL_MONEY'));
