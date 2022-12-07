import React from 'react';
import styled from 'styled-components';

const Bar: any = styled.div`
  width: 100%;
  height: ${(props: any) => props.height}px;
  background: ${(props: any) => props.bgColor};
  position: relative;
  border-radius: 3px;
`;

const Fill: any = styled.div`
  position: absolute;
  width: ${(props: any) => (props.value * 100) / props.maxValue}%;
  height: ${(props: any) => props.height}px;
  background: ${(props: any) => props.color};
  border-radius: 3px;
`;

const ProgressBar = ({ height, value, maxValue, bgColor, color, style }: any) => {
  return (
    <Bar style={style} height={height} bgColor={bgColor}>
      <Fill height={height} value={value} maxValue={maxValue} color={color} />
    </Bar>
  );
};

export default ProgressBar;
