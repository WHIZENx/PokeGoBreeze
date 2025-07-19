import React, { useEffect, useState } from 'react';
import { Select, MenuItem, FormControl } from '@mui/material';
import { ISelectMuiComponent } from '../models/component.model';
import { InputLabel } from '@mui/material';
import { isNotEmpty } from '../../../utils/extension';

const SelectMui = <T,>(props: ISelectMuiComponent<T>) => {
  const [items, setItems] = useState(props.menuItems || []);

  useEffect(() => {
    if (isNotEmpty(props.insertItems)) {
      setItems((prevItems) => [...(props.insertItems || []), ...prevItems]);
    }
    if (isNotEmpty(props.extendItems)) {
      setItems((prevItems) => [...prevItems, ...(props.extendItems || [])]);
    }
  }, [props.insertItems, props.extendItems]);

  return (
    <FormControl className={props.formClassName} sx={props.formSx} size="small">
      {props.inputLabel && <InputLabel>{props.inputLabel}</InputLabel>}
      <Select onChange={(e) => props.onChangeSelect?.(e.target.value as T)} {...props}>
        {items?.map((item, index) => (
          <MenuItem key={index} {...item}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectMui;
