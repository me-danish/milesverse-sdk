/**
 * @milesverse/sdk — typed client for the MilesVerse (mmc-develop) API.
 *
 * ```ts
 * const mv = createMilesverse({ baseUrl: 'http://localhost:8100' });
 * await mv.auth.ssoToken(providerToken, orgId, applicationId); // or mv.setToken(token)
 * const { data: sims } = await mv.catalog.simulations({ search: 'audit' });
 * const detail = await mv.catalog.simulation(sims[0].id);
 * const started = await mv.sessions.start(sims[0].id);     // started.session_token -> Anam
 * ```
 *
 * Auth is a bearer token: a provider-signed SSO token exchanged via
 * `auth.ssoToken` (or supplied directly via `setToken`); it is then sent on
 * every request.
 */

import { HttpClient } from './core/http';
import { AuthResource } from './resources/auth';
import { CatalogResource } from './resources/catalog';
import { SessionsResource } from './resources/sessions';

export * from './errors';
export * from './types';

export interface MilesverseOptions {
  /** MilesVerse API origin, e.g. "http://localhost:8100" (no trailing slash needed). */
  baseUrl: string;
  /** An initial bearer token (an SSO token, or a previously obtained access token). */
  token?: string;
  /** Override fetch (SSR, tests). */
  fetchImpl?: typeof fetch;
}

export interface Milesverse {
  auth: AuthResource;
  catalog: CatalogResource;
  sessions: SessionsResource;
  /** Set (or clear) the bearer used on every request. */
  setToken(token: string | null): void;
  /** The current bearer, if any. */
  readonly token: string | null;
}

export function createMilesverse(options: MilesverseOptions): Milesverse {
  let token: string | null = options.token ?? null;
  const http = new HttpClient({
    baseUrl: options.baseUrl.replace(/\/$/, ''),
    fetchImpl: options.fetchImpl,
    getToken: () => token,
  });
  const setToken = (next: string | null): void => {
    token = next;
  };

  return {
    auth: new AuthResource(http, setToken),
    catalog: new CatalogResource(http),
    sessions: new SessionsResource(http),
    setToken,
    get token() {
      return token;
    },
  };
}
