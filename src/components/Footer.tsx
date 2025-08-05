import React from 'react';
import { Link } from 'react-router-dom';

const FooterComponent = () => {
  return (
    <footer className="tw-bg-gray-100 tw-text-center lg:tw-text-start">
      <div className="tw-text-center tw-p-3">
        © 2022 Copyright:
        <Link className="tw-text-default" to="/">
          PokéGoBreeze
        </Link>
      </div>
    </footer>
  );
};

export default FooterComponent;
