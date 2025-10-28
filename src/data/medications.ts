export interface Medication {
  id: string;
  name: string;
  dose: string;
  time: string; // HH:mm format
  timing: string;
  instructions: string;
  warning?: string;
  color: string;
  requiresConfirmation: boolean;
  specialTimer?: number; // seconds for special instructions
  category: 'morning' | 'breakfast' | 'lunch' | 'dinner' | 'bedtime';
  icon: string;
  sound?: 'gentle' | 'normal' | 'urgent';
  mealGroup?: string; // For grouping multiple meds at same meal
  frequency?: 'daily' | 'monthly'; // daily (default) or monthly (once per month)
  startDate?: string; // YYYY-MM-DD format - medication starts from this date
  monthlyDay?: number; // For monthly meds: which day of month (1-31)
}

// Empty by default - users will add their own medications
export const medications: Medication[] = [];

// Important instructions for all medications
export const medicationInstructions = {
  title: '🧭 Udhëzime të Përgjithshme',
  instructions: [
    {
      icon: '💊',
      title: 'Si të shtoni barna',
      text: 'Shkoni te Cilësimet → Barna → Shto Barn të Ri. Plotësoni të gjitha fushat dhe klikoni "Ruaj".'
    },
    {
      icon: '⏰',
      title: 'Njoftimet',
      text: 'Sigurohuni që keni aktivizuar njoftimet në cilësimet e telefonit për të marrë kujtesa në kohë.'
    },
    {
      icon: '📱',
      title: 'Instalimi',
      text: 'Për përdorim më të mirë, instaloni aplikacionin në ekranin kryesor të telefonit tuaj.'
    },
    {
      icon: '✅',
      title: 'Konfirmimi',
      text: 'Gjithmonë konfirmoni kur merrni një barn duke klikuar "E MORA". Kjo ndihmon për të gjurmuar përparimin tuaj.'
    },
    {
      icon: '🔄',
      title: 'Backup',
      text: 'Eksportoni të dhënat tuaja rregullisht nga Cilësimet → Backup për të mbajtur një kopje rezervë.'
    }
  ],
  keyWarnings: {
    title: '⚠️ KUJDES',
    warnings: [
      '⚠️ Ky aplikacion është vetëm për kujtesë. Mos ndryshoni barnat pa konsultuar mjekun.',
      '⚠️ Gjithmonë ndiqni udhëzimet e mjekut tuaj.',
      '⚠️ Në rast urgjence, telefononi 112 ose shkoni në spital.',
      '⚠️ Ruani barnat larg fëmijëve.',
      '⚠️ Kontrolloni datën e skadimit të barnave rregullisht.'
    ]
  },
  hypoglycemia: {
    title: '🚨 Urgjenca Mjekësore',
    symptoms: 'Nëse ndiheni keq pas marrjes së barnave, ndaloni menjëherë dhe kontaktoni mjekun.',
    steps: [
      '1) Telefononi mjekun ose 112 për urgjenca.',
      '2) Mos merrni doza shtesë pa konsultuar mjekun.',
      '3) Mbani një listë të barnave që merrni për t\'ia treguar mjekëve.',
      '4) Njoftoni mjekun për çdo efekt anësor.'
    ]
  }
};

// Emergency contact info - users should fill this
export const emergencyContacts = {
  son: { name: 'Familjar', phone: '' },
  doctor: { name: 'Mjeku', phone: '' },
  emergency: { name: 'Emergjencat', phone: '112' }
};
