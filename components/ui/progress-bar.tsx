import { fundingPercent, fundingTier } from "@/lib/utils";

interface ProgressBarProps {
  raised: number;
  goal: number;
  label?: string;
  showAmounts?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({
  raised,
  goal,
  label,
  showAmounts = false,
  size = "md",
}: ProgressBarProps) {
  const pct = fundingPercent(raised, goal);
  const tier = fundingTier(pct);
  const barHeight = size === "sm" ? "h-1.5" : "h-2";

  const fillColor =
    tier === "green"
      ? "bg-[--color-success]"
      : tier === "blue"
      ? "bg-[#61A8FF]"
      : "bg-[--color-warning]";

  return (
    <div className="flex flex-col gap-1">
      {(label || showAmounts) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              {label}
            </span>
          )}
          <span className="text-xs text-[var(--color-text-muted)]">
            {pct}%
          </span>
        </div>
      )}
      <div
        className={`w-full ${barHeight} rounded-[var(--radius-full)] bg-[var(--color-border)] overflow-hidden`}
      >
        <div
          className={`${barHeight} rounded-[var(--radius-full)] transition-all duration-500 ${fillColor}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showAmounts && (
        <p className="text-xs text-[var(--color-text-muted)]">
          UGX {raised.toLocaleString()} of {goal.toLocaleString()}
        </p>
      )}
    </div>
  );
}

interface DonationMeterProps {
  raised: number;
  goal: number;
}

export function DonationMeter({ raised, goal }: DonationMeterProps) {
  const pct = fundingPercent(raised, goal);
  const tier = fundingTier(pct);

  const fillColor =
    tier === "green"
      ? "var(--color-success)"
      : tier === "blue"
      ? "#61A8FF"
      : "var(--color-warning)";

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[var(--color-foreground)]">
          Monthly sponsorship
        </span>
        <span className="text-sm font-bold" style={{ color: fillColor }}>
          {pct}%
        </span>
      </div>
      <ProgressBar raised={raised} goal={goal} size="md" />
      <p className="text-xs text-[var(--color-text-muted)] mt-2">
        UGX {raised.toLocaleString()} raised of UGX {goal.toLocaleString()} goal
      </p>
    </div>
  );
}
