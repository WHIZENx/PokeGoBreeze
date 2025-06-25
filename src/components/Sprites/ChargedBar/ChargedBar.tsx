import React, { Fragment } from 'react';
import styled from 'styled-components';
import { IChargedBarComponent } from '../../models/component.model';

interface Element {
  $barCount: number;
  $width: number;
  $gap: number;
}

const Bar = styled.div<Element>`
  width: ${(props) => (props.$width - props.$gap * Math.max(1, props.$barCount)) / props.$barCount}px;
  margin-right: ${(props) => props.$gap}px;
  height: 10px;
  transform: skew(-25deg);
  display: inline-block !important;
`;

const ChargedBar = (props: IChargedBarComponent) => {
  return (
    <Fragment>
      {[...Array(props.barCount).keys()].map((_, index) => (
        <Bar
          className={props.color}
          key={index}
          $barCount={props.barCount}
          $width={props.width ?? 120}
          $gap={props.gap ?? 5}
        />
      ))}
    </Fragment>
  );
};

export default ChargedBar;
