import { Fragment, useState } from "react";
import APIService from "../../../services/API.service";

import combatData from '../../../data/combat.json';

import { splitAndCapitalize } from "../../../util/Utils";
import CloseIcon from '@mui/icons-material/Close';
import CardMoveSmall from "../../../components/Card/CardMoveSmall";
import { calculateStatsByTag, calStatsProd } from "../../../util/Calculate";

const Select = ({data, pokemonBattle, setPokemonBattle, clearData}) => {

    const [show, setShow] = useState(false);
    const [showFMove, setShowFMove] = useState(false);
    const [showCMovePri, setShowCMovePri] = useState(false);
    const [showCMoveSec, setShowCMoveSec] = useState(false);

    const [search, setSearch] = useState('');

    const [pokemon, setPokemon] = useState(null);
    const [fMove, setFMove] = useState(null);
    const [cMovePri, setCMovePri] = useState(null);
    const [cMoveSec, setCMoveSec] = useState(null);

    const [pokemonIcon, setPokemonIcon] = useState(null)

    const selectPokemon = (value) => {
        clearData();
        let [fMove, cMovePri, cMoveSec] = value.moveset;
        setSearch(splitAndCapitalize(value.pokemon.name, "-", " "));
        setPokemonIcon(APIService.getPokeIconSprite(value.pokemon.sprite));
        setPokemon(value);

        if (fMove.includes("HIDDEN_POWER")) fMove = "HIDDEN_POWER";

        let fmove = combatData.find(item => item.name === fMove);
        if (value.moveset[0].includes("HIDDEN_POWER")) fmove = {...fmove, type: value.moveset[0].split("_")[2]}
        setFMove(fmove);

        if (cMovePri === "FUTURE_SIGHT") cMovePri = "FUTURESIGHT";
        if (cMovePri === "TECHNO_BLAST_DOUSE") cMovePri = "TECHNO_BLAST_WATER";
        cMovePri = combatData.find(item => item.name === cMovePri);
        setCMovePri(cMovePri);

        if (cMoveSec === "FUTURE_SIGHT") cMoveSec = "FUTURESIGHT";
        if (cMoveSec === "TECHNO_BLAST_DOUSE") cMoveSec = "TECHNO_BLAST_WATER";
        cMoveSec = combatData.find(item => item.name === cMoveSec);
        setCMoveSec(cMoveSec);

        const stats = calculateStatsByTag(value.pokemon.baseStats, value.pokemon.forme);
        const allStats = calStatsProd(stats.atk, stats.def, stats.sta, 500, 1500);
        setPokemonBattle({...pokemonBattle, pokemonData: {...value, bestStats: allStats[allStats.length-1]}, fMove: fmove, cMovePri: cMovePri, cMoveSec: cMoveSec})
    }

    const selectFMove = (value) => {
        setFMove(value);
        setPokemonBattle({...pokemonBattle, fMove: value});
        setShowFMove(false);
    }

    const selectCMovePri = (value) => {
        setCMovePri(value);
        setPokemonBattle({...pokemonBattle, cMovePri: value});
        setShowCMovePri(false);
    }

    const selectCMoveSec = (value) => {
        setCMoveSec(value);
        setPokemonBattle({...pokemonBattle, cMoveSec: value});
        setShowCMoveSec(false);
    }

    const removePokemon = () => {
        setPokemonIcon(null);
        setPokemon(null);
        setSearch('');
        setFMove(null);
        setCMovePri(null);
        setCMoveSec(null);
    }

    return (
        <Fragment>
            <h5>Pokemon</h5>
            <div className="border-box-battle position-relative">
                {pokemonIcon && <span className="remove-pokemon-select-right"><span onClick={() => removePokemon()} className="remove-pokemon-select"><CloseIcon sx={{color: 'red'}}/></span></span>}
                <input className="input-pokemon-select form-control shadow-none"
                onClick={() => setShow(true)}
                onBlur={() => setShow(false)}
                type="text"
                onInput={(e) => setSearch(e.target.value)}
                placeholder="Enter Name"
                style={{background: pokemonIcon ? `url(${pokemonIcon}) left no-repeat`: "", paddingLeft: pokemonIcon ? 56 : ""}}
                value={search}/>
            </div>
            {data &&
            <div className="result-pokemon" style={{display: show ? "block" : "none"}}>
                {data.filter(pokemon => splitAndCapitalize(pokemon.pokemon.name, "-", " ").toLowerCase().includes(search.toLowerCase())).map((value, index) => (
                    <div className="d-flex align-items-center card-pokemon-select" onMouseDown={() => selectPokemon(value)} key={index}>
                        <div style={{width: 64}}>
                            <img alt="img-pokemon" className="pokemon-sprite-medium" src={APIService.getPokeIconSprite(value.pokemon.sprite, true)}/>
                        </div>
                        <span>{splitAndCapitalize(value.pokemon.name, "-", " ")}</span>
                    </div>
                ))
                }
            </div>
            }
            <h5>Fast Moves</h5>
            <div className={'position-relative d-flex align-items-center form-control '+(pokemon ? "card-select-enabled" : "card-select-disabled")} style={{padding: 0, borderRadius: 0}}>
                <div className='card-move-input' tabIndex={ 0 } onClick={() => setShowFMove(true)} onBlur={() => setShowFMove(false)}>
                    <CardMoveSmall value={fMove} show={pokemon ? true : false}/>
                    {showFMove && data && pokemon &&
                        <div className="result-move-select">
                            <div>
                            {data
                            .find(value => value.speciesId === pokemon.speciesId).moves.fastMoves
                            .map(value => {
                                let move = value.moveId;
                                if (move.includes("HIDDEN_POWER")) move = "HIDDEN_POWER";
                                let fmove = combatData.find(item => item.name === move);
                                if (value.moveId.includes("HIDDEN_POWER")) fmove = {...fmove, type: value.moveId.split("_")[2]}
                                return fmove;
                            })
                            .filter(value => value.name !== fMove.name)
                            .map((value, index) => (
                                    <div className="card-move" key={ index } onMouseDown={() => selectFMove(value)}>
                                        <CardMoveSmall value={value}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            </div>
            <h5>Charged Moves Primary</h5>
            <div className={'position-relative d-flex align-items-center form-control '+(pokemon ? "card-select-enabled" : "card-select-disabled")} style={{padding: 0, borderRadius: 0}}>
                <div className='card-move-input' tabIndex={ 0 } onClick={() => setShowCMovePri(true)} onBlur={() => setShowCMovePri(false)}>
                    <CardMoveSmall value={cMovePri} show={pokemon ? true : false}/>
                    {showCMovePri && data && pokemon &&
                        <div className="result-move-select">
                            <div>
                            {data
                            .find(value => value.speciesId === pokemon.speciesId).moves.chargedMoves
                            .map(value => {
                                let move = value.moveId;
                                if (move === "FUTURE_SIGHT") move = "FUTURESIGHT";
                                if (move === "TECHNO_BLAST_DOUSE") move = "TECHNO_BLAST_WATER";
                                return combatData.find(item => item.name === move);
                            })
                            .filter(value => value.name !== cMovePri.name && value.name !== cMoveSec.name)
                            .map((value, index) => (
                                    <div className="card-move" key={ index } onMouseDown={() => selectCMovePri(value)}>
                                        <CardMoveSmall value={value}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            </div>
            <h5>Charged Moves Secondary</h5>
            <div className={'position-relative d-flex align-items-center form-control '+(pokemon ? "card-select-enabled" : "card-select-disabled")} style={{padding: 0, borderRadius: 0}}>
                <div className='card-move-input' tabIndex={ 0 } onClick={() => setShowCMoveSec(true)} onBlur={() => setShowCMoveSec(false)}>
                    <CardMoveSmall value={cMoveSec} show={pokemon ? true : false}/>
                    {showCMoveSec && data && pokemon &&
                        <div className="result-move-select">
                            <div>
                            {data
                            .find(value => value.speciesId === pokemon.speciesId).moves.chargedMoves
                            .map(value => {
                                let move = value.moveId;
                                if (move === "FUTURE_SIGHT") move = "FUTURESIGHT";
                                if (move === "TECHNO_BLAST_DOUSE") move = "TECHNO_BLAST_WATER";
                                return combatData.find(item => item.name === move);
                            })
                            .filter(value => value.name !== cMoveSec.name && value.name !== cMovePri.name)
                            .map((value, index) => (
                                    <div className="card-move" key={ index } onMouseDown={() => selectCMoveSec(value)}>
                                        <CardMoveSmall value={value}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            </div>
        </Fragment>
    )
}

export default Select;