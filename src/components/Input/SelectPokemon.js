import CardPokemon from "../Card/CardPokemon";
import CloseIcon from '@mui/icons-material/Close';

import pokemonData from '../../data/pokemon.json';
import { useState } from "react";

import './Select.css';
import { splitAndCapitalize } from "../Calculate/Calculate";
import APIService from "../../services/API.service";

const SelectPokemon = (props) => {

    const [startIndex, setStartIndex] = useState(0);
    const firstInit = 20;
    const eachCounter = 10;

    const [pokemonIcon, setPokemonIcon] = useState(null);
    const [showPokemon, setShowPokemon] = useState(false);
    const [search, setSearch] = useState('');

    const listenScrollEvent = (ele) => {
        const scrollTop = ele.currentTarget.scrollTop;
        const fullHeight = ele.currentTarget.offsetHeight;
        if (scrollTop*1.1 >= fullHeight*(startIndex+1)) setStartIndex(startIndex+1);
    }

    const changePokemon = (value) => {
        setShowPokemon(false);
        if (props.setCurrentPokemon) props.setCurrentPokemon({...props.filters, targetPokemon: value});
        setPokemonIcon(APIService.getPokeIconSprite(value.sprite));
        setSearch(splitAndCapitalize(value.name, "-", " "));
    }

    const removePokemon = () => {
        if (props.setCurrentPokemon) props.setCurrentPokemon({...props.filters, targetPokemon: null});
        setPokemonIcon(null);
        setSearch('');
    }

    return (
        <div className=' d-flex justify-content-start'>
            <div className='card-pokemon-input' >
                <div className="d-flex align-items-center">
                    {pokemonIcon && <span onClick={() => removePokemon()} style={{cursor: 'pointer'}}><CloseIcon sx={{color: 'red'}}/></span>}
                    <input className="input-pokemo-select form-control shadow-none"
                    onClick={() => setShowPokemon(true)}
                    onBlur={() => setShowPokemon(false)}
                    value={search}
                    type="text"
                    onInput={(e) => setSearch(e.target.value)}
                    placeholder="Enter name or ID"
                    style={{background: pokemonIcon ? `url(${pokemonIcon}) left no-repeat`: "",
                    paddingLeft: pokemonIcon ? 56 : ""}}/>
                </div>
                {showPokemon &&
                    <div className="result-pokemon" onScroll={listenScrollEvent.bind(this)}>
                        <div>
                            {Object.values(pokemonData).filter(item => item.num > 0 && (splitAndCapitalize(item.name, "-", " ").toLowerCase().includes(search.toLowerCase()) || item.num.toString().includes(search))).slice(0, firstInit + eachCounter*startIndex).map((value, index) => (
                                <div className="card-pokemon-select" key={ index } onMouseDown={() => changePokemon(value)}>
                                    <CardPokemon value={value}/>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default SelectPokemon;