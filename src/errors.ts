/** SDK error types. Every API failure carries the backend's stable error code. */

export class MilesverseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MilesverseError';
  }
}

/** The backend answered with its error envelope. */
export class MilesverseApiError extends MilesverseError {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown> | undefined;
  readonly requestId: string | undefined;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
    requestId?: string,
  ) {
    super(message);
    this.name = 'MilesverseApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

/** No MilesVerse session could be established (no/invalid subject token). */
export class MilesverseAuthError extends MilesverseError {
  constructor(message = 'Not authenticated with MilesVerse.') {
    super(message);
    this.name = 'MilesverseAuthError';
  }
}

/** The network itself failed (offline, DNS, CORS). */
export class MilesverseNetworkError extends MilesverseError {
  constructor(message = 'The MilesVerse API is unreachable.') {
    super(message);
    this.name = 'MilesverseNetworkError';
  }
}
