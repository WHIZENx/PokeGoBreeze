/* eslint-disable react/prop-types */
import React, { Fragment } from 'react';
import APIService from '../../services/API.service'

const CardWeather = (props) => {

    return (
        <Fragment>
            <img height={64} alt='type-logo' style={{marginRight: 10}} src={APIService.getWeatherSprite(props.value)}/>
            <b>{props.value}</b>
        </Fragment>
    );

}

export default CardWeather;