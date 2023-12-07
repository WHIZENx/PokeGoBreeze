import React from 'react';
import styled, { keyframes } from 'styled-components';

const Bar = styled.div`
  width: 100%;
  height: ${(props: { height: number }) => props.height}px;
  background: #00000024;
  border: 2px ridge lightgray;
  position: relative;
`;

const Fill = styled.div`
  position: absolute;
  width: ${(props: { hp: number; maxHp: number; height: number; color: string }) => (props.hp * 100) / props.maxHp}%;
  height: ${(props: { height: number }) => props.height - 4}px;
  background: ${(props: { color: string }) => props.color};
  transition: 0.1s;
`;

const anim = keyframes`
    to { visibility: hidden; }
`;

const FillDmg = styled.div`
  position: absolute;
  width: ${(props: { hp: number; maxHp: number; height: number; color: string; dmg: number }) => (props.dmg * 100) / props.maxHp}%;
  height: ${(props: { height: number }) => props.height - 4}px;
  background: ${(props: { color: string }) => props.color};
  left: ${(props: { hp: number; maxHp: number }) => (props.hp * 100) / props.maxHp}%;
  animation: 1s ${anim};
  animation-fill-mode: forwards;
`;

const HpBar = ({ text, height, hp, maxHp, dmg }: any) => {
  return (
    <div className="d-flex align-items-center w-100" style={{ columnGap: 5 }}>
      {text && (
        <span>
          <b>{text}</b>
        </span>
      )}
      <Bar height={height}>
        <Fill height={height} hp={hp} maxHp={maxHp} color={hp / maxHp > 0.5 ? 'lightgreen' : hp / maxHp > 0.25 ? 'yellow' : 'red'} />
        {dmg && <FillDmg height={height} hp={hp} maxHp={maxHp} color={'orange'} dmg={dmg} />}
      </Bar>
      <span className="text-center" style={{ whiteSpace: 'nowrap', minWidth: 72, maxWidth: 72 }}>
        <b>
          {hp} / {maxHp}
        </b>
      </span>
    </div>
  );
};

export default HpBar;
