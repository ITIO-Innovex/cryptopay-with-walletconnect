import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CRYPTO_CURRENCIES,
  type CryptoCurrency,
  type CryptoNetwork,
} from "@/data/cryptocurrencies";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CurrencyList } from "@/components/checkout/CurrencyList";
import { NetworkList } from "@/components/checkout/NetworkList";
import { SendFunds } from "@/components/checkout/SendFunds";
import { FooterBar } from "@/components/checkout/FooterBar";
import { ImportantNotesDialog } from "@/components/checkout/ImportantNotesDialog";
import { PaymentProcessing } from "@/components/checkout/PaymentProcessing";
import { PaymentCompleted } from "@/components/checkout/PaymentCompleted";
import { CheckingStatus } from "@/components/checkout/CheckingStatus";
import { ReportProblemDialog } from "@/components/checkout/ReportProblemDialog";
import { SimulationPanel } from "@/components/checkout/SimulationPanel";
import { derivePaymentStatus } from "@/lib/payment";
import {
  fetchCheckoutSession,
  fetchCheckoutStatus,
  getCheckoutApiBase,
  notifyWalletTx,
  requestDepositAddress,
  simulateDeposit,
  type CheckoutSession,
  type CheckoutStatus,
} from "@/lib/checkout-api";
import { MarketingLanding } from "@/components/site/MarketingLanding";

type Search = { session?: string; feHost?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    session: typeof search.session === "string" ? search.session : undefined,
    feHost: typeof search.feHost === "string" ? search.feHost : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Crypto Checkout — Pay with crypto" },
      {
        name: "description",
        content:
          "Secure crypto payment checkout. Select a currency and network, then send funds to complete your order.",
      },
      { property: "og:title", content: "Crypto Checkout — Pay with crypto" },
      {
        property: "og:description",
        content: "Select a currency and network, then send funds to complete your order.",
      },
    ],
  }),
  component: Checkout,
});

type Step = "currency" | "network" | "send";

function mapUiStatus(
  server: CheckoutStatus["status"] | null,
  due: number,
  received: number,
): "awaiting" | "insufficient" | "completed" | "overpaid" {
  if (server === "expired") return "awaiting";
  if (server === "awaiting" || server === "insufficient" || server === "completed" || server === "overpaid") {
    return server;
  }
  return derivePaymentStatus(due, received);
}

function Checkout() {
  const { session: sessionId } = Route.useSearch();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(!!sessionId);

  const [step, setStep] = useState<Step>("currency");
  const [symbol, setSymbol] = useState<string | null>(null);
  const [network, setNetwork] = useState<CryptoNetwork | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [windowSeconds, setWindowSeconds] = useState(60 * 60);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [depositMemo, setDepositMemo] = useState<string | null>(null);
  const [cryptoAmount, setCryptoAmount] = useState("0");
  const [serverStatus, setServerStatus] = useState<CheckoutStatus | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet_connect" | "manual" | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [busySend, setBusySend] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setSessionLoading(false);
      setSessionError(null);
      return;
    }
    let cancelled = false;
    setSessionLoading(true);
    void fetchCheckoutSession(sessionId)
      .then((s) => {
        if (cancelled) return;
        setSession(s);
        setSessionError(null);
        const expires = new Date(s.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expires - Date.now()) / 1000));
        setSecondsLeft(remaining);
        setWindowSeconds(Math.max(remaining, 60));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setSessionError(err instanceof Error ? err.message : "Failed to load checkout session");
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const refreshStatus = useCallback(async () => {
    if (!sessionId) return null;
    const status = await fetchCheckoutStatus(sessionId);
    setServerStatus(status);
    return status;
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || step !== "send") return;
    void refreshStatus().catch(() => undefined);
    const id = setInterval(() => {
      void refreshStatus().catch(() => undefined);
    }, 4000);
    return () => clearInterval(id);
  }, [sessionId, step, refreshStatus]);

  const currencies = useMemo(() => {
    const allowed = session?.supportedCurrencies;
    if (!allowed || allowed.length === 0) return CRYPTO_CURRENCIES;
    const set = new Set(allowed.map((s) => s.toUpperCase()));
    return CRYPTO_CURRENCIES.filter((c) => set.has(c.symbol.toUpperCase()));
  }, [session]);

  const currency: CryptoCurrency | null = useMemo(
    () => currencies.find((c) => c.symbol === symbol) ?? null,
    [currencies, symbol],
  );

  const dueNum = useMemo(() => {
    if (serverStatus?.dueAmount) return parseFloat(serverStatus.dueAmount) || 0;
    return parseFloat(cryptoAmount) || 0;
  }, [serverStatus, cryptoAmount]);

  const received = useMemo(() => {
    if (serverStatus?.receivedAmount) return parseFloat(serverStatus.receivedAmount) || 0;
    return 0;
  }, [serverStatus]);

  const txHashes = useMemo(
    () => (serverStatus?.transactions ?? []).map((t) => t.hash),
    [serverStatus],
  );

  const status = useMemo(
    () => mapUiStatus(serverStatus?.status ?? null, dueNum, received),
    [serverStatus, dueNum, received],
  );

  const remaining = Math.max(0, dueNum - received);
  const extra = Math.max(0, received - dueNum);
  const expired =
    (serverStatus?.status === "expired") ||
    (step === "send" && secondsLeft === 0 && (status === "awaiting" || status === "insufficient"));

  const orderId = session?.orderId ?? "";
  const customerEmail = session?.customerEmail ?? "";
  const senderAddress = serverStatus?.senderAddress || "—";
  const amountUsd = session?.amountUsd ?? 0;

  const handleReceive = async (amount: number) => {
    if (!sessionId) return;
    setPaymentMethod((prev) => prev ?? "manual");
    const next = await simulateDeposit(sessionId, { amount });
    setServerStatus(next);
  };

  const handleWalletTx = async (hash: string, amount: number, fromAddress?: string) => {
    if (!sessionId || !currency || !network) return;
    setPaymentMethod("wallet_connect");
    await notifyWalletTx(sessionId, {
      hash,
      fromAddress,
      currency: currency.symbol,
      network: network.name,
      amount,
    });
    await refreshStatus();
  };

  const handleResetSim = async () => {
    setPaymentMethod(null);
    await refreshStatus();
  };

  const [checking, setChecking] = useState(false);
  const prevReceived = useRef(0);
  useEffect(() => {
    if (step === "send" && received > prevReceived.current) {
      setChecking(true);
      const id = setTimeout(() => setChecking(false), 2000);
      prevReceived.current = received;
      return () => clearTimeout(id);
    }
    prevReceived.current = received;
  }, [received, step]);

  useEffect(() => {
    if (step !== "send") return;
    if (status === "completed" || status === "overpaid") return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [step, status]);

  const handleSelectCurrency = (next: string) => {
    setSymbol(next);
    const nextCurrency = currencies.find((c) => c.symbol === next) ?? null;
    setNetwork(nextCurrency && nextCurrency.networks.length === 1 ? nextCurrency.networks[0] : null);
  };

  const goToNetwork = () => currency && setStep("network");

  const startSend = async (net: CryptoNetwork) => {
    if (!currency || !sessionId) return;
    setBusySend(true);
    setSendError(null);
    try {
      const deposit = await requestDepositAddress(sessionId, currency.symbol, net.name);
      setNetwork(net);
      setDepositAddress(deposit.address);
      setDepositMemo(deposit.memo ?? null);
      setCryptoAmount(deposit.amount);
      const expires = new Date(deposit.expiresAt).getTime();
      const remainingSecs = Math.max(0, Math.floor((expires - Date.now()) / 1000));
      setSecondsLeft(remainingSecs);
      setWindowSeconds(Math.max(remainingSecs, 60));
      setPaymentMethod(null);
      setServerStatus(null);
      setStep("send");
      await refreshStatus();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Could not issue deposit address");
    } finally {
      setBusySend(false);
    }
  };

  const goToSend = () => {
    if (currency && network) void startSend(network);
  };

  const resetToStart = () => {
    setStep("currency");
    setSymbol(null);
    setNetwork(null);
    setDepositAddress(null);
    setDepositMemo(null);
    setPaymentMethod(null);
    setServerStatus(null);
    setSendError(null);
  };

  const footer = (() => {
    if (step === "currency") {
      if (!currency) {
        return {
          mode: "select" as const,
          primaryLabel: "Continue",
          canPrimary: false,
          onPrimary: () => {},
        };
      }
      const singleNetwork = currency.networks.length === 1;
      return {
        mode: singleNetwork ? ("amount" as const) : ("selected" as const),
        primaryLabel: busySend ? "Preparing…" : singleNetwork ? "Pay" : "Select network",
        canPrimary: !busySend,
        onPrimary: singleNetwork ? goToSend : goToNetwork,
      };
    }
    if (step === "network") {
      return {
        mode: network ? ("amount" as const) : ("selected" as const),
        primaryLabel: busySend ? "Preparing…" : "Pay",
        canPrimary: !!network && !busySend,
        onPrimary: goToSend,
      };
    }
    return {
      mode: "amount" as const,
      primaryLabel: "Pay",
      canPrimary: true,
      onPrimary: () => setNotesOpen(true),
    };
  })();

  const isFinalScreen = step === "send" && (status === "completed" || status === "overpaid");
  const showFooter = !checking && step !== "send";

  if (!sessionId) {
    return <MarketingLanding />;
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading checkout session…
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <h1 className="text-xl font-semibold text-foreground">Checkout unavailable</h1>
        <p className="max-w-md text-sm text-muted-foreground">{sessionError}</p>
        <p className="text-xs text-muted-foreground">API: {getCheckoutApiBase()}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CheckoutHeader onCancel={resetToStart} />

      {!isFinalScreen && (
        <OrderSummary
          title={session.title}
          description={session.description}
          amountLabel={`${amountUsd} ${session.amountFiatCurrency || "USD"}`}
        />
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8 pt-6">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
          {sendError && <p className="mb-4 text-sm text-destructive">{sendError}</p>}

          {step !== "send" && (
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-foreground">
              Pay with crypto
            </h2>
          )}

          {step === "currency" && (
            <CurrencyList
              currencies={currencies}
              selectedSymbol={symbol}
              onSelect={handleSelectCurrency}
            />
          )}

          {step === "network" && currency && (
            <NetworkList
              currency={currency}
              selectedNetwork={network}
              onSelect={setNetwork}
              onBack={() => setStep("currency")}
            />
          )}

          {step === "send" && checking && <CheckingStatus />}

          {step === "send" &&
            !checking &&
            currency &&
            network &&
            depositAddress &&
            status === "awaiting" && (
              <SendFunds
                currency={currency}
                network={network}
                amount={cryptoAmount}
                depositAddress={depositAddress}
                memo={depositMemo}
                usdLabel={`${amountUsd} USD`}
                secondsLeft={secondsLeft}
                windowSeconds={windowSeconds}
                expired={expired}
                onBack={() => setStep(currency.networks.length === 1 ? "currency" : "network")}
                onReport={() => setReportOpen(true)}
                onWalletTx={(hash, amount, from) => void handleWalletTx(hash, amount, from)}
              />
            )}

          {step === "send" &&
            !checking &&
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
                txHashes={txHashes}
                expired={expired}
                paymentMethod={paymentMethod}
                onReport={() => setReportOpen(true)}
              />
            )}

          {step === "send" &&
            !checking &&
            currency &&
            network &&
            depositAddress &&
            isFinalScreen && (
              <PaymentCompleted
                currency={currency}
                network={network}
                depositAddress={depositAddress}
                received={received}
                extra={extra}
                senderAddress={senderAddress}
                orderId={orderId}
                email={customerEmail}
                txHashes={txHashes}
                paymentMethod={paymentMethod}
                onReport={() => setReportOpen(true)}
                onReturnToMerchant={resetToStart}
              />
            )}
        </div>
      </main>

      {showFooter && (
        <FooterBar
          mode={footer.mode}
          totalLabel={`Total amount ${amountUsd} USD`}
          currency={currency}
          network={network}
          cryptoAmount={cryptoAmount}
          primaryLabel={footer.primaryLabel}
          canPrimary={footer.canPrimary}
          onPrimary={footer.onPrimary}
        />
      )}

      {import.meta.env.DEV && step === "send" && currency && (
        <SimulationPanel
          due={dueNum}
          symbol={currency.symbol}
          received={received}
          status={status}
          onReceive={(amount) => void handleReceive(amount)}
          onReset={() => void handleResetSim()}
        />
      )}

      {currency && network && (
        <ImportantNotesDialog
          open={notesOpen}
          currency={currency}
          network={network}
          onClose={() => setNotesOpen(false)}
        />
      )}

      <ReportProblemDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        sessionId={sessionId}
      />
    </div>
  );
}
