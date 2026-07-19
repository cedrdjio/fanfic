export function formatWords(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)} k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",")} k`;
  return String(n);
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} h ${m.toString().padStart(2, "0")}` : `${h} h`;
}
