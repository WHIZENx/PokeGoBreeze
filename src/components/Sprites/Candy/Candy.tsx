import React from 'react';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../util/Compute';

import bgCandy from '../../../assets/bg_Candy.png';

import candy from '../../../data/pokemon_candy_color_data.json';
import { ICandy } from '../../../core/models/candy.model';
import { ICandyComponent } from '../../models/component.model';

const Background: any = styled.div`
  display: inline-block;
  background-color: ${(props: { candy: ICandy[]; id: number | undefined }) => computeCandyBgColor(props.candy, props.id ?? 0)};
  border-radius: 50%;
  width: fit-content;
  height: fit-content;
`;

const Fill: any = styled.div`
  background: ${(props: { candy: ICandy[]; id: number | undefined; size: number }) => computeCandyColor(props.candy, props.id ?? 0)};
  width: ${(props) => props.size ?? 20}px;
  height: ${(props) => props.size ?? 20}px;
  mask: url(${bgCandy}) center/contain;
`;

const Candy = (props: ICandyComponent) => {
  return (
    <Background style={props.style} id={props.id} candy={candy as ICandy[]}>
      <Fill id={props.id} candy={candy as ICandy[]} size={props.size} />
    </Background>
  );
};

export default Candy;
