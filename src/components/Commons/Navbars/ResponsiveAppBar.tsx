import React, { Fragment, useEffect, useMemo, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';

import logo from '../../../assets/pokedex.png';
import { combineClasses, isEqual, isNotEmpty, toNumber } from '../../../utils/extension';
import { TypeTheme, VariantType } from '../../../enums/type.enum';

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import useTimestamp from '../../../composables/useTimestamp';
import useSpinner from '../../../composables/useSpinner';
import useTheme from '../../../composables/useTheme';
import { useLocalStorage } from 'usehooks-ts';
import { LocalStorageConfig } from '../../../store/constants/local-storage';
import { getTime } from '../../../utils/utils';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import '../../Navbar.scss';
import { IResponsiveAppBarComponent } from '../models/component.model';
import { pages, POKEDEX } from '../constants/app-bar';
import ButtonMui from '../Buttons/ButtonMui';
import { IAppMenuItem } from '../models/menu.model';
import { useNavigateToTop } from '../../Link/LinkToTop';
import { LinearProgress, ListSubheader } from '@mui/material';
import useRouter from '../../../composables/useRouter';
import DrawerSideBar from '../Drawers/DrawerSideBar';

const ResponsiveAppBar = (props: IResponsiveAppBarComponent) => {
  const navigateToTop = useNavigateToTop();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [menu, setMenu] = useState<string>();
  const [showMenu, setShowMenu] = React.useState(false);
  const [currentPage, setCurrentPage] = useState<string>();
  const [currentPageSub, setCurrentPageSub] = useState<string>();

  const { loadTheme } = useTheme();
  const { timestamp } = useTimestamp();
  const { spinnerPercent, spinnerBarIsShow } = useSpinner();

  const [stateTheme, setStateTheme] = useLocalStorage(LocalStorageConfig.Theme, TypeTheme.Light);

  const [isDelay, setIsDelay] = useState(false);

  useEffect(() => {
    if (router.routerLocation) {
      const pathName = router.routerLocation?.pathname;
      const value = pages.find(
        (page) => isEqual(page.path, pathName) || page.subMenus?.some((subMenu) => isEqual(subMenu.path, pathName))
      );
      setCurrentPage(value?.value?.toString() || POKEDEX);
      if (isNotEmpty(value?.subMenus)) {
        const subValue = value?.subMenus?.find((subMenu) => isEqual(subMenu.path, pathName));
        setCurrentPageSub(subValue?.value?.toString() || '');
      }
    }
  }, [router.routerLocation]);

  const onChangeTheme = () => {
    if (!isDelay) {
      setIsDelay(true);
      loadTheme(props.mode === TypeTheme.Light ? TypeTheme.Dark : TypeTheme.Light, setStateTheme);
      setTimeout(() => {
        setIsDelay(false);
        props.toggleColorMode();
      }, 500);
    }
  };

  const handleCloseMenu = (page: IAppMenuItem<string> | null, subPage: IAppMenuItem<string> | null) => {
    setShowMenu(false);
    setAnchorElNav(null);
    if (page && subPage) {
      setCurrentPage(page.value?.toString() || POKEDEX);
      setCurrentPageSub(subPage.value?.toString() || '');
      setTimeout(() => navigateToTop(subPage.path || '/'), 100);
    }
  };

  const handleSetPage = (event: React.MouseEvent<HTMLElement>, page: IAppMenuItem<string>) => {
    setAnchorElNav(event.currentTarget);
    setMenu(page.value?.toString() || POKEDEX);

    if (isNotEmpty(page.subMenus)) {
      setShowMenu(true);
    } else {
      setTimeout(() => navigateToTop(page.path || '/'), 100);
      setCurrentPageSub('');
    }
  };

  const infoVersion = useMemo(() => {
    return (
      <>
        {toNumber(timestamp?.gamemaster) > 0 && (
          <span className="text-truncate">Updated: {getTime(timestamp.gamemaster, true)}</span>
        )}
        <span className="text-end text-warning u-fs-2">
          <b>{props.version}</b>
        </span>
      </>
    );
  }, [timestamp, props.version]);

  const navigateInfo = useMemo(() => {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>{infoVersion}</Box>
        <IconButton
          sx={{ p: 0 }}
          className={combineClasses(
            stateTheme === TypeTheme.Light ? 'light-mode' : 'dark-mode',
            isDelay ? 'cursor-default' : 'cursor-pointer'
          )}
          onClick={onChangeTheme}
          color="inherit"
        >
          {props.mode === TypeTheme.Light ? (
            <LightModeIcon fontSize="large" style={{ color: 'white' }} />
          ) : (
            <DarkModeIcon fontSize="large" style={{ color: 'white' }} />
          )}
        </IconButton>
      </Box>
    );
  }, [infoVersion, stateTheme, isDelay, onChangeTheme]);

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ mx: 2, my: 0.5 }} disableGutters variant="dense">
        {/* width >= 900 */}
        <Box className="text-white" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <img src={logo} width="30" height="30" alt="Home" />
          <Typography
            noWrap
            component="span"
            sx={{
              mx: 1,
              fontWeight: 700,
            }}
          >
            PokéGoBreeze
          </Typography>
        </Box>

        {/* width < 900 */}
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconButton size="large" onClick={() => setOpen(true)} color="inherit">
            <MenuIcon />
          </IconButton>
        </Box>

        {/* width >= 900 */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {pages.map((page) => (
            <Fragment key={page.value}>
              <ButtonMui
                isNoneBorder
                disableRipple
                variant="text"
                onClick={(e) => handleSetPage(e, page)}
                sx={{
                  px: 0.5,
                  color: 'white',
                  display: 'flex',
                  textDecoration: page.value === currentPage ? 'underline' : 'none',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: page.value === currentPage ? 'underline' : 'none',
                  },
                  '& .MuiButton-endIcon': {
                    ml: 0,
                  },
                }}
                endIcon={isNotEmpty(page.subMenus) && <ArrowDropDownIcon />}
                value={page.value}
                label={<span className="text-truncate">{page.label}</span>}
              />
              {isNotEmpty(page.subMenus) && (
                <Menu
                  key={`menu-${page.value}`}
                  anchorEl={anchorElNav}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={page.value === menu ? showMenu : false}
                  onClose={() => handleCloseMenu(null, null)}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  {page.subMenus?.map((subMenu, index) => (
                    <Fragment key={subMenu.value || `header-${page.value}-${index}`}>
                      {subMenu.isHeader ? (
                        <ListSubheader sx={{ textAlign: 'center' }}>{subMenu.label}</ListSubheader>
                      ) : (
                        <MenuItem
                          onClick={() => handleCloseMenu(page, subMenu)}
                          selected={subMenu.value === currentPageSub}
                        >
                          {subMenu.label}
                        </MenuItem>
                      )}
                    </Fragment>
                  ))}
                </Menu>
              )}
            </Fragment>
          ))}
        </Box>
        {navigateInfo}
      </Toolbar>
      {spinnerBarIsShow && (
        <Box className="w-100 position-absolute z-7">
          <LinearProgress variant={VariantType.Determinate} value={spinnerPercent} />
        </Box>
      )}
      <DrawerSideBar
        currentPage={currentPage}
        currentPageSub={currentPageSub}
        setCurrentPage={setCurrentPage}
        setCurrentPageSub={setCurrentPageSub}
        open={open}
        setOpen={setOpen}
        footer={
          <Box
            className="theme-text-primary"
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              p: 2,
              alignItems: 'start',
            }}
          >
            {infoVersion}
          </Box>
        }
      />
    </AppBar>
  );
};
export default ResponsiveAppBar;
