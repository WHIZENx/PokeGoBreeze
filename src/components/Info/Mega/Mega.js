import { Fragment, useEffect, useState } from "react";
import evoData from "../../../data/evolution_pokemon_go.json";
import APIService from "../../../services/API.service";

import './Mega.css';

const Mega = (props) => {

    const [arrEvoList, setArrEvoList] = useState([]);

    useEffect(() => {
        setArrEvoList(props.formList.filter(item => item[0].form.form_name.includes("mega")).map(item => item[0].form));
    }, [props.formList]);

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = (string, join) => {
        return string.split("-").map(text => capitalize(text)).join(join);
    };

    const getQuestEvo = (name) => {
        name = name.split("-").map(text => text.toUpperCase()).join("_")
        try {
            return evoData.find(item => item.mega_evo.find(value => value.megaEvolutionName === name)).mega_evo.find(item => item.megaEvolutionName === name);
        } catch (error) {
            return {
                firstMegaEvolution: "Unavailable",
                megaEvolution: "Unavailable"
            };
        }
    }

    return (
        <Fragment>
            <h4 className="title-evo"><b>Mega Evolution</b></h4>
            <div className="mega-container scroll-form">
                <ul className="ul-evo">
                    {arrEvoList.map((value, evo) => (
                        <li key={evo} className='img-form-gender-group li-evo' style={{width: 'fit-content', height: 'fit-content'}}>
                            <img id="img-pokemon" width="96" height="96" alt="img-pokemon" src={value.sprites.front_default}></img>
                            <div id="id-pokemon" style={{color: 'black'}}><b>#{props.id}</b></div>
                            <div><b className="link-title">{splitAndCapitalize(value.name, " ")}</b></div>
                            <span className="caption">First mega evolution: <img alt="img-mega" width={25} height={25} src={APIService.getIconSprite("ic_mega")}></img><b>x{getQuestEvo(value.name).firstMegaEvolution}</b></span>
                            <span className="caption">Mega evolution: <img alt="img-mega" width={25} height={25} src={APIService.getIconSprite("ic_mega")}></img><b>x{getQuestEvo(value.name).megaEvolution}</b></span>
                        </li>
                    ))
                    }
                </ul>
            </div>
        </Fragment>
    )

}

export default Mega;