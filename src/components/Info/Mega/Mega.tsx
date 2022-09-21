import React, { Fragment, useEffect, useState } from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import APIService from "../../../services/API.service";
import { splitAndCapitalize } from "../../../util/Utils";

import './Mega.css';

const Mega = (props: { formList: any; id: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }) => {

    const evoData = useSelector((state: RootStateOrAny) => state.store.data.evolution);
    const [arrEvoList, setArrEvoList] = useState([]);

    useEffect(() => {
        setArrEvoList(props.formList.filter((item: { form: { form_name: string | string[]; }; }[]) => item[0].form.form_name.includes("mega")).map((item: { form: any; }[]) => item[0].form));
    }, [props.formList]);

    const getQuestEvo = (name: string) => {
        name = name.split("-").map((text: string) => text.toUpperCase()).join("_")
        try {
            return evoData.find((item: { mega_evo: any[]; }) => item.mega_evo.find((value: { megaEvolutionName: any; }) => value.megaEvolutionName === name)).mega_evo.find((item: { megaEvolutionName: any; }) => item.megaEvolutionName === name);
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
            <div className="mega-container scroll-evolution">
                <ul className="ul-evo d-flex justify-content-center" style={{gap: 15}}>
                    {arrEvoList.map((value: any, evo) => (
                        <li key={evo} className='img-form-gender-group li-evo' style={{width: 'fit-content', height: 'fit-content'}}>
                            <img id="img-pokemon" height="96" alt="img-pokemon" src={APIService.getPokeGifSprite(value.name)}
                            onError={(e: any) => {e.onerror=null; e.target.src=`${value.sprites.front_default}`}}/>
                            <div id="id-pokemon" style={{color: 'black'}}><b>#{props.id}</b></div>
                            <div><b className="link-title">{splitAndCapitalize(value.name, "-", " ")}</b></div>
                            <span className="caption">First mega evolution: <img alt="img-mega" width={25} height={25} src={APIService.getIconSprite("ic_mega")}/><b>x{getQuestEvo(value.name).firstMegaEvolution}</b></span>
                            <span className="caption">Mega evolution: <img alt="img-mega" width={25} height={25} src={APIService.getIconSprite("ic_mega")}/><b>x{getQuestEvo(value.name).megaEvolution}</b></span>
                        </li>
                    ))
                    }
                </ul>
            </div>
        </Fragment>
    )

}

export default Mega;