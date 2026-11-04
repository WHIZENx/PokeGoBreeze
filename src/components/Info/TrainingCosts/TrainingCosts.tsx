import React from 'react';
import type { PokemonTypeCost } from '../../../core/models/evolution.model';
import APIService from '../../../services/api.service';
import Candy from '../../Sprites/Candy/Candy';

interface TrainingCostsProps {
  pokemonId?: number;
  thirdMove?: PokemonTypeCost;
  purified?: PokemonTypeCost;
}

interface CostItemProps {
  label: string;
  pokemonId?: number;
  cost: CompletePokemonTypeCost;
}

type CompletePokemonTypeCost = PokemonTypeCost & {
  candy: number;
  stardust: number;
};

const hasCompleteCost = (cost?: PokemonTypeCost): cost is CompletePokemonTypeCost =>
  cost?.candy !== undefined && cost.stardust !== undefined;

const CostItem = ({ label, pokemonId, cost }: CostItemProps) => (
  <div className="tw-rounded-lg tw-border tw-border-solid tw-border-[var(--divider)] tw-bg-[var(--background-table-strip)] tw-p-3">
    <span className="tw-block tw-text-body2 tw-font-semibold">{label}</span>
    <div className="tw-mt-2 tw-flex tw-flex-wrap tw-gap-2">
      <span
        className="tw-inline-flex tw-min-h-8 tw-items-center tw-gap-1.5 tw-rounded-full tw-border tw-border-solid tw-border-[var(--divider)] tw-bg-[var(--background-paper)] tw-px-2.5 tw-py-1 tw-text-caption"
        aria-label={`${cost.candy.toLocaleString()} Candy`}
      >
        <Candy id={pokemonId} className="tw-h-5 tw-w-5" />
        <strong>{cost.candy.toLocaleString()}</strong>
        <span className="tw-text-[var(--text-secondary)]">Candy</span>
      </span>
      <span
        className="tw-inline-flex tw-min-h-8 tw-items-center tw-gap-1.5 tw-rounded-full tw-border tw-border-solid tw-border-[var(--divider)] tw-bg-[var(--background-paper)] tw-px-2.5 tw-py-1 tw-text-caption"
        aria-label={`${cost.stardust.toLocaleString()} Stardust`}
      >
        <img
          alt=""
          aria-hidden="true"
          className="tw-h-5 tw-w-5 tw-object-contain"
          src={APIService.getItemSprite('stardust_painted')}
        />
        <strong>{cost.stardust.toLocaleString()}</strong>
        <span className="tw-text-[var(--text-secondary)]">Stardust</span>
      </span>
    </div>
  </div>
);

const TrainingCosts = ({ pokemonId, thirdMove, purified }: TrainingCostsProps) => {
  const hasThirdMoveCost = hasCompleteCost(thirdMove);
  const hasPurificationCost = hasCompleteCost(purified);

  if (!hasThirdMoveCost && !hasPurificationCost) {
    return null;
  }

  return (
    <div
      className="tw-mt-5 tw-border-0 tw-border-t tw-border-solid tw-border-[var(--divider)] tw-pt-4"
      data-testid="pokemon-training-costs"
    >
      <h5 className="!tw-m-0 tw-mb-2 tw-text-body2 tw-font-semibold">Training costs</h5>
      <div
        className={`tw-grid tw-grid-cols-1 tw-gap-2 ${hasThirdMoveCost && hasPurificationCost ? 'sm:tw-grid-cols-2' : ''}`}
      >
        {hasThirdMoveCost && <CostItem label="Second Charged Move" pokemonId={pokemonId} cost={thirdMove} />}
        {hasPurificationCost && <CostItem label="Purification" pokemonId={pokemonId} cost={purified} />}
      </div>
    </div>
  );
};

export default TrainingCosts;
