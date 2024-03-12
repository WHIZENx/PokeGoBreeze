import React, { Fragment, useEffect, useState } from 'react';

import { LevelRating, splitAndCapitalize, capitalize, convertFormName, checkPokemonGO } from '../../../util/Utils';
import {
  DEFAULT_POKEMON_DEF_OBJ,
  DEFAULT_TYPES,
  FORM_GMAX,
  FORM_MEGA,
  FORM_PRIMAL,
  MAX_IV,
  MAX_LEVEL,
  MIN_IV,
  MIN_LEVEL,
  TYPE_LEGENDARY,
  TYPE_MYTHIC,
  TYPE_ULTRA_BEAST,
} from '../../../util/Constants';
import {
  calculateAvgDPS,
  calculateCP,
  calculateStatsByTag,
  calculateTDO,
  calculateBattleDPS,
  TimeToKill,
  calculateBattleDPSDefender,
  calculateStatsBattle,
} from '../../../util/Calculate';

import DataTable from 'react-data-table-component';
import APIService from '../../../services/API.service';

import loadingImg from '../../../assets/loading.png';
import TypeInfo from '../../../components/Sprites/Type/Type';
import { Checkbox, FormControlLabel, Switch } from '@mui/material';
import { Box } from '@mui/system';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

import './DpsTdo.scss';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import SelectPokemon from '../../../components/Input/SelectPokemon';
import SelectMove from '../../../components/Input/SelectMove';
import { useDispatch, useSelector } from 'react-redux';
import { setDPSSheetPage } from '../../../store/actions/options.action';
import { Action } from 'history';
import { TypeMove } from '../../../enums/move.enum';
import { OptionsSheetState, RouterState, StoreState } from '../../../store/models/state.model';
import { Combat } from '../../../core/models/combat.model';
import { PokemonDataModel } from '../../../core/models/pokemon.model';
import { SelectMoveModel } from '../../../components/Input/models/select-move.model';
import { OptionOtherDPS } from '../../../store/models/options.model';
import { BattleCalculate } from '../../../util/models/calculate.model';

interface PokemonSheetData {
  pokemon: PokemonDataModel;
  fmove: Combat | undefined;
  cmove: Combat | undefined;
  dps: number;
  tdo: number;
  multiDpsTdo: number;
  shadow: boolean;
  purified: boolean;
  special: boolean;
  mShadow: boolean;
  elite: { fmove: boolean; cmove: boolean };
  cp: number;
}

const nameSort = (rowA: PokemonSheetData, rowB: PokemonSheetData) => {
  const a = rowA.pokemon.name.toLowerCase();
  const b = rowB.pokemon.name.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const fMoveSort = (rowA: PokemonSheetData, rowB: PokemonSheetData) => {
  const a = rowA.fmove?.name.toLowerCase();
  const b = rowB.fmove?.name.toLowerCase();
  return a === b ? 0 : (a ?? 0) > (b ?? 0) ? 1 : -1;
};

const cMoveSort = (rowA: PokemonSheetData, rowB: PokemonSheetData) => {
  const a = rowA.cmove?.name.toLowerCase().replaceAll(' plus', '+');
  const b = rowB.cmove?.name.toLowerCase().replaceAll(' plus', '+');
  return a === b ? 0 : (a ?? 0) > (b ?? 0) ? 1 : -1;
};

const columns: any = [
  {
    name: 'ID',
    selector: (row: PokemonSheetData) => row.pokemon?.num,
    sortable: true,
    minWidth: '60px',
    maxWidth: '120px',
  },
  {
    name: 'Pokémon Name',
    selector: (row: PokemonSheetData) => (
      <Link
        to={`/pokemon/${row.pokemon?.num}${
          row.pokemon?.forme ? `?form=${convertFormName(row.pokemon?.num, row.pokemon?.forme.toLowerCase())}` : ''
        }`}
        title={`#${row.pokemon?.num} ${splitAndCapitalize(row.pokemon?.name, '-', ' ')}`}
      >
        {row.shadow && <img height={25} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
        {row.purified && <img height={25} alt="img-purified" className="purified-icon" src={APIService.getPokePurified()} />}
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.pokemon?.sprite, true)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row.pokemon?.baseSpecies ?? '');
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
    name: 'Type(s)',
    selector: (row: PokemonSheetData) =>
      row.pokemon?.types.map((value, index) => (
        <img
          key={index}
          style={{ marginRight: 10 }}
          width={25}
          height={25}
          alt="img-pokemon"
          title={capitalize(value)}
          src={APIService.getTypeSprite(capitalize(value))}
        />
      )),
    width: '150px',
  },
  {
    name: 'Fast Move',
    selector: (row: PokemonSheetData) => (
      <Link className="d-flex align-items-center" to={'/move/' + row.fmove?.id} title={`${splitAndCapitalize(row.fmove?.name, '_', ' ')}`}>
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
    sortFunction: fMoveSort,
  },
  {
    name: 'Charged Move',
    selector: (row: PokemonSheetData) => (
      <Link
        className="d-flex align-items-center"
        to={'/move/' + row.cmove?.id}
        title={`${splitAndCapitalize(row.cmove?.name, '_', ' ').replaceAll(' Plus', '+')}`}
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
          {row.special && (
            <span className="type-icon-small ic special-ic">
              <span>Special</span>
            </span>
          )}
        </div>
      </Link>
    ),
    sortable: true,
    minWidth: '220px',
    sortFunction: cMoveSort,
  },
  {
    name: 'DPS',
    selector: (row: PokemonSheetData) => (row.dps ? parseFloat(row.dps?.toFixed(3)) : ''),
    sortable: true,
    minWidth: '80px',
  },
  {
    name: 'TDO',
    selector: (row: PokemonSheetData) => (row.tdo ? parseFloat(row.tdo?.toFixed(3)) : ''),
    sortable: true,
    minWidth: '100px',
  },
  {
    name: 'DPS^3*TDO',
    selector: (row: PokemonSheetData) => (row.multiDpsTdo ? parseFloat(row.multiDpsTdo?.toFixed(3)) : ''),
    sortable: true,
    minWidth: '140px',
  },
  {
    name: 'CP',
    selector: (row: PokemonSheetData) => row.cp ?? '',
    sortable: true,
    minWidth: '100px',
  },
];

const DpsTdo = () => {
  const dispatch = useDispatch();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const optionStore = useSelector((state: OptionsSheetState) => state.options);
  const router = useSelector((state: RouterState) => state.router);

  const [types, setTypes] = useState(DEFAULT_TYPES);

  const [dpsTable, setDpsTable]: [PokemonSheetData[], React.Dispatch<React.SetStateAction<PokemonSheetData[]>>] = useState(
    [] as PokemonSheetData[]
  );
  const [dataFilter, setDataFilter]: [PokemonSheetData[], React.Dispatch<React.SetStateAction<PokemonSheetData[]>>] = useState(
    [] as PokemonSheetData[]
  );
  const [searchTerm, setSearchTerm] = useState(optionStore?.dpsSheet?.searchTerm ?? '');

  const [dataTargetPokemon, setDataTargetPokemon]: [
    PokemonDataModel | undefined,
    React.Dispatch<React.SetStateAction<PokemonDataModel | undefined>>
  ] = useState(optionStore?.dpsSheet?.dataTargetPokemon);
  const [fmoveTargetPokemon, setFmoveTargetPokemon]: [
    SelectMoveModel | undefined,
    React.Dispatch<React.SetStateAction<SelectMoveModel | undefined>>
  ] = useState(optionStore?.dpsSheet?.fmoveTargetPokemon);
  const [cmoveTargetPokemon, setCmoveTargetPokemon]: [
    SelectMoveModel | undefined,
    React.Dispatch<React.SetStateAction<SelectMoveModel | undefined>>
  ] = useState(optionStore?.dpsSheet?.cmoveTargetPokemon);

  const [defaultPage, setDefaultPage] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultPage ? optionStore?.dpsSheet?.defaultPage : 1
  );
  const [defaultRowPerPage, setDefaultRowPerPage] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultRowPerPage ? optionStore?.dpsSheet?.defaultRowPerPage : 10
  );
  const [defaultSorted, setDefaultSorted] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultSorted
      ? optionStore?.dpsSheet?.defaultSorted
      : {
          selectedColumn: 8,
          sortDirection: 'desc',
        }
  );

  const [filters, setFilters] = useState(
    optionStore?.dpsSheet?.filters ?? {
      match: false,
      showEliteMove: true,
      showShadow: true,
      showMega: true,
      showGmax: true,
      showPrimal: true,
      showLegendary: true,
      showMythic: true,
      showUltrabeast: true,
      enableShadow: false,
      enableElite: false,
      enableMega: false,
      enableGmax: false,
      enablePrimal: false,
      enableLegendary: false,
      enableMythic: false,
      enableUltrabeast: false,
      enableBest: false,
      enableDelay: false,
      releasedGO: true,
      bestOf: 3,
      IV_ATK: MAX_IV,
      IV_DEF: MAX_IV,
      IV_HP: MAX_IV,
      POKEMON_LEVEL: 40,
    }
  );

  const {
    match,
    showEliteMove,
    showShadow,
    enableShadow,
    showMega,
    showGmax,
    showPrimal,
    showLegendary,
    showMythic,
    showUltrabeast,
    enableElite,
    enableMega,
    enableBest,
    enableDelay,
    enableGmax,
    enablePrimal,
    enableLegendary,
    enableMythic,
    enableUltrabeast,
    releasedGO,
    bestOf,
    IV_ATK,
    IV_DEF,
    IV_HP,
    POKEMON_LEVEL,
  } = filters;

  const [options, setOptions]: [OptionOtherDPS, React.Dispatch<React.SetStateAction<OptionOtherDPS>>] = useState({
    POKEMON_DEF_OBJ: DEFAULT_POKEMON_DEF_OBJ,
  });
  const { WEATHER_BOOSTS, TRAINER_FRIEND, POKEMON_FRIEND_LEVEL, POKEMON_DEF_OBJ } = options;

  const [showSpinner, setShowSpinner] = useState(true);
  const [selectTypes, setSelectTypes] = useState(optionStore?.dpsSheet?.selectTypes ?? []);

  const addCPokeData = (
    dataList: PokemonSheetData[],
    movePoke: string[],
    pokemon: PokemonDataModel,
    vf: string,
    shadow: boolean,
    purified: boolean,
    special: boolean,
    felite: boolean,
    celite: boolean,
    specialMove: string[] = []
  ) => {
    movePoke?.forEach((vc: string) => {
      const fmove = data?.combat?.find((item) => item.name === vf);
      const cmove = data?.combat?.find((item) => item.name === vc);

      if (fmove && cmove) {
        const stats = calculateStatsByTag(pokemon, pokemon.baseStats, pokemon.slug);
        const statsAttacker: BattleCalculate = {
          atk: calculateStatsBattle(stats.atk, IV_ATK, POKEMON_LEVEL),
          def: calculateStatsBattle(stats.def, IV_DEF, POKEMON_LEVEL),
          hp: calculateStatsBattle(stats?.sta ?? 0, IV_HP, POKEMON_LEVEL),
          fmove,
          cmove,
          types: pokemon.types,
          shadow,
          WEATHER_BOOSTS: options.WEATHER_BOOSTS ?? '',
          POKEMON_FRIEND: options.TRAINER_FRIEND,
          POKEMON_FRIEND_LEVEL: options.POKEMON_FRIEND_LEVEL,
        };

        let dps, tdo;
        if (dataTargetPokemon && fmoveTargetPokemon && cmoveTargetPokemon) {
          const statsDef = calculateStatsByTag(dataTargetPokemon, dataTargetPokemon.baseStats, dataTargetPokemon.slug);
          const statsDefender: BattleCalculate = {
            atk: calculateStatsBattle(statsDef.atk, IV_ATK, POKEMON_LEVEL),
            def: calculateStatsBattle(statsDef.def, IV_DEF, POKEMON_LEVEL),
            hp: calculateStatsBattle(statsDef?.sta ?? 0, IV_HP, POKEMON_LEVEL),
            fmove: data?.combat?.find((item) => item.name === fmoveTargetPokemon.name),
            cmove: data?.combat?.find((item) => item.name === cmoveTargetPokemon.name),
            types: dataTargetPokemon.types,
            WEATHER_BOOSTS: options.WEATHER_BOOSTS ?? '',
          };

          if (!statsDefender) {
            return;
          }

          const dpsDef = calculateBattleDPSDefender(data?.options, data?.typeEff, data?.weatherBoost, statsAttacker, statsDefender);
          dps = calculateBattleDPS(data?.options, data?.typeEff, data?.weatherBoost, statsAttacker, statsDefender, dpsDef);
          tdo = dps * TimeToKill(Math.floor(statsAttacker.hp ?? 0), dpsDef);
        } else {
          dps = calculateAvgDPS(
            data?.options,
            data?.typeEff,
            data?.weatherBoost,
            statsAttacker.fmove,
            statsAttacker.cmove,
            statsAttacker.atk ?? 0,
            statsAttacker.def,
            statsAttacker.hp ?? 0,
            statsAttacker.types,
            options,
            statsAttacker.shadow
          );
          tdo = calculateTDO(data?.options, statsAttacker.def, statsAttacker.hp ?? 0, dps, statsAttacker.shadow);
        }
        dataList.push({
          pokemon,
          fmove: statsAttacker.fmove,
          cmove: statsAttacker.cmove,
          dps,
          tdo,
          multiDpsTdo: Math.pow(dps, 3) * tdo,
          shadow,
          purified: purified && specialMove.length > 0 && specialMove?.includes(statsAttacker.cmove?.name ?? ''),
          special,
          mShadow: shadow && specialMove.length > 0 && specialMove?.includes(statsAttacker.cmove?.name ?? ''),
          elite: {
            fmove: felite,
            cmove: celite,
          },
          cp: calculateCP(stats.atk + IV_ATK, stats.def + IV_DEF, (stats?.sta ?? 0) + IV_HP, POKEMON_LEVEL),
        });
      }
    });
  };

  const addFPokeData = (dataList: PokemonSheetData[], pokemon: PokemonDataModel, movePoke: string[], felite: boolean, isShadow = false) => {
    movePoke.forEach((vf) => {
      addCPokeData(dataList, pokemon.cinematicMoves ?? [], pokemon, vf, false, false, false, felite, false);
      if (!pokemon.forme || isShadow) {
        if (pokemon.shadowMoves && pokemon.shadowMoves.length > 0) {
          addCPokeData(dataList, pokemon.cinematicMoves ?? [], pokemon, vf, true, false, false, felite, false, pokemon.shadowMoves);
          addCPokeData(dataList, pokemon.eliteCinematicMove ?? [], pokemon, vf, true, false, false, felite, true, pokemon.shadowMoves);
        }
        addCPokeData(dataList, pokemon.shadowMoves ?? [], pokemon, vf, true, false, false, felite, false, pokemon.shadowMoves);
        addCPokeData(dataList, pokemon.purifiedMoves ?? [], pokemon, vf, false, true, false, felite, false, pokemon.purifiedMoves);
      }
      addCPokeData(dataList, pokemon.specialMoves ?? [], pokemon, vf, false, false, true, felite, false, pokemon.specialMoves);
      addCPokeData(dataList, pokemon.eliteCinematicMove ?? [], pokemon, vf, false, false, false, felite, true);
    });
  };

  const calculateDPSTable = () => {
    const dataList: PokemonSheetData[] = [];
    data?.pokemon?.forEach((pokemon) => {
      if (pokemon) {
        addFPokeData(dataList, pokemon, pokemon.quickMoves ?? [], false, pokemon.isShadow);
        addFPokeData(dataList, pokemon, pokemon.eliteQuickMove ?? [], true, pokemon.isShadow);
      }
    });
    setShowSpinner(false);
    return dataList;
  };

  const filterBestOptions = (result: PokemonSheetData[], best: number) => {
    const bestType = best === 1 ? 'dps' : best === 2 ? 'tdo' : 'multiDpsTdo';
    const group = result.reduce((result: { [x: string]: PokemonSheetData[] }, obj) => {
      (result[obj.pokemon.name] = result[obj.pokemon.name] || []).push(obj);
      return result;
    }, {});
    return Object.values(group).map((pokemon) => pokemon.reduce((p, c) => (p[bestType] > c[bestType] ? p : c)));
  };

  const searchFilter = () => {
    let result = dpsTable.filter((item) => {
      const boolFilterType =
        selectTypes.length === 0 ||
        (selectTypes.includes(item.fmove?.type?.toUpperCase() ?? '') && selectTypes.includes(item.cmove?.type?.toUpperCase() ?? ''));
      const boolFilterPoke =
        searchTerm === '' ||
        (match
          ? splitAndCapitalize(item.pokemon?.name, '-', ' ').toLowerCase() === searchTerm.toLowerCase() ||
            item.pokemon?.num.toString() === searchTerm
          : splitAndCapitalize(item.pokemon?.name, '-', ' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.pokemon?.num.toString().includes(searchTerm));

      const boolShowShadow = !showShadow && item.shadow;
      const boolShowElite = !showEliteMove && (item.elite?.fmove || item.elite?.cmove);
      const boolShowMega = !showMega && item.pokemon?.forme?.toUpperCase().includes(FORM_MEGA);
      const boolShowGmax = !showGmax && item.pokemon?.forme?.toUpperCase().includes(FORM_GMAX);
      const boolShowPrimal = !showPrimal && item.pokemon?.forme?.toUpperCase().includes(FORM_PRIMAL);
      const boolShowLegend = !showLegendary && item.pokemon?.pokemonClass === TYPE_LEGENDARY;
      const boolShowMythic = !showMythic && item.pokemon?.pokemonClass === TYPE_MYTHIC;
      const boolShowUltra = !showUltrabeast && item.pokemon?.pokemonClass === TYPE_ULTRA_BEAST;

      const boolOnlyShadow = enableShadow && item.shadow;
      const boolOnlyElite = enableElite && (item.elite?.fmove || item.elite?.cmove);
      const boolOnlyMega = enableMega && item.pokemon?.forme?.toUpperCase().includes(FORM_MEGA);
      const boolOnlyGmax = enableGmax && item.pokemon?.forme?.toUpperCase().includes(FORM_GMAX);
      const boolOnlyPrimal = enablePrimal && item.pokemon?.forme?.toUpperCase().includes(FORM_PRIMAL);
      const boolOnlyLegend = enableLegendary && item.pokemon?.pokemonClass === TYPE_LEGENDARY;
      const boolOnlyMythic = enableMythic && item.pokemon?.pokemonClass === TYPE_MYTHIC;
      const boolOnlyUltra = enableUltrabeast && item.pokemon?.pokemonClass === TYPE_ULTRA_BEAST;

      let boolReleaseGO = true;
      if (releasedGO) {
        const result = checkPokemonGO(item.pokemon?.num, item.pokemon.name, data?.pokemon ?? []);
        boolReleaseGO = item.pokemon?.releasedGO ?? result?.releasedGO ?? false;
      }
      if (enableShadow || enableElite || enableMega || enableGmax || enablePrimal || enableLegendary || enableMythic || enableUltrabeast) {
        return (
          boolFilterType &&
          boolFilterPoke &&
          boolReleaseGO &&
          !(
            boolShowShadow ||
            boolShowElite ||
            boolShowMega ||
            boolShowGmax ||
            boolShowPrimal ||
            boolShowLegend ||
            boolShowMythic ||
            boolShowUltra
          ) &&
          boolReleaseGO &&
          (boolOnlyShadow ||
            boolOnlyElite ||
            boolOnlyMega ||
            boolOnlyGmax ||
            boolOnlyPrimal ||
            boolOnlyLegend ||
            boolOnlyMythic ||
            boolOnlyUltra)
        );
      } else {
        return (
          boolFilterType &&
          boolFilterPoke &&
          boolReleaseGO &&
          !(
            boolShowShadow ||
            boolShowElite ||
            boolShowMega ||
            boolShowGmax ||
            boolShowPrimal ||
            boolShowLegend ||
            boolShowMythic ||
            boolShowUltra
          )
        );
      }
    });
    if (enableBest) {
      result = filterBestOptions(result, bestOf);
    }
    setShowSpinner(false);
    return result;
  };

  useEffect(() => {
    document.title = 'DPS&TDO Sheets';
  }, []);

  useEffect(() => {
    if (data?.typeEff) {
      setTypes(Object.keys(data?.typeEff));
    }
  }, [data?.typeEff]);

  useEffect(() => {
    if (data?.pokemon && data?.pokemon.length > 0 && data?.combat && data?.options && data?.typeEff && data?.weatherBoost) {
      setShowSpinner(true);
      const timeOutId = setTimeout(() => {
        setDpsTable(calculateDPSTable());
      }, 300);
      return () => clearTimeout(timeOutId);
    }
  }, [
    dataTargetPokemon,
    fmoveTargetPokemon,
    cmoveTargetPokemon,
    data?.pokemon,
    data?.combat,
    data?.options,
    data?.typeEff,
    data?.weatherBoost,
  ]);

  useEffect(() => {
    if (dpsTable.length > 0) {
      setShowSpinner(true);
      const timeOutId = setTimeout(() => {
        setDataFilter(searchFilter());
      }, 500);
      return () => clearTimeout(timeOutId);
    }
  }, [dpsTable, searchTerm]);

  useEffect(() => {
    if (dpsTable.length > 0) {
      setShowSpinner(true);
      const timeOutId = setTimeout(() => {
        setDataFilter(searchFilter());
      }, 100);
      return () => clearTimeout(timeOutId);
    }
  }, [
    dpsTable,
    match,
    selectTypes,
    showShadow,
    showEliteMove,
    showMega,
    showGmax,
    showPrimal,
    showLegendary,
    showMythic,
    showUltrabeast,
    enableElite,
    enableShadow,
    enableMega,
    enableGmax,
    enablePrimal,
    enableLegendary,
    enableMythic,
    enableUltrabeast,
    enableBest,
    bestOf,
    releasedGO,
  ]);

  useEffect(() => {
    dispatch(
      setDPSSheetPage({
        filters,
        options,
        selectTypes,
        dataTargetPokemon,
        fmoveTargetPokemon,
        cmoveTargetPokemon,
        searchTerm,
        defaultPage,
        defaultRowPerPage,
        defaultSorted,
      })
    );
  }, [
    dataTargetPokemon,
    fmoveTargetPokemon,
    cmoveTargetPokemon,
    searchTerm,
    dpsTable,
    match,
    selectTypes,
    showShadow,
    showEliteMove,
    showMega,
    enableElite,
    enableShadow,
    enableMega,
    enableBest,
    bestOf,
    releasedGO,
    defaultPage,
    defaultRowPerPage,
    defaultSorted,
  ]);

  const addTypeArr = (value: string) => {
    if (selectTypes.includes(value)) {
      return setSelectTypes([...selectTypes].filter((item) => item !== value));
    }
    return setSelectTypes((oldArr) => [...oldArr, value]);
  };

  const onCalculateTable = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setShowSpinner(true);
    setTimeout(() => {
      setDpsTable(calculateDPSTable());
    }, 300);
  };

  return (
    <Fragment>
      <div className="head-filter text-center w-100">
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
                <TypeInfo block={true} arr={[item]} />
              </button>
            </div>
          ))}
        </div>
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xxl border-input" style={{ padding: 0, height: 'fit-content' }}>
            <div className="border-input">
              <div className="row w-100" style={{ margin: 0 }}>
                <div className="d-flex col-md-9" style={{ padding: 0 }}>
                  <span className="input-group-text">Search name or ID</span>
                  <input
                    type="text"
                    className="form-control input-search"
                    placeholder="Enter Name or ID"
                    defaultValue={searchTerm}
                    onKeyUp={(e) => setSearchTerm(e.currentTarget.value)}
                  />
                </div>
                <div className="d-flex col-md-3">
                  <FormControlLabel
                    control={<Checkbox checked={match} onChange={(_, check) => setFilters({ ...filters, match: check })} />}
                    label="Match Pokémon"
                  />
                </div>
              </div>
            </div>
            <div className="input-group">
              <span className="input-group-text">Filter show</span>
              <FormControlLabel
                control={<Checkbox checked={showShadow} onChange={(_, check) => setFilters({ ...filters, showShadow: check })} />}
                label="Shadow"
              />
              <FormControlLabel
                control={<Checkbox checked={showMega} onChange={(_, check) => setFilters({ ...filters, showMega: check })} />}
                label="Mega"
              />
              <FormControlLabel
                control={<Checkbox checked={showGmax} onChange={(_, check) => setFilters({ ...filters, showGmax: check })} />}
                label="Gmax"
              />
              <FormControlLabel
                control={<Checkbox checked={showPrimal} onChange={(_, check) => setFilters({ ...filters, showPrimal: check })} />}
                label="Primal"
              />
              <FormControlLabel
                control={<Checkbox checked={showLegendary} onChange={(_, check) => setFilters({ ...filters, showLegendary: check })} />}
                label="Legendary"
              />
              <FormControlLabel
                control={<Checkbox checked={showMythic} onChange={(_, check) => setFilters({ ...filters, showMythic: check })} />}
                label="Mythic"
              />
              <FormControlLabel
                control={<Checkbox checked={showUltrabeast} onChange={(_, check) => setFilters({ ...filters, showUltrabeast: check })} />}
                label="Ultra Beast"
              />
              <FormControlLabel
                control={<Checkbox checked={showEliteMove} onChange={(_, check) => setFilters({ ...filters, showEliteMove: check })} />}
                label="Elite Move"
              />
            </div>
            <div className="input-group border-input">
              <span className="input-group-text">Filter only by</span>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableShadow}
                    disabled={!showShadow}
                    onChange={(_, check) => setFilters({ ...filters, enableShadow: check })}
                  />
                }
                label="Shadow"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableMega}
                    disabled={!showMega}
                    onChange={(_, check) => setFilters({ ...filters, enableMega: check })}
                  />
                }
                label="Mega"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableGmax}
                    disabled={!showGmax}
                    onChange={(_, check) => setFilters({ ...filters, enableGmax: check })}
                  />
                }
                label="Gmax"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enablePrimal}
                    disabled={!showPrimal}
                    onChange={(_, check) => setFilters({ ...filters, enablePrimal: check })}
                  />
                }
                label="Primal"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableLegendary}
                    disabled={!showLegendary}
                    onChange={(_, check) => setFilters({ ...filters, enableLegendary: check })}
                  />
                }
                label="Legendary"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableMythic}
                    disabled={!showMythic}
                    onChange={(_, check) => setFilters({ ...filters, enableMythic: check })}
                  />
                }
                label="Mythic"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableUltrabeast}
                    disabled={!showUltrabeast}
                    onChange={(_, check) => setFilters({ ...filters, enableUltrabeast: check })}
                  />
                }
                label="Ultra Beast"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableElite}
                    disabled={!showEliteMove}
                    onChange={(_, check) => setFilters({ ...filters, enableElite: check })}
                  />
                }
                label="Elite Moves"
              />
            </div>
            <div className="input-group">
              <div className="row w-100" style={{ margin: 0 }}>
                <Box className="col-xxl-8" style={{ padding: 0 }}>
                  <div className="input-group">
                    <span className="input-group-text">Filter best movesets</span>
                    <FormControlLabel
                      className="border-input"
                      style={{ marginRight: 0, paddingRight: 16 }}
                      control={<Switch checked={enableBest} onChange={(_, check) => setFilters({ ...filters, enableBest: check })} />}
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
                      control={<Switch checked={releasedGO} onChange={(_, check) => setFilters({ ...filters, releasedGO: check })} />}
                      label={
                        <span className="d-flex align-items-center">
                          Released in GO
                          <img
                            className={releasedGO ? '' : 'filter-gray'}
                            width={28}
                            height={28}
                            style={{ marginLeft: 5 }}
                            alt="pokemon-go-icon"
                            src={APIService.getPokemonGoIcon(icon ?? 'Standard')}
                          />
                        </span>
                      }
                    />
                  </div>
                </Box>
              </div>
            </div>
            <div className="input-group">
              <div className="row w-100" style={{ margin: 0 }}>
                <Box className="col-xl-4" style={{ padding: 0 }}>
                  <div className="input-group h-100">
                    <span className="input-group-text">Defender</span>
                    <SelectPokemon
                      pokemon={dataTargetPokemon}
                      selected={true}
                      setCurrentPokemon={setDataTargetPokemon}
                      setFMovePokemon={setFmoveTargetPokemon}
                      setCMovePokemon={setCmoveTargetPokemon}
                      disable={showSpinner}
                    />
                  </div>
                </Box>
                <Box className="col-xl-4" style={{ padding: 0 }}>
                  <div className="input-group h-100">
                    <span className="input-group-text">Fast Move</span>
                    <SelectMove
                      inputType={'small'}
                      pokemon={dataTargetPokemon}
                      move={fmoveTargetPokemon}
                      setMovePokemon={setFmoveTargetPokemon}
                      moveType={TypeMove.FAST}
                      disable={showSpinner}
                    />
                  </div>
                </Box>
                <Box className="col-xl-4" style={{ padding: 0 }}>
                  <div className="input-group h-100">
                    <span className="input-group-text">Charged Move</span>
                    <SelectMove
                      inputType={'small'}
                      pokemon={dataTargetPokemon}
                      move={cmoveTargetPokemon}
                      setMovePokemon={setCmoveTargetPokemon}
                      moveType={TypeMove.CHARGE}
                      disable={showSpinner}
                    />
                  </div>
                </Box>
              </div>
            </div>
          </div>
          <div className="col-xxl border-input" style={{ padding: 0, height: 'fit-content' }}>
            <div className="head-types">Options</div>
            <form className="w-100" onSubmit={onCalculateTable.bind(this)}>
              <div className="input-group">
                <FormControlLabel
                  sx={{ marginLeft: 1 }}
                  control={
                    <Switch
                      onChange={(_, check) => {
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
                            delay: undefined,
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
                  onInput={(e) =>
                    setOptions({
                      ...options,
                      delay: {
                        ftime: parseFloat(e.currentTarget.value),
                        ctime: options.delay?.ctime ?? 0,
                      },
                    })
                  }
                />
                <span className="input-group-text">Charged Move Time</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ height: 42, borderRadius: 0 }}
                  placeholder="Delay time (sec)"
                  aria-label="Charged Move Time"
                  min={0}
                  disabled={!enableDelay}
                  required={enableDelay}
                  onInput={(e) =>
                    setOptions({
                      ...options,
                      delay: {
                        ftime: options.delay?.ftime ?? 0,
                        ctime: parseFloat(e.currentTarget.value),
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
                    placeholder={`${MIN_IV}-${MAX_IV}`}
                    min={MIN_IV}
                    max={MAX_IV}
                    required={true}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        IV_ATK: e.target.value ? parseInt(e.target.value) : 0,
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
                    placeholder={`${MIN_IV}-${MAX_IV}`}
                    min={MIN_IV}
                    max={MAX_IV}
                    required={true}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        IV_DEF: e.target.value ? parseInt(e.target.value) : 0,
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
                    placeholder={`${MIN_IV}-${MAX_IV}`}
                    min={MIN_IV}
                    max={MAX_IV}
                    required={true}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        IV_HP: e.target.value ? parseInt(e.target.value) : 0,
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
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        POKEMON_LEVEL: e.target.value ? parseFloat(e.target.value) : 0,
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
                    defaultValue={POKEMON_DEF_OBJ}
                    type="number"
                    className="form-control"
                    placeholder="Defense target"
                    min={1}
                    disabled={dataTargetPokemon ? true : false}
                    required={true}
                    onInput={(e) =>
                      setOptions({
                        ...options,
                        POKEMON_DEF_OBJ: parseFloat(e.currentTarget.value),
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
                    defaultValue={String(WEATHER_BOOSTS)}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        WEATHER_BOOSTS: e.target.value,
                      })
                    }
                  >
                    <option value="">Extream</option>
                    {Object.keys(data?.weatherBoost ?? {}).map((value, index) => (
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
                          onChange={(_, check) => {
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
                      onChange={(_, value) => {
                        setOptions({
                          ...options,
                          POKEMON_FRIEND_LEVEL: value ?? 0,
                        });
                      }}
                      defaultValue={0}
                      max={4}
                      size="large"
                      value={POKEMON_FRIEND_LEVEL}
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
          defaultSortFieldId={defaultSorted.selectedColumn}
          defaultSortAsc={defaultSorted.sortDirection === 'asc'}
          highlightOnHover={true}
          striped={true}
          paginationDefaultPage={defaultPage}
          paginationPerPage={defaultRowPerPage}
          onChangePage={(page) => {
            setDefaultPage(page);
          }}
          onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
            setDefaultPage(currentPage);
            setDefaultRowPerPage(currentRowsPerPage);
          }}
          onSort={(selectedColumn, sortDirection) => {
            setDefaultSorted({
              selectedColumn: selectedColumn.id as number,
              sortDirection,
            });
          }}
        />
      </div>
    </Fragment>
  );
};

export default DpsTdo;
