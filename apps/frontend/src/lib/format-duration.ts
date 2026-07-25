/** Minutes → a human duration: 45 → "45m", 90 → "1h 30m", 120 → "2h". */
export function formatDuration(
  minutes: number | null | undefined,
): string | null {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return null;

  const whole = Math.floor(minutes);
  if (whole < 60) return `${whole}m`;

  const hours = Math.floor(whole / 60);
  const rest = whole % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
