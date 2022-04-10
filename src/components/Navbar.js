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
                    <Link className="nav-link" to="/search">Search Pokémon</Link>
                    <NavDropdown title="Effective" id="basic-nav-dropdown">
                        <Link className="dropdown-item" to="/type-effective">Type Effective</Link>
                        <Link className="dropdown-item" to="/weather-boosts">Weather Boosts</Link>
                    </NavDropdown>
                    <NavDropdown title="Tools" id="basic-nav-dropdown">
                        <Link className="dropdown-item" to="/find-cp-iv">Find IV&CP</Link>
                        <Link className="dropdown-item" to="/calculate-cp-iv">Calculate IV&CP</Link>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default NavbarComponent;