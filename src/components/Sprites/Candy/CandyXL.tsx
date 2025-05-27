import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { computeCandyBgColor, computeCandyColor } from '../../../util/compute';

import bgCandyXL from '../../../assets/bg_CandyXL.png';

import candy from '../../../data/pokemon_candy_color_data.json';
import { ICandy } from '../../../core/models/candy.model';
import { ICandyComponent } from '../../models/component.model';
import { combineClasses, toNumber } from '../../../util/extension';

const DEFAULT_SIZE = 30;

interface Element {
  candyColor?: string;
  candyBgColor?: string;
  size?: number;
}

const Background = styled.div<Element>`
  position: absolute;
  background: ${(props) => props.candyBgColor};
  clip-path: polygon(67% 17%, 75% 21%, 74% 66%, 19% 36%);
  width: ${(props) => toNumber(props.size, DEFAULT_SIZE)}px;
  height: ${(props) => toNumber(props.size, DEFAULT_SIZE)}px;
`;

const Fill = styled.div<Element>`
  background: ${(props) => props.candyColor};
  width: ${(props) => toNumber(props.size, DEFAULT_SIZE)}px;
  height: ${(props) => toNumber(props.size, DEFAULT_SIZE)}px;
  mask: url(${bgCandyXL}) center/contain;
`;

const CandyXL = (props: ICandyComponent) => {
  const [color, setColor] = useState<string>();
  const [bgColor, setBgColor] = useState<string>();

  useEffect(() => {
    const candyColor = computeCandyColor(candy as ICandy[], props.id);
    const candyBgColor = computeCandyBgColor(candy as ICandy[], props.id);
    setColor(candyColor);
    setBgColor(candyBgColor);
  }, [props.id]);

  return (
    <div className={combineClasses('position-relative d-inline-block', props.className)} style={props.style}>
      <Background candyBgColor={bgColor} size={props.size} />
      <Fill candyColor={color} size={props.size} />
    </div>
  );
};

export default CandyXL;
