import React from 'react';
import styled from 'styled-components';
import { ICircleComponent } from '../../models/component.model';

interface Element {
  line: number;
  size: number;
  color: string;
}

const Fill = styled.div<Element>`
  border: ${(props) => props.line}px solid ${(props) => props.color};
  border-radius: 50%;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  transition: 0.1s;
`;

const Circle = (props: ICircleComponent) => {
  return <Fill line={props.line} color={props.color} size={props.size} />;
};

export default Circle;
