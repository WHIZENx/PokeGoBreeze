import { Fragment, useCallback, useEffect, useState } from "react";
import Find from "../Find";

import { Box, Slider, styled } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import evoData from "../../../data/evolution_pokemon_go.json";
import pokeImageList from '../../../data/assets_pokemon_go.json';

import './FineBattle.css';
import APIService from "../../../services/API.service";
import { calculateStats, computeBgColor, computeColor, queryStatesEvoChain, splitAndCapitalize } from "../../../components/Calculate/Calculate";
import { Accordion } from "react-bootstrap";
import { useSnackbar } from "notistack";

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

const FindBattle = () => {

    const [id, setId] = useState(1);
    const [name, setName] = useState('Bulbasaur');

    const [searchCP, setSearchCP] = useState('');

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [ATKIv, setATKIv] = useState(0);
    const [DEFIv, setDEFIv] = useState(0);
    const [STAIv, setSTAIv] = useState(0);

    const [evoChain, setEvoChain] = useState([]);
    const [bestInLeague, setBestInLeague] = useState([]);

    const { enqueueSnackbar } = useSnackbar();

    const clearArrStats = () => {
        setSearchCP('');
        setEvoChain([]);
        setBestInLeague([]);
    }

    const currEvoChain = useCallback((currId, arr) => {
        if (currId.length === 0) return arr;
        let curr = evoData.find(item => currId.includes(item.id));
        if (!arr.map(i => i.id).includes(curr.id)) arr.push(curr);
        return currEvoChain(curr.evo_list.map(i => i.evo_to_id), arr)
    }, []);

    const prevEvoChain = useCallback((obj, arr) => {
        if (!arr.map(i => i.id).includes(obj.id)) arr.push(obj);
        obj.evo_list.forEach(i => {
            currEvoChain([i.evo_to_id], arr)
        });
        let curr = evoData.filter(item => item.evo_list.find(i => obj.id === i.evo_to_id));
        if (curr.length === 0) return arr
        else if (curr.length === 1) return prevEvoChain(curr[0], arr)
        else return curr.map(item => prevEvoChain(item, arr));
    }, [currEvoChain]);

    const getEvoChain = useCallback((id) => {
        let curr = evoData.filter(item => item.evo_list.find(i => id === i.evo_to_id));
        if (curr.length === 0) curr = evoData.filter(item => id === item.id);
        return curr.map(item => prevEvoChain(item, []));
    }, [prevEvoChain]);

    const searchStatsPoke = useCallback((level) => {
        let arr = []
        getEvoChain(id).forEach(item => {
            let tempArr = []
            item.forEach(value => {
                tempArr.push(queryStatesEvoChain(value, level, ATKIv, DEFIv, STAIv))
            });
            arr.push(tempArr);
        });
        setEvoChain(arr);
        var currBastStats;
        var evoBaseStats = [];
        arr.forEach(item => {
            item.forEach(value => {
                if (value.id !== id) evoBaseStats.push({...Object.values(value.battleLeague).reduce((a, b) => !a || !b ? true : a.ratio > b.ratio ? a : b), id: value.id, name: value.name, league: Object.keys(value.battleLeague).reduce((a, b) => !value.battleLeague[a] || !value.battleLeague[b] ? b : value.battleLeague[a].ratio > value.battleLeague[b].ratio ? a : b)})
                else currBastStats = {...Object.values(value.battleLeague).reduce((a, b) => !a || !b ? true : a.ratio > b.ratio ? a : b), id: value.id, name: value.name, league: Object.keys(value.battleLeague).reduce((a, b) => !value.battleLeague[a] || !value.battleLeague[b] ? b : value.battleLeague[a].ratio > value.battleLeague[b].ratio ? a : b)};
            });
        });
        let bestLeague = evoBaseStats.filter(item => item.ratio > currBastStats.ratio);
        bestLeague = bestLeague.filter(item =>
            (item.league === "great" && item.CP >= 500)
            || (item.league === "ultra" && item.CP >= 1500)
            || (item.league === "master" && item.CP >= 2500));
        if (bestLeague.length === 0) bestLeague = evoBaseStats.filter(item => item.ratio > currBastStats.ratio);
        if (bestLeague.length === 0) bestLeague = [currBastStats];
        setBestInLeague(bestLeague);
    }, [ATKIv, DEFIv, STAIv, getEvoChain, id]);

    const onSearchStatsPoke = useCallback((e) => {
        e.preventDefault();
        if (searchCP < 10) return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
        const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
        if (result.level == null) return enqueueSnackbar('At CP: '+result.CP+' and IV '+result.IV.atk+'/'+result.IV.def+'/'+result.IV.sta+' impossible found in '+name, { variant: 'error' });
        searchStatsPoke(result.level);
    }, [searchStatsPoke, ATKIv, DEFIv, STAIv, enqueueSnackbar, name, searchCP, statATK, statDEF, statSTA]);

    useEffect(() => {
        // console.log(name,statATK,statDEF,statSTA);
    }, [name]);

    const getImageList = (id, name) => {
        let img = pokeImageList.find(item => item.id === id).image.find(item => name.includes(item.form));
        if (!img) img = pokeImageList.find(item => item.id === id).image[0];
        return img.default;
    };

    const getCandyEvo = (item, id) => {
        let candy = 0;
        item.forEach(value => {
            value.evo_list.forEach(e => {
                if (e.evo_to_id === id) candy = e.candyCost;
            });
        });
        return candy;
    }

    const getTextColorRatio = (value) => {
        return "rank-"+
        (value === 100 ?
        "max"
        :
        value >= 90 ?
        "excellent"
        :
        value >= 80 ?
        "great"
        :
        value >= 70 ?
        "nice"
        :
        "normal");
    }

    return (
        <div className="container">
            <Find clearStats={clearArrStats} setStatATK={setStatATK} setStatDEF={setStatDEF} setStatSTA={setStatSTA} setId={setId} setName={setName}/>
            <h1 id ="main" className='center'>Find Stats Battle</h1>
            <form className="element-top" onSubmit={onSearchStatsPoke.bind(this)} style={{marginBottom: 15}}>
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
                            value={ATKIv}
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
                            value={DEFIv}
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
                            value={STAIv}
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
                <div className="form-group d-flex justify-content-center center element-top">
                    <button type="submit" className="btn btn-primary">Search</button>
                </div>
            </form>
            {evoChain.length > 0 && bestInLeague.length > 0 &&
            <div className="center">
                <div>
                    <h4 style={{textDecoration: 'underline'}}>Recommend Battle League</h4>
                    {bestInLeague.map((value, index) => (
                        <div className="d-inline-block contain-poke-best-league border-best-poke" key={index}>
                            <div className="d-flex align-items-center h-100">
                                <div className="border-best-poke h-100">
                                    <img className="poke-best-league" alt='pokemon-model' height={102} src={APIService.getPokemonModel(getImageList(value.id, value.name))}></img>
                                    <span className="caption text-black border-best-poke"><b>#{value.id} {splitAndCapitalize(value.name, "_", " ")}</b></span>
                                </div>
                                <div className={"border-best-poke "+(getTextColorRatio(value.ratio))}>
                                    <div className="best-poke-desc border-best-poke">
                                        <img alt='pokemon-model' height={32} src={
                                            value.league === "little" ?
                                            APIService.getPokeOtherLeague("GBL_littlecup")
                                            :
                                            value.league === "great" ?
                                            APIService.getPokeLeague("great_league")
                                            :
                                            value.league === "ultra" ?
                                            APIService.getPokeLeague("ultra_league")
                                            :
                                            APIService.getPokeLeague("master_league")
                                        }></img>
                                        <div><b>{value.ratio.toFixed(2)}</b></div>
                                        <span className="caption">CP: {value.CP}</span>
                                    </div>
                                    <span className="caption text-black border-best-poke"><b>#{value.rank}</b></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Accordion style={{marginTop: '3%', marginBottom: '5%'}}>
                    <Accordion.Item eventKey={0}>
                        <Accordion.Header>
                            <b>More information</b>
                        </Accordion.Header>
                        <Accordion.Body>
                            {evoChain.map((value, index) => (
                                <div className="d-flex justify-content-center league-info-content" key={index}>
                                    {value.sort((a,b) => a.id - b.id).map((item, index) => (
                                        <div className="d-inline-block evo-item-desc" key={index}>
                                            <img alt='pokemon-model' height={100} src={APIService.getPokemonModel(getImageList(item.id, item.name))}></img>
                                            <div><b>#{item.id} {splitAndCapitalize(item.name.toLowerCase(), "_", " ")}</b></div>
                                            {item.id < id ?
                                            <div className="text-danger"><b><CloseIcon sx={{color: 'red'}}/> Elidge</b></div>
                                            :
                                            <Fragment>
                                            <div className="element-top" style={{textAlign: 'start'}}>
                                                <h6><img alt='pokemon-model' height={32} src={APIService.getPokeOtherLeague("GBL_littlecup")}></img> <b>Little Cup</b></h6>
                                                {item.battleLeague.little ?
                                                <ul>
                                                    <li>Rank: {item.battleLeague.little.rank}</li>
                                                    <li>CP: {item.battleLeague.little.CP}</li>
                                                    <li>Stats Prod (%): {item.battleLeague.little.ratio.toFixed(2)}</li>
                                                    <li>
                                                        <span className="d-flex align-items-center">
                                                            <div className="d-inline-block bg-poke-candy" style={{backgroundColor: computeBgColor(item.id), marginRight: 5}}>
                                                                <div className="poke-candy" style={{background: computeColor(item.id), width: 20, height: 20}}></div>
                                                            </div>
                                                            <span>{item.battleLeague.little.result_between_candy+getCandyEvo(value, item.id)} <span className="d-inline-block caption text-success"> (+{getCandyEvo(value, item.id)})</span></span>
                                                            <div className="position-relative d-inline-block">
                                                                <div className="bg-poke-xl-candy" style={{background: computeBgColor(id), width: 30, height: 30}}></div>
                                                                <div className="poke-xl-candy" style={{background: computeColor(id), width: 30, height: 30}}></div>
                                                            </div>
                                                            {item.battleLeague.little.result_between_xl_candy}
                                                        </span>
                                                    </li>
                                                </ul>
                                                :
                                                <div className="text-danger"><b><CloseIcon sx={{color: 'red'}}/> Elidge</b></div>
                                                }
                                            </div>
                                            <div className="element-top" style={{textAlign: 'start'}}>
                                                <h6><img alt='pokemon-model' height={32} src={APIService.getPokeLeague("great_league")}></img> <b>Great League</b></h6>
                                                {item.battleLeague.great ?
                                                <ul>
                                                    <li>Rank: {item.battleLeague.great.rank}</li>
                                                    <li>CP: {item.battleLeague.great.CP}</li>
                                                    <li>Stats Prod (%): {item.battleLeague.great.ratio.toFixed(2)}</li>
                                                    <li>
                                                        <span className="d-flex align-items-center">
                                                            <div className="d-inline-block bg-poke-candy" style={{backgroundColor: computeBgColor(item.id), marginRight: 5}}>
                                                                <div className="poke-candy" style={{background: computeColor(item.id), width: 20, height: 20}}></div>
                                                            </div>
                                                            <span>{item.battleLeague.great.result_between_candy+getCandyEvo(value, item.id)} <span className="d-inline-block caption text-success"> (+{getCandyEvo(value, item.id)})</span></span>
                                                            <div className="position-relative d-inline-block">
                                                                <div className="bg-poke-xl-candy" style={{background: computeBgColor(id), width: 30, height: 30}}></div>
                                                                <div className="poke-xl-candy" style={{background: computeColor(id), width: 30, height: 30}}></div>
                                                            </div>
                                                            {item.battleLeague.great.result_between_xl_candy}
                                                        </span>
                                                    </li>
                                                </ul>
                                                :
                                                <div className="text-danger"><b><CloseIcon sx={{color: 'red'}}/> Elidge</b></div>
                                                }
                                            </div>
                                            <div className="element-top" style={{textAlign: 'start'}}>
                                                <h6><img alt='pokemon-model' height={32} src={APIService.getPokeLeague("ultra_league")}></img> <b>Ultra League</b></h6>
                                                {item.battleLeague.ultra ?
                                                <ul>
                                                    <li>Rank: {item.battleLeague.ultra.rank}</li>
                                                    <li>CP: {item.battleLeague.ultra.CP}</li>
                                                    <li>Stats Prod (%): {item.battleLeague.ultra.ratio.toFixed(2)}</li>
                                                    <li>
                                                        <span className="d-flex align-items-center">
                                                            <div className="d-inline-block bg-poke-candy" style={{backgroundColor: computeBgColor(item.id), marginRight: 5}}>
                                                                <div className="poke-candy" style={{background: computeColor(item.id), width: 20, height: 20}}></div>
                                                            </div>
                                                            <span>{item.battleLeague.ultra.result_between_candy+getCandyEvo(value, item.id)} <span className="d-inline-block caption text-success"> (+{getCandyEvo(value, item.id)})</span></span>
                                                            <div className="position-relative d-inline-block">
                                                                <div className="bg-poke-xl-candy" style={{background: computeBgColor(id), width: 30, height: 30}}></div>
                                                                <div className="poke-xl-candy" style={{background: computeColor(id), width: 30, height: 30}}></div>
                                                            </div>
                                                            {item.battleLeague.ultra.result_between_xl_candy}
                                                        </span>
                                                    </li>
                                                </ul>
                                                :
                                                <div className="text-danger"><b><CloseIcon sx={{color: 'red'}}/> Elidge</b></div>
                                                }
                                            </div>
                                            <div className="element-top" style={{textAlign: 'start'}}>
                                                <h6><img alt='pokemon-model' height={32} src={APIService.getPokeLeague("master_league")}></img> <b>Master League</b></h6>
                                                {item.battleLeague.master ?
                                                <ul>
                                                    <li>Rank: {item.battleLeague.master.rank}</li>
                                                    <li>CP: {item.battleLeague.master.CP}</li>
                                                    <li>Stats Prod (%): {item.battleLeague.master.ratio.toFixed(2)}</li>
                                                    <li>
                                                        <span className="d-flex align-items-center">
                                                            <div className="d-inline-block bg-poke-candy" style={{backgroundColor: computeBgColor(item.id), marginRight: 5}}>
                                                                <div className="poke-candy" style={{background: computeColor(item.id), width: 20, height: 20}}></div>
                                                            </div>
                                                            <span>{item.battleLeague.master.result_between_candy+getCandyEvo(value, item.id)} <span className="d-inline-block caption text-success"> (+{getCandyEvo(value, item.id)})</span></span>
                                                            <div className="position-relative d-inline-block">
                                                                <div className="bg-poke-xl-candy" style={{background: computeBgColor(id), width: 30, height: 30}}></div>
                                                                <div className="poke-xl-candy" style={{background: computeColor(id), width: 30, height: 30}}></div>
                                                            </div>
                                                            {item.battleLeague.master.result_between_xl_candy}
                                                        </span>
                                                    </li>
                                                </ul>
                                                :
                                                <div className="text-danger"><b><CloseIcon sx={{color: 'red'}}/> Elidge</b></div>
                                                }
                                            </div>
                                            </Fragment>
                                            }
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
            }
        </div>
    )
}

export default FindBattle;