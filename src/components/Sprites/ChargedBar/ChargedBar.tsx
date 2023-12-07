import React, { Fragment } from 'react';
import styled from 'styled-components';

const Bar = styled.div`
  width: ${(props: { barCount: number; width: number; gap: number }) =>
    (props.width - props.gap * Math.max(1, props.barCount)) / props.barCount}px;
  margin-right: ${(props: { gap: number }) => props.gap}px;
  height: 10px;
  transform: skew(-25deg);
  display: inline-block !important;
`;

const ChargedBar = ({ barCount, color, width, gap }: any) => {
  const widthInit = width ?? 120;
  const gapInit = gap ?? 5;
  return (
    <Fragment>
      {[...Array(barCount).keys()].map((_, index) => (
        <Bar className={color} key={index} barCount={barCount} width={widthInit} gap={gapInit} />
      ))}
    </Fragment>
  );
};

export default ChargedBar;
