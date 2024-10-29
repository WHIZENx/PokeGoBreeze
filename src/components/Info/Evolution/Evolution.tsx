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
import React, { Fragment, useEffect, useState } from 'react';
import Xarrow, { cAnchorEdge } from 'react-xarrows';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';

import './Evolution.scss';
import { useTheme } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { capitalize, convertFormGif, convertModelSpritName, convertPokemonAPIDataName, splitAndCapitalize } from '../../../util/utils';

import { OverlayTrigger } from 'react-bootstrap';
import PopoverConfig from '../../Popover/PopoverConfig';
import { useSelector } from 'react-redux';
import Candy from '../../Sprites/Candy/Candy';
import { StoreState } from '../../../store/models/state.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { EvoList, EvolutionModel, EvolutionQuest, IEvolution } from '../../../core/models/evolution.model';
import {
  FORM_GALARIAN,
  FORM_GMAX,
  FORM_HISUIAN,
  FORM_MEGA,
  FORM_NORMAL,
  FORM_PURIFIED,
  FORM_SHADOW,
  FORM_STANDARD,
} from '../../../util/constants';
import { IForm } from '../../../core/models/API/form.model';
import { IEvolutionComponent } from '../../models/component.model';
import { TypeSex } from '../../../enums/type.enum';
import { Action } from 'history';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { getValueOrDefault, isEmpty, isEqual, isInclude, isIncludeList, isNotEmpty } from '../../../util/extension';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import { ConditionType, QuestType } from '../../../core/enums/option.enum';

interface IPokemonEvo {
  prev?: string;
  name: string;
  id: number;
  isBaby: boolean;
  form: string;
  isGmax: boolean;
  sprite: string;
  isPurified?: boolean;
}

class PokemonEvo implements IPokemonEvo {
  prev?: string;
  name: string;
  id: number;
  isBaby: boolean;
  form: string;
  isGmax: boolean;
  sprite: string;
  isPurified?: boolean;

  constructor(name: string, id: number, form: string, sprite: string, prev = '', isGmax = false, isBaby = false, isPurified = false) {
    this.prev = prev;
    this.name = name;
    this.id = id;
    this.isBaby = isBaby;
    this.form = form;
    this.isGmax = isGmax;
    this.sprite = sprite;
    this.isPurified = isPurified;
  }
}

const customTheme = createTheme({
  palette: {
    secondary: {
      main: '#a6efff80',
      contrastText: 'gray',
      fontSize: '0.75rem',
    },
  },
} as ThemeModify);

const Evolution = (props: IEvolutionComponent) => {
  const theme = useTheme<ThemeModify>();
  const pokemonData = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.pokemon));
  const [arrEvoList, setArrEvoList] = useState<IPokemonEvo[][]>([]);

  const formatEvoChain = (pokemon: IPokemonData | undefined) => {
    return new PokemonEvo(
      getValueOrDefault(String, pokemon?.baseSpecies ? pokemon.baseSpecies.toLowerCase() : pokemon?.name.toLowerCase()),
      getValueOrDefault(Number, pokemon?.num),
      getValueOrDefault(String, pokemon?.forme),
      convertModelSpritName(getValueOrDefault(String, pokemon?.name)),
      undefined,
      false,
      getValueOrDefault(Boolean, pokemon?.isBaby)
    );
  };

  const pokeSetName = (name: string) => {
    return name.replace(`_${FORM_NORMAL}`, '').replaceAll('_', '-').replace('MR', 'MR.');
  };

  const modelEvoChain = (pokemon: IEvolution) => {
    const name = pokeSetName(
      !isEqual(pokemon.form, FORM_NORMAL, EqualMode.IgnoreCaseSensitive) ? pokemon.name.replace(`_${pokemon.form}`, '') : pokemon.name
    );
    let form =
      pokemon.id === 718 && isEmpty(pokemon.form) ? 'TEN_PERCENT' : pokemon.form.replace(/^STANDARD$/, '').replace(`_${FORM_STANDARD}`, '');
    form = form.replace(FORM_GALARIAN, 'GALAR').replace(FORM_HISUIAN, 'HISUI');
    let sprite = '';
    if (pokemon.id === 664 || pokemon.id === 665) {
      sprite = pokemon.pokemonId?.toLowerCase() ?? pokemon.name;
    } else {
      sprite = convertModelSpritName(form ? `${name}_${form}` : name);
    }

    return new PokemonEvo(
      name,
      pokemon.id,
      form,
      sprite,
      pokemon.prev,
      false,
      getValueOrDefault(Boolean, pokemon.isBaby),
      getValueOrDefault(Boolean, pokemon.canPurified)
    );
  };

  const getPrevEvoChainJSON = (name: string, arr: IPokemonEvo[][]) => {
    if (name) {
      const pokemon = pokemonData.find((pokemon) => isEqual(pokemon.name, name));
      if (pokemon) {
        arr.unshift([formatEvoChain(pokemon)]);
        getPrevEvoChainJSON(getValueOrDefault(String, pokemon.prevo), arr);
      }
    }
  };

  const getCurrEvoChainJSON = (prev: IPokemonData, arr: IPokemonEvo[][]) => {
    const evo: IPokemonEvo[] = [];
    prev.evos.forEach((name) => {
      const pokemon = pokemonData.find((pokemon) => isEqual(pokemon.name, name));
      if (pokemon) {
        evo.push(formatEvoChain(pokemon));
      }
    });
    arr.push(evo);
  };

  const getNextEvoChainJSON = (evos: string[], arr: IPokemonEvo[][]) => {
    if (!isNotEmpty(evos)) {
      return;
    }
    if (arr.flatMap((form) => form).some((p) => !isIncludeList(evos, p.form))) {
      arr.push(
        evos
          .filter((name) => pokemonData.find((pokemon) => isEqual(pokemon.name, name)))
          .map((name) => {
            const pokemon = pokemonData.find((pokemon) => isEqual(pokemon.name, name));
            return formatEvoChain(pokemon);
          })
      );
    }
    evos.forEach((name) => {
      const pokemon = pokemonData.find((pokemon) => isEqual(pokemon.name, name));
      if (pokemon) {
        getNextEvoChainJSON(
          pokemon.evos.filter((e) => !isEqual(e, name)),
          arr
        );
      }
    });
  };

  const getEvoChainJSON = (id: number, forme: IForm) => {
    let form =
      isEmpty(forme.formName) || isInclude(forme.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive)
        ? FORM_NORMAL
        : forme.formName;
    if (forme.formName === '10') {
      form += '%';
    }
    if (forme.name === 'necrozma-dawn') {
      form += '-wings';
    } else if (forme.name === 'necrozma-dusk') {
      form += '-mane';
    }
    if (!form) {
      form = FORM_NORMAL;
    }
    let pokemon = pokemonData.find((pokemon) => pokemon.num === id && isEqual(pokemon.forme, form));
    if (!pokemon) {
      pokemon = pokemonData.find((pokemon) => pokemon.num === id && isEqual(pokemon.forme, FORM_NORMAL));
    }

    const prevEvo: IPokemonEvo[][] = [],
      curr: IPokemonEvo[][] = [],
      evo: IPokemonEvo[][] = [];
    if (!pokemon) {
      return;
    }
    getPrevEvoChainJSON(getValueOrDefault(String, pokemon.prevo), prevEvo);
    const prev = pokemonData.find((p) => isEqual(p.name, pokemon?.prevo));
    if (prev) {
      getCurrEvoChainJSON(prev, curr);
    } else {
      curr.push([formatEvoChain(pokemon)]);
    }
    getNextEvoChainJSON(pokemon.evos, evo);
    const result = prevEvo.concat(curr, evo);
    return setArrEvoList(result);
  };

  const getPrevEvoChainStore = (poke: IPokemonData, result: IPokemonEvo[][]) => {
    const evoList: IPokemonEvo[] = [];
    const pokemon = pokemonData.filter((pokemon) =>
      pokemon.evoList?.find((evo) => evo.evoToId === poke.num && isEqual(evo.evoToForm, poke.forme))
    );
    if (!isNotEmpty(pokemon)) {
      return;
    }
    pokemon
      .filter((p) => !(p.num === 718 && isEqual(p.forme, FORM_NORMAL)))
      .forEach((evo) => {
        evoList.unshift(
          modelEvoChain(
            new EvolutionModel({
              ...evo,
              name: evo.name.replaceAll('-', '_').toUpperCase(),
              id: evo.num,
              form: evo.forme ?? FORM_NORMAL,
              evoList: getValueOrDefault(Array, evo.evoList),
              tempEvo: getValueOrDefault(Array, evo.tempEvo),
              canPurified: getValueOrDefault(Boolean, evo.isShadow),
            })
          )
        );
        getPrevEvoChainStore(evo, result);
      });
    return result.push(evoList);
  };

  const getCurrEvoChainStore = (poke: IPokemonData, result: IPokemonEvo[][]) => {
    let evoList: IPokemonEvo[] = [];
    const pokemon = pokemonData.find((pokemon) =>
      pokemon.evoList?.find((evo) => evo.evoToId === poke.num && isEqual(evo.evoToForm, poke.forme?.replace(`_${FORM_STANDARD}`, '')))
    );
    if (!pokemon) {
      evoList.push(
        modelEvoChain(
          new EvolutionModel({
            ...poke,
            name: getValueOrDefault(String, poke.fullName),
            id: poke.num,
            form: poke.forme ?? FORM_NORMAL,
            evoList: getValueOrDefault(Array, poke.evoList),
            tempEvo: getValueOrDefault(Array, poke.tempEvo),
            canPurified: getValueOrDefault(Boolean, poke.isShadow),
          })
        )
      );
    } else {
      evoList = getValueOrDefault(
        Array,
        pokemon.evoList
          ?.map((evo) =>
            modelEvoChain(
              new EvolutionModel({
                id: evo.evoToId,
                name: evo.evoToName,
                form: evo.evoToForm,
                canPurified: evo.purificationEvoCandyCost > 0,
                evoList: [],
                tempEvo: [],
              })
            )
          )
          .filter((pokemon) => pokemon.id === poke.num)
      );
    }
    return result.push(evoList);
  };

  const getNextEvoChainStore = (poke: IPokemonData | undefined, result: IPokemonEvo[][]) => {
    if (!isNotEmpty(poke?.evoList)) {
      return;
    }
    const evoList = poke?.evoList?.map((evo) =>
      modelEvoChain(
        new EvolutionModel({
          id: evo.evoToId,
          name: evo.evoToName,
          form: evo.evoToForm,
          prev: poke.name,
          canPurified: evo.purificationEvoCandyCost > 0,
          evoList: [],
          tempEvo: [],
        })
      )
    );
    if (evoList && isNotEmpty(evoList)) {
      if (result.length === 3) {
        result.at(2)?.push(...evoList);
      } else {
        result.push(evoList);
      }
    }

    poke?.evoList?.forEach((evo) => {
      const pokemon = pokemonData.find((pokemon) => pokemon.num === evo.evoToId && isEqual(pokemon.forme, evo.evoToForm));
      getNextEvoChainStore(pokemon, result);
    });

    return result;
  };

  const getEvoChainStore = (id: number, forme: IForm) => {
    const formName = getValueOrDefault(String, forme.formName.toUpperCase());
    const form =
      isEmpty(formName) || isInclude(formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive)
        ? FORM_NORMAL
        : forme.isPurified || forme.isShadow
        ? isEqual(formName, FORM_SHADOW) || isEqual(formName, FORM_PURIFIED)
          ? FORM_NORMAL
          : formName.replaceAll('-', '_').replace(`_${FORM_SHADOW}`, '').replace(`_${FORM_PURIFIED}`, '')
        : convertPokemonAPIDataName(formName);
    const pokemons = pokemonData.filter((pokemon) => pokemon.num === id);
    let pokemon = pokemons.find((p) => isEqual(p.forme, form));
    if (!pokemon) {
      pokemon = pokemons.find((p) => p.baseForme && isEqual(p.baseForme.replaceAll('-', '_'), p.forme, EqualMode.IgnoreCaseSensitive));
    }
    if (!pokemon) {
      getEvoChainJSON(id, forme);
    } else {
      const result: IPokemonEvo[][] = [];
      getPrevEvoChainStore(pokemon, result);
      getCurrEvoChainStore(pokemon, result);
      getNextEvoChainStore(pokemon, result);
      setArrEvoList(result);
    }
  };

  const getGmaxChain = (id: number, form: IForm) => {
    return setArrEvoList([
      [
        new PokemonEvo(
          form.name.replace(`-${FORM_GMAX.toLowerCase()}`, ''),
          id,
          FORM_NORMAL.toLowerCase(),
          convertModelSpritName(form.name.replace(`-${FORM_GMAX.toLowerCase()}`, '')),
          undefined,
          true
        ),
      ],
      [
        new PokemonEvo(
          form.name.replace(`-${FORM_GMAX.toLowerCase()}`, ''),
          id,
          FORM_GMAX.toLowerCase(),
          convertModelSpritName(form.name.replace(`-${FORM_GMAX.toLowerCase()}`, '-gigantamax').replace('-low-key', '')),
          undefined,
          true
        ),
      ],
    ]);
  };

  useEffect(() => {
    if (props.id && props.forme) {
      if (!isEqual(props.forme.formName, FORM_GMAX, EqualMode.IgnoreCaseSensitive)) {
        getEvoChainStore(props.id, props.forme);
      } else {
        getGmaxChain(props.id, props.forme);
      }
    }
  }, [props.forme, props.id]);

  const getQuestEvo = (prevId: number, form: string) => {
    const pokemon = pokemonData.find((item) => item.evoList?.find((value) => isInclude(value.evoToForm, form) && value.evoToId === prevId));
    if (pokemon) {
      return pokemon.evoList?.find((item) => isInclude(item.evoToForm, form) && item.evoToId === prevId);
    } else {
      return new EvoList();
    }
  };

  const renderImgGif = (value: IPokemonEvo) => {
    return (
      <>
        {props.isPurified && <img height={30} alt="img-shadow" className="purified-icon" src={APIService.getPokePurified()} />}
        {props.isShadow && <img height={30} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
        <img
          className="pokemon-sprite"
          id="img-pokemon"
          alt="img-pokemon"
          src={APIService.getPokemonAsset('pokemon-animation', 'all', convertFormGif(value.sprite), 'gif')}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeSprite(value.id);
          }}
        />
      </>
    );
  };

  const renderImageEvo = (value: IPokemonEvo, chain: IPokemonEvo[], evo: number, index: number, evoCount: number) => {
    const form = getValueOrDefault(String, value.form, props.forme?.formName);
    let offsetY = 35;
    offsetY += value.isBaby ? 20 : 0;
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
    const data = getQuestEvo(value.id, form.toUpperCase());
    return (
      <Fragment>
        <span id={`evo-${evo}-${index}`}>
          {evo > 0 && (
            <Xarrow
              labels={{
                end: (
                  <div className="position-absolute" style={{ left: -40 }}>
                    {!value.isGmax && (
                      <div>
                        {!data?.itemCost && (data?.candyCost || data?.purificationEvoCandyCost) && (
                          <span
                            className="d-flex align-items-center caption"
                            style={{ color: theme.palette.customText.caption, width: 'max-content' }}
                          >
                            <Candy id={value.id} />
                            <span style={{ marginLeft: 2 }}>{`x${props.isPurified ? data.purificationEvoCandyCost : data.candyCost}`}</span>
                          </span>
                        )}
                        {props.isPurified && data?.candyCost && data?.purificationEvoCandyCost && (
                          <span className="d-block text-end caption text-danger">{`-${
                            data.candyCost - data.purificationEvoCandyCost
                          }`}</span>
                        )}
                      </div>
                    )}
                    {isNotEmpty(Object.keys(data?.quest ?? new EvolutionQuest())) && (
                      <Fragment>
                        {data?.quest?.isRandomEvolution && (
                          <span className="caption">
                            <QuestionMarkIcon fontSize="small" />
                          </span>
                        )}
                        {data?.quest?.genderRequirement && (
                          <span className="caption">
                            {form === TypeSex.MALE ? (
                              <MaleIcon fontSize="small" />
                            ) : (
                              <Fragment>
                                {form === TypeSex.FEMALE ? (
                                  <FemaleIcon fontSize="small" />
                                ) : (
                                  <Fragment>
                                    {isEqual(data.quest.genderRequirement, TypeSex.MALE, EqualMode.IgnoreCaseSensitive) ? (
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
                        {data?.quest?.kmBuddyDistanceRequirement && (
                          <span className="caption">
                            {data.quest.isMustBeBuddy ? (
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
                        {data?.quest?.isOnlyDaytime && (
                          <span className="caption">
                            <WbSunnyIcon fontSize="small" />
                          </span>
                        )}
                        {data?.quest?.isOnlyNighttime && (
                          <span className="caption">
                            <DarkModeIcon fontSize="small" />
                          </span>
                        )}
                        {data?.quest?.evolutionItemRequirement && (
                          <Fragment>
                            <img alt="img-item-required" height={20} src={APIService.getItemEvo(data.quest.evolutionItemRequirement)} />
                            {data.itemCost && (
                              <span
                                className="d-flex align-items-center caption"
                                style={{ color: theme.palette.customText.caption, width: 'max-content', marginLeft: 2 }}
                              >{`x${getValueOrDefault(Number, data.itemCost)}`}</span>
                            )}
                          </Fragment>
                        )}
                        {data?.quest?.lureItemRequirement && (
                          <img alt="img-troy-required" height={20} src={APIService.getItemTroy(data.quest.lureItemRequirement)} />
                        )}
                        {data?.quest?.isOnlyUpsideDown && (
                          <span className="caption">
                            <SecurityUpdateIcon fontSize="small" />
                          </span>
                        )}
                        {data?.quest?.condition && (
                          <span className="caption">
                            {data.quest.condition.desc === ConditionType.Throw && (
                              <Fragment>
                                <CallMadeIcon fontSize="small" />
                                <span>{`${capitalize(data.quest.condition.throwType)} x${data.quest.goal}`}</span>
                              </Fragment>
                            )}
                            {data?.quest.condition.desc === ConditionType.Pokemon && (
                              <div className="d-flex align-items-center" style={{ marginTop: 5 }}>
                                {data.quest.condition.pokemonType?.map((value, index) => (
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
                                <span style={{ marginLeft: 2 }}>{`x${data.quest.goal}`}</span>
                              </div>
                            )}
                            {data.quest.condition.desc === ConditionType.WinRaid && (
                              <Fragment>
                                <SportsMartialArtsIcon fontSize="small" />
                                <span>{`x${data.quest.goal}`}</span>
                              </Fragment>
                            )}
                            {data.quest.condition.desc === ConditionType.PokemonBattle && (
                              <Fragment>
                                <div className="inline-flex" style={{ gap: 3 }}>
                                  {data.quest.condition.opponentPokemonBattle?.types.map((value, index) => (
                                    <img key={index} width={20} height={20} alt="img-pokemon" src={APIService.getTypeSprite(value)} />
                                  ))}
                                </div>
                                <span style={{ fontSize: 11, lineHeight: 1 }}>{`Battle x${data.quest.goal} ${
                                  data.quest.condition.opponentPokemonBattle?.requireDefeat ? 'Defeat' : ''
                                }`}</span>
                              </Fragment>
                            )}
                          </span>
                        )}
                        {data?.quest?.type === QuestType.BuddyEarn && (
                          <span className="caption">
                            <Fragment>
                              <FavoriteIcon fontSize="small" sx={{ color: 'red' }} />
                              <span>{`x${data.quest.goal}`}</span>
                            </Fragment>
                          </span>
                        )}
                        {data?.quest?.type === QuestType.BuddyFeed && (
                          <span className="caption">
                            <Fragment>
                              <RestaurantIcon fontSize="small" />
                              <span>{`x${data.quest.goal}`}</span>
                            </Fragment>
                          </span>
                        )}
                        {data?.quest?.type === QuestType.UseIncense && (
                          <span className="caption">
                            <Fragment>
                              <img width={20} height={20} src={APIService.getItemSprite('Incense_0')} />
                              <div style={{ fontSize: 11, lineHeight: 1 }}>Use Incense</div>
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
              {chain.length > 1 || (chain.length === 1 && !isEqual(form, FORM_NORMAL) && !isEmpty(form)) ? (
                <Fragment>
                  {!isEqual(form, FORM_NORMAL, EqualMode.IgnoreCaseSensitive) &&
                  !isEmpty(form) &&
                  !isInclude(form, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) ? (
                    <ThemeProvider theme={customTheme}>
                      <Badge
                        color="secondary"
                        overlap="circular"
                        badgeContent={splitAndCapitalize(form.replaceAll('_', '-'), '-', ' ')}
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
        {value.isBaby && <span className="caption text-danger">(Baby)</span>}
        <p>
          {value.id === props.id && isEqual(form, convertPokemonAPIDataName(props.forme?.formName) || FORM_NORMAL) && (
            <span className="caption" style={{ color: theme.palette.customText.caption }}>
              Current
            </span>
          )}
        </p>
      </Fragment>
    );
  };

  const reload = (element: JSX.Element, color = '#fafafa') => {
    if (props.isLoadedForms || (isNotEmpty(arrEvoList) && arrEvoList.some((evo) => evo.some((pokemon) => pokemon.id === props.id)))) {
      return element;
    }
    return (
      <div className="ph-item w-75" style={{ padding: 0, margin: 'auto', height: 120 }}>
        <div className="ph-picture ph-col-3 w-100 h-100" style={{ padding: 0, margin: 0, background: color }} />
      </div>
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
                  - <img alt="img-troy-required" height={20} src={APIService.getItemTroy()} /> : Evolution in lure module.
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
                <span className="d-block caption">
                  - <img width={20} height={20} src={APIService.getItemSprite('Incense_0')} /> : Use Incense.
                </span>
                <span className="d-block caption">- Pokemon Battle.</span>
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
        {reload(
          <ul
            className="ul-evo d-inline-flex"
            style={{
              columnGap: isNotEmpty(arrEvoList) ? window.innerWidth / (6.5 * arrEvoList.length) : 0,
            }}
          >
            {arrEvoList.map((values, evo) => (
              <li key={evo} className="img-form-gender-group li-evo">
                <ul className="ul-evo d-flex flex-column">
                  {values.map((value, index) => (
                    <li key={index} className="img-form-gender-group img-evo-group li-evo">
                      {props.setId ? (
                        <div
                          className="select-evo"
                          onClick={() => {
                            if (props.pokemonRouter.action === Action.Pop) {
                              props.pokemonRouter.action = Action.Replace;
                            }
                            props.setId?.(value.id);
                          }}
                          title={`#${value.id} ${splitAndCapitalize(value.name, '-', ' ')}`}
                        >
                          {renderImageEvo(value, values, evo, index, arrEvoList.length)}
                        </div>
                      ) : (
                        <Link
                          className="select-evo"
                          to={`/pokemon/${value.id}`}
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
        )}
      </div>
    </Fragment>
  );
};

export default Evolution;
