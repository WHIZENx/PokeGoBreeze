import { ButtonGroup } from '@mui/material';
import React from 'react';
import { IButtonGroupMuiComponent } from '../models/component.model';
import ButtonMui from './ButtonMui';

const ButtonGroupMui = (props: IButtonGroupMuiComponent) => {
  const { isNoneBorder, ...rest } = props;
  return (
    <ButtonGroup
      sx={{
        textTransform: props.textTransform || 'none',
        ...(isNoneBorder ? { borderRadius: 0 } : {}),
        ...props.sx,
      }}
      variant={props.variant || 'contained'}
      {...rest}
    >
      {props.buttons.map((button, index) => (
        <ButtonMui key={index} isNoneBorder={isNoneBorder} color={props.color} {...button} />
      ))}
    </ButtonGroup>
  );
};

export default ButtonGroupMui;
