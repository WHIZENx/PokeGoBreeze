import { useState } from "react";
import SelectMove from "../Input/SelectMove";
import SelectPokemon from "../Input/SelectPokemon";

const PokemonRaid = (props) => {

    const [dataTargetPokemon, setDataTargetPokemon] = useState(null);
    const [fmoveTargetPokemon, setFmoveTargetPokemon] = useState(null);
    const [cmoveTargetPokemon, setCmoveTargetPokemon] = useState(null);

    const setDataPokemon = (value) => {
        const item =  props.data.find(poke => poke.index === props.pokemon.index);
        item.dataTargetPokemon = value;
        setDataTargetPokemon(props.pokemon.dataTargetPokemon);
        props.setData(props.data);
    }

    const setFMovePokemon = (value) => {
        const item =  props.data.find(poke => poke.index === props.pokemon.index);
        item.fmoveTargetPokemon = value;
        setFmoveTargetPokemon(value);
        props.setData(props.data);
    }

    const setCMovePokemon = (value) => {
        const item =  props.data.find(poke => poke.index === props.pokemon.index);
        item.cmoveTargetPokemon = value;
        setCmoveTargetPokemon(value);
        props.setData(props.data);
    }

    return (
        <div>
            <span className="input-group-text justify-content-center"><b>Pokémon Battle</b></span>
            <SelectPokemon clearData={props.clearData}
                            setDataList={setDataPokemon}
                            setFMoveList={setFMovePokemon}
                            setCMoveList={setCMovePokemon}/>
            <span className="input-group-text justify-content-center"><b>Fast Move</b></span>
            <SelectMove inputType={"small"} clearData={props.clearData} pokemon={dataTargetPokemon} move={fmoveTargetPokemon} setMoveList={setFMovePokemon} moveType="FAST"/>
            <span className="input-group-text justify-content-center"><b>Charge Move</b></span>
            <SelectMove inputType={"small"} clearData={props.clearData} pokemon={dataTargetPokemon} move={cmoveTargetPokemon} setMoveList={setCMovePokemon} moveType="CHARGE"/>
        </div>
    )
}

export default PokemonRaid;