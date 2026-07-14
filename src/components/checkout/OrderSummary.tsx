interface OrderSummaryProps {
  title: string;
  description: string;
  amountLabel: string;
}

/**
 * Compact order line shown above the payment card: item name, description and
 * the fiat total for the order.
 */
export function OrderSummary({ title, description, amountLabel }: OrderSummaryProps) {
  return (
    <div className="mx-auto flex max-w-2xl items-start justify-between gap-4 px-4 pt-8 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="whitespace-nowrap text-2xl font-semibold tracking-tight text-foreground">
        {amountLabel}
      </div>
    </div>
  );
}
