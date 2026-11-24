import { useEffect, useState } from 'react';

export function createLatestRequest() {
  let current: AbortController | undefined;

  const cancel = () => {
    const previous = current;
    current = undefined;
    previous?.abort();
    return Boolean(previous);
  };

  return {
    start() {
      cancel();
      current = new AbortController();
      return current.signal;
    },
    cancel,
    finish(signal: AbortSignal) {
      if (current?.signal !== signal) {
        return false;
      }
      current = undefined;
      return true;
    },
  };
}

export default function useLatestRequest(onDispose?: () => void) {
  const [request] = useState(createLatestRequest);
  useEffect(() => {
    return () => {
      if (request.cancel()) {
        onDispose?.();
      }
    };
  }, [request, onDispose]);
  return request;
}
