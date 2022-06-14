import React, { Fragment } from 'react';
import APIService from '../../services/API.service'
import { capitalize, splitAndCapitalize } from '../Calculate/Calculate';

import combat from '../../data/combat.json';

const CardMove = (props) => {

    const type = props.value ? capitalize(combat.find(item => item.name === props.value.name.replace("_FAST", "")).type.toLowerCase()) : "";

    return (
        <Fragment>
            {props.value ?
            <Fragment>
                <img width={36} height={36} alt='type-logo' style={{marginRight: 10}} src={APIService.getTypeSprite(type)}></img>
                {splitAndCapitalize(props.value.name, "_", " ")} {props.value.elite && <span className="type-icon-small ic elite-ic">Elite</span>}{props.value.shadow && <span className="type-icon-small ic shadow-ic">Shadow</span>}{props.value.purified && <span className="type-icon-small ic purified-ic">Purified</span>}
            </Fragment>
            :
            <Fragment>
                <div className='d-flex justify-content-start align-items-center w-100' style={{height: 36}}>
                    None
                </div>
            </Fragment>
            }
        </Fragment>
    );

}

export default CardMove;