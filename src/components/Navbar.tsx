import React, { Fragment, useMemo, useState } from 'react';
import { Navbar, Nav, NavDropdown, OverlayTrigger } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import logo from '../assets/pokedex.png';
import { capitalize, getTime } from '../util/utils';

import './Navbar.scss';
import { Box, IconButton, LinearProgress } from '@mui/material';
import { SpinnerState, TimestampState } from '../store/models/state.model';
import { TypeTheme, VariantType } from '../enums/type.enum';
import { INavbarComponent } from './models/component.model';
import { useLocalStorage } from 'usehooks-ts';
import { LocalStorageConfig } from '../store/constants/localStorage';
import { loadTheme } from '../store/effects/theme.effects';
import { combineClasses, toNumber } from '../util/extension';
import CustomPopover from './Popover/CustomPopover';

const NavbarComponent = (props: INavbarComponent) => {
  const dispatch = useDispatch();
  const timestamp = useSelector((state: TimestampState) => state.timestamp);
  const spinner = useSelector((state: SpinnerState) => state.spinner);

  const [stateTheme, setStateTheme] = useLocalStorage(LocalStorageConfig.Theme, TypeTheme.Light);
  const [expanded, setExpanded] = useState(false);

  const [isDelay, setIsDelay] = useState(false);

  const onChangeTheme = () => {
    if (!isDelay) {
      setIsDelay(true);
      loadTheme(dispatch, props.mode === TypeTheme.Light ? TypeTheme.Dark : TypeTheme.Light, setStateTheme);
      setTimeout(() => {
        setIsDelay(false);
        props.toggleColorMode();
      }, 500);
    }
  };

  const handleNavLinkClick = () => {
    setExpanded(false);
  };

  const infoVersion = useMemo(() => {
    return (
      <>
        {toNumber(timestamp?.gamemaster) > 0 && (
          <span className="text-white">Updated: {getTime(timestamp.gamemaster, true)}</span>
        )}
        <span className="text-end text-warning" style={{ fontSize: 10 }}>
          <b>
            {process.env.REACT_APP_DEPLOYMENT_MODE === 'development' &&
              `${capitalize(process.env.REACT_APP_DEPLOYMENT_MODE)}: `}
            {props.version}
          </b>
        </span>
      </>
    );
  }, [timestamp, props.version]);

  const navigateInfo = useMemo(() => {
    return (
      <>
        <Navbar.Text className="text-version flex-column justify-content-between mw-max-content h-6 p-0">
          {infoVersion}
        </Navbar.Text>
        <OverlayTrigger
          placement="bottom"
          overlay={
            <CustomPopover className="bg-dark">
              <div className="d-flex flex-column justify-content-between mw-max-content h-6 p-0">{infoVersion}</div>
            </CustomPopover>
          }
        >
          <InfoOutlinedIcon className="nav-info-icon cursor-pointer p-0" color="info" />
        </OverlayTrigger>
        <IconButton
          className={combineClasses(
            'me-2 p-0',
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
      </>
    );
  }, [infoVersion, stateTheme, isDelay, onChangeTheme]);

  const navItemLink = (className: string, to: string, label: string | React.ReactNode) => {
    return (
      <Link className={className} to={to} onClick={handleNavLinkClick}>
        {label}
      </Link>
    );
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
            <img src={logo} width="30" height="30" className="d-inline-block align-top mx-2" alt="Home" />
            PokéGoBreeze
          </>
        )}
        <div className="d-flex align-items-center justify-content-center">
          <div className="nav-info column-gap-2">{navigateInfo}</div>
          <Navbar.Toggle id="navbar-toggle" aria-controls="responsive-navbar-nav" />
        </div>
        <Navbar.Collapse id="responsive-navbar-nav" className="flex-wrap">
          <Nav className="me-auto">
            {navItemLink('nav-link', '/', 'Pokédex')}
            {navItemLink('nav-link', '/news', 'News')}
            <NavDropdown title="Search">
              {navItemLink('dropdown-item', '/search-pokemon', 'Pokémon')}
              {navItemLink('dropdown-item', '/search-moves', 'Moves')}
              {navItemLink('dropdown-item', '/search-types', 'Types')}
            </NavDropdown>
            <NavDropdown title="Effective">
              {navItemLink('dropdown-item', '/type-effective', 'Type Effective')}
              {navItemLink('dropdown-item', '/weather-boosts', 'Weather Boosts')}
            </NavDropdown>
            <NavDropdown title="Tools">
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
            <NavDropdown title="Stats Sheets">
              {navItemLink('dropdown-item', '/dps-tdo-sheets', 'DPS&TDO Sheets')}
              {navItemLink('dropdown-item', '/stats-ranking', 'Stats Ranking')}
            </NavDropdown>
            <NavDropdown title="PVP">
              {navItemLink('dropdown-item', '/pvp', 'Simulator')}
              {navItemLink('dropdown-item', '/battle-leagues', 'Battle Leagues')}
            </NavDropdown>
            {navItemLink('nav-link', '/stickers', 'Stickers')}
          </Nav>
        </Navbar.Collapse>
        <div className="nav-info-top column-gap-2">{navigateInfo}</div>
      </Navbar>
      {spinner.bar.isShow && (
        <Box className="w-100 position-absolute z-7">
          <LinearProgress variant={VariantType.Determinate} value={spinner.bar.percent} />
        </Box>
      )}
    </Fragment>
  );
};

export default NavbarComponent;
