/** Wire types — hand-written mirrors of mmc-develop's DTOs (snake_case). */

export interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  system_role: string | null;
  org_id: string | null;
  role_id: string | null;
  app_ids: string[];
  active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface Subject {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DifficultyModifiers {
  simulation: Record<string, unknown>;
  report: Record<string, unknown>;
}

export interface DifficultyLevel {
  id: string;
  key: string;
  label: string;
  blurb: string | null;
  color: string | null;
  modifiers: DifficultyModifiers;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** The authored tier of a scenario (a property of the exercise, not the
 *  per-session intensity the learner dials). */
export type SimulationDifficulty = 'Foundational' | 'Intermediate' | 'Advanced';

export interface Simulation {
  id: string;
  slug: string;
  title: string;
  subject_id: string | null;
  name: string | null;
  role: string | null;
  difficulty: SimulationDifficulty | null;
  difficulty_level_id: string | null;
  practice: string | null;
  objective: string | null;
  tagline: string | null;
  stream_ids: string[];
  thumbnail_url: string | null;
  scenarios_s3_key: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** One subject and the simulations filed under it (the browse grouping). */
export interface SubjectGroup {
  /** Null for the trailing group of simulations not yet filed under a subject. */
  subject: Subject | null;
  total: number;
  simulations: Simulation[];
}

/** The whole catalogue grouped by subject — not paginated. */
export interface GroupedSimulations {
  groups: SubjectGroup[];
  total: number;
}

/** Marking criterion, grouped by competency in the scenario. */
export interface MarkingCriterion {
  id: string;
  text: string;
}

/**
 * The resolved scenario document, as returned inside a simulation detail.
 * The authoring tool's shape is open, so unknown extras are allowed.
 */
export interface Scenario {
  id?: string;
  title?: string;
  personaName?: string | null;
  personaRole?: string | null;
  difficulty?: string | null;
  subject?: string | null;
  tagline?: string | null;
  practice?: string | null;
  situation?: string | null;
  objective?: string | null;
  concepts?: string[];
  openingLine?: string | null;
  artifacts?: Record<string, unknown>[];
  marking?: Record<string, MarkingCriterion[]>;
  anam?: { avatarId?: string; voiceId?: string; [k: string]: unknown };
  accent?: string | null;
  emoji?: string | null;
  [key: string]: unknown;
}

export interface SimulationDetail extends Simulation {
  scenario: Scenario | null;
}

export interface PageMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export interface SessionRow {
  id: string;
  simulation_id: string | null;
  simulation_version_id: string | null;
  user_id: string | null;
  org_id: string | null;
  anam_session_id: string | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
  duration_seconds: number | null;
  exit_reason: string | null;
  scenario_s3_key: string | null;
  transcript_s3_key: string | null;
  recording_s3_key: string | null;
  created_at: string;
  updated_at: string;
}

/** A started run and the Anam credential the browser streams with. */
export interface SessionStarted {
  session: SessionRow;
  session_token: string;
  expires_in_seconds: number;
  scenario: Scenario;
  /** The session difficulty actually applied, if one was requested. */
  difficulty?: string | null;
}

export interface SessionAnalytics {
  id: string;
  session_id: string;
  session_type: string | null;
  llm_provider: string | null;
  llm_model: string | null;
  language_code: string | null;
  total_turns: number;
  completed_turns: number;
  interrupted_turns: number;
  interruption_rate: number | null;
  total_user_speech_duration_seconds: number | null;
  total_user_words: number;
  total_assistant_words: number;
  total_warnings: number;
  total_errors: number;
  tool_calls_total: number;
  tool_calls_succeeded: number;
  tool_calls_failed: number;
  tool_calls_by_name: Record<string, number>;
}

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  active?: boolean;
}

/** Where a run's scored assessment stands. ``ready`` is the only status with
 *  scores; everything else keeps polling except the two terminal failures. */
export type SessionAssessmentStatus =
  | 'pending'
  | 'in_progress'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'abandoned';

export interface AssessmentScore {
  score: number;
  evidence: string;
}

export interface AssessmentCriterion {
  id: string;
  text: string;
  verdict: 'met' | 'partial' | 'missed';
  evidence: string;
  turn: number | null;
}

export interface AssessmentKeyMoment {
  quote: string;
  note: string;
}

export interface AssessmentDelivery {
  overall: number;
  style_summary: string;
  signals: Record<string, AssessmentScore>;
}

export interface AssessmentTranscriptTurn {
  role: 'user' | 'persona';
  content: string;
}

/** A session's scored progress card, or as much of it as exists yet
 *  (``GET /sessions/{id}/assessment``). */
export interface SessionAssessment {
  session_id: string;
  simulation_id: string | null;
  scenario_title: string | null;
  persona_name: string | null;
  difficulty: string | null;
  started_at: string | null;
  duration_seconds: number | null;
  status: SessionAssessmentStatus;

  overall: number | null;
  summary: string | null;
  scores: Record<string, AssessmentScore>;
  marking: Record<string, AssessmentCriterion[]>;
  delivery: AssessmentDelivery | null;
  strengths: string[];
  growth_areas: string[];
  key_moment: AssessmentKeyMoment | null;
  transcript: AssessmentTranscriptTurn[];
}
