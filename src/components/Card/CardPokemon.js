import React, { Fragment } from "react"
import APIService from "../../services/API.service"
import { splitAndCapitalize } from "../../util/Utils"

const CardPokemon = (props) => {

    return (
        <Fragment>
            {props.value &&
            <Fragment>
                <div className='d-flex align-items-center w-100'>
                    <img height={38} alt='pokemon-logo' style={{marginRight: 10}} src={APIService.getPokeIconSprite(props.value.sprite, true)}
                    onError={(e) => {e.onerror=null;e.target.src=APIService.getPokeIconSprite("unknown-pokemon");}}/>
                    {splitAndCapitalize(props.value.name, "-", " ")}
                </div>
            </Fragment>
            }
        </Fragment>
    )
}

export default CardPokemon