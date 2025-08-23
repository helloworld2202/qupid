export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(resource: string): AppError {
    return new AppError(
      'NOT_FOUND',
      `${resource} not found`,
      404
    );
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(
      'UNAUTHORIZED',
      message,
      401
    );
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(
      'FORBIDDEN',
      message,
      403
    );
  }

  static badRequest(message: string): AppError {
    return new AppError(
      'BAD_REQUEST',
      message,
      400
    );
  }

  static internal(message = 'Internal server error', cause?: unknown): AppError {
    return new AppError(
      'INTERNAL_ERROR',
      message,
      500,
      cause
    );
  }

  static validation(message: string): AppError {
    return new AppError(
      'VALIDATION_ERROR',
      message,
      422
    );
  }
}