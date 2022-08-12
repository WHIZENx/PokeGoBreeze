import React from "react";
import { capitalize } from "@mui/material";
import { Link } from "react-router-dom";
import APIService from "../../../services/API.service";
import { splitAndCapitalize } from "../../../util/Utils";

import './TypeBadge.css';
import { useSelector } from "react-redux";

const TypeBadge = (props) => {

    const combat = useSelector((state) => state.store.data.combat);

    var move = props.move;
    if (!props.find) move = combat.find(item => item.name === props.move.name.replaceAll("_FAST", ""));

    return (
        <div className={"type-badge-container"+(props.grow ? ' filter-shadow' : '')} style={props.style}>
            <span className="caption text-type-border" style={{color: props.color ?? 'gray'}}>{props.title}</span>
            <Link target="_blank" to={"/moves/"+move.id} className="d-flex align-items-center position-relative" style={{width: 'fit-content'}}>
                <span className={move.type.toLowerCase()+" type-border position-relative"}>
                    {(props.elite || props.shadow || props.purified) &&
                        <span className="type-badge-border">
                            {props.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}
                            {props.shadow && <span className="type-icon-small ic shadow-ic"><span>Shadow</span></span>}
                            {props.purified && <span className="type-icon-small ic purified-ic"><span>Purified</span></span>}
                        </span>
                    }
                    <span>{splitAndCapitalize(props.move.name.replaceAll("_FAST", "").replaceAll("_PLUS", "+"), "_", " ")}</span>
                </span>
                <span className={move.type.toLowerCase()+" type-icon-border"}>
                    <div style={{width: 35}}>
                        <img style={{padding: 5, backgroundColor: 'black'}} className="sprite-type" alt="img-type-pokemon" src={APIService.getTypeHqSprite(capitalize(move.type.toLowerCase()))}/>
                    </div>
                </span>
            </Link>
        </div>
    )
}

export default TypeBadge;