import { Checkbox, FormControlLabel, Switch, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';
import {
  capitalize,
  checkPokemonGO,
  convertPokemonDataName,
  getDmgMultiplyBonus,
  getKeyEnum,
  splitAndCapitalize,
} from '../../../util/utils';
import { findAssetForm } from '../../../util/compute';
import { counterPokemon } from '../../../util/calculate';

import './Counter.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';
import DataTable, { TableStyles } from 'react-data-table-component';
import { ICounterModel } from './models/counter.model';
import { ICounterComponent } from '../../models/component.model';
import { MoveType, PokemonType, TypeAction, TypeTheme } from '../../../enums/type.enum';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { TableColumnModify } from '../../../util/models/overrides/data-table.model';
import {
  combineClasses,
  convertColumnDataType,
  getValueOrDefault,
  isInclude,
  isNotEmpty,
  isUndefined,
  toFloat,
  toFloatWithPadding,
} from '../../../util/extension';
import { APIUrl } from '../../../services/constants';

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
  const theme = useTheme<ThemeModify>();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const [counterList, setCounterList] = useState<ICounterModel[]>([]);
  const [frame, setFrame] = useState(true);
  const [releasedGO, setReleaseGO] = useState(true);
  const [showMega, setShowMega] = useState(false);

  const columns: TableColumnModify<ICounterModel>[] = [
    {
      name: 'Pokémon',
      selector: (row) => (
        <Link to={`/pokemon/${row.pokemonId}${row.pokemonForme ? `?form=${row.pokemonForme.toLowerCase().replaceAll('_', '-')}` : ''}`}>
          <div className="d-flex justify-content-center">
            <div
              className={combineClasses(
                theme.palette.mode === TypeTheme.LIGHT ? 'filter-shadow-hover' : 'filter-light-shadow-hover',
                'position-relative group-pokemon-sprite'
              )}
            >
              {row.pokemonType === PokemonType.Shadow && (
                <img height={30} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
              )}
              {row.pokemonType === PokemonType.Purified && (
                <img height={30} alt="img-shadow" className="purified-icon" src={APIService.getPokePurified()} />
              )}
              <img
                className="pokemon-sprite-counter"
                alt="img-pokemon"
                src={
                  findAssetForm(data.assets, row.pokemonId, row.pokemonForme)
                    ? APIService.getPokemonModel(findAssetForm(data.assets, row.pokemonId, row.pokemonForme))
                    : APIService.getPokeFullSprite(row.pokemonId)
                }
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  if (isInclude(e.currentTarget.src, APIUrl.POKE_SPRITES_FULL_API_URL)) {
                    e.currentTarget.src = APIService.getPokeFullAsset(row.pokemonId);
                  } else {
                    e.currentTarget.src = APIService.getPokeFullSprite(0);
                  }
                }}
              />
            </div>
          </div>
          <span className="caption text-overflow" style={{ color: theme.palette.text.primary }}>
            #{row.pokemonId} {splitAndCapitalize(row.pokemonName, '-', ' ')}
          </span>
        </Link>
      ),
      width: '30%',
    },
    {
      name: 'Fast',
      selector: (row) => (
        <Link to={`../move/${row.fMove.id}`} className="d-grid">
          <div style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
            <img width={28} height={28} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(row.fMove.type))} />
          </div>
          <span style={{ marginRight: 5, fontSize: '0.9rem', whiteSpace: 'normal' }}>
            {splitAndCapitalize(row.fMove.name.toLowerCase(), '_', ' ')}
          </span>
          <span className="w-100">
            {row.fMove.moveType !== MoveType.None && (
              <span className={combineClasses('type-icon-small ic', `${getKeyEnum(MoveType, row.fMove.moveType)?.toLowerCase()}-ic`)}>
                {getKeyEnum(MoveType, row.fMove.moveType)}
              </span>
            )}
          </span>
        </Link>
      ),
      width: '25%',
    },
    {
      name: 'Charged',
      selector: (row) => (
        <Link to={`../move/${row.cMove.id}`} className="d-grid">
          <div style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
            <img width={28} height={28} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(row.cMove.type))} />
          </div>
          <span style={{ marginRight: 5, fontSize: '0.9rem', whiteSpace: 'normal' }}>
            {splitAndCapitalize(row.cMove.name.toLowerCase(), '_', ' ')}
          </span>
          <span className="w-100">
            {row.cMove.moveType !== MoveType.None && (
              <span className={combineClasses('type-icon-small ic', `${getKeyEnum(MoveType, row.cMove.moveType)?.toLowerCase()}-ic`)}>
                {getKeyEnum(MoveType, row.cMove.moveType)}
              </span>
            )}
          </span>
        </Link>
      ),
      width: '25%',
    },
    {
      name: '%',
      selector: (row) => toFloatWithPadding(row.ratio, 2),
      sortable: true,
      sortFunction: numSortRatio,
      width: '20%',
    },
  ];

  const CounterLoader = () => (
    <div className="w-100 counter-none" style={{ verticalAlign: 'top' }}>
      <div className="text-origin text-center" style={{ backgroundColor: theme.palette.background.tablePrimary }}>
        <div className="ph-item">
          <div className="ph-col-12" style={{ padding: 10, margin: 0, gap: 10, backgroundColor: theme.palette.background.tablePrimary }}>
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
      setCounterList([]);
      setFrame(true);
    }
    if (!isUndefined(props.pokemonType) && isNotEmpty(props.types)) {
      calculateCounter(controller.signal)
        .then((data) => {
          setCounterList(data);
          setFrame(false);
        })
        .catch(() => setFrame(true));
    }
    return () => controller.abort();
  }, [props.def, props.pokemonType, props.types]);

  const calculateCounter = (signal: AbortSignal, delay = 3000) => {
    return new Promise<ICounterModel[]>((resolve, reject) => {
      let result: ICounterModel[] = [];
      let timeout: NodeJS.Timeout | number;
      const abortHandler = () => {
        clearTimeout(timeout);
        reject();
      };

      const resolveHandler = () => {
        if (signal instanceof AbortSignal) {
          signal.removeEventListener('abort', abortHandler);
        }
        result = counterPokemon(
          data.options,
          data.pokemon,
          data.typeEff,
          data.weatherBoost,
          props.def * getDmgMultiplyBonus(props.pokemonType, data.options, TypeAction.DEF),
          props.types,
          data.combat
        );
        resolve(result);
      };

      timeout = setTimeout(resolveHandler, delay, result);

      if (signal instanceof AbortSignal) {
        signal.addEventListener('abort', abortHandler, { once: true });
      }
    });
  };

  return (
    <div className="table-info">
      <div className="sub-header input-group align-items-center justify-content-center">
        <span className="sub-title">Best Pokémon Counter</span>
        <FormControlLabel
          control={<Switch disabled={!isNotEmpty(counterList)} checked={releasedGO} onChange={(_, check) => setReleaseGO(check)} />}
          label={
            <span className="d-flex align-items-center">
              Released in GO
              <img
                className={releasedGO && !frame ? '' : 'filter-gray'}
                width={28}
                height={28}
                style={{ marginLeft: 5 }}
                alt="pokemon-go-icon"
                src={APIService.getPokemonGoIcon(icon)}
              />
            </span>
          }
          disabled={!open}
        />
        <FormControlLabel
          control={<Checkbox disabled={!isNotEmpty(counterList)} checked={showMega} onChange={(_, check) => setShowMega(check)} />}
          label="Mega/Primal"
        />
      </div>
      <DataTable
        className="table-counter-container"
        columns={convertColumnDataType(columns)}
        pagination={true}
        customStyles={customStyles}
        fixedHeader={true}
        paginationComponentOptions={{
          noRowsPerPage: true,
        }}
        noDataComponent={null}
        paginationPerPage={100}
        progressPending={frame}
        progressComponent={<CounterLoader />}
        data={counterList
          .filter((pokemon) => {
            if (showMega) {
              return true;
            }
            return pokemon.pokemonType !== PokemonType.Mega && pokemon.pokemonType !== PokemonType.Primal;
          })
          .filter((pokemon) => {
            if (!releasedGO) {
              return true;
            }
            const result = checkPokemonGO(pokemon.pokemonId, convertPokemonDataName(pokemon.pokemonName), data.pokemon);
            return getValueOrDefault(Boolean, pokemon.releasedGO, result?.releasedGO);
          })}
      />
    </div>
  );
};

export default Counter;
