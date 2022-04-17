import { Box, Slider, styled } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { calStatsProd } from "../../components/Calculate/Calculate";
import APIService from "../../services/API.service";
import Find from "../CalculateTools/Find";

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
        name: 'Power (*1000)',
        selector: row => parseFloat((row.statsProds/1000).toFixed(2)),
        sortable: true,
    },
    {
        name: 'Stat Prod (%)',
        selector: row => parseFloat(row.ratio.toFixed(2)),
        sortable: true,
    },
];

const StatsTable = () => {

    const [name, setName] = useState('Bulbasaur');

    const [searchCP, setSearchCP] = useState('');

    const [ATKIv, setATKIv] = useState(0);
    const [DEFIv, setDEFIv] = useState(0);
    const [STAIv, setSTAIv] = useState(0);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [battleLeague, setBattleLeague] = useState(500);

    const [statsBattle, setStatsBattle] = useState([]);

    useEffect(() => {
        setStatsBattle(calStatsProd(statATK, statDEF, statSTA, battleLeague))
    }, [statATK, statDEF, statSTA, battleLeague]);

    const clearStats = () => {
        setBattleLeague(500);
        setSearchCP('');
        setATKIv(0);
        setDEFIv(0);
        setSTAIv(0);
    }

    const clearStatsPoke = useCallback(() => {
        setStatsBattle(calStatsProd(statATK, statDEF, statSTA, battleLeague))
    }, [battleLeague, statATK, statDEF, statSTA]);

    const searchStatsPoke = useCallback(() => {
        setStatsBattle([...statsBattle].filter(item => item.CP === parseInt(searchCP) && item.IV.atk === ATKIv && item.IV.def === DEFIv && item.IV.sta === STAIv))
    }, [statsBattle, searchCP, ATKIv, DEFIv, STAIv]);

    const onSearchStatsPoke = useCallback((e) => {
        e.preventDefault();
        searchStatsPoke();
    }, [searchStatsPoke]);

    return (
        <div className="container" style={{minHeight: 1650}}>
            <Find clearStats={clearStats} setStatATK={setStatATK} setStatDEF={setStatDEF} setStatSTA={setStatSTA} setName={setName}/>
            <h1 id ="main" className='center'>Stats Battle Table</h1>
            <div className="center" style={{marginTop: 15, marginBottom: 15}}>
                <button className={"btn btn-form"+(battleLeague === 500 ? " form-selected" : "")} style={{height: 200}} onClick={(e) => setBattleLeague(500)}>
                    <img alt='img-league' width={128} height={128} src={APIService.getPokeOtherLeague("GBL_littlecup")}></img>
                    <div><b>Little Cup</b></div>
                    <span className="text-danger">CP below 500</span>
                </button>
                <button className={"btn btn-form"+(battleLeague === 1500 ? " form-selected" : "")} style={{height: 200}} onClick={(e) => setBattleLeague(1500)}>
                    <img alt='img-league' width={128} height={128} src={APIService.getPokeLeague("great_league")}></img>
                    <div><b>Great League</b></div>
                    <span className="text-danger">CP below 1500</span>
                </button>
                <button className={"btn btn-form"+(battleLeague === 2500 ? " form-selected" : "")} style={{height: 200}} onClick={(e) => setBattleLeague(2500)}>
                    <img alt='img-league' width={128} height={128} src={APIService.getPokeLeague("ultra_league")}></img>
                    <div><b>Ultra League</b></div>
                    <span className="text-danger">CP below 2500</span>
                </button>
                <button className={"btn btn-form"+(battleLeague === null ? " form-selected" : "")} style={{height: 200}} onClick={(e) => setBattleLeague(null)}>
                    <img alt='img-league' width={128} height={128} src={APIService.getPokeLeague("master_league")}></img>
                    <div><b>Master League</b></div>
                    <span className="text-danger">No limit CP</span>
                </button>
            </div>
            <form className="element-top" onSubmit={onSearchStatsPoke.bind(this)}>
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
                    <button type="button" className="btn btn-danger" style={{marginRight: 15}} onClick={() => clearStatsPoke()}>Clear</button>
                    <button type="submit" className="btn btn-primary">Search</button>
                </div>
            </form>
            <DataTable
                title={"Stat Battle for "+name}
                columns={columnsStats}
                data={statsBattle}
                pagination
                defaultSortFieldId={1}
                striped
                highlightOnHover
            />
        </div>
    )

}

export default StatsTable;