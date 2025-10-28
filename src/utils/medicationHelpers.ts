import { Medication } from '../data/medications';

/**
 * Checks if a medication should be shown today based on:
 * - startDate: medication starts from this date
 * - frequency: daily (default) or monthly
 * - monthlyDay: for monthly meds, which day of the month (1-31)
 */
export function shouldShowMedicationToday(medication: Medication, today: Date = new Date()): boolean {
  // Check if medication has started yet
  if (medication.startDate) {
    const startDate = new Date(medication.startDate);
    startDate.setHours(0, 0, 0, 0);
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);
    
    if (todayDate < startDate) {
      // Medication hasn't started yet
      return false;
    }
  }

  // Check frequency
  if (medication.frequency === 'monthly') {
    // Monthly medication - check if today is the correct day of month
    const dayOfMonth = medication.monthlyDay || 1;
    const todayDay = today.getDate();
    
    return todayDay === dayOfMonth;
  }

  // Default: daily medication
  return true;
}

/**
 * Checks if a monthly medication has been taken this month
 */
export function wasMonthlyMedicationTakenThisMonth(
  medicationId: string,
  takenMeds: Set<string>
): boolean {
  // For now, we check if it's in today's taken set
  // In a real scenario, you'd check if it was taken ANY day this month
  // This would require querying the database for this month's logs
  return takenMeds.has(medicationId);
}

