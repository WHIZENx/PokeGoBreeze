import React from 'react';
import styled, { keyframes } from 'styled-components';
import { IHpBarComponent } from '../../models/component.model';

interface Element {
  hp?: number;
  maxHp?: number;
  height: number;
  color?: string;
  dmg?: number;
}

const Bar = styled.div<Element>`
  width: 100%;
  height: ${(props) => props.height}px;
  background: #00000024;
  border: 2px ridge lightgray;
  position: relative;
`;

const Fill = styled.div<Element>`
  position: absolute;
  width: ${(props) => ((props.hp ?? 0) * 100) / (props.maxHp ?? 0)}%;
  height: ${(props) => props.height - 4}px;
  background: ${(props) => props.color};
  transition: 0.1s;
`;

const anim = keyframes`
    to { visibility: hidden; }
`;

const FillDmg = styled.div<Element>`
  position: absolute;
  width: ${(props) => ((props.dmg ?? 0) * 100) / (props.maxHp ?? 0)}%;
  height: ${(props) => props.height - 4}px;
  background: ${(props) => props.color};
  left: ${(props) => ((props.hp ?? 0) * 100) / (props.maxHp ?? 0)}%;
  animation: 1s ${anim};
  animation-fill-mode: forwards;
`;

const HpBar = (props: IHpBarComponent) => {
  return (
    <div className="d-flex align-items-center w-100" style={{ columnGap: 5 }}>
      {props.text && (
        <span>
          <b>{props.text}</b>
        </span>
      )}
      <Bar height={props.height}>
        <Fill
          height={props.height}
          hp={props.hp}
          maxHp={props.maxHp}
          color={props.hp / props.maxHp > 0.5 ? 'lightgreen' : props.hp / props.maxHp > 0.25 ? 'yellow' : 'red'}
        />
        {props.dmg && <FillDmg height={props.height} hp={props.hp} maxHp={props.maxHp} color={'orange'} dmg={props.dmg} />}
      </Bar>
      <span className="text-center" style={{ whiteSpace: 'nowrap', minWidth: 72, maxWidth: 72 }}>
        <b>
          {props.hp} / {props.maxHp}
        </b>
      </span>
    </div>
  );
};

export default HpBar;
