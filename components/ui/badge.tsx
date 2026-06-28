type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "pending"
  | "purple"
  | "teal";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]",
  success: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
  error: "bg-[var(--color-error-bg)] text-[var(--color-error)]",
  pending: "bg-[var(--color-pending-bg)] text-[var(--color-pending)]",
  purple: "bg-[var(--color-brand-purple-light)] text-[var(--color-brand-purple)]",
  teal: "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-[var(--radius-full)]",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    settled: { label: "Settled", variant: "success" },
    pending: { label: "Pending", variant: "warning" },
    initiated: { label: "Initiated", variant: "pending" },
    failed: { label: "Failed", variant: "error" },
    refunded: { label: "Refunded", variant: "default" },
  };

  const { label, variant } = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function ProviderBadge({ provider }: { provider: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    FLUTTERWAVE: { label: "Flutterwave", variant: "purple" },
    MTN_MOMO: { label: "MTN MoMo", variant: "warning" },
    AIRTEL_MONEY: { label: "Airtel", variant: "error" },
  };

  const { label, variant } = map[provider] ?? { label: provider, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}

