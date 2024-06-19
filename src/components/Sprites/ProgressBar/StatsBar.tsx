import React from 'react';
import styled from 'styled-components';
import { StatsModel } from '../../../core/models/stats.model';
import { useNavigate } from 'react-router-dom';
import { FORM_NORMAL } from '../../../util/Constants';

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
  pokemonStats: StatsModel | null;
  currentStats: number;
  optionalStats?: string;
  id?: number;
  form?: string;
  statType?: string;
}) => {
  const navigate = useNavigate();
  return (
    <ComponentBar
      className="progress"
      onClick={() =>
        navigate(`/stats-ranking?id=${props.id}&form=${(props.form ?? '').replace(FORM_NORMAL, '').replaceAll('_', '-').toLowerCase()}`, {
          state: { stats: (props.statType ?? '').toLowerCase() },
        })
      }
    >
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
