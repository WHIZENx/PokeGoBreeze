import { useMemo, useState } from 'react';

const uniqueSources = (candidates: Array<string | null | undefined>) => [
  ...new Set(candidates.filter((candidate): candidate is string => Boolean(candidate))),
];

export const useImageSourceSequence = (candidates: Array<string | null | undefined>) => {
  const sourceKey = JSON.stringify(uniqueSources(candidates));
  const sources = useMemo(() => JSON.parse(sourceKey) as string[], [sourceKey]);
  const [failureState, setFailureState] = useState({ sourceKey, failedSourceCount: 0 });
  const failedSourceCount = failureState.sourceKey === sourceKey ? failureState.failedSourceCount : 0;
  const source = sources[failedSourceCount];

  const advanceSource = () => {
    setFailureState((current) => ({
      sourceKey,
      failedSourceCount: (current.sourceKey === sourceKey ? current.failedSourceCount : 0) + 1,
    }));
  };

  return { source, advanceSource, exhausted: !source };
};
