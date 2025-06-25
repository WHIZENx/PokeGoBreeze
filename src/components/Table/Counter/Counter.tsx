import { Checkbox, FormControlLabel, Switch } from '@mui/material';
import React, { useEffect, useState } from 'react';
import APIService from '../../../services/API.service';
import {
  checkPokemonGO,
  convertPokemonDataName,
  generateParamForm,
  getKeyWithData,
  getValidPokemonImgPath,
  isSpecialMegaFormType,
  splitAndCapitalize,
} from '../../../utils/utils';
import { findAssetForm } from '../../../utils/compute';
import { counterPokemon } from '../../../utils/calculate';

import './Counter.scss';
import { useDispatch, useSelector } from 'react-redux';
import { OptionsSheetState, StoreState } from '../../../store/models/state.model';
import { TableStyles } from 'react-data-table-component';
import { ICounterModel, OptionFiltersCounter } from './models/counter.model';
import { ICounterComponent } from '../../models/component.model';
import { ColumnType, MoveType, PokemonType } from '../../../enums/type.enum';
import { TableColumnModify } from '../../../utils/models/overrides/data-table.model';
import {
  combineClasses,
  DynamicObj,
  getValueOrDefault,
  isEqual,
  isInclude,
  isNotEmpty,
  isNullOrUndefined,
  toFloat,
  toFloatWithPadding,
  toNumber,
} from '../../../utils/extension';
import { LinkToTop } from '../../../utils/hooks/LinkToTop';
import { OptionsActions } from '../../../store/actions';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
import { FloatPaddingOption } from '../../../utils/models/extension.model';
import IconType from '../../Sprites/Icon/Type/Type';
import { debounce } from 'lodash';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import { IncludeMode } from '../../../utils/enums/string.enum';
import { IMenuItem } from '../../models/component.model';
import { counterDelay } from '../../../utils/helpers/context.helpers';

const customStyles: TableStyles = {
  head: {
    style: {
      height: '2.25rem',
    },
  },
  header: {
    style: {
      justifyContent: 'center',
      textAlign: 'center',
      padding: 0,
    },
  },
  headRow: {
    style: {
      backgroundColor: 'var(--custom-table-background-info) !important',
      color: 'var(--text-primary) !important',
      fontSize: '1rem',
      fontWeight: 'bolder',
      justifyContent: 'center',
      minHeight: '2.25rem',
    },
  },
  headCells: {
    style: {
      height: '2.25rem',
      justifyContent: 'center',
      padding: '5px 10px',
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: 'var(--custom-table-background-sub-head-border)',
      '&:not(:last-of-type)': {
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: 'var(--custom-table-background-sub-head-border)',
      },
    },
  },
  cells: {
    style: {
      '&:not(:last-of-type)': {
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: 'var(--custom-table-background-sub-head-border)',
      },
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: 'var(--custom-table-background-sub-head-border)',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0.25rem 0.5rem',
      fontWeight: 'lighter',
      '&:first-of-type': {
        fontSize: '0.75rem',
      },
      '&:last-of-type': {
        fontWeight: 'bold',
        color: 'var(--custom-table-background-sub-head-text)',
        fontSize: '1rem',
      },
    },
  },
};

const numSortRatio = (rowA: ICounterModel, rowB: ICounterModel) => {
  const a = toFloat(rowA.ratio);
  const b = toFloat(rowB.ratio);
  return a - b;
};

const Counter = (props: ICounterComponent) => {
  const dispatch = useDispatch();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const optionStore = useSelector((state: OptionsSheetState) => state.options);

  const [counterList, setCounterList] = useState<ICounterModel[]>([]);
  const [counterFilter, setCounterFilter] = useState<ICounterModel[]>([]);
  const [showFrame, setShowFrame] = useState(true);

  const [options, setOptions] = useState(optionStore?.counter ?? new OptionFiltersCounter());

  const { isMatch, isSearchId, showMegaPrimal, releasedGO, enableBest } = options;

  const menuItems: IMenuItem[] = [
    {
      label: (
        <FormControlLabel
          control={
            <Checkbox checked={isSearchId} onChange={(_, check) => setOptions({ ...options, isSearchId: check })} />
          }
          label="Search Pokémon Id"
        />
      ),
    },
    {
      label: (
        <FormControlLabel
          control={
            <Checkbox
              checked={isMatch}
              onChange={(_, check) => setOptions({ ...options, isMatch: check })}
              disabled={!isSearchId}
            />
          }
          label="Match Pokémon"
        />
      ),
    },
  ];

  const columns: TableColumnModify<ICounterModel>[] = [
    {
      id: ColumnType.Pokemon,
      name: 'Pokémon',
      selector: (row) => {
        const assets = findAssetForm(data.assets, row.pokemonId, row.pokemonForm);
        return (
          <LinkToTop to={`/pokemon/${row.pokemonId}${generateParamForm(row.pokemonForm, row.pokemonType)}`}>
            <div className="d-flex justify-content-center">
              <div className="filter-shadow-hover position-relative group-pokemon-sprite">
                <PokemonIconType pokemonType={row.pokemonType} size={30}>
                  <img
                    className="pokemon-sprite-counter"
                    alt="Pokémon Image"
                    src={APIService.getPokemonModel(assets, row.pokemonId)}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, row.pokemonId, assets);
                    }}
                  />
                </PokemonIconType>
              </div>
            </div>
            <span className="caption text-overflow theme-text-primary">
              #{row.pokemonId} {splitAndCapitalize(row.pokemonName, '-', ' ')}
            </span>
          </LinkToTop>
        );
      },
      width: '30%',
    },
    {
      id: ColumnType.FastMove,
      name: 'Fast',
      selector: (row) => (
        <LinkToTop to={`../move/${row.fMove.id}`} className="d-grid">
          <div className="me-1 v-align-text-bottom">
            <IconType width={28} height={28} alt="Pokémon GO Type Logo" type={row.fMove.type} />
          </div>
          <span className="me-1 text-wrap" style={{ fontSize: '0.9rem' }}>
            {splitAndCapitalize(row.fMove.name.toLowerCase(), '_', ' ')}
          </span>
          <span className="w-100">
            {row.fMove.moveType !== MoveType.None && (
              <span
                className={combineClasses(
                  'type-icon-small ic',
                  `${getKeyWithData(MoveType, row.fMove.moveType)?.toLowerCase()}-ic`
                )}
              >
                {getKeyWithData(MoveType, row.fMove.moveType)}
              </span>
            )}
          </span>
        </LinkToTop>
      ),
      width: '25%',
    },
    {
      id: ColumnType.ChargedMove,
      name: 'Charged',
      selector: (row) => (
        <LinkToTop to={`../move/${row.cMove.id}`} className="d-grid">
          <div className="me-1 v-align-text-bottom">
            <IconType width={28} height={28} alt="Pokémon GO Type Logo" type={row.cMove.type} />
          </div>
          <span className="me-1 text-wrap" style={{ fontSize: '0.9rem' }}>
            {splitAndCapitalize(row.cMove.name.toLowerCase(), '_', ' ')}
          </span>
          <span className="w-100">
            {row.cMove.moveType !== MoveType.None && (
              <span
                className={combineClasses(
                  'type-icon-small ic',
                  `${getKeyWithData(MoveType, row.cMove.moveType)?.toLowerCase()}-ic`
                )}
              >
                {getKeyWithData(MoveType, row.cMove.moveType)}
              </span>
            )}
          </span>
        </LinkToTop>
      ),
      width: '25%',
    },
    {
      id: ColumnType.Percent,
      name: '%',
      selector: (row) =>
        toFloatWithPadding(row.ratio, 2, FloatPaddingOption.setOptions({ maxValue: 100, maxLength: 6 })),
      sortable: true,
      sortFunction: numSortRatio,
      width: '20%',
    },
  ];

  const CounterLoader = () => (
    <div className="w-100 counter-none v-align-top">
      <div className="text-origin text-center theme-table-primary">
        <div className="ph-item">
          <div className="ph-col-12 theme-table-primary m-0 p-2 gap-2">
            {[...Array(5).keys()].map((_, index) => (
              <div key={index} className="ph-row d-flex gap-pct-5">
                <div className="ph-picture w-pct-25" style={{ height: 100 }} />
                <div className="ph-picture w-pct-70" style={{ height: 100 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const controller = new AbortController();
    if (isNotEmpty(counterList)) {
      setCounterFilter([]);
      setShowFrame(true);
    }
    if (!isNullOrUndefined(props.pokemonData) && isNotEmpty(props.pokemonData.types)) {
      calculateCounter(controller.signal)
        .then((data) => {
          setCounterList(data);
        })
        .catch(() => setShowFrame(true));
    }
    return () => controller.abort();
  }, [props.pokemonData, props.pokemonData?.pokemonType]);

  const calculateCounter = (signal: AbortSignal, delay = counterDelay()) => {
    return new Promise<ICounterModel[]>((resolve, reject) => {
      let result: ICounterModel[] = [];

      const resolveHandler = () => {
        if (props.pokemonData) {
          result = counterPokemon(
            data.pokemons,
            data.typeEff,
            data.weatherBoost,
            toNumber(props.pokemonData.statsGO?.def),
            props.pokemonData.types,
            data.combats
          );
        }

        if (signal instanceof AbortSignal) {
          signal.removeEventListener('abort', abortHandler);
        }
        resolve(result);
      };

      const debouncedResolve = debounce(resolveHandler, delay);

      const abortHandler = () => {
        debouncedResolve.cancel();
        reject();
      };
      if (signal instanceof AbortSignal) {
        signal.addEventListener('abort', abortHandler, { once: true });
      }
      debouncedResolve();
    });
  };

  useEffect(() => {
    dispatch(OptionsActions.SetCounterOptions.create(options));
    if (isNotEmpty(counterList)) {
      const result = enableBest ? filterBestOptions(counterList) : counterList;
      setCounterFilter(
        result
          .filter((pokemon) => {
            if (showMegaPrimal) {
              return true;
            }
            return !isSpecialMegaFormType(pokemon.pokemonType);
          })
          .filter((pokemon) => {
            if (!releasedGO) {
              return true;
            }
            if (!pokemon.releasedGO) {
              return checkPokemonGO(pokemon.pokemonId, convertPokemonDataName(pokemon.pokemonName), data.pokemons);
            }
            return pokemon.releasedGO;
          })
      );
      setShowFrame(false);
    }
  }, [dispatch, counterList, showMegaPrimal, releasedGO, enableBest]);

  const filterBestOptions = (result: ICounterModel[]) => {
    const group = result.reduce((res, obj) => {
      (res[obj.pokemonName] = getValueOrDefault(Array, res[obj.pokemonName])).push(obj);
      return res;
    }, new Object() as DynamicObj<ICounterModel[]>);
    return Object.values(group).map((pokemon) => pokemon.reduce((p, c) => (p.ratio > c.ratio ? p : c)));
  };

  const modalOptions = () => (
    <form>
      <FormControlLabel
        control={
          <Switch
            disabled={!isNotEmpty(counterList)}
            checked={releasedGO}
            onChange={(_, check) => setOptions({ ...options, releasedGO: check })}
          />
        }
        label={
          <span className="d-flex align-items-center">
            Released in GO
            <img
              className={combineClasses('ms-1', releasedGO && !showFrame ? '' : 'filter-gray')}
              width={28}
              height={28}
              alt="Pokémon GO Icon"
              src={APIService.getPokemonGoIcon(icon)}
            />
          </span>
        }
        disabled={showFrame}
      />
      <FormControlLabel
        control={
          <Checkbox
            disabled={!isNotEmpty(counterList)}
            checked={showMegaPrimal}
            onChange={(_, check) => setOptions({ ...options, showMegaPrimal: check })}
          />
        }
        label={`${getKeyWithData(PokemonType, PokemonType.Mega)}/${getKeyWithData(PokemonType, PokemonType.Primal)}`}
      />
      <FormControlLabel
        control={
          <Checkbox
            disabled={!isNotEmpty(counterList)}
            checked={enableBest}
            onChange={(_, check) => setOptions({ ...options, enableBest: check })}
          />
        }
        label={'Filter best move sets'}
      />
    </form>
  );

  return (
    <div className="table-info">
      <div className="sub-header input-group align-items-center justify-content-center">
        <span className="sub-title">Best Pokémon Counter</span>
      </div>
      <CustomDataTable
        className="table-counter-container"
        customColumns={columns}
        defaultSortFieldId={ColumnType.Percent}
        defaultSortAsc={false}
        isShowSearch
        isAutoSearch
        menuItems={menuItems}
        searchFunction={(item, searchTerm) =>
          isInclude(
            splitAndCapitalize(item.pokemonName, '-', ' '),
            searchTerm,
            IncludeMode.IncludeIgnoreCaseSensitive
          ) ||
          (isSearchId && (isMatch ? isEqual(item.pokemonId, searchTerm) : isInclude(item.pokemonId, searchTerm)))
        }
        pagination
        customDataStyles={customStyles}
        inputPlaceholder="Search Pokémon"
        fixedHeader
        paginationComponentOptions={{
          noRowsPerPage: true,
        }}
        noDataComponent={null}
        paginationPerPage={100}
        progressPending={showFrame}
        progressComponent={<CounterLoader />}
        data={counterFilter}
        isXFixed
        isShowModalOptions
        titleModalOptions="Pokémon counter options"
        customOptionsModal={modalOptions}
      />
    </div>
  );
};

export default Counter;
