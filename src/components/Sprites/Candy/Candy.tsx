import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../util/compute';

import bgCandy from '../../../assets/bg_Candy.png';

import candy from '../../../data/pokemon_candy_color_data.json';
import { ICandy } from '../../../core/models/candy.model';
import { ICandyComponent } from '../../models/component.model';
import { toNumber } from '../../../util/extension';

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
  const [color, setColor] = useState<string>();
  const [bgColor, setBgColor] = useState<string>();

  useEffect(() => {
    const candyColor = computeCandyColor(candy as ICandy[], props.id);
    const candyBgColor = computeCandyBgColor(candy as ICandy[], props.id);
    setColor(candyColor);
    setBgColor(candyBgColor);
  }, [props.id]);

  return (
    <Background style={props.style} className={props.className} $candyBgColor={bgColor}>
      <Fill $candyColor={color} $size={props.size} />
    </Background>
  );
};

export default Candy;
