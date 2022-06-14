import { Fragment } from "react"
import APIService from "../../services/API.service"
import { splitAndCapitalize } from "../Calculate/Calculate"

const CardPokemon = (props) => {

    return (
        <Fragment>
            {props.value &&
            <Fragment>
                <div className='d-flex justify-content-start align-items-center w-100'>
                    <img height={38} alt='pokemon-logo' style={{marginRight: 10}} src={APIService.getPokeIconSprite(props.value.sprite, true)}></img>
                    {splitAndCapitalize(props.value.name, "-", " ")}
                </div>
            </Fragment>
            }
        </Fragment>
    )
}

export default CardPokemon