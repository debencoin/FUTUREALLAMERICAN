export function formatHeight(inches: number | null | undefined): string {
  if (!inches) return "-";
  return `${Math.floor(inches / 12)}-${inches % 12}`;
}

export function formatMoney(dollars: number | null | undefined): string {
  if (!dollars) return "-";
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(dollars % 1_000_000 === 0 ? 0 : 1)}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${dollars}`;
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
