/** Currency helpers. The SACCO runs in Ugandan Shillings. */

export const CURRENCY = 'UGX';
export const CURRENCY_SYMBOL = 'USh';

/** 1,250,000 -> "USh 1,250,000" */
export function formatMoney(amount: number, opts: { symbol?: boolean } = {}): string {
  const { symbol = true } = opts;
  const rounded = Math.round(amount);
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = rounded < 0 ? '-' : '';
  return symbol ? `${sign}${CURRENCY_SYMBOL} ${grouped}` : `${sign}${grouped}`;
}

/** Compact form for tight spaces: 1,250,000 -> "USh 1.25M" */
export function formatMoneyCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${CURRENCY_SYMBOL} ${trim(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}${CURRENCY_SYMBOL} ${trim(abs / 1_000)}K`;
  return formatMoney(amount);
}

function trim(n: number): string {
  return n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0).replace(/\.0+$/, '');
}

/** 0.4213 -> "42.1%" */
export function formatPercent(fraction: number, digits = 1): string {
  if (!isFinite(fraction)) return '0%';
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** Parse a user-typed amount ("1,250,000" or "1.2m") into a number. */
export function parseAmount(input: string): number {
  if (!input) return 0;
  const cleaned = input.trim().toLowerCase().replace(/ush|ugx|,|\s/g, '');
  const mult = cleaned.endsWith('m') ? 1_000_000 : cleaned.endsWith('k') ? 1_000 : 1;
  const num = parseFloat(cleaned.replace(/[mk]$/, ''));
  return isNaN(num) ? 0 : Math.round(num * mult);
}
