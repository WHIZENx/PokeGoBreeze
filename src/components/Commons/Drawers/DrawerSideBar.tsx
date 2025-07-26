import React, { Fragment, useEffect, useState } from 'react';
import { Box, Divider, Drawer, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { IDrawerSideBarComponent } from '../models/component.model';
import { pages } from '../constants/app-bar';
import { IAppMenuItem } from '../models/menu.model';
import { isNotEmpty } from '../../../utils/extension';
import { useNavigateToTop } from '../../Link/LinkToTop';
import CollapseMui from '../Collapses/CollapseMui';

const DrawerSideBar = (props: IDrawerSideBarComponent) => {
  const navigateToTop = useNavigateToTop();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
    props.setOpen?.(newOpen);
  };

  const handleSetPage = (page: IAppMenuItem<string>) => {
    toggleDrawer(false)();
    setTimeout(() => navigateToTop(page.path || '/'), 100);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation">
      {pages.map((page) => (
        <Fragment key={page.value}>
          {!page.value ? (
            <Divider />
          ) : (
            <>
              {isNotEmpty(page.subMenus) ? (
                <CollapseMui page={page} onClick={(subPage) => handleSetPage(subPage)} />
              ) : (
                <ListItemButton onClick={() => handleSetPage(page)}>
                  {page.icon && <ListItemIcon>{page.icon}</ListItemIcon>}
                  <ListItemText primary={page.label} />
                </ListItemButton>
              )}
            </>
          )}
        </Fragment>
      ))}
    </Box>
  );

  return (
    <Drawer open={open} onClose={toggleDrawer(false)}>
      {DrawerList}
    </Drawer>
  );
};

export default DrawerSideBar;
