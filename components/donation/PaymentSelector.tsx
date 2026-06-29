"use client";

import { cn } from "@/lib/utils";

type Provider = "CARD" | "MTN_MOMO" | "AIRTEL_MONEY";

interface PaymentSelectorProps {
  selected: Provider | null;
  onSelect: (provider: Provider) => void;
}

const PROVIDERS: { value: Provider; label: string; subtitle: string; badge: string }[] = [
  { value: "CARD", label: "Card", subtitle: "Visa, Mastercard, Apple Pay", badge: "Card" },
  { value: "MTN_MOMO", label: "MTN MoMo", subtitle: "Mobile Money Uganda", badge: "MTN MoMo" },
  { value: "AIRTEL_MONEY", label: "Airtel Money", subtitle: "Mobile Money Uganda", badge: "Airtel" },
];

export function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {PROVIDERS.map((p) => {
        const isSelected = selected === p.value;
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => onSelect(p.value)}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-xl)] border p-4 shadow-sm text-left transition-all",
              isSelected
                ? "border-[var(--color-brand-purple)] ring-2 ring-[var(--color-brand-purple)] bg-[var(--color-brand-purple-light)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-purple)]"
            )}
          >
            <div className="flex-1">
              <p className="text-[14px] font-medium text-[var(--color-foreground)]">{p.label}</p>
              <p className="text-[12px] text-[var(--color-text-muted)]">{p.subtitle}</p>
            </div>
            <span className={cn(
              "rounded-[var(--radius-full)] px-2 py-0.5 text-[12px] font-medium",
              p.value === "CARD" && "bg-[var(--color-brand-purple-light)] text-[var(--color-brand-purple)]",
              p.value === "MTN_MOMO" && "bg-[#FFF9E6] text-[#B38F00]",
              p.value === "AIRTEL_MONEY" && "bg-[var(--color-error-bg)] text-[var(--color-error)]"
            )}>
              {p.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}
