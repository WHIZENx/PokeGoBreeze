import React from 'react';
import TypeInfo from '../Sprites/Type/Type';

const WeatherEffective = (props: { weatherEffective: string[] }) => {
  if (!props.weatherEffective) {
    return <></>;
  }

  return (
    <div className="element-top">
      <h5 className="element-top">
        <li>Types Pokémon for Boosts</li>
      </h5>
      <TypeInfo arr={props.weatherEffective} style={{ marginLeft: 15 }} />
    </div>
  );
};

export default WeatherEffective;
