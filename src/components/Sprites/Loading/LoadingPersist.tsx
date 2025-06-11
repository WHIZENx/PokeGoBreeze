import React from 'react';
import { TypeTheme } from '../../../enums/type.enum';
import { Navbar } from 'react-bootstrap';
import logo from '../../../assets/pokedex.png';

const navItemLink = (className: string, href: string, children: React.ReactNode) => {
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
};

const LoadingPersist = () => {
  return (
    <div className="w-100 h-100">
      <Navbar bg={TypeTheme.Dark} variant={TypeTheme.Dark} className="h-8">
        {navItemLink(
          'navbar-brand',
          '/',
          <>
            <img src={logo} width="30" height="30" className="d-inline-block align-top mx-2" alt="Home" />
            PokéGoBreeze
          </>
        )}
      </Navbar>
    </div>
  );
};

export default LoadingPersist;
