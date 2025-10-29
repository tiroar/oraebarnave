import Dexie, { Table } from 'dexie';

export interface MedicationLog {
  id?: number;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'pending' | 'taken' | 'missed' | 'snoozed';
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface AppSettings {
  id?: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  snoozeMinutes: number;
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  caregiverPhone?: string;
  caregiverNotifications: boolean;
}

export interface BloodSugarLog {
  id?: number;
  value: number;
  time: string;
  date: string;
  notes?: string;
}

export interface MedicalReport {
  id?: number;
  title: string;
  category: 'raportet' | 'analizat' | 'other';
  date: string;
  fileData?: string; // Base64 for uploaded files
  fileName?: string;
  fileType?: string; // 'image/jpeg', 'image/png', 'application/pdf'
  isBuiltIn?: boolean; // true for pre-loaded reports
  builtInPath?: string; // path to file in public folder
  notes?: string;
  uploadedAt: string;
}

export interface EmergencyContact {
  id?: number;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  order: number;
}

export interface DoctorAppointment {
  id?: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location?: string;
  phone?: string;
  notes?: string;
  questionsToAsk?: string;
  completed: boolean;
  summary?: string; // What was discussed
}

export interface MedicationStock {
  id?: number;
  medicationId: string;
  medicationName: string;
  pillsRemaining: number;
  pillsPerDay: number;
  refillThreshold: number; // Alert when below this
  lastRefillDate: string;
  pharmacyName?: string;
  pharmacyPhone?: string;
}

export interface HealthDiary {
  id?: number;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  painLevel: number; // 0-10
  symptoms: string;
  sideEffects: string;
  energyLevel: number; // 0-10
  notes: string;
}

export interface CustomMedication {
  id?: number;
  name: string;
  dose: string;
  time: string; // HH:mm format
  timing: string;
  instructions: string;
  warning?: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'monthly';
  startDate?: string;
  monthlyDay?: number;
  isActive: boolean;
  createdAt: string;
}

export class MedicationDatabase extends Dexie {
  logs!: Table<MedicationLog>;
  settings!: Table<AppSettings>;
  bloodSugar!: Table<BloodSugarLog>;
  medicalReports!: Table<MedicalReport>;
  emergencyContacts!: Table<EmergencyContact>;
  doctorAppointments!: Table<DoctorAppointment>;
  medicationStock!: Table<MedicationStock>;
  healthDiary!: Table<HealthDiary>;
  customMedications!: Table<CustomMedication>;

  constructor() {
    super('MedicationReminder');
    
    this.version(1).stores({
      logs: '++id, medicationId, date, status',
      settings: '++id'
    });

    this.version(2).stores({
      logs: '++id, medicationId, date, status',
      settings: '++id',
      bloodSugar: '++id, date, time'
    });

    this.version(3).stores({
      logs: '++id, medicationId, date, status',
      settings: '++id',
      bloodSugar: '++id, date, time',
      medicalReports: '++id, category, date, isBuiltIn'
    });

    this.version(4).stores({
      logs: '++id, medicationId, date, status',
      settings: '++id',
      bloodSugar: '++id, date, time',
      medicalReports: '++id, category, date, isBuiltIn',
      emergencyContacts: '++id, order, isPrimary',
      doctorAppointments: '++id, date, completed',
      medicationStock: '++id, medicationId',
      healthDiary: '++id, date'
    });

    this.version(5).stores({
      logs: '++id, medicationId, date, status',
      settings: '++id',
      bloodSugar: '++id, date, time',
      medicalReports: '++id, category, date, isBuiltIn',
      emergencyContacts: '++id, order, isPrimary',
      doctorAppointments: '++id, date, completed',
      medicationStock: '++id, medicationId',
      healthDiary: '++id, date',
      customMedications: '++id, time, isActive'
    });
  }
}

export const db = new MedicationDatabase();

// Initialize default settings
export async function initializeSettings() {
  const count = await db.settings.count();
  if (count === 0) {
    await db.settings.add({
      notificationsEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      snoozeMinutes: 10,
      fontSize: 'extra-large',
      highContrast: true,
      caregiverNotifications: false
    });
  }
}

// Get app settings
export async function getSettings(): Promise<AppSettings | undefined> {
  return await db.settings.toCollection().first();
}

// Update app settings
export async function updateSettings(settings: Partial<AppSettings>): Promise<void> {
  const existingSettings = await getSettings();
  if (existingSettings && existingSettings.id) {
    await db.settings.update(existingSettings.id, settings);
  }
}

// Helper functions
export async function logMedication(
  medicationId: string,
  medicationName: string,
  scheduledTime: string,
  status: 'taken' | 'missed' | 'snoozed',
  notes?: string
) {
  const date = new Date().toISOString().split('T')[0];
  const takenTime = status === 'taken' ? new Date().toISOString() : undefined;

  return await db.logs.add({
    medicationId,
    medicationName,
    scheduledTime,
    takenTime,
    status,
    date,
    notes
  });
}

export async function getTodayLogs() {
  const today = new Date().toISOString().split('T')[0];
  return await db.logs.where('date').equals(today).toArray();
}

export async function getWeekStats() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  const logs = await db.logs.where('date').aboveOrEqual(weekAgoStr).toArray();
  
  const taken = logs.filter(l => l.status === 'taken').length;
  const total = logs.length;
  const compliance = total > 0 ? Math.round((taken / total) * 100) : 100;

  return { taken, total, compliance };
}

export async function undoMedicationLog(medicationId: string, date: string) {
  const logs = await db.logs
    .where(['medicationId', 'date'])
    .equals([medicationId, date])
    .toArray();
  
  if (logs.length > 0) {
    const lastLog = logs[logs.length - 1];
    if (lastLog.id) {
      await db.logs.delete(lastLog.id);
      return true;
    }
  }
  return false;
}

// Custom Medications helpers
export async function addCustomMedication(medication: Omit<CustomMedication, 'id' | 'createdAt'>) {
  return await db.customMedications.add({
    ...medication,
    createdAt: new Date().toISOString()
  });
}

export async function getCustomMedications(): Promise<CustomMedication[]> {
  // Get all medications and filter for active ones
  // Note: isActive is boolean, but Dexie indexes need numbers
  const allMeds = await db.customMedications.toArray();
  return allMeds.filter(med => med.isActive !== false);
}

export async function updateCustomMedication(id: number, updates: Partial<CustomMedication>) {
  return await db.customMedications.update(id, updates);
}

export async function deleteCustomMedication(id: number) {
  return await db.customMedications.update(id, { isActive: false });
}

