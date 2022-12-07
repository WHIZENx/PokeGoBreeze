import React from 'react';
import styled from 'styled-components';

const Fill: any = styled.div`
  border: ${(props: any) => props.line}px solid ${(props: any) => props.color};
  border-radius: 50%;
  width: ${(props: any) => props.size}px;
  height: ${(props: any) => props.size}px;
  transition: 0.1s;
`;

const Circle = ({ line, color, size }: any) => {
  return <Fill line={line} color={color} size={size} />;
};

export default Circle;
