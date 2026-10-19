import React, { useEffect, useState } from 'react';
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
  const [progress, setProgress] = useState(0);

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
    statsPercent,
    ...progressProps
  } = props;

  useEffect(() => {
    setProgress(statsPercent);
  }, [statsPercent]);

  const isNavigationDisabled = isStatsRankingNavigationDisabled(isDisabled, rank, Boolean(pokemonStatsRank));

  return (
    <Box
      aria-disabled={isNavigationDisabled}
      className={combineClasses('tw-w-full tw-relative progress', !isNavigationDisabled && 'progress-hover')}
      data-stat-tag={tag}
      data-stat-value={currentStats}
      data-testid="pokemon-stat-bar"
      onClick={
        isNavigationDisabled
          ? undefined
          : () =>
              navigateToTop(
                `/stats-ranking?${Params.Id}=${id}${generateParamForm(form, pokemonType, '&')}&${
                  Params.StatsType
                }=${statType}`
              )
      }
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
      <LinearProgress className="!tw-h-7.5 tw-rounded-md" variant={variant} value={progress} {...progressProps} />
    </Box>
  );
};

export default StatBar;
