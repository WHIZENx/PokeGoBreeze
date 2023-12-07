import React from 'react';
import styled from 'styled-components';

const Bar = styled.div`
  width: 100%;
  height: ${(props: { height: number; bgColor: string }) => props.height}px;
  background: ${(props: { bgColor: string }) => props.bgColor};
  position: relative;
  border-radius: 3px;
`;

const Fill = styled.div`
  position: absolute;
  height: ${(props: { height: number; color: string }) => props.height}px;
  background: ${(props: { color: string }) => props.color};
  border-radius: 3px;
`;

const ProgressBar = ({ height, value, maxValue, bgColor, color, style }: any) => {
  return (
    <Bar style={style} height={height} bgColor={bgColor}>
      <Fill style={{ width: `${(Math.max(1, value) * 100) / maxValue}%` }} height={height} color={color} />
    </Bar>
  );
};

export default ProgressBar;
