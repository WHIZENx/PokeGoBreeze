import { Fragment, useCallback, useEffect, useState } from "react";

import pokemonData from '../../data/pokemon.json';
import combatData from '../../data/combat.json';
import combatPokemonData from '../../data/combat_pokemon_go_list.json';
import typesData from '../../data/type_effectiveness.json';
import weatherBoosts from '../../data/weather_boosts.json';
import { calculateAvgDPS, calculateCP, calculateStatsByTag, calculateTDO, convertName, splitAndCapitalize, calculateStatsBettlePure, DEFAULT_POKEMON_DEF_OBJ, calculateBattleDPS, TimeToKill, calculateBattleDPSDefender } from "../../components/Calculate/Calculate";
import DataTable from "react-data-table-component";
import APIService from "../../services/API.service";

import loadingImg from '../../assets/loading.png';
import Type from "../../components/Sprites/Type";
import { Checkbox, FormControlLabel, Switch, capitalize } from "@mui/material";
import { Box } from "@mui/system";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

import './DpsTable.css';
import { Link } from "react-router-dom";
import { LevelRating } from "../../util/util";
import { Form } from "react-bootstrap";
import SelectPokemon from "../../components/Input/SelectPokemon";
import SelectMove from "../../components/Input/SelectMove";

const nameSort = (rowA, rowB) => {
    const a = rowA.pokemon.name.toLowerCase();
    const b = rowB.pokemon.name.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
};

const fmoveSort = (rowA, rowB) => {
    const a = rowA.fmove.name.toLowerCase();
    const b = rowB.fmove.name.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
};

const cmoveSort = (rowA, rowB) => {
    const a = rowA.cmove.name.toLowerCase().replaceAll(" plus", "+");
    const b = rowB.cmove.name.toLowerCase().replaceAll(" plus", "+");
    return a === b ? 0 : a > b ? 1 : -1;
};

const columns = [
    {
        name: 'ID',
        selector: row => row.pokemon.num,
        sortable: true,
        minWidth: '60px',
        maxWidth: '120px',
    },
    {
        name: 'Pokémon Name',
        selector: row =>
            <Link to={`/pokemon/${row.pokemon.num}${row.pokemon.forme ? `?form=${row.pokemon.forme.toLowerCase()}`: ""}`} target="_blank" title={`#${row.pokemon.num} ${splitAndCapitalize(row.pokemon.name, "-", " ")}`}>
            {row.shadow && <img height={25} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}></img>}
            {row.purified && <img height={25} alt="img-shadow" className="purified-icon" src={APIService.getPokePurified()}></img>}
            <img height={48} alt='img-pokemon' style={{marginRight: 10}}
            src={APIService.getPokeIconSprite(row.pokemon.sprite, true)}
            onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeIconSprite(row.pokemon.baseSpecies)}}></img>
            {splitAndCapitalize(row.pokemon.name, "-", " ")}</Link>
        ,
        sortable: true,
        minWidth: '300px',
        sortFunction: nameSort
    },
    {
        name: 'Fast Move',
        selector: row => <Link className="d-flex align-items-center" to={"/moves/"+combatData.find(item => item.name === row.fmove.name).id} target="_blank" title={`${splitAndCapitalize(row.fmove.name, "_", " ")}`}>
            <img style={{marginRight: 10}} width={25} height={25} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(row.fmove.type))}></img> <div><span className="text-b-ic">{splitAndCapitalize(row.fmove.name, "_", " ")}</span>{row.elite.fmove && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}</div></Link>,
        sortable: true,
        minWidth: '200px',
        sortFunction: fmoveSort
    },
    {
        name: 'Charge Move',
        selector: row => <Link className="d-flex align-items-center" to={"/moves/"+combatData.find(item => item.name === row.cmove.name).id} target="_blank" title={`${splitAndCapitalize(row.cmove.name, "_", " ")}`}>
            <img style={{marginRight: 10}} width={25} height={25} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(row.cmove.type))}></img> <div><span className="text-b-ic">{splitAndCapitalize(row.cmove.name, "_", " ").replaceAll(" Plus", "+")}</span>{row.elite.cmove && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}{row.mShadow && <span className="type-icon-small ic shadow-ic"><span>Shadow</span></span>}{row.purified && <span className="type-icon-small ic purified-ic"><span>Purified</span></span>}</div></Link>,
        sortable: true,
        minWidth: '220px',
        sortFunction: cmoveSort
    },
    {
        name: 'DPS',
        selector: row => parseFloat(row.dps.toFixed(3)),
        sortable: true,
        minWidth: '80px',
    },
    {
        name: 'TDO',
        selector: row => parseFloat(row.tdo.toFixed(3)),
        sortable: true,
        minWidth: '100px',
    },
    {
        name: 'DPS^3*TDO',
        selector: row => parseFloat(row.multiDpsTdo.toFixed(3)),
        sortable: true,
        minWidth: '140px',
    },
    {
        name: 'CP',
        selector: row => row.cp,
        sortable: true,
        minWidth: '100px',
    },
];

const DpsTable = () => {

    const types = Object.keys(typesData);

    const [dpsTable, setDpsTable] = useState([]);
    const [dataFilter, setDataFilter] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [dataTargetPokemon, setDataTargetPokemon] = useState(null);
    const [fmoveTargetPokemon, setFmoveTargetPokemon] = useState(null);
    const [cmoveTargetPokemon, setCmoveTargetPokemon] = useState(null);

    const [filters, setFilters] = useState({
        showEliteMove: true,
        showShadow: true,
        showMega: true,
        enableShadow: false,
        enableElite: false,
        enableMega: false,
        enableBest: false,
        enableDelay: false,
        bestOf: 3,
        IV_ATK: 15,
        IV_DEF: 15,
        IV_HP: 15,
        POKEMON_LEVEL: 40
    });

    const {showEliteMove, showShadow, enableShadow, showMega, enableElite, enableMega, enableBest, enableDelay, bestOf, IV_ATK, IV_DEF, IV_HP, POKEMON_LEVEL} = filters;

    const [options, setOptions] = useState({
        delay: null,
        specific: null,
        WEATHER_BOOSTS: false,
        TRAINER_FRIEND: false,
        TRAINER_FRIEND_LEVEL: 0,
        POKEMON_DEF_OBJ: DEFAULT_POKEMON_DEF_OBJ,
    });
    const {WEATHER_BOOSTS, TRAINER_FRIEND, TRAINER_FRIEND_LEVEL, POKEMON_DEF_OBJ} = options;

    const [finished, setFinished] = useState(false);
    const [showSpinner, setShowSpinner] = useState(true);
    const [selectTypes, setSelectTypes] = useState([]);

    const addCPokeData = useCallback((dataList, movePoke, value, vf, shadow, purified, felite, celite, shadowMove, purifiedMove) => {
        movePoke.forEach(vc => {
            const fmove = combatData.find(item => item.name === vf.replaceAll("_FAST", ""));
            const cmove = combatData.find(item => item.name === vc);
            const stats = calculateStatsByTag(value.baseStats, value.forme);
            const statsAttacker = {
                atk: calculateStatsBettlePure(stats.atk, IV_ATK, POKEMON_LEVEL),
                def: calculateStatsBettlePure(stats.def, IV_DEF, POKEMON_LEVEL),
                hp: calculateStatsBettlePure(stats.sta, IV_HP, POKEMON_LEVEL),
                fmove: fmove,
                cmove: cmove,
                types: value.types,
                shadow: shadow,
                WEATHER_BOOSTS: options.WEATHER_BOOSTS,
                POKEMON_FRIEND: options.TRAINER_FRIEND,
                POKEMON_FRIEND_LEVEL: options.TRAINER_FRIEND_LEVEL,
            }

            let dps, tdo;
            if (dataTargetPokemon && fmoveTargetPokemon && cmoveTargetPokemon) {
                const statsDef = calculateStatsByTag(dataTargetPokemon.baseStats, dataTargetPokemon.forme);
                const statsDefender = {
                    atk: calculateStatsBettlePure(statsDef.atk, IV_ATK, POKEMON_LEVEL),
                    def: calculateStatsBettlePure(statsDef.def, IV_DEF, POKEMON_LEVEL),
                    hp: calculateStatsBettlePure(statsDef.sta, IV_HP, POKEMON_LEVEL),
                    fmove: combatData.find(item => item.name === fmoveTargetPokemon.name.replaceAll("_FAST", "")),
                    cmove: combatData.find(item => item.name === cmoveTargetPokemon.name),
                    types: dataTargetPokemon.types,
                    WEATHER_BOOSTS: options.WEATHER_BOOSTS
                }
                const dpsDef = calculateBattleDPSDefender(statsAttacker, statsDefender);
                dps = calculateBattleDPS(statsAttacker, statsDefender, dpsDef);
                tdo = dps*TimeToKill(Math.floor(statsAttacker.hp), dpsDef);
            } else {
                dps = calculateAvgDPS(statsAttacker.fmove, statsAttacker.cmove,
                    statsAttacker.atk,
                    statsAttacker.def,
                    statsAttacker.hp,
                    statsAttacker.types,
                    options,
                    statsAttacker.shadow);
                tdo = calculateTDO(statsAttacker.def, statsAttacker.hp, dps, statsAttacker.shadow);
            }
            dataList.push({
                pokemon: value,
                fmove: statsAttacker.fmove,
                cmove: statsAttacker.cmove,
                dps: dps,
                tdo: tdo,
                multiDpsTdo: Math.pow(dps,3)*tdo,
                shadow: shadow,
                purified: purified && purifiedMove && purifiedMove.includes(statsAttacker.cmove.name),
                mShadow: shadow && shadowMove && shadowMove.includes(statsAttacker.cmove.name),
                elite: {
                    fmove: felite,
                    cmove: celite
                },
                cp : calculateCP(stats.atk+IV_ATK, stats.def+IV_DEF, stats.sta+IV_HP, POKEMON_LEVEL)
            });
        });
    }, [IV_ATK, IV_DEF, IV_HP, POKEMON_LEVEL, options, dataTargetPokemon, fmoveTargetPokemon, cmoveTargetPokemon]);

    const addFPokeData = useCallback((dataList, combat, movePoke, pokemon, felite) => {
        movePoke.forEach(vf => {
            addCPokeData(dataList, combat.CINEMATIC_MOVES, pokemon, vf, false, false, felite, false);
            if (!pokemon.forme || !pokemon.forme.toLowerCase().includes("mega")) {
                if (combat.SHADOW_MOVES.length > 0) addCPokeData(dataList, combat.CINEMATIC_MOVES, pokemon, vf, true, false, felite, false);
                addCPokeData(dataList, combat.SHADOW_MOVES, pokemon, vf, true, false, felite, false, combat.SHADOW_MOVES, combat.PURIFIED_MOVES);
                addCPokeData(dataList, combat.PURIFIED_MOVES, pokemon, vf, false, true, felite, false, combat.SHADOW_MOVES, combat.PURIFIED_MOVES);
            }
            if ((!pokemon.forme || !pokemon.forme.toLowerCase().includes("mega")) && combat.SHADOW_MOVES.length > 0) addCPokeData(dataList, combat.ELITE_CINEMATIC_MOVES, pokemon, vf, true, false, felite, true);
            else addCPokeData(dataList, combat.ELITE_CINEMATIC_MOVES, pokemon, vf, false, false, felite, true);
        });
    }, [addCPokeData]);

    const calculateDPSTable = useCallback(() => {
        let dataList = [];
        Object.values(pokemonData).forEach(pokemon => {
            if (pokemon.num > 0) {
                let combatPoke = combatPokemonData.filter(item => item.ID === pokemon.num
                    && item.BASE_SPECIES === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
                );
                let result = combatPoke.find(item => item.NAME === convertName(pokemon.name));
                if (!result) combatPoke = combatPoke[0]
                else combatPoke = result;
                if (combatPoke) {
                    addFPokeData(dataList, combatPoke, combatPoke.QUICK_MOVES, pokemon, false);
                    addFPokeData(dataList, combatPoke, combatPoke.ELITE_QUICK_MOVES, pokemon, true);
                }
            }
        });
        setFinished(true);
        setShowSpinner(false);
        return dataList;
    }, [addFPokeData]);

    const filterBestOptions = (result, best) => {
        best = best === 1 ? "dps" : best === 2 ? "tdo" : "multiDpsTdo";
        const group = result.reduce((result, obj) => {
            (result[obj.pokemon.name] = result[obj.pokemon.name] || []).push(obj);
            return result;
        }, {});
        return Object.values(group).map(pokemon => pokemon.reduce((p, c) => p[best] > c[best] ? p : c));
    };

    useEffect(() => {
        document.title = "DPS&TDO Table";
        if (!finished && dataTargetPokemon && fmoveTargetPokemon && cmoveTargetPokemon) setDpsTable(calculateDPSTable());
        else if (!dataTargetPokemon && !finished) setDpsTable(calculateDPSTable());
        if (finished) {
            let result = dpsTable.filter(item => {
                const boolFilterType = selectTypes.length === 0 || (selectTypes.includes(capitalize(item.fmove.type.toLowerCase())) && selectTypes.includes(capitalize(item.cmove.type.toLowerCase())));
                const boolFilterPoke =  searchTerm === '' || splitAndCapitalize(item.pokemon.name, "-", " ").toLowerCase().includes(searchTerm.toLowerCase()) || item.pokemon.num.toString().includes(searchTerm);

                const boolShowShadow = !showShadow && item.shadow;
                const boolShowElite = !showEliteMove && (item.elite.fmove || item.elite.cmove);
                const boolShowMega = !showMega && item.pokemon.forme && item.pokemon.forme.toLowerCase().includes("mega");

                const boolOnlyShadow = enableShadow && item.shadow;
                const boolOnlyElite = enableElite && (item.elite.fmove || item.elite.cmove);
                const boolOnlyMega = enableMega && item.pokemon.forme && item.pokemon.forme.toLowerCase().includes("mega");
                if (enableShadow || enableElite || enableMega) return (boolFilterType && boolFilterPoke && !(boolShowShadow || boolShowElite || boolShowMega)) && (boolOnlyShadow || boolOnlyElite || boolOnlyMega);
                else return boolFilterType && boolFilterPoke && !(boolShowShadow || boolShowElite || boolShowMega);
            });
            if (enableBest) result = filterBestOptions(result, bestOf);
            setDataFilter(result);
        }
    }, [finished, calculateDPSTable, dpsTable, selectTypes, searchTerm, showShadow, showEliteMove, showMega, enableElite, enableShadow, enableMega, enableBest, bestOf,
        dataTargetPokemon, fmoveTargetPokemon, cmoveTargetPokemon]);

    const addTypeArr = (value) => {
        if (selectTypes.includes(value)) {
            return setSelectTypes([...selectTypes].filter(item => item !== value));
        }
        return setSelectTypes(oldArr => [...oldArr, value]);
    }

    const clearData = () => {
        setShowSpinner(true);
        setTimeout(() => {setFinished(false)}, 300);
    }

    const onCalculateTable = useCallback((e) => {
        e.preventDefault();
        clearData();
    }, [])

    return (
        <Fragment>
            <div className='head-filter border-types text-center w-100'>
                <div className='head-types'>Filter Moves By Types</div>
                <div className='row w-100' style={{margin: 0}}>
                    {types.map((item, index) => (
                        <div key={index} className="col img-group" style={{margin: 0, padding: 0}}>
                            <button value={item} onClick={() => addTypeArr(item)} className={'btn-select-type w-100 border-types'+(selectTypes.includes(item) ? " select-type" : "")} style={{padding: 10}}>
                                <Type styled={true} arr={[item]}/>
                            </button>
                        </div>
                    ))
                    }
                </div>
                <div className='row w-100' style={{margin: 0}}>
                    <div className='col-xxl' style={{padding: 0}}>
                        <div className="input-group border-input">
                            <span className="input-group-text">Search name or ID</span>
                            <input type="text" className='form-control input-search' placeholder='Enter name or ID'
                            value={searchTerm}
                            onInput={e => setSearchTerm(e.target.value)}></input>
                        </div>
                        <div className="input-group">
                            <span className="input-group-text">Filter show</span>
                            <FormControlLabel control={<Checkbox checked={showShadow} onChange={(event, check) => setFilters({...filters, showShadow: check})}/>} label="Shadow Pokémon" />
                            <FormControlLabel control={<Checkbox checked={showEliteMove} onChange={(event, check) => setFilters({...filters, showEliteMove: check})}/>} label="Elite Move" />
                            <FormControlLabel control={<Checkbox checked={showMega} onChange={(event, check) => setFilters({...filters, showMega: check})}/>} label="Mega" />
                        </div>
                        <div className="input-group border-input">
                            <span className="input-group-text">Filter only by</span>
                            <FormControlLabel control={<Checkbox checked={enableShadow} onChange={(event, check) => setFilters({...filters, enableShadow: check})}/>} label="Shadow"/>
                            <FormControlLabel control={<Checkbox checked={enableElite} onChange={(event, check) => setFilters({...filters, enableElite: check})}/>} label="Elite Moves"/>
                            <FormControlLabel control={<Checkbox checked={enableMega} onChange={(event, check) => setFilters({...filters, enableMega: check})}/>} label="Mega"/>
                        </div>
                        <div className="input-group">
                            <span className="input-group-text">Filter best movesets</span>
                            <FormControlLabel control={<Switch checked={enableBest} onChange={(event, check) => setFilters({...filters, enableBest: check})}/>} label="Best moveset of"/>
                            <Form.Select style={{borderRadius: 0}} className="form-control w-50" value={bestOf} disabled={!enableBest}
                                onChange={(e) => setFilters({...filters, bestOf: parseInt(e.target.value)})}>
                                    <option value={1}>DPS</option>
                                    <option value={2}>TDO</option>
                                    <option value={3}>DPS^3*TDO</option>
                            </Form.Select>
                        </div>
                        <div className="input-group">
                            <div className='row w-100' style={{margin: 0}}>
                                <Box className="col-xl-4" style={{padding: 0}}>
                                    <div className="input-group">
                                        <span className="input-group-text">Target Pokémon</span>
                                        <SelectPokemon clearData={clearData}
                                        setCurrentPokemon={setDataTargetPokemon}
                                        setFMovePokemon={setFmoveTargetPokemon}
                                        setCMovePokemon={setCmoveTargetPokemon}/>
                                    </div>
                                </Box>
                                <Box className="col-xl-4" style={{padding: 0}}>
                                    <div className="input-group">
                                        <span className="input-group-text">Fast Move</span>
                                        <SelectMove inputType={"small"} clearData={clearData} pokemon={dataTargetPokemon} move={fmoveTargetPokemon} setMovePokemon={setFmoveTargetPokemon} moveType="FAST"/>
                                    </div>
                                </Box>
                                <Box className="col-xl-4" style={{padding: 0}}>
                                    <div className="input-group">
                                        <span className="input-group-text">Charge Move</span>
                                        <SelectMove inputType={"small"} clearData={clearData} pokemon={dataTargetPokemon} move={cmoveTargetPokemon} setMovePokemon={setCmoveTargetPokemon} moveType="CHARGE"/>
                                    </div>
                                </Box>
                            </div>
                        </div>
                    </div>
                    <div className='col-xxl border-input' style={{padding: 0}}>
                        <div className='head-types'>Options</div>
                        <form className='w-100' onSubmit={onCalculateTable.bind(this)}>
                            <div className="input-group">
                                <FormControlLabel sx={{marginLeft: 1}} control={<Switch onChange={(event, check) => {
                                setFilters({...filters, enableDelay: check});
                                    if (check) {
                                        setOptions({
                                            ...options,
                                            delay: {
                                                ftime: 0,
                                                ctime: 0
                                            },
                                        });
                                    } else {
                                        setOptions({
                                            ...options,
                                            delay: null,
                                        });
                                    }
                                    }}/>} label="Delay" />
                                    <span className="input-group-text">Fast Move Time</span>
                                    <input type="number" className="form-control" style={{height:42}} placeholder="Delay time (sec)" aria-label="Fast Move Time" min={0} disabled={!enableDelay} required={enableDelay}
                                    onInput={(e) => setOptions({
                                        ...options,
                                        delay: {
                                            ftime: parseInt(e.target.value),
                                            ctime: options.delay.ctime,
                                        }
                                    })}></input>
                                    <span className="input-group-text">Charge Move Time</span>
                                    <input type="number" className="form-control" style={{height:42}} placeholder="Delay time (sec)" aria-label="Charge Move Time" min={0} disabled={!enableDelay} required={enableDelay}
                                    onInput={(e) => setOptions({
                                        ...options,
                                        delay: {
                                            ftime: options.delay.ftime,
                                            ctime: parseInt(e.target.value),
                                        }
                                })}></input>
                            </div>
                            <div className='row' style={{margin: 0}}>
                                <Box className="col-5 input-group" style={{padding: 0}}>
                                    <span className="input-group-text">IV ATK</span>
                                    <input defaultValue={IV_ATK} type="number" className="form-control" placeholder="0-15" min={0} max={15} required
                                    onInput={(e) => setFilters({
                                        ...filters,
                                        IV_ATK: parseInt(e.target.value),
                                    })} name="IV_ATK" style={{width: 40}}></input>
                                    <span className="input-group-text">IV DEF</span>
                                    <input defaultValue={IV_DEF} type="number" className="form-control" placeholder="0-15" min={0} max={15} required
                                    onInput={(e) => setFilters({
                                        ...filters,
                                        IV_DEF: parseInt(e.target.value),
                                    })} name="IV_DEF" style={{width: 40}}></input>
                                    <span className="input-group-text">IV HP</span>
                                    <input defaultValue={IV_HP} type="number" className="form-control" placeholder="0-15" min={0} max={15} required
                                    onInput={(e) => setFilters({
                                        ...filters,
                                        IV_HP: parseInt(e.target.value),
                                    })} name="IV_HP" style={{width: 40}}></input>
                                    <div className="input-group-prepend">
                                        <label className="input-group-text">Levels</label>
                                    </div>
                                    <Form.Select style={{borderRadius: 0}} className="form-control" defaultValue={POKEMON_LEVEL}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        POKEMON_LEVEL: parseInt(e.target.value)})}>
                                        {Array.from({length:(51-1)/0.5+1},(_,i)=>1+(i*0.5)).map((value, index) => (
                                            <option key={index} value={value}>{value}</option>
                                        ))
                                        }
                                    </Form.Select>
                                </Box>
                                <Box className="col-7 input-group" style={{padding: 0}}>
                                    <span className="input-group-text">DEF Target</span>
                                    <input value={POKEMON_DEF_OBJ} type="number" className="form-control" placeholder="Defense target" min={1} disabled={dataTargetPokemon ? true : false} required
                                    onInput={(e) => setOptions({
                                        ...options,
                                        POKEMON_DEF_OBJ: parseInt(e.target.value),
                                    })} name="POKEMON_DEF_OBJ"></input>
                                    <div className="input-group-prepend">
                                        <label className="input-group-text">Weather Boosts</label>
                                    </div>
                                    <Form.Select style={{borderRadius: 0}} className="form-control" defaultValue={WEATHER_BOOSTS}
                                    onChange={(e) => setOptions({
                                        ...options,
                                        WEATHER_BOOSTS: e.target.value === "true" ? true : e.target.value === "false" ? false : e.target.value})}>
                                        <option value={false}>Extream</option>
                                        {Object.keys(weatherBoosts).map((value, index) => (
                                            <option key={index} value={value}>{value}</option>
                                        ))
                                        }
                                    </Form.Select>
                                    <Box sx={{display: 'flex',alignItems: 'center',justifyContent: 'center',paddingLeft: 1,paddingRight: 1}}>
                                        <FormControlLabel control={<Switch onChange={(event, check) => {
                                                setOptions({
                                                    ...options,
                                                    TRAINER_FRIEND: check,
                                                    POKEMON_FRIEND_LEVEL: 0,
                                                });
                                            }}/>} label="Friendship Level:" />
                                            <LevelRating
                                            disabled={!TRAINER_FRIEND}
                                            onChange={(event, value) => {
                                                setOptions({
                                                    ...options,
                                                    [event.target.name]: value,
                                                });
                                            }}
                                            name="POKEMON_FRIEND_LEVEL"
                                            defaultValue={0}
                                            max={4}
                                            size='large'
                                            value={TRAINER_FRIEND_LEVEL}
                                            emptyIcon={<FavoriteBorder fontSize="inherit" />}
                                            icon={<Favorite fontSize="inherit"
                                        />}/>
                                    </Box>
                                </Box>
                                <button type="submit" className="btn btn-primary w-100" style={{borderRadius: 0}}>Calculate</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="position-relative">
                <div className='loading-group-spin' style={{display: !showSpinner ? "none" : "block"}}></div>
                <div className="loading-spin text-center" style={{display: !showSpinner ? "none" : "block"}}>
                    <img className="loading" width={64} height={64} alt='img-pokemon' src={loadingImg}></img>
                    <span className='caption text-black' style={{fontSize: 18}}><b>Loading...</b></span>
                </div>
                <DataTable
                    columns={columns}
                    data={dataFilter}
                    pagination
                    defaultSortFieldId={7}
                    defaultSortAsc={false}
                    highlightOnHover
                    striped
                />
            </div>
        </Fragment>
    )
}

export default DpsTable;