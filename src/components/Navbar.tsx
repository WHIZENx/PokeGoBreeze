import React, { Fragment, useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import logo from '../assets/pokedex.png';
import { getTime } from '../util/utils';

import './Navbar.scss';
import { Box, LinearProgress } from '@mui/material';
import { SpinnerState, StoreState } from '../store/models/state.model';
import { getEdgeItem } from '../services/edge.service';
import { EdgeKey } from '../services/constants/edgeKey';

const NavbarComponent = () => {
  const timestamp = useSelector((state: StoreState) => state.store.timestamp);
  const spinner = useSelector((state: SpinnerState) => state.spinner);

  const [version, setVersion] = useState('');

  useEffect(() => {
    getEdgeItem(EdgeKey.VERSION).then((res) => setVersion(res?.toString() ?? ''));
  }, []);

  return (
    <Fragment>
      <Navbar collapseOnSelect={true} bg="dark" expand="lg" variant="dark">
        <Link className="navbar-brand" to="/">
          <img src={logo} width="30" height="30" className="d-inline-block align-top" alt="" style={{ marginLeft: 10, marginRight: 10 }} />
          PokéGoBreeze
        </Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Link className="nav-link" to="/">
              Home
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
          {timestamp && (
            <Navbar.Text className="d-flex flex-column" style={{ height: 40, maxWidth: 'max-content' }}>
              <span className="text-white" style={{ marginLeft: 10, marginRight: 10 }}>
                Updated: {getTime(timestamp, true)}
              </span>
              <span className="text-end text-warning" style={{ fontSize: 10, marginRight: 10 }}>
                <b>{version}</b>
              </span>
            </Navbar.Text>
          )}
        </Navbar.Collapse>
      </Navbar>
      {spinner.bar.show && (
        <Box sx={{ width: '100%', position: 'absolute', zIndex: 7 }}>
          <LinearProgress variant="determinate" value={spinner.bar.percent} />
        </Box>
      )}
    </Fragment>
  );
};

export default NavbarComponent;
