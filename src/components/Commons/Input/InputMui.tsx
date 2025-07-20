import React from 'react';
import { IInputMuiComponent } from '../models/component.model';
import { MenuItem, TextField } from '@mui/material';
import { combineClasses, isNotEmpty } from '../../../utils/extension';

const InputMui = (props: IInputMuiComponent) => {
  const handleOnChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(event.target.value);
  };

  const { labelPrepend, labelAppend, menuItems, inputAlign, ...textFieldProps } = props;

  return (
    <div className={combineClasses('d-flex', props.fullWidth ? 'w-100' : '', props.className)}>
      {labelPrepend && <div className="input-group-text">{labelPrepend}</div>}
      <TextField
        {...textFieldProps}
        size={props.size || 'small'}
        onChange={props.onChange ? handleOnChangeSearch : undefined}
        sx={{
          '& .MuiInputBase-root': {
            borderRadius: 0,
            width: props.width || '100%',
          },
          ...props.sx,
        }}
        inputProps={{
          ...props.inputProps,
          style: { ...props.inputProps?.style, textAlign: inputAlign },
        }}
        className={props.inputProps?.className}
        autoComplete="off"
        select={isNotEmpty(menuItems) && props.select}
      >
        {menuItems?.map((item, index) => (
          <MenuItem key={index} value={item.value} onClick={item.onClick} disabled={item.disabled}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>
      {labelAppend && <div className="input-group-text">{labelAppend}</div>}
    </div>
  );
};

export default InputMui;
