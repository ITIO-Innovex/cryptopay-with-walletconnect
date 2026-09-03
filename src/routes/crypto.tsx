import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CRYPTO_CURRENCIES,
  PRICE_PER_USD,
  type CryptoCurrency,
  type CryptoNetwork,
} from "@/data/cryptocurrencies";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CurrencyList } from "@/components/checkout/CurrencyList";
import { NetworkList } from "@/components/checkout/NetworkList";
import { SendFunds } from "@/components/checkout/SendFunds";
import { PaymentProcessing } from "@/components/checkout/PaymentProcessing";
import { PaymentCompleted } from "@/components/checkout/PaymentCompleted";
import { FooterBar } from "@/components/checkout/FooterBar";
import { SimulationPanel } from "@/components/checkout/SimulationPanel";
import {
  fetchCheckoutS2sStatus,
  fetchLocalCryptoStatus,
  resetLocalCryptoDeposit,
  simulateLocalCryptoDeposit,
  type LocalCryptoStatus,
} from "@/lib/crypto-status-api";
import { derivePaymentStatus, formatAmount, type PaymentStatus } from "@/lib/payment";
import { MarketingLanding } from "@/components/site/MarketingLanding";

function statusFromLocalGateway(
  gw: LocalCryptoStatus | null | undefined,
  due: number,
  received: number,
): PaymentStatus {
  const os = String(gw?.order_status ?? "").trim();
  if (os === "1") return "completed";
  if (os === "3") return "completed";
  const phase = (gw?.payment_phase || "").trim();
  if (phase === "paid_in_tolerance") return "completed";
  if (phase === "underpaid") return "insufficient";
  if (phase === "overpaid") return "overpaid";
  if (phase === "awaiting_payment") return "awaiting";
  return derivePaymentStatus(due, received);
}

function messageFromLocalGateway(gw: LocalCryptoStatus, due: number, received: number): string {
  const paid = parseFloat(gw.paid_crypto_amount || "0") || received;
  const phase = statusFromLocalGateway(gw, due, paid);
  if (phase === "completed") {
    return `Payment detected: ${formatAmount(paid)} received (within tolerance).`;
  }
  if (phase === "overpaid") {
    return `Overpayment detected: ${formatAmount(paid)} received (due ${formatAmount(due)}).`;
  }
  if (phase === "insufficient") {
    const rem = Math.max(0, due - paid);
    return `Partial payment: ${formatAmount(paid)} received — please send remaining ${formatAmount(rem)}.`;
  }
  return "No deposit detected yet in the local status service. On-chain watching is not enabled in this build — use the Payment simulator (DEV) after a real wallet send, or check again after the status service records the deposit.";
}

type Search = { transID?: string; feHost?: string };
type Step = "currency" | "network" | "send";

type AuthPayload = {
  order_status?: string | number;
  status?: string;
  response?: string;
  bill_amt?: string | number;
  bill_currency?: string;
  payaddress?: string;
  upa?: string;
  action?: string;
  product_name?: string;
  paytitle?: string;
  reference?: string;
  mop?: string;
  mop_name?: string;
  return_url?: string;
  authdata?: Record<string, unknown> | string;
};

/** Coerce query values — TanStack may pass numeric-looking transIDs as numbers. */
function coerceTransId(raw: unknown): string {
  if (raw == null || raw === "") return "";
  if (typeof raw === "string" || typeof raw === "number" || typeof raw === "bigint") {
    // Strip accidental JSON quotes from corrupted search rewrites
    return String(raw).trim().replace(/^"+|"+$/g, "");
  }
  return "";
}

function transIdFromWindow(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("transID") ||
    params.get("transId") ||
    params.get("transid") ||
    ""
  ).trim();
}

function readString(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function parseAuthMap(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as Record<string, unknown>;
  return {};
}

/**
 * Authurl may return wrapper { authdata: { network, payaddress, ... }, action, payamt }
 * or already-flat connector authdata. Prefer the innermost deposit fields.
 */
function unwrapDepositAuthdata(payload: AuthPayload | null): Record<string, unknown> {
  if (!payload) return {};
  const outer = parseAuthMap(payload.authdata);
  const nested = parseAuthMap(outer.authdata);
  if (
    nested.payaddress ||
    nested.network ||
    nested.crypto_amount ||
    nested.asset ||
    nested.ledger ||
    nested.address_id
  ) {
    return nested;
  }
  return outer;
}

/** Map connector network keys (ETH_ERC20, BTC, …) → catalog currency + network. */
function resolveCurrencyNetwork(
  asset: string,
  networkKey: string,
  mopName: string,
): { currency: CryptoCurrency | null; network: CryptoNetwork | null } {
  const assetUp = asset.toUpperCase();
  const netUp = networkKey.toUpperCase().replace(/-/g, "_");
  const mopUp = mopName.toUpperCase();

  let symbol =
    assetUp ||
    (mopUp.startsWith("BTC")
      ? "BTC"
      : mopUp.startsWith("ETH")
        ? "ETH"
        : mopUp.startsWith("SOL")
          ? "SOL"
          : mopUp.startsWith("USDC")
            ? "USDC"
            : mopUp.startsWith("USDT") || netUp.includes("ERC20") || netUp.includes("TRC20")
              ? "USDT"
              : netUp === "BTC" || netUp === "BTC_MAINNET"
                ? "BTC"
                : "USDT");

  if (netUp === "BTC" || netUp === "BTC_MAINNET" || mopUp === "BTC_MAINNET" || mopUp.startsWith("BTC_")) {
    symbol = "BTC";
  }

  const currency = CRYPTO_CURRENCIES.find((c) => c.symbol === symbol) ?? null;
  if (!currency) return { currency: null, network: null };

  const pickNetwork = (): CryptoNetwork => {
    if (mopUp === "BTC_MAINNET" || netUp === "BTC" || netUp === "BTC_MAINNET" || (mopUp.startsWith("BTC") && symbol === "BTC")) {
      return currency.networks[0];
    }
    if (netUp.includes("TRC20") || netUp.includes("TRON") || mopUp.includes("TRC20")) {
      return currency.networks.find((n) => /trc/i.test(n.standard) || /tron/i.test(n.name))
        ?? currency.networks[0];
    }
    if (netUp.includes("BEP20") || netUp.includes("BSC") || mopUp.includes("BEP20") || mopUp.includes("BSC")) {
      return currency.networks.find((n) => /bep/i.test(n.standard) || /binance|bsc/i.test(n.name))
        ?? currency.networks[0];
    }
    if (netUp.includes("SOLANA") || netUp === "SOL" || netUp.includes("SPL") || mopUp.includes("SOLANA")) {
      return currency.networks.find((n) => /sol/i.test(n.name) || /spl/i.test(n.standard))
        ?? currency.networks[0];
    }
    if (netUp.includes("ARBITRUM") || mopUp.includes("ARBITRUM")) {
      return currency.networks.find((n) => /arbitrum/i.test(n.name)) ?? currency.networks[0];
    }
    if (netUp.includes("AVALANCHE") || netUp.includes("AVAX") || mopUp.includes("AVALANCHE")) {
      return currency.networks.find((n) => /avalanche/i.test(n.name)) ?? currency.networks[0];
    }
    if (netUp.includes("ERC20") || netUp.includes("ETH") || mopUp.includes("ERC20")) {
      return currency.networks.find((n) => /ethereum/i.test(n.name) || /erc/i.test(n.standard))
        ?? currency.networks[0];
    }
    return currency.networks[0];
  };

  return { currency, network: pickNetwork() };
}

/** Ss3-style payment summary: product · network, crypto amount, fiat ≈ */
function CryptoOrderSummary({
  productName,
  networkLabel,
  cryptoAmount,
  assetSymbol,
  fiatAmount,
  fiatCurrency,
  tolerancePct,
}: {
  productName: string;
  networkLabel: string;
  cryptoAmount: string;
  assetSymbol: string;
  fiatAmount: number;
  fiatCurrency: string;
  tolerancePct: string;
}) {
  const fiatText =
    fiatAmount > 0
      ? fiatAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "—";
  const cryptoText =
    cryptoAmount && cryptoAmount !== "0"
      ? cryptoAmount
      : "—";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-8 pb-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {productName}
        {networkLabel ? ` · ${networkLabel}` : ""}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-500 sm:text-4xl">
        {cryptoText} {assetSymbol || ""}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        ≈ {fiatText} {fiatCurrency || "USD"}
        {tolerancePct ? ` · ±${tolerancePct}%` : ""}
      </p>
    </div>
  );
}

/**
 * Merchant redirect target: /crypto?transID=…
 * UI matches cryptope_ui checkout (currency → network → send funds / QR).
 */
export const Route = createFileRoute("/crypto")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const transID =
      coerceTransId(search.transID) ||
      coerceTransId(search.transId) ||
      coerceTransId(search.transid) ||
      undefined;
    const feHost = typeof search.feHost === "string" ? search.feHost.trim() : undefined;
    return { transID, feHost: feHost || undefined };
  },
  head: () => ({
    meta: [
      { title: "Pay with crypto — BoxCharge" },
      {
        name: "description",
        content: "Select a currency and network, then send funds to complete your order.",
      },
    ],
  }),
  component: CryptoCheckoutFromTransId,
});

function apiBase(): string {
  return (
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
    "http://localhost:9003"
  );
}

function CryptoCheckoutFromTransId() {
  const search = Route.useSearch();
  // Prefer raw window query — never trust JSON-coerced numeric search values.
  const [transID, setTransID] = useState(
    () => transIdFromWindow() || coerceTransId(search.transID)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<AuthPayload | null>(null);

  const [step, setStep] = useState<Step>("currency");
  const [symbol, setSymbol] = useState<string | null>(null);
  const [network, setNetwork] = useState<CryptoNetwork | null>(null);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [cryptoAmount, setCryptoAmount] = useState("0");
  const [secondsLeft, setSecondsLeft] = useState(60 * 60);
  const [windowSeconds] = useState(60 * 60);
  const [received, setReceived] = useState(0);
  const [localGateway, setLocalGateway] = useState<LocalCryptoStatus | null>(null);
  const [mopName, setMopName] = useState("");
  const [productName, setProductName] = useState("Crypto payment");
  const [tolerancePct, setTolerancePct] = useState("1.5000");
  const [assetFromApi, setAssetFromApi] = useState("");

  useEffect(() => {
    const next = transIdFromWindow() || coerceTransId(search.transID);
    if (next && next !== transID) setTransID(next);
    else if (!transID && !next) {
      setLoading(false);
      setError(null);
    }
  }, [search.transID, transID]);

  useEffect(() => {
    if (!transID) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetch(`${apiBase()}/api/authurl/s2s/${encodeURIComponent(transID)}`, {
      credentials: "omit",
      mode: "cors",
    })
      .then(async (res) => {
        const body = await res.text();
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}${body ? ` — ${body.slice(0, 200)}` : ""}`);
        }
        return JSON.parse(body) as AuthPayload;
      })
      .then((data) => {
        if (cancelled) return;
        setPayload(data);
        const deposit = unwrapDepositAuthdata(data);
        const bitnobLedger =
          readString(deposit.ledger) === "bitnob" || !!readString(deposit.address_id);
        const resolvedMop =
          readString(deposit.mop_name) ||
          readString(data.mop_name) ||
          "";
        const networkKey = bitnobLedger
          ? readString(deposit.chain) || "ethereum"
          : resolvedMop ||
            readString(deposit.network) ||
            "";
        const asset = bitnobLedger
          ? readString(deposit.asset) || "USDT"
          : resolvedMop
            ? ""
            : readString(deposit.asset);
        const addr =
          readString(deposit.payaddress) ||
          readString(data.payaddress) ||
          readString(data.upa);
        const amountCrypto = readString(deposit.crypto_amount);
        const fiat = Number(data.bill_amt ?? deposit.payamt ?? 0) || 0;
        const product =
          readString(data.product_name) ||
          readString(data.paytitle) ||
          readString(deposit.product_name) ||
          "Crypto payment";
        const tol =
          readString(deposit.fx_tolerance) ||
          readString(deposit.tolerance) ||
          readString(deposit.price_tolerance) ||
          "1.5000";

        setMopName(resolvedMop);
        setProductName(product);
        setTolerancePct(tol);

        const resolved = resolveCurrencyNetwork(asset, networkKey, resolvedMop);
        setAssetFromApi(
          resolved.currency?.symbol || readString(deposit.asset) || "",
        );
        if (resolved.currency) {
          setSymbol(resolved.currency.symbol);
          setNetwork(resolved.network);
        }

        if (addr) setDepositAddress(addr);

        const depositAsset = readString(deposit.asset).toUpperCase();
        const resolvedAsset = (resolved.currency?.symbol || "").toUpperCase();
        const amountMatchesAsset =
          !!amountCrypto &&
          (!depositAsset || !resolvedAsset || depositAsset === resolvedAsset);

        if (amountMatchesAsset && amountCrypto) {
          setCryptoAmount(amountCrypto);
        } else if (resolved.currency && fiat > 0) {
          const rate = PRICE_PER_USD[resolved.currency.symbol] ?? 1;
          setCryptoAmount(formatAmount(fiat * rate));
        }

        // Ss4: mop_name like BTC_MAINNET (or deposit ready) → auto open Send funds (Ss5)
        const knownMop =
          !!resolvedMop &&
          (/^[A-Z0-9]+_[A-Z0-9_]+$/i.test(resolvedMop) ||
            /^(BTC|ETH|USDT|USDC|SOL)_/i.test(resolvedMop));
        const depositReady =
          !!addr &&
          (!!amountCrypto || fiat > 0) &&
          !!resolved.currency &&
          !!resolved.network;

        if ((knownMop || depositReady) && resolved.currency && resolved.network && addr) {
          setStep("send");
        } else if (knownMop && resolved.currency) {
          // mop known but address still loading — preselect currency; jump when address arrives
          setSymbol(resolved.currency.symbol);
          setNetwork(resolved.network);
          setStep(resolved.currency.networks.length === 1 ? "send" : "network");
        } else {
          setStep("currency");
        }
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [transID]);

  useEffect(() => {
    if (step !== "send") return;
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const depositAuth = useMemo(() => unwrapDepositAuthdata(payload), [payload]);
  const bitnobLedger =
    readString(depositAuth.ledger) === "bitnob" || !!readString(depositAuth.address_id);
  const depositRef =
    readString(depositAuth.reference) || readString(payload?.reference);

  const refreshLocalStatus = useCallback(async (): Promise<LocalCryptoStatus | null> => {
    if (!transID) return null;
    if (bitnobLedger) {
      const live = await fetchCheckoutS2sStatus(transID);
      const os = String(live.order_status ?? "0").trim();
      const gw: LocalCryptoStatus = {
        order_status: os,
        status: live.status,
        response: live.response || live.trans_response,
        paid_crypto_amount: os === "1" || os === "3" ? String(parseFloat(cryptoAmount) || 1) : "0",
      };
      setLocalGateway(gw);
      const paid = parseFloat(gw.paid_crypto_amount || "0");
      if (Number.isFinite(paid)) setReceived(paid);
      return gw;
    }
    const gw = await fetchLocalCryptoStatus(transID);
    setLocalGateway(gw);
    const paid = parseFloat(gw.paid_crypto_amount || "0");
    if (Number.isFinite(paid)) {
      setReceived(paid);
    }
    return gw;
  }, [transID, bitnobLedger, cryptoAmount]);

  useEffect(() => {
    if (!transID || step !== "send") return;
    void refreshLocalStatus().catch(() => undefined);
    const id = window.setInterval(() => {
      void refreshLocalStatus().catch(() => undefined);
    }, 8000);
    return () => window.clearInterval(id);
  }, [transID, step, refreshLocalStatus]);

  const currency: CryptoCurrency | null = useMemo(
    () => CRYPTO_CURRENCIES.find((c) => c.symbol === symbol) ?? null,
    [symbol],
  );

  const amountUsd = useMemo(() => {
    const n = Number(payload?.bill_amt);
    return Number.isFinite(n) ? n : 0;
  }, [payload]);

  const fiatCurrency = readString(payload?.bill_currency) || "USD";
  const assetSymbol = symbol || assetFromApi || "";
  const networkLabel =
    network != null
      ? `${network.name} ${network.standard}`.replace(/-/g, " ").toUpperCase()
      : mopName;
  const orderTitle = productName;
  const orderDescription =
    readString(payload?.reference) || (transID ? `transID ${transID}` : "");
  const orderAmountLabel = `${amountUsd || "—"} ${fiatCurrency}`;

  const dueNum = parseFloat(cryptoAmount) || 0;
  const status = statusFromLocalGateway(localGateway, dueNum, received);
  const expired = step === "send" && secondsLeft === 0 && status === "awaiting";
  const remaining = Math.max(0, dueNum - received);
  const isFinalScreen = step === "send" && (status === "completed" || status === "overpaid");

  const handleStatusCheck = useCallback(async () => {
    const gw = await refreshLocalStatus();
    if (!gw) return "Missing transID — cannot check status.";
    if (bitnobLedger) {
      const os = String(gw.order_status ?? "0").trim();
      if (os === "1") return gw.response || "Deposit confirmed on Bitnob ledger.";
      if (os === "3") return gw.response || "Refund / withdrawal confirmed.";
      return gw.response || "No Bitnob deposit matched yet. Send USDT to the address, then check again.";
    }
    return messageFromLocalGateway(gw, dueNum, parseFloat(gw.paid_crypto_amount || "0") || 0);
  }, [refreshLocalStatus, dueNum, bitnobLedger]);

  const handleSimulateReceive = useCallback(
    async (amt: number) => {
      if (!transID) {
        setReceived((r) => r + amt);
        return;
      }
      try {
        const gw = await simulateLocalCryptoDeposit(transID, amt);
        setLocalGateway(gw);
        const paid = parseFloat(gw.paid_crypto_amount || "0");
        if (Number.isFinite(paid)) setReceived(paid);
        else setReceived((r) => r + amt);
      } catch (err) {
        console.warn("Local crypto simulate failed", err);
        // Keep UI usable even if Pay-In stub is down
        setReceived((r) => r + amt);
      }
    },
    [transID],
  );

  const handleSimulateReset = useCallback(async () => {
    setReceived(0);
    setLocalGateway(null);
    if (!transID) return;
    try {
      await resetLocalCryptoDeposit(transID);
      await refreshLocalStatus();
    } catch (err) {
      console.warn("Local crypto simulate reset failed", err);
    }
  }, [transID, refreshLocalStatus]);

  const handleSelectCurrency = (symbolKey: string) => {
    const c = CRYPTO_CURRENCIES.find((x) => x.symbol === symbolKey);
    if (!c) return;
    setSymbol(c.symbol);
    setNetwork(c.networks.length === 1 ? c.networks[0] : null);
    setStep(c.networks.length === 1 ? "send" : "network");
    if (c.networks.length === 1) {
      ensureAmountForSymbol(c.symbol);
      ensureAddressFallback();
    }
  };

  const ensureAmountForSymbol = (sym: string) => {
    if (parseFloat(cryptoAmount) > 0) return;
    const rate = PRICE_PER_USD[sym] ?? 1;
    if (amountUsd > 0) setCryptoAmount(formatAmount(amountUsd * rate));
  };

  const ensureAddressFallback = () => {
    if (depositAddress) return;
    const deposit = unwrapDepositAuthdata(payload);
    const addr =
      readString(deposit.payaddress) ||
      readString(payload?.payaddress) ||
      readString(payload?.upa);
    if (addr) setDepositAddress(addr);
  };

  const handleSelectNetwork = (n: CryptoNetwork) => {
    setNetwork(n);
    if (symbol) ensureAmountForSymbol(symbol);
    ensureAddressFallback();
    setStep("send");
  };

  const resetToStart = () => {
    // Back to currency picker (SS4) — do not leave checkout via return_url
    // (merchant return_url often requires login and shows Sign In).
    setStep("currency");
    setSymbol(null);
    setNetwork(null);
  };

  if (!transID) {
    return <MarketingLanding />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading checkout…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <h1 className="text-xl font-semibold text-foreground">Checkout unavailable</h1>
        <p className="max-w-md text-sm text-muted-foreground">{error}</p>
        <Link to="/" className="text-sm text-primary underline">
          Back to home
        </Link>
      </div>
    );
  }

  const showFooter = step !== "send";
  const footerMode = !symbol ? "select" : "selected";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CheckoutHeader onCancel={resetToStart} />

      {step === "send" ? (
        <CryptoOrderSummary
          productName={productName}
          networkLabel={networkLabel}
          cryptoAmount={cryptoAmount}
          assetSymbol={assetSymbol}
          fiatAmount={amountUsd}
          fiatCurrency={fiatCurrency}
          tolerancePct={tolerancePct}
        />
      ) : (
        <OrderSummary
          title={orderTitle}
          description={orderDescription}
          amountLabel={orderAmountLabel}
        />
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8 pt-6">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
          {step !== "send" && (
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-foreground">
              Pay with crypto
            </h2>
          )}

          {step === "currency" && (
            <CurrencyList
              currencies={CRYPTO_CURRENCIES}
              selectedSymbol={symbol}
              onSelect={handleSelectCurrency}
            />
          )}

          {step === "network" && currency && (
            <NetworkList
              currency={currency}
              selectedNetwork={network}
              onSelect={handleSelectNetwork}
              onBack={() => setStep("currency")}
            />
          )}

          {step === "send" &&
            currency &&
            network &&
            depositAddress &&
            status === "awaiting" && (
            <SendFunds
              currency={currency}
              network={network}
              amount={cryptoAmount}
              depositAddress={depositAddress}
              usdLabel={`${amountUsd} USD`}
              secondsLeft={secondsLeft}
              windowSeconds={windowSeconds}
              expired={expired}
              onBack={() =>
                setStep(currency.networks.length === 1 ? "currency" : "network")
              }
              onReport={() => undefined}
              onStatusCheck={handleStatusCheck}
              transID={transID}
              depositRef={depositRef}
            />
          )}

          {step === "send" &&
            currency &&
            network &&
            depositAddress &&
            status === "insufficient" && (
            <PaymentProcessing
              currency={currency}
              network={network}
              depositAddress={depositAddress}
              remaining={remaining}
              secondsLeft={secondsLeft}
              windowSeconds={windowSeconds}
              txHashes={[]}
              expired={expired}
              paymentMethod="manual"
              onReport={() => undefined}
              onStatusCheck={handleStatusCheck}
            />
          )}

          {step === "send" &&
            currency &&
            network &&
            depositAddress &&
            isFinalScreen && (
            <PaymentCompleted
              currency={currency}
              network={network}
              depositAddress={depositAddress}
              received={received}
              extra={Math.max(0, received - dueNum)}
              senderAddress=""
              orderId={transID || ""}
              email=""
              txHashes={[]}
              paymentMethod="manual"
              onReport={() => undefined}
              onReturnToMerchant={resetToStart}
            />
          )}

          {step === "send" && (!currency || !network || !depositAddress) && (
            <p className="text-sm text-muted-foreground">
              Waiting for deposit details…
              {!depositAddress ? " (no payaddress from authurl)" : ""}
            </p>
          )}
        </div>
      </main>

      {showFooter && (
        <FooterBar
          mode={footerMode}
          totalLabel={`Total amount ${amountUsd} USD`}
          currency={currency}
          network={network}
          cryptoAmount={cryptoAmount}
          primaryLabel="Continue"
          canPrimary={step === "currency" ? !!symbol : !!network}
          onPrimary={() => {
            if (step === "currency" && symbol) handleSelectCurrency(symbol);
            else if (step === "network" && network) handleSelectNetwork(network);
          }}
        />
      )}

      {import.meta.env.DEV && step === "send" && currency && !bitnobLedger && (
        <SimulationPanel
          due={dueNum}
          symbol={currency.symbol}
          received={received}
          status={status}
          onReceive={(amt) => {
            void handleSimulateReceive(amt);
          }}
          onReset={() => {
            void handleSimulateReset();
          }}
        />
      )}
    </div>
  );
}
