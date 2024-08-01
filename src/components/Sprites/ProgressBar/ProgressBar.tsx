import React from 'react';
import styled from 'styled-components';
import { IProgressBarComponent } from '../../models/component.model';

const Bar = styled.div`
  width: 100%;
  height: ${(props: { height: number; bgColor: string }) => props.height}px;
  background: ${(props) => props.bgColor};
  position: relative;
  border-radius: 3px;
`;

const Fill = styled.div`
  position: absolute;
  height: ${(props: { height: number; color: string }) => props.height}px;
  background: ${(props) => props.color};
  border-radius: 3px;
`;

const ProgressBar = (props: IProgressBarComponent) => {
  return (
    <Bar style={props.style} height={props.height} bgColor={props.bgColor}>
      <Fill style={{ width: `${(Math.max(1, props.value ?? 0) * 100) / props.maxValue}%` }} height={props.height} color={props.color} />
    </Bar>
  );
};

export default ProgressBar;
