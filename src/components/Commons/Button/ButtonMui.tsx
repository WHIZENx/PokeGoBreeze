import { Button } from '@mui/material';
import React from 'react';
import { IButtonMuiComponent } from '../models/component.model';

const ButtonMui = (props: IButtonMuiComponent) => {
  const { isNoneBorder, active, ...rest } = props;
  return (
    <Button
      sx={{
        textTransform: props.textTransform || 'none',
        ...(isNoneBorder ? { borderRadius: 0 } : {}),
        ...(active
          ? {
              backgroundColor: 'primary.dark',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }
          : {}),
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
