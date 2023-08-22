import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../util/Compute';

import bgCandy from '../../../assets/bg_Candy.png';
import { StoreState } from '../../../store/models/state.model';
import * as CandyModel from '../../../core/models/candy.model';

const Background: any = styled.div`
  display: inline-block;
  background-color: ${(props: { candy: CandyModel.Candy[]; id: number }) => computeCandyBgColor(props.candy, props.id)};
  border-radius: 50%;
  width: fit-content;
  height: fit-content;
`;

const Fill: any = styled.div`
  background: ${(props: { candy: CandyModel.Candy[]; id: number; size: number }) => computeCandyColor(props.candy, props.id)};
  width: ${(props: { size: number }) => props.size ?? 20}px;
  height: ${(props: { size: number }) => props.size ?? 20}px;
  mask: url(${bgCandy}) center/contain;
`;

const Candy = ({ id, style, size }: any) => {
  const candy = useSelector((state: StoreState) => state.store.data?.candy);
  return (
    <Background style={style} id={id} candy={candy}>
      <Fill id={id} candy={candy} size={size} />
    </Background>
  );
};

export default Candy;
