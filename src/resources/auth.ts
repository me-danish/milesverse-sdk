/** Authentication: SSO provisioning, refresh, current user.

    Password login (`/auth/token`) is deliberately absent: it is for system
    users (operators/admin tooling), never for the end-user surfaces this SDK
    serves. End users authenticate exclusively through `ssoToken`. */

import type { HttpClient } from '../core/http';
import type { TokenPair, User } from '../types';

export class AuthResource {
  constructor(
    private readonly http: HttpClient,
    private readonly setToken: (token: string | null) => void,
  ) {}

  /**
   * End users: provision/recognise via a provider SSO token, then use the SSO
   * token itself as the bearer (mmc-develop issues no tokens for SSO logins).
   * ``applicationId`` is the application the login came through; a new user is
   * granted exactly that one membership.
   */
  async ssoToken(ssoToken: string, orgId: string, applicationId?: string): Promise<User> {
    const res = await this.http.request<{ data: User }>('/api/v1/auth/sso/token', {
      method: 'POST',
      body: {
        sso_token: ssoToken,
        org_id: orgId,
        ...(applicationId ? { application_id: applicationId } : {}),
      },
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
