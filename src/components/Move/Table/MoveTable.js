import { Fragment, useCallback, useEffect, useState } from "react";
import { convertName, rankMove } from "../../Calculate/Calculate";

import pokemonCombatList from "../../../data/combat_pokemon_go_list.json";

import './MoveTable.css';

const TableMove = (props) => {

    const [move, setMove] = useState(null);

    const findMove = useCallback(() => {
        let combatPoke = pokemonCombatList.filter(item => item.ID === parseInt(props.data.species.url.split("/")[6]));
        if (combatPoke && combatPoke.length === 1) return setMove(combatPoke[0]);

        let result = combatPoke.find(item => item.NAME === convertName(props.data.name));
        if (result === undefined) setMove(combatPoke[0]);
        else setMove(result);
    }, [props.data]);

    useEffect(() => {
        findMove();
    }, [findMove]);

    if (move) rankMove(move, props.data.types.map(item => item.type.name))

    return (
        <Fragment>
            {/* <table className="table-info table-moves">
                <thead></thead>
                <tbody>
                    <tr className="center">
                        <td className="table-sub-header" colSpan="2">Bast Move ATK</td>
                        <td className="table-sub-header" colSpan="2">Bast Move DEF</td>
                    </tr>
                    <tr colSpan="4">
                        <td className="table-column-head">555</td>
                        <td></td>
                        <td className="table-column-head">55</td>
                        <td></td>
                    </tr>
                </tbody>
            </table> */}
        </Fragment>
    )

}

export default TableMove;