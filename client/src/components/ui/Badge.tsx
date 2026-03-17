import { cn } from "../../utils/cn";

type Status = "confirmed" | "cancelled" | "completed" | "pending";

interface BadgeProps {
  status: Status;
  className?: string;
}

const config: Record<Status, { dot: string; bg: string; text: string; label: string }> = {
  confirmed: {
    dot: "bg-emerald-400",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Confirmed",
  },
  completed: {
    dot: "bg-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "Completed",
  },
  cancelled: {
    dot: "bg-gray-400",
    bg: "bg-gray-100",
    text: "text-gray-600",
    label: "Cancelled",
  },
  pending: {
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Pending",
  },
};

export function Badge({ status, className }: BadgeProps) {
  const c = config[status] ?? config.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
        c.bg,
        c.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.dot)} />
      {c.label}
    </span>
  );
}
