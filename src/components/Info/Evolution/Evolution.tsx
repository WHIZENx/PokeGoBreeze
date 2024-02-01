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
import Xarrow, { cAnchorEdge } from 'react-xarrows';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';

import './Evolution.scss';
import { useTheme } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { capitalize, convertFormGif, convertModelSpritName, splitAndCapitalize } from '../../../util/Utils';

import { OverlayTrigger } from 'react-bootstrap';
import PopoverConfig from '../../Popover/PopoverConfig';
import { useSelector } from 'react-redux';
import Candy from '../../Sprites/Candy/Candy';
import { StoreState } from '../../../store/models/state.model';
import { PokemonDataModel } from '../../../core/models/pokemon.model';
import { EvolutionModel } from '../../../core/models/evolution.model';
import {
  FORM_GALARIAN,
  FORM_GMAX,
  FORM_HISUIAN,
  FORM_MEGA,
  FORM_NORMAL,
  FORM_PURIFIED,
  FORM_SHADOW,
  FORM_STANDARD,
} from '../../../util/Constants';
import { FormModel } from '../../../core/models/API/form.model';
import { ReduxRouterState } from '@lagunovsky/redux-react-router';

interface PokemonEvo {
  prev?: string | undefined;
  name: string;
  id: number;
  baby: boolean;
  form: string;
  gmax: boolean;
  sprite: string;
  purified?: boolean;
}

const customTheme = createTheme({
  palette: {
    secondary: {
      main: '#a6efff80',
      contrastText: 'gray',
      fontSize: '0.75rem',
    },
  },
} as any);

const Evolution = (props: {
  forme: FormModel | undefined;
  region: string;
  formDefault: boolean;
  id: number | undefined;
  // eslint-disable-next-line no-unused-vars
  onSetIDPoke?: (id: number) => void;
  pokemonRouter: ReduxRouterState;
  purified: boolean | undefined;
}) => {
  const theme = useTheme();
  const pokemonData = useSelector((state: StoreState) => state.store.data?.pokemonData ?? []);
  const evoData = useSelector((state: StoreState) => state.store.data?.evolution ?? []);
  const [arrEvoList, setArrEvoList]: [PokemonEvo[][], React.Dispatch<React.SetStateAction<PokemonEvo[][]>>] = useState(
    [] as PokemonEvo[][]
  );

  const formatEvoChain = (pokemon: PokemonDataModel | undefined): PokemonEvo => {
    return {
      name: pokemon?.baseSpecies ? pokemon?.baseSpecies.toLowerCase() : pokemon?.name.toLowerCase() ?? '',
      id: pokemon?.num ?? 0,
      baby: pokemon?.isBaby ?? false,
      form: pokemon?.forme ?? '',
      gmax: false,
      sprite: convertModelSpritName(pokemon?.name ?? ''),
    };
  };

  const pokeSetName = (name: string) => {
    return name.replace('_FEMALE', '_F').replace('_MALE', '_M').replaceAll('_', '-').replaceAll('MR', 'MR.');
  };

  const modelEvoChain = (pokemon: EvolutionModel): PokemonEvo => {
    pokemon.name = pokemon.name.replace(`_${FORM_GALARIAN}`, '_GALAR').replace(`_${FORM_HISUIAN}`, '_HISUI');
    return {
      prev: pokemon.prev,
      name: pokemon.form !== '' ? pokeSetName(pokemon.name.replace(`_${pokemon.form}`, '')) : pokeSetName(pokemon.name),
      id: pokemon.id,
      baby: false,
      form: pokemon.id === 718 && pokemon.form === '' ? 'TEN_PERCENT' : pokemon.form,
      gmax: false,
      sprite: convertModelSpritName(pokemon.name),
      purified: pokemon.canPurified ?? false,
    };
  };

  const getPrevEvoChainJSON = useCallback((name: string, arr: PokemonEvo[][]) => {
    if (name) {
      const pokemon = pokemonData.find((pokemon) => pokemon.name === name);
      if (pokemon) {
        arr.unshift([formatEvoChain(pokemon)]);
        getPrevEvoChainJSON(pokemon.prevo ?? '', arr);
      }
    }
  }, []);

  const getCurrEvoChainJSON = useCallback((prev: PokemonDataModel, arr: PokemonEvo[][]) => {
    const evo: PokemonEvo[] = [];
    prev.evos.forEach((name) => {
      const pokemon = pokemonData.find((pokemon) => pokemon.name === name);
      if (pokemon) {
        evo.push(formatEvoChain(pokemon));
      }
    });
    arr.push(evo);
  }, []);

  const getNextEvoChainJSON = useCallback((evos: string[], arr: PokemonEvo[][]) => {
    if (evos.length === 0) {
      return;
    }
    arr.push(
      evos
        .filter((name) => pokemonData.find((pokemon) => pokemon.name === name))
        .map((name) => {
          const pokemon = pokemonData.find((pokemon) => pokemon.name === name);
          return formatEvoChain(pokemon);
        })
    );
    evos.forEach((name) => {
      const pokemon = pokemonData.find((pokemon) => pokemon.name === name);
      if (pokemon) {
        getNextEvoChainJSON(pokemon.evos, arr);
      }
    });
  }, []);

  const getEvoChainJSON = useCallback(
    (id: number, forme: FormModel) => {
      let form = forme.form_name === '' || forme.form_name?.toUpperCase().includes(FORM_MEGA) ? null : forme.form_name;
      if (forme.form_name === '10') {
        form += '%';
      }
      if (forme.name === 'necrozma-dawn') {
        form += '-wings';
      } else if (forme.name === 'necrozma-dusk') {
        form += '-mane';
      }
      let pokemon = pokemonData.find(
        (pokemon) => pokemon.num === id && (pokemon.forme ? pokemon.forme.toLowerCase() : pokemon.forme) === form
      );
      if (!pokemon) {
        pokemon = pokemonData.find((pokemon) => pokemon.num === id && pokemon.forme === null);
      }

      const prevEvo: PokemonEvo[][] = [],
        curr: PokemonEvo[][] = [],
        evo: PokemonEvo[][] = [];
      if (!pokemon) {
        return;
      }
      getPrevEvoChainJSON(pokemon?.prevo ?? '', prevEvo);
      const prev = pokemonData.find((p) => p.name === pokemon?.prevo);
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

  const getPrevEvoChainStore = (poke: EvolutionModel, result: PokemonEvo[][]) => {
    const evoList: PokemonEvo[] = [];
    const pokemon = evoData.filter((pokemon) => pokemon.evo_list.find((evo) => evo.evo_to_id === poke.id && evo.evo_to_form === poke.form));
    if (pokemon.length === 0) {
      return;
    }
    pokemon
      .filter((p) => !(p.id === 718 && p.form === ''))
      .forEach((evo) => {
        evoList.unshift(modelEvoChain(evo));
        getPrevEvoChainStore(evo, result);
      });
    return result.push(evoList);
  };

  const getCurrEvoChainStore = (poke: EvolutionModel, result: PokemonEvo[][]) => {
    let evoList: PokemonEvo[] = [];
    const pokemon = evoData.find((pokemon) => pokemon.evo_list.find((evo) => evo.evo_to_id === poke.id && evo.evo_to_form === poke.form));
    if (!pokemon) {
      evoList.push(modelEvoChain(poke));
    } else {
      evoList =
        pokemon.evo_list
          ?.map((evo) =>
            modelEvoChain({
              id: evo.evo_to_id,
              name: evo.evo_to_name + (evo.evo_to_form === '' ? '' : `_${evo.evo_to_form}`),
              form: evo.evo_to_form,
              canPurified: evo.purificationEvoCandyCost ? true : false,
              evo_list: [],
              temp_evo: [],
            })
          )
          .filter((pokemon) => pokemon.id === poke.id) ?? [];
    }
    return result.push(evoList);
  };

  const getNextEvoChainStore = (poke: EvolutionModel | undefined, result: PokemonEvo[][]) => {
    if (!poke || (poke && poke.evo_list.length === 0)) {
      return;
    }
    const evoList = poke.evo_list.map((evo) =>
      modelEvoChain({
        id: evo.evo_to_id,
        name: evo.evo_to_name + (evo.evo_to_form === '' ? '' : `_${evo.evo_to_form}`),
        form: evo.evo_to_form,
        prev: poke.name,
        canPurified: evo.purificationEvoCandyCost ? true : false,
        evo_list: [],
        temp_evo: [],
      })
    );
    if (evoList) {
      if (result.length === 3) {
        result.at(2)?.push(...evoList);
      } else {
        result.push(evoList);
      }
    }

    poke.evo_list.forEach((evo) => {
      const pokemon = evoData.find((pokemon) => pokemon.id === evo.evo_to_id && pokemon.form === evo.evo_to_form);
      getNextEvoChainStore(pokemon, result);
    });

    return result;
  };

  const getEvoChainStore = (id: number, forme: FormModel) => {
    const form =
      forme.form_name === '' || forme.form_name?.toUpperCase().includes(FORM_MEGA) || (forme.is_default && forme.id === id)
        ? ''
        : forme.form_name.toUpperCase().replace(`-${FORM_SHADOW}`, '').replace(`-${FORM_PURIFIED}`, '').replace(`-${FORM_STANDARD}`, '');
    const result: PokemonEvo[][] = [];
    let pokemon = evoData.find((pokemon) => pokemon.id === id && pokemon.form === form);
    if (!pokemon) {
      pokemon = evoData.find((pokemon) => pokemon.id === id);
    }
    if (!pokemon) {
      return getEvoChainJSON(id, forme);
    }
    getPrevEvoChainStore(pokemon, result);
    getCurrEvoChainStore(pokemon, result);
    getNextEvoChainStore(pokemon, result);
    return setArrEvoList(result);
  };

  const getGmaxChain = useCallback((id: number, form: FormModel) => {
    return setArrEvoList([
      [
        {
          name: form.name.replace('-gmax', ''),
          id,
          baby: false,
          form: FORM_NORMAL.toLowerCase(),
          gmax: true,
          sprite: convertModelSpritName(form.name.replace('-gmax', '')),
        },
      ],
      [
        {
          name: form.name.replace('-gmax', ''),
          id,
          baby: false,
          form: FORM_GMAX.toLowerCase(),
          gmax: true,
          sprite: convertModelSpritName(form.name.replace('-gmax', '-gigantamax').replace('-low-key', '')),
        },
      ],
    ]);
  }, []);

  useEffect(() => {
    if (props.id && props.forme) {
      if (props.forme.form_name?.toUpperCase() !== FORM_GMAX) {
        getEvoChainStore(props.id, props.forme);
      } else {
        getGmaxChain(props.id, props.forme);
      }
    }
  }, [props.forme, props.id]);

  const getQuestEvo = (prevId: number, form: string) => {
    try {
      return evoData
        .find((item) => item.evo_list.find((value) => value.evo_to_form.includes(form) && value.evo_to_id === prevId))
        ?.evo_list.find((item) => item.evo_to_form.includes(form) && item.evo_to_id === prevId);
    } catch (error) {
      try {
        return evoData
          .find((item) => item.evo_list.find((value) => value.evo_to_id === prevId))
          ?.evo_list.find((item) => item.evo_to_id === prevId);
      } catch (error) {
        return {
          candyCost: 0,
          purificationEvoCandyCost: 0,
          quest: {},
        };
      }
    }
  };

  const renderImgGif = (value: PokemonEvo) => {
    return (
      <>
        {props.purified && <img height={30} alt="img-shadow" className="purified-icon" src={APIService.getPokePurified()} />}
        <img
          className="pokemon-sprite"
          id="img-pokemon"
          alt="img-pokemon"
          src={
            value.id >= 894
              ? APIService.getPokeSprite(value.id)
              : APIService.getPokemonAsset('pokemon-animation', 'all', convertFormGif(value.sprite), 'gif')
          }
          onError={(e) => {
            e.currentTarget.onerror = null;
            APIService.getFetchUrl(e.currentTarget.currentSrc)
              .then(() => {
                e.currentTarget.src = APIService.getPokeSprite(value.id);
              })
              .catch(() => {
                e.currentTarget.src = APIService.getPokeFullSprite(value.id);
              });
          }}
        />
      </>
    );
  };

  const renderImageEvo = (value: PokemonEvo, chain: PokemonEvo[], evo: number, index: number, evoCount: number) => {
    const form = value.form ?? props.forme?.form_name ?? '';
    let offsetY = 35;
    offsetY += value.baby ? 20 : 0;
    offsetY += arrEvoList.length === 1 ? 20 : 0;

    const startAnchor = {
      position: index > 0 ? cAnchorEdge[4] : cAnchorEdge[2],
      offset:
        index > 0
          ? {
              x: arrEvoList[Math.max(0, evo - 1)].length > 1 ? 40 : 0,
              y: arrEvoList[Math.max(0, evo - 1)].length > 1 ? offsetY + 82.33 : offsetY,
            }
          : { x: -8 },
    };
    const data = getQuestEvo(parseInt(value.id.toString()), form?.toUpperCase());
    return (
      <Fragment>
        <span id={'evo-' + evo + '-' + index}>
          {evo > 0 && (
            <Xarrow
              labels={{
                end: (
                  <div className="position-absolute" style={{ left: -40 }}>
                    {!value.gmax && (
                      <div>
                        {(data?.candyCost || data?.purificationEvoCandyCost) && (
                          <span
                            className="d-flex align-items-center caption"
                            style={{ color: (theme.palette as any).customText.caption, width: 'max-content' }}
                          >
                            <Candy id={parseInt(value.id.toString())} />
                            <span style={{ marginLeft: 2 }}>{`x${props.purified ? data?.purificationEvoCandyCost : data?.candyCost}`}</span>
                          </span>
                        )}
                        {props.purified && (
                          <span className="d-block text-end caption text-danger">{`-${
                            (data?.candyCost ?? 0) - (data?.purificationEvoCandyCost ?? 0)
                          }`}</span>
                        )}
                      </div>
                    )}
                    {Object.keys(data?.quest ?? {}).length > 0 && (
                      <Fragment>
                        {data?.quest.randomEvolution && (
                          <span className="caption">
                            <QuestionMarkIcon fontSize="small" />
                          </span>
                        )}
                        {data?.quest.genderRequirement && (
                          <span className="caption">
                            {form === 'male' ? (
                              <MaleIcon fontSize="small" />
                            ) : (
                              <Fragment>
                                {form === 'female' ? (
                                  <FemaleIcon fontSize="small" />
                                ) : (
                                  <Fragment>
                                    {data?.quest.genderRequirement === 'MALE' ? (
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
                        {data?.quest.kmBuddyDistanceRequirement && (
                          <span className="caption">
                            {data?.quest.mustBeBuddy ? (
                              <div className="d-flex align-items-end">
                                <DirectionsWalkIcon fontSize="small" />
                                <PetsIcon sx={{ fontSize: '1rem' }} />
                              </div>
                            ) : (
                              <DirectionsWalkIcon fontSize="small" />
                            )}{' '}
                            {`${data?.quest.kmBuddyDistanceRequirement}km`}
                          </span>
                        )}
                        {data?.quest.onlyDaytime && (
                          <span className="caption">
                            <WbSunnyIcon fontSize="small" />
                          </span>
                        )}
                        {data?.quest.onlyNighttime && (
                          <span className="caption">
                            <DarkModeIcon fontSize="small" />
                          </span>
                        )}
                        {data?.quest.evolutionItemRequirement && (
                          <img alt="img-item-required" height={20} src={APIService.getItemEvo(data?.quest.evolutionItemRequirement)} />
                        )}
                        {data?.quest.lureItemRequirement && (
                          <img alt="img-troy-required" height={20} src={APIService.getItemTroy(data?.quest.lureItemRequirement)} />
                        )}
                        {data?.quest.onlyUpsideDown && (
                          <span className="caption">
                            <SecurityUpdateIcon fontSize="small" />
                          </span>
                        )}
                        {data?.quest.condition && (
                          <span className="caption">
                            {data?.quest.condition.desc === 'THROW_TYPE' && (
                              <Fragment>
                                <CallMadeIcon fontSize="small" />
                                <span>{`${capitalize(data?.quest.condition.throwType)} x${data?.quest.goal}`}</span>
                              </Fragment>
                            )}
                            {data?.quest.condition.desc === 'POKEMON_TYPE' && (
                              <div className="d-flex align-items-center" style={{ marginTop: 5 }}>
                                {data?.quest.condition.pokemonType.map((value: string, index: number) => (
                                  <img
                                    key={index}
                                    alt="img-stardust"
                                    height={20}
                                    src={APIService.getTypeSprite(value)}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = APIService.getPokeSprite(0);
                                    }}
                                  />
                                ))}
                                <span style={{ marginLeft: 2 }}>{`x${data?.quest.goal}`}</span>
                              </div>
                            )}
                            {data?.quest.condition.desc === 'WIN_RAID_STATUS' && (
                              <Fragment>
                                <SportsMartialArtsIcon fontSize="small" />
                                <span>{`x${data?.quest.goal}`}</span>
                              </Fragment>
                            )}
                          </span>
                        )}
                        {data?.quest.type && data?.quest.type === 'BUDDY_EARN_AFFECTION_POINTS' && (
                          <span className="caption">
                            <Fragment>
                              <FavoriteIcon fontSize="small" sx={{ color: 'red' }} />
                              <span>{`x${data?.quest.goal}`}</span>
                            </Fragment>
                          </span>
                        )}
                        {data?.quest.type && data?.quest.type === 'BUDDY_FEED' && (
                          <span className="caption">
                            <Fragment>
                              <RestaurantIcon fontSize="small" />
                              <span>{`x${data?.quest.goal}`}</span>
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
              start={`evo-${Math.max(0, evo - 1)}-${chain.length > 1 ? 0 : index}`}
              end={`evo-${evo}-${chain.length > 1 ? index : 0}`}
            />
          )}
          {evoCount > 1 ? (
            <Fragment>
              {chain.length > 1 || (chain.length === 1 && form !== '') ? (
                <Fragment>
                  {form !== '' && !form?.toUpperCase().includes(FORM_MEGA) ? (
                    <ThemeProvider theme={customTheme}>
                      <Badge
                        color="secondary"
                        overlap="circular"
                        badgeContent={splitAndCapitalize(form.replace('_', '-'), '-', ' ')}
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
          <div id="id-pokemon" style={{ color: theme.palette.text.primary }}>
            <b>#{value.id}</b>
          </div>
          <div>
            <b className="link-title">{splitAndCapitalize(value.name, '-', ' ')}</b>
          </div>
        </span>
        {value.baby && <span className="caption text-danger">(Baby)</span>}
        {arrEvoList.length === 1 && <span className="caption text-danger">(No Evolution)</span>}
        <p>
          {value.id === props.id && (
            <span className="caption" style={{ color: (theme.palette as any).customText.caption }}>
              Current
            </span>
          )}
        </p>
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
          {arrEvoList.map((values, evo) => (
            <li key={evo} className="img-form-gender-group li-evo">
              <ul className="ul-evo d-flex flex-column">
                {values.map((value, index) => (
                  <li key={index} className="img-form-gender-group img-evo-group li-evo">
                    {props.onSetIDPoke ? (
                      <div
                        className="select-evo"
                        onClick={() => {
                          if (props.pokemonRouter?.action === 'POP') {
                            props.pokemonRouter.action = null as any;
                          }
                          props.onSetIDPoke?.(value.id);
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
