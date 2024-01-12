import React from 'react';
import styled from 'styled-components';
import APIService from '../../../services/API.service';

const Circle = styled.div`
  width: ${(props: { size: number }) => props.size + 5}px;
  height: ${(props: { size: number }) => props.size + 5}px;
  background: #0000003b;
  border-radius: 50%;
  border: 5px solid lightgray;
  position: relative;
`;

const Fill = styled.div`
  position: absolute;
  border-radius: 50%;
  width: ${(props: { size: number }) => props.size}px;
  height: ${(props: { size: number }) => props.size}px;
  clip: rect(
    ${(props: { energy: number; moveEnergy: number; size: number }) => props.size - (props.energy * props.size) / props.moveEnergy}px,
    ${(props: { size: number }) => props.size}px,
    ${(props: { size: number }) => props.size}px,
    0px
  );
  filter: brightness(${(props: { energy: number; moveEnergy: number; size: number; brightness: number }) => props.brightness});
  transition: 0.1s;
`;

const Icon = styled.div`
  width: ${(props: { size: number }) => props.size / 2}px;
  height: ${(props: { size: number }) => props.size / 2}px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  mask: url(${(props: { size: number; url: string }) => props.url}) center/contain;
  background: #ffffff75;
`;

const IconFill = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${(props: { size: number }) => props.size / 2}px;
  height: ${(props: { size: number }) => props.size / 2}px;
  transform: translate(-50%, -50%);
  clip: rect(
    ${(props: { energy: number; moveEnergy: number; size: number }) =>
      props.size / 2 +
      (props.size - props.size / 2) / 2 -
      (props.energy * (props.size / 2 + (props.size - props.size / 2))) / props.moveEnergy}px,
    ${(props: { size: number }) => props.size / 2}px,
    ${(props: { size: number }) => props.size / 2}px,
    0px
  );
  mask: url(${(props: { energy: number; moveEnergy: number; size: number; url: string }) => props.url}) center/contain;
  background: white;
  transition: 0.1s;
`;

const CircleBar = (props: {
  text: string;
  type: string | null | undefined;
  size: number;
  moveEnergy: number;
  energy: number;
  maxEnergy: number;
  disable: boolean | undefined;
}) => {
  const energy = Math.min(props.energy, props.maxEnergy);
  const fillCount = Math.min(Math.ceil(props.maxEnergy / props.moveEnergy), 3);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-between"
      style={{ rowGap: 10, color: props.disable ? ' red' : 'black' }}
    >
      {props.text && (
        <span className="text-center">
          <b>{props.text}</b>
        </span>
      )}
      <Circle size={props.size}>
        {[...Array(fillCount).keys()].map((index) => (
          <Fill
            key={index}
            className={props.type?.toLowerCase()}
            size={props.size - 5}
            moveEnergy={props.moveEnergy}
            energy={energy - props.moveEnergy * index}
            brightness={1 - index * 0.1}
          />
        ))}
        <Icon size={props.size - 5} url={APIService.getTypeIcon(props.type ?? '')} />
        <IconFill size={props.size - 5} energy={energy} moveEnergy={props.moveEnergy} url={APIService.getTypeIcon(props.type ?? '')} />
      </Circle>
    </div>
  );
};

export default CircleBar;
