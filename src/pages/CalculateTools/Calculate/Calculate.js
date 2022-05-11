import { Fragment, useCallback, useEffect, useState } from "react";
import { calculateBettleLeague, calculateBetweenLevel, calculateStats, calculateStatsBettle } from "../../../components/Calculate/Calculate";
import { Box, FormControlLabel, Radio, RadioGroup, Slider, styled } from '@mui/material';
import { useSnackbar } from "notistack";

import APIService from "../../../services/API.service";

import './Calculate.css';

import atk_logo from '../../../assets/attack.png';
import def_logo from '../../../assets/defense.png';
import sta_logo from '../../../assets/stamina.png';
import Find from "../Find";
// import EvoChain from "./EvoChain";

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

const LevelSlider = styled(Slider)(() => ({
    '& .MuiSlider-mark': {
        backgroundColor: 'currentColor',
        height: 13,
        width: 2,
        '&.MuiSlider-markActive': {
          opacity: 1,
          backgroundColor: 'red',
          height: 13
        },
    },
}));

const TypeRadioGroup = styled(RadioGroup)(() => ({
    '&.MuiFormGroup-root, &.MuiFormGroup-row': {
        display: 'block',
    }
}));

const Calculate = () => {

    // const [id, setId] = useState(1);
    const [name, setName] = useState('Bulbasaur');

    const [searchCP, setSearchCP] = useState('');

    const [ATKIv, setATKIv] = useState(0);
    const [DEFIv, setDEFIv] = useState(0);
    const [STAIv, setSTAIv] = useState(0);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [typePoke, setTypePoke] = useState("");

    const [pokeStats, setPokeStats] = useState(null);
    const [statLevel, setStatLevel] = useState(1);
    const [statData, setStatData] = useState(null);

    const [dataLittleLeague, setDataLittleLeague] = useState(null);
    const [dataGreatLeague, setDataGreatLeague] = useState(null);
    const [dataUltraLeague, setDataUltraLeague] = useState(null);
    const [dataMasterLeague, setDataMasterLeague] = useState(null);

    const [urlEvo, setUrlEvo] = useState({url: null});

    const { enqueueSnackbar } = useSnackbar();

    const clearArrStats = () => {
        setSearchCP('');
        setPokeStats(null);
        setStatLevel(1);
        setStatData(null);
        setATKIv(0);
        setDEFIv(0);
        setSTAIv(0);
        setDataLittleLeague(null);
        setDataGreatLeague(null);
        setDataUltraLeague(null);
        setDataMasterLeague(null);
    }

    const calculateStatsPoke = useCallback(() => {
        if (searchCP < 10) return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
        const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
        if (result.level == null) return enqueueSnackbar('At CP: '+result.CP+' and IV '+result.IV.atk+'/'+result.IV.def+'/'+result.IV.sta+' impossible found in '+name, { variant: 'error' });
        enqueueSnackbar('At CP: '+result.CP+' and IV '+result.IV.atk+'/'+result.IV.def+'/'+result.IV.sta+' found in '+typePoke+' '+name, { variant: 'success' });
        setPokeStats(result);
        setStatLevel(result.level);
        setStatData(calculateBetweenLevel(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.level, typePoke));
        setDataLittleLeague(calculateBettleLeague(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.CP, 500, typePoke));
        setDataGreatLeague(calculateBettleLeague(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.CP, 1500, typePoke));
        setDataUltraLeague(calculateBettleLeague(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.CP, 2500, typePoke));
        setDataMasterLeague(calculateBettleLeague(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.CP, null, typePoke));
    }, [enqueueSnackbar, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP, name, typePoke]);

    useEffect(() => {
        document.title = "Calculate CP&IV - Tool";
    }, []);

    const onCalculateStatsPoke = useCallback((e) => {
        e.preventDefault();
        calculateStatsPoke();
    }, [calculateStatsPoke]);

    const onHandleLevel = useCallback((e, v) => {
        setStatLevel(v);
        setStatData(calculateBetweenLevel(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, pokeStats.level, v, typePoke));
    }, [statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, pokeStats, typePoke]);

    return (
        <Fragment>
            <div className="container element-top">
                <Find clearStats={clearArrStats} setStatATK={setStatATK} setStatDEF={setStatDEF} setStatSTA={setStatSTA} setName={setName} urlEvo={urlEvo} setUrlEvo={setUrlEvo}/>
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
                    <div className="d-flex justify-content-center center">
                        <TypeRadioGroup
                            row
                            aria-labelledby="row-types-group-label"
                            name="row-types-group"
                            defaultValue={""}
                            onChange={(e) => setTypePoke(e.target.value)}>
                            <FormControlLabel value="" control={<Radio />} label={<span>None</span>} />
                            <FormControlLabel value="lucky" control={<Radio />} label={<span><img height={32} alt="img-shiny" src={APIService.getPokeLucky()}></img> Lucky</span>} />
                            <FormControlLabel value="shadow" control={<Radio />} label={<span><img height={32} alt="img-shadow" src={APIService.getPokeShadow()}></img> Shadow</span>} />
                            <FormControlLabel value="purified" control={<Radio />} label={<span><img height={32} alt="img-purified" src={APIService.getPokePurified()}></img> Purified</span>} />
                        </TypeRadioGroup>
                    </div>
                    <div className="form-group d-flex justify-content-center center element-top">
                        <button type="submit" className="btn btn-primary">Calculate</button>
                    </div>
                </form>
                <div>
                <div className="d-flex justify-content-center center" style={{height: 80}}>
                    <Box sx={{ width: '60%', minWidth: 320 }}>
                        <div className="d-flex justify-content-between">
                                <b>Level</b>
                                <b>{statData ? statLevel : "None"}</b>
                        </div>
                        <LevelSlider
                            aria-label="Level"
                            value={statLevel}
                            defaultValue={1}
                            valueLabelDisplay="off"
                            step={0.5}
                            min={1}
                            max={typePoke === "lucky" ? 51 : 50}
                            marks={pokeStats ? [{value: pokeStats.level, label: 'Result LV'}] : false}
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
                                            <tr className="center"><th colSpan="2">Simulate Power Up Pokémon</th></tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Pokemon Level</td>
                                                <td>{statLevel && statData ? statLevel : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>Power Up Count</td>
                                                <td>{statData ? statData.power_up_count != null ? statData.power_up_count : "Unavailable" : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>CP</td>
                                                <td>{statData ? statData.cp : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td><img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("stardust_painted")}></img>Stadust Required</td>
                                                <td>{statData ? statData.result_between_stadust != null ?
                                                <span>{statData.result_between_stadust}{statData.type !== "" && statData.result_between_stadust_diff > 0 &&
                                                <Fragment>
                                                {statData.type === "shadow" && <span className="shadow-text"> (+{statData.result_between_stadust_diff})</span>}
                                                {statData.type === "purified" && <span className="purified-text"> (-{statData.result_between_stadust_diff})</span>}
                                                {statData.type === "lucky" && <span className="lucky-text"> (-{statData.result_between_stadust_diff})</span>}
                                                </Fragment>
                                                }
                                                </span>
                                                : "Unavailable" : "-"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("Item_1301")}></img>Candy Required</td>
                                                <td>{statData ? statData.result_between_candy != null ?
                                                <span>{statData.result_between_candy}{statData.type !== "" && statData.result_between_candy_diff > 0 &&
                                                <Fragment>
                                                {statData.type === "shadow" && <span className="shadow-text"> (+{statData.result_between_candy_diff})</span>}
                                                {statData.type === "purified" && <span className="purified-text"> (-{statData.result_between_candy_diff})</span>}
                                                {statData.type === "lucky" && <span className="lucky-text"> (-{statData.result_between_candy_diff})</span>}
                                                </Fragment>
                                                }
                                                </span>
                                                : "Unavailable" : "-"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("RareXLCandy_PSD")}></img>XL Candy Required</td>
                                                <td>{statData ? statData.result_between_xl_candy != null ?
                                                <span>{statData.result_between_xl_candy}{statData.type !== "" && statData.result_between_xl_candy_diff > 0 &&
                                                <Fragment>
                                                {statData.type === "shadow" && <span className="shadow-text"> (+{statData.result_between_xl_candy_diff})</span>}
                                                {statData.type === "purified" && <span className="purified-text"> (-{statData.result_between_xl_candy_diff})</span>}
                                                {statData.type === "lucky" && <span className="lucky-text"> (-{statData.result_between_xl_candy_diff})</span>}
                                                </Fragment>
                                                }
                                                </span>
                                                : "Unavailable" : "-"}
                                                </td>
                                            </tr>
                                            <tr className="center"><td className="table-sub-header" colSpan="2">Stats</td></tr>
                                            <tr>
                                                <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}></img>ATK</td>
                                                <td>{statData ?
                                                statData.type !== "shadow" ?
                                                calculateStatsBettle(statATK, pokeStats.IV.atk, statLevel)
                                                : <Fragment>
                                                    {statData.atk_stat}{statData.atk_stat_diff > 0 && <span className="text-success" style={{fontWeight: 500}}> (+{statData.atk_stat_diff})</span>}
                                                </Fragment>
                                                : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}></img>DEF</td>
                                                <td>{statData ?
                                                statData.type !== "shadow" ?
                                                calculateStatsBettle(statDEF, pokeStats.IV.def, statLevel)
                                                : <Fragment>
                                                    {statData.def_stat}{statData.def_stat_diff > 0 && <span className="text-danger" style={{fontWeight: 500}}> (-{statData.def_stat_diff})</span>}
                                                </Fragment>
                                                : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}></img>HP</td>
                                                <td>{statData ? calculateStatsBettle(statSTA, pokeStats.IV.sta, statLevel) : "-"}</td>
                                            </tr>
                                            {/* <EvoChain id={id} url={urlEvo.url} /> */}
                                            {/* <tr className="center"><td className="table-sub-header" colSpan="2">Evolution Chains</td></tr>
                                            {arrEvoList.map((value, index) => (
                                                <Fragment key={index}>
                                                {value.map((value, index) => (
                                                    <Fragment key={index}>
                                                        {parseInt(value.id) !== id &&
                                                            <Fragment>
                                                                <tr className="center">
                                                                    <td className="img-table-evo" colSpan="2"><img width="96" height="96" alt="img-pokemon" src={APIService.getPokeSprite(value.id)}></img></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Name</td>
                                                                    <td>{splitAndCapitalize(value.name)}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>CP</td>
                                                                    <td>5555</td>
                                                                </tr>
                                                            </Fragment>
                                                        }
                                                    </Fragment>
                                                ))
                                                }
                                                </Fragment>
                                            ))
                                            } */}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col" style={{padding: 0}}>
                                    <table className="table-info bettle-league">
                                        <thead className="center">
                                            <tr><th colSpan="5">Recommend in Bettle League</th></tr>
                                        </thead>
                                        <tbody>
                                            <tr className="center"><td className="table-sub-header" colSpan="4">
                                            <img style={{marginRight: 10}} alt='img-league' width={30} height={30} src={APIService.getPokeOtherLeague("GBL_littlecup")}></img>
                                            <span className={dataLittleLeague ? dataLittleLeague.elidge ? null : "text-danger" : null}>Little Cup{dataLittleLeague ? dataLittleLeague.elidge ? "" : <span> (Not Elidge)</span>: ""}</span>
                                            </td></tr>
                                            <tr>
                                                <td>Level</td>
                                                <td colSpan="3">{dataLittleLeague && dataLittleLeague.elidge ? dataLittleLeague.level : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>CP</td>
                                                <td colSpan="3">{dataLittleLeague && dataLittleLeague.elidge ? dataLittleLeague.cp : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td><img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("stardust_painted")}></img>Stadust Required</td>
                                                <td colSpan="3">{dataLittleLeague && dataLittleLeague.elidge ? <span className={statData.type+"-text"}>{dataLittleLeague.rangeValue.result_between_stadust}</span> : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>Candy Required</td>
                                                <td colSpan="3" style={{padding: 0}}>
                                                    <div className="d-flex align-items-center td-style" style={{float: 'left', width: '50%', borderRight: '1px solid #b8d4da'}}>
                                                        <img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("Item_1301")}></img>
                                                        {dataLittleLeague && dataLittleLeague.elidge ? <span className={statData.type !== "lucky" ? statData.type+"-text" : ""}>{dataLittleLeague.rangeValue.result_between_candy}</span> : "-"}
                                                    </div>
                                                    <div className="d-flex align-items-center td-style" style={{float: 'right', width: '50%'}}>
                                                        <img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("RareXLCandy_PSD")}></img>
                                                        {dataLittleLeague && dataLittleLeague.elidge ? <span className={statData.type !== "lucky" ? statData.type+"-text" : ""}>{dataLittleLeague.rangeValue.result_between_xl_candy}</span> : "-"}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Stats</td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}></img>
                                                {dataLittleLeague && dataLittleLeague.elidge ? <span className={statData.type ==="shadow" ? "text-success" : ""}>{dataLittleLeague.stats.atk}</span> : "-"}
                                                </td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}></img>
                                                {dataLittleLeague && dataLittleLeague.elidge ? <span className={statData.type ==="shadow" ? "text-danger" : ""}>{dataLittleLeague.stats.def}</span> : "-"}
                                                </td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}></img>
                                                {dataLittleLeague && dataLittleLeague.elidge ? dataLittleLeague.stats.sta : "-"}
                                                </td>
                                            </tr>
                                            <tr className="center"><td className="table-sub-header" colSpan="4">
                                                <img style={{marginRight: 10}} alt='img-league' width={30} height={30} src={APIService.getPokeLeague("great_league")}></img>
                                                <span className={dataGreatLeague ? dataGreatLeague.elidge ? null : "text-danger" : null}>Great League{dataGreatLeague ? dataGreatLeague.elidge ? "" : <span> (Not Elidge)</span>: ""}</span>
                                            </td></tr>
                                            <tr>
                                                <td>Level</td>
                                                <td colSpan="3">{dataGreatLeague && dataGreatLeague.elidge ? dataGreatLeague.level : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>CP</td>
                                                <td colSpan="3">{dataGreatLeague && dataGreatLeague.elidge ? dataGreatLeague.cp : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td><img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("stardust_painted")}></img>Stadust Required</td>
                                                <td colSpan="3">{dataGreatLeague && dataGreatLeague.elidge ? <span className={statData.type+"-text"}>{dataGreatLeague.rangeValue.result_between_stadust}</span> : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>Candy Required</td>
                                                <td colSpan="3" style={{padding: 0}}>
                                                    <div className="d-flex align-items-center td-style" style={{float: 'left', width: '50%', borderRight: '1px solid #b8d4da'}}>
                                                        <img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("Item_1301")}></img>
                                                        {dataGreatLeague && dataGreatLeague.elidge ? <span className={statData.type !== "lucky" ? statData.type+"-text" : ""}>{dataGreatLeague.rangeValue.result_between_candy}</span> : "-"}
                                                    </div>
                                                    <div className="d-flex align-items-center td-style" style={{float: 'right', width: '50%'}}>
                                                        <img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("RareXLCandy_PSD")}></img>
                                                        {dataGreatLeague && dataGreatLeague.elidge ? <span className={statData.type !== "lucky" ? statData.type+"-text" : ""}>{dataGreatLeague.rangeValue.result_between_xl_candy}</span> : "-"}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Stats</td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}></img>
                                                {dataGreatLeague && dataGreatLeague.elidge ? <span className={statData.type ==="shadow" ? "text-success" : ""}>{dataGreatLeague.stats.atk}</span> : "-"}
                                                </td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}></img>
                                                {dataGreatLeague && dataGreatLeague.elidge ? <span className={statData.type ==="shadow" ? "text-danger" : ""}>{dataGreatLeague.stats.def}</span> : "-"}
                                                </td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}></img>
                                                {dataGreatLeague && dataGreatLeague.elidge ? dataGreatLeague.stats.sta : "-"}
                                                </td>
                                            </tr>
                                            <tr className="center"><td className="table-sub-header" colSpan="4">
                                                <img style={{marginRight: 10}} alt='img-league' width={30} height={30} src={APIService.getPokeLeague("ultra_league")}></img>
                                                <span className={dataUltraLeague ? dataUltraLeague.elidge ? null : "text-danger" : null}>Ultra League{dataUltraLeague ? dataUltraLeague.elidge ? "" : <span> (Not Elidge)</span> : ""}</span>
                                            </td></tr>
                                            <tr>
                                                <td>Level</td>
                                                <td colSpan="3">{dataUltraLeague && dataUltraLeague.elidge ? dataUltraLeague.level : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>CP</td>
                                                <td colSpan="3">{dataUltraLeague && dataUltraLeague.elidge ? dataUltraLeague.cp : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td><img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("stardust_painted")}></img>Stadust Required</td>
                                                <td colSpan="3">{dataUltraLeague && dataUltraLeague.elidge ? <span className={statData.type+"-text"}>{dataUltraLeague.rangeValue.result_between_stadust}</span> : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>Candy Required</td>
                                                <td colSpan="3" style={{padding: 0}}>
                                                    <div className="d-flex align-items-center td-style" style={{float: 'left', width: '50%', borderRight: '1px solid #b8d4da'}}>
                                                        <img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("Item_1301")}></img>
                                                        {dataUltraLeague && dataUltraLeague.elidge ? <span className={statData.type !== "lucky" ? statData.type+"-text" : ""}>{dataUltraLeague.rangeValue.result_between_candy}</span> : "-"}
                                                    </div>
                                                    <div className="d-flex align-items-center td-style" style={{float: 'right', width: '50%'}}>
                                                        <img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("RareXLCandy_PSD")}></img>
                                                        {dataUltraLeague && dataUltraLeague.elidge ? <span className={statData.type !== "lucky" ? statData.type+"-text" : ""}>{dataUltraLeague.rangeValue.result_between_xl_candy}</span> : "-"}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Stats</td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}></img>
                                                {dataUltraLeague && dataUltraLeague.elidge ? <span className={statData.type ==="shadow" ? "text-success" : ""}>{dataUltraLeague.stats.atk}</span> : "-"}
                                                </td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}></img>
                                                {dataUltraLeague && dataUltraLeague.elidge ? <span className={statData.type ==="shadow" ? "text-danger" : ""}>{dataUltraLeague.stats.def}</span> : "-"}
                                                </td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}></img>
                                                {dataUltraLeague && dataUltraLeague.elidge ? dataUltraLeague.stats.sta : "-"}
                                                </td>
                                            </tr>
                                            <tr className="center"><td className="table-sub-header" colSpan="4">
                                                <img style={{marginRight: 10}} alt='img-league' width={30} height={30} src={APIService.getPokeLeague("master_league")}></img>
                                                Master League
                                            </td></tr>
                                            <tr>
                                                <td>Level</td>
                                                <td colSpan="3">{dataMasterLeague ? dataMasterLeague.level : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>CP</td>
                                                <td colSpan="3">{dataMasterLeague ? dataMasterLeague.cp : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td><img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("stardust_painted")}></img>Stadust Required</td>
                                                <td colSpan="3">{dataMasterLeague ? <span className={statData.type+"-text"}>{dataMasterLeague.rangeValue.result_between_stadust}</span> : "-"}</td>
                                            </tr>
                                            <tr>
                                                <td>Candy Required</td>
                                                <td colSpan="3" style={{padding: 0}}>
                                                    <div className="d-flex align-items-center td-style" style={{float: 'left', width: '50%', borderRight: '1px solid #b8d4da'}}>
                                                        <img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("Item_1301")}></img>
                                                        {dataMasterLeague ? <span className={statData.type !== "lucky" ? statData.type+"-text" : ""}>{dataMasterLeague.rangeValue.result_between_candy}</span> : "-"}
                                                    </div>
                                                    <div className="d-flex align-items-center td-style" style={{float: 'right', width: '50%'}}>
                                                        <img style={{marginRight: 10}} alt='img-stardust' height={20} src={APIService.getItemSprite("RareXLCandy_PSD")}></img>
                                                        {dataMasterLeague ? <span className={statData.type !== "lucky" ? statData.type+"-text" : ""}>{dataMasterLeague.rangeValue.result_between_xl_candy}</span> : "-"}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Stats</td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}></img>
                                                {dataMasterLeague ? <span className={statData.type ==="shadow" ? "text-success" : ""}>{dataMasterLeague.stats.atk}</span> : "-"}
                                                </td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}></img>
                                                {dataMasterLeague ? <span className={statData.type ==="shadow" ? "text-danger" : ""}>{dataMasterLeague.stats.def}</span> : "-"}
                                                </td>
                                                <td style={{textAlign: 'center'}}><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}></img>
                                                {dataMasterLeague ? dataMasterLeague.stats.sta : "-"}
                                                </td>
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