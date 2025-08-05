import React, { Fragment, useMemo, useState } from 'react';
import { Navbar, Nav, NavDropdown, OverlayTrigger } from 'react-bootstrap';

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import logo from '../assets/pokedex.png';
import { getTime } from '../utils/utils';

import './Navbar.scss';
import { Box, IconButton, LinearProgress } from '@mui/material';
import { TypeTheme, VariantType } from '../enums/type.enum';
import { INavbarComponent } from './models/component.model';
import { useLocalStorage } from 'usehooks-ts';
import { LocalStorageConfig } from '../store/constants/local-storage';
import { combineClasses, toNumber } from '../utils/extension';
import CustomPopover from './Commons/Popovers/CustomPopover';
import { LinkToTop } from './Link/LinkToTop';
import useTheme from '../composables/useTheme';
import useTimestamp from '../composables/useTimestamp';
import useSpinner from '../composables/useSpinner';

type ToggleEvent = React.SyntheticEvent | KeyboardEvent | MouseEvent;
interface ToggleMetadata {
  source: string | undefined;
  originalEvent: ToggleEvent | undefined;
}

const NavbarComponent = (props: INavbarComponent) => {
  const { loadTheme } = useTheme();
  const { timestamp } = useTimestamp();
  const { spinnerPercent, spinnerBarIsShow } = useSpinner();

  const [stateTheme, setStateTheme] = useLocalStorage(LocalStorageConfig.Theme, TypeTheme.Light);
  const [expanded, setExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState('');

  const [isDelay, setIsDelay] = useState(false);

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

  const handleNavLinkClick = () => {
    setExpanded(false);
    setShowDropdown('');
  };

  const infoVersion = useMemo(() => {
    return (
      <>
        {toNumber(timestamp?.gamemaster) > 0 && (
          <span className="tw-text-white">Updated: {getTime(timestamp.gamemaster, true)}</span>
        )}
        <span className="tw-text-right tw-text-yellow-600 tw-text-xs">
          <b>{props.version}</b>
        </span>
      </>
    );
  }, [timestamp, props.version]);

  const navigateInfo = useMemo(() => {
    return (
      <>
        <Navbar.Text className="text-version tw-flex-col tw-justify-between tw-max-w-max tw-h-6 !tw-p-0">
          {infoVersion}
        </Navbar.Text>
        <OverlayTrigger
          placement="bottom"
          overlay={
            <CustomPopover className="tw-bg-gray-800">
              <div className="tw-flex tw-flex-col tw-justify-between tw-w-max-content tw-h-6 !tw-p-0">
                {infoVersion}
              </div>
            </CustomPopover>
          }
        >
          <InfoOutlinedIcon className="nav-info-icon tw-cursor-pointer !tw-p-0" color="info" />
        </OverlayTrigger>
        <IconButton
          className={combineClasses(
            'tw-mr-2 !tw-p-0',
            stateTheme === TypeTheme.Light ? 'light-mode' : 'dark-mode',
            isDelay ? 'cursor-default' : 'tw-cursor-pointer'
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
      </>
    );
  }, [infoVersion, stateTheme, isDelay, onChangeTheme]);

  const navItemLink = (className: string, to: string, label: string | React.ReactNode) => {
    return (
      <LinkToTop className={className} to={to} funcOnClick={handleNavLinkClick}>
        {label}
      </LinkToTop>
    );
  };

  const handleDropdownToggle = (isOpen: boolean, metadata: ToggleMetadata) => {
    if (metadata.source !== 'select') {
      setShowDropdown(isOpen ? (metadata.originalEvent?.target as HTMLElement)?.id : '');
    }
  };

  return (
    <Fragment>
      <Navbar
        collapseOnSelect
        bg={VariantType.Dark}
        expand="xl"
        variant={VariantType.Dark}
        expanded={expanded}
        onToggle={setExpanded}
      >
        {navItemLink(
          'navbar-brand',
          '/',
          <>
            <img src={logo} width="30" height="30" className="tw-inline-block align-top tw-mx-2" alt="Home" />
            PokéGoBreeze
          </>
        )}
        <div className="tw-flex tw-items-center tw-justify-center">
          <div className="nav-info tw-gap-x-2">{navigateInfo}</div>
          <Navbar.Toggle id="navbar-toggle" className="tw-mr-2" aria-controls="responsive-navbar-nav" />
        </div>
        <Navbar.Collapse id="responsive-navbar-nav" className="tw-flex-wrap">
          <Nav className="tw-mr-auto">
            {navItemLink('nav-link', '/', 'Pokédex')}
            {navItemLink('nav-link', '/news', 'News')}
            <NavDropdown
              title="Search"
              id="search-dropdown"
              show={showDropdown === 'search-dropdown'}
              onToggle={(isOpen, metadata) => handleDropdownToggle(isOpen, metadata)}
            >
              {navItemLink('dropdown-item', '/search-pokemon', 'Pokémon')}
              {navItemLink('dropdown-item', '/search-moves', 'Moves')}
              {navItemLink('dropdown-item', '/search-types', 'Types')}
            </NavDropdown>
            <NavDropdown
              title="Effective"
              id="effective-dropdown"
              show={showDropdown === 'effective-dropdown'}
              onToggle={(isOpen, metadata) => handleDropdownToggle(isOpen, metadata)}
            >
              {navItemLink('dropdown-item', '/type-effective', 'Type Effective')}
              {navItemLink('dropdown-item', '/weather-boosts', 'Weather Boosts')}
            </NavDropdown>
            <NavDropdown
              title="Tools"
              id="tools-dropdown"
              show={showDropdown === 'tools-dropdown'}
              onToggle={(isOpen, metadata) => handleDropdownToggle(isOpen, metadata)}
            >
              <NavDropdown.Header>Search&Find</NavDropdown.Header>
              {navItemLink('dropdown-item', '/find-cp-iv', 'Find IV&CP')}
              {navItemLink('dropdown-item', '/search-battle-stats', 'Search Battle Leagues Stats')}
              {navItemLink('dropdown-item', '/stats-table', 'Stats Table')}
              <NavDropdown.Divider />
              <NavDropdown.Header>Calculation</NavDropdown.Header>
              {navItemLink('dropdown-item', '/calculate-catch-chance', 'Calculate Catch Chance')}
              {navItemLink('dropdown-item', '/calculate-stats', 'Calculate Stats')}
              {navItemLink('dropdown-item', '/calculate-point', 'Calculate Break&Bulk Point')}
              <NavDropdown.Divider />
              <NavDropdown.Header>Battle Simulator</NavDropdown.Header>
              {navItemLink('dropdown-item', '/damage-calculate', 'Damage Simulator')}
              {navItemLink('dropdown-item', '/raid-battle', 'Raid Battle')}
            </NavDropdown>
            <NavDropdown
              title="Stats Sheets"
              id="stats-sheets-dropdown"
              show={showDropdown === 'stats-sheets-dropdown'}
              onToggle={(isOpen, metadata) => handleDropdownToggle(isOpen, metadata)}
            >
              {navItemLink('dropdown-item', '/dps-tdo-sheets', 'DPS&TDO Sheets')}
              {navItemLink('dropdown-item', '/stats-ranking', 'Stats Ranking')}
            </NavDropdown>
            <NavDropdown
              title="PVP"
              id="pvp-dropdown"
              show={showDropdown === 'pvp-dropdown'}
              onToggle={(isOpen, metadata) => handleDropdownToggle(isOpen, metadata)}
            >
              {navItemLink('dropdown-item', '/pvp', 'Simulator')}
              {navItemLink('dropdown-item', '/battle-leagues', 'Battle Leagues')}
            </NavDropdown>
            {navItemLink('nav-link', '/stickers', 'Stickers')}
          </Nav>
        </Navbar.Collapse>
        <div className="nav-info-top tw-gap-x-2">{navigateInfo}</div>
      </Navbar>
      {spinnerBarIsShow && (
        <Box className="tw-w-full tw-absolute tw-z-7">
          <LinearProgress variant={VariantType.Determinate} value={spinnerPercent} />
        </Box>
      )}
    </Fragment>
  );
};

export default NavbarComponent;
