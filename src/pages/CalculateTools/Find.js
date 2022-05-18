import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { calculateStatsByTag, sortStatsPokemon } from "../../components/Calculate/Calculate";
import APIService from "../../services/API.service";
import Tools from "./Tools";

import pokemonData from '../../data/pokemon.json';
import pokeListName from '../../data/pokemon_names.json';

const Find = (props) => {

    const cardHeight = 57;
    const pageCardScroll = 10;

    const initialize = useRef(false);
    const [dataPri, setDataPri] = useState(null);
    const [stats, setStats] = useState(null);

    const searchResult = useRef(null);
    const searchResultID = useRef(0);

    const [id, setId] = useState(1);

    const [pokemonList, setPokemonList] = useState([]);
    const pokeList = useMemo(() => {return []}, []);

    const [searchTerm, setSearchTerm] = useState('');
    const currentPokemonListFilter = useRef([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    const convertArrStats = (data) => {
        return Object.entries(data).map(([key, value]) => {
            let stats = calculateStatsByTag(value.baseStats, value.slug);
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
            Object.entries(pokeListName).forEach(([key, value]) => {
                pokeList.push({id: value.id, name: value.name, sprites: APIService.getPokeSprite(value.id)});
            });
            setPokemonList(pokeList);
        }

        if (searchResult.current.scrollTop > (cardHeight*pageCardScroll)) searchResult.current.scrollTop = (cardHeight*pageCardScroll)-cardHeight;
        searchResultID.current = 1;
        const results = pokemonList.filter(item => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm));
        currentPokemonListFilter.current = results;
        setPokemonListFilter(currentPokemonListFilter.current.slice(0, 20));
    }, [pokeList, pokemonList, searchTerm]);

    const listenScrollEvent = (ele) => {
        let idScroll = Math.floor((ele.currentTarget.offsetHeight + ele.currentTarget.scrollTop) / (cardHeight*pageCardScroll));
        if (idScroll <= searchResultID.current) return;
        searchResultID.current = idScroll;
        setPokemonListFilter([...pokemonListFilter, ...currentPokemonListFilter.current.slice(idScroll*pageCardScroll, idScroll*pageCardScroll+pageCardScroll)])
    }

    const getInfoPoke = (value) => {
        const id = parseInt(value.currentTarget.dataset.id);
        setId(id);
        if (props.setId) props.setId(id);
        if (props.setName) props.setName(pokeList.find(item => item.id === id).name);
        props.clearStats();
    };

    const handleSetStats = (type, value) => {
        if (type === "atk") props.setStatATK(value)
        else if (type === "def") props.setStatDEF(value)
        else if (type === "sta") props.setStatSTA(value)
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

    return (
        <div className="container element-top">
            <h1 id ="main" className='center' style={{marginBottom: 15}}>{props.title ? props.title : "Pokémon GO Tools"}</h1>
            <div className="row search-container">
            {props.swap ?
                <Fragment>
                <div className="col d-flex justify-content-center center">
                    <div>
                    { pokeList.length > 0 && dataPri && stats &&
                        <Fragment>
                            <Tools setForm={props.setForm} count={pokeList.length} id={id} name={pokeList.find(item => item.id === id).name} data={dataPri} stats={stats} onHandleSetStats={handleSetStats} onClearArrStats={props.clearStats} onSetPrev={decId} onSetNext={incId} setUrlEvo={props.setUrlEvo}/>
                        </Fragment>
                    }
                    </div>
                </div>
                <div className="col d-flex justify-content-center" style={{height: pokemonListFilter.length*cardHeight+80, maxHeight: cardHeight*pageCardScroll+80}}>
                    <div className="btn-group-search">
                        <input type="text" className="form-control" aria-label="search" aria-describedby="input-search" placeholder="Enter name or ID"
                        value={searchTerm} onInput={e => setSearchTerm(e.target.value)}></input>
                    </div>
                    <div className="result-tools">
                        <ul ref={searchResult}
                            onScroll={listenScrollEvent.bind(this)}
                            style={pokemonListFilter.length < pageCardScroll ? {height: pokemonListFilter.length*cardHeight, overflowY: 'hidden'} : {height: cardHeight*pageCardScroll, overflowY: 'scroll'}}>
                            {pokemonListFilter.map((value, index) => (
                                <li style={{height: cardHeight}} className={"container card-pokemon "+(value.id===id ? "selected": "")} key={ index } onMouseDown={getInfoPoke.bind(this)} data-id={value.id}>
                                    <b>#{value.id}</b>
                                    <img width={36} height={36} className='img-search' alt='img-pokemon' src={value.sprites}></img>
                                    {value.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                </Fragment>
            :
                <Fragment>
                <div className="col d-flex justify-content-center" style={{height: pokemonListFilter.length*cardHeight+80, maxHeight: cardHeight*pageCardScroll+80}}>
                    <div className="btn-group-search">
                        <input type="text" className="form-control" aria-label="search" aria-describedby="input-search" placeholder="Enter name or ID"
                        value={searchTerm} onInput={e => setSearchTerm(e.target.value)}></input>
                    </div>
                    <div className="result-tools">
                        <ul ref={searchResult}
                            onScroll={listenScrollEvent.bind(this)}
                            style={pokemonListFilter.length < pageCardScroll ? {height: pokemonListFilter.length*cardHeight, overflowY: 'hidden'} : {height: cardHeight*pageCardScroll, overflowY: 'scroll'}}>
                            {pokemonListFilter.map((value, index) => (
                                <li style={{height: cardHeight}} className={"container card-pokemon "+(value.id===id ? "selected": "")} key={ index } onMouseDown={getInfoPoke.bind(this)} data-id={value.id}>
                                    <b>#{value.id}</b>
                                    <img width={36} height={36} className='img-search' alt='img-pokemon' src={value.sprites}></img>
                                    {value.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col d-flex justify-content-center center">
                    <div>
                    { pokeList.length > 0 && dataPri && stats &&
                        <Fragment>
                            <Tools setForm={props.setForm} count={pokeList.length} id={id} name={pokeList.find(item => item.id === id).name} data={dataPri} stats={stats} onHandleSetStats={handleSetStats} onClearArrStats={props.clearStats} onSetPrev={decId} onSetNext={incId} setUrlEvo={props.setUrlEvo}/>
                        </Fragment>
                    }
                    </div>
                </div>
                </Fragment>
            }
            </div>
        </div>
    )
}

export default Find;