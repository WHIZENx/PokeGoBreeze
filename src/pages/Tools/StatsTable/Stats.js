import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";

import { marks, PokeGoSlider } from "../../../util/Utils";
import { calStatsProd } from "../../../util/Calculate";

import APIService from "../../../services/API.service";

import Find from "../../../components/Select/Find/Find";

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
        name: 'Stat Prod (*1000)',
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

    const currStatBattle = useRef([]);
    const [battleLeague, setBattleLeague] = useState(500);

    const [statsBattle, setStatsBattle] = useState([]);

    useEffect(() => {
        document.title = "Stats Battle League - Tool";
    }, []);

    useEffect(() => {
        const battleTable = calStatsProd(statATK, statDEF, statSTA, 0, battleLeague);
        currStatBattle.current = battleTable
        setStatsBattle(battleTable);
    }, [statATK, statDEF, statSTA, battleLeague]);

    const clearStats = () => {
        setBattleLeague(500);
        setSearchCP('');
        setATKIv(0);
        setDEFIv(0);
        setSTAIv(0);
    }

    const clearStatsPoke = useCallback(() => {
        setStatsBattle(calStatsProd(statATK, statDEF, statSTA, 0, battleLeague))
    }, [battleLeague, statATK, statDEF, statSTA]);

    const searchStatsPoke = useCallback(() => {
        setStatsBattle([...currStatBattle.current].filter(item => item.CP === parseInt(searchCP) && item.IV.atk === ATKIv && item.IV.def === DEFIv && item.IV.sta === STAIv))
    }, [searchCP, ATKIv, DEFIv, STAIv]);

    const onSearchStatsPoke = useCallback((e) => {
        e.preventDefault();
        searchStatsPoke();
    }, [searchStatsPoke]);

    return (
        <div className="container" style={{minHeight: 1650}}>
            <Find hide={true} clearStats={clearStats} setStatATK={setStatATK} setStatDEF={setStatDEF} setStatSTA={setStatSTA} setName={setName}/>
            <h1 id ="main" className='text-center'>Stats Battle Table</h1>
            <div className="text-center" style={{marginTop: 15, marginBottom: 15}}>
                <button className={"btn btn-form"+(battleLeague === 500 ? " form-selected" : "")} style={{height: 200}} onClick={(e) => setBattleLeague(500)}>
                    <img alt='img-league' width={128} height={128} src={APIService.getPokeOtherLeague("GBL_littlecup")}/>
                    <div><b>Little Cup</b></div>
                    <span className="text-danger">CP below 500</span>
                </button>
                <button className={"btn btn-form"+(battleLeague === 1500 ? " form-selected" : "")} style={{height: 200}} onClick={(e) => setBattleLeague(1500)}>
                    <img alt='img-league' width={128} height={128} src={APIService.getPokeLeague("great_league")}/>
                    <div><b>Great League</b></div>
                    <span className="text-danger">CP below 1500</span>
                </button>
                <button className={"btn btn-form"+(battleLeague === 2500 ? " form-selected" : "")} style={{height: 200}} onClick={(e) => setBattleLeague(2500)}>
                    <img alt='img-league' width={128} height={128} src={APIService.getPokeLeague("ultra_league")}/>
                    <div><b>Ultra League</b></div>
                    <span className="text-danger">CP below 2500</span>
                </button>
                <button className={"btn btn-form"+(battleLeague === null ? " form-selected" : "")} style={{height: 200}} onClick={(e) => setBattleLeague(null)}>
                    <img alt='img-league' width={128} height={128} src={APIService.getPokeLeague("master_league")}/>
                    <div><b>Master League</b></div>
                    <span className="text-danger">No limit CP</span>
                </button>
            </div>
            <form className="element-top" onSubmit={onSearchStatsPoke.bind(this)}>
                <div className="form-group d-flex justify-content-center text-center">
                    <Box sx={{ width: '50%', minWidth: 350 }}>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">CP</span>
                            </div>
                        <input required value={searchCP} type="number" min={10} className="form-control" aria-label="cp" aria-describedby="input-cp" placeholder="Enter CP"
                        onInput={e => setSearchCP(e.target.value)}/>
                        </div>
                    </Box>
                </div>
                <div className="form-group d-flex justify-content-center text-center">
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
                <div className="form-group d-flex justify-content-center text-center element-top">
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