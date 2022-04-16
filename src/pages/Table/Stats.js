import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { calBaseATK, calBaseDEF, calBaseSTA, calStatsProd, sortStatsPokemon } from "../../components/Calculate/Calculate";
import APIService from "../../services/API.service";
import Tools from "../CalculateTools/Tools";

const columnsStats = [
    {
        name: 'Rank',
        selector: row => row.rank,
        sortable: true,
    },
    {
        name: 'Level',
        selector: row => row.level,
        sortable: true,
    },
    {
        name: 'IV ATK',
        selector: row => row.IV.atk,
        sortable: true,
    },
    {
        name: 'IV DEF',
        selector: row => row.IV.def,
        sortable: true,
    },
    {
        name: 'IV STA',
        selector: row => row.IV.sta,
        sortable: true,
    },
    {
        name: 'CP',
        selector: row => row.CP,
        sortable: true,
    },
    {
        name: 'Stat Prod',
        selector: row => parseFloat(row.ratio.toFixed(2)),
        sortable: true,
    },
];

const StatsTable = (props) => {

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

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [statsBattle, setStatsBattle] = useState([]);

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

        setStatsBattle(calStatsProd(statATK, statDEF, statSTA, 1500))
    }, [pokeList, pokemonList, searchTerm, statATK, statDEF, statSTA]);

    const listenScrollEvent = (ele) => {
        let idScroll = Math.floor((ele.currentTarget.offsetHeight + ele.currentTarget.scrollTop) / (cardHeight*pageCardScroll));
        if (idScroll <= searchResultID.current) return;
        searchResultID.current = idScroll;
        setPokemonListFilter([...pokemonListFilter, ...currentPokemonListFilter.current.slice(idScroll*pageCardScroll, idScroll*pageCardScroll+pageCardScroll)])
    }

    const clearArrStats = () => {
        // setStatsBattle([]);
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

    const decId = () => {
        setTimeout(() => {setId(id-1);}, 300);
        clearArrStats();
    }

    const incId = () => {
        setTimeout(() => {setId(id+1);}, 300);
        clearArrStats();
    }

    return (
        <div className="container" style={{minHeight: 1100}}>
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
            </div>
            <h1 id ="main" className='center'>Stats Battle Table</h1>
            <DataTable
                title={"Stats for battle"}
                columns={columnsStats}
                data={statsBattle}
                pagination
                defaultSortFieldId={1}
                // conditionalRowStyles={conditionalRowStyles}
            />
        </div>
    )

}

export default StatsTable;