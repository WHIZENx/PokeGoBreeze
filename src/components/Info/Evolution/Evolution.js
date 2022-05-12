import { Badge } from "@mui/material";
import { Fragment, useCallback, useEffect, useState } from "react";
import Xarrow from "react-xarrows";
import { Link } from "react-router-dom";
import APIService from "../../../services/API.service";

import "./Evolution.css"

const Evolution = (props) => {

    const [arrEvoList, setArrEvoList] = useState([]);

    const getEvoChain = useCallback((data) => {
        if (data.length === 0) return false;
        setArrEvoList(oldArr => [...oldArr, data.map(item => {
            return {name: item.species.name, id: item.species.url.split("/")[6], baby: item.is_baby}
        })])
        return data.map(item => getEvoChain(item.evolves_to))
    }, []);

    useEffect(() => {
        APIService.getFetchUrl(props.evolution_url)
        .then(res => {
            getEvoChain([res.data.chain]);
        })
    }, [props.evolution_url, getEvoChain]);

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = (string, join) => {
        return string.split("-").map(text => capitalize(text)).join(join);
    };

    const handlePokeID = (id) => {
        if (id !== props.id.toString()) {
            props.onSetPrev(false);
            props.onSetNext(false);
            props.onSetIDPoke(parseInt(id));
        }
    };

    const setHeightEvo = () => {
        let noEvo = 0;
        if (arrEvoList.map(item => item.length).reduce((a, v) => a + v, 0) === 1) noEvo += 25;
        const lengths = arrEvoList.map(item => item.length);
        const result = lengths.indexOf(Math.max(...lengths));
        const isNotBaby = arrEvoList[result].filter(ele => !ele.baby).length;
        const isBaby = arrEvoList[result].filter(ele => ele.baby).length;
        return 170 * isBaby + 160 * isNotBaby + noEvo;
    }

    const renderImageEvo = (value, chain, evo, index, evoCount) => {
        let showArrow = true;
        let offsetY = 35;
        offsetY += value.baby ? 20 : 0
        offsetY += arrEvoList.length === 1 ? 20 : 0
        let startAnchor = index > 0 ? {position: "bottom", offset: {y:offsetY}} : {position: "right", offset: {x:-10}};
        // const evoContainer = document.documentElement.getElementsByClassName('evo-container')[0];
        // if (evoContainer && window.innerWidth < 362) showArrow = false;
        return (
            <Fragment>
                {showArrow && evo > 0 && <Xarrow
                strokeWidth={2} path="grid" startAnchor={startAnchor} endAnchor={"left"}
                start={`evo-${evo-1}-${chain.length > 1 ? 0 : index}`} end={`evo-${evo}-${chain.length > 1 ? index : 0}`} />}
                <Badge color="primary" overlap="circular" badgeContent={evo+1}>
                    <img id="img-pokemon" width="96" height="96" alt="img-pokemon" src={APIService.getPokeSprite(value.id)}></img>
                </Badge>
                <div id="id-pokemon" style={{color: 'black'}}><b>#{value.id}</b></div>
                <div><b className="link-title">{splitAndCapitalize(value.name)}</b></div>
                { value.baby && <span className="caption text-danger">(Baby)</span>}
                {arrEvoList.length === 1 && <span className="caption text-danger">(No Evolution)</span>}
                <p>{ value.id === props.id.toString() && <span className="caption">Current</span>}</p>
            </Fragment>
        )
    }

    return (
        <Fragment>
            { arrEvoList.length > 0 &&
            <Fragment>
            <h4 className="title-evo"><b>Evolution Chain</b></h4>
            <div className="evo-container scroll-form" style={{minHeight:setHeightEvo()}}>
                <ul className="ul-evo">
                    {arrEvoList.map((values, evo) => (
                        <li key={evo} className='img-form-gender-group li-evo'>
                            <ul className="ul-evo">
                                {values.map((value, index) => (
                                    <li id={"evo-"+evo+"-"+index} key={index} className='img-form-gender-group img-evo-group li-evo'>
                                        {props.onSetIDPoke ?
                                        <div className="select-evo" onClick={() => {handlePokeID(value.id)}}>
                                            {renderImageEvo(value, values, evo, index, arrEvoList.length)}
                                        </div>
                                        :
                                        <Link className="select-evo" to={"/pokemon/"+value.name} onClick={() => {handlePokeID(value.id)}}>
                                            {renderImageEvo(value, values, evo, index, arrEvoList.length)}
                                        </Link>
                                        }
                                    </li>
                                ))
                                }
                            </ul>
                        </li>
                    ))
                    }
                </ul>
            </div>
            </Fragment>
            }
        </Fragment>
    )
}

export default Evolution;