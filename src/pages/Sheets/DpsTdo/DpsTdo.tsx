import React, { useEffect, useState } from 'react';

import { LevelRating, splitAndCapitalize, capitalize, checkPokemonGO } from '../../../util/utils';
import {
  DEFAULT_SHEET_PAGE,
  DEFAULT_SHEET_ROW,
  DEFAULT_TYPES,
  FORM_GMAX,
  FORM_MEGA,
  FORM_PRIMAL,
  FORM_PURIFIED,
  FORM_SHADOW,
  levelList,
  MAX_IV,
  MIN_IV,
  MIN_LEVEL,
  TYPE_LEGENDARY,
  TYPE_MYTHIC,
  TYPE_ULTRA_BEAST,
} from '../../../util/constants';
import {
  calculateAvgDPS,
  calculateCP,
  calculateStatsByTag,
  calculateTDO,
  calculateBattleDPS,
  TimeToKill,
  calculateBattleDPSDefender,
  calculateStatsBattle,
} from '../../../util/calculate';

import DataTable from 'react-data-table-component';
import APIService from '../../../services/API.service';

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
import { Action } from 'history';
import { TypeMove } from '../../../enums/type.enum';
import { OptionsSheetState, RouterState, StoreState } from '../../../store/models/state.model';
import { ICombat } from '../../../core/models/combat.model';
import { Elite, IPokemonData } from '../../../core/models/pokemon.model';
import { ISelectMoveModel } from '../../../components/Input/models/select-move.model';
import { Delay, OptionDPSSort, OptionFiltersDPS, OptionOtherDPS } from '../../../store/models/options.model';
import { BattleCalculate } from '../../../util/models/calculate.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { BestOptionType, SortDirectionType } from './enums/column-select-type.enum';
import { WeatherBoost } from '../../../core/models/weatherBoost.model';
import { OptionsActions } from '../../../store/actions';
import { TableColumnModify } from '../../../util/models/overrides/data-table.model';
import {
  combineClasses,
  convertColumnDataType,
  DynamicObj,
  getValueOrDefault,
  isEmpty,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  toFloat,
  toNumber,
} from '../../../util/extension';
import { InputType } from '../../../components/Input/enums/input-type.enum';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import Loading from '../../../components/Sprites/Loading/Loading';

interface PokemonSheetData {
  pokemon: IPokemonData;
  fMove: ICombat | undefined;
  cMove: ICombat | undefined;
  dps: number;
  tdo: number;
  multiDpsTdo: number;
  shadow: boolean;
  purified: boolean;
  special: boolean;
  mShadow: boolean;
  elite: Elite;
  cp: number;
}

const nameSort = (rowA: PokemonSheetData, rowB: PokemonSheetData) => {
  const a = rowA.pokemon.name.toLowerCase();
  const b = rowB.pokemon.name.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const fMoveSort = (rowA: PokemonSheetData, rowB: PokemonSheetData) => {
  const a = getValueOrDefault(String, rowA.fMove?.name.toLowerCase());
  const b = getValueOrDefault(String, rowB.fMove?.name.toLowerCase());
  return a === b ? 0 : a > b ? 1 : -1;
};

const cMoveSort = (rowA: PokemonSheetData, rowB: PokemonSheetData) => {
  const a = getValueOrDefault(String, rowA.cMove?.name.toLowerCase());
  const b = getValueOrDefault(String, rowB.cMove?.name.toLowerCase());
  return a === b ? 0 : a > b ? 1 : -1;
};

const columns: TableColumnModify<PokemonSheetData>[] = [
  {
    name: 'ID',
    selector: (row) => row.pokemon.num,
    sortable: true,
    minWidth: '60px',
    maxWidth: '120px',
  },
  {
    name: 'Pokémon Name',
    selector: (row) => (
      <Link
        to={`/pokemon/${row.pokemon.num}${row.pokemon.forme ? `?form=${row.pokemon.forme.toLowerCase().replaceAll('_', '-')}` : ''}`}
        title={`#${row.pokemon.num} ${splitAndCapitalize(row.pokemon.name, '-', ' ')}`}
      >
        {row.shadow && <img height={25} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
        {row.purified && <img height={25} alt="img-purified" className="purified-icon" src={APIService.getPokePurified()} />}
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.pokemon.sprite, true)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(getValueOrDefault(String, row.pokemon.baseSpecies));
          }}
        />
        {splitAndCapitalize(row.pokemon.name, '-', ' ')}
      </Link>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    name: 'Type(s)',
    selector: (row) =>
      row.pokemon.types.map((value, index) => (
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
    selector: (row) => (
      <Link className="d-flex align-items-center" to={`/move/${row.fMove?.id}`} title={`${splitAndCapitalize(row.fMove?.name, '_', ' ')}`}>
        <img
          style={{ marginRight: 10 }}
          width={25}
          height={25}
          alt="img-pokemon"
          src={APIService.getTypeSprite(capitalize(row.fMove?.type))}
        />{' '}
        <div>
          <span className="text-b-ic">{splitAndCapitalize(row.fMove?.name, '_', ' ')}</span>
          {row.elite?.fMove && (
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
    selector: (row) => (
      <Link className="d-flex align-items-center" to={`/move/${row.cMove?.id}`} title={`${splitAndCapitalize(row.cMove?.name, '_', ' ')}`}>
        <img
          style={{ marginRight: 10 }}
          width={25}
          height={25}
          alt="img-pokemon"
          src={APIService.getTypeSprite(capitalize(row.cMove?.type))}
        />{' '}
        <div>
          <span className="text-b-ic">{splitAndCapitalize(row.cMove?.name, '_', ' ')}</span>
          {row.elite?.cMove && (
            <span className="type-icon-small ic elite-ic">
              <span>Elite</span>
            </span>
          )}
          {row.mShadow && (
            <span className="type-icon-small ic shadow-ic">
              <span>{capitalize(FORM_SHADOW)}</span>
            </span>
          )}
          {row.purified && (
            <span className="type-icon-small ic purified-ic">
              <span>{capitalize(FORM_PURIFIED)}</span>
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
    selector: (row) => toFloat(row.dps, 3),
    sortable: true,
    minWidth: '80px',
  },
  {
    name: 'TDO',
    selector: (row) => toFloat(row.tdo, 3),
    sortable: true,
    minWidth: '100px',
  },
  {
    name: 'DPS^3*TDO',
    selector: (row) => toFloat(row.multiDpsTdo, 3),
    sortable: true,
    minWidth: '140px',
  },
  {
    name: 'CP',
    selector: (row) => row.cp,
    sortable: true,
    minWidth: '100px',
  },
];

const DpsTdo = () => {
  useChangeTitle('DPS&TDO Sheets');
  const dispatch = useDispatch();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const optionStore = useSelector((state: OptionsSheetState) => state.options);
  const router = useSelector((state: RouterState) => state.router);

  const [types, setTypes] = useState(DEFAULT_TYPES);

  const [dpsTable, setDpsTable] = useState<PokemonSheetData[]>([]);
  const [dataFilter, setDataFilter] = useState<PokemonSheetData[]>([]);
  const [searchTerm, setSearchTerm] = useState(getValueOrDefault(String, optionStore?.dpsSheet?.searchTerm));

  const [dataTargetPokemon, setDataTargetPokemon] = useState<IPokemonData | undefined>(optionStore?.dpsSheet?.dataTargetPokemon);
  const [fMoveTargetPokemon, setFMoveTargetPokemon] = useState<ISelectMoveModel | undefined>(optionStore?.dpsSheet?.fMoveTargetPokemon);
  const [cMoveTargetPokemon, setCMoveTargetPokemon] = useState<ISelectMoveModel | undefined>(optionStore?.dpsSheet?.cMoveTargetPokemon);

  const [defaultPage, setDefaultPage] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultPage ? optionStore?.dpsSheet?.defaultPage : DEFAULT_SHEET_PAGE
  );
  const [defaultRowPerPage, setDefaultRowPerPage] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultRowPerPage ? optionStore?.dpsSheet?.defaultRowPerPage : DEFAULT_SHEET_ROW
  );
  const [defaultSorted, setDefaultSorted] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultSorted ? optionStore?.dpsSheet?.defaultSorted : new OptionDPSSort()
  );

  const [filters, setFilters] = useState(optionStore?.dpsSheet?.filters ?? new OptionFiltersDPS());

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
    showUltraBeast,
    enableElite,
    enableMega,
    enableBest,
    enableDelay,
    enableGmax,
    enablePrimal,
    enableLegendary,
    enableMythic,
    enableUltraBeast,
    releasedGO,
    bestOf,
    ivAtk,
    ivDef,
    ivHp,
    pokemonLevel,
  } = filters;

  const [options, setOptions] = useState(new OptionOtherDPS());
  const { weatherBoosts, trainerFriend, pokemonFriendLevel, pokemonDefObj } = options;

  const [showSpinner, setShowSpinner] = useState(false);
  const [selectTypes, setSelectTypes] = useState(getValueOrDefault(Array, optionStore?.dpsSheet?.selectTypes));

  const addCPokeData = (
    dataList: PokemonSheetData[],
    movePoke: string[],
    pokemon: IPokemonData,
    vf: string,
    shadow: boolean,
    purified: boolean,
    special: boolean,
    fElite: boolean,
    cElite: boolean,
    specialMove: string[] = []
  ) => {
    movePoke.forEach((vc: string) => {
      const fMove = data?.combat?.find((item) => isEqual(item.name, vf));
      const cMove = data?.combat?.find((item) => isEqual(item.name, vc));

      if (fMove && cMove) {
        const stats = calculateStatsByTag(pokemon, pokemon.baseStats, pokemon.slug);
        const statsAttacker = new BattleCalculate({
          atk: calculateStatsBattle(stats.atk, ivAtk, pokemonLevel),
          def: calculateStatsBattle(stats.def, ivDef, pokemonLevel),
          hp: calculateStatsBattle(getValueOrDefault(Number, stats.sta), ivHp, pokemonLevel),
          fMove,
          cMove,
          types: pokemon.types,
          shadow,
          weatherBoosts: getValueOrDefault(String, options.weatherBoosts),
          pokemonFriend: options.trainerFriend,
          pokemonFriendLevel: options.pokemonFriendLevel,
        });

        let dps, tdo;
        if (dataTargetPokemon && fMoveTargetPokemon && cMoveTargetPokemon) {
          const statsDef = calculateStatsByTag(dataTargetPokemon, dataTargetPokemon.baseStats, dataTargetPokemon.slug);
          const statsDefender = new BattleCalculate({
            atk: calculateStatsBattle(statsDef.atk, ivAtk, pokemonLevel),
            def: calculateStatsBattle(statsDef.def, ivDef, pokemonLevel),
            hp: calculateStatsBattle(getValueOrDefault(Number, statsDef.sta), ivHp, pokemonLevel),
            fMove: data?.combat?.find((item) => isEqual(item.name, fMoveTargetPokemon.name)),
            cMove: data?.combat?.find((item) => isEqual(item.name, cMoveTargetPokemon.name)),
            types: dataTargetPokemon.types,
            weatherBoosts: getValueOrDefault(String, options.weatherBoosts),
          });

          if (!statsDefender) {
            return;
          }

          const dpsDef = calculateBattleDPSDefender(data?.options, data?.typeEff, data?.weatherBoost, statsAttacker, statsDefender);
          dps = calculateBattleDPS(data?.options, data?.typeEff, data?.weatherBoost, statsAttacker, statsDefender, dpsDef);
          tdo = dps * TimeToKill(Math.floor(getValueOrDefault(Number, statsAttacker.hp)), dpsDef);
        } else {
          dps = calculateAvgDPS(
            data?.options,
            data?.typeEff,
            data?.weatherBoost,
            statsAttacker.fMove,
            statsAttacker.cMove,
            getValueOrDefault(Number, statsAttacker.atk),
            statsAttacker.def,
            getValueOrDefault(Number, statsAttacker.hp),
            statsAttacker.types,
            statsAttacker.shadow,
            options
          );
          tdo = calculateTDO(data?.options, statsAttacker.def, getValueOrDefault(Number, statsAttacker.hp), dps, statsAttacker.shadow);
        }
        dataList.push({
          pokemon,
          fMove: statsAttacker.fMove,
          cMove: statsAttacker.cMove,
          dps,
          tdo,
          multiDpsTdo: Math.pow(dps, 3) * tdo,
          shadow,
          purified: purified && isNotEmpty(specialMove) && isIncludeList(specialMove, statsAttacker.cMove?.name),
          special,
          mShadow: shadow && isNotEmpty(specialMove) && isIncludeList(specialMove, statsAttacker.cMove?.name),
          elite: {
            fMove: fElite,
            cMove: cElite,
          },
          cp: calculateCP(stats.atk + ivAtk, stats.def + ivDef, getValueOrDefault(Number, stats.sta) + ivHp, pokemonLevel),
        });
      }
    });
  };

  const addFPokeData = (dataList: PokemonSheetData[], pokemon: IPokemonData, movePoke: string[], fElite: boolean, isShadow = false) => {
    movePoke.forEach((vf) => {
      addCPokeData(dataList, getValueOrDefault(Array, pokemon.cinematicMoves), pokemon, vf, false, false, false, fElite, false);
      if (!pokemon.forme || isShadow) {
        if (isNotEmpty(pokemon.shadowMoves)) {
          addCPokeData(
            dataList,
            getValueOrDefault(Array, pokemon.cinematicMoves),
            pokemon,
            vf,
            true,
            false,
            false,
            fElite,
            false,
            pokemon.shadowMoves
          );
          addCPokeData(
            dataList,
            getValueOrDefault(Array, pokemon.eliteCinematicMove),
            pokemon,
            vf,
            true,
            false,
            false,
            fElite,
            true,
            pokemon.shadowMoves
          );
        }
        addCPokeData(
          dataList,
          getValueOrDefault(Array, pokemon.shadowMoves),
          pokemon,
          vf,
          true,
          false,
          false,
          fElite,
          false,
          pokemon.shadowMoves
        );
        addCPokeData(
          dataList,
          getValueOrDefault(Array, pokemon.purifiedMoves),
          pokemon,
          vf,
          false,
          true,
          false,
          fElite,
          false,
          pokemon.purifiedMoves
        );
      }
      addCPokeData(
        dataList,
        getValueOrDefault(Array, pokemon.specialMoves),
        pokemon,
        vf,
        false,
        false,
        true,
        fElite,
        false,
        pokemon.specialMoves
      );
      addCPokeData(dataList, getValueOrDefault(Array, pokemon.eliteCinematicMove), pokemon, vf, false, false, false, fElite, true);
    });
  };

  const calculateDPSTable = () => {
    const dataList: PokemonSheetData[] = [];
    data?.pokemon?.forEach((pokemon) => {
      if (pokemon) {
        addFPokeData(dataList, pokemon, getValueOrDefault(Array, pokemon.quickMoves), false, pokemon.isShadow);
        addFPokeData(dataList, pokemon, getValueOrDefault(Array, pokemon.eliteQuickMove), true, pokemon.isShadow);
      }
    });
    setShowSpinner(false);
    return dataList;
  };

  const filterBestOptions = (result: PokemonSheetData[], best: number) => {
    const bestType = BestOptionType[best] as 'dps' | 'tdo' | 'multiDpsTdo';
    const group = result.reduce((result: DynamicObj<PokemonSheetData[]>, obj) => {
      (result[obj.pokemon.name] = getValueOrDefault(Array, result[obj.pokemon.name])).push(obj);
      return result;
    }, {});
    return Object.values(group).map((pokemon) => pokemon.reduce((p, c) => (p[bestType] > c[bestType] ? p : c)));
  };

  const searchFilter = () => {
    let result = dpsTable.filter((item) => {
      const boolFilterType =
        !isNotEmpty(selectTypes) ||
        (isIncludeList(selectTypes, item.fMove?.type, IncludeMode.IncludeIgnoreCaseSensitive) &&
          isIncludeList(selectTypes, item.cMove?.type, IncludeMode.IncludeIgnoreCaseSensitive));
      const boolFilterPoke =
        isEmpty(searchTerm) ||
        (match
          ? isEqual(item.pokemon.name.replaceAll('-', ' '), searchTerm, EqualMode.IgnoreCaseSensitive) ||
            isEqual(item.pokemon.num, searchTerm)
          : isInclude(item.pokemon.name.replaceAll('-', ' '), searchTerm, IncludeMode.IncludeIgnoreCaseSensitive) ||
            isInclude(item.pokemon.num, searchTerm));

      const boolShowShadow = !showShadow && item.shadow;
      const boolShowElite = !showEliteMove && (item.elite.fMove || item.elite.cMove);
      const boolShowMega = !showMega && isInclude(item.pokemon.forme, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive);
      const boolShowGmax = !showGmax && isInclude(item.pokemon.forme, FORM_GMAX, IncludeMode.IncludeIgnoreCaseSensitive);
      const boolShowPrimal = !showPrimal && isInclude(item.pokemon.forme, FORM_PRIMAL, IncludeMode.IncludeIgnoreCaseSensitive);
      const boolShowLegend = !showLegendary && item.pokemon.pokemonClass === TYPE_LEGENDARY;
      const boolShowMythic = !showMythic && item.pokemon.pokemonClass === TYPE_MYTHIC;
      const boolShowUltra = !showUltraBeast && item.pokemon.pokemonClass === TYPE_ULTRA_BEAST;

      const boolOnlyShadow = enableShadow && item.shadow;
      const boolOnlyElite = enableElite && (item.elite.fMove || item.elite.cMove);
      const boolOnlyMega = enableMega && isInclude(item.pokemon.forme, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive);
      const boolOnlyGmax = enableGmax && isInclude(item.pokemon.forme, FORM_GMAX, IncludeMode.IncludeIgnoreCaseSensitive);
      const boolOnlyPrimal = enablePrimal && isInclude(item.pokemon.forme, FORM_PRIMAL, IncludeMode.IncludeIgnoreCaseSensitive);
      const boolOnlyLegend = enableLegendary && item.pokemon.pokemonClass === TYPE_LEGENDARY;
      const boolOnlyMythic = enableMythic && item.pokemon.pokemonClass === TYPE_MYTHIC;
      const boolOnlyUltra = enableUltraBeast && item.pokemon.pokemonClass === TYPE_ULTRA_BEAST;

      let boolReleaseGO = true;
      if (releasedGO) {
        const result = checkPokemonGO(
          item.pokemon.num,
          getValueOrDefault(String, item.pokemon.fullName, item.pokemon.pokemonId),
          getValueOrDefault(Array, data?.pokemon)
        );
        boolReleaseGO = getValueOrDefault(Boolean, item.pokemon.releasedGO, result?.releasedGO);
      }
      if (enableShadow || enableElite || enableMega || enableGmax || enablePrimal || enableLegendary || enableMythic || enableUltraBeast) {
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
    if (data?.typeEff) {
      setTypes(Object.keys(data?.typeEff));
    }
  }, [data?.typeEff]);

  useEffect(() => {
    if (isNotEmpty(data?.pokemon) && isNotEmpty(data?.combat) && data?.options && data?.typeEff && data?.weatherBoost) {
      setShowSpinner(true);
      const timeOutId = setTimeout(() => {
        setDpsTable(calculateDPSTable());
      }, 300);
      return () => clearTimeout(timeOutId);
    }
  }, [
    dataTargetPokemon,
    fMoveTargetPokemon,
    cMoveTargetPokemon,
    data?.pokemon,
    data?.combat,
    data?.options,
    data?.typeEff,
    data?.weatherBoost,
  ]);

  useEffect(() => {
    if (isNotEmpty(dpsTable)) {
      setShowSpinner(true);
      const timeOutId = setTimeout(() => {
        setDataFilter(searchFilter());
      }, 500);
      return () => clearTimeout(timeOutId);
    }
  }, [dpsTable, searchTerm]);

  useEffect(() => {
    if (isNotEmpty(dpsTable)) {
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
    showUltraBeast,
    enableElite,
    enableShadow,
    enableMega,
    enableGmax,
    enablePrimal,
    enableLegendary,
    enableMythic,
    enableUltraBeast,
    enableBest,
    bestOf,
    releasedGO,
  ]);

  useEffect(() => {
    dispatch(
      OptionsActions.SetDpsSheetOptions.create({
        filters,
        options,
        selectTypes,
        dataTargetPokemon,
        fMoveTargetPokemon,
        cMoveTargetPokemon,
        searchTerm,
        defaultPage,
        defaultRowPerPage,
        defaultSorted,
      })
    );
  }, [
    dispatch,
    filters,
    options,
    selectTypes,
    dataTargetPokemon,
    fMoveTargetPokemon,
    cMoveTargetPokemon,
    searchTerm,
    defaultPage,
    defaultRowPerPage,
    defaultSorted,
  ]);

  const addTypeArr = (value: string) => {
    if (isIncludeList(selectTypes, value)) {
      return setSelectTypes([...selectTypes].filter((item) => !isEqual(item, value)));
    }
    return setSelectTypes((oldArr) => [...oldArr, value]);
  };

  const onCalculateTable = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSpinner(true);
    setTimeout(() => {
      setDpsTable(calculateDPSTable());
    }, 300);
  };

  return (
    <div className="position-relative">
      {!isNotEmpty(dpsTable) && (
        <div className="ph-item w-100 h-100 position-absolute" style={{ zIndex: 2, background: 'transparent' }}>
          <div className="ph-picture ph-col-3 w-100 h-100" style={{ padding: 0, margin: 0, background: '#ffffff60' }} />
        </div>
      )}
      <div className="head-filter text-center w-100">
        <div className="head-types">Filter Moves By Types</div>
        <div className="row w-100" style={{ margin: 0 }}>
          {types.map((item, index) => (
            <div key={index} className="col img-group" style={{ margin: 0, padding: 0 }}>
              <button
                value={item}
                onClick={() => addTypeArr(item)}
                className={combineClasses('btn-select-type w-100 border-types', isIncludeList(selectTypes, item) ? 'select-type' : '')}
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
                label={capitalize(FORM_SHADOW)}
              />
              <FormControlLabel
                control={<Checkbox checked={showMega} onChange={(_, check) => setFilters({ ...filters, showMega: check })} />}
                label={capitalize(FORM_MEGA)}
              />
              <FormControlLabel
                control={<Checkbox checked={showGmax} onChange={(_, check) => setFilters({ ...filters, showGmax: check })} />}
                label={capitalize(FORM_GMAX)}
              />
              <FormControlLabel
                control={<Checkbox checked={showPrimal} onChange={(_, check) => setFilters({ ...filters, showPrimal: check })} />}
                label={capitalize(FORM_PRIMAL)}
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
                control={<Checkbox checked={showUltraBeast} onChange={(_, check) => setFilters({ ...filters, showUltraBeast: check })} />}
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
                label={capitalize(FORM_SHADOW)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableMega}
                    disabled={!showMega}
                    onChange={(_, check) => setFilters({ ...filters, enableMega: check })}
                  />
                }
                label={capitalize(FORM_MEGA)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableGmax}
                    disabled={!showGmax}
                    onChange={(_, check) => setFilters({ ...filters, enableGmax: check })}
                  />
                }
                label={capitalize(FORM_GMAX)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enablePrimal}
                    disabled={!showPrimal}
                    onChange={(_, check) => setFilters({ ...filters, enablePrimal: check })}
                  />
                }
                label={capitalize(FORM_PRIMAL)}
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
                    checked={enableUltraBeast}
                    disabled={!showUltraBeast}
                    onChange={(_, check) => setFilters({ ...filters, enableUltraBeast: check })}
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
                      onChange={(e) => setFilters({ ...filters, bestOf: toNumber(e.target.value) })}
                    >
                      <option value={BestOptionType.dps}>DPS</option>
                      <option value={BestOptionType.tdo}>TDO</option>
                      <option value={BestOptionType.multiDpsTdo}>DPS^3*TDO</option>
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
                            src={APIService.getPokemonGoIcon(icon)}
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
                      setFMovePokemon={setFMoveTargetPokemon}
                      setCMovePokemon={setCMoveTargetPokemon}
                      disable={showSpinner}
                    />
                  </div>
                </Box>
                <Box className="col-xl-4" style={{ padding: 0 }}>
                  <div className="input-group h-100">
                    <span className="input-group-text">Fast Move</span>
                    <SelectMove
                      inputType={InputType.Small}
                      pokemon={dataTargetPokemon}
                      move={fMoveTargetPokemon}
                      setMovePokemon={setFMoveTargetPokemon}
                      moveType={TypeMove.FAST}
                      disable={showSpinner}
                    />
                  </div>
                </Box>
                <Box className="col-xl-4" style={{ padding: 0 }}>
                  <div className="input-group h-100">
                    <span className="input-group-text">Charged Move</span>
                    <SelectMove
                      inputType={InputType.Small}
                      pokemon={dataTargetPokemon}
                      move={cMoveTargetPokemon}
                      setMovePokemon={setCMoveTargetPokemon}
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
                        setOptions(
                          OptionOtherDPS.create({
                            ...options,
                            delay: check ? new Delay() : undefined,
                          })
                        );
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
                    setOptions(
                      OptionOtherDPS.create({
                        ...options,
                        delay: Delay.create({
                          fTime: toFloat(e.currentTarget.value),
                          cTime: getValueOrDefault(Number, options.delay?.cTime),
                        }),
                      })
                    )
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
                    setOptions(
                      OptionOtherDPS.create({
                        ...options,
                        delay: Delay.create({
                          fTime: getValueOrDefault(Number, options.delay?.fTime),
                          cTime: toFloat(e.currentTarget.value),
                        }),
                      })
                    )
                  }
                />
              </div>
              <div className="row" style={{ margin: 0 }}>
                <Box className="col-5 input-group" style={{ padding: 0 }}>
                  <span className="input-group-text">IV ATK</span>
                  <input
                    defaultValue={ivAtk}
                    type="number"
                    className="form-control"
                    placeholder={`${MIN_IV}-${MAX_IV}`}
                    min={MIN_IV}
                    max={MAX_IV}
                    required={true}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        ivAtk: toNumber(e.target.value),
                      })
                    }
                    name="ivAtk"
                    style={{ width: 40 }}
                  />
                  <span className="input-group-text">IV DEF</span>
                  <input
                    defaultValue={ivDef}
                    type="number"
                    className="form-control"
                    placeholder={`${MIN_IV}-${MAX_IV}`}
                    min={MIN_IV}
                    max={MAX_IV}
                    required={true}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        ivDef: toNumber(e.target.value),
                      })
                    }
                    name="ivDef"
                    style={{ width: 40 }}
                  />
                  <span className="input-group-text">IV HP</span>
                  <input
                    defaultValue={ivHp}
                    type="number"
                    className="form-control"
                    placeholder={`${MIN_IV}-${MAX_IV}`}
                    min={MIN_IV}
                    max={MAX_IV}
                    required={true}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        ivHp: toNumber(e.target.value),
                      })
                    }
                    name="ivHp"
                    style={{ width: 40 }}
                  />
                  <div className="input-group-prepend">
                    <label className="input-group-text">Levels</label>
                  </div>
                  <Form.Select
                    style={{ borderRadius: 0 }}
                    className="form-control"
                    defaultValue={pokemonLevel}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        pokemonLevel: toFloat(e.target.value, -1, MIN_LEVEL),
                      })
                    }
                  >
                    {levelList.map((value, index) => (
                      <option key={index} value={value}>
                        {value}
                      </option>
                    ))}
                  </Form.Select>
                </Box>
                <Box className="col-7 input-group" style={{ padding: 0 }}>
                  <span className="input-group-text">DEF Target</span>
                  <input
                    defaultValue={pokemonDefObj}
                    type="number"
                    className="form-control"
                    placeholder="Defense target"
                    min={1}
                    disabled={dataTargetPokemon ? true : false}
                    required={true}
                    onInput={(e) =>
                      setOptions(
                        OptionOtherDPS.create({
                          ...options,
                          pokemonDefObj: toFloat(e.currentTarget.value),
                        })
                      )
                    }
                    name="pokemonDefObj"
                  />
                  <div className="input-group-prepend">
                    <label className="input-group-text">Weather Boosts</label>
                  </div>
                  <Form.Select
                    style={{ borderRadius: 0 }}
                    className="form-control"
                    defaultValue={getValueOrDefault(String, weatherBoosts)}
                    onChange={(e) =>
                      setOptions(
                        OptionOtherDPS.create({
                          ...options,
                          weatherBoosts: e.target.value,
                        })
                      )
                    }
                  >
                    <option value="">Extreme</option>
                    {Object.keys(data?.weatherBoost ?? new WeatherBoost()).map((value, index) => (
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
                            setOptions(
                              OptionOtherDPS.create({
                                ...options,
                                trainerFriend: check,
                                pokemonFriendLevel: 0,
                              })
                            );
                          }}
                        />
                      }
                      label="Friendship Level:"
                    />
                    <LevelRating
                      disabled={!trainerFriend}
                      onChange={(_, value) => {
                        setOptions(
                          OptionOtherDPS.create({
                            ...options,
                            pokemonFriendLevel: getValueOrDefault(Number, value),
                          })
                        );
                      }}
                      max={4}
                      size="large"
                      value={getValueOrDefault(Number, pokemonFriendLevel)}
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
        <Loading isShow={showSpinner} bgColor={'white'} />
        <DataTable
          columns={convertColumnDataType(columns)}
          data={dataFilter}
          noDataComponent={null}
          pagination={true}
          defaultSortFieldId={defaultSorted.selectedColumn}
          defaultSortAsc={defaultSorted.sortDirection === SortDirectionType.ASC}
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
            setDefaultSorted(
              OptionDPSSort.create({
                selectedColumn: toNumber(getValueOrDefault(String, selectedColumn.id?.toString(), '1')),
                sortDirection,
              })
            );
          }}
        />
      </div>
    </div>
  );
};

export default DpsTdo;
