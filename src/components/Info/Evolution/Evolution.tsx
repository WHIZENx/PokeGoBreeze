import { Badge } from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SecurityUpdateIcon from '@mui/icons-material/SecurityUpdate';
import CallMadeIcon from '@mui/icons-material/CallMade';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import PetsIcon from '@mui/icons-material/Pets';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Xarrow from 'react-xarrows';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';

import pokemonData from '../../../data/pokemon.json';
import pokemonName from '../../../data/pokemon_names.json';

import './Evolution.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { capitalize, convertModelSpritName, splitAndCapitalize } from '../../../util/Utils';
import { computeCandyBgColor, computeCandyColor } from '../../../util/Compute';

import { OverlayTrigger } from 'react-bootstrap';
import PopoverConfig from '../../Popover/PopoverConfig';
import { RootStateOrAny, useSelector } from 'react-redux';

const theme = createTheme({
  palette: {
    secondary: {
      main: '#a6efff80',
      contrastText: 'gray',
      fontSize: '0.75rem',
    },
  },
} as any);

const Evolution = ({ forme, region, formDefault, id, onSetIDPoke, gen }: any) => {
  const evoData = useSelector((state: RootStateOrAny) => state.store.data.evolution);
  const candyData = useSelector((state: RootStateOrAny) => state.store.data.candy);
  const [arrEvoList, setArrEvoList]: any = useState([]);

  const getEvoChain = useCallback(
    (data: any) => {
      if (data.length === 0) {
        return false;
      }
      const evoList = data.map((item: { species: { url: string } }) => {
        return item && evoData.filter((e: { id: number }) => e.id === parseInt(item.species.url.split('/')[6]));
      })[0];
      const currForm = formDefault
        ? forme.form_name === '' && ['Alola', 'Galar'].includes(region)
          ? region
          : forme.form_name
        : forme.form_name;
      if (!evoList) {
        const pokemon = evoData.find((e: { id: any }) => e.id === id);
        if (pokemon) {
          return setArrEvoList((oldArr: any) => [
            ...oldArr,
            [
              {
                name: splitAndCapitalize(pokemon.name, '_', ' '),
                id: pokemon.id,
                baby: false,
                form: pokemon.form ?? null,
              },
            ],
          ]);
        }
        return setArrEvoList((oldArr: any) => [...oldArr, [{ name: (pokemonName as any)[id].name, id, baby: false, form: null }]]);
      } else if (evoList.length > 1) {
        const evoInJSON = evoList.find((item: { name: string | any[] }) => item.name.includes(currForm.toUpperCase()));
        if (evoInJSON) {
          const evoInAPI = data.find((item: { species: { url: string } }) => parseInt(item.species.url.split('/')[6]) === evoInJSON.id);
          if (evoInJSON.evo_list.length !== evoInAPI.evolves_to.length) {
            const tempData: any[] = [];
            if (evoInAPI.evolves_to.length > 0) {
              evoInJSON.evo_list.forEach((item: { evo_to_id: number }) => {
                evoInAPI.evolves_to.forEach((value: { species: { url: string } }) => {
                  if (parseInt(value.species.url.split('/')[6]) === item.evo_to_id) {
                    return tempData.push(value);
                  }
                });
              });
            } else {
              evoInJSON.evo_list.forEach((item: { evo_to_id: any; evo_to_form: any }) => {
                const pokemonToEvo = evoData.find((e: { id: any; form: any }) => e.id === item.evo_to_id && e.form === item.evo_to_form);
                tempData.push({
                  ...evoInAPI,
                  species: {
                    name: pokemonToEvo.name.toLowerCase(),
                    url: APIService.getPokeAPI('pokemon-species', pokemonToEvo.id),
                  },
                });
              });
            }
            data = [evoInAPI].map((item) => ({ ...item, evolves_to: tempData }));
          }
        }
      } else {
        let evoInJSON = evoList.find((item: { name: string | any[] }) => item.name.includes(currForm.toUpperCase()));
        if (!evoInJSON && ['Alola', 'Galar'].includes(region)) {
          evoInJSON = evoList.find((item: { name: string | string[] }) => item.name.includes(''));
        }
        if (evoInJSON) {
          const evoInAPI = data.find((item: { species: { url: string } }) => parseInt(item.species.url.split('/')[6]) === evoInJSON.id);
          if (evoInJSON.evo_list.length !== evoInAPI.evolves_to.length) {
            const tempArr: any[] = [];
            evoInJSON.evo_list.forEach((value: { evo_to_form: string }) =>
              data.forEach((item: { evolves_to: any[] }) => {
                item.evolves_to.forEach((i: any) => {
                  if (['kubfu', 'rockruff'].includes(forme.name) || value.evo_to_form.toLowerCase().replaceAll('_', '-') === currForm) {
                    tempArr.push({
                      ...i,
                      form: value.evo_to_form.toLowerCase().replaceAll('_', '-'),
                    });
                  }
                });
              })
            );
            data = [evoInAPI].map((item) => ({ ...item, evolves_to: tempArr }));
          }
        }
      }
      setArrEvoList((oldArr: any) => [
        ...oldArr,
        data.map((item: { species: { name: any; url: string }; is_baby: any; form: any }) => {
          return {
            name: item.species.name,
            id: parseInt(item.species.url.split('/')[6]),
            baby: item.is_baby,
            form: item.form ?? null,
          };
        }),
      ]);
      return data.map((item: { evolves_to: any }) => getEvoChain(item.evolves_to));
    },
    [evoData, formDefault, forme, region, id]
  );

  const formatEvoChain = (pokemon: any) => {
    return {
      name: pokemon.baseSpecies ? pokemon.baseSpecies.toLowerCase() : pokemon.name.toLowerCase(),
      id: pokemon.num,
      baby: pokemon.isBaby,
      form: pokemon.forme ?? '',
      gmax: false,
      sprite: convertModelSpritName(pokemon.name),
    };
  };

  const pokeSetName = (name: string) => {
    return name.replace('_FEMALE', '_F').replace('_MALE', '_M').replaceAll('_', '-').replaceAll('MR', 'MR.');
  };

  const modelEvoChain = (pokemon: { id: number; name: string; form: string }) => {
    pokemon.name = pokemon.name.replace('_GALARIAN', '_GALAR').replace('_HISUIAN', '_HISUI');
    return {
      name: pokemon.form !== '' ? pokeSetName(pokemon.name.replace(`_${pokemon.form}`, '')) : pokeSetName(pokemon.name),
      id: pokemon.id,
      baby: false,
      form: pokemon.form,
      gmax: false,
      sprite: convertModelSpritName(pokemon.name),
    };
  };

  const getPrevEvoChainJSON = useCallback((name: string, arr: any): void => {
    if (!name) {
      return;
    }
    const pokemon: any = Object.values(pokemonData).find((pokemon) => pokemon.name === name);
    arr.unshift([formatEvoChain(pokemon)]);
    return getPrevEvoChainJSON(pokemon?.prevo, arr);
  }, []);

  const getCurrEvoChainJSON = useCallback((prev: { evos: any[] }, arr: any[][]) => {
    const evo: { name: any; id: any; baby: any; form: any; gmax: boolean; sprite: any }[] = [];
    prev.evos.forEach((name: string) => {
      const pokemon = Object.values(pokemonData).find((pokemon) => pokemon.name === name);
      evo.push(formatEvoChain(pokemon));
    });
    arr.push(evo);
  }, []);

  const getNextEvoChainJSON = useCallback((evos: any[], arr: any[]) => {
    if (evos.length === 0) {
      return;
    }
    arr.push(
      evos.map((name: string) => {
        const pokemon = Object.values(pokemonData).find((pokemon) => pokemon.name === name);
        return formatEvoChain(pokemon);
      })
    );
    evos.forEach((name: string) => {
      const pokemon: any = Object.values(pokemonData).find((pokemon) => pokemon.name === name);
      getNextEvoChainJSON(pokemon?.evos, arr);
    });
  }, []);

  const getEvoChainJSON = useCallback(
    (id: number, forme: { form_name: string; name: string }) => {
      let form = forme.form_name === '' || forme.form_name.includes('mega') ? null : forme.form_name;
      if (forme.form_name === '10') {
        form += '%';
      }
      if (forme.name === 'necrozma-dawn') {
        form += '-wings';
      } else if (forme.name === 'necrozma-dusk') {
        form += '-mane';
      }
      let pokemon: any = Object.values(pokemonData).find(
        (pokemon) => pokemon.num === id && (pokemon.forme ? pokemon.forme.toLowerCase() : pokemon.forme) === form
      );
      if (!pokemon) {
        pokemon = Object.values(pokemonData).find((pokemon) => pokemon.num === id && pokemon.forme === null);
      }

      const prevEvo: any[] = [],
        curr: any = [],
        evo: any = [];
      getPrevEvoChainJSON(pokemon.prevo, prevEvo);
      const prev = Object.values(pokemonData).find((p) => p.name === pokemon.prevo);
      if (prev) {
        getCurrEvoChainJSON(prev, curr);
      } else {
        curr.push([formatEvoChain(pokemon)]);
      }
      getNextEvoChainJSON(pokemon.evos, evo);
      const result = prevEvo.concat(curr, evo);
      return setArrEvoList(result);
    },
    [getPrevEvoChainJSON, getCurrEvoChainJSON, getNextEvoChainJSON]
  );

  const getPrevEvoChainStore = (poke: any, result: any[]) => {
    const evoList: any[] = [];
    const pokemon = evoData.filter((pokemon: { evo_list: any[] }) =>
      pokemon.evo_list.find((evo: { evo_to_id: number; evo_to_form: string }) => evo.evo_to_id === poke.id && evo.evo_to_form === poke.form)
    );
    if (pokemon.length === 0) {
      return;
    }
    pokemon.forEach((evo: { id: number; name: string; form: string }) => {
      evoList.unshift(modelEvoChain(evo));
      getPrevEvoChainStore(evo, result);
    });
    return result.push(evoList);
  };

  const getCurrEvoChainStore = (poke: any, result: any[]) => {
    let evoList: any[] = [];
    const pokemon = evoData.find((pokemon: { evo_list: any[] }) =>
      pokemon.evo_list.find((evo: { evo_to_id: number; evo_to_form: string }) => evo.evo_to_id === poke.id && evo.evo_to_form === poke.form)
    );
    if (!pokemon) {
      evoList.push(modelEvoChain(poke));
    } else {
      evoList = pokemon.evo_list.map((evo: { evo_to_name: string; evo_to_id: number; evo_to_form: string }) =>
        modelEvoChain({
          id: evo.evo_to_id,
          name: evo.evo_to_name + (evo.evo_to_form === '' ? '' : `_${evo.evo_to_form}`),
          form: evo.evo_to_form,
        })
      );
    }
    return result.push(evoList);
  };

  const getNextEvoChainStore = (poke: any, result: any[]) => {
    if (!poke || (poke && poke.evo_list.length === 0)) {
      return;
    }
    const evoList: any[] = poke.evo_list.map((evo: { evo_to_id: number; evo_to_name: string; evo_to_form: string }) =>
      modelEvoChain({
        id: evo.evo_to_id,
        name: evo.evo_to_name + (evo.evo_to_form === '' ? '' : `_${evo.evo_to_form}`),
        form: evo.evo_to_form,
      })
    );
    result.push(evoList);
    poke.evo_list.forEach((evo: { evo_to_id: number; evo_to_name: string; evo_to_form: string }) => {
      const pokemon: any = evoData.find(
        (pokemon: { id: number; form: string }) => pokemon.id === evo.evo_to_id && pokemon.form === evo.evo_to_form
      );
      getNextEvoChainStore(pokemon, result);
    });

    return result;
  };

  const getEvoChainStore = (id: number, forme: { form_name: string; name: string }) => {
    const form = forme.form_name === '' || forme.form_name.includes('mega') ? '' : forme.form_name;
    const result: any[] = [];
    let pokemon: any = evoData.find((pokemon: { id: number; form: string }) => pokemon.id === id && pokemon.form === form.toUpperCase());
    if (!pokemon) {
      pokemon = evoData.find((pokemon: { id: number; form: string }) => pokemon.id === id);
    }
    if (!pokemon) {
      return getEvoChainJSON(id, forme);
    }
    getPrevEvoChainStore(pokemon, result);
    getCurrEvoChainStore(pokemon, result);
    getNextEvoChainStore(pokemon, result);
    return setArrEvoList(result);
  };

  const getGmaxChain = useCallback((id: any, form: { name: string }) => {
    return setArrEvoList([
      [
        {
          name: form.name.replace('-gmax', ''),
          id,
          baby: false,
          form: 'normal',
          gmax: true,
          sprite: convertModelSpritName(form.name.replace('-gmax', '')),
        },
      ],
      [
        {
          name: form.name.replace('-gmax', ''),
          id,
          baby: false,
          form: 'gmax',
          gmax: true,
          sprite: convertModelSpritName(form.name.replace('-gmax', '-gigantamax').replace('-low-key', '')),
        },
      ],
    ]);
  }, []);

  useEffect(() => {
    if (id && forme) {
      if (forme.form_name !== 'gmax') {
        getEvoChainStore(id, forme);
      } else {
        getGmaxChain(id, forme);
      }
    }
  }, [forme, id]);

  const handlePokeID = (id: string) => {
    if (id !== id.toString()) {
      onSetIDPoke(parseInt(id));
    }
  };

  const getQuestEvo = (prevId: number, form: any) => {
    try {
      return evoData
        .find((item: { evo_list: any[] }) =>
          item.evo_list.find(
            (value: { evo_to_form: string | any[]; evo_to_id: any }) => value.evo_to_form.includes(form) && value.evo_to_id === prevId
          )
        )
        .evo_list.find(
          (item: { evo_to_form: string | any[]; evo_to_id: any }) => item.evo_to_form.includes(form) && item.evo_to_id === prevId
        );
    } catch (error) {
      try {
        return evoData
          .find((item: { evo_list: any[] }) => item.evo_list.find((value: { evo_to_id: any }) => value.evo_to_id === prevId))
          .evo_list.find((item: { evo_to_id: any }) => item.evo_to_id === prevId);
      } catch (error) {
        return {
          candyCost: 0,
          quest: {},
        };
      }
    }
  };

  const renderImgGif = (value: { sprite: string; id: number }) => {
    return (
      <img
        className="pokemon-sprite"
        id="img-pokemon"
        alt="img-pokemon"
        src={
          value.id >= 894 ? APIService.getPokeSprite(value.id) : APIService.getPokemonAsset('pokemon-animation', 'all', value.sprite, 'gif')
        }
        onError={(e: any) => {
          e.onerror = null;
          APIService.getFetchUrl(e.target.currentSrc)
            .then(() => {
              e.target.src = APIService.getPokeSprite(value.id);
            })
            .catch(() => {
              e.target.src = APIService.getPokeFullSprite(value.id);
            });
        }}
      />
    );
  };

  const renderImageEvo = (value: any, chain: string | any[], evo: any, index: string | number, evoCount: number) => {
    const form = value.form ?? forme.form_name;
    let offsetY = 35;
    offsetY += value.baby ? 20 : 0;
    offsetY += arrEvoList.length === 1 ? 20 : 0;

    const startAnchor: any = index > 0 ? { position: 'bottom', offset: { y: offsetY } } : { position: 'right', offset: { x: -8 } };
    const data = getQuestEvo(parseInt(value.id), form.toUpperCase());
    return (
      <Fragment>
        <span id={'evo-' + evo + '-' + index}>
          {evo > 0 && (
            <Xarrow
              labels={{
                end: (
                  <div className="position-absolute" style={{ left: -40 }}>
                    {!value.gmax && (
                      <span className="d-flex align-items-center caption" style={{ width: 'max-content' }}>
                        <div className="bg-poke-candy" style={{ backgroundColor: computeCandyBgColor(candyData, value.id) }}>
                          <div
                            className="poke-candy"
                            style={{
                              background: computeCandyColor(candyData, value.id),
                              width: 20,
                              height: 20,
                            }}
                          />
                        </div>
                        <span style={{ marginLeft: 2 }}>{`x${data.candyCost}`}</span>
                      </span>
                    )}
                    {Object.keys(data.quest).length > 0 && (
                      <Fragment>
                        {data.quest.randomEvolution && (
                          <span className="caption">
                            <QuestionMarkIcon fontSize="small" />
                          </span>
                        )}
                        {data.quest.genderRequirement && (
                          <span className="caption">
                            {form === 'male' ? (
                              <MaleIcon fontSize="small" />
                            ) : (
                              <Fragment>
                                {form === 'female' ? (
                                  <FemaleIcon fontSize="small" />
                                ) : (
                                  <Fragment>
                                    {data.quest.genderRequirement === 'MALE' ? (
                                      <MaleIcon fontSize="small" />
                                    ) : (
                                      <FemaleIcon fontSize="small" />
                                    )}
                                  </Fragment>
                                )}
                              </Fragment>
                            )}
                          </span>
                        )}
                        {data.quest.kmBuddyDistanceRequirement && (
                          <span className="caption">
                            {data.quest.mustBeBuddy ? (
                              <div className="d-flex align-items-end">
                                <DirectionsWalkIcon fontSize="small" />
                                <PetsIcon sx={{ fontSize: '1rem' }} />
                              </div>
                            ) : (
                              <DirectionsWalkIcon fontSize="small" />
                            )}{' '}
                            {`${data.quest.kmBuddyDistanceRequirement}km`}
                          </span>
                        )}
                        {data.quest.onlyDaytime && (
                          <span className="caption">
                            <WbSunnyIcon fontSize="small" />
                          </span>
                        )}
                        {data.quest.onlyNighttime && (
                          <span className="caption">
                            <DarkModeIcon fontSize="small" />
                          </span>
                        )}
                        {data.quest.evolutionItemRequirement && (
                          <img alt="img-item-required" height={20} src={APIService.getItemEvo(data.quest.evolutionItemRequirement)} />
                        )}
                        {data.quest.lureItemRequirement && (
                          <img alt="img-troy-required" height={20} src={APIService.getItemTroy(data.quest.lureItemRequirement)} />
                        )}
                        {data.quest.onlyUpsideDown && (
                          <span className="caption">
                            <SecurityUpdateIcon fontSize="small" />
                          </span>
                        )}
                        {data.quest.condition && (
                          <span className="caption">
                            {data.quest.condition.desc === 'THROW_TYPE' && (
                              <Fragment>
                                <CallMadeIcon fontSize="small" />
                                <span>{`${capitalize(data.quest.condition.throwType)} x${data.quest.goal}`}</span>
                              </Fragment>
                            )}
                            {data.quest.condition.desc === 'POKEMON_TYPE' && (
                              <div className="d-flex align-items-center" style={{ marginTop: 5 }}>
                                {data.quest.condition.pokemonType.map((value: string, index: React.Key) => (
                                  <img
                                    key={index}
                                    alt="img-stardust"
                                    height={20}
                                    src={APIService.getTypeSprite(value)}
                                    onError={(e: any) => {
                                      e.onerror = null;
                                      e.target.src = APIService.getPokeSprite(0);
                                    }}
                                  />
                                ))}
                                <span style={{ marginLeft: 2 }}>{`x${data.quest.goal}`}</span>
                              </div>
                            )}
                            {data.quest.condition.desc === 'WIN_RAID_STATUS' && (
                              <Fragment>
                                <SportsMartialArtsIcon fontSize="small" />
                                <span>{`x${data.quest.goal}`}</span>
                              </Fragment>
                            )}
                          </span>
                        )}
                        {data.quest.type && data.quest.type === 'BUDDY_EARN_AFFECTION_POINTS' && (
                          <span className="caption">
                            <Fragment>
                              <FavoriteIcon fontSize="small" sx={{ color: 'red' }} />
                              <span>{`x${data.quest.goal}`}</span>
                            </Fragment>
                          </span>
                        )}
                        {data.quest.type && data.quest.type === 'BUDDY_FEED' && (
                          <span className="caption">
                            <Fragment>
                              <RestaurantIcon fontSize="small" />
                              <span>{`x${data.quest.goal}`}</span>
                            </Fragment>
                          </span>
                        )}
                      </Fragment>
                    )}
                  </div>
                ),
              }}
              strokeWidth={2}
              path="grid"
              startAnchor={startAnchor}
              endAnchor={{ position: 'left', offset: { x: 8 } }}
              start={`evo-${evo - 1}-${chain.length > 1 ? 0 : index}`}
              end={`evo-${evo}-${chain.length > 1 ? index : 0}`}
            />
          )}
          {evoCount > 1 ? (
            <Fragment>
              {chain.length > 1 || (chain.length === 1 && form.form_name !== '') ? (
                <Fragment>
                  {form !== '' && !form.includes('mega') ? (
                    <ThemeProvider theme={theme}>
                      <Badge
                        color="secondary"
                        overlap="circular"
                        badgeContent={splitAndCapitalize(form, '-', ' ')}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'left',
                        }}
                      >
                        <Badge color="primary" overlap="circular" badgeContent={evo + 1} sx={{ width: 96 }}>
                          {renderImgGif(value)}
                        </Badge>
                      </Badge>
                    </ThemeProvider>
                  ) : (
                    <Badge color="primary" overlap="circular" badgeContent={evo + 1} sx={{ width: 96 }}>
                      {renderImgGif(value)}
                    </Badge>
                  )}
                </Fragment>
              ) : (
                <Badge color="primary" overlap="circular" badgeContent={evo + 1} sx={{ width: 96 }}>
                  {renderImgGif(value)}
                </Badge>
              )}
            </Fragment>
          ) : (
            <Fragment>{renderImgGif(value)}</Fragment>
          )}
          <div id="id-pokemon" style={{ color: 'black' }}>
            <b>#{value.id}</b>
          </div>
          <div>
            <b className="link-title">{splitAndCapitalize(value.name, '-', ' ')}</b>
          </div>
        </span>
        {value.baby && <span className="caption text-danger">(Baby)</span>}
        {arrEvoList.length === 1 && <span className="caption text-danger">(No Evolution)</span>}
        <p>{value.id === id && <span className="caption">Current</span>}</p>
      </Fragment>
    );
  };

  return (
    <Fragment>
      <h4 className="title-evo">
        <b>Evolution Chain</b>
        <OverlayTrigger
          placement="auto"
          overlay={
            <PopoverConfig id="popover-info-evo">
              <span className="info-evo">
                <span className="d-block caption">
                  - <img alt="img-stardust" height={20} src={APIService.getItemSprite('Item_1301')} /> : Candy of pokemon.
                </span>
                <span className="d-block caption">
                  - <QuestionMarkIcon fontSize="small" /> : Random evolution.
                </span>
                <span className="d-block caption">
                  - <MaleIcon fontSize="small" />/<FemaleIcon fontSize="small" /> : Only once gender can evolution.
                </span>
                <span className="d-block caption">
                  - <DirectionsWalkIcon fontSize="small" />
                  <PetsIcon sx={{ fontSize: '1rem' }} /> : Walk together with buddy.
                </span>
                <span className="d-block caption">
                  - <DirectionsWalkIcon fontSize="small" /> : Buddy walk with trainer.
                </span>
                <span className="d-block caption">
                  - <WbSunnyIcon fontSize="small" /> : Evolution during at day.
                </span>
                <span className="d-block caption">
                  - <DarkModeIcon fontSize="small" /> : Evolution during at night.
                </span>
                <span className="d-block caption">
                  - <img alt="img-troy-required" height={20} src={APIService.getItemTroy('')} /> : Evolution in lure module.
                </span>
                <span className="d-block caption">
                  - <SecurityUpdateIcon fontSize="small" /> : Evolution at upside down phone.
                </span>
                <span className="d-block caption">
                  - <CallMadeIcon fontSize="small" /> : Throw pokeball with condition.
                </span>
                <span className="d-block caption">
                  - <img alt="img-stardust" height={20} src={APIService.getPokeSprite(0)} /> : Catch pokemon with type.
                </span>
                <span className="d-block caption">
                  - <SportsMartialArtsIcon fontSize="small" /> : Win raid.
                </span>
                <span className="d-block caption">
                  - <FavoriteIcon fontSize="small" sx={{ color: 'red' }} /> : Evolution with affection points.
                </span>
                <span className="d-block caption">
                  - <RestaurantIcon fontSize="small" /> : Buddy feed.
                </span>
              </span>
            </PopoverConfig>
          }
        >
          <span className="tooltips-info">
            <InfoOutlinedIcon color="primary" />
          </span>
        </OverlayTrigger>
      </h4>
      <div className="evo-container scroll-evolution">
        <ul
          className="ul-evo d-inline-flex"
          style={{
            columnGap: arrEvoList.length > 0 ? window.innerWidth / (6.5 * arrEvoList.length) : 0,
          }}
        >
          {arrEvoList.map((values: any[], evo: React.Key) => (
            <li key={evo} className="img-form-gender-group li-evo">
              <ul className="ul-evo d-flex flex-column">
                {values.map((value: { id: string; name: string }, index: React.Key) => (
                  <li key={index} className="img-form-gender-group img-evo-group li-evo">
                    {onSetIDPoke ? (
                      <div
                        className="select-evo"
                        onClick={() => {
                          handlePokeID(value.id);
                        }}
                        title={`#${value.id} ${splitAndCapitalize(value.name, '-', ' ')}`}
                      >
                        {renderImageEvo(value, values, evo, index, arrEvoList.length)}
                      </div>
                    ) : (
                      <Link
                        className="select-evo"
                        to={'/pokemon/' + value.id}
                        title={`#${value.id} ${splitAndCapitalize(value.name, '-', ' ')}`}
                      >
                        {renderImageEvo(value, values, evo, index, arrEvoList.length)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default Evolution;
