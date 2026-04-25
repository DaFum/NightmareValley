export interface RuntimeIssue {
  code: string;
  message: string;
  context?: string;
  tick?: number;
  cause?: string;
}

export function toRuntimeIssue(error: unknown, code: string, context: string, tick?: number): RuntimeIssue {
  if (error instanceof Error) {
    return {
      code,
      message: error.message,
      context,
      tick,
      cause: error.name,
    }
  }

  return {
    code,
    message: String(error),
    context,
    tick,
  }
}
