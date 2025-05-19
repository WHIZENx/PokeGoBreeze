import { Checkbox, FormControlLabel, Switch } from '@mui/material';
import React, { useEffect, useState } from 'react';
import APIService from '../../../services/API.service';
import {
  checkPokemonGO,
  convertPokemonDataName,
  generateParamForm,
  getCustomThemeDataTable,
  getKeyWithData,
  getValidPokemonImgPath,
  isSpecialMegaFormType,
  splitAndCapitalize,
} from '../../../util/utils';
import { findAssetForm } from '../../../util/compute';
import { counterPokemon } from '../../../util/calculate';

import SettingsIcon from '@mui/icons-material/Settings';

import './Counter.scss';
import { useDispatch, useSelector } from 'react-redux';
import { OptionsSheetState, StoreState } from '../../../store/models/state.model';
import DataTable, { TableStyles } from 'react-data-table-component';
import { ICounterModel, OptionFiltersCounter } from './models/counter.model';
import { ICounterComponent } from '../../models/component.model';
import { ColumnType, MoveType, PokemonType, VariantType } from '../../../enums/type.enum';
import { TableColumnModify } from '../../../util/models/overrides/data-table.model';
import {
  combineClasses,
  convertColumnDataType,
  DynamicObj,
  getValueOrDefault,
  isNotEmpty,
  isNullOrUndefined,
  toFloat,
  toFloatWithPadding,
  toNumber,
} from '../../../util/extension';
import { LinkToTop } from '../../../util/hooks/LinkToTop';
import { Button, Modal } from 'react-bootstrap';
import { OptionsActions } from '../../../store/actions';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
import { FloatPaddingOption } from '../../../util/models/extension.model';
import { COUNTER_DELAY } from '../../../util/constants';
import IconType from '../../Sprites/Icon/Type/Type';
import { debounce } from 'lodash';

const customStyles: TableStyles = {
  head: {
    style: {
      height: 35,
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
      backgroundColor: '#f1ffff !important',
      fontSize: 16,
      fontWeight: 'bolder',
      justifyContent: 'center',
      minHeight: 35,
    },
  },
  headCells: {
    style: {
      height: 35,
      justifyContent: 'center',
      padding: '5px 10px',
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: '#b8d4da',
      '&:not(:last-of-type)': {
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: '#b8d4da',
      },
    },
  },
  cells: {
    style: {
      '&:not(:last-of-type)': {
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: '#b8d4da',
      },
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: '#b8d4da',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '5px 10px',
      fontWeight: 'lighter',
      '&:first-of-type': {
        fontSize: 12,
      },
      '&:last-of-type': {
        fontWeight: 'bold',
        color: '#0571c2',
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

  const [showOption, setShowOption] = useState(false);
  const [options, setOptions] = useState(optionStore?.counter ?? new OptionFiltersCounter());

  const { showMegaPrimal, releasedGO, enableBest } = options;

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
                    alt="img-pokemon"
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
          <div style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
            <IconType width={28} height={28} alt="type-logo" type={row.fMove.type} />
          </div>
          <span style={{ marginRight: 5, fontSize: '0.9rem', whiteSpace: 'normal' }}>
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
          <div style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
            <IconType width={28} height={28} alt="type-logo" type={row.cMove.type} />
          </div>
          <span style={{ marginRight: 5, fontSize: '0.9rem', whiteSpace: 'normal' }}>
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
    <div className="w-100 counter-none" style={{ verticalAlign: 'top' }}>
      <div className="text-origin text-center theme-table-primary">
        <div className="ph-item">
          <div className="ph-col-12 theme-table-primary" style={{ padding: 10, margin: 0, gap: 10 }}>
            {[...Array(5).keys()].map((_, index) => (
              <div key={index} className="ph-row d-flex" style={{ gap: '5%' }}>
                <div className="ph-picture" style={{ width: '25%', height: 100 }} />
                <div className="ph-picture" style={{ width: '70%', height: 100 }} />
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

  const calculateCounter = (signal: AbortSignal, delay = COUNTER_DELAY) => {
    return new Promise<ICounterModel[]>((resolve, reject) => {
      let result: ICounterModel[] = [];

      const resolveHandler = () => {
        if (props.pokemonData) {
          result = counterPokemon(
            data.options,
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

  const handleShowOption = () => {
    setShowOption(true);
  };

  const handleCloseOption = () => {
    setShowOption(false);
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
              className={releasedGO && !showFrame ? '' : 'filter-gray'}
              width={28}
              height={28}
              style={{ marginLeft: 5 }}
              alt="pokemon-go-icon"
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
        <div className="counter-setting" onClick={handleShowOption}>
          <SettingsIcon sx={{ fontSize: 32 }} />
        </div>
      </div>
      <DataTable
        className="table-counter-container"
        columns={convertColumnDataType(columns)}
        defaultSortFieldId={ColumnType.Percent}
        defaultSortAsc={false}
        pagination={true}
        customStyles={getCustomThemeDataTable(customStyles)}
        fixedHeader={true}
        paginationComponentOptions={{
          noRowsPerPage: true,
        }}
        noDataComponent={null}
        paginationPerPage={100}
        progressPending={showFrame}
        progressComponent={<CounterLoader />}
        data={counterFilter}
      />

      <Modal show={showOption} onHide={handleCloseOption} centered={true}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Pokémon counter options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ overflowY: 'auto', maxHeight: '60vh', maxWidth: 400 }}>{modalOptions()}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={VariantType.Secondary} onClick={handleCloseOption}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Counter;
