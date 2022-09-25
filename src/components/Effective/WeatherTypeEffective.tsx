import React from 'react';
import Weather from '../Sprites/Weather';

const WeatherTypeEffective = (props: any) => {
  if (!props.weatherEffective) return <></>;

  return (
    <div className="element-top">
      <h5 className="element-top">
        <li>Weather Boosts</li>
      </h5>
      <Weather arr={props.weatherEffective} style={{ marginLeft: 15 }} />
    </div>
  );
};

export default WeatherTypeEffective;
