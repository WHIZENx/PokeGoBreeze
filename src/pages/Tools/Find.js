import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { calculateStatsByTag, sortStatsPokemon } from "../../components/Calculate/Calculate";
import APIService from "../../services/API.service";
import Tools from "./Tools";

import pokemonData from '../../data/pokemon.json';
import pokeListName from '../../data/pokemon_names.json';

const Find = (props) => {

    const [startIndex, setStartIndex] = useState(0);
    const firstInit = 20;
    const eachCounter = 10;
    const cardHeight = 65;

    const initialize = useRef(false);
    const [dataPri, setDataPri] = useState(null);
    const [stats, setStats] = useState(null);

    const [id, setId] = useState(1);

    const [pokemonList, setPokemonList] = useState([]);
    const pokeList = useMemo(() => {return []}, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    const convertArrStats = (data) => {
        return Object.values(data).map(value => {
            let stats = calculateStatsByTag(value.baseStats, value.forme);
            return {id: value.num, name: value.slug, base_stats: value.baseStats,
            baseStatsPokeGo: {attack: stats.atk, defense: stats.def, stamina: stats.sta}}
        })
    };

    useEffect(() => {
        if (!initialize.current) {
            // APIService.getFetchUrl('https://itsjavi.com/pokemon-assets/assets/data/pokemon.json')
            // .then(res => {
            //     setStats(sortStatsPokemon(convertArrStats(res.data)));
            //     setDataPri(res.data);
            // })
            // .finally(initialize.current = true);
            setStats(sortStatsPokemon(convertArrStats(pokemonData)));
            setDataPri(pokemonData);
            initialize.current = true
        }
        // const fetchMyAPI = async () => {
        //     const res = await APIService.getPokeJSON('pokemon_names.json');
        //     Object.entries(res.data).forEach(([key, value]) => {
        //         pokeList.push({id: value.id, name: value.name, sprites: APIService.getPokeSprite(value.id)});
        //     });
        //     setPokemonList(pokeList);
        // }
        // if (pokeList.length === 0) fetchMyAPI();

        if (pokeList.length === 0) {
            pokeList.push(...Object.values(pokeListName).map(item => { return {id: item.id, name: item.name, sprites: APIService.getPokeSprite(item.id)}}));
            setPokemonList(pokeList);
        }

        const results = pokemonList.filter(item => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm));
        setPokemonListFilter(results);
    }, [pokeList, pokemonList, searchTerm]);

    const listenScrollEvent = (ele) => {
        const scrollTop = ele.currentTarget.scrollTop;
        const fullHeight = ele.currentTarget.offsetHeight;
        if (scrollTop*1.1 >= fullHeight*(startIndex+1)) setStartIndex(startIndex+1);
    }

    const getInfoPoke = (value) => {
        const id = parseInt(value.currentTarget.dataset.id);
        setId(id);
        if (props.setId) props.setId(id);
        if (props.setName) props.setName(pokeList.find(item => item.id === id).name);
        props.clearStats();
    };

    const handleSetStats = (type, value) => {
        if (type === "atk" && props.setStatATK) props.setStatATK(value)
        else if (type === "def" && props.setStatDEF) props.setStatDEF(value)
        else if (type === "sta" && props.setStatSTA) props.setStatSTA(value)
    }

    const decId = () => {
        setTimeout(() => {
            setId(id-1);
            if (props.setId) props.setId(id-1);
            if (props.setName) props.setName(pokeList.find(item => item.id === id-1).name);
        }, 300);
        props.clearStats();
    }

    const incId = () => {
        setTimeout(() => {
            setId(id+1);
            if (props.setId) props.setId(id+1);
            if (props.setName) props.setName(pokeList.find(item => item.id === id+1).name);
        }, 300);
        props.clearStats();
    }

    const searchPokemon = () => {
        return (
            <div className="col d-flex justify-content-center" style={{height: Math.min(eachCounter, pokemonListFilter.slice(0, firstInit + eachCounter*startIndex).length+1)*cardHeight, maxHeight: eachCounter*cardHeight}}>
                <div className="btn-group-search">
                    <input type="text" className="form-control" aria-label="search" aria-describedby="input-search" placeholder="Enter name or ID"
                    value={searchTerm} onInput={e => setSearchTerm(e.target.value)}></input>
                </div>
                <div className="result tools" onScroll={listenScrollEvent.bind(this)}>
                    <Fragment>
                        {pokemonListFilter.slice(0, firstInit + eachCounter*startIndex).map((value, index) => (
                            <div className={"container card-pokemon "+(value.id===id ? "selected": "")} key={ index } onMouseDown={getInfoPoke.bind(this)} data-id={value.id}>
                                <b>#{value.id}</b>
                                <img width={36} height={36} className='img-search' alt='img-pokemon' src={value.sprites}></img>
                                {value.name}
                            </div>
                        ))}
                    </Fragment>
                </div>
            </div>
        )
    }

    const showPokemon = () => {
        return (
            <div className="col d-flex justify-content-center center">
                <div>
                { pokeList.length > 0 && dataPri && stats &&
                    <Fragment>
                        <Tools setForm={props.setForm} count={pokeList.length} id={id} name={pokeList.find(item => item.id === id).name} data={dataPri} stats={stats} onHandleSetStats={handleSetStats} onClearArrStats={props.clearStats} onSetPrev={decId} onSetNext={incId} setUrlEvo={props.setUrlEvo}/>
                    </Fragment>
                }
                </div>
            </div>
        )
    }

    return (
        <div className="container element-top">
            <h1 id ="main" className='center' style={{marginBottom: 15}}>{props.title ? props.title : "Pokémon GO Tools"}</h1>
            <div className="row search-container">
            {props.swap ?
                <Fragment>
                    {showPokemon()}
                    {searchPokemon()}
                </Fragment>
            :
                <Fragment>
                    {searchPokemon()}
                    {showPokemon()}
                </Fragment>
            }
            </div>
        </div>
    )
}

export default Find;