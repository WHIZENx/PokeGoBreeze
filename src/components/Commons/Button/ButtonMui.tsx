import { Button } from '@mui/material';
import React from 'react';
import { IButtonMuiComponent } from '../models/component.model';

const ButtonMui = (props: IButtonMuiComponent) => {
  const {
    isNoneBorder,
    active,
    className,
    variant = 'contained',
    textTransform = 'none',
    color = 'primary',
    sx = {},
    ...rest
  } = props;
  return (
    <Button
      {...rest}
      className={className}
      variant={variant}
      color={color}
      sx={{
        ...sx,
        textTransform,
        ...(isNoneBorder ? { borderRadius: 0 } : {}),
        ...(active
          ? {
              backgroundColor: `${color}.select`,
              '&:hover': {
                backgroundColor: `${color}.select`,
              },
            }
          : {}),
      }}
    >
      {props.label}
    </Button>
  );
};

export default ButtonMui;
