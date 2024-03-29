import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../util/Compute';

import bgCandy from '../../../assets/bg_Candy.png';
import { StoreState } from '../../../store/models/state.model';
import * as CandyModel from '../../../core/models/candy.model';

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
  const candy = useSelector((state: StoreState) => state.store.data?.candy);
  return (
    <Background style={props.style} id={props.id} candy={candy}>
      <Fill id={props.id} candy={candy} size={props.size} />
    </Background>
  );
};

export default Candy;
