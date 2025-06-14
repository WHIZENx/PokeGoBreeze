import React, { useEffect, useState } from 'react';

import {
  LevelRating,
  splitAndCapitalize,
  capitalize,
  checkPokemonGO,
  getKeyWithData,
  getMoveType,
  generateParamForm,
  getKeysObj,
  getAllMoves,
  isSpecialMegaFormType,
} from '../../../util/utils';
import { DEFAULT_SHEET_PAGE, DEFAULT_SHEET_ROW, levelList, MAX_IV, MIN_IV, MIN_LEVEL } from '../../../util/constants';
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

import APIService from '../../../services/API.service';

import TypeInfo from '../../../components/Sprites/Type/Type';
import { Checkbox, FormControlLabel, Switch } from '@mui/material';
import { Box } from '@mui/system';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

import './DpsTdo.scss';
import { Form } from 'react-bootstrap';
import SelectPokemon from '../../../components/Input/SelectPokemon';
import SelectMove from '../../../components/Input/SelectMove';
import { useDispatch, useSelector } from 'react-redux';
import { Action } from 'history';
import { ColumnType, MoveType, PokemonClass, PokemonType, TypeMove } from '../../../enums/type.enum';
import { OptionsSheetState, RouterState, StoreState } from '../../../store/models/state.model';
import { ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { ISelectMoveModel, SelectMovePokemonModel } from '../../../components/Input/models/select-move.model';
import { Delay, OptionDPSSort, OptionFiltersDPS, OptionOtherDPS } from '../../../store/models/options.model';
import { BattleCalculate } from '../../../util/models/calculate.model';
import { useTitle } from '../../../util/hooks/useTitle';
import { BestOptionType, SortDirectionType } from './enums/column-select-type.enum';
import { OptionsActions } from '../../../store/actions';
import { SortOrderType, TableColumnModify } from '../../../util/models/overrides/data-table.model';
import {
  combineClasses,
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
import { InputType } from '../../../components/Input/enums/input-type.enum';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import Loading from '../../../components/Sprites/Loading/Loading';
import { TypeEff } from '../../../core/models/type-eff.model';
import { LinkToTop } from '../../../util/hooks/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import IconType from '../../../components/Sprites/Icon/Type/Type';
import { debounce } from 'lodash';
import CustomDataTable from '../../../components/Table/CustomDataTable/CustomDataTable';

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
    id: ColumnType.Id,
    name: 'ID',
    selector: (row) => row.pokemon.num,
    sortable: true,
    minWidth: '60px',
    maxWidth: '120px',
  },
  {
    id: ColumnType.Name,
    name: 'Pokémon Name',
    selector: (row) => (
      <LinkToTop
        to={`/pokemon/${row.pokemon.num}${generateParamForm(row.pokemon.form, row.pokemonType)}`}
        title={`#${row.pokemon.num} ${splitAndCapitalize(row.pokemon.name, '-', ' ')}`}
      >
        <PokemonIconType pokemonType={row.pokemonType} size={25}>
          <img
            height={48}
            alt="Pokémon Image"
            className="me-2"
            src={APIService.getPokeIconSprite(row.pokemon.sprite, false)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = APIService.getPokeIconSprite(row.pokemon.baseSpecies);
            }}
          />
        </PokemonIconType>
        {splitAndCapitalize(row.pokemon.name, '-', ' ')}
      </LinkToTop>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    id: ColumnType.Type,
    name: 'Type(s)',
    selector: (row) =>
      row.pokemon.types.map((value, index) => (
        <IconType
          key={index}
          width={25}
          height={25}
          className="me-2"
          alt="Pokémon GO Type Logo"
          title={capitalize(value)}
          type={value}
        />
      )),
    width: '140px',
  },
  {
    id: ColumnType.FastMove,
    name: 'Fast Move',
    selector: (row) => (
      <LinkToTop
        className="d-flex align-items-center"
        to={`/move/${row.fMove?.id}`}
        title={`${splitAndCapitalize(row.fMove?.name, '_', ' ')}`}
      >
        <IconType width={25} height={25} className="me-2" alt="Pokémon GO Type Logo" type={row.fMove?.type} />
        <div>
          <span className="text-b-ic">{` ${splitAndCapitalize(row.fMove?.name, '_', ' ')}`}</span>
          {row.fMoveType !== MoveType.None && (
            <span
              className={combineClasses(
                'type-icon-small ic',
                `${getKeyWithData(MoveType, row.fMoveType)?.toLowerCase()}-ic`
              )}
            >
              {getKeyWithData(MoveType, row.fMoveType)}
            </span>
          )}
        </div>
      </LinkToTop>
    ),
    sortable: true,
    minWidth: '210px',
    sortFunction: fMoveSort,
  },
  {
    id: ColumnType.ChargedMove,
    name: 'Charged Move',
    selector: (row) => (
      <LinkToTop
        className="d-flex align-items-center"
        to={`/move/${row.cMove?.id}`}
        title={`${splitAndCapitalize(row.cMove?.name, '_', ' ')}`}
      >
        <IconType width={25} height={25} className="me-2" alt="Pokémon GO Type Logo" type={row.cMove?.type} />
        <div>
          <span className="text-b-ic">{` ${splitAndCapitalize(row.cMove?.name, '_', ' ')}`}</span>
          {row.cMoveType !== MoveType.None && (
            <span
              className={combineClasses(
                'type-icon-small ic',
                `${getKeyWithData(MoveType, row.cMoveType)?.toLowerCase()}-ic`
              )}
            >
              {getKeyWithData(MoveType, row.cMoveType)}
            </span>
          )}
        </div>
      </LinkToTop>
    ),
    sortable: true,
    minWidth: '240px',
    sortFunction: cMoveSort,
  },
  {
    id: ColumnType.DPS,
    name: 'DPS',
    selector: (row) => toFloatWithPadding(row.dps, 3),
    sortable: true,
    sortFunction: numSortDps,
    minWidth: '80px',
  },
  {
    id: ColumnType.TDO,
    name: 'TDO',
    selector: (row) => toFloatWithPadding(row.tdo, 3),
    sortable: true,
    sortFunction: numSortTdo,
    minWidth: '100px',
  },
  {
    id: ColumnType.Total,
    name: 'DPS^3*TDO',
    selector: (row) => toFloatWithPadding(row.multiDpsTdo, 3),
    sortable: true,
    sortFunction: numSortMulti,
    minWidth: '140px',
  },
  {
    id: ColumnType.CP,
    name: 'CP',
    selector: (row) => row.cp,
    sortable: true,
    minWidth: '100px',
  },
];

const DpsTdo = () => {
  useTitle({
    title: 'PokéGO Breeze - DPS&TDO Sheets',
    description:
      'Analyze Pokémon GO DPS (Damage Per Second) and TDO (Total Damage Output) with our comprehensive sheets. Optimize your raid counters and battle teams.',
    keywords: ['DPS TDO calculator', 'Pokémon GO damage', 'raid counters', 'best attackers', 'Pokémon battle damage'],
  });
  const dispatch = useDispatch();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const optionStore = useSelector((state: OptionsSheetState) => state.options);
  const router = useSelector((state: RouterState) => state.router);

  const [types, setTypes] = useState(getKeysObj(new TypeEff()));

  const [dpsTable, setDpsTable] = useState<PokemonSheetData[]>([]);
  const [dataFilter, setDataFilter] = useState<PokemonSheetData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [dataTargetPokemon, setDataTargetPokemon] = useState<IPokemonData | undefined>(
    optionStore?.dpsSheet?.dataTargetPokemon
  );
  const [fMoveTargetPokemon, setFMoveTargetPokemon] = useState<ISelectMoveModel | undefined>(
    optionStore?.dpsSheet?.fMoveTargetPokemon
  );
  const [cMoveTargetPokemon, setCMoveTargetPokemon] = useState<ISelectMoveModel | undefined>(
    optionStore?.dpsSheet?.cMoveTargetPokemon
  );

  const [defaultPage, setDefaultPage] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultPage
      ? optionStore.dpsSheet.defaultPage
      : DEFAULT_SHEET_PAGE
  );
  const [defaultRowPerPage, setDefaultRowPerPage] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultRowPerPage
      ? optionStore.dpsSheet.defaultRowPerPage
      : DEFAULT_SHEET_ROW
  );
  const [defaultSorted, setDefaultSorted] = useState(
    router.action === Action.Pop && optionStore?.dpsSheet?.defaultSorted
      ? optionStore.dpsSheet.defaultSorted
      : new OptionDPSSort()
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

  const [isShowSpinner, setIsShowSpinner] = useState(false);
  const [selectTypes, setSelectTypes] = useState(getValueOrDefault(Array, optionStore?.dpsSheet?.selectTypes));

  const addCPokeData = (
    dataList: PokemonSheetData[],
    movePoke: string[] | undefined,
    pokemon: IPokemonData,
    fMove: ICombat,
    fMoveType: MoveType,
    pokemonType = PokemonType.Normal
  ) => {
    movePoke?.forEach((vc: string) => {
      const cMove = data.combats.find((item) => isEqual(item.name, vc));

      if (cMove) {
        const cMoveType = getMoveType(pokemon, vc);
        if (!isEqual(cMoveType, MoveType.Dynamax)) {
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
            const statsDef = calculateStatsByTag(
              dataTargetPokemon,
              dataTargetPokemon.baseStats,
              dataTargetPokemon.slug
            );
            const statsDefender = new BattleCalculate({
              atk: calculateStatsBattle(statsDef.atk, ivAtk, pokemonLevel),
              def: calculateStatsBattle(statsDef.def, ivDef, pokemonLevel),
              hp: calculateStatsBattle(statsDef.sta, ivHp, pokemonLevel),
              fMove: data.combats.find((item) => isEqual(item.name, fMoveTargetPokemon.name)),
              cMove: data.combats.find((item) => isEqual(item.name, cMoveTargetPokemon.name)),
              types: dataTargetPokemon.types,
              weatherBoosts: options.weatherBoosts,
            });

            const dpsDef = calculateBattleDPSDefender(
              data.options,
              data.typeEff,
              data.weatherBoost,
              statsAttacker,
              statsDefender
            );
            dps = calculateBattleDPS(
              data.options,
              data.typeEff,
              data.weatherBoost,
              statsAttacker,
              statsDefender,
              dpsDef
            );
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
            tdo = calculateTDO(
              data.options,
              statsAttacker.def,
              toNumber(statsAttacker.hp),
              dps,
              statsAttacker.pokemonType
            );
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
            cp: calculateCP(stats.atk + ivAtk, stats.def + ivDef, stats.sta + ivHp, pokemonLevel),
          });
        }
      }
    });
  };

  const addFPokeData = (dataList: PokemonSheetData[], pokemon: IPokemonData, movePoke: string[]) => {
    movePoke.forEach((vf) => {
      const fMove = data.combats.find((item) => isEqual(item.name, vf));
      if (!fMove) {
        return;
      }
      const fMoveType = getMoveType(pokemon, vf);
      addCPokeData(dataList, pokemon.cinematicMoves, pokemon, fMove, fMoveType);
      if (!pokemon.form || pokemon.hasShadowForm) {
        if (isNotEmpty(pokemon.shadowMoves)) {
          addCPokeData(dataList, pokemon.cinematicMoves, pokemon, fMove, fMoveType, PokemonType.Shadow);
        }
        addCPokeData(dataList, pokemon.shadowMoves, pokemon, fMove, fMoveType, PokemonType.Shadow);
        addCPokeData(dataList, pokemon.purifiedMoves, pokemon, fMove, fMoveType, PokemonType.Purified);
      }
      if ((!pokemon.form || !isSpecialMegaFormType(pokemon.pokemonType)) && isNotEmpty(pokemon.shadowMoves)) {
        addCPokeData(dataList, pokemon.eliteCinematicMoves, pokemon, fMove, fMoveType, PokemonType.Shadow);
      }
      addCPokeData(dataList, pokemon.eliteCinematicMoves, pokemon, fMove, fMoveType);
      addCPokeData(dataList, pokemon.specialMoves, pokemon, fMove, fMoveType);
      addCPokeData(dataList, pokemon.exclusiveMoves, pokemon, fMove, fMoveType);
    });
  };

  const calculateDPSTable = () => {
    const dataList: PokemonSheetData[] = [];
    data.pokemons.forEach((pokemon) => {
      addFPokeData(dataList, pokemon, getAllMoves(pokemon, TypeMove.Fast));
    });
    setIsShowSpinner(false);
    return dataList;
  };

  const filterBestOptions = (result: PokemonSheetData[], best: BestOptionType) => {
    const bestType = getPropertyName<PokemonSheetData, 'multiDpsTdo' | 'dps' | 'tdo'>(result[0], (r) =>
      best === BestOptionType.dps ? r.dps : best === BestOptionType.tdo ? r.tdo : r.multiDpsTdo
    );
    const group = result.reduce((res, obj) => {
      (res[obj.pokemon.name] = getValueOrDefault(Array, res[obj.pokemon.name])).push(obj);
      return res;
    }, new Object() as DynamicObj<PokemonSheetData[]>);
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
        const isReleasedGO = checkPokemonGO(
          item.pokemon.num,
          getValueOrDefault(String, item.pokemon.fullName, item.pokemon.pokemonId),
          data.pokemons
        );
        boolReleaseGO = getValueOrDefault(Boolean, item.pokemon.releasedGO, isReleasedGO);
      }
      const isEnableOptions =
        enableShadow ||
        enableSpecial ||
        enableMega ||
        enableGMax ||
        enablePrimal ||
        enableLegendary ||
        enableMythic ||
        enableUltraBeast;
      const isShowOptions =
        boolShowShadow ||
        boolShowElite ||
        boolShowMega ||
        boolShowGMax ||
        boolShowPrimal ||
        boolShowLegend ||
        boolShowMythic ||
        boolShowUltra;
      const isOnlyOptions =
        boolOnlyShadow ||
        boolOnlyElite ||
        boolOnlyMega ||
        boolOnlyGMax ||
        boolOnlyPrimal ||
        boolOnlyLegend ||
        boolOnlyMythic ||
        boolOnlyUltra;
      return (
        boolFilterType &&
        boolFilterPoke &&
        boolReleaseGO &&
        !isShowOptions &&
        (!isEnableOptions || (boolReleaseGO && isOnlyOptions))
      );
    });
    if (isNotEmpty(result) && enableBest) {
      result = filterBestOptions(result, bestOf);
    }
    setIsShowSpinner(false);
    return result;
  };

  useEffect(() => {
    if (data.typeEff) {
      setTypes(Object.keys(data.typeEff));
    }
  }, [data.typeEff]);

  useEffect(() => {
    if (isNotEmpty(data.pokemons) && isNotEmpty(data.combats)) {
      setIsShowSpinner(true);
      const debounced = debounce(() => {
        setDpsTable(calculateDPSTable());
      }, 300);
      debounced();
      return () => {
        debounced.cancel();
      };
    }
  }, [
    dataTargetPokemon,
    fMoveTargetPokemon,
    cMoveTargetPokemon,
    data.pokemons,
    data.combats,
    data.options,
    data.typeEff,
    data.weatherBoost,
  ]);

  useEffect(() => {
    if (isNotEmpty(dpsTable)) {
      setIsShowSpinner(true);
      const debounced = debounce(() => {
        setDataFilter(searchFilter());
      }, 500);
      debounced();
      return () => {
        debounced.cancel();
      };
    }
  }, [dpsTable, searchTerm]);

  useEffect(() => {
    if (isNotEmpty(dpsTable)) {
      setIsShowSpinner(true);
      const debounced = debounce(() => {
        setDataFilter(searchFilter());
      }, 100);
      debounced();
      return () => {
        debounced.cancel();
      };
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
    setIsShowSpinner(true);
    setTimeout(() => {
      setDpsTable(calculateDPSTable());
    }, 300);
  };

  return (
    <div className="position-relative">
      {!isNotEmpty(dpsTable) && (
        <div className="ph-item w-100 h-100 position-absolute z-2 bg-transparent">
          <div className="ph-picture ph-col-3 w-100 h-100 theme-spinner m-0 p-0" />
        </div>
      )}
      <div className="text-center w-100">
        <div className="head-types">Filter Moves By Types</div>
        <div className="row w-100 m-0 types-select-btn">
          {types.map((item, index) => (
            <div key={index} className="col img-group m-0 p-0">
              <button
                value={item}
                onClick={() => addTypeArr(item)}
                className={combineClasses(
                  'btn-select-type w-100 p-2',
                  isIncludeList(selectTypes, item) ? 'select-type' : ''
                )}
              >
                <TypeInfo isBlock arr={[item]} />
              </button>
            </div>
          ))}
        </div>
        <div className="row w-100 m-0">
          <div className="col-xxl p-0 w-fit-content">
            <div>
              <div className="row w-100 m-0">
                <div className="d-flex col-md-9 p-0">
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
                    control={
                      <Checkbox checked={isMatch} onChange={(_, check) => setFilters({ ...filters, isMatch: check })} />
                    }
                    label="Match Pokémon"
                  />
                </div>
              </div>
            </div>
            <div className="input-group">
              <span className="input-group-text">Filter show</span>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showShadow}
                    onChange={(_, check) =>
                      setFilters({
                        ...filters,
                        showShadow: check,
                        enableShadow: check === false ? check : filters.enableShadow,
                      })
                    }
                  />
                }
                label={getKeyWithData(PokemonType, PokemonType.Shadow)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showMega}
                    onChange={(_, check) =>
                      setFilters({
                        ...filters,
                        showMega: check,
                        enableMega: check === false ? check : filters.enableMega,
                      })
                    }
                  />
                }
                label={getKeyWithData(PokemonType, PokemonType.Mega)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showGMax}
                    onChange={(_, check) =>
                      setFilters({
                        ...filters,
                        showGMax: check,
                        enableGMax: check === false ? check : filters.enableGMax,
                      })
                    }
                  />
                }
                label={getKeyWithData(PokemonType, PokemonType.GMax)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showPrimal}
                    onChange={(_, check) =>
                      setFilters({
                        ...filters,
                        showPrimal: check,
                        enablePrimal: check === false ? check : filters.enablePrimal,
                      })
                    }
                  />
                }
                label={getKeyWithData(PokemonType, PokemonType.Primal)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showLegendary}
                    onChange={(_, check) =>
                      setFilters({
                        ...filters,
                        showLegendary: check,
                        enableLegendary: check === false ? check : filters.enableLegendary,
                      })
                    }
                  />
                }
                label={getKeyWithData(PokemonClass, PokemonClass.Legendary)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showMythic}
                    onChange={(_, check) =>
                      setFilters({
                        ...filters,
                        showMythic: check,
                        enableMythic: check === false ? check : filters.enableMythic,
                      })
                    }
                  />
                }
                label={getKeyWithData(PokemonClass, PokemonClass.Mythic)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showUltraBeast}
                    onChange={(_, check) =>
                      setFilters({
                        ...filters,
                        showUltraBeast: check,
                        enableUltraBeast: check === false ? check : filters.enableUltraBeast,
                      })
                    }
                  />
                }
                label="Ultra Beast"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showSpecialMove}
                    onChange={(_, check) =>
                      setFilters({
                        ...filters,
                        showSpecialMove: check,
                        enableSpecial: check === false ? check : filters.enableSpecial,
                      })
                    }
                  />
                }
                label="Special Moves"
              />
            </div>
            <div className="input-group">
              <span className="input-group-text">Filter only by</span>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableShadow}
                    disabled={!showShadow}
                    onChange={(_, check) => setFilters({ ...filters, enableShadow: check })}
                  />
                }
                label={getKeyWithData(PokemonType, PokemonType.Shadow)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableMega}
                    disabled={!showMega}
                    onChange={(_, check) => setFilters({ ...filters, enableMega: check })}
                  />
                }
                label={getKeyWithData(PokemonType, PokemonType.Mega)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableGMax}
                    disabled={!showGMax}
                    onChange={(_, check) => setFilters({ ...filters, enableGMax: check })}
                  />
                }
                label={getKeyWithData(PokemonType, PokemonType.GMax)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enablePrimal}
                    disabled={!showPrimal}
                    onChange={(_, check) => setFilters({ ...filters, enablePrimal: check })}
                  />
                }
                label={getKeyWithData(PokemonType, PokemonType.Primal)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableLegendary}
                    disabled={!showLegendary}
                    onChange={(_, check) => setFilters({ ...filters, enableLegendary: check })}
                  />
                }
                label={getKeyWithData(PokemonClass, PokemonClass.Legendary)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableMythic}
                    disabled={!showMythic}
                    onChange={(_, check) => setFilters({ ...filters, enableMythic: check })}
                  />
                }
                label={getKeyWithData(PokemonClass, PokemonClass.Mythic)}
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
              <div className="row w-100 m-0">
                <Box className="col-xxl-8 p-0">
                  <div className="input-group">
                    <span className="input-group-text">Filter best move sets</span>
                    <FormControlLabel
                      className="me-0 pe-3"
                      control={
                        <Switch
                          checked={enableBest}
                          onChange={(_, check) => setFilters({ ...filters, enableBest: check })}
                        />
                      }
                      label="Best move set of"
                    />
                    <Form.Select
                      className="form-control rounded-0"
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
                      control={
                        <Switch
                          checked={releasedGO}
                          onChange={(_, check) => setFilters({ ...filters, releasedGO: check })}
                        />
                      }
                      label={
                        <span className="d-flex align-items-center">
                          Released in GO
                          <img
                            className={combineClasses('ms-1', releasedGO ? '' : 'filter-gray')}
                            width={28}
                            height={28}
                            alt="Pokémon GO Icon"
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
              <div className="row w-100 m-0">
                <Box className="col-xl-4 p-0">
                  <div className="input-group h-100">
                    <span className="input-group-text">Defender</span>
                    <SelectPokemon
                      pokemon={dataTargetPokemon}
                      isSelected
                      setCurrentPokemon={setDataTargetPokemon}
                      setFMovePokemon={setFMoveTargetPokemon}
                      setCMovePokemon={setCMoveTargetPokemon}
                      isDisable={isShowSpinner}
                    />
                  </div>
                </Box>
                <Box className="col-xl-4 p-0">
                  <div className="input-group h-100">
                    <span className="input-group-text">Fast Move</span>
                    <SelectMove
                      inputType={InputType.Small}
                      pokemon={
                        new SelectMovePokemonModel(
                          dataTargetPokemon?.num,
                          dataTargetPokemon?.form,
                          dataTargetPokemon?.pokemonType
                        )
                      }
                      move={fMoveTargetPokemon}
                      setMovePokemon={setFMoveTargetPokemon}
                      moveType={TypeMove.Fast}
                      isDisable={isShowSpinner}
                    />
                  </div>
                </Box>
                <Box className="col-xl-4 p-0">
                  <div className="input-group h-100">
                    <span className="input-group-text">Charged Move</span>
                    <SelectMove
                      inputType={InputType.Small}
                      pokemon={
                        new SelectMovePokemonModel(
                          dataTargetPokemon?.num,
                          dataTargetPokemon?.form,
                          dataTargetPokemon?.pokemonType
                        )
                      }
                      move={cMoveTargetPokemon}
                      setMovePokemon={setCMoveTargetPokemon}
                      moveType={TypeMove.Charge}
                      isDisable={isShowSpinner}
                    />
                  </div>
                </Box>
              </div>
            </div>
          </div>
          <div className="col-xxl p-0 w-fit-content">
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
                  className="form-control h-6"
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
                  className="form-control rounded-0 h-6"
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
              <div className="row m-0">
                <Box className="col-5 input-group p-0">
                  <span className="input-group-text">IV ATK</span>
                  <input
                    defaultValue={ivAtk}
                    type="number"
                    className="form-control w-6"
                    placeholder={`${MIN_IV}-${MAX_IV}`}
                    min={MIN_IV}
                    max={MAX_IV}
                    required
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        ivAtk: toNumber(e.target.value),
                      })
                    }
                    name="ivAtk"
                  />
                  <span className="input-group-text">IV DEF</span>
                  <input
                    defaultValue={ivDef}
                    type="number"
                    className="form-control w-6"
                    placeholder={`${MIN_IV}-${MAX_IV}`}
                    min={MIN_IV}
                    max={MAX_IV}
                    required
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        ivDef: toNumber(e.target.value),
                      })
                    }
                    name="ivDef"
                  />
                  <span className="input-group-text">IV HP</span>
                  <input
                    defaultValue={ivHp}
                    type="number"
                    className="form-control w-6"
                    placeholder={`${MIN_IV}-${MAX_IV}`}
                    min={MIN_IV}
                    max={MAX_IV}
                    required
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        ivHp: toNumber(e.target.value),
                      })
                    }
                    name="ivHp"
                  />
                  <div className="input-group-prepend">
                    <label className="input-group-text">Levels</label>
                  </div>
                  <Form.Select
                    className="form-control rounded-0"
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
                <Box className="col-7 input-group p-0">
                  <span className="input-group-text">DEF Target</span>
                  <input
                    defaultValue={pokemonDefObj}
                    type="number"
                    className="form-control"
                    placeholder="Defense target"
                    min={1}
                    disabled={Boolean(dataTargetPokemon)}
                    required
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
                    className="form-control rounded-0"
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
                    className="d-flex align-items-center justify-content-center"
                    sx={{
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
                <button type="submit" className="btn btn-primary w-100 rounded-0">
                  Calculate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="position-relative">
        <Loading isShow={isShowSpinner} />
        <CustomDataTable
          customColumns={columns}
          data={dataFilter}
          noDataComponent={null}
          pagination
          defaultSortFieldId={defaultSorted.selectedColumn}
          defaultSortAsc={defaultSorted.sortDirection === SortDirectionType.ASC}
          highlightOnHover
          striped
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
                selectedColumn: toNumber(selectedColumn.id, ColumnType.Id),
                sortDirection: isEqual(sortDirection, SortOrderType.ASC)
                  ? SortDirectionType.ASC
                  : SortDirectionType.DESC,
              })
            );
          }}
        />
      </div>
    </div>
  );
};

export default DpsTdo;
