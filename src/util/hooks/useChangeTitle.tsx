import { useEffect } from 'react';

export const useChangeTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, []);
};
