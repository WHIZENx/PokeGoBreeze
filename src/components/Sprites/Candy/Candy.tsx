import React from 'react';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../util/Compute';

import bgCandy from '../../../assets/bg_Candy.png';
import * as CandyModel from '../../../core/models/candy.model';

import candy from '../../../data/pokemon_candy_color_data.json';

const Background: any = styled.div`
  display: inline-block;
  background-color: ${(props: { candy: CandyModel.Candy[]; id: number | undefined }) => computeCandyBgColor(props.candy, props.id ?? 0)};
  border-radius: 50%;
  width: fit-content;
  height: fit-content;
`;

const Fill: any = styled.div`
  background: ${(props: { candy: CandyModel.Candy[]; id: number | undefined; size: number }) =>
    computeCandyColor(props.candy, props.id ?? 0)};
  width: ${(props) => props.size ?? 20}px;
  height: ${(props) => props.size ?? 20}px;
  mask: url(${bgCandy}) center/contain;
`;

const Candy = (props: { id: number | undefined; style?: React.CSSProperties; size?: number }) => {
  return (
    <Background style={props.style} id={props.id} candy={candy}>
      <Fill id={props.id} candy={candy as CandyModel.Candy[]} size={props.size} />
    </Background>
  );
};

export default Candy;
