/**
 * Maps the current hour to the active prayer-block category ID.
 * This determines which habit block is auto-expanded.
 *
 * Time ranges (approximate):
 *  - Fajr:          04:00 – 06:59
 *  - Dhuhr:         12:00 – 14:59
 *  - Asr:           15:00 – 17:59
 *  - Maghrib/Isha:  18:00 – 20:59
 *  - Sahar:         21:00 – 03:59 (night/suhoor)
 *  - General:       07:00 – 11:59 (morning gap)
 */
export function getActiveBlockId(hour: number): string {
  if (hour >= 4 && hour < 7) return "fajr";
  if (hour >= 7 && hour < 12) return "general";
  if (hour >= 12 && hour < 15) return "dhuhr";
  if (hour >= 15 && hour < 18) return "asr";
  if (hour >= 18 && hour < 21) return "maghrib-isha";
  return "sahar";
}
