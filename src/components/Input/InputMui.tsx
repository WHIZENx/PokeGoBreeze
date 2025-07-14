import React from 'react';
import { IInputMuiComponent } from '../models/component.model';
import { MenuItem, TextField } from '@mui/material';
import { combineClasses, isNotEmpty } from '../../utils/extension';

const InputMui = (props: IInputMuiComponent) => {
  const handleOnChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(event.target.value);
  };

  const { labelPrepend, menuItems, ...textFieldProps } = props;

  return (
    <div className={combineClasses('d-flex', props.fullWidth ? 'w-100' : '')}>
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
        autoComplete="off"
        select={isNotEmpty(menuItems) && props.select}
      >
        {menuItems?.map((item, index) => (
          <MenuItem key={index} value={item.value} onClick={item.onClick} disabled={item.disabled}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>
    </div>
  );
};

export default InputMui;
