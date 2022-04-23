import React, { Fragment } from 'react';
import APIService from '../../services/API.service'

const CardType = (props) => {

    return (
        <Fragment>
            {props.value ?
            <Fragment>
                <img width={64} height={64} alt='type-logo' style={{marginRight: 10}} src={APIService.getTypeSprite(props.value)}></img>
                <b>{props.name ? props.name : props.value}</b>
            </Fragment>
            :
            <Fragment>
                <div className='d-flex justify-content-center align-items-center w-100' style={{height: 64}}>
                    <b>- Select -</b>
                </div>
            </Fragment>
            }
        </Fragment>
    );

}

export default CardType;