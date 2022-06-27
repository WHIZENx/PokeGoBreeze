import { Badge } from "@mui/material";
import { useState } from "react";
import SelectMove from "../Input/SelectMove";
import SelectPokemon from "../Input/SelectPokemon";

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const PokemonRaid = (props) => {

    const [dataTargetPokemon, setDataTargetPokemon] = useState(props.pokemon.dataTargetPokemon);
    const [fmoveTargetPokemon, setFmoveTargetPokemon] = useState(props.pokemon.fmoveTargetPokemon);
    const [cmoveTargetPokemon, setCmoveTargetPokemon] = useState(props.pokemon.cmoveTargetPokemon);

    const setDataPokemon = (value) => {
        props.data[props.id].dataTargetPokemon = value;
        setDataTargetPokemon(props.pokemon.dataTargetPokemon);
    }

    const setFMovePokemon = (value) => {
        props.data[props.id].fmoveTargetPokemon = value;
        setFmoveTargetPokemon(value);
    }

    const setCMovePokemon = (value) => {
        props.data[props.id].cmoveTargetPokemon = value;
        setCmoveTargetPokemon(value);
    }

    return (
        <div>
            <span className="input-group-text justify-content-center position-relative">
                <Badge color="primary" overlap="circular" badgeContent={props.id+1} /> <b style={{marginLeft: 15}}>Pokémon Battle</b>
                {props.onCopyPokemon &&
                <span className="ic-copy-small bg-primary text-white" title="Copy" onClick={() => props.onCopyPokemon(props.id)}>
                    <ContentCopyIcon sx={{fontSize: 16}}/>
                </span>
                }
            </span>
            <SelectPokemon clearData={props.clearData}
                            pokemon={dataTargetPokemon}
                            setCurrentPokemon={setDataPokemon}
                            setFMovePokemon={setFMovePokemon}
                            setCMovePokemon={setCMovePokemon}/>
            <span className="input-group-text justify-content-center"><b>Fast Move</b></span>
            <SelectMove selected={true} inputType={"small"} clearData={props.clearData} pokemon={dataTargetPokemon} move={fmoveTargetPokemon} setMovePokemon={setFMovePokemon} moveType="FAST"/>
            <span className="input-group-text justify-content-center"><b>Charge Move</b></span>
            <SelectMove selected={true} inputType={"small"} clearData={props.clearData} pokemon={dataTargetPokemon} move={cmoveTargetPokemon} setMovePokemon={setCMovePokemon} moveType="CHARGE"/>
        </div>
    )
}

export default PokemonRaid;