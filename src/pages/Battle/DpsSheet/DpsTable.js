import { Fragment, useCallback, useEffect, useState } from "react";

import pokemonData from '../../../data/pokemon.json';
import combatData from '../../../data/combat.json';
import combatPokemonData from '../../../data/combat_pokemon_go_list.json';
import { calculateAvgDPS, calculateCP, calculateStatsBettle, calculateStatsByTag, calculateTDO, getBarCharge } from "../../../components/Calculate/Calculate";
import DataTable from "react-data-table-component";
import APIService from "../../../services/API.service";

import loadingImg from '../../../assets/loading.png';
import Type from "../../../components/Sprits/Type";
import { Checkbox, FormControlLabel, Rating, Switch, styled } from "@mui/material";
import { Box } from "@mui/system";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

import './DpsTable.css';
import { Link } from "react-router-dom";

const LevelRating = styled(Rating)({
    '& .MuiRating-iconFilled': {
      color: '#ff3d47',
    },
    '& .MuiRating-iconHover': {
      color: '#ff3d47',
    },
});

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const splitAndCapitalize = (string, splitBy) => {
    return string.split(splitBy).map(text => capitalize(text.toLowerCase())).join(" ");
};

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
    const a = rowA.cmove.name.toLowerCase();
    const b = rowB.cmove.name.toLowerCase();
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
        name: 'Pokemon Name',
        selector: row =>
            <Link to={"/pokemon/"+row.pokemon.num} target="_blank">{row.shadow && <img height={25} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}></img>}
            <img height={48} alt='img-pokemon' style={{marginRight: 10}}
            src={APIService.getPokeIconSprite(row.pokemon.sprite, true)}
            onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeIconSprite(row.pokemon.baseSpecies)}}></img>
            {splitAndCapitalize(row.pokemon.name, "-")}</Link>
        ,
        sortable: true,
        minWidth: '300px',
        sortFunction: nameSort
    },
    {
        name: 'Fast Move',
        selector: row => <Link to={"/move/"+combatData.find(item => item.name === row.fmove.name).id} target="_blank"><img style={{marginRight: 10}} width={25} height={25} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(row.fmove.type))}></img> <span className={row.elite.fmove ? "text-danger" : ""}>{splitAndCapitalize(row.fmove.name, "_")}</span></Link>,
        sortable: true,
        minWidth: '200px',
        sortFunction: fmoveSort
    },
    {
        name: 'Charge Move',
        selector: row => <Link to={"/move/"+combatData.find(item => item.name === row.cmove.name).id} target="_blank"><img style={{marginRight: 10}} width={25} height={25} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(row.cmove.type))}></img> <span className={row.elite.cmove ? "text-danger" : ""}>{splitAndCapitalize(row.cmove.name, "_")}</span></Link>,
        sortable: true,
        minWidth: '200px',
        sortFunction: cmoveSort
    },
    {
        name: 'DPS',
        selector: row => parseFloat(row.dps.toFixed(2)),
        sortable: true,
        minWidth: '80px',
    },
    {
        name: 'TDO',
        selector: row => parseFloat(row.tdo.toFixed(2)),
        sortable: true,
        minWidth: '100px',
    },
    {
        name: 'DPS^3*TDO',
        selector: row => parseFloat(row.multiDpsTdo.toFixed(2)),
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

const DpsTable = (props) => {

    const types = ["Bug","Dark","Dragon","Electric","Fairy","Fighting","Fire","Flying","Ghost","Grass","Ground","Ice","Normal","Poison","Psychic","Rock","Steel","Water"]

    const [dpsTable, setDpsTable] = useState([]);
    const [dataFilter, setDataFilter] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState({
        delay: null,
        specific: false,
        ELITE_MOVE: true,
        POKEMON_SHADOW: true,
        WEATHER_BOOSTS: false,
        POKEMON_FRIEND_LEVEL: 0,
        POKEMON_DEF_OBJ: 160,
        DAMAGE_MULTIPLY: 0.5,
        DAMAGE_CONST: 1,
        IV_ATK: 15,
        IV_DEF: 15,
        IV_HP: 15,
        POKEMON_LEVEL: 40
    });
    const [loading, setLoading] = useState(true);
    const [selectTypes, setSelectTypes] = useState([]);
    const [enableDelay, setEnableDelay] = useState(false);
    const [enableFriend, setEnableFriend] = useState(false);
    const [enableShadow, setEnableShadow] = useState(false);
    const [enableElite, setEnableElite] = useState(false);
    const [enableMega, setEnableMega] = useState(false);

    const {ELITE_MOVE, POKEMON_SHADOW, WEATHER_BOOSTS} = options;

    const convertName = (text) => {
        return text.toUpperCase()
        .replaceAll("-", "_")
        .replaceAll("NIDORAN_F", "NIDORAN_FEMALE")
        .replaceAll("NIDORAN_M", "NIDORAN_MALE")
        .replaceAll("’", "")
        .replaceAll(".", "")
        .replaceAll(":", "")
        .replaceAll(" ", "_")
        .replaceAll("É", "E")
    }

    const addCPokeData = useCallback((movePoke, value, vf, shadow, felite, celite) => {
        movePoke.forEach(vc => {
            let fmove = combatData.find(item => item.name === vf.replaceAll("_FAST", ""));
            let cmove = combatData.find(item => item.name === vc);
            let stats = calculateStatsByTag(value.baseStats, value.slug);
            const dps = calculateAvgDPS(fmove, cmove,
                calculateStatsBettle(stats.atk, options.IV_ATK, options.POKEMON_LEVEL),
                calculateStatsBettle(stats.def, options.IV_DEF, options.POKEMON_LEVEL),
                calculateStatsBettle(stats.sta, options.IV_HP, options.POKEMON_LEVEL),
                getBarCharge(true, Math.abs(cmove.pve_energy)),
                value.types, options, cmove.name === "RETURN" ? false : shadow);
            const tdo = calculateTDO(calculateStatsBettle(stats.def, options.IV_DEF, options.POKEMON_LEVEL),
            calculateStatsBettle(stats.sta, options.IV_HP, options.POKEMON_LEVEL), dps, cmove.name === "RETURN" ? false : shadow)
            setDpsTable(oldArr => [...oldArr, {
                pokemon: value,
                fmove: fmove,
                cmove: cmove,
                dps: dps,
                tdo: tdo,
                multiDpsTdo: Math.pow(dps,3)*tdo,
                shadow: cmove.name === "RETURN" ? false : shadow,
                elite: {
                    fmove: felite,
                    cmove: celite
                },
                cp : calculateCP(stats.atk+options.IV_ATK, stats.def+options.IV_DEF, stats.sta+options.IV_HP, options.POKEMON_LEVEL)
            }]);
        });
    }, [options]);

    const addFPokeData = useCallback((combat, movePoke, value, felite) => {
        movePoke.forEach(vf => {
            addCPokeData(combat.CINEMATIC_MOVES, value, vf, false, felite, false);
            if (options.POKEMON_SHADOW && !value.slug.includes("mega")) {
                if (combat.SHADOW_MOVES.length > 0) addCPokeData(combat.CINEMATIC_MOVES, value, vf, true, felite, false);
                addCPokeData(combat.SHADOW_MOVES, value, vf, true, felite, false);
            }
            if (options.ELITE_MOVE) {
                if (options.POKEMON_SHADOW && !value.slug.includes("mega") && combat.SHADOW_MOVES.length > 0) addCPokeData(combat.ELITE_CINEMATIC_MOVES, value, vf, true, felite, true);
                else addCPokeData(combat.ELITE_CINEMATIC_MOVES, value, vf, false, felite, true);
            }
        });
    }, [addCPokeData, options.ELITE_MOVE, options.POKEMON_SHADOW]);

    const calculateDPSTable = useCallback(() => {
        let dataList = Object.values(pokemonData);
        dataList.forEach((value, index) => {
            if (value.num > 0) {
                let combatPoke = combatPokemonData.filter(item => item.ID === value.num
                    && item.BASE_SPECIES === (value.baseSpecies ? convertName(value.baseSpecies) : convertName(value.name))
                );
                let result = combatPoke.find(item => item.NAME === convertName(value.name));
                if (result === undefined) combatPoke = combatPoke[0]
                else combatPoke = result;
                if (combatPoke !== undefined) {
                    addFPokeData(combatPoke, combatPoke.QUICK_MOVES, value, false)
                    if (options.ELITE_MOVE) {
                        addFPokeData(combatPoke, combatPoke.ELITE_QUICK_MOVES, value, true)
                    }
                }
            }
            if (index === dataList.length-1) setLoading(false);
        });
    }, [addFPokeData, options.ELITE_MOVE]);

    useEffect(() => {
        if (dpsTable.length === 0) calculateDPSTable();
        else {
            const result = dpsTable.filter(item => {
                const boolFilterType = selectTypes.length === 0 || (selectTypes.includes(capitalize(item.fmove.type.toLowerCase())) && selectTypes.includes(capitalize(item.cmove.type.toLowerCase())));
                const boolFilterPoke =  searchTerm === '' || item.pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pokemon.num.toString().includes(searchTerm);
                const boolOnlyShadow = enableShadow && item.shadow
                const boolOnlyElite = enableElite && (item.elite.fmove || item.elite.cmove)
                const boolOnlyMega = enableMega && item.pokemon.name.toLowerCase().includes("mega")
                if (enableShadow || enableElite || enableMega) return (boolFilterType && boolFilterPoke) && (boolOnlyShadow || boolOnlyElite || boolOnlyMega);
                else return boolFilterType && boolFilterPoke;
            })
            setDataFilter(result);
        }
    }, [calculateDPSTable, dpsTable, selectTypes, searchTerm, enableElite, enableShadow, enableMega]);

    const addTypeArr = (value) => {
        if (selectTypes.includes(value)) {
            return setSelectTypes([...selectTypes].filter(item => item !== value));
        }
        return setSelectTypes(oldArr => [...oldArr, value]);
    }

    const handleCheckbox = (event) => {
        setOptions({
          ...options,
          [event.target.name]: event.target.checked,
        });
    };

    const onCalculateTable = useCallback((e) => {
        e.preventDefault();
        setDpsTable([]);
        setLoading(true);
    }, []);

    return (
        <Fragment>
            <div className='head-filter border-types center w-100'>
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
                    <div className='col-xl border-input' style={{padding: 0}}>
                        <div className="input-group border-input">
                            <span className="input-group-text">Search name or ID</span>
                            <input type="text" className='form-control input-search' placeholder='Enter name or ID'
                            value={searchTerm}
                            onInput={e => setSearchTerm(e.target.value)}></input>
                        </div>
                        <div className="input-group border-input">
                            <span className="input-group-text">Showing</span>
                            <FormControlLabel control={<Checkbox checked={POKEMON_SHADOW} onChange={handleCheckbox} name="POKEMON_SHADOW"/>} label="Shadow Pokemon" />
                            <FormControlLabel control={<Checkbox checked={ELITE_MOVE} onChange={handleCheckbox} name="ELITE_MOVE"/>} label="Elite Move" />
                        </div>
                        <div className="input-group border-input">
                            <span className="input-group-text">Filter only by</span>
                            <FormControlLabel control={<Switch onChange={(event, check) => setEnableShadow(check)}/>} label="Shadow"/>
                            <FormControlLabel control={<Switch onChange={(event, check) => setEnableElite(check)}/>} label="Elite Moves"/>
                            <FormControlLabel control={<Switch onChange={(event, check) => setEnableMega(check)}/>} label="Mega"/>
                        </div>
                    </div>
                    <div className='col-xl border-input' style={{padding: 0}}>
                        <div className='head-types'>Options</div>
                        <form className='w-100' onSubmit={onCalculateTable.bind(this)}>
                            <div className='border-input' style={{padding: 0}}>
                            <div className="input-group">
                            <FormControlLabel sx={{marginLeft: 1}} control={<Switch onChange={(event, check) => {
                                setEnableDelay(check)
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
                            </div>
                            <div className='row border-input' style={{margin: 0}}>
                                <Box className="col-5 input-group" style={{padding: 0}}>
                                    <span className="input-group-text">IV ATK</span>
                                    <input defaultValue={options.IV_ATK} type="number" className="form-control" placeholder="0-15" min={0} max={15} required
                                    onInput={(e) => setOptions({
                                        ...options,
                                        IV_ATK: parseInt(e.target.value),
                                    })} name="IV_ATK" style={{width: 40}}></input>
                                    <span className="input-group-text">IV DEF</span>
                                    <input defaultValue={options.IV_DEF} type="number" className="form-control" placeholder="0-15" min={0} max={15} required
                                    onInput={(e) => setOptions({
                                        ...options,
                                        IV_DEF: parseInt(e.target.value),
                                    })} name="IV_DEF" style={{width: 40}}></input>
                                    <span className="input-group-text">IV HP</span>
                                    <input defaultValue={options.IV_HP} type="number" className="form-control" placeholder="0-15" min={0} max={15} required
                                    onInput={(e) => setOptions({
                                        ...options,
                                        IV_HP: parseInt(e.target.value),
                                    })} name="IV_HP" style={{width: 40}}></input>
                                    <div className="input-group-prepend">
                                        <label className="input-group-text">Levels</label>
                                    </div>
                                    <select className="border-input form-control" defaultValue={options.POKEMON_LEVEL}
                                    onChange={(e) => setOptions({
                                        ...options,
                                        POKEMON_LEVEL: parseInt(e.target.value)})}>
                                        {Array.from({length:(51-1)/0.5+1},(_,i)=>1+(i*0.5)).map((value, index) => (
                                            <option key={index} value={value}>{value}</option>
                                        ))
                                        }
                                    </select>
                                </Box>
                                <Box className="col-7 input-group" style={{padding: 0}}>
                                    <span className="input-group-text">DEF Target</span>
                                    <input defaultValue={options.POKEMON_DEF_OBJ} type="number" className="form-control" placeholder="Defense target" min={1} required
                                    onInput={(e) => setOptions({
                                        ...options,
                                        POKEMON_DEF_OBJ: parseInt(e.target.value),
                                    })} name="POKEMON_DEF_OBJ"></input>
                                    <FormControlLabel control={<Checkbox checked={WEATHER_BOOSTS} onChange={handleCheckbox} name="WEATHER_BOOSTS"/>} label="Weather Boosts" />
                                    <Box sx={{display: 'flex',alignItems: 'center',justifyContent: 'center',paddingLeft: 1,paddingRight: 1}}>
                                        <FormControlLabel control={<Switch onChange={(event, check) => {
                                                setEnableFriend(check)
                                                setOptions({
                                                    ...options,
                                                    POKEMON_FRIEND_LEVEL: 0,
                                                });
                                            }}/>} label="Friendship Level:" />
                                            <LevelRating
                                            disabled={!enableFriend}
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
                                            value={options.POKEMON_FRIEND_LEVEL}
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
            <DataTable
                columns={columns}
                data={dataFilter}
                pagination
                defaultSortFieldId={7}
                defaultSortAsc={false}
                highlightOnHover
                striped
                progressPending={loading}
                progressComponent={
                <div className='loading-group'>
                    <img className="loading" width={40} height={40} alt='img-pokemon' src={loadingImg}></img>
                    <span className='caption text-black' style={{fontSize: 18}}><b>Loading...</b></span>
                </div>
                }
            />
        </Fragment>
    )
}

export default DpsTable;