/** Fisher-Yates shuffle — returns a new array */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Pick a random element from an array */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Format a date string to YYYY-MM-DD */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Format date to "YYYY年MM月DD日" */
export function formatDateCN(date: string | Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** Format a number as currency string */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return '$' + (value / 1_000_000).toFixed(2) + 'M';
  }
  if (value >= 1_000) {
    return '$' + (value / 1_000).toFixed(2) + 'K';
  }
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format a number as percentage string with sign */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(2) + '%';
}
