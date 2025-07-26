import React, { useMemo } from 'react';
import { Select, MenuItem, FormControl, InputLabel, OutlinedInput, ListSubheader } from '@mui/material';
import { ISelectMuiComponent } from '../models/component.model';
import { isNotEmpty, isNullOrUndefined } from '../../../utils/extension';
import { IMenuItem } from '../models/menu.model';

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

  const renderItem = (item: IMenuItem<T>, index: number) => {
    const { isSubHeader, label, ...subItem } = item;

    return isSubHeader ? (
      <ListSubheader key={index} {...subItem} component="div">
        {label}
      </ListSubheader>
    ) : (
      <MenuItem key={index} {...subItem} component="div">
        {label}
      </MenuItem>
    );
  };

  return (
    <FormControl
      className={formClassName}
      sx={{
        ...formSx,
        flex: '1 1 auto',
        ...(fullWidth ? { width: '100%' } : {}),
      }}
      size="small"
    >
      {inputLabel && <InputLabel>{inputLabel}</InputLabel>}
      <Select
        {...selectProps}
        onChange={(e) => onChangeSelect?.(e.target.value as T)}
        input={inputLabel ? <OutlinedInput label={inputLabel} /> : undefined}
        sx={{
          ...selectProps.sx,
          ...(isNoneBorder ? { borderRadius: 0 } : {}),
        }}
        value={typeof selectProps.value !== 'object' && isNullOrUndefined(selectProps.value) ? '' : selectProps.value}
      >
        {items?.map((item, index) => renderItem(item, index))}
      </Select>
    </FormControl>
  );
};

export default SelectMui;
