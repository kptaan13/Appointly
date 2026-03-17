import { cn } from "../../utils/cn";

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function initials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

const palette = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

function colorIndex(str: string) {
  let hash = 0;
  for (const ch of str) hash = (hash * 31 + ch.charCodeAt(0)) % palette.length;
  return hash;
}

export function Avatar({ name, email, size = "md", className }: AvatarProps) {
  const label = initials(name, email);
  const seed = name ?? email ?? "?";
  const color = palette[colorIndex(seed)];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold shrink-0 select-none",
        size === "sm" && "w-7 h-7 text-xs",
        size === "md" && "w-9 h-9 text-sm",
        size === "lg" && "w-12 h-12 text-base",
        color,
        className
      )}
    >
      {label}
    </div>
  );
}
