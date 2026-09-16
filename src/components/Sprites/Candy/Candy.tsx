import React from 'react';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../utils/compute';

import bgCandy from '../../../assets/bg_Candy.png';

import { ICandyComponent } from '../../models/component.model';
import { toNumber } from '../../../utils/extension';
import useCandy from '../../../composables/useCandy';

const DEFAULT_SIZE = 20;

interface Element {
  $candyColor?: string;
  $candyBgColor?: string;
  $size?: number;
}

const Background = styled.div<Element>`
  display: inline-block;
  background-color: ${(props) => props.$candyBgColor};
  border-radius: 50%;
  width: fit-content;
  height: fit-content;
`;

const Fill = styled.div<Element>`
  background: ${(props) => props.$candyColor};
  width: ${(props) => toNumber(props.$size, DEFAULT_SIZE)}px;
  height: ${(props) => toNumber(props.$size, DEFAULT_SIZE)}px;
  mask: url(${bgCandy}) center/contain;
  -webkit-mask: url(${bgCandy}) center/contain;
  -moz-mask: url(${bgCandy}) center/contain;
  -o-mask: url(${bgCandy}) center/contain;
  -ms-mask: url(${bgCandy}) center/contain;
`;

const Candy = (props: ICandyComponent) => {
  const { getCandyData } = useCandy();
  const candy = getCandyData(toNumber(props.id));
  const color = computeCandyColor(candy);
  const bgColor = computeCandyBgColor(candy);

  return (
    <Background style={props.style} className={props.className} $candyBgColor={bgColor}>
      <Fill $candyColor={color} $size={props.size} />
    </Background>
  );
};

export default Candy;
