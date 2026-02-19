export function getRamadanDay(startDate: Date): number {
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diffTime = now.getTime() - startDate.getTime();
  
  // Convert to days (rounding down to get full days passed)
  // Example: 
  // Start: 18th 00:00
  // Now: 18th 10:00 -> diff < 1 day -> day 1
  // Now: 19th 10:00 -> diff > 1 day -> day 2
  // So we ceil the difference in days. Or simpler:
  // Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
  
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  // If start date is in the future, return 0 or negative
  if (diffDays < 1) return 0;
  
  return diffDays;
}
