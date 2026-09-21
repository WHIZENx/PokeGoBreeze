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

import './Navbar.scss';
import { IResponsiveAppBarComponent } from '../models/component.model';
import { pages, POKEDEX } from '../constants/app-bar';
import ButtonMui from '../Buttons/ButtonMui';
import { IAppMenuItem } from '../models/menu.model';
import { useNavigateToTop } from '../../Link/LinkToTop';
import { LinearProgress, ListSubheader } from '@mui/material';
import useRouter from '../../../composables/useRouter';
import DrawerSideBar from '../Drawers/DrawerSideBar';
import { useTheme as useThemeMui } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

const ResponsiveAppBar = (props: IResponsiveAppBarComponent) => {
  try {
    useLocation();
  } catch (e) {
    return;
  }

  const theme = useThemeMui();
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
      setCurrentPage(value?.value?.toString());
      if (isNotEmpty(value?.subMenus)) {
        const subValue = value?.subMenus?.find((subMenu) => isEqual(subMenu.path, pathName));
        setCurrentPageSub(subValue?.value?.toString());
      } else if (!value?.value) {
        setCurrentPageSub('');
      }
    }
  }, [router.routerLocation]);

  const onChangeTheme = () => {
    if (!isDelay) {
      setIsDelay(true);
      loadTheme(theme.palette.mode === TypeTheme.Light ? TypeTheme.Dark : TypeTheme.Light, setStateTheme);
      setTimeout(() => {
        setIsDelay(false);
        props.toggleColorMode?.();
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
          <span className="tw-truncate">Updated: {getTime(timestamp.gamemaster, true)}</span>
        )}
        <Typography variant="caption" sx={{ color: 'warning.light' }} fontSize={8} className="tw-text-right">
          <b>{props.version}</b>
        </Typography>
      </>
    );
  }, [timestamp, props.version]);

  const navigateInfo = useMemo(() => {
    return (
      <Box className="tw-flex tw-gap-1">
        <Box className="tw-hidden tw-w-full tw-flex-col min-[900px]:tw-flex">{infoVersion}</Box>
        <IconButton
          className={combineClasses(
            '!tw-p-0',
            stateTheme === TypeTheme.Light ? 'light-mode' : 'dark-mode',
            isDelay ? 'cursor-default' : 'tw-cursor-pointer'
          )}
          onClick={onChangeTheme}
          color="inherit"
        >
          {theme.palette.mode === TypeTheme.Light ? (
            <LightModeIcon fontSize="large" color="inherit" />
          ) : (
            <DarkModeIcon fontSize="large" color="inherit" />
          )}
        </IconButton>
      </Box>
    );
  }, [infoVersion, stateTheme, isDelay, onChangeTheme]);

  return (
    <AppBar className="tw-overflow-x-auto" position="sticky">
      <Toolbar className="tw-mx-2 tw-my-0.5" disableGutters variant="dense">
        {/* width >= 900 */}
        <Box className="tw-hidden tw-items-center tw-text-white min-[900px]:tw-flex">
          <img src={logo} width="30" height="30" alt="Home" />
          <Typography noWrap component="span" className="!tw-mx-1 !tw-font-bold">
            PokéGoBreeze
          </Typography>
        </Box>

        {/* width < 900 */}
        <Box className="tw-flex tw-flex-grow min-[900px]:tw-hidden">
          <IconButton size="large" onClick={() => setOpen(true)} color="inherit">
            <MenuIcon />
          </IconButton>
        </Box>

        {/* width >= 900 */}
        <Box className="tw-hidden tw-flex-grow min-[900px]:tw-flex">
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
                label={<span className="tw-truncate">{page.label}</span>}
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
                  className="tw-hidden min-[600px]:tw-block"
                >
                  {page.subMenus?.map((subMenu, index) => (
                    <Fragment key={subMenu.value || `header-${page.value}-${index}`}>
                      {subMenu.isHeader ? (
                        <ListSubheader className="!tw-text-center">{subMenu.label}</ListSubheader>
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
        <Box className="tw-w-full tw-absolute tw-z-7">
          <LinearProgress
            variant={spinnerPercent === 0 ? 'indeterminate' : VariantType.Determinate}
            value={spinnerPercent}
          />
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
          <Box className="tw-flex tw-flex-col tw-items-start tw-p-2 tw-text-default min-[900px]:tw-hidden">
            {infoVersion}
          </Box>
        }
      />
    </AppBar>
  );
};
export default ResponsiveAppBar;
