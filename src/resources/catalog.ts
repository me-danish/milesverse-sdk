/** The catalogue: subjects, difficulty levels, and the simulation listing/detail. */

import type { HttpClient } from '../core/http';
import type {
  DifficultyLevel,
  GroupedSimulations,
  ListParams,
  Page,
  Simulation,
  SimulationDetail,
  Subject,
} from '../types';

export class CatalogResource {
  constructor(private readonly http: HttpClient) {}

  async subjects(): Promise<Subject[]> {
    const res = await this.http.request<{ data: Subject[] }>('/api/v1/subjects');
    return res.data;
  }

  async difficultyLevels(): Promise<DifficultyLevel[]> {
    const res = await this.http.request<{ data: DifficultyLevel[] }>('/api/v1/difficulty-levels');
    return res.data;
  }

  /** One page of the entitled catalogue, optionally searched/filtered. */
  simulations(params: ListParams = {}): Promise<Page<Simulation>> {
    return this.http.request<Page<Simulation>>('/api/v1/simulations', {
      query: {
        page: params.page,
        page_size: params.page_size,
        search: params.search,
        active: params.active,
      },
    });
  }

  /**
   * The whole entitled catalogue grouped by subject — the browse screen's
   * shape (subjects, each with the simulations filed under it). Not paginated:
   * the grouping is the point. Unfiled simulations come back in a trailing
   * group whose `subject` is null.
   */
  async simulationsBySubject(active = true): Promise<GroupedSimulations> {
    const res = await this.http.request<{ data: GroupedSimulations }>(
      '/api/v1/simulations/by-subject',
      { query: { active } },
    );
    return res.data;
  }

  /** One simulation with its scenario resolved. */
  async simulation(id: string): Promise<SimulationDetail> {
    const res = await this.http.request<{ data: SimulationDetail }>(`/api/v1/simulations/${id}`);
    return res.data;
  }
}
