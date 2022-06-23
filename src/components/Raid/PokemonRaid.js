import { useEffect, useRef, useState } from "react";
import SelectMove from "../Input/SelectMove";
import SelectPokemon from "../Input/SelectPokemon";

const PokemonRaid = (props) => {

    const [dataTargetPokemon, setDataTargetPokemon] = useState(null);
    const [fmoveTargetPokemon, setFmoveTargetPokemon] = useState(null);
    const [cmoveTargetPokemon, setCmoveTargetPokemon] = useState(null);

    const initialize = useRef(false);

    useEffect(() => {
        if (!initialize.current) {
            props.setData(prevData => [...prevData, {
                dataTargetPokemon: dataTargetPokemon,
                fmoveTargetPokemon: fmoveTargetPokemon,
                cmoveTargetPokemon: cmoveTargetPokemon,
                index: props.index
            }]);
            initialize.current = true;
        }
    }, [cmoveTargetPokemon, dataTargetPokemon, fmoveTargetPokemon, props]);

    const setDataPokemon = (value) => {
        const item =  props.data.find(poke => poke.index === props.index);
        item.dataTargetPokemon = value;
        props.setData(props.data);
    }

    const setFMovePokemon = (value) => {
        const item =  props.data.find(poke => poke.index === props.index);
        item.fmoveTargetPokemon = value;
        props.setData(props.data);
    }

    const setCMovePokemon = (value) => {
        const item =  props.data.find(poke => poke.index === props.index);
        item.cmoveTargetPokemon = value;
        props.setData(props.data);
    }

    return (
        <div>
            <span className="input-group-text justify-content-center"><b>Pokémon Battle</b></span>
            <SelectPokemon clearData={props.clearData}
                            setCurrentPokemon={setDataTargetPokemon}
                            setFMovePokemon={setFmoveTargetPokemon}
                            setCMovePokemon={setCmoveTargetPokemon}
                            setDataList={setDataPokemon}
                            setFMoveList={setFMovePokemon}
                            setCMoveList={setCMovePokemon}/>
            <span className="input-group-text justify-content-center"><b>Fast Move</b></span>
            <SelectMove inputType={"small"} clearData={props.clearData} pokemon={dataTargetPokemon} move={fmoveTargetPokemon} setMovePokemon={setFmoveTargetPokemon} setMoveList={setFMovePokemon} moveType="FAST"/>
            <span className="input-group-text justify-content-center"><b>Charge Move</b></span>
            <SelectMove inputType={"small"} clearData={props.clearData} pokemon={dataTargetPokemon} move={cmoveTargetPokemon} setMovePokemon={setCmoveTargetPokemon} setMoveList={setCMovePokemon} moveType="CHARGE"/>
        </div>
    )
}

export default PokemonRaid;