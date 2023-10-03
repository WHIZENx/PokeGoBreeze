import { capitalize, FormControlLabel, Switch, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';
import { convertFormName, convertName, splitAndCapitalize } from '../../../util/Utils';
import { findAssetForm } from '../../../util/Compute';
import { counterPokemon } from '../../../util/Calculate';

import './Counter.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';
import DataTable, { TableStyles } from 'react-data-table-component';
import { SHADOW_DEF_BONUS } from '../../../util/Constants';

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

const Counter = ({ def, form, currForm, pokeID, isShadow }: any) => {
  const theme = useTheme();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const [counterList, setCounterList]: any = useState([]);
  const [frame, setFrame] = useState(false);
  const [releasedGO, setReleaseGO] = useState(true);

  const controller = new AbortController();
  let timeOutId: NodeJS.Timeout;

  const columns: any = [
    {
      name: 'Pokémon',
      selector: (row: {
        pokemon_id: number;
        pokemon_forme: string;
        cmove: { shadow: boolean; purified: boolean };
        pokemon_name: string | undefined;
      }) => (
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
      selector: (row: { fmove: { id: string; name: string; type: string; elite: boolean } }) => (
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
      selector: (row: { cmove: { id: string; type: string; name: string; elite: boolean; shadow: boolean; purified: boolean } }) => (
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
          </span>
        </Link>
      ),
      width: '25%',
    },
    {
      name: '%',
      selector: (row: { ratio: number }) => parseFloat(row.ratio.toFixed(2)),
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
    if ((currForm || currForm === undefined) && pokeID && form) {
      loadMetaData();
    } else if (counterList.length > 0) {
      setCounterList([]);
    }
    return () => {
      clearTimeout(timeOutId);
      controller.abort();
    };
  }, [pokeID, currForm, isShadow]);

  const calculateCounter = () => {
    return new Promise((resolve, reject) => {
      timeOutId = setTimeout(() => {
        resolve(
          counterPokemon(
            data?.options,
            data?.released ?? [],
            data?.typeEff,
            data?.weatherBoost,
            def * (isShadow ? SHADOW_DEF_BONUS(data?.options) ?? 1 : 1),
            form.types,
            data?.combat ?? [],
            data?.pokemonCombat ?? []
          )
        );
      }, 3000);
      controller.signal.addEventListener('abort', () => {
        reject();
      });
    });
  };

  const loadMetaData = () => {
    setFrame(true);
    calculateCounter()
      .then((data) => {
        setCounterList(data);
        setFrame(false);
      })
      .catch(() => clearTimeout(timeOutId))
      .finally(() => clearTimeout(timeOutId));
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
        data={counterList.filter((pokemon: { pokemon_id: number; pokemon_name: string }) => {
          if (!releasedGO) {
            return true;
          }
          const result = data?.details?.find(
            (item) =>
              item.id === pokemon.pokemon_id &&
              item.name ===
                (item.id === 555 && !pokemon.pokemon_name.toLowerCase().includes('zen')
                  ? pokemon.pokemon_name?.toUpperCase().replaceAll('-', '_').replace('_GALAR', '_GALARIAN') + '_STANDARD'
                  : convertName(pokemon.pokemon_name).replace('NIDORAN_F', 'NIDORAN_FEMALE').replace('NIDORAN_M', 'NIDORAN_MALE'))
          );
          return result ? result.releasedGO : false;
        })}
      />
    </div>
  );
};

export default Counter;
