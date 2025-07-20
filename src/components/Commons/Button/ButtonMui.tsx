import { Button } from '@mui/material';
import React from 'react';
import { IButtonMuiComponent } from '../models/component.model';

const ButtonMui = (props: IButtonMuiComponent) => {
  const { isNoneBorder, ...rest } = props;
  return (
    <Button
      sx={{
        textTransform: props.textTransform || 'none',
        ...(isNoneBorder ? { borderRadius: 0 } : {}),
        ...props.sx,
      }}
      variant={props.variant || 'contained'}
      {...rest}
    >
      {props.label}
    </Button>
  );
};

export default ButtonMui;
