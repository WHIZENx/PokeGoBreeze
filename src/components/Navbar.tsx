import React, { Fragment, useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import logo from '../assets/pokedex.png';
import { capitalize, getTime } from '../util/utils';

import './Navbar.scss';
import { Box, IconButton, LinearProgress } from '@mui/material';
import { SpinnerState, TimestampState } from '../store/models/state.model';
import { getEdgeItem } from '../services/edge.service';
import { EdgeKey } from '../services/constants/edgeKey';
import { TypeTheme, VariantType } from '../enums/type.enum';
import { INavbarComponent } from './models/component.model';
import { useLocalStorage } from 'usehooks-ts';
import { LocalStorageConfig } from '../store/constants/localStorage';
import { loadTheme } from '../store/effects/theme.effects';
import { toNumber } from '../util/extension';

const NavbarComponent = (props: INavbarComponent) => {
  const dispatch = useDispatch();
  const timestamp = useSelector((state: TimestampState) => state.timestamp);
  const spinner = useSelector((state: SpinnerState) => state.spinner);

  const [version, setVersion] = useState<string>();
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

  useEffect(() => {
    const fetchData = async () => {
      const result = await getEdgeItem<string>(EdgeKey.VERSION);
      setVersion(result);
    };
    if (!version) {
      fetchData();
    }
  }, [version]);

  return (
    <Fragment>
      <Navbar collapseOnSelect bg={VariantType.Dark} expand="lg" variant={VariantType.Dark}>
        <Link className="navbar-brand" to="/">
          <img src={logo} width="30" height="30" className="d-inline-block align-top mx-2" alt="Home" />
          PokéGoBreeze
        </Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
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
          {toNumber(timestamp?.gamemaster) > 0 && (
            <Navbar.Text className="d-flex flex-column mw-max-content h-6">
              <span className="text-white mx-2">Updated: {getTime(timestamp.gamemaster, true)}</span>
              <span className="text-end text-warning me-2" style={{ fontSize: 10 }}>
                <b>
                  {process.env.REACT_APP_DEPLOYMENT_MODE === 'development' &&
                    `${capitalize(process.env.REACT_APP_DEPLOYMENT_MODE)}: `}
                  {version}
                </b>
              </span>
            </Navbar.Text>
          )}
          <IconButton
            className={`${stateTheme}-mode me-2 p-0`}
            onClick={onChangeTheme}
            style={{ cursor: isDelay ? 'default' : 'pointer' }}
            color="inherit"
          >
            {props.mode === TypeTheme.Light ? (
              <LightModeIcon fontSize="large" style={{ color: 'white' }} />
            ) : (
              <DarkModeIcon fontSize="large" style={{ color: 'white' }} />
            )}
          </IconButton>
        </Navbar.Collapse>
      </Navbar>
      {spinner.bar.isShow && (
        <Box sx={{ width: '100%', position: 'absolute', zIndex: 7 }}>
          <LinearProgress variant={VariantType.Determinate} value={spinner.bar.percent} />
        </Box>
      )}
    </Fragment>
  );
};

export default NavbarComponent;
