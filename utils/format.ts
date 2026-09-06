// Shared step-count formatting — see CLAUDE.md "Formatage des pas".
// >= 1_000_000 → "M", >= 1000 → "k", else localized integer. Never shows decimals below 1000.
export function fmtK(n: number, localeTag: string): string {
  const rounded = Math.round(n);
  if (rounded >= 1_000_000) return `${(rounded / 1_000_000).toFixed(1)}M`;
  if (rounded >= 1000) return `${(rounded / 1000).toFixed(1)}k`;
  return rounded.toLocaleString(localeTag);
}
