import React, { Fragment } from 'react';
import APIService from '../../services/API.service'

const CardType = (props) => {

    return (
        <Fragment>
            <img width={64} height={64} alt='type-logo' style={{marginRight: 10}} src={APIService.getTypeSprite(props.value)}></img>
            <b>{props.value}</b>
        </Fragment>
    );

}

export default CardType;