import React from 'react';
import { ListSubheader, MenuItem } from '@mui/material';
import { IMenuItemComponent } from '../models/component.model';

const MenuItemItemMui = <T,>(props: IMenuItemComponent<T>) => {
  const { isSubHeader, label, ...subItem } = props.item;

  return isSubHeader ? (
    <ListSubheader key={props.index} {...subItem} component="div">
      {label}
    </ListSubheader>
  ) : (
    <MenuItem key={props.index} {...subItem} component="div">
      {label}
    </MenuItem>
  );
};

export default MenuItemItemMui;
