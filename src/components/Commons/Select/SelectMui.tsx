import React, { useMemo } from 'react';
import { Select, MenuItem, FormControl, InputLabel, OutlinedInput } from '@mui/material';
import { ISelectMuiComponent } from '../models/component.model';
import { isNotEmpty, isNullOrUndefined } from '../../../utils/extension';

const SelectMui = <T,>(props: ISelectMuiComponent<T>) => {
  const {
    insertItems,
    extendItems,
    menuItems,
    inputLabel,
    formSx,
    formClassName,
    onChangeSelect,
    isNoneBorder,
    fullWidth,
    ...selectProps
  } = props;

  const items = useMemo(() => {
    const result = menuItems || [];
    if (isNotEmpty(insertItems)) {
      result.unshift(...(insertItems || []));
    }
    if (isNotEmpty(extendItems)) {
      result.push(...(extendItems || []));
    }
    return result;
  }, [insertItems, extendItems, menuItems]);

  return (
    <FormControl
      className={formClassName}
      sx={{ ...formSx, ...(fullWidth ? { width: '100%' } : undefined) }}
      size="small"
    >
      {inputLabel && <InputLabel>{inputLabel}</InputLabel>}
      <Select
        onChange={(e) => onChangeSelect?.(e.target.value as T)}
        input={inputLabel ? <OutlinedInput label={inputLabel} /> : undefined}
        sx={{ ...selectProps.sx, ...(isNoneBorder ? { borderRadius: 0 } : undefined) }}
        {...selectProps}
        value={isNullOrUndefined(selectProps.value) ? '' : selectProps.value}
      >
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
