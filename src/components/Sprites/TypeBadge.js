import { capitalize } from "@mui/material";
import { Link } from "react-router-dom";
import APIService from "../../services/API.service";
import { splitAndCapitalize } from "../Calculate/Calculate";

import './TypeBadge.css';
import combatData from '../../data/combat.json';

const TypeBadge = (props) => {

    return (
        <Link target="_blank" to={"/moves/"+combatData.find(item => item.name === props.move.name).id} className="d-block type-badge-container">
            <span className="caption text-type-border">{props.title}</span>
            <div className="d-flex align-items-center position-relative">
                <span className={props.move.type.toLowerCase()+" type-border position-relative"}>
                    {(props.elite || props.shadow || props.purified) &&
                        <span className="type-badge-border">
                            {props.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}
                            {props.shadow && <span className="type-icon-small ic shadow-ic"><span>Shadow</span></span>}
                            {props.purified && <span className="type-icon-small ic purified-ic"><span>Purified</span></span>}
                        </span>
                    }
                    <span>{splitAndCapitalize(props.move.name, "_", " ")}</span>
                </span>
                <span className={props.move.type.toLowerCase()+" type-icon-border"}>
                    <img style={{padding: 5, backgroundColor: 'black'}} width={35} height={35} alt="img-type-pokemon" src={APIService.getTypeHqSprite(capitalize(props.move.type.toLowerCase()))}></img>
                </span>
            </div>
        </Link>
    )

}

export default TypeBadge;