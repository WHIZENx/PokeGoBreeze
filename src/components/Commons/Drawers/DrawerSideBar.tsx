import React, { Fragment, useEffect, useState } from 'react';
import { Box, Divider, Drawer, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { IDrawerSideBarComponent } from '../models/component.model';
import { pages } from '../constants/app-bar';
import { IAppMenuItem } from '../models/menu.model';
import { isEqual, isNotEmpty } from '../../../utils/extension';
import { useNavigateToTop } from '../../Link/LinkToTop';
import CollapseMui from '../Collapses/CollapseMui';

import logo from '../../../assets/pokedex.png';
import useRouter from '../../../composables/useRouter';

const DrawerSideBar = (props: IDrawerSideBarComponent) => {
  const navigateToTop = useNavigateToTop();
  const router = useRouter();

  const [currentPageSub, setCurrentPageSub] = useState<string | undefined>(props.currentPageSub);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (router.routerLocation) {
      const pathName = router.routerLocation?.pathname;
      const value = pages.flatMap((page) => page.subMenus || []).find((subMenu) => isEqual(subMenu.path, pathName));
      setCurrentPageSub(value?.value?.toString());
    }
  }, [router.routerLocation]);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
    props.setOpen?.(newOpen);
  };

  const handleSetPage = (page: IAppMenuItem<string>) => {
    toggleDrawer(false)();
    props.setCurrentPageSub?.(page.value?.toString());
    setTimeout(() => navigateToTop(page.path || '/'), 100);
  };

  const DrawerList = (
    <Box className="tw-h-full tw-w-sidebar" role="presentation">
      <Box className="tw-flex tw-items-center tw-p-2">
        <img src={logo} width="30" height="30" alt="Home" />
        <Typography noWrap component="span" className="!tw-mx-1 !tw-font-bold">
          PokéGoBreeze
        </Typography>
      </Box>
      <Divider />
      <Box className="tw-relative tw-h-full tw-w-sidebar">
        {pages.map((page) => (
          <Fragment key={page.value}>
            {!page.value ? (
              <Divider />
            ) : (
              <>
                {isNotEmpty(page.subMenus) ? (
                  <CollapseMui
                    page={page}
                    onClick={(subPage) => handleSetPage(subPage)}
                    component="ul"
                    listSx={{
                      width: '100%',
                      bgcolor: 'background.paper',
                      '& ul': { padding: 0 },
                    }}
                    isSelect={(subPage) => subPage.value === currentPageSub}
                  />
                ) : (
                  <ListItemButton onClick={() => handleSetPage(page)} selected={page.value === props.currentPage}>
                    {page.icon && <ListItemIcon>{page.icon}</ListItemIcon>}
                    <ListItemText primary={page.label} />
                  </ListItemButton>
                )}
              </>
            )}
          </Fragment>
        ))}
        {props.footer && (
          <Box className="tw-w-full">
            <Divider />
            {props.footer}
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Drawer open={open} onClose={toggleDrawer(false)}>
      {DrawerList}
    </Drawer>
  );
};

export default DrawerSideBar;
