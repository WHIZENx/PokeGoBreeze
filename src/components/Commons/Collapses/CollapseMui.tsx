import React, { useState } from 'react';
import { Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ICollapseComponent } from '../models/component.model';
import { IAppMenuItem } from '../models/menu.model';

const CollapseMui = <T,>(props: ICollapseComponent<T>) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
    props.onHeaderClick?.();
  };

  const handleSubMenuClick = (subMenu: IAppMenuItem<T>) => {
    props.onClick?.(subMenu);
    handleClick();
  };

  return (
    <>
      <ListItemButton onClick={handleClick}>
        {props.page.icon && <ListItemIcon>{props.page.icon}</ListItemIcon>}
        <ListItemText primary={props.page.label} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {props.page.subMenus?.map((subMenu, index) => (
            <ListItem key={index} sx={{ py: 0 }}>
              {subMenu.value ? (
                <ListItemButton onClick={() => handleSubMenuClick(subMenu)}>
                  {subMenu.icon && <ListItemIcon>{subMenu.icon}</ListItemIcon>}
                  <ListItemText primary={subMenu.label} />
                </ListItemButton>
              ) : (
                <ListSubheader>{subMenu.label}</ListSubheader>
              )}
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default CollapseMui;
