import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../util/Compute';

import bgCandyXL from '../../../assets/bg_CandyXL.png';
import { StoreState } from '../../../store/models/state.model';
import * as CandyModel from '../../../core/models/candy.model';

const Background: any = styled.div`
  position: absolute;
  background: ${(props: { candy: CandyModel.Candy[]; id: number | undefined; size: number }) =>
    computeCandyBgColor(props.candy, props.id ?? 0)};
  clip-path: polygon(67% 17%, 75% 21%, 74% 66%, 19% 36%);
  width: ${(props) => props.size ?? 30}px;
  height: ${(props) => props.size ?? 30}px;
`;

const Fill: any = styled.div`
  background: ${(props: { candy: CandyModel.Candy[]; id: number | undefined; size: number }) =>
    computeCandyColor(props.candy, props.id ?? 0)};
  width: ${(props) => props.size ?? 30}px;
  height: ${(props) => props.size ?? 30}px;
  mask: url(${bgCandyXL}) center/contain;
`;

const CandyXL = (props: { id: number | undefined; style?: React.CSSProperties; size?: number }) => {
  const candy = useSelector((state: StoreState) => state.store.data?.candy);
  return (
    <div className="position-relative d-inline-block" style={props.style}>
      <Background id={props.id} candy={candy} size={props.size} />
      <Fill id={props.id} candy={candy} size={props.size} />
    </div>
  );
};

export default CandyXL;
