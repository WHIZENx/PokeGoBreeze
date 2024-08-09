import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FORM_NORMAL } from '../../../util/Constants';
import { IStatsBarComponent } from '../../models/component.model';

interface Element {
  isRank?: boolean;
  statsPercent?: number;
}

const ComponentBar = styled.div<Element>`
  position: relative !important;
`;

const BoxText = styled.div<Element>`
  position: absolute !important;
  justify-content: ${(props) => (props.isRank ? 'flex-end' : 'flex-start')} !important;
  display: flex !important;
  width: 100% !important;
`;

const Bar = styled.div.attrs({
  role: 'progressbar',
  'aria-valuemin': 0,
  'aria-valuemax': 100,
})<Element>`
  width: ${(props) => props.statsPercent}%;
`;

const StatsBar = (props: IStatsBarComponent) => {
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
            Rank: {props.rank} / {props.pokemonStats?.attack.maxRank}
          </span>
        </BoxText>
      )}
    </ComponentBar>
  );
};

export default StatsBar;
