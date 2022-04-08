import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { calBaseATK, calBaseDEF, calBaseSTA, calculateCP, predictStat, sortStatsPokemon } from "../../components/Calculate/Calculate";
import DataTable from 'react-data-table-component';
import APIService from "../../services/API.service";
import data from "../../data/cp_multiplier.json";

import Tools from "./Tools";

import './Tools.css';
import { useSnackbar } from "notistack";

const columns = [
    {
        name: 'Level',
        selector: row => row.level,
        sortable: true,
    },
    {
        name: 'ATK',
        selector: row => row.atk,
        sortable: true,
    },
    {
        name: 'DEF',
        selector: row => row.def,
        sortable: true,
    },
    {
        name: 'HP',
        selector: row => row.hp,
        sortable: true,
    },
];

const CalculateTools = () => {

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
    const [searchCP, setSearchCP] = useState(10);
    const currentPokemonListFilter = useRef([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [preArr, setPreArr] = useState([]);

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
    };

    const handleSetStats = (type, value) => {
        if (type === "atk") setStatATK(value)
        else if (type === "def") setStatDEF(value)
        else if (type === "sta") setStatSTA(value)
    }

    const findStats = () => {
        if (searchCP < 10) return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
        const result = predictStat(statATK, statDEF, statSTA, searchCP);
        setPreArr(result.result)
    }

    const findMinMax = () => {
        const columns = [
            {
                name: 'Level',
                selector: row => row.level,
                sortable: true,
            },
            {
                name: 'MIN CP',
                selector: row => row.minCP,
                sortable: true,
            },
            {
                name: 'MAX CP',
                selector: row => row.maxCP,
                sortable: true,
            },
        ];

        let dataTable = data.map(item => {
            return {level: item.level,
                minCP: calculateCP(statATK, statDEF, statSTA, item.level),
                maxCP: calculateCP(statATK+15, statDEF+15, statSTA+15, item.level)
            }
        });
        
        return (
            <DataTable
                title="Pokémon MIN/MAX CP"
                columns={columns}
                data={dataTable}
                pagination
                defaultSortFieldId={1}
            />
        )
    }

    return (
        <Fragment>
            <div className="container element-top">
                <h1 id ="main" className='center'>Pokémon GO Tools</h1>
                <div className="row search-container">
                    <div className="col d-flex justify-content-center select-pokemon">
                        <div className="">
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
                                <Tools id={id} name={pokeList.find(item => item.id === id).name} data={dataPri} stats={stats} onHandleSetStats={handleSetStats}/>
                            </Fragment>
                        }
                        </div>
                    </div>
                </div>
                <h1 id ="main" className='center'>CP&IV Calculate Tools</h1>
                <div className="row">
                    <div className="col d-flex justify-content-center">
                        <input value={searchCP} style={{height: 38}} type="number" min={10} className="form-control" aria-label="cp" aria-describedby="input-cp" placeholder="Enter CP"
                        onInput={e => setSearchCP(e.target.value)}></input>
                        <button type="button" className="btn btn-primary btn-search" onClick={findStats}>Search</button>
                    </div>
                    <div className="col">
                        
                    </div>
                </div>
                { preArr.length > 0 &&
                    <DataTable
                        title={"Levels/IV for CP: "+searchCP}
                        columns={columns}
                        data={preArr}
                        pagination
                        noDataComponent={"At CP: "+searchCP+" impossible found in pokémon "+pokeList.find(item => item.id === id).name}
                        defaultSortFieldId={1}
                    />
                }
                <hr></hr>
                <div className="element-top">
                    {findMinMax()}
                </div>
            </div>
        </Fragment>
    )
}

export default CalculateTools;