import React from 'react';
import { useSelector, RootStateOrAny } from 'react-redux';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../util/Compute';

import bgCandyXL from '../../../assets/bg_CandyXL.png';

const Background: any = styled.div`
  position: absolute;
  background: ${(props: any) => computeCandyBgColor(props.candy, props.id)};
  clip-path: polygon(67% 17%, 75% 21%, 74% 66%, 19% 36%);
  width: ${(props: any) => props.size ?? 30}px;
  height: ${(props: any) => props.size ?? 30}px;
`;

const Fill: any = styled.div`
  background: ${(props: any) => computeCandyColor(props.candy, props.id)};
  width: ${(props: any) => props.size ?? 30}px;
  height: ${(props: any) => props.size ?? 30}px;
  mask: url(${bgCandyXL}) center/contain;
`;

const CandyXL = ({ id, style, size }: any) => {
  const candy = useSelector((state: RootStateOrAny) => state.store.data.candy);
  return (
    <div className="position-relative d-inline-block" style={style}>
      <Background id={id} candy={candy} size={size} />
      <Fill id={id} candy={candy} size={size} />
    </div>
  );
};

export default CandyXL;
