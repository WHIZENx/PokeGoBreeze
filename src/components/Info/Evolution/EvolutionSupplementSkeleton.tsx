import React from 'react';
import { Skeleton } from '@mui/material';

interface EvolutionSupplementSkeletonProps {
  title: string;
  testId: string;
  variant?: 'card' | 'relationship';
}

const EvolutionSupplementSkeleton = ({ title, testId, variant = 'relationship' }: EvolutionSupplementSkeletonProps) => (
  <section className="tw-mt-8 tw-w-full tw-relative" data-testid={testId} aria-label={`Loading ${title}`}>
    <h4 className="title-evo">
      <b>{title}</b>
    </h4>
    {variant === 'card' ? (
      <div className="tw-flex tw-w-full tw-justify-center">
        <div className="tw-flex tw-w-full tw-max-w-[22rem] tw-flex-col tw-gap-3 tw-rounded tw-border tw-border-solid tw-border-[var(--divider)] tw-p-3">
          <div className="tw-flex tw-items-center tw-gap-3">
            <Skeleton data-skeleton-surface="page" variant="rounded" animation="wave" width={96} height={96} />
            <div className="tw-flex tw-flex-1 tw-flex-col tw-gap-2">
              <Skeleton data-skeleton-surface="page" variant="text" animation="wave" width="25%" />
              <Skeleton data-skeleton-surface="page" variant="text" animation="wave" width="70%" />
              <Skeleton data-skeleton-surface="page" variant="text" animation="wave" width="45%" />
            </div>
          </div>
          <div className="tw-grid tw-grid-cols-2 tw-gap-2">
            <Skeleton data-skeleton-surface="page" variant="rounded" animation="wave" height={64} />
            <Skeleton data-skeleton-surface="page" variant="rounded" animation="wave" height={64} />
          </div>
        </div>
      </div>
    ) : (
      <div className="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-2">
        {[0, 1].map((column) => (
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-3" key={column}>
            <Skeleton data-skeleton-surface="page" variant="rounded" animation="wave" width={96} height={96} />
            <Skeleton data-skeleton-surface="page" variant="text" animation="wave" width={112} />
            <Skeleton
              className="tw-w-full tw-max-w-sm"
              data-skeleton-surface="page"
              variant="rounded"
              animation="wave"
              height={88}
            />
          </div>
        ))}
      </div>
    )}
  </section>
);

export default EvolutionSupplementSkeleton;
