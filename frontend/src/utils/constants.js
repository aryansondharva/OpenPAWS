export const ANGLES = {
  public_health: {
    label: "Public health",
    short: "Health",
    dot: "bg-red-400",
    bg: "bg-red-950/60",
    text: "text-red-300",
    border: "border-red-800/40",
    ring: "ring-red-700/40",
  },
  economic: {
    label: "Economic",
    short: "Economic",
    dot: "bg-amber-400",
    bg: "bg-amber-950/60",
    text: "text-amber-300",
    border: "border-amber-800/40",
    ring: "ring-amber-700/40",
  },
  environmental: {
    label: "Environmental",
    short: "Environment",
    dot: "bg-emerald-400",
    bg: "bg-emerald-950/60",
    text: "text-emerald-300",
    border: "border-emerald-800/40",
    ring: "ring-emerald-700/40",
  },
  welfare: {
    label: "Welfare",
    short: "Welfare",
    dot: "bg-purple-400",
    bg: "bg-purple-950/60",
    text: "text-purple-300",
    border: "border-purple-800/40",
    ring: "ring-purple-700/40",
  },
  policy: {
    label: "Policy",
    short: "Policy",
    dot: "bg-blue-400",
    bg: "bg-blue-950/60",
    text: "text-blue-300",
    border: "border-blue-800/40",
    ring: "ring-blue-700/40",
  },
};

export function urgencyStyle(score) {
  if (score >= 9) return { color: "text-red-400", bg: "bg-red-950/50", label: "URGENT" };
  if (score >= 7) return { color: "text-orange-400", bg: "bg-orange-950/50", label: "HIGH" };
  if (score >= 5) return { color: "text-amber-400", bg: "bg-amber-950/50", label: "MED" };
  return { color: "text-zinc-400", bg: "bg-zinc-800", label: "LOW" };
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
