import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import React from 'react';
import { IToggleButton, IToggleGroupMuiComponent } from '../models/component.model';
import { SxProps, Theme } from '@mui/material';

const ToggleGroupMui = (props: IToggleGroupMuiComponent) => {
  const { isNoneBorder, isDivContain, isDivClassName, sx, ...rest } = props;

  const renderToggleButton = (index: number, buttonProps: IToggleButton, sx: SxProps<Theme> | undefined) => (
    <ToggleButton
      key={index}
      {...buttonProps}
      sx={{
        ...sx,
        textTransform: props.textTransform || 'none',
        ...(isNoneBorder ? { borderRadius: 0 } : {}),
      }}
      color={props.color}
      value={typeof buttonProps.value === 'string' ? buttonProps.value?.toString().toLowerCase() : buttonProps.value}
    >
      {buttonProps.label}
    </ToggleButton>
  );

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
      {props.toggles?.map((button, index) => {
        const { sx, ...buttonProps } = button;
        return isDivContain ? (
          <div key={index} className={isDivClassName}>
            {renderToggleButton(index, buttonProps, sx)}
          </div>
        ) : (
          renderToggleButton(index, buttonProps, sx)
        );
      })}
    </ToggleButtonGroup>
  );
};

export default ToggleGroupMui;
