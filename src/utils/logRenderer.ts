import { ipcRenderer } from 'electron';
import { LogLevel } from 'electron-log';

const send = (level: LogLevel, ...params: unknown[]) => {
  ipcRenderer.send('__ELECTRON_LOG__', {
    data: params,
    level,
    logId: 'renderer',
  });
  // Send the log in the backend no shows the log in the dev tools. So, we do it.
  switch (level) {
    case 'error':
      return console.error(...params);
    case 'debug':
      return console.debug(...params);
    case 'info':
      return console.info(...params);
    case 'warn':
      return console.warn(...params);
    case 'silly':
    case 'verbose':
      return console.log(...params);
  }
};

export const error = (...params: unknown[]) => send.apply(send, ['error', ...params]);
export const warn = (...params: unknown[]) => send.apply(send, ['warn', ...params]);
export const info = (...params: unknown[]) => send.apply(send, ['info', ...params]);
export const verbose = (...params: unknown[]) => send.apply(send, ['verbose', ...params]);
export const debug = (...params: unknown[]) => send.apply(send, ['debug', ...params]);
export const silly = (...params: unknown[]) => send.apply(send, ['silly', ...params]);

export type LogRendererType = {
  error: (...params: unknown[]) => void;
  warn: (...params: unknown[]) => void;
  info: (...params: unknown[]) => void;
  verbose: (...params: unknown[]) => void;
  debug: (...params: unknown[]) => void;
  silly: (...params: unknown[]) => void;
};
