import React, { Fragment } from 'react';
import Weather from '../Sprites/Weather';
import { IWeatherEffectiveComponent } from '../models/component.model';

const WeatherTypeEffective = (props: IWeatherEffectiveComponent) => {
  return (
    <Fragment>
      {props.weatherEffective && (
        <div className="mt-2">
          <h5 className="mt-2">
            <li>Weather Boosts</li>
          </h5>
          <Weather arr={props.weatherEffective} className="ms-3" />
        </div>
      )}
    </Fragment>
  );
};

export default WeatherTypeEffective;
