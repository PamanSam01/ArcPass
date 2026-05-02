import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).Buffer = Buffer;
  (window as any).process = { 
    env: { NODE_ENV: 'production' },
    nextTick: (cb: any) => setTimeout(cb, 0),
    browser: true
  };
}

export {};
