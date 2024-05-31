import React, { Fragment } from 'react';
import Weather from '../Sprites/Weather';

const WeatherTypeEffective = (props: { weatherEffective: string[] }) => {
  return (
    <Fragment>
      {props.weatherEffective && (
        <div className="element-top">
          <h5 className="element-top">
            <li>Weather Boosts</li>
          </h5>
          <Weather arr={props.weatherEffective} style={{ marginLeft: 15 }} />
        </div>
      )}
    </Fragment>
  );
};

export default WeatherTypeEffective;
