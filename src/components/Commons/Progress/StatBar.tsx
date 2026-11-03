import React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { IStatBarComponent } from '../models/component.model';
import { combineClasses, getValueOrDefault, isUndefined } from '../../../utils/extension';
import { generateParamForm } from '../../../utils/utils';
import { Params } from '../../../utils/constants';
import { useNavigateToTop } from '../../Link/LinkToTop';
import { isStatsRankingNavigationDisabled } from './stat-bar-navigation';

const StatBar = (props: IStatBarComponent) => {
  const navigateToTop = useNavigateToTop();

  const {
    variant = 'determinate',
    tag,
    optionalStats,
    pokemonStatsRank,
    currentStats,
    rank,
    statType,
    id,
    form,
    pokemonType,
    isDisabled,
    isLoading,
    statsPercent,
    onStatSelect,
    ...progressProps
  } = props;

  const isNavigationDisabled =
    isLoading || isStatsRankingNavigationDisabled(isDisabled, rank, Boolean(pokemonStatsRank));
  const selectStatRanking = () => {
    if (onStatSelect) {
      onStatSelect(statType);
      return;
    }
    navigateToTop(
      `/stats-ranking?${Params.Id}=${id}${generateParamForm(form, pokemonType, '&')}&${Params.StatsType}=${statType}`
    );
  };

  return (
    <Box
      aria-disabled={isNavigationDisabled}
      aria-busy={isLoading}
      className={combineClasses(
        'tw-w-full tw-relative progress',
        isLoading && 'progress-loading',
        !isNavigationDisabled && 'progress-hover'
      )}
      data-stat-tag={tag}
      data-stat-value={currentStats}
      data-stat-percent={statsPercent}
      data-stat-loading={isLoading || undefined}
      data-testid="pokemon-stat-bar"
      onClick={isNavigationDisabled ? undefined : selectStatRanking}
      onKeyDown={
        isNavigationDisabled
          ? undefined
          : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectStatRanking();
              }
            }
      }
      role={isNavigationDisabled ? undefined : 'button'}
      tabIndex={isNavigationDisabled ? undefined : 0}
    >
      <div className="tw-absolute box-text stats-text tw-z-2 tw-flex tw-justify-start tw-w-full">
        <span className="tw-text-extra-small">
          {tag} {pokemonStatsRank && getValueOrDefault(String, optionalStats, currentStats.toString())}
        </span>
      </div>
      {pokemonStatsRank && !isUndefined(rank) && (
        <div className="tw-absolute tw-z-2 tw-flex tw-w-full box-text rank-text tw-justify-end">
          <span className="tw-text-extra-small">
            Rank: {rank} / {pokemonStatsRank.maxRank}
          </span>
        </div>
      )}
      <LinearProgress
        className="pokemon-stat-progress"
        data-testid="pokemon-stat-progress"
        variant={variant}
        value={statsPercent}
        {...progressProps}
      />
    </Box>
  );
};

export default StatBar;
