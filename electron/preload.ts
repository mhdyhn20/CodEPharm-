import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Auth
  hasAnyUser: () => ipcRenderer.invoke('auth:hasAnyUser'),
  createAdmin: (username: string, password: string) =>
    ipcRenderer.invoke('auth:createAdmin', { username, password }),
  login: (username: string, password: string) => ipcRenderer.invoke('auth:login', { username, password }),

  // Patients
  createPatient: (input: { full_name: string; phone: string; address: string }) =>
    ipcRenderer.invoke('patients:create', input),
  updatePatient: (input: { id: number; full_name: string; phone: string; address: string }) =>
    ipcRenderer.invoke('patients:update', input),
  getPatient: (id: number) => ipcRenderer.invoke('patients:get', id),
  searchPatients: (query: string) => ipcRenderer.invoke('patients:search', query),
  listPatients: (page: number, perPage: number, query: string) =>
    ipcRenderer.invoke('patients:list', { page, perPage, query }),
  phoneExists: (phone: string, excludeId?: number) =>
    ipcRenderer.invoke('patients:phoneExists', { phone, excludeId }),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSetting: (key: string, value: string) => ipcRenderer.invoke('settings:set', { key, value }),

  // Backup/restore
  backup: () => ipcRenderer.invoke('db:backup'),
  restore: () => ipcRenderer.invoke('db:restore'),

  // Print
  printPatient: (data: {
    pharmacyName: string;
    code: number;
    name: string;
    phone: string;
    address: string;
    date: string;
    paperSize: 'A5' | 'thermal80';
  }) => ipcRenderer.invoke('print:patient', data),
};

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
