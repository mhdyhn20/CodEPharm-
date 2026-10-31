export interface Patient {
  id: number;
  subscription_code: number;
  full_name: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
}

export interface Settings {
  pharmacy_name: string;
  paper_size: 'A5' | 'thermal80';
  sidebar_collapsed: boolean;
}

export interface AppContextType {
  currentUser: User | null;
  settings: Settings;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  createAdmin: (u: string, p: string) => Promise<boolean>;
  updateSettings: (s: Partial<Settings>) => void;
  hasAnyUser: boolean;
  refreshHasAnyUser: () => void;
}

export interface CreatePatientInput {
  full_name: string;
  phone: string;
  address: string;
}

export interface UpdatePatientInput extends CreatePatientInput {
  id: number;
}

export interface PaginatedPatients {
  rows: Patient[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface BackupResult {
  ok: boolean;
  path?: string;
  error?: string;
}
