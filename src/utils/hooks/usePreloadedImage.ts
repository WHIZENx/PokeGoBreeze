import { useEffect, useMemo, useState } from 'react';

const loadedImageUrls = new Set<string>();
const loadingImageUrls = new Map<string, Promise<boolean>>();

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

const loadImageOnce = (url: string) => {
  if (isImagePreloaded(url)) {
    return Promise.resolve(true);
  }

  const normalizedUrl = normalizeImageUrl(url);
  const pending = loadingImageUrls.get(normalizedUrl);
  if (pending) {
    return pending;
  }

  const request = new Promise<boolean>((resolve) => {
    const image = new Image();
    image.onload = () => {
      markImageAsPreloaded(url);
      resolve(true);
    };
    image.onerror = () => resolve(false);
    image.src = url;
  }).finally(() => loadingImageUrls.delete(normalizedUrl));
  loadingImageUrls.set(normalizedUrl, request);
  return request;
};

const uniqueUrls = (candidates: Array<string | null | undefined>) => [
  ...new Set(candidates.filter((candidate): candidate is string => Boolean(candidate))),
];

export const preloadFirstAvailableImage = async (candidates: Array<string | null | undefined>) => {
  for (const url of uniqueUrls(candidates)) {
    if (await loadImageOnce(url)) {
      return url;
    }
  }
  return undefined;
};

export const usePreloadedImage = (
  candidates: Array<string | null | undefined>,
  fallback: string,
  cacheCandidates: Array<string | null | undefined> = candidates,
  enforceCandidateOrder = false
) => {
  const candidateKey = JSON.stringify(uniqueUrls(candidates));
  const cacheCandidateKey = JSON.stringify(uniqueUrls(cacheCandidates));
  const imageKey = `${candidateKey}:${cacheCandidateKey}`;
  const candidateUrls = useMemo(() => JSON.parse(candidateKey) as string[], [candidateKey]);
  const cacheCandidateUrls = useMemo(() => JSON.parse(cacheCandidateKey) as string[], [cacheCandidateKey]);
  const urls = useMemo(() => uniqueUrls([...candidateUrls, fallback]), [candidateUrls, fallback]);
  const cachedCandidate = enforceCandidateOrder
    ? candidateUrls[0] && isImagePreloaded(candidateUrls[0])
      ? candidateUrls[0]
      : undefined
    : cacheCandidateUrls.find(isImagePreloaded);
  const [imageState, setImageState] = useState({
    imageKey,
    displayedUrl: cachedCandidate ?? fallback,
    isLoading: candidateUrls.length > 0 && !cachedCandidate,
  });

  useEffect(() => {
    let active = true;
    let candidateIndex = 0;
    const cachedUrl = enforceCandidateOrder
      ? candidateUrls[0] && isImagePreloaded(candidateUrls[0])
        ? candidateUrls[0]
        : undefined
      : cacheCandidateUrls.find(isImagePreloaded);
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

    const loadNext = async () => {
      const url = urls[candidateIndex++];
      if (!url) {
        if (active) {
          setImageState((current) => ({ ...current, imageKey, isLoading: false }));
        }
        return;
      }

      if (await loadImageOnce(url)) {
        if (active) {
          setImageState({ imageKey, displayedUrl: url, isLoading: false });
        }
        return;
      }
      if (active) {
        void loadNext();
      }
    };

    void loadNext();
    return () => {
      active = false;
    };
  }, [cacheCandidateUrls, candidateUrls, enforceCandidateOrder, fallback, imageKey, urls]);

  const currentCachedCandidate = enforceCandidateOrder
    ? candidateUrls[0] && isImagePreloaded(candidateUrls[0])
      ? candidateUrls[0]
      : undefined
    : cacheCandidateUrls.find(isImagePreloaded);
  const candidateChanged = imageState.imageKey !== imageKey;

  return {
    displayedUrl: candidateChanged
      ? (currentCachedCandidate ?? (candidateUrls.length === 0 ? fallback : imageState.displayedUrl))
      : imageState.displayedUrl,
    isLoading: candidateChanged ? candidateUrls.length > 0 && !currentCachedCandidate : imageState.isLoading,
  };
};
