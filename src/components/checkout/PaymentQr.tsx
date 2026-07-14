import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";
import { CoinIcon } from "./CoinIcon";
import { cn } from "@/lib/utils";

export type QrMode = "address" | "amount";

interface PaymentQrProps {
  address: string;
  /** Crypto amount embedded when mode is "amount". */
  amount: string;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  mode: QrMode;
  onModeChange: (mode: QrMode) => void;
  size?: number;
}

/**
 * QR block with the token+network logo in the center and a
 * "Just address" / "With amount" toggle, matching the gateway.
 */
export function PaymentQr({
  address,
  amount,
  currency,
  network,
  mode,
  onModeChange,
  size = 224,
}: PaymentQrProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const payload = mode === "amount" ? `${address}?amount=${amount}` : address;

  useEffect(() => {
    QRCode.toDataURL(payload, { width: 320, margin: 1, errorCorrectionLevel: "H" })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [payload]);

  const logoSize = Math.round(size * 0.2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-2xl bg-card p-3 shadow-card" style={{ width: size + 24 }}>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Payment QR code" style={{ width: size, height: size }} />
        ) : (
          <div className="animate-pulse rounded-lg bg-muted" style={{ width: size, height: size }} />
        )}
        {qrDataUrl && (
          <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card p-1">
            <CoinIcon
              symbol={currency.symbol}
              color={currency.color}
              network={network}
              size={logoSize}
            />
          </span>
        )}
      </div>

      <div className="inline-flex rounded-xl bg-muted p-1">
        {(["address", "amount"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              mode === m
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "address" ? "Just address" : "With amount"}
          </button>
        ))}
      </div>
    </div>
  );
}
