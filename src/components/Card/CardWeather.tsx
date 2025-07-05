import React, { Fragment } from 'react';
import APIService from '../../services/api.service';
import { ICardWeatherComponent } from '../models/component.model';

const CardWeather = (props: ICardWeatherComponent) => {
  return (
    <Fragment>
      <img height={64} alt="Pokémon GO Type Logo" className="me-2" src={APIService.getWeatherSprite(props.value)} />
      <b>{props.value}</b>
    </Fragment>
  );
};

export default CardWeather;
