import { useEffect, useRef } from 'react';

/**
 * Skips the request from the render where filters changed but pagination has
 * not reset to page one yet. The following page-one render is not skipped.
 */
export const useSkipStalePageRequest = (page: number, resetKey: string) => {
  const previousResetKey = useRef(resetKey);
  const shouldSkip = previousResetKey.current !== resetKey && page !== 1;

  useEffect(() => {
    previousResetKey.current = resetKey;
  }, [resetKey]);

  return shouldSkip;
};

export default useSkipStalePageRequest;
