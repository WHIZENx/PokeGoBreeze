import { useRef, useCallback } from 'react';
import { CancelTokenSource, CancelTokenStatic } from 'axios';

export const useCancelToken = (cancelToken: CancelTokenStatic) => {
  const axiosSource: React.MutableRefObject<CancelTokenSource | undefined> = useRef();

  const newCancelToken = useCallback(() => {
    axiosSource.current = cancelToken.source();
    return axiosSource.current.token;
  }, []);

  const cancel = useCallback((msg?: string) => {
    axiosSource.current?.cancel(msg);
  }, []);

  return { newCancelToken, cancel };
};
