import React from 'react';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../util/compute';

import bgCandyXL from '../../../assets/bg_CandyXL.png';

import candy from '../../../data/pokemon_candy_color_data.json';
import { ICandy } from '../../../core/models/candy.model';
import { ICandyComponent } from '../../models/component.model';
import { getValueOrDefault } from '../../../util/models/util.model';

interface Element {
  candy: ICandy[];
  candyId: number;
  size?: number;
}

const Background = styled.div<Element>`
  position: absolute;
  background: ${(props) => computeCandyBgColor(props.candy, props.candyId)};
  clip-path: polygon(67% 17%, 75% 21%, 74% 66%, 19% 36%);
  width: ${(props) => props.size ?? 30}px;
  height: ${(props) => props.size ?? 30}px;
`;

const Fill = styled.div<Element>`
  background: ${(props) => computeCandyColor(props.candy, props.candyId)};
  width: ${(props) => props.size ?? 30}px;
  height: ${(props) => props.size ?? 30}px;
  mask: url(${bgCandyXL}) center/contain;
`;

const CandyXL = (props: ICandyComponent) => {
  return (
    <div className="position-relative d-inline-block" style={props.style}>
      <Background candyId={getValueOrDefault(Number, props.id)} candy={candy as ICandy[]} size={props.size} />
      <Fill candyId={getValueOrDefault(Number, props.id)} candy={candy as ICandy[]} size={props.size} />
    </div>
  );
};

export default CandyXL;
