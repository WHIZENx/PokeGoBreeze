import React from 'react';
import { Link } from 'react-router-dom';

const FooterComponent = () => {
    return (
        <footer className="bg-light text-center text-lg-start">
            <div className="text-center p-3">
                © 2022 Copyright: 
                <Link className="text-dark" to="/">PokeGoBreeze</Link>
            </div>
        </footer>
    )
}

export default FooterComponent;

