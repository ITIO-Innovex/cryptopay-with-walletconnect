import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
import { FooterBar } from "@/components/checkout/FooterBar";
import { ImportantNotesDialog } from "@/components/checkout/ImportantNotesDialog";
import { PaymentProcessing } from "@/components/checkout/PaymentProcessing";
import { PaymentCompleted } from "@/components/checkout/PaymentCompleted";
import { CheckingStatus } from "@/components/checkout/CheckingStatus";
import { ReportProblemDialog } from "@/components/checkout/ReportProblemDialog";
import { SimulationPanel } from "@/components/checkout/SimulationPanel";
import { derivePaymentStatus, makeOrderId, randomTxHash, randomWalletAddress } from "@/lib/payment";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Cryptope" },
      {
        name: "description",
        content:
          "Secure crypto payment checkout. Select a currency and network, then send funds to complete your order.",
      },
      { property: "og:title", content: "Checkout — Cryptope" },
      {
        property: "og:description",
        content: "Secure crypto payment checkout. Select a currency and network, then send funds to complete your order.",
      },
    ],
  }),
  component: Checkout,
});

type Step = "currency" | "network" | "send";

const ORDER = {
  title: "Proxy Traffic Top-Up x 4",
  description: "1 GB proxy traffic x 4",
  amountUsd: 14,
};

const PAYMENT_WINDOW_SECONDS = 60 * 60;

function Checkout() {
  const [step, setStep] = useState<Step>("currency");
  const [symbol, setSymbol] = useState<string | null>(null);
  const [network, setNetwork] = useState<CryptoNetwork | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS);
  // Simulated incoming transfers (each with its own tx hash).
  // BACKEND: replace this local array with data from
  // `GET /api/checkout/session/:id/status` (poll or WS). See INTEGRATION.md §3.
  const [txs, setTxs] = useState<{ hash: string; amount: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"wallet_connect" | "manual" | null>(null);
  // BACKEND: `orderId` and `senderAddress` come from the session/status
  // responses (INTEGRATION.md §1 & §7). Random generators are dev-only.
  const [orderId] = useState(makeOrderId);
  const [senderAddress] = useState(randomWalletAddress);
  const [depositAddress] = useState(randomWalletAddress);
  const [reportOpen, setReportOpen] = useState(false);
  const customerEmail = "ar*n@it*o.in";

  const currency: CryptoCurrency | null = useMemo(
    () => CRYPTO_CURRENCIES.find((c) => c.symbol === symbol) ?? null,
    [symbol],
  );

  const cryptoAmount = useMemo(() => {
    if (!currency) return "0";
    const unitsPerUsd = PRICE_PER_USD[currency.symbol] ?? 1;
    const units = ORDER.amountUsd * unitsPerUsd;
    const decimals = units < 1 ? 6 : 3;
    return units.toFixed(decimals);
  }, [currency]);

  const dueNum = useMemo(() => parseFloat(cryptoAmount) || 0, [cryptoAmount]);
  const received = useMemo(() => txs.reduce((sum, t) => sum + t.amount, 0), [txs]);
  const txHashes = useMemo(() => txs.map((t) => t.hash), [txs]);
  const status = useMemo(() => derivePaymentStatus(dueNum, received), [dueNum, received]);
  const remaining = Math.max(0, dueNum - received);
  const extra = Math.max(0, received - dueNum);
  const expired =
    step === "send" && secondsLeft === 0 && (status === "awaiting" || status === "insufficient");

  const handleReceive = (amount: number) => {
    setPaymentMethod((prev) => prev ?? "manual");
    setTxs((prev) => [...prev, { hash: randomTxHash(), amount }]);
  };
  const handleWalletTx = (hash: string, amount: number) => {
    setPaymentMethod("wallet_connect");
    setTxs((prev) => [...prev, { hash, amount }]);
  };
  const handleResetSim = () => {
    setTxs([]);
    setPaymentMethod(null);
  };

  // Brief "Checking payment status..." transition after each incoming transfer.
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

  // Countdown only runs while awaiting/processing a deposit.
  useEffect(() => {
    if (step !== "send") return;
    if (status === "completed" || status === "overpaid") return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [step, status]);

  const handleSelectCurrency = (next: string) => {
    setSymbol(next);
    const nextCurrency = CRYPTO_CURRENCIES.find((c) => c.symbol === next) ?? null;
    // Currencies with a single network skip the "select network" step entirely.
    setNetwork(nextCurrency && nextCurrency.networks.length === 1 ? nextCurrency.networks[0] : null);
  };

  const goToNetwork = () => currency && setStep("network");
  const startSend = (net: CryptoNetwork) => {
    if (!currency) return;
    setNetwork(net);
    setSecondsLeft(PAYMENT_WINDOW_SECONDS);
    setTxs([]);
    setPaymentMethod(null);
    setStep("send");
  };
  const goToSend = () => {
    if (currency && network) startSend(network);
  };

  const resetToStart = () => {
    setStep("currency");
    setSymbol(null);
    setNetwork(null);
    setTxs([]);
    setPaymentMethod(null);
  };

  // Footer presentation derived from the current state.
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
      // Single-network currencies skip network selection and go straight to send.
      const singleNetwork = currency.networks.length === 1;
      return {
        mode: singleNetwork ? ("amount" as const) : ("selected" as const),
        primaryLabel: singleNetwork ? "Pay" : "Select network",
        canPrimary: true,
        onPrimary: singleNetwork ? goToSend : goToNetwork,
      };
    }
    if (step === "network") {
      return {
        mode: network ? ("amount" as const) : ("selected" as const),
        primaryLabel: "Pay",
        canPrimary: !!network,
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
  // The send step has no footer pay button — buyers pay from their own wallet.
  const showFooter = !checking && step !== "send";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CheckoutHeader onCancel={resetToStart} />

      {!isFinalScreen && (
        <OrderSummary
          title={ORDER.title}
          description={ORDER.description}
          amountLabel={`${ORDER.amountUsd} USD`}
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
              onSelect={setNetwork}
              onBack={() => setStep("currency")}
            />
          )}

          {step === "send" && checking && <CheckingStatus />}

          {step === "send" && !checking && currency && network && status === "awaiting" && (
            <SendFunds
              currency={currency}
              network={network}
              depositAddress={depositAddress}
              amount={cryptoAmount}
              usdLabel={`${ORDER.amountUsd} USD`}
              secondsLeft={secondsLeft}
              windowSeconds={PAYMENT_WINDOW_SECONDS}
              expired={expired}
              onBack={() => setStep(currency.networks.length === 1 ? "currency" : "network")}
              onReport={() => setReportOpen(true)}
              onWalletTx={handleWalletTx}
            />
          )}

          {step === "send" && !checking && currency && network && status === "insufficient" && (
            <PaymentProcessing
              currency={currency}
              network={network}
              depositAddress={depositAddress}
              remaining={remaining}
              secondsLeft={secondsLeft}
              windowSeconds={PAYMENT_WINDOW_SECONDS}
              txHashes={txHashes}
              expired={expired}
              paymentMethod={paymentMethod}
              onReport={() => setReportOpen(true)}
            />
          )}

          {step === "send" && !checking && currency && network && isFinalScreen && (
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
          totalLabel={`Total amount ${ORDER.amountUsd} USD`}
          currency={currency}
          network={network}
          cryptoAmount={cryptoAmount}
          primaryLabel={footer.primaryLabel}
          canPrimary={footer.canPrimary}
          onPrimary={footer.onPrimary}
        />
      )}

      {step === "send" && currency && (
        <SimulationPanel
          due={dueNum}
          symbol={currency.symbol}
          received={received}
          status={status}
          onReceive={handleReceive}
          onReset={handleResetSim}
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

      <ReportProblemDialog open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
