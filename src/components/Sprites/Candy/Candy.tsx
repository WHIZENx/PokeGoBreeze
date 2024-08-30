import React from 'react';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../util/compute';

import bgCandy from '../../../assets/bg_Candy.png';

import candy from '../../../data/pokemon_candy_color_data.json';
import { ICandy } from '../../../core/models/candy.model';
import { ICandyComponent } from '../../models/component.model';

const DEFAULT_SIZE = 20;

interface Element {
  candy: ICandy[];
  candyId: number;
  size?: number;
}

const Background = styled.div<Element>`
  display: inline-block;
  background-color: ${(props) => computeCandyBgColor(props.candy, props.candyId)};
  border-radius: 50%;
  width: fit-content;
  height: fit-content;
`;

const Fill = styled.div<Element>`
  background: ${(props) => computeCandyColor(props.candy, props.candyId)};
  width: ${(props) => props.size ?? DEFAULT_SIZE}px;
  height: ${(props) => props.size ?? DEFAULT_SIZE}px;
  mask: url(${bgCandy}) center/contain;
`;

const Candy = (props: ICandyComponent) => {
  return (
    <Background style={props.style} candyId={props.id ?? 0} candy={candy as ICandy[]}>
      <Fill candyId={props.id ?? 0} candy={candy as ICandy[]} size={props.size} />
    </Background>
  );
};

export default Candy;
