import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import logo from '../logo.svg';

import "./Navbar.css"

const NavbarComponent = () => {
    return (
        <Navbar collapseOnSelect bg="dark" expand="lg" variant="dark">
            <Link className="navbar-brand" to="/">
                <img src={logo} width="30" height="30" className="d-inline-block align-top" alt=""></img>
                PokeGoBreeze
            </Link>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                    <Link className="nav-link" to="/">Home</Link>
                    <Link className="nav-link" to="/search">Search Pokémon</Link>
                    <Link className="nav-link" to="/type-effective">Type Effective</Link>
                    <Link className="nav-link" to="/weather-boosts">Weather Boosts</Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default NavbarComponent;