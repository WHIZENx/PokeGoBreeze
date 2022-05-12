import { Fragment, useCallback, useEffect, useState } from "react";
import { convertName, rankMove } from "../../Calculate/Calculate";

import pokemonCombatList from "../../../data/combat_pokemon_go_list.json";

import './MoveTable.css';
import Type from "../../Sprits/Type";
import { Link } from "react-router-dom";

const TableMove = (props) => {

    const [move, setMove] = useState({data: []});

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
        else setMove(rankMove(result, props.types.map(item => item.type.name)));
    }, [props.data, props.types]);

    useEffect(() => {
        findMove();
    }, [findMove]);

    return (
        <Fragment>
            <div className="row w-100" style={{margin: 0}}>
                <div className="col-xl table-moves-col" style={{padding: 0}}>
                    <table className="table-info table-moves">
                        <colgroup className="main-move" />
                        <colgroup className="main-move" />
                        <thead>
                            <tr className="center"><th className="table-sub-header" colSpan="3">Best Move ATK</th></tr>
                            <tr className="center">
                                <th className="table-column-head main-move">Fast</th>
                                <th className="table-column-head main-move">Charge</th>
                                <th className="table-column-head">%</th>
                            </tr>
                        </thead>
                        <tbody className="tbody-moves">
                            {move.data.sort((a,b) => b.eDPS.offensive - a.eDPS.offensive).map((value, index) => (
                                <tr key={index}>
                                    <td className="text-origin"><Link to={"../moves/"+value.fmove.id} target="_blank" className="d-flex align-items-center"><Type style={{marginBottom:0}} styled={true} height={20} arr={[capitalize(value.fmove.type.toLowerCase())]}/> <div><span className="text-b-ic">{splitAndCapitalize(value.fmove.name.toLowerCase(), "_")}</span>{value.fmove.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}</div></Link></td>
                                    <td className="text-origin"><Link to={"../moves/"+value.cmove.id} target="_blank" className="d-flex align-items-center"><Type style={{marginBottom:0}} styled={true} height={20} arr={[capitalize(value.cmove.type.toLowerCase())]}/> <div><span className="text-b-ic">{splitAndCapitalize(value.cmove.name.toLowerCase(), "_")}</span>{value.cmove.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}{value.cmove.shadow && <span className="type-icon-small ic shadow-ic"><span>Shadow</span></span>}{value.cmove.purified && <span className="type-icon-small ic purified-ic"><span>Purified</span></span>}</div></Link></td>
                                    <td className="center">{Math.round(value.eDPS.offensive*100/move.maxOff)}</td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                </div>
                <div className="col-xl table-moves-col" style={{padding: 0}}>
                    <table className="table-info table-moves">
                        <colgroup className="main-move" />
                        <colgroup className="main-move" />
                        <thead>
                            <tr className="center"><th className="table-sub-header" colSpan="3">Best Move DEF</th></tr>
                            <tr className="center">
                                <th className="table-column-head">Fast</th>
                                <th className="table-column-head">Charge</th>
                                <th className="table-column-head">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {move.data.sort((a,b) => b.eDPS.defensive - a.eDPS.defensive).map((value, index) => (
                                <tr key={index}>
                                    <td className="text-origin"><Link to={"../moves/"+value.fmove.id} target="_blank" className="d-flex align-items-center"><Type style={{marginBottom:0}} styled={true} height={20} arr={[capitalize(value.fmove.type.toLowerCase())]}/> <div><span className="text-b-ic">{splitAndCapitalize(value.fmove.name.toLowerCase(), "_")}</span>{value.fmove.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}</div></Link></td>
                                    <td className="text-origin"><Link to={"../moves/"+value.cmove.id} target="_blank" className="d-flex align-items-center"><Type style={{marginBottom:0}} styled={true} height={20} arr={[capitalize(value.cmove.type.toLowerCase())]}/> <div><span className="text-b-ic">{splitAndCapitalize(value.cmove.name.toLowerCase(), "_")}</span>{value.cmove.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}{value.cmove.shadow && <span className="type-icon-small ic shadow-ic"><span>Shadow</span></span>}{value.cmove.purified && <span className="type-icon-small ic purified-ic"><span>Purified</span></span>}</div></Link></td>
                                    <td className="center">{Math.round(value.eDPS.defensive*100/move.maxDef)}</td>
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