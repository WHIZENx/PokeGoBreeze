import { useEffect, useMemo, useState } from 'react';

const loadedImageUrls = new Set<string>();

const normalizeImageUrl = (url: string) => {
  if (typeof window === 'undefined') {
    return url;
  }
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
};

export const markImageAsPreloaded = (url: string | null | undefined) => {
  if (url) {
    loadedImageUrls.add(normalizeImageUrl(url));
  }
};

export const isImagePreloaded = (url: string | null | undefined) =>
  Boolean(url && loadedImageUrls.has(normalizeImageUrl(url)));

const uniqueUrls = (candidates: Array<string | null | undefined>) => [
  ...new Set(candidates.filter((candidate): candidate is string => Boolean(candidate))),
];

export const usePreloadedImage = (
  candidates: Array<string | null | undefined>,
  fallback: string,
  cacheCandidates: Array<string | null | undefined> = candidates
) => {
  const candidateKey = JSON.stringify(uniqueUrls(candidates));
  const cacheCandidateKey = JSON.stringify(uniqueUrls(cacheCandidates));
  const imageKey = `${candidateKey}:${cacheCandidateKey}`;
  const candidateUrls = useMemo(() => JSON.parse(candidateKey) as string[], [candidateKey]);
  const cacheCandidateUrls = useMemo(() => JSON.parse(cacheCandidateKey) as string[], [cacheCandidateKey]);
  const urls = useMemo(() => uniqueUrls([...candidateUrls, fallback]), [candidateUrls, fallback]);
  const cachedCandidate = cacheCandidateUrls.find(isImagePreloaded);
  const [imageState, setImageState] = useState({
    imageKey,
    displayedUrl: cachedCandidate ?? fallback,
    isLoading: candidateUrls.length > 0 && !cachedCandidate,
  });

  useEffect(() => {
    let active = true;
    let candidateIndex = 0;
    const cachedUrl = cacheCandidateUrls.find(isImagePreloaded);
    setImageState((current) => ({
      imageKey,
      displayedUrl: cachedUrl ?? (candidateUrls.length === 0 ? fallback : current.displayedUrl),
      isLoading: candidateUrls.length > 0 && !cachedUrl,
    }));

    if (cachedUrl) {
      return () => {
        active = false;
      };
    }

    const loadNext = () => {
      const url = urls[candidateIndex++];
      if (!url) {
        if (active) {
          setImageState((current) => ({ ...current, imageKey, isLoading: false }));
        }
        return;
      }

      if (isImagePreloaded(url)) {
        if (active) {
          setImageState({ imageKey, displayedUrl: url, isLoading: false });
        }
        return;
      }

      const image = new Image();
      image.onload = () => {
        markImageAsPreloaded(url);
        if (active) {
          setImageState({ imageKey, displayedUrl: url, isLoading: false });
        }
      };
      image.onerror = loadNext;
      image.src = url;
    };

    loadNext();
    return () => {
      active = false;
    };
  }, [cacheCandidateUrls, candidateUrls, fallback, imageKey, urls]);

  const currentCachedCandidate = cacheCandidateUrls.find(isImagePreloaded);
  const candidateChanged = imageState.imageKey !== imageKey;

  return {
    displayedUrl: candidateChanged
      ? (currentCachedCandidate ?? (candidateUrls.length === 0 ? fallback : imageState.displayedUrl))
      : imageState.displayedUrl,
    isLoading: candidateChanged ? candidateUrls.length > 0 && !currentCachedCandidate : imageState.isLoading,
  };
};
