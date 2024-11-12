import React from 'react';
import styled from 'styled-components';
import APIService from '../../../services/API.service';
import { ICircleBarComponent } from '../../models/component.model';
import { toNumber } from '../../../util/extension';

interface Element {
  energy?: number;
  moveEnergy?: number;
  size: number;
  brightness?: number;
  url?: string;
}

const Circle = styled.div<Element>`
  width: ${(props) => props.size + 5}px;
  height: ${(props) => props.size + 5}px;
  background: #0000003b;
  border-radius: 50%;
  border: 5px solid lightgray;
  position: relative;
`;

const Fill = styled.div<Element>`
  position: absolute;
  border-radius: 50%;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  clip: rect(
    ${(props) => props.size - (toNumber(props.energy) * props.size) / toNumber(props.moveEnergy)}px,
    ${(props) => props.size}px,
    ${(props) => props.size}px,
    0px
  );
  filter: brightness(${(props) => props.brightness});
  transition: 0.1s;
`;

const Icon = styled.div<Element>`
  width: ${(props) => props.size / 2}px;
  height: ${(props) => props.size / 2}px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  mask: url(${(props) => props.url}) center/contain;
  background: #ffffff75;
`;

const IconFill = styled.div<Element>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${(props) => props.size / 2}px;
  height: ${(props) => props.size / 2}px;
  transform: translate(-50%, -50%);
  clip: rect(
    ${(props) =>
      props.size / 2 +
      (props.size - props.size / 2) / 2 -
      (toNumber(props.energy) * (props.size / 2 + (props.size - props.size / 2))) / toNumber(props.moveEnergy)}px,
    ${(props) => props.size / 2}px,
    ${(props) => props.size / 2}px,
    0px
  );
  mask: url(${(props) => props.url}) center/contain;
  background: white;
  transition: 0.1s;
`;

const CircleBar = (props: ICircleBarComponent) => {
  const energy = Math.min(props.energy, props.maxEnergy);
  const fillCount = Math.min(Math.ceil(props.maxEnergy / props.moveEnergy), 3);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-between"
      style={{ rowGap: 10, color: props.isDisable ? 'red' : 'black' }}
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
        <Icon size={props.size - 5} url={APIService.getTypeIcon(props.type)} />
        <IconFill size={props.size - 5} energy={energy} moveEnergy={props.moveEnergy} url={APIService.getTypeIcon(props.type)} />
      </Circle>
    </div>
  );
};

export default CircleBar;
