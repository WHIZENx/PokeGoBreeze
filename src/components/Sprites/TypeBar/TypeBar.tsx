import React from 'react';
import APIService from '../../../services/API.service';
import { capitalize, splitAndCapitalize } from '../../../util/utils';
import './TypeBar.scss';
import { ITypeBarComponent } from '../../models/component.model';
import { combineClasses } from '../../../util/extension';

const TypeBar = (props: ITypeBarComponent) => {
  return (
    <div className={combineClasses('d-flex align-items-center border-type', props.type?.toLowerCase())}>
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
