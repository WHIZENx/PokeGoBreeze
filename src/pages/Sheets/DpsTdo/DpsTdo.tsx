import React, { useEffect, useState } from 'react';

import { LevelRating, splitAndCapitalize, capitalize, checkPokemonGO, getKeyEnum, getMoveType } from '../../../util/utils';
import { DEFAULT_SHEET_PAGE, DEFAULT_SHEET_ROW, DEFAULT_TYPES, levelList, MAX_IV, MIN_IV, MIN_LEVEL } from '../../../util/constants';
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
import { MoveType, PokemonClass, PokemonType, TypeMove } from '../../../enums/type.enum';
import { OptionsSheetState, RouterState, StoreState } from '../../../store/models/state.model';
import { ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { ISelectMoveModel } from '../../../components/Input/models/select-move.model';
import { Delay, OptionDPSSort, OptionFiltersDPS, OptionOtherDPS } from '../../../store/models/options.model';
import { BattleCalculate } from '../../../util/models/calculate.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { BestOptionType, SortDirectionType } from './enums/column-select-type.enum';
import { OptionsActions } from '../../../store/actions';
import { TableColumnModify } from '../../../util/models/overrides/data-table.model';
import {
  combineClasses,
  convertColumnDataType,
  DynamicObj,
  getPropertyName,
  getValueOrDefault,
  isEmpty,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  toFloat,
  toFloatWithPadding,
  toNumber,
} from '../../../util/extension';
import { InputType, SelectPosition } from '../../../components/Input/enums/input-type.enum';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import Loading from '../../../components/Sprites/Loading/Loading';

interface PokemonSheetData {
  pokemon: IPokemonData;
  fMove: ICombat | undefined;
  cMove: ICombat | undefined;
  dps: number;
  tdo: number;
  multiDpsTdo: number;
  fMoveType: MoveType;
  cMoveType: MoveType;
  pokemonType: PokemonType;
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

const numSortDps = (rowA: PokemonSheetData, rowB: PokemonSheetData) => {
  const a = toFloat(rowA.dps);
  const b = toFloat(rowB.dps);
  return a - b;
};

const numSortTdo = (rowA: PokemonSheetData, rowB: PokemonSheetData) => {
  const a = toFloat(rowA.tdo);
  const b = toFloat(rowB.tdo);
  return a - b;
};

const numSortMulti = (rowA: PokemonSheetData, rowB: PokemonSheetData) => {
  const a = toFloat(rowA.multiDpsTdo);
  const b = toFloat(rowB.multiDpsTdo);
  return a - b;
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
        {row.pokemonType === PokemonType.Shadow && (
          <img height={25} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
        )}
        {row.pokemonType === PokemonType.Purified && (
          <img height={25} alt="img-purified" className="purified-icon" src={APIService.getPokePurified()} />
        )}
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.pokemon.sprite, true)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row.pokemon.baseSpecies);
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
          src={APIService.getTypeSprite(value)}
        />
      )),
    width: '150px',
  },
  {
    name: 'Fast Move',
    selector: (row) => (
      <Link className="d-flex align-items-center" to={`/move/${row.fMove?.id}`} title={`${splitAndCapitalize(row.fMove?.name, '_', ' ')}`}>
        <img style={{ marginRight: 10 }} width={25} height={25} alt="img-pokemon" src={APIService.getTypeSprite(row.fMove?.type)} />{' '}
        <div>
          <span className="text-b-ic">{splitAndCapitalize(row.fMove?.name, '_', ' ')}</span>
          {row.fMoveType !== MoveType.None && (
            <span className={combineClasses('type-icon-small ic', `${getKeyEnum(MoveType, row.fMoveType)?.toLowerCase()}-ic`)}>
              {getKeyEnum(MoveType, row.fMoveType)}
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
        <img style={{ marginRight: 10 }} width={25} height={25} alt="img-pokemon" src={APIService.getTypeSprite(row.cMove?.type)} />{' '}
        <div>
          <span className="text-b-ic">{splitAndCapitalize(row.cMove?.name, '_', ' ')}</span>
          {row.cMoveType !== MoveType.None && (
            <span className={combineClasses('type-icon-small ic', `${getKeyEnum(MoveType, row.cMoveType)?.toLowerCase()}-ic`)}>
              {getKeyEnum(MoveType, row.cMoveType)}
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
    selector: (row) => toFloatWithPadding(row.dps, 3),
    sortable: true,
    sortFunction: numSortDps,
    minWidth: '80px',
  },
  {
    name: 'TDO',
    selector: (row) => toFloatWithPadding(row.tdo, 3),
    sortable: true,
    sortFunction: numSortTdo,
    minWidth: '100px',
  },
  {
    name: 'DPS^3*TDO',
    selector: (row) => toFloatWithPadding(row.multiDpsTdo, 3),
    sortable: true,
    sortFunction: numSortMulti,
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
  const [searchTerm, setSearchTerm] = useState('');

  const [dataTargetPokemon, setDataTargetPokemon] = useState<IPokemonData | undefined>(optionStore?.dpsSheet?.dataTargetPokemon);
  const [fMoveTargetPokemon, setFMoveTargetPokemon] = useState<ISelectMoveModel | undefined>(optionStore?.dpsSheet?.fMoveTargetPokemon);
  const [cMoveTargetPokemon, setCMoveTargetPokemon] = useState<ISelectMoveModel | undefined>(optionStore?.dpsSheet?.cMoveTargetPokemon);

  const [defaultPage, setDefaultPage] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultPage ? optionStore.dpsSheet.defaultPage : DEFAULT_SHEET_PAGE
  );
  const [defaultRowPerPage, setDefaultRowPerPage] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultRowPerPage ? optionStore.dpsSheet.defaultRowPerPage : DEFAULT_SHEET_ROW
  );
  const [defaultSorted, setDefaultSorted] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultSorted ? optionStore.dpsSheet.defaultSorted : new OptionDPSSort()
  );

  const [filters, setFilters] = useState(optionStore?.dpsSheet?.filters ?? new OptionFiltersDPS());

  const {
    isMatch,
    showSpecialMove,
    showShadow,
    enableShadow,
    showMega,
    showGMax,
    showPrimal,
    showLegendary,
    showMythic,
    showUltraBeast,
    enableSpecial,
    enableMega,
    enableBest,
    enableDelay,
    enableGMax,
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
  const { weatherBoosts, isTrainerFriend, pokemonFriendLevel, pokemonDefObj } = options;

  const [showSpinner, setShowSpinner] = useState(false);
  const [selectTypes, setSelectTypes] = useState(getValueOrDefault(Array, optionStore?.dpsSheet?.selectTypes));

  const addCPokeData = (
    dataList: PokemonSheetData[],
    movePoke: string[] | undefined,
    pokemon: IPokemonData,
    vf: string,
    fMoveType: MoveType,
    pokemonType = PokemonType.Normal
  ) => {
    movePoke?.forEach((vc: string) => {
      const fMove = data.combat.find((item) => isEqual(item.name, vf));
      const cMove = data.combat.find((item) => isEqual(item.name, vc));

      if (fMove && cMove) {
        const cMoveType = getMoveType(pokemon, vc);
        const stats = calculateStatsByTag(pokemon, pokemon.baseStats, pokemon.slug);
        const statsAttacker = new BattleCalculate({
          atk: calculateStatsBattle(stats.atk, ivAtk, pokemonLevel),
          def: calculateStatsBattle(stats.def, ivDef, pokemonLevel),
          hp: calculateStatsBattle(stats.sta, ivHp, pokemonLevel),
          fMove,
          cMove,
          types: pokemon.types,
          pokemonType,
          weatherBoosts: options.weatherBoosts,
          isPokemonFriend: options.isTrainerFriend,
          pokemonFriendLevel: options.pokemonFriendLevel,
        });

        let dps = 0;
        let tdo = 0;
        if (dataTargetPokemon && fMoveTargetPokemon && cMoveTargetPokemon) {
          const statsDef = calculateStatsByTag(dataTargetPokemon, dataTargetPokemon.baseStats, dataTargetPokemon.slug);
          const statsDefender = new BattleCalculate({
            atk: calculateStatsBattle(statsDef.atk, ivAtk, pokemonLevel),
            def: calculateStatsBattle(statsDef.def, ivDef, pokemonLevel),
            hp: calculateStatsBattle(statsDef.sta, ivHp, pokemonLevel),
            fMove: data.combat.find((item) => isEqual(item.name, fMoveTargetPokemon.name)),
            cMove: data.combat.find((item) => isEqual(item.name, cMoveTargetPokemon.name)),
            types: dataTargetPokemon.types,
            weatherBoosts: options.weatherBoosts,
          });

          const dpsDef = calculateBattleDPSDefender(data.options, data.typeEff, data.weatherBoost, statsAttacker, statsDefender);
          dps = calculateBattleDPS(data.options, data.typeEff, data.weatherBoost, statsAttacker, statsDefender, dpsDef);
          tdo = dps * TimeToKill(Math.floor(toNumber(statsAttacker.hp)), dpsDef);
        } else {
          dps = calculateAvgDPS(
            data.options,
            data.typeEff,
            data.weatherBoost,
            statsAttacker.fMove,
            statsAttacker.cMove,
            statsAttacker.atk,
            statsAttacker.def,
            statsAttacker.hp,
            statsAttacker.types,
            statsAttacker.pokemonType,
            options
          );
          tdo = calculateTDO(data.options, statsAttacker.def, toNumber(statsAttacker.hp), dps, statsAttacker.pokemonType);
        }
        dataList.push({
          pokemon,
          fMove: statsAttacker.fMove,
          cMove: statsAttacker.cMove,
          dps,
          tdo,
          multiDpsTdo: Math.pow(dps, 3) * tdo,
          cMoveType,
          fMoveType,
          pokemonType,
          cp: calculateCP(stats.atk + ivAtk, stats.def + ivDef, toNumber(stats.sta) + ivHp, pokemonLevel),
        });
      }
    });
  };

  const addFPokeData = (dataList: PokemonSheetData[], pokemon: IPokemonData, movePoke: string[] | undefined) => {
    movePoke?.forEach((vf) => {
      const fMoveType = getMoveType(pokemon, vf);
      addCPokeData(dataList, pokemon.cinematicMoves, pokemon, vf, fMoveType);
      if (!pokemon.forme || pokemon.hasShadowForm) {
        if (isNotEmpty(pokemon.shadowMoves)) {
          addCPokeData(dataList, pokemon.cinematicMoves, pokemon, vf, fMoveType, PokemonType.Shadow);
        }
        addCPokeData(dataList, pokemon.shadowMoves, pokemon, vf, fMoveType, PokemonType.Shadow);
        addCPokeData(dataList, pokemon.purifiedMoves, pokemon, vf, fMoveType, PokemonType.Purified);
      }
      if (
        (!pokemon.forme || (pokemon.pokemonType !== PokemonType.Mega && pokemon.pokemonType !== PokemonType.Primal)) &&
        isNotEmpty(pokemon.shadowMoves)
      ) {
        addCPokeData(dataList, pokemon.eliteCinematicMoves, pokemon, vf, fMoveType, PokemonType.Shadow);
      } else {
        addCPokeData(dataList, pokemon.eliteCinematicMoves, pokemon, vf, fMoveType);
      }
      addCPokeData(dataList, pokemon.specialMoves, pokemon, vf, fMoveType);
      addCPokeData(dataList, pokemon.exclusiveMoves, pokemon, vf, fMoveType);
    });
  };

  const calculateDPSTable = () => {
    const dataList: PokemonSheetData[] = [];
    data.pokemon.forEach((pokemon) => {
      addFPokeData(dataList, pokemon, pokemon.quickMoves);
      addFPokeData(dataList, pokemon, pokemon.eliteQuickMoves);
    });
    setShowSpinner(false);
    return dataList;
  };

  const filterBestOptions = (result: PokemonSheetData[], best: BestOptionType) => {
    let bestType = getPropertyName(result?.[0], (r) => r.multiDpsTdo) as 'multiDpsTdo' | 'dps' | 'tdo';
    if (best === BestOptionType.dps) {
      bestType = getPropertyName(result?.[0], (r) => r.dps) as 'dps';
    } else if (best === BestOptionType.tdo) {
      bestType = getPropertyName(result?.[0], (r) => r.tdo) as 'tdo';
    }
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
        (isMatch
          ? isEqual(item.pokemon.name.replaceAll('-', ' '), searchTerm, EqualMode.IgnoreCaseSensitive) ||
            isEqual(item.pokemon.num, searchTerm)
          : isInclude(item.pokemon.name.replaceAll('-', ' '), searchTerm, IncludeMode.IncludeIgnoreCaseSensitive) ||
            isInclude(item.pokemon.num, searchTerm));

      const boolShowShadow = !showShadow && item.pokemonType === PokemonType.Shadow;
      const boolShowElite = !showSpecialMove && (item.fMoveType !== MoveType.None || item.cMoveType !== MoveType.None);
      const boolShowMega = !showMega && item.pokemon.pokemonType === PokemonType.Mega;
      const boolShowGMax = !showGMax && item.pokemon.pokemonType === PokemonType.GMax;
      const boolShowPrimal = !showPrimal && item.pokemon.pokemonType === PokemonType.Primal;
      const boolShowLegend = !showLegendary && item.pokemon.pokemonClass === PokemonClass.Legendary;
      const boolShowMythic = !showMythic && item.pokemon.pokemonClass === PokemonClass.Mythic;
      const boolShowUltra = !showUltraBeast && item.pokemon.pokemonClass === PokemonClass.UltraBeast;

      const boolOnlyShadow = enableShadow && item.pokemonType === PokemonType.Shadow;
      const boolOnlyElite = enableSpecial && (item.fMoveType !== MoveType.None || item.cMoveType !== MoveType.None);
      const boolOnlyMega = enableMega && item.pokemon.pokemonType === PokemonType.Mega;
      const boolOnlyGMax = enableGMax && item.pokemon.pokemonType === PokemonType.GMax;
      const boolOnlyPrimal = enablePrimal && item.pokemon.pokemonType === PokemonType.Primal;
      const boolOnlyLegend = enableLegendary && item.pokemon.pokemonClass === PokemonClass.Legendary;
      const boolOnlyMythic = enableMythic && item.pokemon.pokemonClass === PokemonClass.Mythic;
      const boolOnlyUltra = enableUltraBeast && item.pokemon.pokemonClass === PokemonClass.UltraBeast;

      let boolReleaseGO = true;
      if (releasedGO) {
        const result = checkPokemonGO(
          item.pokemon.num,
          getValueOrDefault(String, item.pokemon.fullName, item.pokemon.pokemonId),
          data.pokemon
        );
        boolReleaseGO = getValueOrDefault(Boolean, item.pokemon.releasedGO, result?.releasedGO);
      }
      if (
        enableShadow ||
        enableSpecial ||
        enableMega ||
        enableGMax ||
        enablePrimal ||
        enableLegendary ||
        enableMythic ||
        enableUltraBeast
      ) {
        return (
          boolFilterType &&
          boolFilterPoke &&
          boolReleaseGO &&
          !(
            boolShowShadow ||
            boolShowElite ||
            boolShowMega ||
            boolShowGMax ||
            boolShowPrimal ||
            boolShowLegend ||
            boolShowMythic ||
            boolShowUltra
          ) &&
          boolReleaseGO &&
          (boolOnlyShadow ||
            boolOnlyElite ||
            boolOnlyMega ||
            boolOnlyGMax ||
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
            boolShowGMax ||
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
    if (data.typeEff) {
      setTypes(Object.keys(data.typeEff));
    }
  }, [data.typeEff]);

  useEffect(() => {
    if (isNotEmpty(data.pokemon) && isNotEmpty(data.combat)) {
      setShowSpinner(true);
      const timeOutId = setTimeout(() => {
        setDpsTable(calculateDPSTable());
      }, 300);
      return () => clearTimeout(timeOutId);
    }
  }, [dataTargetPokemon, fMoveTargetPokemon, cMoveTargetPokemon, data.pokemon, data.combat, data.options, data.typeEff, data.weatherBoost]);

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
    isMatch,
    selectTypes,
    showShadow,
    showSpecialMove,
    showMega,
    showGMax,
    showPrimal,
    showLegendary,
    showMythic,
    showUltraBeast,
    enableSpecial,
    enableShadow,
    enableMega,
    enableGMax,
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
                <TypeInfo isBlock={true} arr={[item]} />
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
                    control={<Checkbox checked={isMatch} onChange={(_, check) => setFilters({ ...filters, isMatch: check })} />}
                    label="Match Pokémon"
                  />
                </div>
              </div>
            </div>
            <div className="input-group">
              <span className="input-group-text">Filter show</span>
              <FormControlLabel
                control={<Checkbox checked={showShadow} onChange={(_, check) => setFilters({ ...filters, showShadow: check })} />}
                label={getKeyEnum(PokemonType, PokemonType.Shadow)}
              />
              <FormControlLabel
                control={<Checkbox checked={showMega} onChange={(_, check) => setFilters({ ...filters, showMega: check })} />}
                label={getKeyEnum(PokemonType, PokemonType.Mega)}
              />
              <FormControlLabel
                control={<Checkbox checked={showGMax} onChange={(_, check) => setFilters({ ...filters, showGMax: check })} />}
                label={getKeyEnum(PokemonType, PokemonType.GMax)}
              />
              <FormControlLabel
                control={<Checkbox checked={showPrimal} onChange={(_, check) => setFilters({ ...filters, showPrimal: check })} />}
                label={getKeyEnum(PokemonType, PokemonType.Primal)}
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
                control={<Checkbox checked={showSpecialMove} onChange={(_, check) => setFilters({ ...filters, showSpecialMove: check })} />}
                label="Special Moves"
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
                label={getKeyEnum(PokemonType, PokemonType.Shadow)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableMega}
                    disabled={!showMega}
                    onChange={(_, check) => setFilters({ ...filters, enableMega: check })}
                  />
                }
                label={getKeyEnum(PokemonType, PokemonType.Mega)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableGMax}
                    disabled={!showGMax}
                    onChange={(_, check) => setFilters({ ...filters, enableGMax: check })}
                  />
                }
                label={getKeyEnum(PokemonType, PokemonType.GMax)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enablePrimal}
                    disabled={!showPrimal}
                    onChange={(_, check) => setFilters({ ...filters, enablePrimal: check })}
                  />
                }
                label={getKeyEnum(PokemonType, PokemonType.Primal)}
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
                    checked={enableSpecial}
                    disabled={!showSpecialMove}
                    onChange={(_, check) => setFilters({ ...filters, enableSpecial: check })}
                  />
                }
                label="Special Moves"
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
                      isSelected={true}
                      setCurrentPokemon={setDataTargetPokemon}
                      setFMovePokemon={setFMoveTargetPokemon}
                      setCMovePokemon={setCMoveTargetPokemon}
                      isDisable={showSpinner}
                      position={SelectPosition.Up}
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
                      moveType={TypeMove.Fast}
                      isDisable={showSpinner}
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
                      moveType={TypeMove.Charge}
                      isDisable={showSpinner}
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
                          cTime: toNumber(options.delay?.cTime),
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
                          fTime: toNumber(options.delay?.fTime),
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
                    disabled={Boolean(dataTargetPokemon)}
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
                          onChange={(_, check) => {
                            setOptions(
                              OptionOtherDPS.create({
                                ...options,
                                isTrainerFriend: check,
                                pokemonFriendLevel: 0,
                              })
                            );
                          }}
                        />
                      }
                      label="Friendship Level:"
                    />
                    <LevelRating
                      disabled={!isTrainerFriend}
                      onChange={(_, value) => {
                        setOptions(
                          OptionOtherDPS.create({
                            ...options,
                            pokemonFriendLevel: toNumber(value),
                          })
                        );
                      }}
                      max={4}
                      size="large"
                      value={toNumber(pokemonFriendLevel)}
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
                selectedColumn: toNumber(selectedColumn.id, 1),
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
