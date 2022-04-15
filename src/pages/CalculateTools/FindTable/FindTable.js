import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calBaseATK, calBaseDEF, calBaseSTA, calculateCP, predictCPList, predictStat, sortStatsPokemon } from "../../../components/Calculate/Calculate";
import DataTable from 'react-data-table-component';
import APIService from "../../../services/API.service";
import data from "../../../data/cp_multiplier.json";

import Tools from "../Tools";

import '../Tools.css';
import { useSnackbar } from "notistack";
import { Box, Rating, Slider, styled } from "@mui/material";

const marks = [...Array(16).keys()].map(n => {return {value: n, label: n.toString()}});

const PokeGoSlider = styled(Slider)(() => ({
    color: '#ee9219',
    height: 18,
    padding: '13px 0',
    '& .MuiSlider-thumb': {
      height: 18,
      width: 18,
      backgroundColor: '#ee9219',
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
      border: 'none',
      borderTopRightRadius: '1px',
      borderBottomRightRadius: '1px',
    },
    '& .MuiSlider-rail': {
      color: 'lightgray',
      opacity: 0.5,
      height: 18,
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

const HundoRate = styled(Rating)(() => ({
    '& .MuiRating-icon': {
        color: 'red',
    },
}));

const columnsIV = [
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
        name: 'STA',
        selector: row => row.sta,
        sortable: true,
    },
    {
        name: 'HP',
        selector: row => row.hp,
        sortable: true,
    },
    {
        name: 'Percent',
        selector: row => row.percent,
        sortable: true,
    },
];

const columnsCP = [
    {
        name: 'Level',
        selector: row => row.level,
        sortable: true,
    },
    {
        name: 'CP',
        selector: row => row.cp,
        sortable: true,
    },
    {
        name: 'HP',
        selector: row => row.hp,
        sortable: true,
    },
];

const conditionalRowStyles = [
    {
        when: row => row.percent === 100,
        style: {
          backgroundColor: 'rgb(236, 200, 200)',
        },
    },
    {
      when: row => row.percent > 80 && row.percent < 100,
      style: {
        backgroundColor: 'rgb(236, 200, 236)',
      },
    },
    {
        when: row => row.percent > 64 && row.percent <= 80,
        style: {
          backgroundColor: 'rgb(200, 236, 200)',
        },
    },
    {
        when: row => row.percent > 51 && row.percent <= 64,
        style: {
          backgroundColor: 'rgb(236, 236, 200)',
        },
    },
];

const FindTable = () => {

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

    const [searchATKIv, setSearchATKIv] = useState(0);
    const [searchDEFIv, setSearchDEFIv] = useState(0);
    const [searchSTAIv, setSearchSTAIv] = useState(0);

    const currentPokemonListFilter = useRef([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [preIvArr, setPreIvArr] = useState(null);
    const [preCpArr, setPreCpArr] = useState(null);

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
        setPreIvArr(result);
    }, [enqueueSnackbar, searchCP, statATK, statDEF, statSTA]);

    const onFindStats = useCallback((e) => {
        findStatsIv()
        e.preventDefault();
    }, [findStatsIv]);

    const clearArrStats = () => {
        setPreIvArr(null);
        setPreCpArr(null);
        setSearchCP('');
        setSearchATKIv(0);
        setSearchDEFIv(0);
        setSearchSTAIv(0);
    }

    const findStatsCP = useCallback(() => {
        if (searchATKIv < 0 || searchATKIv > 15 || searchDEFIv < 0 || searchDEFIv > 15 || searchSTAIv < 0 || searchSTAIv > 15) return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
        const result = predictCPList(statATK, statDEF, statSTA, searchATKIv, searchDEFIv, searchSTAIv);
        setPreCpArr(result);
    }, [enqueueSnackbar, statATK, statDEF, statSTA, searchATKIv, searchDEFIv, searchSTAIv]);

    const onFindCP = useCallback((e) => {
        findStatsCP()
        e.preventDefault();
    }, [findStatsCP]);

    const showResultTableIV = () => {
        const avgPercent = Object.values(preIvArr.result).reduce((a, b) => a + b.percent, 0) / preIvArr.result.length
        const avgHP = Object.values(preIvArr.result).reduce((a, b) => a + b.hp, 0) / preIvArr.result.length
        const fourStar = preIvArr.result.filter(item => item.percent === 100).length
        const threeStar = preIvArr.result.filter(item => item.percent > 80 && item.percent < 100).length
        const twoStar = preIvArr.result.filter(item => item.percent > 64 && item.percent <= 80).length
        const oneStar = preIvArr.result.filter(item => item.percent > 51 && item.percent <= 64).length
        const zeroStar = preIvArr.result.filter(item => item.percent <= 51).length
        return (
            <Fragment>
                {preIvArr.result.length > 0 &&
                    <Fragment>
                    <p className="element-top">All of result: <b>{preIvArr.result.length}</b></p>
                    <p className="element-top">Average of percent: <b>{parseFloat(avgPercent.toFixed(2))}</b></p>
                    <p className="element-top">Average of HP: <b>{Math.round(avgHP)}</b></p>
                    <div className="center four-star" style={{display: 'inline-block'}}>
                        <HundoRate name="hundo-rate" value={3} max={3} readOnly />
                        <hr style={{margin: 0}}></hr>
                        <div><b>{fourStar}</b></div>
                    </div>
                    <div className="center three-star" style={{display: 'inline-block'}}>
                        <Rating name="three-rate" value={3} max={3} readOnly />
                        <hr style={{margin: 0}}></hr>
                        <div><b>{threeStar}</b></div>
                    </div>
                    <div className="center two-star" style={{display: 'inline-block'}}>
                        <Rating name="two-rate" value={2} max={3} readOnly />
                        <hr style={{margin: 0}}></hr>
                        <div><b>{twoStar}</b></div>
                    </div>
                    <div className="center one-star" style={{display: 'inline-block'}}>
                        <Rating name="one-rate" value={1} max={3} readOnly />
                        <hr style={{margin: 0}}></hr>
                        <div><b>{oneStar}</b></div>
                    </div>
                    <div className="center zero-star" style={{display: 'inline-block'}}>
                        <Rating name="zero-rate" value={0} max={3} readOnly />
                        <hr style={{margin: 0}}></hr>
                        <div><b>{zeroStar}</b></div>
                    </div>
                    </Fragment>
                }
                {preIvArr.result.length > 0 ?
                <DataTable
                    title={"Levels/IV for CP: "+preIvArr.cp}
                    columns={columnsIV}
                    data={preIvArr.result}
                    pagination
                    defaultSortFieldId={6}
                    defaultSortAsc={false}
                    conditionalRowStyles={conditionalRowStyles}
                />
                : <p className="element-top text-danger center">At CP: <b>{preIvArr.cp}</b> impossible found in <b>{pokeList.find(item => item.id === id).name}</b></p>
                }
            </Fragment>
        )
    }

    const showResultTableCP = () => {
        const avgCp = Object.values(preCpArr.result).reduce((a, b) => a + b.cp, 0) / preCpArr.result.length
        const avgHP = Object.values(preCpArr.result).reduce((a, b) => a + b.hp, 0) / preCpArr.result.length
        return (
            <Fragment>
                {preCpArr.result.length > 0 &&
                <Fragment>
                    <p className="element-top">Average of CP: <b>{Math.round(avgCp)}</b></p>
                    <p className="element-top">Average of HP: <b>{Math.round(avgHP)}</b></p>
                    <DataTable
                        title={"Levels/CP for IV: "+preCpArr.IV.atk+"/"+preCpArr.IV.def+"/"+preCpArr.IV.sta}
                        columns={columnsCP}
                        data={preCpArr.result}
                        pagination
                        defaultSortFieldId={1}
                    />
                </Fragment>
                }
            </Fragment>
        )
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

    const decId = () => {
        setTimeout(() => {setId(id-1);}, 300);
        clearArrStats();
    }

    const incId = () => {
        setTimeout(() => {setId(id+1);}, 300);
        clearArrStats();
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
                <h1 id ="main" className='center'>Find IV</h1>
                <form className="d-flex justify-content-center element-top" onSubmit={onFindStats.bind(this)}>
                    <Box sx={{ width: '50%', minWidth: 350 }}>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                            <span className="input-group-text">CP</span>
                        </div>
                        <input required value={searchCP} type="number" min={10} className="form-control" aria-label="cp" aria-describedby="input-cp" placeholder="Enter CP"
                        onInput={e => setSearchCP(e.target.value)}></input>
                        </div>
                        <div className="btn-search d-flex justify-content-center center">
                            <button type="submit" className="btn btn-primary">Search</button>
                        </div>
                    </Box>
                </form>
                {preIvArr ?
                    <Fragment>
                    {showResultTableIV()}
                    </Fragment>
                    : <p>None</p>
                }
                <hr></hr>
                <h1 id ="main" className='center'>Find CP</h1>
                <form id="formCP" className="element-top" onSubmit={onFindCP.bind(this)}>
                    <div className="form-group d-flex justify-content-center center">
                        <Box sx={{ width: '50%', minWidth: 300 }}>
                            <div className="d-flex justify-content-between">
                                <b>ATK</b>
                                <b>{searchATKIv}</b>
                            </div>
                            <PokeGoSlider
                                value={searchATKIv}
                                aria-label="ATK marks"
                                defaultValue={0}
                                min={0}
                                max={15}
                                step={1}
                                valueLabelDisplay="auto"
                                marks={marks}
                                onChange={(e,v) => setSearchATKIv(v)}
                            />
                            <div className="d-flex justify-content-between">
                                <b>DEF</b>
                                <b>{searchDEFIv}</b>
                            </div>
                            <PokeGoSlider
                                value={searchDEFIv}
                                aria-label="DEF marks"
                                defaultValue={0}
                                min={0}
                                max={15}
                                step={1}
                                valueLabelDisplay="auto"
                                marks={marks}
                                onChange={(e,v) => setSearchDEFIv(v)}
                            />
                            <div className="d-flex justify-content-between">
                                <b>STA</b>
                                <b>{searchSTAIv}</b>
                            </div>
                            <PokeGoSlider
                                value={searchSTAIv}
                                aria-label="STA marks"
                                defaultValue={0}
                                min={0}
                                max={15}
                                step={1}
                                valueLabelDisplay="auto"
                                marks={marks}
                                onChange={(e,v) => setSearchSTAIv(v)}
                            />
                        </Box>
                    </div>
                    <div className="form-group d-flex justify-content-center center element-top">
                        <button type="submit" className="btn btn-primary">Search</button>
                    </div>
                </form>
                {/* <form id="formCP" className="d-flex justify-content-center element-top" onSubmit={onFindCP.bind(this)}>
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
                </form> */}
                {preCpArr ?
                    <Fragment>
                    {showResultTableCP()}
                    </Fragment>
                    : <p>None</p>
                }
                <hr></hr>
                <div className="element-top">
                    {findMinMax()}
                </div>
            </div>
        </Fragment>
    )
}

export default FindTable;