import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import React from 'react';
import { IToggleGroupMuiComponent } from '../models/component.model';

const ToggleGroupMui = (props: IToggleGroupMuiComponent) => {
  const { isNoneBorder, sx, ...rest } = props;
  return (
    <ToggleButtonGroup
      {...rest}
      size="small"
      sx={{
        ...sx,
        ...(isNoneBorder ? { borderRadius: 0 } : {}),
      }}
      value={typeof props.value === 'string' ? props.value?.toString().toLowerCase() : props.value}
    >
      {props.toggles.map((button, index) => {
        const { sx, ...buttonProps } = button;
        return (
          <ToggleButton
            key={index}
            {...buttonProps}
            sx={{
              ...sx,
              textTransform: props.textTransform || 'none',
              ...(isNoneBorder ? { borderRadius: 0 } : {}),
            }}
            color={props.color}
            value={typeof button.value === 'string' ? button.value?.toString().toLowerCase() : button.value}
          >
            {button.label}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};

export default ToggleGroupMui;
