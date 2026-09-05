ALTER TABLE public.merchant_account
  ADD COLUMN IF NOT EXISTS verification_session_id text,
  ADD COLUMN IF NOT EXISTS verification_decision jsonb,
  ADD COLUMN IF NOT EXISTS verification_reason text;

CREATE TABLE IF NOT EXISTS public.kyc_webhook_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  session_id text,
  webhook_type text,
  status text,
  vendor_data text,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

GRANT ALL ON public.kyc_webhook_event TO service_role;
ALTER TABLE public.kyc_webhook_event ENABLE ROW LEVEL SECURITY;