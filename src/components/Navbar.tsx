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

  return (
    <Fragment>
      <Navbar collapseOnSelect bg={VariantType.Dark} expand="xl" variant={VariantType.Dark}>
        <Link className="navbar-brand" to="/">
          <img src={logo} width="30" height="30" className="d-inline-block align-top mx-2" alt="Home" />
          PokéGoBreeze
        </Link>
        <div className="d-flex align-items-center justify-content-center">
          <div className="nav-info column-gap-2">{navigateInfo}</div>
          <Navbar.Toggle id="navbar-toggle" aria-controls="responsive-navbar-nav" />
        </div>
        <Navbar.Collapse id="responsive-navbar-nav" className="flex-wrap">
          <Nav className="me-auto">
            <Link className="nav-link" to="/">
              Pokédex
            </Link>
            <Link className="nav-link" to="/news">
              News
            </Link>
            <NavDropdown title="Search">
              <Link className="dropdown-item" to="/search-pokemon">
                Pokémon
              </Link>
              <Link className="dropdown-item" to="/search-moves">
                Moves
              </Link>
              <Link className="dropdown-item" to="/search-types">
                Types
              </Link>
            </NavDropdown>
            <NavDropdown title="Effective">
              <Link className="dropdown-item" to="/type-effective">
                Type Effective
              </Link>
              <Link className="dropdown-item" to="/weather-boosts">
                Weather Boosts
              </Link>
            </NavDropdown>
            <NavDropdown title="Tools">
              <NavDropdown.Header>Search&Find</NavDropdown.Header>
              <Link className="dropdown-item" to="/find-cp-iv">
                Find IV&CP
              </Link>
              <Link className="dropdown-item" to="/search-battle-stats">
                Search Battle Leagues Stats
              </Link>
              <Link className="dropdown-item" to="/stats-table">
                Stats Table
              </Link>
              <NavDropdown.Divider />
              <NavDropdown.Header>Calculation</NavDropdown.Header>
              <Link className="dropdown-item" to="/calculate-catch-chance">
                Calculate Catch Chance
              </Link>
              <Link className="dropdown-item" to="/calculate-stats">
                Calculate Stats
              </Link>
              <Link className="dropdown-item" to="/calculate-point">
                Calculate Break&Bulk Point
              </Link>
              <NavDropdown.Divider />
              <NavDropdown.Header>Battle Simulator</NavDropdown.Header>
              <Link className="dropdown-item" to="/damage-calculate">
                Damage Simulator
              </Link>
              <Link className="dropdown-item" to="/raid-battle">
                Raid Battle
              </Link>
            </NavDropdown>
            <NavDropdown title="Stats Sheets">
              <Link className="dropdown-item" to="/dps-tdo-sheets">
                DPS&TDO Sheets
              </Link>
              <Link className="dropdown-item" to="/stats-ranking">
                Stats Ranking
              </Link>
            </NavDropdown>
            <NavDropdown title="PVP">
              <Link className="dropdown-item" to="/pvp">
                Simulator
              </Link>
              <Link className="dropdown-item" to="/battle-leagues">
                Battle Leagues
              </Link>
            </NavDropdown>
            <Link className="nav-link" to="/stickers">
              Stickers
            </Link>
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
