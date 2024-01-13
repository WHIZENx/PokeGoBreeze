import React, { Fragment } from 'react';
import styled from 'styled-components';

const Bar = styled.div`
  width: ${(props: { barCount: number; width: number; gap: number }) =>
    (props.width - props.gap * Math.max(1, props.barCount)) / props.barCount}px;
  margin-right: ${(props) => props.gap}px;
  height: 10px;
  transform: skew(-25deg);
  display: inline-block !important;
`;

const ChargedBar = (props: { barCount: number; color: string | undefined; width?: number; gap?: number }) => {
  const widthInit = props.width ?? 120;
  const gapInit = props.gap ?? 5;
  return (
    <Fragment>
      {[...Array(props.barCount).keys()].map((_, index) => (
        <Bar className={props.color} key={index} barCount={props.barCount} width={widthInit} gap={gapInit} />
      ))}
    </Fragment>
  );
};

export default ChargedBar;
