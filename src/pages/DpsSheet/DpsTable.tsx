import React, { Fragment, useCallback, useEffect, useState } from 'react';

import pokemonData from '../../data/pokemon.json';
import { LevelRating, convertName, splitAndCapitalize, capitalize } from '../../util/Utils';
import { DEFAULT_POKEMON_DEF_OBJ, MAX_LEVEL, MIN_LEVEL } from '../../util/Constants';
import {
  calculateAvgDPS,
  calculateCP,
  calculateStatsByTag,
  calculateTDO,
  calculateBattleDPS,
  TimeToKill,
  calculateBattleDPSDefender,
  calculateStatsBattle,
} from '../../util/Calculate';

import DataTable from 'react-data-table-component';
import APIService from '../../services/API.service';

import loadingImg from '../../assets/loading.png';
import Type from '../../components/Sprites/Type/Type';
import { Checkbox, FormControlLabel, Switch } from '@mui/material';
import { Box } from '@mui/system';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

import './DpsTable.css';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import SelectPokemon from '../../components/Input/SelectPokemon';
import SelectMove from '../../components/Input/SelectMove';
import { RootStateOrAny, useSelector } from 'react-redux';

const nameSort = (rowA: { pokemon: { name: string } }, rowB: { pokemon: { name: string } }) => {
  const a = rowA.pokemon.name.toLowerCase();
  const b = rowB.pokemon.name.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const fmoveSort = (rowA: { fmove: { name: string } }, rowB: { fmove: { name: string } }) => {
  const a = rowA.fmove.name.toLowerCase();
  const b = rowB.fmove.name.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const cmoveSort = (rowA: { cmove: { name: string } }, rowB: { cmove: { name: string } }) => {
  const a = rowA.cmove.name.toLowerCase().replaceAll(' plus', '+');
  const b = rowB.cmove.name.toLowerCase().replaceAll(' plus', '+');
  return a === b ? 0 : a > b ? 1 : -1;
};

const columns: any = [
  {
    name: 'ID',
    selector: (row: { pokemon: { num: any } }) => row.pokemon?.num,
    sortable: true,
    minWidth: '60px',
    maxWidth: '120px',
  },
  {
    name: 'Pokémon Name',
    selector: (row: {
      pokemon: { num: any; forme: string; name: string; sprite: string; baseSpecies: string };
      shadow: any;
      purified: any;
    }) => (
      <Link
        to={`/pokemon/${row.pokemon?.num}${row.pokemon?.forme ? `?form=${row.pokemon?.forme.toLowerCase()}` : ''}`}
        target="_blank"
        title={`#${row.pokemon?.num} ${splitAndCapitalize(row.pokemon?.name, '-', ' ')}`}
      >
        {row.shadow && <img height={25} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
        {row.purified && <img height={25} alt="img-shadow" className="purified-icon" src={APIService.getPokePurified()} />}
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.pokemon?.sprite, true)}
          onError={(e: any) => {
            e.onerror = null;
            e.target.src = APIService.getPokeIconSprite(row.pokemon?.baseSpecies);
          }}
        />
        {splitAndCapitalize(row.pokemon?.name, '-', ' ')}
      </Link>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    name: 'Fast Move',
    selector: (row: { fmove: { id: string; name: string; type: string }; elite: { fmove: any } }) => (
      <Link
        className="d-flex align-items-center"
        to={'/moves/' + row.fmove?.id}
        target="_blank"
        title={`${splitAndCapitalize(row.fmove?.name, '_', ' ')}`}
      >
        <img
          style={{ marginRight: 10 }}
          width={25}
          height={25}
          alt="img-pokemon"
          src={APIService.getTypeSprite(capitalize(row.fmove?.type))}
        />{' '}
        <div>
          <span className="text-b-ic">{splitAndCapitalize(row.fmove?.name, '_', ' ')}</span>
          {row.elite?.fmove && (
            <span className="type-icon-small ic elite-ic">
              <span>Elite</span>
            </span>
          )}
        </div>
      </Link>
    ),
    sortable: true,
    minWidth: '200px',
    sortFunction: fmoveSort,
  },
  {
    name: 'Charged Move',
    selector: (row: { cmove: { id: string; name: string; type: string }; elite: { cmove: any }; mShadow: any; purified: any }) => (
      <Link
        className="d-flex align-items-center"
        to={'/moves/' + row.cmove?.id}
        target="_blank"
        title={`${splitAndCapitalize(row.cmove?.name, '_', ' ')}`}
      >
        <img
          style={{ marginRight: 10 }}
          width={25}
          height={25}
          alt="img-pokemon"
          src={APIService.getTypeSprite(capitalize(row.cmove?.type))}
        />{' '}
        <div>
          <span className="text-b-ic">{splitAndCapitalize(row.cmove?.name, '_', ' ').replaceAll(' Plus', '+')}</span>
          {row.elite?.cmove && (
            <span className="type-icon-small ic elite-ic">
              <span>Elite</span>
            </span>
          )}
          {row.mShadow && (
            <span className="type-icon-small ic shadow-ic">
              <span>Shadow</span>
            </span>
          )}
          {row.purified && (
            <span className="type-icon-small ic purified-ic">
              <span>Purified</span>
            </span>
          )}
        </div>
      </Link>
    ),
    sortable: true,
    minWidth: '220px',
    sortFunction: cmoveSort,
  },
  {
    name: 'DPS',
    selector: (row: { dps: number }) => (row.dps ? parseFloat(row.dps?.toFixed(3)) : ''),
    sortable: true,
    minWidth: '80px',
  },
  {
    name: 'TDO',
    selector: (row: { tdo: number }) => (row.tdo ? parseFloat(row.tdo?.toFixed(3)) : ''),
    sortable: true,
    minWidth: '100px',
  },
  {
    name: 'DPS^3*TDO',
    selector: (row: { multiDpsTdo: number }) => (row.multiDpsTdo ? parseFloat(row.multiDpsTdo?.toFixed(3)) : ''),
    sortable: true,
    minWidth: '140px',
  },
  {
    name: 'CP',
    selector: (row: { cp: any }) => row.cp ?? '',
    sortable: true,
    minWidth: '100px',
  },
];

const DpsTable = () => {
  const data = useSelector((state: RootStateOrAny) => state.store.data);
  const types = Object.keys(data.typeEff);

  const initData = (count: number) => {
    const data: any = [];
    const initObj = {
      pokemon: null,
      fmove: null,
      cmove: null,
      elite: null,
      dps: null,
      tdo: null,
      multiDpsTdo: null,
      cp: null,
    };

    for (let i = 0; i < count; i++) {
      data.push(initObj);
    }
    return data;
  };

  const [dpsTable, setDpsTable]: any = useState([]);
  const [dataFilter, setDataFilter]: any = useState(initData(10));
  const [searchTerm, setSearchTerm]: any = useState('');

  const [dataTargetPokemon, setDataTargetPokemon]: any = useState(null);
  const [fmoveTargetPokemon, setFmoveTargetPokemon]: any = useState(null);
  const [cmoveTargetPokemon, setCmoveTargetPokemon]: any = useState(null);

  const [filters, setFilters] = useState({
    showEliteMove: true,
    showShadow: true,
    showMega: true,
    enableShadow: false,
    enableElite: false,
    enableMega: false,
    enableBest: false,
    enableDelay: false,
    releasedGO: true,
    bestOf: 3,
    IV_ATK: 15,
    IV_DEF: 15,
    IV_HP: 15,
    POKEMON_LEVEL: 40,
  });

  const {
    showEliteMove,
    showShadow,
    enableShadow,
    showMega,
    enableElite,
    enableMega,
    enableBest,
    enableDelay,
    releasedGO,
    bestOf,
    IV_ATK,
    IV_DEF,
    IV_HP,
    POKEMON_LEVEL,
  } = filters;

  const [options, setOptions]: any = useState({
    delay: null,
    specific: null,
    WEATHER_BOOSTS: false,
    TRAINER_FRIEND: false,
    TRAINER_FRIEND_LEVEL: 0,
    POKEMON_DEF_OBJ: DEFAULT_POKEMON_DEF_OBJ,
  });
  const { WEATHER_BOOSTS, TRAINER_FRIEND, TRAINER_FRIEND_LEVEL, POKEMON_DEF_OBJ } = options;

  const [finished, setFinished]: any = useState(false);
  const [showSpinner, setShowSpinner]: any = useState(true);
  const [selectTypes, setSelectTypes]: any = useState([]);

  const addCPokeData = (
    dataList: {
      pokemon: any;
      fmove: any;
      cmove: any;
      dps: number;
      tdo: number;
      multiDpsTdo: number;
      shadow: any;
      purified: any;
      mShadow: any;
      elite: { fmove: any; cmove: any };
      cp: number;
    }[],
    movePoke: any,
    pokemon: any,
    vf: string,
    shadow: any,
    purified: any,
    felite: any,
    celite: any,
    specialMove: any = null
  ) => {
    movePoke.forEach((vc: any) => {
      const fmove = data.combat.find((item: { name: any }) => item.name === vf);
      const cmove = data.combat.find((item: { name: any }) => item.name === vc);

      if (fmove && cmove) {
        const stats = calculateStatsByTag(pokemon.baseStats, pokemon.slug);
        const statsAttacker = {
          atk: calculateStatsBattle(stats.atk, IV_ATK, POKEMON_LEVEL),
          def: calculateStatsBattle(stats.def, IV_DEF, POKEMON_LEVEL),
          hp: calculateStatsBattle(stats.sta, IV_HP, POKEMON_LEVEL),
          fmove,
          cmove,
          types: pokemon.types,
          shadow,
          WEATHER_BOOSTS: options.WEATHER_BOOSTS,
          POKEMON_FRIEND: options.TRAINER_FRIEND,
          POKEMON_FRIEND_LEVEL: options.TRAINER_FRIEND_LEVEL,
        };

        let dps, tdo;
        if (dataTargetPokemon && fmoveTargetPokemon && cmoveTargetPokemon) {
          const statsDef = calculateStatsByTag(dataTargetPokemon.baseStats, dataTargetPokemon.slug);
          const statsDefender = {
            atk: calculateStatsBattle(statsDef.atk, IV_ATK, POKEMON_LEVEL),
            def: calculateStatsBattle(statsDef.def, IV_DEF, POKEMON_LEVEL),
            hp: calculateStatsBattle(statsDef.sta, IV_HP, POKEMON_LEVEL),
            fmove: data.combat.find((item: { name: any }) => item.name === fmoveTargetPokemon.name),
            cmove: data.combat.find((item: { name: any }) => item.name === cmoveTargetPokemon.name),
            types: dataTargetPokemon.types,
            WEATHER_BOOSTS: options.WEATHER_BOOSTS,
          };
          const dpsDef = calculateBattleDPSDefender(data.options, data.typeEff, data.weatherBoost, statsAttacker, statsDefender);
          dps = calculateBattleDPS(data.options, data.typeEff, data.weatherBoost, statsAttacker, statsDefender, dpsDef);
          tdo = dps * TimeToKill(Math.floor(statsAttacker.hp), dpsDef);
        } else {
          dps = calculateAvgDPS(
            data.options,
            data.typeEff,
            data.weatherBoost,
            statsAttacker.fmove,
            statsAttacker.cmove,
            statsAttacker.atk,
            statsAttacker.def,
            statsAttacker.hp,
            statsAttacker.types,
            options,
            statsAttacker.shadow
          );
          tdo = calculateTDO(data.options, statsAttacker.def, statsAttacker.hp, dps, statsAttacker.shadow);
        }
        dataList.push({
          pokemon,
          fmove: statsAttacker.fmove,
          cmove: statsAttacker.cmove,
          dps,
          tdo,
          multiDpsTdo: Math.pow(dps, 3) * tdo,
          shadow,
          purified: purified && specialMove && specialMove.includes(statsAttacker.cmove.name),
          mShadow: shadow && specialMove && specialMove.includes(statsAttacker.cmove.name),
          elite: {
            fmove: felite,
            cmove: celite,
          },
          cp: calculateCP(stats.atk + IV_ATK, stats.def + IV_DEF, stats.sta + IV_HP, POKEMON_LEVEL),
        });
      }
    });
  };

  const addFPokeData = (
    dataList: any,
    combat: {
      cinematicMoves: any;
      shadowMoves: string | any[];
      eliteCinematicMoves: any;
      purifiedMoves: any;
    },
    movePoke: any[],
    pokemon: any,
    felite: any
  ) => {
    movePoke.forEach((vf: any) => {
      addCPokeData(dataList, combat.cinematicMoves, pokemon, vf, false, false, felite, false);
      if (!pokemon.forme || !pokemon.forme.toLowerCase().includes('mega')) {
        if (combat.shadowMoves.length > 0) {
          addCPokeData(dataList, combat.cinematicMoves, pokemon, vf, true, false, felite, false, combat.shadowMoves);
          addCPokeData(dataList, combat.eliteCinematicMoves, pokemon, vf, true, false, felite, true, combat.shadowMoves);
        }
        addCPokeData(dataList, combat.shadowMoves, pokemon, vf, true, false, felite, false, combat.shadowMoves);
        addCPokeData(dataList, combat.purifiedMoves, pokemon, vf, false, true, felite, false, combat.purifiedMoves);
      }
      addCPokeData(dataList, combat.eliteCinematicMoves, pokemon, vf, false, false, felite, true);
    });
  };

  const calculateDPSTable = () => {
    const dataList: any[] = [];
    Object.values(pokemonData).forEach((pokemon) => {
      let combatPoke = data.pokemonCombat.filter(
        (item: { id: number; baseSpecies: string }) =>
          item.id === pokemon.num &&
          item.baseSpecies === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
      );

      const result = combatPoke.find((item: { name: string }) => item.name === convertName(pokemon.name));
      if (!result) {
        combatPoke = combatPoke[0];
      } else {
        combatPoke = result;
      }
      if (combatPoke) {
        addFPokeData(dataList, combatPoke, combatPoke.quickMoves, pokemon, false);
        addFPokeData(dataList, combatPoke, combatPoke.eliteQuickMoves, pokemon, true);
      }
    });
    setFinished(true);
    setTimeout(() => {
      setShowSpinner(false);
    }, 700);
    return dataList;
  };

  const filterBestOptions = (result: any[], best: string | number) => {
    best = best === 1 ? 'dps' : best === 2 ? 'tdo' : 'multiDpsTdo';
    const group = result.reduce((result: { [x: string]: any[] }, obj: { pokemon: { name: string | number } }) => {
      (result[obj.pokemon.name] = result[obj.pokemon.name] || []).push(obj);
      return result;
    }, {});
    return Object.values(group).map((pokemon: any) =>
      pokemon.reduce((p: { [x: string]: number }, c: { [x: string]: number }) => (p[best] > c[best] ? p : c))
    );
  };

  useEffect(() => {
    document.title = 'DPS&TDO Table';
    setTimeout(() => {
      setDpsTable(calculateDPSTable());
    }, 300);
  }, []);

  useEffect(() => {
    setShowSpinner(true);
    setTimeout(() => {
      setDpsTable(calculateDPSTable());
    }, 300);
  }, [dataTargetPokemon, fmoveTargetPokemon, cmoveTargetPokemon]);

  useEffect(() => {
    let result = dpsTable.filter(
      (item: {
        fmove?: { type: string };
        cmove?: { type: string };
        pokemon?: {
          name: string;
          num: { toString: () => string | any[] };
          forme: string;
          releasedGO: any;
        };
        shadow?: any;
        elite?: { fmove: any; cmove: any };
      }) => {
        const boolFilterType =
          selectTypes.length === 0 ||
          (selectTypes.includes(item.fmove?.type.toUpperCase()) && selectTypes.includes(item.cmove?.type.toUpperCase()));
        const boolFilterPoke =
          searchTerm === '' ||
          splitAndCapitalize(item.pokemon?.name, '-', ' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.pokemon?.num.toString().includes(searchTerm);

        const boolShowShadow = !showShadow && item.shadow;
        const boolShowElite = !showEliteMove && (item.elite?.fmove || item.elite?.cmove);
        const boolShowMega = !showMega && item.pokemon?.forme && item.pokemon?.forme.toLowerCase().includes('mega');

        const boolOnlyShadow = enableShadow && item.shadow;
        const boolOnlyElite = enableElite && (item.elite?.fmove || item.elite?.cmove);
        const boolOnlyMega = enableMega && item.pokemon?.forme && item.pokemon?.forme.toLowerCase().includes('mega');

        let boolReleaseGO = true;
        if (releasedGO) {
          const result = data.details.find((pokemon: { name: string; id: any }) => {
            if (item.pokemon?.name.toLowerCase().includes('_mega')) {
              return pokemon.id === item.pokemon?.num && pokemon.name === item.pokemon?.name.toUpperCase().replaceAll('-', '_');
            } else {
              return (
                pokemon.id === item.pokemon?.num &&
                pokemon.name ===
                  (pokemon.id === 555 && !item.pokemon?.name.toLowerCase().includes('zen')
                    ? item.pokemon?.name.toUpperCase().replaceAll('-', '_').replace('_GALAR', '_GALARIAN') + '_STANDARD'
                    : convertName(item.pokemon?.name).replace('NIDORAN_F', 'NIDORAN_FEMALE').replace('NIDORAN_M', 'NIDORAN_MALE'))
              );
            }
          });
          boolReleaseGO = result ? result.releasedGO : false;
        }
        if (enableShadow || enableElite || enableMega) {
          return (
            boolFilterType &&
            boolFilterPoke &&
            boolReleaseGO &&
            !(boolShowShadow || boolShowElite || boolShowMega) &&
            boolReleaseGO &&
            (boolOnlyShadow || boolOnlyElite || boolOnlyMega)
          );
        } else {
          return boolFilterType && boolFilterPoke && boolReleaseGO && !(boolShowShadow || boolShowElite || boolShowMega);
        }
      }
    );
    if (enableBest) {
      result = filterBestOptions(result, bestOf);
    }
    setDataFilter(result);
  }, [
    dpsTable,
    selectTypes,
    searchTerm,
    showShadow,
    showEliteMove,
    showMega,
    enableElite,
    enableShadow,
    enableMega,
    enableBest,
    bestOf,
    releasedGO,
  ]);

  const addTypeArr = (value: string) => {
    if (selectTypes.includes(value)) {
      return setSelectTypes([...selectTypes].filter((item) => item !== value));
    }
    return setSelectTypes((oldArr: any[]) => [...oldArr, value]);
  };

  const clearData = () => {
    setFinished(false);
  };

  const onCalculateTable = useCallback((e: { preventDefault: () => void }) => {
    e.preventDefault();
    setShowSpinner(true);
    setTimeout(() => {
      setDpsTable(calculateDPSTable());
    }, 300);
  }, []);

  return (
    <Fragment>
      <div className="head-filter border-types text-center w-100">
        <div className="head-types">Filter Moves By Types</div>
        <div className="row w-100" style={{ margin: 0 }}>
          {types.map((item, index) => (
            <div key={index} className="col img-group" style={{ margin: 0, padding: 0 }}>
              <button
                value={item}
                onClick={() => addTypeArr(item)}
                className={'btn-select-type w-100 border-types' + (selectTypes.includes(item) ? ' select-type' : '')}
                style={{ padding: 10 }}
              >
                <Type block={true} arr={[item]} />
              </button>
            </div>
          ))}
        </div>
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xxl" style={{ padding: 0 }}>
            <div className="input-group border-input">
              <span className="input-group-text">Search name or ID</span>
              <input
                type="text"
                className="form-control input-search"
                placeholder="Enter Name or ID"
                value={searchTerm}
                onInput={(e: any) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="input-group">
              <span className="input-group-text">Filter show</span>
              <FormControlLabel
                control={<Checkbox checked={showShadow} onChange={(event, check) => setFilters({ ...filters, showShadow: check })} />}
                label="Shadow Pokémon"
              />
              <FormControlLabel
                control={<Checkbox checked={showEliteMove} onChange={(event, check) => setFilters({ ...filters, showEliteMove: check })} />}
                label="Elite Move"
              />
              <FormControlLabel
                control={<Checkbox checked={showMega} onChange={(event, check) => setFilters({ ...filters, showMega: check })} />}
                label="Mega"
              />
            </div>
            <div className="input-group border-input">
              <span className="input-group-text">Filter only by</span>
              <FormControlLabel
                control={<Checkbox checked={enableShadow} onChange={(event, check) => setFilters({ ...filters, enableShadow: check })} />}
                label="Shadow"
              />
              <FormControlLabel
                control={<Checkbox checked={enableElite} onChange={(event, check) => setFilters({ ...filters, enableElite: check })} />}
                label="Elite Moves"
              />
              <FormControlLabel
                control={<Checkbox checked={enableMega} onChange={(event, check) => setFilters({ ...filters, enableMega: check })} />}
                label="Mega"
              />
            </div>
            <div className="input-group">
              <div className="row w-100" style={{ margin: 0 }}>
                <Box className="col-xxl-8" style={{ padding: 0 }}>
                  <div className="input-group">
                    <span className="input-group-text">Filter best movesets</span>
                    <FormControlLabel
                      control={<Switch checked={enableBest} onChange={(event, check) => setFilters({ ...filters, enableBest: check })} />}
                      label="Best moveset of"
                    />
                    <Form.Select
                      style={{ borderRadius: 0 }}
                      className="form-control"
                      value={bestOf}
                      disabled={!enableBest}
                      onChange={(e) => setFilters({ ...filters, bestOf: parseInt(e.target.value) })}
                    >
                      <option value={1}>DPS</option>
                      <option value={2}>TDO</option>
                      <option value={3}>DPS^3*TDO</option>
                    </Form.Select>
                  </div>
                </Box>
                <Box className="col-xxl-4">
                  <div className="input-group">
                    <FormControlLabel
                      control={<Switch checked={releasedGO} onChange={(event, check) => setFilters({ ...filters, releasedGO: check })} />}
                      label="Released in GO"
                    />
                  </div>
                </Box>
              </div>
            </div>
            <div className="input-group">
              <div className="row w-100" style={{ margin: 0 }}>
                <Box className="col-xl-4" style={{ padding: 0 }}>
                  <div className="input-group">
                    <span className="input-group-text">Target Pokémon</span>
                    <SelectPokemon
                      clearData={clearData}
                      selected={true}
                      setCurrentPokemon={setDataTargetPokemon}
                      setFMovePokemon={setFmoveTargetPokemon}
                      setCMovePokemon={setCmoveTargetPokemon}
                    />
                  </div>
                </Box>
                <Box className="col-xl-4" style={{ padding: 0 }}>
                  <div className="input-group">
                    <span className="input-group-text">Fast Move</span>
                    <SelectMove
                      inputType={'small'}
                      clearData={clearData}
                      pokemon={dataTargetPokemon}
                      move={fmoveTargetPokemon}
                      setMovePokemon={setFmoveTargetPokemon}
                      moveType="FAST"
                    />
                  </div>
                </Box>
                <Box className="col-xl-4" style={{ padding: 0 }}>
                  <div className="input-group">
                    <span className="input-group-text">Charged Move</span>
                    <SelectMove
                      inputType={'small'}
                      clearData={clearData}
                      pokemon={dataTargetPokemon}
                      move={cmoveTargetPokemon}
                      setMovePokemon={setCmoveTargetPokemon}
                      moveType="CHARGE"
                    />
                  </div>
                </Box>
              </div>
            </div>
          </div>
          <div className="col-xxl border-input" style={{ padding: 0 }}>
            <div className="head-types">Options</div>
            <form className="w-100" onSubmit={onCalculateTable.bind(this)}>
              <div className="input-group">
                <FormControlLabel
                  sx={{ marginLeft: 1 }}
                  control={
                    <Switch
                      onChange={(event, check) => {
                        setFilters({ ...filters, enableDelay: check });
                        if (check) {
                          setOptions({
                            ...options,
                            delay: {
                              ftime: 0,
                              ctime: 0,
                            },
                          });
                        } else {
                          setOptions({
                            ...options,
                            delay: null,
                          });
                        }
                      }}
                    />
                  }
                  label="Delay"
                />
                <span className="input-group-text">Fast Move Time</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ height: 42 }}
                  placeholder="Delay time (sec)"
                  aria-label="Fast Move Time"
                  min={0}
                  disabled={!enableDelay}
                  required={enableDelay}
                  onInput={(e: any) =>
                    setOptions({
                      ...options,
                      delay: {
                        ftime: parseInt(e.target.value),
                        ctime: options.delay.ctime,
                      },
                    })
                  }
                />
                <span className="input-group-text">Charged Move Time</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ height: 42 }}
                  placeholder="Delay time (sec)"
                  aria-label="Charged Move Time"
                  min={0}
                  disabled={!enableDelay}
                  required={enableDelay}
                  onInput={(e: any) =>
                    setOptions({
                      ...options,
                      delay: {
                        ftime: options.delay.ftime,
                        ctime: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="row" style={{ margin: 0 }}>
                <Box className="col-5 input-group" style={{ padding: 0 }}>
                  <span className="input-group-text">IV ATK</span>
                  <input
                    defaultValue={IV_ATK}
                    type="number"
                    className="form-control"
                    placeholder="0-15"
                    min={0}
                    max={15}
                    required={true}
                    onInput={(e: any) =>
                      setFilters({
                        ...filters,
                        IV_ATK: parseInt(e.target.value),
                      })
                    }
                    name="IV_ATK"
                    style={{ width: 40 }}
                  />
                  <span className="input-group-text">IV DEF</span>
                  <input
                    defaultValue={IV_DEF}
                    type="number"
                    className="form-control"
                    placeholder="0-15"
                    min={0}
                    max={15}
                    required={true}
                    onInput={(e: any) =>
                      setFilters({
                        ...filters,
                        IV_DEF: parseInt(e.target.value),
                      })
                    }
                    name="IV_DEF"
                    style={{ width: 40 }}
                  />
                  <span className="input-group-text">IV HP</span>
                  <input
                    defaultValue={IV_HP}
                    type="number"
                    className="form-control"
                    placeholder="0-15"
                    min={0}
                    max={15}
                    required={true}
                    onInput={(e: any) =>
                      setFilters({
                        ...filters,
                        IV_HP: parseInt(e.target.value),
                      })
                    }
                    name="IV_HP"
                    style={{ width: 40 }}
                  />
                  <div className="input-group-prepend">
                    <label className="input-group-text">Levels</label>
                  </div>
                  <Form.Select
                    style={{ borderRadius: 0 }}
                    className="form-control"
                    defaultValue={POKEMON_LEVEL}
                    onChange={(e: any) =>
                      setFilters({
                        ...filters,
                        POKEMON_LEVEL: parseInt(e.target.value),
                      })
                    }
                  >
                    {Array.from({ length: (MAX_LEVEL - MIN_LEVEL) / 0.5 + 1 }, (_, i) => 1 + i * 0.5).map((value, index) => (
                      <option key={index} value={value}>
                        {value}
                      </option>
                    ))}
                  </Form.Select>
                </Box>
                <Box className="col-7 input-group" style={{ padding: 0 }}>
                  <span className="input-group-text">DEF Target</span>
                  <input
                    value={POKEMON_DEF_OBJ}
                    type="number"
                    className="form-control"
                    placeholder="Defense target"
                    min={1}
                    disabled={dataTargetPokemon ? true : false}
                    required={true}
                    onInput={(e: any) =>
                      setOptions({
                        ...options,
                        POKEMON_DEF_OBJ: parseInt(e.target.value),
                      })
                    }
                    name="POKEMON_DEF_OBJ"
                  />
                  <div className="input-group-prepend">
                    <label className="input-group-text">Weather Boosts</label>
                  </div>
                  <Form.Select
                    style={{ borderRadius: 0 }}
                    className="form-control"
                    defaultValue={WEATHER_BOOSTS}
                    onChange={(e: any) =>
                      setOptions({
                        ...options,
                        WEATHER_BOOSTS: e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value,
                      })
                    }
                  >
                    <option value="false">Extream</option>
                    {Object.keys(data.weatherBoost).map((value, index) => (
                      <option key={index} value={value}>
                        {splitAndCapitalize(value, '_', ' ')}
                      </option>
                    ))}
                  </Form.Select>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingLeft: 1,
                      paddingRight: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          onChange={(event, check) => {
                            setOptions({
                              ...options,
                              TRAINER_FRIEND: check,
                              POKEMON_FRIEND_LEVEL: 0,
                            });
                          }}
                        />
                      }
                      label="Friendship Level:"
                    />
                    <LevelRating
                      disabled={!TRAINER_FRIEND}
                      onChange={(event: any, value) => {
                        setOptions({
                          ...options,
                          [event.target.name]: value,
                        });
                      }}
                      name="POKEMON_FRIEND_LEVEL"
                      defaultValue={0}
                      max={4}
                      size="large"
                      value={TRAINER_FRIEND_LEVEL}
                      emptyIcon={<FavoriteBorder fontSize="inherit" />}
                      icon={<Favorite fontSize="inherit" />}
                    />
                  </Box>
                </Box>
                <button type="submit" className="btn btn-primary w-100" style={{ borderRadius: 0 }}>
                  Calculate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="position-relative">
        <div className="loading-group-spin-table" style={{ display: !showSpinner ? 'none' : 'block' }} />
        <div className="loading-spin-table text-center" style={{ display: !showSpinner ? 'none' : 'block' }}>
          <img className="loading" width={64} height={64} alt="img-pokemon" src={loadingImg} />
          <span className="caption text-black" style={{ fontSize: 18 }}>
            <b>
              Loading<span id="p1">.</span>
              <span id="p2">.</span>
              <span id="p3">.</span>
            </b>
          </span>
        </div>
        <DataTable
          columns={columns}
          data={dataFilter}
          noDataComponent={null}
          pagination={true}
          defaultSortFieldId={7}
          defaultSortAsc={false}
          highlightOnHover={true}
          striped={true}
        />
      </div>
    </Fragment>
  );
};

export default DpsTable;
