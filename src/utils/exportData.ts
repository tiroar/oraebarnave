import { db } from '../db/database';

export async function exportAllData() {
  try {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      logs: await db.logs.toArray(),
      bloodSugar: await db.bloodSugar.toArray(),
      medicalReports: await db.medicalReports.toArray(),
      emergencyContacts: await db.emergencyContacts.toArray(),
      doctorAppointments: await db.doctorAppointments.toArray(),
      medicationStock: await db.medicationStock.toArray(),
      healthDiary: await db.healthDiary.toArray(),
      settings: await db.settings.toArray()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ora-e-barnave-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
}

export async function importData(file: File) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Clear existing data (optional - could ask user)
    const confirmOverwrite = confirm(
      'Kjo do të fshijë të gjitha të dhënat ekzistuese dhe do të importojë të dhënat e reja.\n\nA jeni të sigurt?'
    );

    if (!confirmOverwrite) return false;

    // Import data
    await db.logs.clear();
    await db.bloodSugar.clear();
    await db.medicalReports.clear();
    await db.emergencyContacts.clear();
    await db.doctorAppointments.clear();
    await db.medicationStock.clear();
    await db.healthDiary.clear();

    if (data.logs) await db.logs.bulkAdd(data.logs);
    if (data.bloodSugar) await db.bloodSugar.bulkAdd(data.bloodSugar);
    if (data.medicalReports) await db.medicalReports.bulkAdd(data.medicalReports);
    if (data.emergencyContacts) await db.emergencyContacts.bulkAdd(data.emergencyContacts);
    if (data.doctorAppointments) await db.doctorAppointments.bulkAdd(data.doctorAppointments);
    if (data.medicationStock) await db.medicationStock.bulkAdd(data.medicationStock);
    if (data.healthDiary) await db.healthDiary.bulkAdd(data.healthDiary);

    return true;
  } catch (error) {
    console.error('Import error:', error);
    return false;
  }
}

