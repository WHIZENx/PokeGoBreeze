import React from 'react';
import styled from 'styled-components';
import { StatsModel } from '../../../core/models/stats.model';

const ComponentBar = styled.div`
  position: relative !important;
`;

const BoxText = styled.div`
  position: absolute !important;
  justify-content: ${(props: { isRank: boolean }) => (props.isRank ? 'flex-end' : 'flex-start')} !important;
  display: flex !important;
  width: 100% !important;
`;

const Bar = styled.div.attrs({
  role: 'progressbar',
  'aria-valuemin': 0,
  'aria-valuemax': 100,
})`
  width: ${(props: { statsPercent: number }) => props.statsPercent}%;
`;

const StatsBar = (props: {
  tag: string;
  class: string;
  statsPercent: number;
  rank: number | string;
  pokemonStats: StatsModel;
  currentStats: number;
  optionalStats?: string;
}) => {
  return (
    <ComponentBar className="progress">
      <BoxText className={`box-text stats-text`} isRank={false}>
        <span>
          {props.tag} {props.pokemonStats && (props.optionalStats ?? props.currentStats)}
        </span>
      </BoxText>
      <Bar className={`progress-bar ${props.class}`} aria-valuenow={props.statsPercent} statsPercent={props.statsPercent} />
      {props.pokemonStats && (
        <BoxText className={`box-text rank-text`} isRank={true}>
          <span>
            Rank: {props.rank} / {props.pokemonStats?.attack.max_rank}
          </span>
        </BoxText>
      )}
    </ComponentBar>
  );
};

export default StatsBar;