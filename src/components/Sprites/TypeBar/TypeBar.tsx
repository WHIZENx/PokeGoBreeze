import React from 'react';
import APIService from '../../../services/api.service';
import { splitAndCapitalize } from '../../../utils/utils';
import './TypeBar.scss';
import { ITypeBarComponent } from '../../models/component.model';
import { combineClasses } from '../../../utils/extension';

const TypeBar = (props: ITypeBarComponent) => {
  return (
    <div className={combineClasses('tw-flex tw-align-items-center border-type', props.type?.toLowerCase())}>
      <span className="tw-w-[35px]">
        <img
          className="sprite-type tw-p-1 tw-bg-black"
          alt="Pokémon GO Type Logo"
          src={APIService.getTypeHqSprite(props.type)}
        />
      </span>
      <h3>{splitAndCapitalize(props.type?.toLowerCase(), '_', ' ')}</h3>
    </div>
  );
};

export default TypeBar;
