import React from 'react';
import APIService from '../../../services/API.service';
import { capitalize, splitAndCapitalize } from '../../../util/Utils';
import './TypeBar.scss';

const TypeBar = (props: { type: string | null }) => {
  return (
    <div className={'d-flex align-items-center border-type ' + props.type?.toLowerCase()}>
      <span style={{ width: 35 }}>
        <img
          style={{ padding: 5, backgroundColor: 'black' }}
          className="sprite-type"
          alt="img-type-pokemon"
          src={APIService.getTypeHqSprite(capitalize(props.type))}
        />
      </span>
      <h3>{splitAndCapitalize(props.type?.toLowerCase(), '_', ' ')}</h3>
    </div>
  );
};

export default TypeBar;
