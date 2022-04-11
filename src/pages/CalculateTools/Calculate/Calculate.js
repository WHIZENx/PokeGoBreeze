import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calBaseATK, calBaseDEF, calBaseSTA, calculateBetweenLevel, calculateStats, calculateStatsBettle, sortStatsPokemon } from "../../../components/Calculate/Calculate";
import { Box, Slider, styled } from '@mui/material';
import { useSnackbar } from "notistack";

import APIService from "../../../services/API.service";

import Tools from "../Tools";

import './Calculate.css';

const marks = [...Array(16).keys()].map(n => {return {value: n, label: n.toString()}});

const PokeGoSlider = styled(Slider)(() => ({
    color: '#ee9219',
    height: 18,
    padding: '13px 0',
    '& .MuiSlider-thumb': {
      height: 18,
      width: 18,
      backgroundColor: '#ee9219',
      borderTopLeftRadius: '1px',
      borderBottomLeftRadius: '1px',
      '&:hover, &.Mui-focusVisible, &.Mui-active': {
        boxShadow: 'none',
      },
      '&:before': {
        boxShadow: 'none',
      },
      '& .airbnb-bar': {
        height: 12,
        width: 1,
        backgroundColor: 'currentColor',
        marginLeft: 1,
        marginRight: 1,
      },
    },
    '& .MuiSlider-track': {
      height: 18,
      borderTopLeftRadius: '1px',
      borderBottomLeftRadius: '1px',
      border: 'none',
    },
    '& .MuiSlider-rail': {
      color: 'lightgray',
      opacity: 0.5,
      height: 18,
      borderTopLeftRadius: '1px',
      borderBottomLeftRadius: '1px',
    },
    '& .MuiSlider-valueLabel': {
        lineHeight: 1.2,
        fontSize: 12,
        background: 'unset',
        padding: 0,
        width: 32,
        height: 32,
        borderRadius: '50% 50% 50% 0',
        backgroundColor: '#ee9219',
        transformOrigin: 'bottom left',
        transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
        '&:before': { display: 'none' },
        '&.MuiSlider-valueLabelOpen': {
          transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
        },
        '& > *': {
          transform: 'rotate(45deg)',
        },
    },
    '& .MuiSlider-mark': {
        backgroundColor: '#bfbfbf',
        height: 13,
        width: 1,
        '&.MuiSlider-markActive': {
          opacity: 1,
          backgroundColor: '#fff',
          height: 13
        },
    },
  }));

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

    const [ATKIv, setATKIv] = useState(0);
    const [DEFIv, setDEFIv] = useState(0);
    const [STAIv, setSTAIv] = useState(0);

    const currentPokemonListFilter = useRef([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [pokeStats, setPokeStats] = useState(null);
    const [statLevel, setStatLevel] = useState(1);
    const [statData, setStatData] = useState(null);

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

    const clearArrStats = () => {
        setSearchCP('');
        setPokeStats(null);
        setStatLevel(1)
        setStatData(null)
    }

    const calculateStatsPoke = useCallback(() => {
        if (searchCP < 10) return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
        const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
        if (result.level == null) return enqueueSnackbar('At CP: '+result.CP+' and IV '+result.IV.atk+'/'+result.IV.def+'/'+result.IV.sta+' impossible found in '+pokeList.find(item => item.id === id).name, { variant: 'error' });
        setPokeStats(result);
        setStatLevel(result.level)
        setStatData(calculateBetweenLevel(result.level, result.level))
    }, [enqueueSnackbar, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP, id, pokeList]);

    const onCalculateStatsPoke = useCallback((e) => {
        calculateStatsPoke();
        e.preventDefault();
    }, [calculateStatsPoke]);

    const decId = () => {
        setTimeout(() => {setId(id-1);}, 300);
        clearArrStats();
    }

    const incId = () => {
        setTimeout(() => {setId(id+1);}, 300);
        clearArrStats();
    }

    const onHandleLevel = useCallback((e, v) => {
        setStatLevel(v);
        setStatData(calculateBetweenLevel(pokeStats.level, v));
    }, [pokeStats]);

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
                <form className="element-top" onSubmit={onCalculateStatsPoke.bind(this)}>
                    <div className="form-group d-flex justify-content-center center">
                        <Box sx={{ width: '50%', minWidth: 350 }}>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">CP</span>
                                </div>
                            <input required value={searchCP} type="number" min={10} className="form-control" aria-label="cp" aria-describedby="input-cp" placeholder="Enter CP"
                            onInput={e => setSearchCP(e.target.value)}></input>
                            </div>
                        </Box>
                    </div>
                    <div className="form-group d-flex justify-content-center center">
                        <Box sx={{ width: '50%', minWidth: 300 }}>
                            <div className="d-flex justify-content-between">
                                <b>ATK</b>
                                <b>{ATKIv}</b>
                            </div>
                            <PokeGoSlider
                                aria-label="ATK marks"
                                defaultValue={0}
                                min={0}
                                max={15}
                                step={1}
                                valueLabelDisplay="auto"
                                marks={marks}
                                onChange={(e,v) => setATKIv(v)}
                            />
                            <div className="d-flex justify-content-between">
                                <b>DEF</b>
                                <b>{DEFIv}</b>
                            </div>
                            <PokeGoSlider
                                aria-label="DEF marks"
                                defaultValue={0}
                                min={0}
                                max={15}
                                step={1}
                                valueLabelDisplay="auto"
                                marks={marks}
                                onChange={(e,v) => setDEFIv(v)}
                            />
                            <div className="d-flex justify-content-between">
                                <b>STA</b>
                                <b>{STAIv}</b>
                            </div>
                            <PokeGoSlider
                                aria-label="STA marks"
                                defaultValue={0}
                                min={0}
                                max={15}
                                step={1}
                                valueLabelDisplay="auto"
                                marks={marks}
                                onChange={(e,v) => setSTAIv(v)}
                            />
                        </Box>
                    </div>
                    <div className="form-group d-flex justify-content-center center">
                        <button type="submit" className="btn btn-primary">Calculate</button>
                    </div>
                </form>
                <div>
                <div className="d-flex justify-content-center center" style={{height: 80}}>
                    <Box sx={{ width: '60%', minWidth: 350 }}>
                        <div className="d-flex justify-content-between">
                                <b>Level</b>
                                <b>{statLevel}</b>
                        </div>
                        <Slider
                            aria-label="Temperature"
                            value={statLevel}
                            defaultValue={1}
                            valueLabelDisplay="auto"
                            step={0.5}
                            min={1}
                            max={51}
                            marks={pokeStats ? [{value: pokeStats.level, label: 'Result LV '+pokeStats.level}] : false}
                            disabled={pokeStats ? false : true}
                            onChange={pokeStats ? onHandleLevel : null}
                        />
                    </Box>
                </div>
                <div className="d-flex justify-content-center" style={{marginTop: 15}}>
                        <Box sx={{ width: '80%', minWidth: 320 }}>
                            <div className="row">
                            <div className="col" style={{padding: 0}}>
                                    <table className="table-info">
                                        <thead>
                                            <tr className="center"><th colSpan="2">Result of resource in Level {pokeStats ? statLevel : "None"}</th></tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Stadust Required LV {pokeStats ? pokeStats.level+"-"+statLevel : ""}</td>
                                                <td>{statData ? statData.result_between_stadust != null ? statData.result_between_stadust : "Unavailable" : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>Stadust Power-Up Required</td>
                                                <td>{statData ? statData.power_up_stardust != null ? statData.power_up_stardust : "Unavailable" : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>Candy Required LV {pokeStats ? pokeStats.level+"-"+statLevel : ""}</td>
                                                <td>{statData ? statData.result_between_candy != null ? statData.result_between_candy : "Unavailable" : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>Candy Power-Up Required</td>
                                                <td>{statData ? statData.power_up_candy != null ? statData.power_up_candy : "Unavailable" : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>XL Candy Required LV {pokeStats ? pokeStats.level+"-"+statLevel : ""}</td>
                                                <td>{statData ? statData.result_between_xl_candy != null ? statData.result_between_xl_candy : "Unavailable" : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>XL Candy Power-Up Required</td>
                                                <td>{statData ? statData.power_up_xl_candy != null ? statData.power_up_xl_candy : "Unavailable" : "-"}</td>
                                            </tr>
                                            <tr className="center"><td colSpan="2">Stats</td></tr>
                                            <tr>
                                                <td>ATK</td>
                                                <td>{statData ? calculateStatsBettle(statATK, pokeStats.IV.atk, statLevel) : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>DEF</td>
                                                <td>{statData ? calculateStatsBettle(statDEF, pokeStats.IV.def, statLevel) : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>HP</td>
                                                <td>{statData ? calculateStatsBettle(statSTA, pokeStats.IV.sta, statLevel) : "-"}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col" style={{padding: 0}}>
                                    <table className="table-info">
                                        <thead className="center">
                                            <tr><th colSpan="2">Recommend in Bettle League</th></tr>
                                        </thead>
                                        <tbody>
                                            <tr className="center"><td colSpan="2">Little Cup</td></tr>
                                            <tr>
                                                <td>Level</td>
                                                <td>555</td>
                                            </tr>
                                            <tr>
                                                <td>Stadust Required</td>
                                                <td>555</td>
                                            </tr>
                                            <tr className="center"><td colSpan="2">Great League</td></tr>
                                            <tr>
                                                <td>Level</td>
                                                <td>555</td>
                                            </tr>
                                            <tr>
                                                <td>Stadust Required</td>
                                                <td>555</td>
                                            </tr>
                                            <tr className="center"><td colSpan="2">Ultra League</td></tr>
                                            <tr>
                                                <td>Level</td>
                                                <td>555</td>
                                            </tr>
                                            <tr>
                                                <td>Stadust Required</td>
                                                <td>555</td>
                                            </tr>
                                            <tr className="center"><td colSpan="2">Master League</td></tr>
                                            <tr>
                                                <td>Level</td>
                                                <td>555</td>
                                            </tr>
                                            <tr>
                                                <td>Stadust Required</td>
                                                <td>555</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Box>
                    </div>
                </div>
                <hr></hr>
            </div>
        </Fragment>
    )
}

export default Calculate;