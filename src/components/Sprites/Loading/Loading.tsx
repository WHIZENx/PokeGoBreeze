import React, { Fragment } from 'react';
import styled from 'styled-components';
import { ILoadingComponent } from '../../models/component.model';

import '../../../App.scss';
import LoadGroup from './LoadingGroup';
import { getValueOrDefault } from '../../../utils/extension';

interface Element {
  $isShow: boolean;
  $opacity?: number;
  $bgColor?: string;
}

const Background = styled.div<Element>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${(props) => getValueOrDefault(String, props.$bgColor, 'var(--custom-default)')};
  opacity: ${(props) => props.$opacity};
  z-index: 2;
  display: ${(props) => (props.$isShow ? 'block' : 'none')};
`;

const Loading = (props: ILoadingComponent) => {
  return (
    <Fragment>
      <Background $isShow={props.isShow} $opacity={props.opacity ?? 0.4} $bgColor={props.bgColor} />
      <LoadGroup {...props} isHideAttr={false} />
    </Fragment>
  );
};

export default Loading;
