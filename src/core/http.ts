/** The one place HTTP happens: bearer auth, query building, error mapping. */

import { MilesverseApiError, MilesverseNetworkError } from '../errors';

export interface HttpOptions {
  baseUrl: string;
  getToken?: () => string | null;
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  form?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  auth?: boolean;
}

interface ErrorEnvelope {
  error?: { code?: string; message?: string; details?: Record<string, unknown>; request_id?: string };
}

export class HttpClient {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: HttpOptions) {
    this.fetchImpl = options.fetchImpl ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  }

  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const url = new URL(`${this.options.baseUrl}${path}`);
    for (const [key, value] of Object.entries(opts.query ?? {})) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = { accept: 'application/json' };
    const token = (opts.auth ?? true) ? (this.options.getToken?.() ?? null) : null;
    if (token) headers.authorization = `Bearer ${token}`;

    let bodyInit: string | undefined;
    if (opts.form) {
      headers['content-type'] = 'application/x-www-form-urlencoded';
      bodyInit = new URLSearchParams(opts.form).toString();
    } else if (opts.body !== undefined) {
      headers['content-type'] = 'application/json';
      bodyInit = JSON.stringify(opts.body);
    }

    let response: Response;
    try {
      response = await this.fetchImpl(url.toString(), {
        method: opts.method ?? 'GET',
        headers,
        body: bodyInit,
      });
    } catch (error) {
      throw new MilesverseNetworkError(error instanceof Error ? error.message : undefined);
    }

    if (response.status === 204) return undefined as T;
    const text = await response.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : undefined;
    } catch {
      payload = text;
    }

    if (!response.ok) {
      const envelope = (payload ?? {}) as ErrorEnvelope;
      const err = envelope.error ?? {};
      throw new MilesverseApiError(
        response.status,
        err.code ?? 'http_error',
        err.message ?? `Request failed with status ${response.status}.`,
        err.details,
        err.request_id,
      );
    }
    return payload as T;
  }
}
