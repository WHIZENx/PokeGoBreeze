import React, { Fragment } from 'react';
import loadingImg from '../../../assets/loading.png';
import styled from 'styled-components';
import { ILoadGroupComponent } from '../../models/component.model';

import '../../../App.scss';
import { combineClasses, getValueOrDefault } from '../../../utils/extension';

interface Element {
  $isShow: boolean;
  $opacity?: number;
  $bgColor?: string;
  $isVertical?: boolean;
  $isHideAttr?: boolean;
}

const LoadHideAttr = styled.div<Element>`
  display: ${(props) => (props.$isShow ? (props.$isVertical ? 'inline-block' : 'block') : 'none')};
`;

const Load = styled.div<Element>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  background-color: ${(props) => getValueOrDefault(String, props.$bgColor, 'var(--background-default)')};
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 8px 8px 0 #00000033;
  display: ${(props) => (props.$isShow ? (props.$isVertical ? 'inline-block' : 'block') : 'none')};
`;

const LoadGroup = (props: ILoadGroupComponent) => {
  const ref = (
    <>
      <img
        className="loading"
        width={props.size ?? 64}
        height={props.size ?? 64}
        alt="Pokémon Loading"
        src={loadingImg}
      />
      <span className="caption theme-text-primary u-fs-3">
        <b>
          Loading<span id="p1">.</span>
          <span id="p2">.</span>
          <span id="p3">.</span>
        </b>
      </span>
    </>
  );

  const className = combineClasses('text-center', props.className, props.isVertical ? 'vertical-center' : '');

  return (
    <Fragment>
      {props.isHideAttr ? (
        <LoadHideAttr
          className={className}
          $isShow={props.isShow}
          $isVertical={props.isVertical}
          $isHideAttr={props.isHideAttr}
          $opacity={props.opacity}
          $bgColor={props.bgColor}
        >
          {ref}
        </LoadHideAttr>
      ) : (
        <Load
          className={className}
          $isShow={props.isShow}
          $isVertical={props.isVertical}
          $isHideAttr={props.isHideAttr}
          $opacity={props.opacity}
          $bgColor={props.bgColor}
        >
          {ref}
        </Load>
      )}
    </Fragment>
  );
};

export default LoadGroup;
