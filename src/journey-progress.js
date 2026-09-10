export function journeyProgress(y, stops) {
  for (let i = 1; i < stops.length; i++) {
    const [end, to] = stops[i];
    const [start, from] = stops[i - 1];
    if (y <= end) return from + (to - from) * Math.max(0, Math.min(1, (y - start) / Math.max(1, end - start)));
  }
  return 1;
}
