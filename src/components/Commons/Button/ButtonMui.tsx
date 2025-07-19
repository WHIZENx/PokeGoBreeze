import { Button } from '@mui/material';
import React from 'react';
import { IButtonMuiComponent } from '../models/component.model';

const ButtonMui = (props: IButtonMuiComponent) => {
  return (
    <Button
      sx={{
        textTransform: props.textTransform || 'none',
        ...props.sx,
      }}
      {...props}
    >
      {props.label}
    </Button>
  );
};

export default ButtonMui;
