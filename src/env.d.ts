/// <reference types="vite/client" />

import type { Api } from '../electron/preload';

declare global {
  interface Window {
    api: Api;
    __cpDebug?: {
      load: () => any;
      save: (db: any) => void;
      clear: () => void;
    };
    process?: {
      versions?: {
        electron?: string;
      };
    };
  }
}

export {};
