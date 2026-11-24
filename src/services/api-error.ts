import { isAxiosError } from 'axios';

const errorCodePattern = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/;

function readMessage(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }
  const message = value.trim();
  return message && message.length <= 300 && !errorCodePattern.test(message) && !/[<>\r\n]/.test(message)
    ? message
    : undefined;
}

export function getApiError(error: unknown) {
  if (!isAxiosError(error)) {
    return {};
  }
  const { response } = error;
  const body = response?.data as { code?: unknown; detail?: unknown; error?: unknown; pokemon?: unknown } | undefined;
  const candidate = body?.code ?? body?.error;
  const code = typeof candidate === 'string' && errorCodePattern.test(candidate) ? candidate : undefined;
  return {
    status: response?.status,
    code,
    pokemon: typeof body?.pokemon === 'string' ? body.pokemon : undefined,
    message: code ? (readMessage(body?.detail) ?? readMessage(body?.error)) : undefined,
    networkCode: error.code,
  };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const { status, message, networkCode } = getApiError(error);
  if (message) {
    return message;
  }
  if (networkCode === 'ETIMEDOUT' || networkCode === 'ECONNABORTED' || status === 504) {
    return 'The request timed out. Try again.';
  }
  if (networkCode === 'ERR_NETWORK') {
    return 'Could not reach the service. Check your connection and try again.';
  }
  switch (status) {
    case 400:
    case 422:
      return 'Check your selections and try again.';
    case 401:
    case 403:
      return 'You do not have access to this resource.';
    case 404:
      return 'The requested data was not found.';
    case 429:
      return 'Too many requests. Wait a moment and try again.';
    case 502:
    case 503:
      return 'The service is temporarily unavailable. Try again shortly.';
    default:
      return fallback;
  }
}
