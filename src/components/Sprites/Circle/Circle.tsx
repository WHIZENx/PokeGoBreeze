import React from 'react';
import styled from 'styled-components';

const Fill = styled.div`
  border: ${(props: { line: number; size: number; color: string }) => props.line}px solid ${(props: { color: string }) => props.color};
  border-radius: 50%;
  width: ${(props: { size: number }) => props.size}px;
  height: ${(props: { size: number }) => props.size}px;
  transition: 0.1s;
`;

const Circle = ({ line, color, size }: any) => {
  return <Fill line={line} color={color} size={size} />;
};

export default Circle;
