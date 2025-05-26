import React, { Fragment } from 'react';
import TypeInfo from '../Sprites/Type/Type';
import { IWeatherEffectiveComponent } from '../models/component.model';

const WeatherEffective = (props: IWeatherEffectiveComponent) => {
  return (
    <Fragment>
      {props.weatherEffective && (
        <div className="mt-2">
          <h5 className="mt-2">
            <li>Types Pokémon for Boosts</li>
          </h5>
          <TypeInfo arr={props.weatherEffective} className="ms-3" isShow />
        </div>
      )}
    </Fragment>
  );
};

export default WeatherEffective;
