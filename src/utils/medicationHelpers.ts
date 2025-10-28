import { Medication } from '../data/medications';
import { getCustomMedications, CustomMedication } from '../db/database';

/**
 * Converts a custom medication from DB to the Medication interface
 */
function convertCustomMedication(custom: CustomMedication): Medication {
  return {
    id: `custom-${custom.id}`,
    name: custom.name,
    dose: custom.dose,
    time: custom.time,
    timing: custom.timing,
    instructions: custom.instructions,
    warning: custom.warning,
    color: custom.color,
    requiresConfirmation: true,
    category: 'morning' as const,
    icon: custom.icon,
    frequency: custom.frequency,
    startDate: custom.startDate,
    monthlyDay: custom.monthlyDay
  };
}

/**
 * Gets all active medications (built-in + custom from DB)
 */
export async function getAllActiveMedications(): Promise<Medication[]> {
  const customMeds = await getCustomMedications();
  const convertedCustomMeds = customMeds.map(convertCustomMedication);
  
  // Return all custom medications (built-in array is empty by design)
  return convertedCustomMeds;
}

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

