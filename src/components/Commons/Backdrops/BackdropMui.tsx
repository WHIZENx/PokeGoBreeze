import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { IBackdropMuiComponent } from '../models/component.model';
import { isNullOrUndefined } from '../../../utils/extension';

const BackdropMui = (props: IBackdropMuiComponent) => {
  return (
    <Backdrop
      className={isNullOrUndefined(props.isShowOnAbove) || props.isShowOnAbove ? '' : 'position-absolute'}
      sx={{
        zIndex: (theme) =>
          isNullOrUndefined(props.isShowOnAbove) || props.isShowOnAbove ? theme.zIndex.drawer + 1 : 2,
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor, opacity: 0.5 } : {}),
      }}
      open={props.open || false}
    >
      {!props.noneCircular && (props.children || <CircularProgress sx={{ color: 'white' }} />)}
    </Backdrop>
  );
};

export default BackdropMui;
