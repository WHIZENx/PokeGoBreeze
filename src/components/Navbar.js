import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import logo from '../assets/pokedex.png';
import APIService from '../services/API.service';

import "./Navbar.css"

const NavbarComponent = () => {
    return (
        <Navbar style={{zIndex: 5}} collapseOnSelect bg="dark" expand="lg" variant="dark">
            <Link className="navbar-brand" to="/">
                <img src={logo} width="30" height="30" className="d-inline-block align-top" alt="" style={{marginLeft: 10, marginRight: 10}}/>
                PokéGoBreeze
            </Link>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                    <Link className="nav-link" to="/">Home</Link>
                    <NavDropdown title="Search">
                        <Link className="dropdown-item" to="/search-pokemon">Pokémon</Link>
                        <Link className="dropdown-item" to="/search-move">Moves</Link>
                    </NavDropdown>
                    <NavDropdown title="Effective">
                        <Link className="dropdown-item" to="/type-effective">Type Effective</Link>
                        <Link className="dropdown-item" to="/weather-boosts">Weather Boosts</Link>
                    </NavDropdown>
                    <NavDropdown title="Tools">
                        <Link className="dropdown-item" to="/find-cp-iv">Find IV&CP</Link>
                        <Link className="dropdown-item" to="/search-battle-stats">Search Battle Leagues Stats</Link>
                        <Link className="dropdown-item" to="/stats-table">Stats Table</Link>
                        <Link className="dropdown-item" to="/raid-battle">Raid Battle</Link>
                        <NavDropdown.Divider />
                        <Link className="dropdown-item" to="/calculate-stats">Calculate Stats</Link>
                        <Link className="dropdown-item" to="/damage-calculate">Damage Simulator</Link>
                        <Link className="dropdown-item" to="/calculate-point">Calculate Point Stats</Link>
                    </NavDropdown>
                    <Link className="nav-link" to="/dps-tdo-table">DPS&TDO Table</Link>
                    <NavDropdown title="PVP Simulator">
                        <Link className="dropdown-item" to="/pvp/500"><img width={25} height={25} alt="logo-league" src={APIService.getPokeOtherLeague("GBL_littlecup")}/> Little Cup</Link>
                        <Link className="dropdown-item" to="/pvp/1500"><img width={25} height={25} alt="logo-league" src={APIService.getPokeLeague("great_league")}/> Great League</Link>
                        <Link className="dropdown-item" to="/pvp/2500"><img width={25} height={25} alt="logo-league" src={APIService.getPokeLeague("ultra_league")}/> Ultra League</Link>
                        <Link className="dropdown-item" to="/pvp/10000"><img width={25} height={25} alt="logo-league" src={APIService.getPokeLeague("master_league")}/> Master League</Link>
                    </NavDropdown>
                    <Link className="nav-link" to="/battle-leagues">Battle Leagues</Link>
                    <Link className="nav-link" to="/stickers">Stickers</Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default NavbarComponent;