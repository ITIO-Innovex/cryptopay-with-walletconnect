ALTER TABLE public.auth_user_profile
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;

ALTER TABLE public.merchant_account
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS verification_skipped boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_ref text,
  ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'merchant_account_verification_status_check'
  ) THEN
    ALTER TABLE public.merchant_account
      ADD CONSTRAINT merchant_account_verification_status_check
      CHECK (verification_status IN ('not_started', 'in_review', 'verified', 'rejected'));
  END IF;
END $$;