import { Checkbox, FormControlLabel, Switch, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';
import { capitalize, checkPokemonGO, convertPokemonDataName, splitAndCapitalize } from '../../../util/Utils';
import { findAssetForm } from '../../../util/Compute';
import { counterPokemon } from '../../../util/Calculate';

import './Counter.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';
import DataTable, { TableStyles } from 'react-data-table-component';
import { FORM_MEGA, FORM_PRIMAL, FORM_PURIFIED, FORM_SHADOW, SHADOW_DEF_BONUS } from '../../../util/Constants';
import { ICounterModel } from './models/counter.model';

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

const Counter = (props: { def: number; types: string[] | undefined; isShadow: boolean | undefined }) => {
  const theme = useTheme();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const [counterList, setCounterList]: [ICounterModel[], React.Dispatch<React.SetStateAction<ICounterModel[]>>] = useState(
    [] as ICounterModel[]
  );
  const [frame, setFrame] = useState(true);
  const [releasedGO, setReleaseGO] = useState(true);
  const [showMega, setShowMega] = useState(false);

  const columns: any = [
    {
      name: 'Pokémon',
      selector: (row: ICounterModel) => (
        <Link to={`/pokemon/${row.pokemon_id}${row.pokemon_forme ? `?form=${row.pokemon_forme.toLowerCase().replaceAll('_', '-')}` : ''}`}>
          <div className="d-flex justify-content-center">
            <div
              className={
                (theme.palette.mode === 'light' ? 'filter-shadow-hover' : 'filter-light-shadow-hover') +
                ' position-relative group-pokemon-sprite'
              }
            >
              {row.cmove.shadow && <img height={30} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
              {row.cmove.purified && <img height={30} alt="img-shadow" className="purified-icon" src={APIService.getPokePurified()} />}
              <img
                className="pokemon-sprite-counter"
                alt="img-pokemon"
                src={
                  findAssetForm(data?.assets ?? [], row.pokemon_id, row.pokemon_forme ?? '')
                    ? APIService.getPokemonModel(findAssetForm(data?.assets ?? [], row.pokemon_id, row.pokemon_forme ?? ''))
                    : APIService.getPokeFullSprite(row.pokemon_id)
                }
              />
            </div>
          </div>
          <span className="caption text-overflow" style={{ color: theme.palette.text.primary }}>
            #{row.pokemon_id} {splitAndCapitalize(row.pokemon_name, '-', ' ')}
          </span>
        </Link>
      ),
      width: '30%',
    },
    {
      name: 'Fast',
      selector: (row: ICounterModel) => (
        <Link to={'../move/' + row.fmove.id} className="d-grid">
          <div style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
            <img width={28} height={28} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(row.fmove.type))} />
          </div>
          <span style={{ marginRight: 5, fontSize: '0.9rem', whiteSpace: 'normal' }}>
            {splitAndCapitalize(row.fmove.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}
          </span>
          <span className="w-100">
            {row.fmove.elite && (
              <span className="type-icon-small ic elite-ic">
                <span>Elite</span>
              </span>
            )}
          </span>
        </Link>
      ),
      width: '25%',
    },
    {
      name: 'Charged',
      selector: (row: ICounterModel) => (
        <Link to={'../move/' + row.cmove.id} className="d-grid">
          <div style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
            <img width={28} height={28} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(row.cmove.type))} />
          </div>
          <span style={{ marginRight: 5, fontSize: '0.9rem', whiteSpace: 'normal' }}>
            {splitAndCapitalize(row.cmove.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}
          </span>
          <span className="w-100">
            {row.cmove.elite && (
              <span className="type-icon-small ic elite-ic">
                <span>Elite</span>
              </span>
            )}
            {row.cmove.shadow && (
              <span className="type-icon-small ic shadow-ic">
                <span>{capitalize(FORM_SHADOW)}</span>
              </span>
            )}
            {row.cmove.purified && (
              <span className="type-icon-small ic purified-ic">
                <span>{capitalize(FORM_PURIFIED)}</span>
              </span>
            )}
            {row.cmove.special && (
              <span className="type-icon-small ic special-ic">
                <span>Special</span>
              </span>
            )}
          </span>
        </Link>
      ),
      width: '25%',
    },
    {
      name: '%',
      selector: (row: ICounterModel) => parseFloat(row.ratio.toFixed(2)),
      sortable: true,
      width: '20%',
    },
  ];

  const CounterLoader = () => (
    <div className="w-100 counter-none" style={{ verticalAlign: 'top' }}>
      <div className="text-origin text-center" style={{ backgroundColor: (theme.palette.background as any).tablePrimary }}>
        <div className="ph-item">
          <div
            className="ph-col-12"
            style={{ padding: 10, margin: 0, gap: 10, backgroundColor: (theme.palette.background as any).tablePrimary }}
          >
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
    if (counterList.length > 0) {
      setCounterList([]);
      setFrame(true);
    }
    if (props.isShadow !== undefined && (props.types ?? []).length > 0) {
      calculateCounter(controller.signal)
        .then((data) => {
          setCounterList(data);
          setFrame(false);
        })
        .catch(() => setFrame(true));
    }
    return () => controller.abort();
  }, [props.def, props.isShadow, props.types]);

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
          data?.options,
          data?.pokemon ?? [],
          data?.typeEff,
          data?.weatherBoost,
          props.def * (props.isShadow ? SHADOW_DEF_BONUS(data?.options) : 1),
          props.types ?? [],
          data?.combat ?? []
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
          control={<Switch disabled={counterList.length === 0} checked={releasedGO} onChange={(_, check) => setReleaseGO(check)} />}
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
          control={<Checkbox disabled={counterList.length === 0} checked={showMega} onChange={(_, check) => setShowMega(check)} />}
          label="Mega/Primal"
        />
      </div>
      <DataTable
        className="table-counter-container"
        columns={columns}
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
            return !pokemon.pokemon_forme?.includes(FORM_MEGA) && !pokemon.pokemon_forme?.includes(FORM_PRIMAL);
          })
          .filter((pokemon) => {
            if (!releasedGO) {
              return true;
            }
            const result = checkPokemonGO(pokemon.pokemon_id, convertPokemonDataName(pokemon.pokemon_name), data?.pokemon ?? []);
            return pokemon.releasedGO ?? result?.releasedGO ?? false;
          })}
      />
    </div>
  );
};

export default Counter;
