import { useEffect } from 'react';

export const useChangeTitle = (title: string, isShowTitle = true) => {
  useEffect(() => {
    if (isShowTitle) {
      document.title = title;
    }
  }, []);
};
