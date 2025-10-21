import React, { useState } from 'react';
import { Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ICollapseComponent } from '../models/component.model';
import { IAppMenuItem } from '../models/menu.model';
import { isNullOrUndefined } from '../../../utils/extension';

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
        <List component={props.component || 'div'} disablePadding sx={props.listSx} subheader={props.subheader}>
          {props.page.subMenus?.map((subMenu, index) =>
            subMenu.value ? (
              <ListItem
                key={index}
                sx={{ py: 0 }}
                selected={!isNullOrUndefined(subMenu.value) && props.isSelect?.(subMenu)}
              >
                <ListItemButton className="tw-truncate" onClick={() => handleSubMenuClick(subMenu)}>
                  {subMenu.icon && <ListItemIcon>{subMenu.icon}</ListItemIcon>}
                  <ListItemText primary={subMenu.label} />
                </ListItemButton>
              </ListItem>
            ) : (
              <ListSubheader key={index} component="div">
                {subMenu.label}
              </ListSubheader>
            )
          )}
        </List>
      </Collapse>
    </>
  );
};

export default CollapseMui;
