
-- ============ enums ============
CREATE TYPE public.app_role AS ENUM ('merchant','admin');
CREATE TYPE public.account_status AS ENUM ('pending','active','suspended');
CREATE TYPE public.invoice_status AS ENUM ('awaiting','underpaid','paid','overpaid','expired','cancelled','refunded');
CREATE TYPE public.payout_mode AS ENUM ('instant','hourly','daily','manual');
CREATE TYPE public.payout_status AS ENUM ('queued','processing','sent','failed');

-- ============ shared helpers ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ auth module ============
CREATE TABLE public.auth_user_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  company_name text,
  contact_phone text,
  website text,
  status public.account_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE ON public.auth_user_profile TO authenticated;
GRANT ALL ON public.auth_user_profile TO service_role;
ALTER TABLE public.auth_user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_select_own" ON public.auth_user_profile FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "profile_insert_own" ON public.auth_user_profile FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "profile_update_own" ON public.auth_user_profile FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_auth_user_profile_updated BEFORE UPDATE ON public.auth_user_profile FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.auth_user_role (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'merchant',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.auth_user_role TO authenticated;
GRANT ALL ON public.auth_user_role TO service_role;
ALTER TABLE public.auth_user_role ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_select_own" ON public.auth_user_role FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.auth_user_role WHERE user_id = _user_id AND role = _role AND is_active);
$$;

-- ============ merchant core ============
CREATE TABLE public.merchant_account (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  company_name text NOT NULL,
  business_email text,
  terno text NOT NULL UNIQUE,
  status public.account_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE ON public.merchant_account TO authenticated;
GRANT ALL ON public.merchant_account TO service_role;
ALTER TABLE public.merchant_account ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant_select_own" ON public.merchant_account FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "merchant_insert_own" ON public.merchant_account FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "merchant_update_own" ON public.merchant_account FOR UPDATE TO authenticated USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());
CREATE TRIGGER trg_merchant_account_updated BEFORE UPDATE ON public.merchant_account FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_merchant(_merchant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.merchant_account m WHERE m.id = _merchant_id AND m.owner_user_id = auth.uid());
$$;

CREATE TABLE public.merchant_api_key (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchant_account(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Default',
  public_key text NOT NULL UNIQUE,
  secret_hash text NOT NULL,
  secret_preview text NOT NULL,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_api_key TO authenticated;
GRANT ALL ON public.merchant_api_key TO service_role;
ALTER TABLE public.merchant_api_key ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api_key_all_own" ON public.merchant_api_key FOR ALL TO authenticated USING (public.owns_merchant(merchant_id)) WITH CHECK (public.owns_merchant(merchant_id));
CREATE TRIGGER trg_merchant_api_key_updated BEFORE UPDATE ON public.merchant_api_key FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.merchant_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchant_account(id) ON DELETE CASCADE,
  label text,
  asset text NOT NULL,
  network text NOT NULL,
  address text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  min_payout numeric(38,10) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_wallet TO authenticated;
GRANT ALL ON public.merchant_wallet TO service_role;
ALTER TABLE public.merchant_wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_all_own" ON public.merchant_wallet FOR ALL TO authenticated USING (public.owns_merchant(merchant_id)) WITH CHECK (public.owns_merchant(merchant_id));
CREATE TRIGGER trg_merchant_wallet_updated BEFORE UPDATE ON public.merchant_wallet FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.merchant_payout_setting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL UNIQUE REFERENCES public.merchant_account(id) ON DELETE CASCADE,
  mode public.payout_mode NOT NULL DEFAULT 'daily',
  min_payout_usd numeric(18,2) NOT NULL DEFAULT 10,
  auto_refund_overpayment boolean NOT NULL DEFAULT false,
  notification_email text,
  next_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE ON public.merchant_payout_setting TO authenticated;
GRANT ALL ON public.merchant_payout_setting TO service_role;
ALTER TABLE public.merchant_payout_setting ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payout_setting_all_own" ON public.merchant_payout_setting FOR ALL TO authenticated USING (public.owns_merchant(merchant_id)) WITH CHECK (public.owns_merchant(merchant_id));
CREATE TRIGGER trg_merchant_payout_setting_updated BEFORE UPDATE ON public.merchant_payout_setting FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ payments ============
CREATE TABLE public.payment_address_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset text NOT NULL,
  network text NOT NULL,
  address text NOT NULL,
  memo text,
  assigned_invoice_id uuid,
  assigned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (network, address)
);
GRANT ALL ON public.payment_address_pool TO service_role;
ALTER TABLE public.payment_address_pool ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payment_invoice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchant_account(id) ON DELETE CASCADE,
  order_id text NOT NULL,
  terno text,
  public_key text,
  product_name text NOT NULL,
  description text,
  amount_usd numeric(18,2) NOT NULL,
  fiat_currency text NOT NULL DEFAULT 'USD',
  customer_email text,
  asset text,
  network text,
  deposit_address text,
  deposit_memo text,
  due_amount numeric(38,10),
  received_amount numeric(38,10) NOT NULL DEFAULT 0,
  status public.invoice_status NOT NULL DEFAULT 'awaiting',
  redirect_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '60 minutes'),
  paid_at timestamptz,
  settled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (merchant_id, order_id)
);
CREATE INDEX idx_payment_invoice_merchant_created ON public.payment_invoice (merchant_id, created_at DESC);
CREATE INDEX idx_payment_invoice_status ON public.payment_invoice (status);
GRANT SELECT, INSERT, UPDATE ON public.payment_invoice TO authenticated;
GRANT ALL ON public.payment_invoice TO service_role;
ALTER TABLE public.payment_invoice ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_all_own" ON public.payment_invoice FOR ALL TO authenticated USING (public.owns_merchant(merchant_id)) WITH CHECK (public.owns_merchant(merchant_id));
CREATE TRIGGER trg_payment_invoice_updated BEFORE UPDATE ON public.payment_invoice FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.payment_deposit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.payment_invoice(id) ON DELETE CASCADE,
  tx_hash text NOT NULL,
  amount numeric(38,10) NOT NULL,
  asset text,
  network text,
  confirmations integer NOT NULL DEFAULT 0,
  confirmed boolean NOT NULL DEFAULT false,
  sender_address text,
  source text NOT NULL DEFAULT 'manual',
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (invoice_id, tx_hash)
);
GRANT SELECT ON public.payment_deposit TO authenticated;
GRANT ALL ON public.payment_deposit TO service_role;
ALTER TABLE public.payment_deposit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deposit_select_own" ON public.payment_deposit FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.payment_invoice i WHERE i.id = invoice_id AND public.owns_merchant(i.merchant_id)));
CREATE TRIGGER trg_payment_deposit_updated BEFORE UPDATE ON public.payment_deposit FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ payouts ============
CREATE TABLE public.payout_batch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchant_account(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES public.merchant_wallet(id) ON DELETE SET NULL,
  mode public.payout_mode NOT NULL DEFAULT 'daily',
  status public.payout_status NOT NULL DEFAULT 'queued',
  asset text NOT NULL,
  network text NOT NULL,
  destination_address text,
  gross_amount numeric(38,10) NOT NULL DEFAULT 0,
  fee_amount numeric(38,10) NOT NULL DEFAULT 0,
  net_amount numeric(38,10) NOT NULL DEFAULT 0,
  tx_hash text,
  error_message text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.payout_batch TO authenticated;
GRANT ALL ON public.payout_batch TO service_role;
ALTER TABLE public.payout_batch ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payout_batch_select_own" ON public.payout_batch FOR SELECT TO authenticated USING (public.owns_merchant(merchant_id));
CREATE TRIGGER trg_payout_batch_updated BEFORE UPDATE ON public.payout_batch FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.payout_batch_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.payout_batch(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.payment_invoice(id) ON DELETE CASCADE,
  amount numeric(38,10) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (batch_id, invoice_id)
);
GRANT SELECT ON public.payout_batch_item TO authenticated;
GRANT ALL ON public.payout_batch_item TO service_role;
ALTER TABLE public.payout_batch_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payout_item_select_own" ON public.payout_batch_item FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.payout_batch b WHERE b.id = batch_id AND public.owns_merchant(b.merchant_id)));
CREATE TRIGGER trg_payout_batch_item_updated BEFORE UPDATE ON public.payout_batch_item FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ webhooks + audit ============
CREATE TABLE public.webhook_endpoint (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchant_account(id) ON DELETE CASCADE,
  url text NOT NULL,
  signing_secret text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_endpoint TO authenticated;
GRANT ALL ON public.webhook_endpoint TO service_role;
ALTER TABLE public.webhook_endpoint ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_endpoint_all_own" ON public.webhook_endpoint FOR ALL TO authenticated USING (public.owns_merchant(merchant_id)) WITH CHECK (public.owns_merchant(merchant_id));
CREATE TRIGGER trg_webhook_endpoint_updated BEFORE UPDATE ON public.webhook_endpoint FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.webhook_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid NOT NULL REFERENCES public.webhook_endpoint(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.payment_invoice(id) ON DELETE SET NULL,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status_code integer,
  attempt integer NOT NULL DEFAULT 1,
  error_message text,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.webhook_delivery TO authenticated;
GRANT ALL ON public.webhook_delivery TO service_role;
ALTER TABLE public.webhook_delivery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_delivery_select_own" ON public.webhook_delivery FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.webhook_endpoint e WHERE e.id = endpoint_id AND public.owns_merchant(e.merchant_id)));
CREATE TRIGGER trg_webhook_delivery_updated BEFORE UPDATE ON public.webhook_delivery FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.merchant_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchant_account(id) ON DELETE CASCADE,
  user_id uuid,
  action text NOT NULL,
  entity text,
  entity_id text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.merchant_audit_log TO authenticated;
GRANT ALL ON public.merchant_audit_log TO service_role;
ALTER TABLE public.merchant_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_select_own" ON public.merchant_audit_log FOR SELECT TO authenticated USING (public.owns_merchant(merchant_id));
CREATE TRIGGER trg_merchant_audit_log_updated BEFORE UPDATE ON public.merchant_audit_log FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
