import React from 'react';
import APIService from '../../../services/API.service';
import { splitAndCapitalize } from '../../../utils/utils';
import './TypeBar.scss';
import { ITypeBarComponent } from '../../models/component.model';
import { combineClasses } from '../../../utils/extension';

const TypeBar = (props: ITypeBarComponent) => {
  return (
    <div className={combineClasses('d-flex align-items-center border-type', props.type?.toLowerCase())}>
      <span style={{ width: 35 }}>
        <img
          className="sprite-type p-1 bg-black"
          alt="Pokémon GO Type Logo"
          src={APIService.getTypeHqSprite(props.type)}
        />
      </span>
      <h3>{splitAndCapitalize(props.type?.toLowerCase(), '_', ' ')}</h3>
    </div>
  );
};

export default TypeBar;
