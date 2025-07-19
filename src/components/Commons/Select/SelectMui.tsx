import React, { useMemo } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ISelectMuiComponent } from '../models/component.model';
import { isNotEmpty } from '../../../utils/extension';

const SelectMui = <T,>(props: ISelectMuiComponent<T>) => {
  const { insertItems, extendItems, menuItems, inputLabel, formSx, formClassName, onChangeSelect, ...selectProps } =
    props;

  const items = useMemo(() => {
    const result = [];
    if (isNotEmpty(insertItems)) {
      result.push(...(insertItems || []), ...(menuItems || []));
    }
    if (isNotEmpty(extendItems)) {
      result.push(...(extendItems || []));
    }
    return result;
  }, [insertItems, extendItems]);

  return (
    <FormControl className={formClassName} sx={formSx} size="small">
      {inputLabel && <InputLabel>{inputLabel}</InputLabel>}
      <Select onChange={(e) => onChangeSelect?.(e.target.value as T)} {...selectProps}>
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
