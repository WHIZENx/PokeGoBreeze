import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calBaseATK, calBaseDEF, calBaseSTA, predictCPList, predictStat, sortStatsPokemon } from "../../../components/Calculate/Calculate";
import APIService from "../../../services/API.service";
// import data from "../../../data/cp_multiplier.json";

import Tools from "../Tools";

import '../Tools.css';
import { useSnackbar } from "notistack";

const Calculate = () => {

    const cardHeight = 57;
    const pageCardScroll = 10;

    const initialize = useRef(false);
    const [dataPri, setDataPri] = useState(null);
    const [stats, setStats] = useState(null);

    const searchResult = useRef(null);
    const searchResultID = useRef(0);

    const [pokemonList, setPokemonList] = useState([]);
    const pokeList = useMemo(() => {return []}, []);

    const [id, setId] = useState(1);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchCP, setSearchCP] = useState('');

    const [searchATKIv, setSearchATKIv] = useState('');
    const [searchDEFIv, setSearchDEFIv] = useState('');
    const [searchSTAIv, setSearchSTAIv] = useState('');

    const currentPokemonListFilter = useRef([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const { enqueueSnackbar } = useSnackbar();

    const convertArrStats = (data) => {
        return Object.entries(data).map(([key, value]) => {
            return {id: value.num, name: value.slug, base_stats: value.baseStats,
            baseStatsPokeGo: {attack: calBaseATK(value.baseStats, true), defense: calBaseDEF(value.baseStats, true), stamina: calBaseSTA(value.baseStats, true)}}
        })
    };

    useEffect(() => {
        if (!initialize.current) {
            APIService.getFetchUrl('https://itsjavi.com/pokemon-assets/assets/data/pokemon.json')
            .then(res => {
                setStats(sortStatsPokemon(convertArrStats(res.data)));
                setDataPri(res.data);
            })
            .finally(initialize.current = true);
        }
        const fetchMyAPI = async () => {
            const res = await APIService.getPokeJSON('pokemon_names.json');
            Object.entries(res.data).forEach(([key, value]) => {
                pokeList.push({id: value.id, name: value.name, sprites: APIService.getPokeSprite(value.id)});
            });
            setPokemonList(pokeList);
        }
        if (pokeList.length === 0) fetchMyAPI();

        if (searchResult.current.scrollTop > (cardHeight*pageCardScroll)) searchResult.current.scrollTop = (cardHeight*pageCardScroll)-cardHeight;
        searchResultID.current = 1;
        const results = pokemonList.filter(item => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm));
        currentPokemonListFilter.current = results;
        setPokemonListFilter(currentPokemonListFilter.current.slice(0, 20));
    }, [searchTerm, pokemonList, pokeList, searchResult, id]);

    const listenScrollEvent = (ele) => {
        let idScroll = Math.floor((ele.currentTarget.offsetHeight + ele.currentTarget.scrollTop) / (cardHeight*pageCardScroll));
        if (idScroll <= searchResultID.current) return;
        searchResultID.current = idScroll;
        setPokemonListFilter([...pokemonListFilter, ...currentPokemonListFilter.current.slice(idScroll*pageCardScroll, idScroll*pageCardScroll+pageCardScroll)])
    }

    const getInfoPoke = (value) => {
        const id = parseInt(value.currentTarget.dataset.id);
        setId(id);
        clearArrStats();
    };

    const handleSetStats = (type, value) => {
        if (type === "atk") setStatATK(value)
        else if (type === "def") setStatDEF(value)
        else if (type === "sta") setStatSTA(value)
    }

    const findStatsIv = useCallback(() => {
        if (searchCP < 10) return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
        const result = predictStat(statATK, statDEF, statSTA, searchCP);
        return result;
    }, [enqueueSnackbar, searchCP, statATK, statDEF, statSTA]);

    const onFindStats = useCallback((e) => {
        findStatsIv()
        e.preventDefault();
    }, [findStatsIv]);

    const clearArrStats = () => {
        setSearchCP('');
        setSearchATKIv('');
        setSearchDEFIv('');
        setSearchSTAIv('');
    }

    const findStatsCP = useCallback(() => {
        if (searchATKIv < 0 || searchATKIv > 15 || searchDEFIv < 0 || searchDEFIv > 15 || searchSTAIv < 0 || searchSTAIv > 15) return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
        const result = predictCPList(statATK, statDEF, statSTA, searchATKIv, searchDEFIv, searchSTAIv);
        return result;
    }, [enqueueSnackbar, statATK, statDEF, statSTA, searchATKIv, searchDEFIv, searchSTAIv]);

    const onFindCP = useCallback((e) => {
        findStatsCP()
        e.preventDefault();
    }, [findStatsCP]);

    const decId = () => {
        setTimeout(() => {setId(id-1);}, 300);
    }

    const incId = () => {
        setTimeout(() => {setId(id+1);}, 300);
    }

    return (
        <Fragment>
            <div className="container element-top">
                <h1 id ="main" className='center'>Pokémon GO Tools</h1>
                <div className="row search-container">
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
                                <Tools count={pokeList.length} id={id} name={pokeList.find(item => item.id === id).name} data={dataPri} stats={stats} onHandleSetStats={handleSetStats} onClearArrStats={clearArrStats} onSetPrev={decId} onSetNext={incId}/>
                            </Fragment>
                        }
                        </div>
                    </div>
                </div>
                <h1 id ="main" className='center'>Calculate IV&CP</h1>
                <form className="d-flex justify-content-center element-top" onSubmit={onFindStats.bind(this)}>
                            <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">CP</span>
                        </div>
                    <input required value={searchCP} type="number" min={10} className="form-control" aria-label="cp" aria-describedby="input-cp" placeholder="Enter CP"
                    onInput={e => setSearchCP(e.target.value)}></input>
                    </div>
                    <div className="btn-search">
                        <button type="submit" className="btn btn-primary">Search</button>
                    </div>
                </form>
                <form id="formCP" className="d-flex justify-content-center element-top" onSubmit={onFindCP.bind(this)}>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">ATK</span>
                        </div>
                    <input required value={searchATKIv} style={{height: 38}} type="number" min={0} max={15} className="form-control" aria-label="atkIv" aria-describedby="input-atkIv" placeholder="Enter IV"
                    onInput={e => setSearchATKIv(e.target.value)}></input>
                    </div>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">DEF</span>
                        </div>
                    <input required value={searchDEFIv} style={{height: 38}} type="number" min={0} max={15} className="form-control" aria-label="defIv" aria-describedby="input-defIv" placeholder="Enter IV"
                    onInput={e => setSearchDEFIv(e.target.value)}></input>
                    </div>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">STA</span>
                        </div>
                    <input required value={searchSTAIv} style={{height: 38}} type="number" min={0} max={15} className="form-control" aria-label="staIv" aria-describedby="input-staIv" placeholder="Enter IV"
                    onInput={e => setSearchSTAIv(e.target.value)}></input>
                    </div>
                    <div className="btn-search">
                        <button type="submit" className="btn btn-primary">Search</button>
                    </div>
                </form>
                <div style={{height: 500}}>

                </div>
                <hr></hr>
            </div>
        </Fragment>
    )
}

export default Calculate;