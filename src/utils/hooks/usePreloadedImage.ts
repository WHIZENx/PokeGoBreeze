import { useEffect, useMemo, useState } from 'react';

const uniqueUrls = (candidates: Array<string | null | undefined>, fallback: string) => [
  ...new Set([...candidates, fallback].filter((candidate): candidate is string => Boolean(candidate))),
];

export const usePreloadedImage = (candidates: Array<string | null | undefined>, fallback: string) => {
  const candidateKey = JSON.stringify(uniqueUrls(candidates, fallback));
  const urls = useMemo(() => JSON.parse(candidateKey) as string[], [candidateKey]);
  const [imageState, setImageState] = useState({
    candidateKey,
    displayedUrl: fallback,
    isLoading: true,
  });

  useEffect(() => {
    let active = true;
    let candidateIndex = 0;
    setImageState((current) => ({ ...current, candidateKey, isLoading: true }));

    const loadNext = () => {
      const url = urls[candidateIndex++];
      if (!url) {
        if (active) {
          setImageState((current) => ({ ...current, candidateKey, isLoading: false }));
        }
        return;
      }

      const image = new Image();
      image.onload = () => {
        if (active) {
          setImageState({ candidateKey, displayedUrl: url, isLoading: false });
        }
      };
      image.onerror = loadNext;
      image.src = url;
    };

    loadNext();
    return () => {
      active = false;
    };
  }, [candidateKey, urls]);

  return {
    displayedUrl: imageState.displayedUrl,
    isLoading: imageState.candidateKey !== candidateKey || imageState.isLoading,
  };
};
