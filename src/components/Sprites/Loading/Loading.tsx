import React, { Fragment } from 'react';
import styled from 'styled-components';
import { ILoadingComponent } from '../../models/component.model';

import '../../../App.scss';
import LoadGroup from './LoadingGroup';

interface Element {
  isShow: boolean;
  opacity?: number;
  bgColor: string;
  isVertical?: boolean;
}

const Background = styled.div<Element>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.bgColor};
  opacity: ${(props) => props.opacity};
  z-index: 2;
  display: ${(props) => (props.isShow ? 'block' : 'none')};
`;

const Loading = (props: ILoadingComponent) => {
  return (
    <Fragment>
      <Background bgColor={props.bgColor || 'transparent'} opacity={props.opacity ?? 0.4} isShow={props.isShow} />
      <LoadGroup bgColor={props.bgColor || 'white'} isShow={props.isShow} isVertical={props.isVertical} hideAttr={false} />
    </Fragment>
  );
};

export default Loading;
