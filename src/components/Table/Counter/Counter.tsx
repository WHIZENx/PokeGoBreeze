import { FormControlLabel, Switch, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';
import { capitalize, checkPokemonGO, convertFormName, splitAndCapitalize } from '../../../util/Utils';
import { findAssetForm } from '../../../util/Compute';
import { counterPokemon } from '../../../util/Calculate';

import './Counter.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';
import DataTable, { TableStyles } from 'react-data-table-component';
import { SHADOW_DEF_BONUS } from '../../../util/Constants';
import { CounterModel } from './models/counter.model';

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
  const [counterList, setCounterList]: [CounterModel[], React.Dispatch<React.SetStateAction<CounterModel[]>>] = useState(
    [] as CounterModel[]
  );
  const [frame, setFrame] = useState(false);
  const [releasedGO, setReleaseGO] = useState(true);

  const controller: React.MutableRefObject<AbortController> = useRef(new AbortController());
  const timeOutId: React.MutableRefObject<NodeJS.Timeout | undefined> = useRef();

  const columns: any = [
    {
      name: 'Pokémon',
      selector: (row: CounterModel) => (
        <Link
          to={`/pokemon/${row.pokemon_id}${
            row.pokemon_forme ? `?form=${convertFormName(row.pokemon_id, row.pokemon_forme.toLowerCase())}` : ''
          }`}
        >
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
                  findAssetForm(data?.assets ?? [], row.pokemon_id, row.pokemon_name)
                    ? APIService.getPokemonModel(findAssetForm(data?.assets ?? [], row.pokemon_id, row.pokemon_name))
                    : APIService.getPokeFullSprite(row.pokemon_id)
                }
              />
            </div>
          </div>
          <span className="caption" style={{ color: theme.palette.text.primary }}>
            #{row.pokemon_id} {splitAndCapitalize(row.pokemon_name, '-', ' ')}
          </span>
        </Link>
      ),
      width: '30%',
    },
    {
      name: 'Fast',
      selector: (row: CounterModel) => (
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
      selector: (row: CounterModel) => (
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
                <span>Shadow</span>
              </span>
            )}
            {row.cmove.purified && (
              <span className="type-icon-small ic purified-ic">
                <span>Purified</span>
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
      selector: (row: CounterModel) => parseFloat(row.ratio.toFixed(2)),
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
            <div className="ph-row d-flex" style={{ gap: '5%' }}>
              <div className="ph-picture" style={{ width: '25%', height: 100 }} />
              <div className="ph-picture" style={{ width: '70%', height: 100 }} />
            </div>
            <div className="ph-row d-flex" style={{ gap: '5%' }}>
              <div className="ph-picture" style={{ width: '25%', height: 100 }} />
              <div className="ph-picture" style={{ width: '70%', height: 100 }} />
            </div>
            <div className="ph-row d-flex" style={{ gap: '5%' }}>
              <div className="ph-picture" style={{ width: '25%', height: 100 }} />
              <div className="ph-picture" style={{ width: '70%', height: 100 }} />
            </div>
            <div className="ph-row d-flex" style={{ gap: '5%' }}>
              <div className="ph-picture" style={{ width: '25%', height: 100 }} />
              <div className="ph-picture" style={{ width: '70%', height: 100 }} />
            </div>
            <div className="ph-row d-flex" style={{ gap: '5%' }}>
              <div className="ph-picture" style={{ width: '25%', height: 100 }} />
              <div className="ph-picture" style={{ width: '70%', height: 100 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (props.def && props.types && props.types.length > 0) {
      loadMetaData();
    } else if (counterList.length > 0) {
      setCounterList([]);
    }
    return () => {
      clearTimeout(timeOutId.current);
      controller.current?.abort();
    };
  }, [props.def, props.isShadow, props.types]);

  const calculateCounter = async () => {
    return new Promise<CounterModel[]>((resolve, reject) => {
      timeOutId.current = setTimeout(() => {
        resolve(
          counterPokemon(
            data?.options,
            data?.pokemon ?? [],
            data?.typeEff,
            data?.weatherBoost,
            props.def * (props.isShadow ? SHADOW_DEF_BONUS(data?.options) : 1),
            props.types ?? [],
            data?.combat ?? [],
            data?.pokemonCombat ?? []
          )
        );
      }, 3000);
      controller.current?.signal.addEventListener('abort', () => {
        reject();
      });
    });
  };

  const loadMetaData = () => {
    setFrame(true);
    clearTimeout(timeOutId.current);
    controller.current?.abort();
    calculateCounter()
      .then((data) => {
        setCounterList(data);
        setFrame(false);
      })
      .catch(() => clearTimeout(timeOutId.current))
      .finally(() => clearTimeout(timeOutId.current));
  };

  return (
    <div className="table-info">
      <div className="sub-header input-group align-items-center justify-content-center">
        <span className="sub-title">Best Pokémon Counter</span>
        <FormControlLabel
          control={<Switch checked={releasedGO} onChange={(_, check) => setReleaseGO(check)} />}
          label={
            <span className="d-flex align-items-center">
              Released in GO
              <img
                className={releasedGO && !frame ? '' : 'filter-gray'}
                width={28}
                height={28}
                style={{ marginLeft: 5 }}
                alt="pokemon-go-icon"
                src={APIService.getPokemonGoIcon(icon ?? 'Standard')}
              />
            </span>
          }
          disabled={!open}
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
        data={counterList.filter((pokemon) => {
          if (!releasedGO) {
            return true;
          }
          const result = checkPokemonGO(pokemon.pokemon_id, pokemon.pokemon_name, data?.pokemon ?? [], true);
          return pokemon.releasedGO ?? result?.releasedGO ?? false;
        })}
      />
    </div>
  );
};

export default Counter;
