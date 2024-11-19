import React from 'react';
import styled from 'styled-components';
import { IProgressBarComponent } from '../../models/component.model';
import { toNumber } from '../../../util/extension';

interface Element {
  height: number;
  bgColor: string;
}

const Bar = styled.div<Element>`
  width: 100%;
  height: ${(props) => props.height}px;
  background: ${(props) => props.bgColor};
  position: relative;
  border-radius: 3px;
`;

const Fill = styled.div<Element>`
  position: absolute;
  height: ${(props) => props.height}px;
  background: ${(props) => props.bgColor};
  border-radius: 3px;
`;

const ProgressBar = (props: IProgressBarComponent) => {
  return (
    <Bar style={props.style} height={props.height} bgColor={props.bgColor}>
      <Fill
        style={{ width: `${(Math.max(1, toNumber(props.value)) * 100) / toNumber(props.maxValue, 1)}%` }}
        height={props.height}
        bgColor={props.color}
      />
    </Bar>
  );
};

export default ProgressBar;
