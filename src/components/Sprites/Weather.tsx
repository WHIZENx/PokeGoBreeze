import React, { Fragment } from 'react';
import APIService from '../../services/api.service';
import { splitAndCapitalize } from '../../utils/utils';
import { IWeatherComponent } from '../models/component.model';
import { isNotEmpty } from '../../utils/extension';
import { combineClasses } from '../../utils/extension';

const Weather = (props: IWeatherComponent) => {
  return (
    <Fragment>
      {!isNotEmpty(props.arr) ? (
        <div className="mt-2 d-flex ms-3">
          <div className="text-center" key={0}>
            <img height={50} alt="Pokémon Image" src={APIService.getPokeSprite()} />
            <span className="caption theme-text-primary">None</span>
          </div>
        </div>
      ) : (
        <div className={combineClasses('mt-2', props.className)} style={props.style}>
          {props.text && <p>{props.text}</p>}
          <div className="d-inline-flex flex-wrap type-list align-items-center">
            {props.arr?.map((value, index) => (
              <div className="text-center d-flex" key={index}>
                <div>
                  <img height={50} alt="Pokémon Image" src={APIService.getWeatherSprite(value)} />
                  <span className="caption theme-text-primary">{splitAndCapitalize(value, '_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Weather;
