import React, { Fragment } from 'react';
import TypeInfo from '../Sprites/Type/Type';
import { IWeatherEffectiveComponent } from '../models/component.model';

const WeatherEffective = (props: IWeatherEffectiveComponent) => {
  return (
    <Fragment>
      {props.weatherEffective && (
        <div className="element-top">
          <h5 className="element-top">
            <li>Types Pokémon for Boosts</li>
          </h5>
          <TypeInfo arr={props.weatherEffective} className="ms-3" isShow={true} />
        </div>
      )}
    </Fragment>
  );
};

export default WeatherEffective;
