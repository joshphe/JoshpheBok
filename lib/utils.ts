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

/** Simple string hash (for deterministic feature image selection) */
export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Group posts by year and month for archives */
export function groupByYearMonth<T extends { date: string }>(posts: T[]): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const post of posts) {
    const d = new Date(post.date);
    const key = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(post);
  }
  return Array.from(map.entries());
}
