import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import { ICardWeatherComponent } from '../models/component.model';

const CardWeather = (props: ICardWeatherComponent) => {
  return (
    <Fragment>
      <img
        height={64}
        alt="Pokémon GO Type Logo"
        style={{ marginRight: 10 }}
        src={APIService.getWeatherSprite(props.value)}
      />
      <b>{props.value}</b>
    </Fragment>
  );
};

export default CardWeather;
