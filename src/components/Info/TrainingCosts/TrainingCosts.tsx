import React, { useEffect, useRef } from 'react';
import { Skeleton } from '@mui/material';
import type { PokemonTypeCost } from '../../../core/models/evolution.model';
import APIService from '../../../services/api.service';
import Candy from '../../Sprites/Candy/Candy';

interface TrainingCostsProps {
  pokemonId?: number;
  thirdMove?: PokemonTypeCost;
  purified?: PokemonTypeCost;
  isLoading?: boolean;
}

interface CostItemProps {
  label: string;
  pokemonId?: number;
  cost: CompletePokemonTypeCost;
  isLoading: boolean;
}

type CompletePokemonTypeCost = PokemonTypeCost & {
  candy: number;
  stardust: number;
};

const hasCompleteCost = (cost?: PokemonTypeCost): cost is CompletePokemonTypeCost =>
  cost?.candy !== undefined && cost.stardust !== undefined;

// Reserve typical value widths before the first response; these stay hidden.
const loadingCost = { candy: 100, stardust: 100000 };

interface TrainingCostsSnapshot {
  thirdMove?: CompletePokemonTypeCost;
  purified?: CompletePokemonTypeCost;
}

// Detail routes remount when the species changes. Preserve the last completed
// layout and value widths for skeletons across that boundary as well.
let latestTrainingCostsSnapshot: TrainingCostsSnapshot | undefined;

const CostValue = ({ value, isLoading }: { value: number; isLoading: boolean }) => (
  <strong className="tw-relative tw-inline-block">
    <span className={isLoading ? 'tw-invisible' : undefined} aria-hidden={isLoading || undefined}>
      {value.toLocaleString()}
    </span>
    {isLoading && (
      <Skeleton
        data-skeleton-surface="page"
        variant="text"
        animation="wave"
        className="!tw-absolute !tw-inset-0 tw-min-w-full"
      />
    )}
  </strong>
);

const CostItem = ({ label, pokemonId, cost, isLoading }: CostItemProps) => (
  <div className="tw-rounded-lg tw-border tw-border-solid tw-border-divider tw-bg-table-strip tw-p-3">
    <span className="tw-block tw-text-body2 tw-font-semibold">{label}</span>
    <div className="tw-mt-2 tw-flex tw-flex-wrap tw-gap-2">
      <span
        className="tw-inline-flex tw-min-h-8 tw-items-center tw-gap-1.5 tw-rounded-full tw-border tw-border-solid tw-border-divider tw-bg-surface-paper tw-px-2.5 tw-py-1 tw-text-caption"
        aria-label={isLoading ? undefined : `${cost.candy.toLocaleString()} Candy`}
      >
        {isLoading ? (
          <Skeleton data-skeleton-surface="page" variant="circular" animation="wave" width={20} height={20} />
        ) : (
          <Candy id={pokemonId} className="tw-h-5 tw-w-5" />
        )}
        <CostValue value={cost.candy} isLoading={isLoading} />
        <span className="tw-text-foreground-secondary">Candy</span>
      </span>
      <span
        className="tw-inline-flex tw-min-h-8 tw-items-center tw-gap-1.5 tw-rounded-full tw-border tw-border-solid tw-border-divider tw-bg-surface-paper tw-px-2.5 tw-py-1 tw-text-caption"
        aria-label={isLoading ? undefined : `${cost.stardust.toLocaleString()} Stardust`}
      >
        {isLoading ? (
          <Skeleton data-skeleton-surface="page" variant="circular" animation="wave" width={20} height={20} />
        ) : (
          <img
            alt=""
            aria-hidden="true"
            className="tw-h-5 tw-w-5 tw-object-contain"
            src={APIService.getItemSprite('stardust_painted')}
          />
        )}
        <CostValue value={cost.stardust} isLoading={isLoading} />
        <span className="tw-text-foreground-secondary">Stardust</span>
      </span>
    </div>
  </div>
);

const TrainingCosts = ({ pokemonId, thirdMove, purified, isLoading = false }: TrainingCostsProps) => {
  const hasThirdMoveCost = hasCompleteCost(thirdMove);
  const hasPurificationCost = hasCompleteCost(purified);
  const lastLoadedSnapshot = useRef<TrainingCostsSnapshot>(
    latestTrainingCostsSnapshot ?? { thirdMove: loadingCost, purified: loadingCost }
  );

  useEffect(() => {
    if (!isLoading) {
      const snapshot = {
        thirdMove: hasThirdMoveCost ? { ...thirdMove } : undefined,
        purified: hasPurificationCost ? { ...purified } : undefined,
      };
      lastLoadedSnapshot.current = snapshot;
      latestTrainingCostsSnapshot = snapshot;
    }
  }, [hasThirdMoveCost, hasPurificationCost, isLoading, thirdMove, purified]);

  const displayedThirdMove = isLoading
    ? lastLoadedSnapshot.current.thirdMove
    : hasThirdMoveCost
      ? thirdMove
      : undefined;
  const displayedPurified = isLoading
    ? lastLoadedSnapshot.current.purified
    : hasPurificationCost
      ? purified
      : undefined;
  const showThirdMove = Boolean(displayedThirdMove);
  const showPurification = Boolean(displayedPurified);

  if (!showThirdMove && !showPurification) {
    return null;
  }

  return (
    <div
      className="tw-mt-5 tw-border-0 tw-border-t tw-border-solid tw-border-divider tw-pt-4"
      data-testid="pokemon-training-costs"
      aria-busy={isLoading}
      aria-label={isLoading ? 'Loading training costs' : undefined}
    >
      <h5 className="!tw-m-0 tw-mb-2 tw-text-body2 tw-font-semibold">Training costs</h5>
      <div
        className={`tw-grid tw-grid-cols-1 tw-gap-2 ${showThirdMove && showPurification ? 'sm:tw-grid-cols-2' : ''}`}
      >
        {displayedThirdMove && (
          <CostItem label="Second Charged Move" pokemonId={pokemonId} cost={displayedThirdMove} isLoading={isLoading} />
        )}
        {displayedPurified && (
          <CostItem label="Purification" pokemonId={pokemonId} cost={displayedPurified} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default TrainingCosts;
