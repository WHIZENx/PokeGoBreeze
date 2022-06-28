import { Badge } from "@mui/material";
import { useEffect, useState } from "react";
import SelectMove from "../Input/SelectMove";
import SelectPokemon from "../Input/SelectPokemon";

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

import update from 'immutability-helper';

const PokemonRaid = ({id, pokemon, data, setData, controls, onCopyPokemon, onRemovePokemon, clearData}) => {

    const [dataTargetPokemon, setDataTargetPokemon] = useState(pokemon.dataTargetPokemon);
    const [fmoveTargetPokemon, setFmoveTargetPokemon] = useState(pokemon.fmoveTargetPokemon);
    const [cmoveTargetPokemon, setCmoveTargetPokemon] = useState(pokemon.cmoveTargetPokemon);

    useEffect(() => {
        setData(update(data, {[id]: {
            $merge : {
                dataTargetPokemon: dataTargetPokemon,
                fmoveTargetPokemon: fmoveTargetPokemon,
                cmoveTargetPokemon: cmoveTargetPokemon
            }}}));
    }, [data, dataTargetPokemon, fmoveTargetPokemon, cmoveTargetPokemon, id, setData])

    const setDataPokemon = (value) => {
        setDataTargetPokemon(value);
    }

    const setFMovePokemon = (value) => {
        setFmoveTargetPokemon(value);
    }

    const setCMovePokemon = (value) => {
        setCmoveTargetPokemon(value);
    }

    return (
        <div>
            <span className="input-group-text justify-content-center position-relative">
                <Badge color="primary" overlap="circular" badgeContent={id+1} /> <b style={{marginLeft: 15}}>Pokémon Battle</b>
                {controls &&
                <div className="d-flex ic-group-small">
                    <span className="ic-copy-small bg-primary text-white" title="Copy" onClick={() => onCopyPokemon(id)} style={{marginRight: 5}}>
                        <ContentCopyIcon sx={{fontSize: 16}}/>
                    </span>
                    <span className={"ic-remove-small text-white "+(id > 0 ? "bg-danger" : "click-none bg-secondary")} title="Remove"
                    onClick={() => {
                        if (id > 0) {
                            setDataTargetPokemon(data[id+1] ? data[id+1].dataTargetPokemon : null);
                            setFmoveTargetPokemon(data[id+1] ? data[id+1].fmoveTargetPokemon : null);
                            setCmoveTargetPokemon(data[id+1] ? data[id+1].cmoveTargetPokemon : null);
                            onRemovePokemon(id);
                        }
                        }}>
                        <DeleteIcon sx={{fontSize: 16}}/>
                    </span>
                </div>
                }
            </span>
            <SelectPokemon clearData={clearData}
                            selected={true}
                            pokemon={dataTargetPokemon}
                            setCurrentPokemon={setDataPokemon}
                            setFMovePokemon={setFMovePokemon}
                            setCMovePokemon={setCMovePokemon}/>
            <span className="input-group-text justify-content-center"><b>Fast Move</b></span>
            <SelectMove selected={true} inputType={"small"} clearData={clearData} pokemon={dataTargetPokemon} move={fmoveTargetPokemon} setMovePokemon={setFMovePokemon} moveType="FAST"/>
            <span className="input-group-text justify-content-center"><b>Charge Move</b></span>
            <SelectMove selected={true} inputType={"small"} clearData={clearData} pokemon={dataTargetPokemon} move={cmoveTargetPokemon} setMovePokemon={setCMovePokemon} moveType="CHARGE"/>
        </div>
    )
}

export default PokemonRaid;