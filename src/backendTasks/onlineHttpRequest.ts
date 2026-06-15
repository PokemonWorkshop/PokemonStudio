import log from 'electron-log';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Generic HTTP relay for the PSDK Online Server. All Online API calls funnel
 * through here for two reasons: (1) Electron renderers still hit CORS/mixed
 * content surprises with arbitrary fetches, (2) the admin key never has to
 * cross into renderer-bundled code paths beyond the form that submits it.
 *
 * Renderer passes the fully-formed URL, method, headers, and an optional JSON
 * body. We return `{ ok, status, body, error }` rather than throwing on
 * non-2xx — the renderer needs the status + envelope to surface API errors.
 * Network-level failures (DNS, connection refused) come back as `ok: false`
 * with an `error` string and `status: 0`.
 */
export type OnlineHttpRequestInput = {
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  headers?: Record<string, string>;
  body?: unknown;
};

export type OnlineHttpRequestOutput = {
  ok: boolean;
  status: number;
  body: unknown;
  error?: string;
};

const onlineHttpRequest = async (payload: OnlineHttpRequestInput): Promise<OnlineHttpRequestOutput> => {
  // Don't log secrets — strip auth headers before logging the request shape.
  const safeHeaders = { ...(payload.headers ?? {}) };
  for (const h of Object.keys(safeHeaders)) {
    if (/^x-(api|admin|player)-/i.test(h)) safeHeaders[h] = '***';
  }
  log.info('online-http-request', { url: payload.url, method: payload.method, headers: safeHeaders });

  try {
    const init: RequestInit = {
      method: payload.method,
      headers: {
        Accept: 'application/json',
        ...(payload.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(payload.headers ?? {}),
      },
      body: payload.body === undefined ? undefined : JSON.stringify(payload.body),
    };
    const response = await fetch(payload.url, init);
    const status = response.status;
    const text = await response.text();
    let parsed: unknown = text;
    if (text.length > 0) {
      try {
        parsed = JSON.parse(text);
      } catch {
        // Keep it as a string if the server didn't return JSON.
      }
    } else {
      parsed = null;
    }
    log.info('online-http-request/response', { status });
    return { ok: status >= 200 && status < 300, status, body: parsed };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error('online-http-request/failure', message);
    return { ok: false, status: 0, body: null, error: message };
  }
};

export const registerOnlineHttpRequest = defineBackendServiceFunction('online-http-request', onlineHttpRequest);
