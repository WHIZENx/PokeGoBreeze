import React, { useEffect, useRef, useState } from 'react';

import {
  LevelRating,
  splitAndCapitalize,
  capitalize,
  getKeyWithData,
  generateParamForm,
  createDataRows,
} from '../../../utils/utils';
import { getLevelList } from '../../../utils/compute';

import APIService from '../../../services/api.service';

import { Checkbox, FormControlLabel, Skeleton, Switch } from '@mui/material';
import { Box } from '@mui/system';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

import SelectPokemon from '../../../components/Commons/Selects/SelectPokemon';
import { Action } from 'history';
import { ColumnType, MoveType, PokemonClass, PokemonType, TypeMove } from '../../../enums/type.enum';
import { ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { ISelectMoveModel, SelectMovePokemonModel } from '../../../components/Commons/Inputs/models/select-move.model';
import { Delay, OptionDPSSort, OptionFiltersDPS, OptionOtherDPS } from '../../../store/models/options.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { BestOptionType, SortDirectionType } from './enums/column-select-type.enum';
import { SortOrderType, TableColumnModify } from '../../../utils/models/overrides/data-table.model';
import {
  combineClasses,
  getValueOrDefault,
  isEqual,
  isIncludeList,
  isNotEmpty,
  toFloat,
  toFloatWithPadding,
  toNumber,
} from '../../../utils/extension';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import IconType from '../../../components/Sprites/Icon/Type/Type';
import CustomDataTable from '../../../components/Commons/Tables/CustomDataTable/CustomDataTable';
import {
  defaultSheetPage,
  defaultSheetRow,
  defaultDamageConst,
  defaultDamageMultiply,
  defaultEnergyPerHpLost,
  defaultEnemyAtkDelay,
  getWeatherTypes,
  maxIv,
  minIv,
  minLevel,
} from '../../../utils/helpers/options-context.helpers';
import useOptionStore from '../../../composables/useOptions';
import useRouter from '../../../composables/useRouter';
import InputMuiSearch from '../../../components/Commons/Inputs/InputMuiSearch';
import InputMui from '../../../components/Commons/Inputs/InputMui';
import FormControlMui from '../../../components/Commons/Forms/FormControlMui';
import InputReleased from '../../../components/Commons/Inputs/InputReleased';
import SelectMui from '../../../components/Commons/Selects/SelectMui';
import ButtonMui from '../../../components/Commons/Buttons/ButtonMui';
import ToggleType from '../../../components/Commons/Buttons/ToggleType';
import SelectCardMove from '../../../components/Commons/Selects/SelectCardMove';
import BackdropMui from '../../../components/Commons/Backdrops/BackdropMui';
import { ProcessedDataPage } from '../../../services/processed-data.service';

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

const columns = createDataRows<TableColumnModify<PokemonSheetData>>(
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
        className="tw-flex tw-items-center"
      >
        <PokemonIconType pokemonType={row.pokemonType} size={25}>
          <img
            height={48}
            alt="Pokémon Image"
            className="tw-mr-2"
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
          className="tw-mr-2"
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
        className="tw-flex tw-items-center"
        to={`/move/${row.fMove?.id}`}
        title={`${splitAndCapitalize(row.fMove?.name, '_', ' ')}`}
      >
        <IconType width={25} height={25} className="tw-mr-2" alt="Pokémon GO Type Logo" type={row.fMove?.type} />
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
        className="tw-flex tw-items-center"
        to={`/move/${row.cMove?.id}`}
        title={`${splitAndCapitalize(row.cMove?.name, '_', ' ')}`}
      >
        <IconType width={25} height={25} className="tw-mr-2" alt="Pokémon GO Type Logo" type={row.cMove?.type} />
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
  }
);

const DpsTdo = () => {
  useTitle({
    title: 'PokéGO Breeze - DPS&TDO Sheets',
    description:
      'Analyze Pokémon GO DPS (Damage Per Second) and TDO (Total Damage Output) with our comprehensive sheets. Optimize your raid counters and battle teams.',
    keywords: ['DPS TDO calculator', 'Pokémon GO damage', 'raid counters', 'best attackers', 'Pokémon battle damage'],
  });
  const { optionsDpsSheet, setDpsSheetOptions } = useOptionStore();
  const { routerAction } = useRouter();

  const [dpsTable, setDpsTable] = useState<PokemonSheetData[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [requestVersion, setRequestVersion] = useState(0);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const latestRequestRef = useRef(0);

  const [dataTargetPokemon, setDataTargetPokemon] = useState<IPokemonData | undefined>(
    optionsDpsSheet?.dataTargetPokemon
  );
  const [fMoveTargetPokemon, setFMoveTargetPokemon] = useState<ISelectMoveModel | undefined>(
    optionsDpsSheet?.fMoveTargetPokemon
  );
  const [cMoveTargetPokemon, setCMoveTargetPokemon] = useState<ISelectMoveModel | undefined>(
    optionsDpsSheet?.cMoveTargetPokemon
  );

  const [defaultPage, setDefaultPage] = useState(
    routerAction === Action.Pop && optionsDpsSheet?.defaultPage ? optionsDpsSheet.defaultPage : defaultSheetPage()
  );
  const [defaultRowPerPage, setDefaultRowPerPage] = useState(
    routerAction === Action.Pop && optionsDpsSheet?.defaultRowPerPage
      ? optionsDpsSheet.defaultRowPerPage
      : defaultSheetRow()
  );
  const [defaultSorted, setDefaultSorted] = useState(
    routerAction === Action.Pop && optionsDpsSheet?.defaultSorted ? optionsDpsSheet.defaultSorted : new OptionDPSSort()
  );

  const [filters, setFilters] = useState(optionsDpsSheet?.filters ?? new OptionFiltersDPS());

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
  const [selectTypes, setSelectTypes] = useState(getValueOrDefault(Array, optionsDpsSheet?.selectTypes));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();
    const sort =
      defaultSorted.selectedColumn === ColumnType.Id
        ? 'id'
        : defaultSorted.selectedColumn === ColumnType.Name
          ? 'name'
          : defaultSorted.selectedColumn === ColumnType.FastMove
            ? 'fast'
            : defaultSorted.selectedColumn === ColumnType.ChargedMove
              ? 'charged'
              : defaultSorted.selectedColumn === ColumnType.DPS
                ? 'dps'
                : defaultSorted.selectedColumn === ColumnType.TDO
                  ? 'tdo'
                  : defaultSorted.selectedColumn === ColumnType.CP
                    ? 'cp'
                    : 'multiDpsTdo';
    const bestBy = bestOf === BestOptionType.dps ? 'dps' : bestOf === BestOptionType.tdo ? 'tdo' : 'multiDpsTdo';
    setIsShowSpinner(true);
    APIService.getFetchUrl<ProcessedDataPage<PokemonSheetData>>(
      APIService.getDpsTdo({
        ivAtk,
        ivDef,
        ivHp,
        level: pokemonLevel,
        pokemonDefObj,
        damageMultiply: defaultDamageMultiply(),
        damageConst: defaultDamageConst(),
        energyPerHpLost: defaultEnergyPerHpLost(),
        enemyDelay: defaultEnemyAtkDelay(),
        delayF: options.delay?.fTime,
        delayC: options.delay?.cTime,
        weather: weatherBoosts,
        friend: isTrainerFriend,
        friendLevel: pokemonFriendLevel,
        targetId: dataTargetPokemon?.num,
        targetForm: dataTargetPokemon?.fullName,
        targetFast: fMoveTargetPokemon?.name,
        targetCharged: cMoveTargetPokemon?.name,
        q: debouncedSearch,
        match: isMatch,
        types: selectTypes.join(','),
        showShadow,
        showSpecial: showSpecialMove,
        showMega,
        showGMax,
        showPrimal,
        showLegendary,
        showMythic,
        showUltra: showUltraBeast,
        enableShadow,
        enableSpecial,
        enableMega,
        enableGMax,
        enablePrimal,
        enableLegendary,
        enableMythic,
        enableUltra: enableUltraBeast,
        best: enableBest,
        bestBy,
        released: releasedGO,
        sort,
        order: defaultSorted.sortDirection === SortDirectionType.ASC ? 'asc' : 'desc',
        page: defaultPage,
        limit: defaultRowPerPage,
        requestVersion,
      }),
      { signal: controller.signal }
    )
      .then(({ data }) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        setDpsTable(data.data);
        setTotalRows(data.meta.total);
      })
      .catch((error) => {
        if (requestId === latestRequestRef.current && !APIService.isCancel(error)) {
          setDpsTable([]);
          setTotalRows(0);
        }
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) {
          setIsShowSpinner(false);
        }
      });
    return () => controller.abort();
  }, [
    ivAtk,
    ivDef,
    ivHp,
    pokemonLevel,
    pokemonDefObj,
    options.delay?.fTime,
    options.delay?.cTime,
    weatherBoosts,
    isTrainerFriend,
    pokemonFriendLevel,
    dataTargetPokemon,
    fMoveTargetPokemon,
    cMoveTargetPokemon,
    debouncedSearch,
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
    enableShadow,
    enableSpecial,
    enableMega,
    enableGMax,
    enablePrimal,
    enableLegendary,
    enableMythic,
    enableUltraBeast,
    enableBest,
    bestOf,
    releasedGO,
    defaultPage,
    defaultRowPerPage,
    defaultSorted,
    requestVersion,
  ]);

  useEffect(() => {
    setDpsSheetOptions({
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
    });
  }, [
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
    setDefaultPage(1);
    setResetPaginationToggle((value) => !value);
    setRequestVersion((value) => value + 1);
  };

  return (
    <div className="tw-relative">
      <div className="tw-relative tw-text-center tw-w-full">
        {isShowSpinner && !isNotEmpty(dpsTable) && (
          <div className="slide-container !tw-p-0 !tw-w-full !tw-h-full !tw-absolute tw-z-2 !tw-bg-spinner-default">
            <Skeleton variant="rectangular" animation="wave" className="!tw-w-full !tw-h-full !tw-m-0 !tw-p-0" />
          </div>
        )}
        <div className="head-types">Filter Moves By Types</div>
        <ToggleType fullWidth value={selectTypes} onSelectType={(type) => addTypeArr(type)} />
        <div className="row tw-w-full !tw-m-0">
          <div className="2xl:tw-flex-1 !tw-p-0">
            <div>
              <div className="row tw-w-full !tw-m-0">
                <div className="tw-flex md:tw-w-3/4 !tw-p-0">
                  <InputMuiSearch
                    value={searchTerm}
                    onChange={(value) => setSearchTerm(value)}
                    placeholder="Enter Name or ID"
                    labelPrepend="Search name or ID"
                    isNoWrap
                  />
                </div>
                <div className="tw-flex md:tw-w-1/4 !tw-px-3 !tw-max-h-10">
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
            <FormControlMui
              labelPrepend="Filter best move sets"
              control={
                <Switch checked={enableBest} onChange={(_, check) => setFilters({ ...filters, enableBest: check })} />
              }
              label="Best move set of"
            >
              <SelectMui
                value={bestOf}
                disabled={!enableBest}
                onChangeSelect={(value) => setFilters({ ...filters, bestOf: toNumber(value) })}
                isNoneBorder
                menuItems={[
                  { value: BestOptionType.dps, label: 'DPS' },
                  { value: BestOptionType.tdo, label: 'TDO' },
                  { value: BestOptionType.multiDpsTdo, label: 'DPS^3*TDO' },
                ]}
              />
              <InputReleased
                releasedGO={releasedGO}
                setReleaseGO={(check) => setFilters({ ...filters, releasedGO: check })}
                isAvailable={releasedGO}
              />
            </FormControlMui>
            <div className="input-group">
              <div className="row tw-w-full !tw-m-0">
                <Box className="xl:tw-w-1/3 !tw-p-0">
                  <SelectPokemon
                    pokemon={dataTargetPokemon}
                    isSelected
                    isFit
                    setCurrentPokemon={setDataTargetPokemon}
                    setFMovePokemon={setFMoveTargetPokemon}
                    setCMovePokemon={setCMoveTargetPokemon}
                    isDisable={isShowSpinner}
                    labelPrepend="Defender"
                    isNoWrap
                  />
                </Box>
                <Box className="xl:tw-w-1/3 !tw-p-0">
                  <SelectCardMove
                    isNoWrap
                    labelPrepend="Fast Move"
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
                </Box>
                <Box className="xl:tw-w-1/3 !tw-p-0">
                  <SelectCardMove
                    isNoWrap
                    labelPrepend="Charged Move"
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
                </Box>
              </div>
            </div>
          </div>
          <div className="2xl:tw-flex-1 !tw-p-0">
            <div className="head-types">Options</div>
            <form className="tw-w-full" onSubmit={onCalculateTable.bind(this)}>
              <FormControlMui
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
              >
                <InputMui
                  labelPrepend="Fast Move Time"
                  placeholder="Delay time (sec)"
                  value={options.delay?.fTime || ''}
                  onChange={(value) =>
                    setOptions(
                      OptionOtherDPS.create({
                        ...options,
                        delay: Delay.create({
                          fTime: toFloat(value),
                          cTime: toNumber(options.delay?.cTime),
                        }),
                      })
                    )
                  }
                  inputProps={{
                    type: 'number',
                    min: 0,
                  }}
                  disabled={!enableDelay}
                  required={enableDelay}
                  fullWidth
                />
                <InputMui
                  labelPrepend="Charged Move Time"
                  placeholder="Delay time (sec)"
                  value={options.delay?.cTime || ''}
                  onChange={(value) =>
                    setOptions(
                      OptionOtherDPS.create({
                        ...options,
                        delay: Delay.create({
                          fTime: toFloat(options.delay?.fTime),
                          cTime: toFloat(value),
                        }),
                      })
                    )
                  }
                  inputProps={{
                    type: 'number',
                    min: 0,
                  }}
                  disabled={!enableDelay}
                  required={enableDelay}
                  fullWidth
                />
              </FormControlMui>
              <FormControlMui sx={{ paddingRight: '0 !important' }}>
                <InputMui
                  labelPrepend="IV ATK"
                  placeholder={`${minIv()}-${maxIv()}`}
                  value={ivAtk}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      ivAtk: toNumber(value),
                    })
                  }
                  inputProps={{
                    type: 'number',
                    min: minIv(),
                    max: maxIv(),
                  }}
                  fullWidth
                />
                <InputMui
                  labelPrepend="IV DEF"
                  placeholder={`${minIv()}-${maxIv()}`}
                  value={ivDef}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      ivDef: toNumber(value),
                    })
                  }
                  inputProps={{
                    type: 'number',
                    min: minIv(),
                    max: maxIv(),
                  }}
                  fullWidth
                />
                <InputMui
                  labelPrepend="IV HP"
                  placeholder={`${minIv()}-${maxIv()}`}
                  value={ivHp}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      ivHp: toNumber(value),
                    })
                  }
                  inputProps={{
                    type: 'number',
                    min: minIv(),
                    max: maxIv(),
                  }}
                  fullWidth
                />
                <InputMui
                  labelPrepend="Levels"
                  value={pokemonLevel}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      pokemonLevel: toFloat(value, -1, minLevel()),
                    })
                  }
                  select
                  menuItems={getLevelList().map((value) => ({
                    value,
                    label: value,
                  }))}
                  fullWidth
                />
              </FormControlMui>
              <FormControlMui sx={{ paddingRight: '0 !important' }}>
                <InputMui
                  labelPrepend="DEF Target"
                  placeholder="Defense target"
                  value={pokemonDefObj.toString()}
                  onChange={(value) =>
                    setOptions(
                      OptionOtherDPS.create({
                        ...options,
                        pokemonDefObj: toFloat(value),
                      })
                    )
                  }
                  sx={{ minWidth: 100 }}
                  inputProps={{
                    type: 'number',
                    min: 1,
                    required: true,
                    name: 'pokemonDefObj',
                  }}
                  fullWidth
                  basis={'min-content'}
                />
                <InputMui
                  labelPrepend="Weather Boosts"
                  value={getValueOrDefault(String, weatherBoosts, 'extreme')}
                  onChange={(value) =>
                    setOptions(
                      OptionOtherDPS.create({
                        ...options,
                        weatherBoosts: value,
                      })
                    )
                  }
                  select
                  menuItems={[
                    { value: 'extreme', label: 'Extreme' },
                    ...getWeatherTypes().map((value) => ({
                      value,
                      label: splitAndCapitalize(value, /(?=[A-Z])/, ' '),
                    })),
                  ]}
                  sx={{ minWidth: 150 }}
                  fullWidth
                  basis={'min-content'}
                />
                <FormControlMui
                  isNotGroup
                  boxClassName="tw-flex tw-items-center tw-flex-grow"
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
                >
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
                </FormControlMui>
              </FormControlMui>
              <ButtonMui fullWidth isNoneBorder type="submit" label="Calculate" />
            </form>
          </div>
        </div>
      </div>
      <div className="tw-relative">
        <BackdropMui open={isShowSpinner && isNotEmpty(dpsTable)} isShowOnAbove={false} />
        <CustomDataTable
          customColumns={columns}
          data={dpsTable}
          noDataComponent={<div className="tw-p-6 tw-text-center">No Pokémon match the selected filters.</div>}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationResetDefaultPage={resetPaginationToggle}
          sortServer
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
            setDefaultPage(1);
            setResetPaginationToggle((value) => !value);
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
