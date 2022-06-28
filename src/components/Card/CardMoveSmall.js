import React, { Fragment } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import APIService from '../../services/API.service'
import { capitalize, splitAndCapitalize } from '../../util/Util';

import combat from '../../data/combat.json';

const CardMoveSmall = (props) => {

    const type = props.value ? capitalize(combat.find(item => item.name === props.value.name.replace("_FAST", "")).type.toLowerCase()) : "";

    return (
        <Fragment>
            {props.value &&
            <div className='d-flex align-items-center w-100 h-100' style={{padding: 5, overflowX: 'hidden', whiteSpace: 'nowrap'}}>
                <img width={18} height={18} alt='type-logo' style={{marginRight: 10}} src={APIService.getTypeSprite(type)}></img>
                <span style={{marginRight: 5}}>{splitAndCapitalize(props.value.name.replaceAll("_PLUS","+").replace("_FAST", ""), "_", " ")}</span>
                <span className='d-flex'>{props.value.elite && <span className="type-icon-small ic elite-ic">Elite</span>}{props.value.shadow && <span className="type-icon-small ic shadow-ic">Shadow</span>}{props.value.purified && <span className="type-icon-small ic purified-ic">Purified</span>}</span>
                {props.show &&
                <div className='select-down d-flex align-items-center'>
                    <KeyboardArrowDownIcon fontSize="small"/>
                </div>
                }
            </div>
            }
        </Fragment>
    );

}

export default CardMoveSmall;