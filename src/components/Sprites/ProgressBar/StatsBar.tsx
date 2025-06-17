import React from 'react';
import styled from 'styled-components';
import { IStatsBarComponent } from '../../models/component.model';
import { combineClasses, getValueOrDefault, isUndefined } from '../../../util/extension';
import { generateParamForm } from '../../../util/utils';
import { Params } from '../../../util/constants';
import { useNavigateToTop } from '../../../util/hooks/LinkToTop';

interface Element {
  $isRank?: boolean;
  $statsPercent?: number;
}

const ComponentBar = styled.div<Element>`
  position: relative !important;
`;

const BoxText = styled.div<Element>`
  position: absolute !important;
  justify-content: ${(props) => (props.$isRank ? 'flex-end' : 'flex-start')} !important;
  display: flex !important;
  width: 100% !important;
`;

const Bar = styled.div.attrs({
  role: 'progressbar',
  'aria-valuemin': 0,
  'aria-valuemax': 100,
})<Element>`
  width: ${(props) => props.$statsPercent}%;
`;

const StatsBar = (props: IStatsBarComponent) => {
  const navigateToTop = useNavigateToTop();
  return (
    <ComponentBar
      className={combineClasses('progress', props.isDisabled ? '' : 'progress-hover')}
      onClick={() =>
        !props.isDisabled &&
        navigateToTop(
          `/stats-ranking?${Params.Id}=${props.id}${generateParamForm(props.form, props.pokemonType, '&')}&${
            Params.StatsType
          }=${props.statType}`
        )
      }
    >
      <BoxText className="box-text stats-text">
        <span>
          {props.tag}{' '}
          {props.pokemonStatsRank && getValueOrDefault(String, props.optionalStats, props.currentStats.toString())}
        </span>
      </BoxText>
      <Bar
        className={combineClasses('progress-bar', props.class)}
        aria-valuenow={props.statsPercent}
        $statsPercent={props.statsPercent}
      />
      {props.pokemonStatsRank && !isUndefined(props.rank) && (
        <BoxText className="box-text rank-text" $isRank={true}>
          <span>
            Rank: {props.rank} / {props.pokemonStatsRank.maxRank}
          </span>
        </BoxText>
      )}
    </ComponentBar>
  );
};

export default StatsBar;
