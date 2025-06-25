import React from 'react';
import styled from 'styled-components';
import { IProgressBarComponent } from '../../models/component.model';
import { toNumber } from '../../../utils/extension';

interface Element {
  $height: number;
  $bgColor: string;
}

const Bar = styled.div<Element>`
  width: 100%;
  height: ${(props) => props.$height}px;
  background: ${(props) => props.$bgColor};
  position: relative;
  border-radius: 3px;
`;

const Fill = styled.div<Element>`
  position: absolute;
  height: ${(props) => props.$height}px;
  background: ${(props) => props.$bgColor};
  border-radius: 3px;
`;

const ProgressBar = (props: IProgressBarComponent) => {
  return (
    <Bar $height={props.height} $bgColor={props.bgColor}>
      <Fill
        $height={props.height}
        $bgColor={props.bgColor}
        style={{ width: `${(Math.max(1, toNumber(props.value)) * 100) / toNumber(props.maxValue, 1)}%` }}
      />
    </Bar>
  );
};

export default ProgressBar;
