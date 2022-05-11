import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import logo from '../assets/pokedex.png';

import "./Navbar.css"

const NavbarComponent = () => {
    return (
        <Navbar collapseOnSelect bg="dark" expand="lg" variant="dark">
            <Link className="navbar-brand" to="/">
                <img src={logo} width="30" height="30" className="d-inline-block align-top" alt="" style={{marginLeft: 10, marginRight: 10}}></img>
                PokeGoBreeze
            </Link>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                    <Link className="nav-link" to="/">Home</Link>
                    <NavDropdown title="Search" id="basic-nav-dropdown">
                        <Link className="dropdown-item" to="/search-pokemon">Pokémon</Link>
                        <Link className="dropdown-item" to="/search-move">Moves</Link>
                    </NavDropdown>
                    <NavDropdown title="Effective" id="basic-nav-dropdown">
                        <Link className="dropdown-item" to="/type-effective">Type Effective</Link>
                        <Link className="dropdown-item" to="/weather-boosts">Weather Boosts</Link>
                    </NavDropdown>
                    <NavDropdown title="Tools" id="basic-nav-dropdown">
                        <Link className="dropdown-item" to="/find-cp-iv">Find IV&CP</Link>
                        <Link className="dropdown-item" to="/calculate-cp-iv">Calculate IV&CP</Link>
                    </NavDropdown>
                    <Link className="nav-link" to="/stats-table">Stats Table</Link>
                    <NavDropdown title="Battle Simulator" id="basic-nav-dropdown">
                        <Link className="dropdown-item" to="/damage-calculate">Damage Simulator</Link>
                        <Link className="dropdown-item" to="/dps-tdo-table">DPS&TDO Table</Link>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default NavbarComponent;