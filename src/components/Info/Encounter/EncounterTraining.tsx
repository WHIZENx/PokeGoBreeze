import React from 'react';
import { Skeleton } from '@mui/material';
import type { PokemonEncounterSummary } from '../../../core/models/API/pokemon-bundle.model';
import { combineClasses } from '../../../utils/extension';

interface EncounterTrainingProps {
  summary?: PokemonEncounterSummary;
  isLoading: boolean;
}

interface CpTileProps {
  label: string;
  level: number;
  value?: string;
  compact?: boolean;
  isLoading?: boolean;
}

const cpTileClassName = (compact: boolean) =>
  combineClasses(
    'tw-flex tw-min-w-0 tw-flex-col tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-solid tw-border-[var(--divider)] tw-bg-[var(--background-table-strip)] tw-px-2 tw-text-center',
    compact ? 'tw-min-h-16 tw-py-2' : 'tw-min-h-20 tw-py-3'
  );

const CpTile = ({ label, level, value, compact = false, isLoading = false }: CpTileProps) => (
  <div className={cpTileClassName(compact)}>
    <span className="tw-text-caption tw-text-[var(--text-secondary)]">{label}</span>
    <strong className={combineClasses('tw-block tw-text-primary', compact ? 'tw-text-body2' : 'tw-text-body1')}>
      {isLoading ? (
        <span className="tw-relative tw-inline-block tw-w-16" aria-hidden="true">
          <span className="tw-invisible">0</span>
          <Skeleton data-skeleton-surface="page" variant="text" animation="wave" className="!tw-absolute !tw-inset-0" />
        </span>
      ) : (
        (value ?? '—')
      )}
    </strong>
    <span className="tw-text-caption tw-text-[var(--text-secondary)]">Lv. {level}</span>
  </div>
);

const StatusPill = ({
  label,
  value,
  isLoading = false,
}: {
  label: string;
  value: boolean | undefined;
  isLoading?: boolean;
}) => {
  const state = value === undefined ? 'Unknown' : value ? 'Available' : 'Not available';
  return (
    <span
      className="tw-inline-flex tw-min-h-8 tw-items-center tw-gap-1.5 tw-rounded-full tw-border tw-border-solid tw-border-[var(--divider)] tw-bg-[var(--background-table-strip)] tw-px-2.5 tw-py-1 tw-text-caption"
      aria-label={`${label}: ${state}`}
    >
      {isLoading ? (
        <Skeleton
          data-skeleton-surface="page"
          variant="circular"
          animation="wave"
          width={16}
          height={16}
          aria-hidden="true"
        />
      ) : (
        <span
          className={combineClasses(
            'tw-flex tw-h-4 tw-w-4 tw-items-center tw-justify-center tw-rounded-full tw-font-bold tw-text-white',
            value === undefined ? 'tw-bg-[var(--text-secondary)]' : value ? 'tw-bg-success' : 'tw-bg-error'
          )}
          aria-hidden="true"
        >
          {value === undefined ? '?' : value ? '✓' : '×'}
        </span>
      )}
      <span>{label}</span>
    </span>
  );
};

const RatePill = ({
  label,
  value,
  isLoading = false,
}: {
  label: string;
  value: number | undefined;
  isLoading?: boolean;
}) => (
  <span className="tw-inline-flex tw-min-h-8 tw-items-center tw-gap-1.5 tw-rounded-full tw-border tw-border-solid tw-border-[var(--divider)] tw-bg-[var(--background-table-strip)] tw-px-2.5 tw-py-1 tw-text-caption">
    <span className="tw-text-[var(--text-secondary)]">{label}</span>
    <strong className="tw-relative tw-inline-block tw-w-10 tw-text-right">
      {isLoading ? (
        <>
          <span className="tw-invisible" aria-hidden="true">
            0%
          </span>
          <Skeleton data-skeleton-surface="page" variant="text" animation="wave" className="!tw-absolute !tw-inset-0" />
        </>
      ) : value === undefined ? (
        '—'
      ) : (
        `${Number((value * 100).toFixed(1))}%`
      )}
    </strong>
  </span>
);

const EncounterTraining = ({ summary, isLoading }: EncounterTrainingProps) => {
  const cp = summary?.cp;
  const encounter = summary?.encounter;
  const flags = summary?.availability;
  return (
    <div
      className="tw-grid tw-gap-4"
      data-testid="encounter-training-content"
      aria-label={isLoading ? 'Loading CP and availability data' : undefined}
      aria-busy={isLoading}
    >
      <div>
        <h5 className="!tw-m-0 tw-mb-2 tw-text-body2 tw-font-semibold">Catch CP</h5>
        <div className="tw-grid tw-grid-cols-3 tw-gap-2">
          <CpTile
            label="Research"
            level={15}
            isLoading={isLoading}
            value={cp?.research ? `${cp.research.min.toLocaleString()}–${cp.research.max.toLocaleString()}` : undefined}
          />
          <CpTile
            label="Raid / Egg"
            level={20}
            isLoading={isLoading}
            value={
              cp?.raidOrEgg ? `${cp.raidOrEgg.min.toLocaleString()}–${cp.raidOrEgg.max.toLocaleString()}` : undefined
            }
          />
          <CpTile
            label="Weather Boost"
            level={25}
            isLoading={isLoading}
            value={
              cp?.weatherBoost
                ? `${cp.weatherBoost.min.toLocaleString()}–${cp.weatherBoost.max.toLocaleString()}`
                : undefined
            }
          />
        </div>
      </div>
      <div>
        <h5 className="!tw-m-0 tw-mb-2 tw-text-body2 tw-font-semibold">Power-up CP</h5>
        <div className="tw-grid tw-grid-cols-3 tw-gap-2">
          <CpTile compact label="Max" level={40} isLoading={isLoading} value={cp?.level40?.max.toLocaleString()} />
          <CpTile compact label="Max" level={50} isLoading={isLoading} value={cp?.level50?.max.toLocaleString()} />
          <CpTile
            compact
            label="Best Buddy"
            level={51}
            isLoading={isLoading}
            value={cp?.bestBuddy?.max.toLocaleString()}
          />
        </div>
      </div>
      <div>
        <h5 className="!tw-m-0 tw-mb-2 tw-text-body2 tw-font-semibold">Base rates &amp; availability</h5>
        <div className="tw-flex tw-flex-wrap tw-gap-2">
          <RatePill label="Catch" value={encounter?.baseCaptureRate} isLoading={isLoading} />
          <RatePill label="Flee" value={encounter?.baseFleeRate} isLoading={isLoading} />
          <StatusPill label="Trade" value={flags?.tradable} isLoading={isLoading} />
          <StatusPill label="Pokémon HOME" value={flags?.pokemonHome} isLoading={isLoading} />
          <StatusPill label="Gym" value={flags?.deployable} isLoading={isLoading} />
          <StatusPill label="Shadow form" value={flags?.shadowAvailable} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default EncounterTraining;
