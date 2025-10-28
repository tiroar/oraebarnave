// Built-in reports - empty by default
// Users can upload their own medical reports

interface BuiltInReport {
  title: string;
  category: string;
  date: string;
  path: string;
}

export const builtInReports: BuiltInReport[] = [];
