import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { IBackdropMuiComponent } from '../models/component.model';
import { combineClasses, isNullOrUndefined } from '../../../utils/extension';

const BackdropMui = (props: IBackdropMuiComponent) => {
  return (
    <Backdrop
      slotProps={{ root: { 'aria-hidden': props.ariaHidden ?? true } }}
      className={combineClasses(
        isNullOrUndefined(props.isShowOnAbove) || props.isShowOnAbove ? '' : '!tw-absolute',
        !props.open && 'tw-pointer-events-none'
      )}
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
