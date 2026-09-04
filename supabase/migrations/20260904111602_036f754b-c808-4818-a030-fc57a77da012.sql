CREATE TABLE public.email_verification_code (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX email_verification_code_email_idx ON public.email_verification_code (lower(email), created_at DESC);
GRANT ALL ON public.email_verification_code TO service_role;
ALTER TABLE public.email_verification_code ENABLE ROW LEVEL SECURITY;