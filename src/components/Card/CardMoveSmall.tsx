import React, { Fragment } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

import APIService from '../../services/API.service'
import { capitalize, splitAndCapitalize } from '../../util/Utils';
import { RootStateOrAny, useSelector } from 'react-redux';

const CardMoveSmall = (props: any) => {

    const combat = useSelector((state: RootStateOrAny) => state.store.data.combat);
    const type = props.value ? capitalize(combat.find((item: any) => item.name === props.value.name.replace("_FAST", "")).type.toLowerCase()) : "";

    return (
        <Fragment>
            {props.empty ?
                <div className='h-100'></div>
            :
            <Fragment>
                {props.value &&
                <div className={'d-flex align-items-center w-100 h-100'+(props.disable ? ' disable-card-move' : '')} style={{padding: 5, overflowX: 'hidden', whiteSpace: 'nowrap'}}>
                    <img width={18} height={18} alt='type-logo' style={{marginRight: 10}} src={APIService.getTypeSprite(type)}/>
                    <span style={{marginRight: 5}}>{splitAndCapitalize(props.value.name.replaceAll("_PLUS","+").replace("_FAST", ""), "_", " ")}</span>
                    <span className='d-flex'>{props.value.elite && <span className="type-icon-small ic elite-ic">Elite</span>}{props.value.shadow && <span className="type-icon-small ic shadow-ic">Shadow</span>}{props.value.purified && <span className="type-icon-small ic purified-ic">Purified</span>}</span>
                    {props.show && !props.disable &&
                    <div className='select-down d-flex align-items-center'>
                        <KeyboardArrowDownIcon fontSize="small"/>
                        {props.clearData &&
                            <CloseIcon className="remove-pokemon-select" sx={{color: 'red'}} onClick={() => props.clearData()}/>
                        }
                    </div>
                    }
                </div>
                }
            </Fragment>
            }

        </Fragment>
    );

}

export default CardMoveSmall;