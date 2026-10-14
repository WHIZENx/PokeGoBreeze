import { useEffect, useMemo, useState } from 'react';

const uniqueUrls = (candidates: Array<string | null | undefined>, fallback: string) => [
  ...new Set([...candidates, fallback].filter((candidate): candidate is string => Boolean(candidate))),
];

export const usePreloadedImage = (candidates: Array<string | null | undefined>, fallback: string) => {
  const candidateKey = JSON.stringify(uniqueUrls(candidates, fallback));
  const urls = useMemo(() => JSON.parse(candidateKey) as string[], [candidateKey]);
  const [displayedUrl, setDisplayedUrl] = useState(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let candidateIndex = 0;
    setIsLoading(true);

    const loadNext = () => {
      const url = urls[candidateIndex++];
      if (!url) {
        if (active) {
          setIsLoading(false);
        }
        return;
      }

      const image = new Image();
      image.onload = () => {
        if (active) {
          setDisplayedUrl(url);
          setIsLoading(false);
        }
      };
      image.onerror = loadNext;
      image.src = url;
    };

    loadNext();
    return () => {
      active = false;
    };
  }, [urls]);

  return { displayedUrl, isLoading };
};
