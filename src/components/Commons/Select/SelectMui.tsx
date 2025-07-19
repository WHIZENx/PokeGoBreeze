import React, { useMemo } from 'react';
import { Select, MenuItem, FormControl, InputLabel, OutlinedInput, ListSubheader } from '@mui/material';
import { ISelectMuiComponent } from '../models/component.model';
import { isNotEmpty, isNullOrUndefined } from '../../../utils/extension';
import { IMenuItem } from '../../models/component.model';

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

  const renderItem = (item: IMenuItem, index: number) => {
    const { isSubHeader, ...itemMenu } = item;

    return isSubHeader ? (
      <ListSubheader key={index} {...itemMenu}>
        {itemMenu.label}
      </ListSubheader>
    ) : (
      <MenuItem key={index} {...itemMenu}>
        {itemMenu.label}
      </MenuItem>
    );
  };

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
        {items?.map((item, index) => renderItem(item, index))}
      </Select>
    </FormControl>
  );
};

export default SelectMui;
