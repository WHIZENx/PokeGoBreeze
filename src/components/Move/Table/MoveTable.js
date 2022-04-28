import { Fragment, useCallback, useEffect, useState } from "react";
import { convertName, rankMove } from "../../Calculate/Calculate";

import pokemonCombatList from "../../../data/combat_pokemon_go_list.json";

import './MoveTable.css';
import Type from "../../Sprits/Type";
import { Link } from "react-router-dom";

const TableMove = (props) => {

    const [move, setMove] = useState([]);

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = (string, splitBy) => {
        return string.split(splitBy).map(text => capitalize(text.toLowerCase())).join(" ");
    };

    const findMove = useCallback(() => {
        let combatPoke = pokemonCombatList.filter(item => item.ID === parseInt(props.data.species.url.split("/")[6]));
        if (combatPoke && combatPoke.length === 1) return setMove(rankMove(combatPoke[0], props.data.types.map(item => item.type.name)));

        let result = combatPoke.find(item => item.NAME === convertName(props.data.name));
        if (result === undefined) setMove(rankMove(combatPoke[0], props.data.types.map(item => item.type.name)));
        else setMove(rankMove(result, props.data.types.map(item => item.type.name)));
    }, [props.data]);

    useEffect(() => {
        findMove();
    }, [findMove]);

    return (
        <Fragment>
            <div className="row w-100" style={{margin: 0}}>
                <div className="col-xl table-moves-col" style={{padding: 0}}>
                    <table className="table-info table-moves">
                        <thead></thead>
                        <tbody>
                            <tr className="center"><td className="table-sub-header" colSpan="3">Best Move ATK</td></tr>
                            <tr className="center">
                                <td className="table-column-head main-move">Fast</td>
                                <td className="table-column-head main-move">Charge</td>
                                <td className="table-column-head">%</td>
                            </tr>
                            {move.sort((a,b) => b.eDPS.offensive - a.eDPS.offensive).map((value, index) => (
                                <tr key={index}>
                                    <td className="text-origin main-move"><Link to={"../moves/"+value.fmove.id} target="_blank" className="d-flex"><Type styled={true} height={20} arr={[capitalize(value.fmove.type.toLowerCase())]}/> <span className={value.fmove.elite ? "text-danger":""}>{splitAndCapitalize(value.fmove.name.toLowerCase(), "_")}</span></Link></td>
                                    <td className="text-origin main-move"><Link to={"../moves/"+value.cmove.id} target="_blank" className="d-flex"><Type styled={true} height={20} arr={[capitalize(value.cmove.type.toLowerCase())]}/> <span className={value.cmove.elite ? "text-danger":""}>{splitAndCapitalize(value.cmove.name.toLowerCase(), "_")}</span></Link></td>
                                    <td className="center">{Math.round(100-(index*100/move.length))}</td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                </div>
                <div className="col-xl table-moves-col" style={{padding: 0}}>
                    <table className="table-info table-moves">
                        <thead></thead>
                        <tbody>
                            <tr className="center"><td className="table-sub-header" colSpan="3">Best Move DEF</td></tr>
                            <tr className="center">
                                <td className="table-column-head main-move">Fast</td>
                                <td className="table-column-head main-move">Charge</td>
                                <td className="table-column-head">%</td>
                            </tr>
                            {move.sort((a,b) => b.eDPS.defensive - a.eDPS.defensive).map((value, index) => (
                                <tr key={index}>
                                    <td className="text-origin main-move"><Link to={"../moves/"+value.fmove.id} target="_blank" className="d-flex"><Type styled={true} height={20} arr={[capitalize(value.fmove.type.toLowerCase())]}/> <span className={value.fmove.elite ? "text-danger":""}>{splitAndCapitalize(value.fmove.name.toLowerCase(), "_")}</span></Link></td>
                                    <td className="text-origin main-move"><Link to={"../moves/"+value.cmove.id} target="_blank" className="d-flex"><Type styled={true} height={20} arr={[capitalize(value.cmove.type.toLowerCase())]}/> <span className={value.cmove.elite ? "text-danger":""}>{splitAndCapitalize(value.cmove.name.toLowerCase(), "_")}</span></Link></td>
                                    <td className="center">{Math.round(100-(index*100/move.length))}</td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </Fragment>
    )

}

export default TableMove;