/** Authentication: password login, SSO provisioning, refresh, current user. */

import type { HttpClient } from '../core/http';
import type { TokenPair, User } from '../types';

export class AuthResource {
  constructor(
    private readonly http: HttpClient,
    private readonly setToken: (token: string | null) => void,
  ) {}

  /** System users: email + password -> access/refresh pair (sets the bearer). */
  async login(email: string, password: string): Promise<TokenPair> {
    const pair = await this.http.request<TokenPair>('/api/v1/auth/token', {
      method: 'POST',
      form: { username: email, password },
      auth: false,
    });
    this.setToken(pair.access_token);
    return pair;
  }

  /**
   * End users: provision/recognise via a provider SSO token, then use the SSO
   * token itself as the bearer (mmc-develop issues no tokens for SSO logins).
   */
  async ssoToken(ssoToken: string, orgId: string, applicationIds: string[] = []): Promise<User> {
    const res = await this.http.request<{ data: User }>('/api/v1/auth/sso/token', {
      method: 'POST',
      body: { sso_token: ssoToken, org_id: orgId, application_ids: applicationIds },
      auth: false,
    });
    this.setToken(ssoToken);
    return res.data;
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const pair = await this.http.request<TokenPair>('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
      auth: false,
    });
    this.setToken(pair.access_token);
    return pair;
  }

  async me(): Promise<User> {
    const res = await this.http.request<{ data: User }>('/api/v1/auth/me');
    return res.data;
  }
}
