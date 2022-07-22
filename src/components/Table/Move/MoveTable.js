import { Fragment, useCallback, useEffect, useState } from "react";
import { capitalize, convertName, splitAndCapitalize } from "../../../util/Utils";
import { rankMove } from '../../../util/Calculate';

import pokemonCombatList from "../../../data/combat_pokemon_go_list.json";

import './MoveTable.css';
import { Link } from "react-router-dom";
import APIService from "../../../services/API.service";

const TableMove = (props) => {

    const [move, setMove] = useState({data: []});

    const findMove = useCallback(() => {
        let combatPoke = pokemonCombatList.filter(item => item.ID === parseInt(props.data.species.url.split("/")[6]));
        if (combatPoke && combatPoke.length === 1) return setMove(rankMove(combatPoke[0], props.statATK, props.statDEF, props.statSTA, props.data.types.map(item => capitalize(item.type.name))));

        let result = combatPoke.find(item => props.form && item.NAME === convertName(props.form.name));
        if (result === undefined) setMove(rankMove(combatPoke[0], props.statATK, props.statDEF, props.statSTA, props.data.types.map(item => capitalize(item.type.name))));
        else setMove(rankMove(result, props.statATK, props.statDEF, props.statSTA, props.form.types.map(item => capitalize(item.type.name))));
    }, [props.data, props.statATK, props.statDEF, props.statSTA, props.form]);

    useEffect(() => {
        if (props.data) findMove();
    }, [findMove, props.data]);

    const renderMovesetTable = (value, max, type) => {
        return (
            <tr>
                <td className="text-origin">
                    <Link to={"../moves/"+value.fmove.id} target="_blank" className="d-block">
                        <div className="d-inline-block" style={{verticalAlign: "text-bottom", marginRight: 5}}>
                            <img width={20} height={20} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(value.fmove.type.toLowerCase()))}/>
                        </div>
                        <span style={{marginRight: 5}} >{splitAndCapitalize(value.fmove.name.toLowerCase(), "_", " ").replaceAll(" Plus", "+")}</span>
                        <span style={{width: 'max-content'}}>
                            {value.fmove.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}
                        </span>
                    </Link>
                </td>
                <td className="text-origin">
                    <Link to={"../moves/"+value.cmove.id} target="_blank" className="d-block">
                        <div className="d-inline-block" style={{verticalAlign: "text-bottom", marginRight: 5}}>
                            <img width={20} height={20} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(value.cmove.type.toLowerCase()))}/>
                        </div>
                        <span style={{marginRight: 5}}>{splitAndCapitalize(value.cmove.name.toLowerCase(), "_", " ").replaceAll(" Plus", "+")}</span>
                        <span style={{width: 'max-content'}}>
                            {value.cmove.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}
                            {value.cmove.shadow && <span className="type-icon-small ic shadow-ic"><span>Shadow</span></span>}
                            {value.cmove.purified && <span className="type-icon-small ic purified-ic"><span>Purified</span></span>}
                        </span>
                    </Link>
                </td>
                <td className="text-center">{Math.round(value.eDPS[type]*100/max)}</td>
            </tr>
        )
    }

    return (
        <Fragment>
            <div className="row w-100" style={{margin: 0}}>
                <div className="col-xl table-moves-col" style={{padding: 0}}>
                    <table className="table-info table-moves">
                        <colgroup className="main-move" />
                        <colgroup className="main-move" />
                        <thead>
                            <tr className="text-center"><th className="table-sub-header" colSpan="3">Best Moves Offensive</th></tr>
                            <tr className="text-center">
                                <th className="table-column-head main-move">Fast</th>
                                <th className="table-column-head main-move">Charge</th>
                                <th className="table-column-head">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {move.data.sort((a,b) => b.eDPS.offensive - a.eDPS.offensive).map((value, index) => (
                                <Fragment key={index}>{renderMovesetTable(value, move.maxOff, "offensive")}</Fragment>
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
                            <tr className="text-center"><th className="table-sub-header" colSpan="3">Best Moves Defensive</th></tr>
                            <tr className="text-center">
                                <th className="table-column-head">Fast</th>
                                <th className="table-column-head">Charge</th>
                                <th className="table-column-head">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {move.data.sort((a,b) => b.eDPS.defensive - a.eDPS.defensive).map((value, index) => (
                                <Fragment key={index}>{renderMovesetTable(value, move.maxDef, "defensive")}</Fragment>
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
