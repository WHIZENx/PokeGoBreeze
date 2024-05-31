import React, { Fragment } from 'react';
import TypeInfo from '../Sprites/Type/Type';

const WeatherEffective = (props: { weatherEffective: string[] }) => {
  return (
    <Fragment>
      {props.weatherEffective && (
        <div className="element-top">
          <h5 className="element-top">
            <li>Types Pokémon for Boosts</li>
          </h5>
          <TypeInfo arr={props.weatherEffective} style={{ marginLeft: 15 }} isShow={true} />
        </div>
      )}
    </Fragment>
  );
};

export default WeatherEffective;
