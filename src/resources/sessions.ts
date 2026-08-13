/** Sessions: start a run (-> Anam token, streamed in-page), list, read, analytics. */

import type { HttpClient } from '../core/http';
import type {
  ListParams,
  Page,
  SessionAnalytics,
  SessionAssessment,
  SessionRow,
  SessionStarted,
} from '../types';

export class SessionsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Start a run of one simulation. Feed ``session_token`` to the Anam client:
   * ``createClient(session_token).streamToVideoElement(el)``.
   *
   * ``difficulty`` is the session-intensity key ("supportive" | "realistic" |
   * "challenging"); omitted runs the scenario exactly as authored.
   */
  async start(simulationId: string, difficulty?: string): Promise<SessionStarted> {
    const res = await this.http.request<{ data: SessionStarted }>('/api/v1/sessions', {
      method: 'POST',
      body: { simulation_id: simulationId, ...(difficulty ? { difficulty } : {}) },
    });
    return res.data;
  }

  list(params: ListParams = {}): Promise<Page<SessionRow>> {
    return this.http.request<Page<SessionRow>>('/api/v1/sessions', {
      query: { page: params.page, page_size: params.page_size },
    });
  }

  async get(id: string): Promise<SessionRow> {
    const res = await this.http.request<{ data: SessionRow }>(`/api/v1/sessions/${id}`);
    return res.data;
  }

  async analytics(id: string): Promise<SessionAnalytics> {
    const res = await this.http.request<{ data: SessionAnalytics }>(
      `/api/v1/sessions/${id}/analytics`,
    );
    return res.data;
  }

  /**
   * Record that the client's conversation has stopped. Safe to call more than
   * once — a session that has already ended is returned as it stands.
   */
  async end(id: string): Promise<SessionRow> {
    const res = await this.http.request<{ data: SessionRow }>(`/api/v1/sessions/${id}/end`, {
      method: 'POST',
    });
    return res.data;
  }

  /**
   * Report the engine's own session id (``client.getActiveSessionId()``) so
   * ingestion can later join its payload onto this run. Idempotent for the
   * same id; a different id conflicts with a 409.
   */
  async bindAnamSession(id: string, anamSessionId: string): Promise<SessionRow> {
    const res = await this.http.request<{ data: SessionRow }>(
      `/api/v1/sessions/${id}/anam-session`,
      { method: 'PUT', body: { anam_session_id: anamSessionId } },
    );
    return res.data;
  }

  /**
   * The scored progress card, or as much of it as exists yet. Check
   * ``status``: keep polling while it's not ``ready``/``failed``/``abandoned``.
   */
  async assessment(id: string): Promise<SessionAssessment> {
    const res = await this.http.request<{ data: SessionAssessment }>(
      `/api/v1/sessions/${id}/assessment`,
    );
    return res.data;
  }
}
