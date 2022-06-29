import { Fragment } from "react";
import APIService from "../../services/API.service";
import { capitalize, splitAndCapitalize } from "../../util/Utils";

import combat from '../../data/combat.json';

const CardMove = (props) => {

    const type = props.value ? capitalize(combat.find(item => item.name === props.value.name.replace("_FAST", "")).type.toLowerCase()) : "";

    return(
        <Fragment>
            {props.value &&
                <div className='d-flex align-items-center w-100 h-100' style={{padding: 5, overflowX: 'hidden', whiteSpace: 'nowrap'}}>
                    <img width={64} height={64} alt='type-logo' style={{marginRight: 10}} src={APIService.getTypeSprite(type)}/>
                    <span style={{marginRight: 5}}><b>{splitAndCapitalize(props.value.name.replaceAll("_PLUS","+").replace("_FAST", ""), "_", " ")}</b></span>
                    <span className='d-flex'>{props.value.elite && <span className="type-icon-small ic elite-ic">Elite</span>}{props.value.shadow && <span className="type-icon-small ic shadow-ic">Shadow</span>}{props.value.purified && <span className="type-icon-small ic purified-ic">Purified</span>}</span>
                </div>
            }
        </Fragment>
    )
}

export default CardMove;