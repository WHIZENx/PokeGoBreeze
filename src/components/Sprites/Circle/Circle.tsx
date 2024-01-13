import React from 'react';
import styled from 'styled-components';

const Fill = styled.div`
  border: ${(props: { line: number; size: number; color: string }) => props.line}px solid ${(props: { color: string }) => props.color};
  border-radius: 50%;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  transition: 0.1s;
`;

const Circle = (props: { line: number; size: number; color: string }) => {
  return <Fill line={props.line} color={props.color} size={props.size} />;
};

export default Circle;
