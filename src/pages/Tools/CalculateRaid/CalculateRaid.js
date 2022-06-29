import { Fragment, useEffect, useRef, useState } from "react";
import Find from "../Find";

import { Tabs, Tab } from "react-bootstrap";

import './CalculateRaid.css';
import Move from "../../../components/Table/Move";
import { Checkbox, FormControlLabel } from "@mui/material";
import { capitalize, marks, PokeGoSlider } from "../../../util/Utils";
import { findStabType } from "../../../util/Compute";
import { MAX_IV, MAX_LEVEL, MIN_IV, MIN_LEVEL } from "../../../util/Constants";
import { calculateDamagePVE, calculateRaidStat, calculateStatsBattle, getTypeEffective } from "../../../util/Calculate";

const CalculateRaid = () => {

    const [id, setId] = useState(1);
    const [name, setName] = useState('');
    const [form, setForm] = useState(null);
    const [move, setMove] = useState(null);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);
    const [statSTA, setStatSTA] = useState(0);

    const [DEFIv, setDEFIv] = useState(0);
    const [STAIv, setSTAIv] = useState(0);

    const [weaterBoosts, setWeaterBoosts] = useState(false);

    const [statBossATK, setStatBossATK] = useState(0);
    const [statBossDEF, setStatBossDEF] = useState(0);

    const initialize = useRef(false);

    const [tier, setTier] = useState(1);

    const [idBoss, setIdBoss] = useState(1);
    const [nameBoss, setNameBoss] = useState('');
    const [formBoss, setFormBoss] = useState(null);
    const [moveBoss, setMoveBoss] = useState(null);

    const [fMove, setFMove] = useState(null);
    const [cMove, setCMove] = useState(null);

    const [resultBreakPointAtk, setResultBreakPointAtk] = useState(null);
    const [resultBreakPointDef, setResultBreakPointDef] = useState(null);
    const [resultBulkpointDef, setResultBulkPointDef] = useState(null);

    useEffect(() => {
        document.title = "Calculate Raid Stats - Tools";
    }, []);

    const resetData = () => {
        clearDataAtk();
        clearDataDef();
        setResultBulkPointDef(null);
        setFMove(null);
        setCMove(null);
        initialize.current = false;
    }

    const clearDataAtk = () => {
        setResultBreakPointAtk(null);
        setMove(null);
    }

    const clearDataDef = () => {
        setResultBreakPointDef(null);
        setMoveBoss(null);
    }

    const onSetForm = (form) => {
        setForm(form);
    }

    const onSetFormBoss = (form) => {
        setFormBoss(form);
    }

    const calculateBreakpointAtk = (level, iv) => {
        setResultBreakPointAtk(null);
        let dataList = [];
        let group = []
        let lv = 0;
        for (let i = MIN_LEVEL; i <= MAX_LEVEL; i+=0.5) {
            dataList[lv] = dataList[lv] ?? [];
            for (let j = MIN_IV; j <= MAX_IV; j+=1) {
                const result = calculateDamagePVE(calculateStatsBattle(statATK, j, i, true), calculateRaidStat(statBossDEF, tier), move.pve_power, {
                    effective: getTypeEffective(move.type, formBoss.form.types.map(item => item.type.name)),
                    stab: findStabType(form.form.types.map(item => item.type.name), move.type),
                    wb: weaterBoosts
                }, false);
                dataList[lv].push(result)
                group.push(result)
            }
            lv++;
        }
        const colorTone = computeColorTone(Array.from(new Set(group)).sort((a,b) => a-b));
        setResultBreakPointAtk({data: dataList, colorTone: colorTone, atk: name, def: nameBoss, tier: tier});
    }

    const calculateBreakpointDef = (level, iv) => {
        setResultBreakPointDef(null);
        let dataListDef = [];
        let groupDef = [];
        let dataListSta = [];
        let groupSta = [];
        let lv = 0;
        for (let i = MIN_LEVEL; i <= MAX_LEVEL; i+=0.5) {
            dataListDef[lv] = dataListDef[lv] ?? [];
            dataListSta[lv] = dataListSta[lv] ?? [];
            for (let j = MIN_IV; j <= MAX_IV; j+=1) {
                const resultDef = calculateDamagePVE(calculateRaidStat(statBossATK, tier), calculateStatsBattle(statDEF, j, i, true), moveBoss.pve_power, {
                    effective: getTypeEffective(moveBoss.type, form.form.types.map(item => item.type.name)),
                    stab: findStabType(formBoss.form.types.map(item => item.type.name), moveBoss.type),
                    wb: weaterBoosts
                }, false);
                dataListDef[lv].push(resultDef);
                groupDef.push(resultDef);
                const resultSta = calculateStatsBattle(statSTA, j, i, true);
                dataListSta[lv].push(resultSta);
                groupSta.push(resultSta);
            }
            lv++;
        }

        const colorToneDef = computeColorTone(Array.from(new Set(groupDef)).sort((a,b) => b-a));
        const colorToneSta = computeColorTone(Array.from(new Set(groupSta)).sort((a,b) => a-b));
        setResultBreakPointDef({dataDef: dataListDef, dataSta: dataListSta, colorToneDef: colorToneDef, colorToneSta: colorToneSta, atk: name, def: nameBoss, tier: tier});
    }

    const computeColorTone = (data) => {
        let colorTone = {};
        let g = 255, b = 100;
        const diff = Math.max(1, 20-(data.length/2))
        data.forEach((value, index) => {
            g -= diff;
            if (index % 2 === 0) b -= diff;
            colorTone[value.toString()] = {}
            colorTone[value.toString()]["number"] = value;
            colorTone[value.toString()]["color"] = `rgb(50, ${Math.max(0, g)}, ${Math.max(0, b)})`;
        });
        return colorTone;
    }

    const computeBulk = (count, lv) => {
        return Math.max(0, Math.ceil((calculateStatsBattle(statSTA, STAIv, lv, true) - count*calculateDamagePVE(calculateRaidStat(statBossATK, tier), calculateStatsBattle(statDEF, DEFIv, lv, true), fMove.pve_power, {
            effective: getTypeEffective(fMove.type, form.form.types.map(item => item.type.name)),
            stab: findStabType(formBoss.form.types.map(item => item.type.name), fMove.type),
            wb: weaterBoosts
        }, false)) / calculateDamagePVE(calculateRaidStat(statBossATK, tier), calculateStatsBattle(statDEF, DEFIv, lv, true), cMove.pve_power, {
            effective: getTypeEffective(cMove.type, form.form.types.map(item => item.type.name)),
            stab: findStabType(formBoss.form.types.map(item => item.type.name), cMove.type),
            wb: weaterBoosts
        }, false)));
    }

    const calculateBulkpointDef = () => {
        setResultBulkPointDef(null);
        let dataList = [];
        let lv = 0;
        for (let i = MIN_LEVEL; i <= MAX_LEVEL; i+=0.5) {
            let count = 0;
            dataList[lv] = dataList[lv] ?? [];
            let result = computeBulk(count, i);
            while (result > 0) {
                dataList[lv].push(result);
                count++;
                result = computeBulk(count, i);
            }
            lv++;
        }
        // const maxLength = Math.max(...dataList.map(item => item.length))
        // console.log(maxLength)
        // setResultBulkPointDef({data: dataList, atk: name, def: nameBoss, tier: tier});
    }

    return (
        <Fragment>
        <div className="row" style={{margin: 0, overflowX: "hidden"}}>
            <div className="col-lg" style={{padding: 0}}>
                <Find title="Attacker Pokémon" clearStats={resetData} setStatATK={setStatATK} setStatDEF={setStatDEF} setStatSTA={setStatSTA} setForm={onSetForm} setName={setName} setId={setId}/>
            </div>
            <div className="col-lg d-flex justify-content-center align-items-center" style={{padding: 0}}>
                <Find swap={true} raid={true} tier={tier} setTier={setTier} title="Boss Pokémon" clearStats={resetData} setStatATK={setStatBossATK} setStatDEF={setStatBossDEF} setForm={onSetFormBoss} setName={setNameBoss} setId={setIdBoss}/>
            </div>
        </div>
        <hr/>
        <div className="container" style={{marginBottom: 20}}>
        <Tabs defaultActiveKey="breakpointAtk" className="lg-2">
            <Tab eventKey="breakpointAtk" title="Breakpoint Attacker">
                <div className="tab-body">
                    <div className="row">
                        <div className="col-lg-4">
                            <h2 className="text-center text-decoration-underline">Attacker move</h2>
                            <Move text="Select Moves" id={id} selectDefault={true} form={form ? form.form.pokemon.name : name.toLowerCase()} setMove={setMove} move={move}/>
                            <FormControlLabel control={<Checkbox checked={weaterBoosts} onChange={(event, check) => setWeaterBoosts(check)}/>} label="Weater Boosts"/>
                            {move &&
                            <div style={{width: 300, margin: 'auto'}}>
                                <p>- Move Ability Type: <b>{capitalize(move.type_move.toLowerCase())}</b></p>
                                <p>- Move Type: <span className={"type-icon-small "+move.type.toLowerCase()}>{capitalize(move.type.toLowerCase())}</span></p>
                                {findStabType(form.form.types.map(item => item.type.name), move.type)}
                                <p>- Damage: <b>{move.pve_power}
                                {findStabType(form.form.types.map(item => item.type.name), move.type) && <span className={"caption-small text-success"}> (x1.2)</span>}
                                </b></p>
                            </div>
                            }
                            <button className="text-center btn btn-primary w-100" style={{marginBottom: 20}} onClick={() => calculateBreakpointAtk()} disabled={!move}>Calculate</button>
                        </div>
                        <div className="col-lg-8" style={{overflowX: 'auto'}}>
                            <h3>Attacker Breakpoint{resultBreakPointAtk && `: ${resultBreakPointAtk.atk} Raid ${resultBreakPointAtk.def} Tier ${resultBreakPointAtk.tier}`}</h3>
                            <table className="table-info table-raid-cal">
                                <thead className="text-center">
                                    <tr className="table-header">
                                        <th></th>
                                        {[...Array(MAX_IV+1).keys()].map((value, index) => (
                                            <th key={index}>
                                                {value}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                {Array.from({length:(MAX_LEVEL-MIN_LEVEL)/0.5+1},(_,i)=>1+(i*0.5)).map((level, i) => (
                                    <tr key={i}>
                                        <td>{level}</td>
                                        {[...Array(MAX_IV+1).keys()].map((iv, index) => (
                                            <td className="text-iv" style={{backgroundColor: resultBreakPointAtk ? `${Object.values(resultBreakPointAtk.colorTone).find(item => item.number === resultBreakPointAtk.data[i][index]).color}` : ""}} key={index}>
                                                {resultBreakPointAtk && `${resultBreakPointAtk.data[i][index]}`}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Tab>
            <Tab eventKey="breakpointDef" title="Breakpoint Defender">
                <div className="tab-body">
                    <div className="row">
                        <div className="col-lg-4">
                            <h2 className="text-center text-decoration-underline">Boss move</h2>
                            <Move text="Select Moves" id={idBoss} selectDefault={true} form={formBoss ? formBoss.form.pokemon.name : nameBoss.toLowerCase()} setMove={setMoveBoss} move={moveBoss}/>
                            <FormControlLabel control={<Checkbox checked={weaterBoosts} onChange={(event, check) => setWeaterBoosts(check)}/>} label="Weater Boosts"/>
                            {moveBoss &&
                            <div style={{width: 300, margin: 'auto'}}>
                                <p>- Move Ability Type: <b>{capitalize(moveBoss.type_move.toLowerCase())}</b></p>
                                <p>- Move Type: <span className={"type-icon-small "+moveBoss.type.toLowerCase()}>{capitalize(moveBoss.type.toLowerCase())}</span></p>
                                {findStabType(formBoss.form.types.map(item => item.type.name), moveBoss.type)}
                                <p>- Damage: <b>{moveBoss.pve_power}
                                {findStabType(formBoss.form.types.map(item => item.type.name), moveBoss.type) && <span className={"caption-small text-success"}> (x1.2)</span>}
                                </b></p>
                            </div>
                            }
                            <button className="text-center btn btn-primary w-100" style={{marginBottom: 20}} onClick={() => calculateBreakpointDef()} disabled={!moveBoss}>Calculate</button>
                        </div>
                        <div className="col-lg-8" style={{overflowX: 'auto'}}>
                            <h3>Defender Breakpoint{resultBreakPointDef && `: ${resultBreakPointDef.atk} Raid ${resultBreakPointDef.def} Tier ${resultBreakPointDef.tier}`}</h3>
                            <table className="table-info table-raid-cal">
                                <thead className="text-center">
                                    <tr className="table-header">
                                        <th></th>
                                        {[...Array(MAX_IV+1).keys()].map((value, index) => (
                                            <th key={index}>
                                                {value}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                {Array.from({length:(MAX_LEVEL-MIN_LEVEL)/0.5+1},(_,i)=>1+(i*0.5)).map((level, i) => (
                                    <tr key={i}>
                                        <td>{level}</td>
                                        {[...Array(MAX_IV+1).keys()].map((iv, index) => (
                                            <td className="text-iv" style={{backgroundColor: resultBreakPointDef ? `${Object.values(resultBreakPointDef.colorToneDef).find(item => item.number === resultBreakPointDef.dataDef[i][index]).color}` : ""}} key={index}>
                                                {resultBreakPointDef && `${resultBreakPointDef.dataDef[i][index]}`}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <hr />
                            <h3>Stamina Breakpoint{resultBreakPointDef && `: ${resultBreakPointDef.atk} Raid ${resultBreakPointDef.def} Tier ${resultBreakPointDef.tier}`}</h3>
                            <table className="table-info table-raid-cal">
                                <thead className="text-center">
                                    <tr className="table-header">
                                        <th></th>
                                        {[...Array(MAX_IV+1).keys()].map((value, index) => (
                                            <th key={index}>
                                                {value}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                {Array.from({length:(MAX_LEVEL-MIN_LEVEL)/0.5+1},(_,i)=>1+(i*0.5)).map((level, i) => (
                                    <tr key={i}>
                                        <td>{level}</td>
                                        {[...Array(MAX_IV+1).keys()].map((iv, index) => (
                                            <td className="text-iv" style={{backgroundColor: resultBreakPointDef ? `${Object.values(resultBreakPointDef.colorToneSta).find(item => item.number === resultBreakPointDef.dataSta[i][index]).color}` : ""}} key={index}>
                                                {resultBreakPointDef && `${resultBreakPointDef.dataSta[i][index]}`}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Tab>
            <Tab eventKey="bulkpoint" title="Bulkpoint Attacker">
                <div className="tab-body">
                    <div className="row">
                        <div className="col-lg-4">
                            <h2 className="text-center text-decoration-underline">Boss move</h2>
                            <div style={{marginBottom: 15}}>
                                <Move text="Fast Moves" id={idBoss} selectDefault={true} form={formBoss ? formBoss.form.pokemon.name : nameBoss.toLowerCase()} setMove={setFMove} move={fMove} type="FAST"/>
                                {fMove &&
                                <div className="element-top" style={{width: 300, margin: 'auto'}}>
                                    <p>- Move Ability Type: <b>{capitalize(fMove.type_move.toLowerCase())}</b></p>
                                    <p>- Move Type: <span className={"type-icon-small "+fMove.type.toLowerCase()}>{capitalize(fMove.type.toLowerCase())}</span></p>
                                    {findStabType(formBoss.form.types.map(item => item.type.name), fMove.type)}
                                    <p>- Damage: <b>{fMove.pve_power}
                                    {findStabType(formBoss.form.types.map(item => item.type.name), fMove.type) && <span className={"caption-small text-success"}> (x1.2)</span>}
                                    </b></p>
                                </div>
                                }
                            </div>
                            <div>
                                <Move text="Charge Moves" id={idBoss} selectDefault={true} form={formBoss ? formBoss.form.pokemon.name : nameBoss.toLowerCase()} setMove={setCMove} move={cMove} type="CHARGE"/>
                                {cMove &&
                                <div className="element-top" style={{width: 300, margin: 'auto'}}>
                                    <p>- Move Ability Type: <b>{capitalize(cMove.type_move.toLowerCase())}</b></p>
                                    <p>- Move Type: <span className={"type-icon-small "+cMove.type.toLowerCase()}>{capitalize(cMove.type.toLowerCase())}</span></p>
                                    {findStabType(formBoss.form.types.map(item => item.type.name), cMove.type)}
                                    <p>- Damage: <b>{cMove.pve_power}
                                    {findStabType(formBoss.form.types.map(item => item.type.name), cMove.type) && <span className={"caption-small text-success"}> (x1.2)</span>}
                                    </b></p>
                                </div>
                                }
                            </div>
                            <FormControlLabel control={<Checkbox checked={weaterBoosts} onChange={(event, check) => setWeaterBoosts(check)}/>} label="Weater Boosts"/>
                            <hr/>
                            <h2 className="text-center text-decoration-underline">Defender stats</h2>
                            <div>
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
                            </div>
                            <button className="text-center btn btn-primary w-100" style={{marginBottom: 20}} onClick={() => calculateBulkpointDef()} disabled={!(fMove && cMove)}>Calculate</button>
                        </div>
                        <div className="col-lg-8" style={{overflowX: 'auto'}}>
                            <h3>Bulkpoint{resultBulkpointDef && `: ${resultBulkpointDef.atk} Raid ${resultBulkpointDef.def} Tier ${resultBulkpointDef.tier}`}</h3>
                            <table className="table-info table-raid-cal">
                                <thead className="text-center">
                                    <tr className="table-header">
                                        {resultBulkpointDef ?
                                        <></>
                                        :
                                        <Fragment>
                                        <th></th>
                                        {[...Array(11).keys()].map((value, index) => (
                                            <th key={index}>
                                                {value}
                                            </th>
                                        ))}
                                        <th>...</th>
                                        </Fragment>
                                        }
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                {Array.from({length:(MAX_LEVEL-MIN_LEVEL)/0.5+1},(_,i)=>1+(i*0.5)).map((level, i) => (
                                    <tr key={i}>
                                        <td>{level}</td>
                                        {resultBulkpointDef ?
                                        <></>
                                        :
                                        <Fragment>
                                            {[...Array(12).keys()].map((iv, index) => (
                                                <td key={index}></td>
                                            ))}
                                        </Fragment>
                                        }
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Tab>
        </Tabs>
        </div>
        </Fragment>
    )
}

export default CalculateRaid;