import { capitalize, FormControlLabel, Switch, useTheme } from '@mui/material';
import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';
import { convertFormName, convertName, splitAndCapitalize } from '../../../util/Utils';
import { findAssetForm } from '../../../util/Compute';
import { counterPokemon } from '../../../util/Calculate';

import './Counter.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';

const Counter = ({ def, form, currForm, pokeID }: any) => {
  const theme = useTheme();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const [counterList, setCounterList]: any = useState([]);
  const [frame, setFrame] = useState(false);
  const [releasedGO, setReleaseGO] = useState(true);

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = 20;
  const eachCounter = 10;
  const controller = new AbortController();
  let timeOutId: NodeJS.Timeout;

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
  }, [pokeID, currForm]);

  const listenScrollEvent = (ele: { currentTarget: { scrollTop: number; offsetHeight: number } }) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 0.8 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const calculateCounter = () => {
    return new Promise((resolve, reject) => {
      timeOutId = setTimeout(() => {
        resolve(
          counterPokemon(
            data?.options,
            data?.released ?? [],
            data?.typeEff,
            data?.weatherBoost,
            def,
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
      .catch(() => clearTimeout(timeOutId));
  };

  return (
    <div className="table-counter-container" onScroll={listenScrollEvent.bind(this)}>
      <table className="table-info table-counter">
        <colgroup className="main-name" />
        <colgroup className="main-move-counter" />
        <colgroup className="main-move-counter" />
        <colgroup />
        <thead>
          <tr className="text-center">
            <th className="table-sub-header" colSpan={4}>
              <div className="input-group align-items-center justify-content-center">
                <span>Best Pokémon Counter</span>
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
            </th>
          </tr>
          <tr className="text-center">
            <th className="table-column-head main-move-name">Pokémon</th>
            <th className="table-column-head main-move-counter">Fast</th>
            <th className="table-column-head main-move-counter">Charged</th>
            <th className="table-column-head">%</th>
          </tr>
        </thead>
        <tbody>
          {!frame ? (
            <Fragment>
              {counterList
                .filter((pokemon: { pokemon_id: number; pokemon_name: string }) => {
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
                })
                .slice(0, firstInit + eachCounter * startIndex)
                .map(
                  (
                    value: {
                      pokemon_id: number;
                      pokemon_forme: string;
                      cmove: { shadow: boolean; purified: boolean; id: string; type: string; name: string; elite: boolean };
                      pokemon_name: string;
                      fmove: { id: string; type: string; name: string; elite: boolean };
                      ratio: number;
                    },
                    index: React.Key
                  ) => (
                    <Fragment key={index}>
                      <tr>
                        <td className="text-origin text-center" style={{ backgroundColor: (theme.palette.background as any).tablePrimary }}>
                          <Link
                            to={`/pokemon/${value.pokemon_id}${
                              value.pokemon_forme ? `?form=${convertFormName(value.pokemon_id, value.pokemon_forme.toLowerCase())}` : ''
                            }`}
                          >
                            <div className="d-flex justify-content-center">
                              <div
                                className={
                                  'position-relative group-pokemon-sprite ' + theme.palette.mode === 'light'
                                    ? 'filter-shadow-hover'
                                    : 'filter-light-shadow-hover'
                                }
                              >
                                {value.cmove.shadow && (
                                  <img height={30} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
                                )}
                                {value.cmove.purified && (
                                  <img height={30} alt="img-shadow" className="purified-icon" src={APIService.getPokePurified()} />
                                )}
                                <img
                                  className="pokemon-sprite-counter"
                                  alt="img-pokemon"
                                  src={
                                    findAssetForm(data?.assets ?? [], value.pokemon_id, value.pokemon_name)
                                      ? APIService.getPokemonModel(findAssetForm(data?.assets ?? [], value.pokemon_id, value.pokemon_name))
                                      : APIService.getPokeFullSprite(value.pokemon_id)
                                  }
                                />
                              </div>
                            </div>
                            <span className="caption" style={{ color: theme.palette.text.primary }}>
                              #{value.pokemon_id} {splitAndCapitalize(value.pokemon_name, '-', ' ')}
                            </span>
                          </Link>
                        </td>
                        <td className="text-origin text-center" style={{ backgroundColor: (theme.palette.background as any).tablePrimary }}>
                          <Link to={'../move/' + value.fmove.id} className="d-grid">
                            <div style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
                              <img width={28} height={28} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(value.fmove.type))} />
                            </div>
                            <span style={{ marginRight: 5, fontSize: '0.9rem' }}>
                              {splitAndCapitalize(value.fmove.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}
                            </span>
                            <span className="w-100">
                              {value.fmove.elite && (
                                <span className="type-icon-small ic elite-ic">
                                  <span>Elite</span>
                                </span>
                              )}
                            </span>
                          </Link>
                        </td>
                        <td className="text-origin text-center" style={{ backgroundColor: (theme.palette.background as any).tablePrimary }}>
                          <Link to={'../move/' + value.cmove.id} className="d-grid">
                            <div style={{ verticalAlign: 'text-bottom', marginRight: 5 }}>
                              <img width={28} height={28} alt="img-pokemon" src={APIService.getTypeSprite(capitalize(value.cmove.type))} />
                            </div>
                            <span style={{ marginRight: 5, fontSize: '0.9rem' }}>
                              {splitAndCapitalize(value.cmove.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}
                            </span>
                            <span className="w-100">
                              {value.cmove.elite && (
                                <span className="type-icon-small ic elite-ic">
                                  <span>Elite</span>
                                </span>
                              )}
                              {value.cmove.shadow && (
                                <span className="type-icon-small ic shadow-ic">
                                  <span>Shadow</span>
                                </span>
                              )}
                              {value.cmove.purified && (
                                <span className="type-icon-small ic purified-ic">
                                  <span>Purified</span>
                                </span>
                              )}
                            </span>
                          </Link>
                        </td>
                        <td className="text-center" style={{ backgroundColor: (theme.palette.background as any).tablePrimary }}>
                          {value.ratio.toFixed(2)}
                        </td>
                      </tr>
                    </Fragment>
                  )
                )}
            </Fragment>
          ) : (
            <tr className="counter-none" style={{ verticalAlign: 'top' }}>
              <td
                className="text-origin text-center"
                colSpan={4}
                style={{ backgroundColor: (theme.palette.background as any).tablePrimary }}
              >
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
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Counter;
