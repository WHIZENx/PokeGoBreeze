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
import {
  capitalize,
  convertFormGif,
  convertModelSpritName,
  convertPokemonAPIDataName,
  getDataWithKey,
  getItemSpritePath,
  getPokemonType,
  splitAndCapitalize,
} from '../../../util/utils';

import { OverlayTrigger } from 'react-bootstrap';
import PopoverConfig from '../../Popover/PopoverConfig';
import { useSelector } from 'react-redux';
import Candy from '../../Sprites/Candy/Candy';
import { StoreState } from '../../../store/models/state.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { EvoList, EvolutionModel, EvolutionQuest, IEvolution } from '../../../core/models/evolution.model';
import {
  FORM_GALAR,
  FORM_GMAX,
  FORM_HISUI,
  FORM_MEGA,
  FORM_NORMAL,
  FORM_PURIFIED,
  FORM_SHADOW,
  FORM_STANDARD,
} from '../../../util/constants';
import { IForm } from '../../../core/models/API/form.model';
import { IEvolutionComponent } from '../../models/component.model';
import { PokemonType, TypeSex } from '../../../enums/type.enum';
import { Action } from 'history';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { getValueOrDefault, isEmpty, isEqual, isInclude, isIncludeList, isNotEmpty, toNumber } from '../../../util/extension';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import { ConditionType, QuestType } from '../../../core/enums/option.enum';
import { IInfoEvoChain, IPokemonDetailEvoChain, PokemonDetailEvoChain, PokemonInfoEvo } from '../../../core/models/API/info.model';
import { ItemName } from '../../../pages/News/enums/item-type.enum';

interface IPokemonEvo {
  prev?: string;
  name: string;
  id: number;
  isBaby: boolean;
  form: string;
  pokemonType: PokemonType;
  sprite: string;
}

class PokemonEvo implements IPokemonEvo {
  prev?: string;
  name = '';
  id = 0;
  isBaby = false;
  form = '';
  pokemonType = PokemonType.None;
  sprite = '';

  static create(
    name: string | undefined,
    id: number | undefined,
    form: string | null | undefined,
    sprite: string,
    pokemonType = PokemonType.None,
    prev = '',
    isBaby = false
  ) {
    const obj = new PokemonEvo();
    obj.prev = prev;
    obj.name = getValueOrDefault(String, name);
    obj.id = toNumber(id);
    obj.isBaby = isBaby;
    obj.form = getValueOrDefault(String, form);
    obj.pokemonType = pokemonType;
    obj.sprite = sprite;
    return obj;
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
  const pokemonData = useSelector((state: StoreState) => state.store.data.pokemon);
  const evolutionChain = useSelector((state: StoreState) => state.store.data.evolutionChain);
  const [arrEvoList, setArrEvoList] = useState<IPokemonEvo[][]>([]);

  const recursiveEvoChain = (chain: IInfoEvoChain, evos: IInfoEvoChain[], result: IPokemonEvo[][]) => {
    const currentId = chain.id;
    if (currentId === props.id) {
      evos.forEach((evo) => {
        if (!isNotEmpty(evo.evolvesTo)) {
          const name = evo.name;
          const pokemon = PokemonEvo.create(
            name,
            evo.id,
            FORM_NORMAL,
            convertModelSpritName(name),
            PokemonType.None,
            undefined,
            evo.isBaby
          );
          result.push([pokemon]);
        } else {
          recursiveEvoChain(evo, evo.evolvesTo, result);
        }
      });
    } else {
      const name = chain.name;
      const pokemon = PokemonEvo.create(
        name,
        currentId,
        FORM_NORMAL,
        convertModelSpritName(name),
        PokemonType.None,
        undefined,
        chain.isBaby
      );
      result.unshift([pokemon]);
    }
  };

  const fetchEvoChain = (data: IPokemonDetailEvoChain, result: IPokemonEvo[][]) => {
    recursiveEvoChain(data.chain, data.chain.evolvesTo, result);
    setArrEvoList(result);
  };

  const queryPokemonEvolutionChain = (url: string, result: IPokemonEvo[][]) =>
    APIService.getFetchUrl<PokemonInfoEvo>(url)
      .then((res) => {
        if (res.data) {
          fetchEvoChain(PokemonDetailEvoChain.mapping(res.data), result);
        }
      })
      .catch();

  const formatEvoChain = (pokemon: IPokemonData | undefined) =>
    PokemonEvo.create(
      pokemon?.baseSpecies ? pokemon.baseSpecies.toLowerCase() : pokemon?.name.toLowerCase(),
      pokemon?.num,
      pokemon?.forme,
      convertModelSpritName(pokemon?.name),
      pokemon?.pokemonType,
      undefined,
      pokemon?.isBaby
    );

  const pokeSetName = (name: string) => name.replace(`_${FORM_NORMAL}`, '').replaceAll('_', '-').replace('MR', 'MR.');

  const modelEvoChain = (pokemon: IEvolution) => {
    const name = pokeSetName(
      !isEqual(pokemon.form, FORM_NORMAL, EqualMode.IgnoreCaseSensitive) ? pokemon.name.replace(`_${pokemon.form}`, '') : pokemon.name
    );
    let form =
      pokemon.id === 718 && isEmpty(pokemon.form)
        ? 'TEN_PERCENT'
        : pokemon.form?.replace(/^STANDARD$/, '').replace(`_${FORM_STANDARD}`, '');
    form = form?.replace(`${FORM_GALAR}IAN`, FORM_GALAR).replace(`${FORM_HISUI}AN`, FORM_HISUI);
    let sprite = '';
    if (pokemon.id === 664 || pokemon.id === 665) {
      sprite = getValueOrDefault(String, pokemon.pokemonId?.toLowerCase(), pokemon.name);
    } else {
      sprite = convertModelSpritName(form ? `${name}_${form}` : name);
    }

    const pokemonType = getPokemonType(form);
    return PokemonEvo.create(name, pokemon.id, form, sprite, pokemonType, pokemon.prev, pokemon.isBaby);
  };

  const getPrevEvoChainJSON = (name: string | null | undefined, arr: IPokemonEvo[][]) => {
    if (name) {
      const pokemon = pokemonData.find((pokemon) => isEqual(pokemon.name, name));
      if (pokemon) {
        arr.unshift([formatEvoChain(pokemon)]);
        getPrevEvoChainJSON(pokemon.prevo, arr);
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

  const getEvoChainJSON = (id: number | undefined, forme: IForm) => {
    let form = isEmpty(forme.formName) || forme.pokemonType !== PokemonType.Mega ? FORM_NORMAL : forme.formName;
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
      pokemon = pokemonData.find((pokemon) => pokemon.num === id && pokemon.pokemonType === PokemonType.Normal);
    }

    const prevEvo: IPokemonEvo[][] = [],
      curr: IPokemonEvo[][] = [],
      evo: IPokemonEvo[][] = [];
    if (!pokemon) {
      return;
    }
    getPrevEvoChainJSON(pokemon.prevo, prevEvo);
    const prev = pokemonData.find((p) => isEqual(p.name, pokemon?.prevo));
    if (prev) {
      getCurrEvoChainJSON(prev, curr);
    } else {
      curr.push([formatEvoChain(pokemon)]);
    }
    getNextEvoChainJSON(pokemon.evos, evo);
    const result = prevEvo.concat(curr, evo);
    if (props.urlEvolutionChain && result.length === 1 && result[0].length === 1 && isEqual(pokemon.forme, FORM_NORMAL)) {
      queryPokemonEvolutionChain(props.urlEvolutionChain, result);
    } else {
      setArrEvoList(result);
    }
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
      .filter((p) => !(p.num === 718 && p.pokemonType === PokemonType.Normal))
      .forEach((evo) => {
        evoList.unshift(
          modelEvoChain(
            new EvolutionModel({
              ...evo,
              name: evo.name.replaceAll('-', '_').toUpperCase(),
              id: evo.num,
              form: getValueOrDefault(String, evo.forme, FORM_NORMAL),
              evoList: getValueOrDefault(Array, evo.evoList),
              tempEvo: getValueOrDefault(Array, evo.tempEvo),
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
            form: getValueOrDefault(String, poke.forme, FORM_NORMAL),
            evoList: [],
            tempEvo: getValueOrDefault(Array, poke.tempEvo),
          })
        )
      );
    } else {
      evoList = getValueOrDefault(
        Array,
        pokemon?.evoList
          ?.map((evo) =>
            modelEvoChain(
              new EvolutionModel({
                id: evo.evoToId,
                name: evo.evoToName,
                form: evo.evoToForm,
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

  const getCombineEvoChainFromPokeGo = (result: IPokemonEvo[][], id: number | undefined, form: string | undefined) => {
    const pokemonChain = evolutionChain.find((chain) => chain.id === id);
    if (pokemonChain) {
      const chainForms = pokemonChain.evolutionInfos.filter((info) => isEqual(info.form, form, EqualMode.IgnoreCaseSensitive));
      chainForms.forEach((poke) => {
        const evolution = modelEvoChain(
          new EvolutionModel({
            id: poke.id,
            name: poke.pokemonId,
            form: poke.form,
            evoList: [],
            tempEvo: [],
          })
        );
        if (poke.id < toNumber(id)) {
          result.unshift([evolution]);
        } else if (poke.id > toNumber(id)) {
          result.push([evolution]);
        }
      });
    }
  };

  const getEvoChainStore = (id: number | undefined, forme: IForm) => {
    const formName = forme.formName?.toUpperCase().replace(`${FORM_GALAR}IAN`, FORM_GALAR).replace(`${FORM_HISUI}AN`, FORM_HISUI);
    const form =
      isEmpty(formName) || forme.pokemonType === PokemonType.Mega
        ? FORM_NORMAL
        : forme.pokemonType === PokemonType.Purified || forme.pokemonType === PokemonType.Shadow
        ? isEqual(formName, FORM_SHADOW) || isEqual(formName, FORM_PURIFIED)
          ? FORM_NORMAL
          : formName?.replaceAll('-', '_').replace(`_${FORM_SHADOW}`, '').replace(`_${FORM_PURIFIED}`, '')
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
      if (pokemon.prevo && result.length === 1 && result[0].length === 1) {
        getCombineEvoChainFromPokeGo(result, id, form);
      }
      if (props.urlEvolutionChain && result.length === 1 && result[0].length === 1 && isEqual(pokemon.forme, FORM_NORMAL)) {
        queryPokemonEvolutionChain(props.urlEvolutionChain, result);
      } else {
        setArrEvoList(result);
      }
    }
  };

  const getGMaxChain = (id: number | undefined, form: IForm) => {
    return setArrEvoList([
      [
        PokemonEvo.create(
          form.name.replace(`-${FORM_GMAX.toLowerCase()}`, ''),
          id,
          FORM_NORMAL.toLowerCase(),
          convertModelSpritName(form.name.replace(`-${FORM_GMAX.toLowerCase()}`, '')),
          PokemonType.GMax
        ),
      ],
      [
        PokemonEvo.create(
          form.name.replace(`-${FORM_GMAX.toLowerCase()}`, ''),
          id,
          FORM_GMAX.toLowerCase(),
          convertModelSpritName(form.name.replace(`-${FORM_GMAX.toLowerCase()}`, '-gigantamax').replace('-low-key', '')),
          PokemonType.GMax
        ),
      ],
    ]);
  };

  useEffect(() => {
    if (toNumber(props.id) > 0 && props.forme) {
      if (props.forme.pokemonType !== PokemonType.GMax) {
        getEvoChainStore(props.id, props.forme);
      } else {
        getGMaxChain(props.id, props.forme);
      }
    }
  }, [props.forme, props.id]);

  const getQuestEvo = (prevId: number, form: string) => {
    const pokemon = pokemonData.find((item) => item.evoList?.find((value) => isInclude(value.evoToForm, form) && value.evoToId === prevId));
    if (pokemon) {
      return pokemon.evoList?.find((item) => isInclude(item.evoToForm, form) && item.evoToId === prevId);
    } else {
      const pokemonChain = evolutionChain.find((chain) => chain.id === prevId);
      if (pokemonChain) {
        const chainForm = pokemonChain.evolutionInfos.find(
          (info) => info.id !== prevId && isEqual(info.form, form, EqualMode.IgnoreCaseSensitive)
        );
        if (chainForm && prevId === props.id) {
          const pokemon = pokemonData.find((item) => item.evoList?.find((value) => value.evoToId === prevId));
          if (pokemon) {
            return pokemon.evoList?.find((item) => item.evoToId === prevId);
          }
        }
      }
      return new EvoList();
    }
  };

  const getPokemonTypeIcon = (pokemonType?: PokemonType | undefined, height = 24) => {
    switch (pokemonType) {
      case PokemonType.Shadow:
        return <img height={height} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />;
      case PokemonType.Purified:
        return <img height={height} alt="img-purified" className="purified-icon" src={APIService.getPokePurified()} />;
    }
  };

  const renderImgGif = (value: IPokemonEvo) => (
    <>
      {getPokemonTypeIcon(props.pokemonType, 30)}
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

  const renderImageEvo = (value: IPokemonEvo, chain: IPokemonEvo[], evo: number, index: number, evoCount: number) => {
    const form = getValueOrDefault(String, value.form, props.forme?.formName);
    const sex = getDataWithKey<TypeSex>(TypeSex, form);
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
                    {value.pokemonType !== PokemonType.GMax && (
                      <div>
                        {toNumber(data?.evoToId) > 0 && !data?.itemCost && (data?.candyCost || data?.purificationEvoCandyCost) && (
                          <span
                            className="d-flex align-items-center caption"
                            style={{ color: theme.palette.customText.caption, width: 'max-content' }}
                          >
                            <Candy id={value.id} />
                            <span style={{ marginLeft: 2 }}>{`x${
                              props.pokemonType === PokemonType.Purified ? data.purificationEvoCandyCost : data.candyCost
                            }`}</span>
                          </span>
                        )}
                        {props.pokemonType === PokemonType.Purified && data?.candyCost && data?.purificationEvoCandyCost && (
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
                            {sex === TypeSex.Male ? (
                              <MaleIcon fontSize="small" />
                            ) : (
                              <Fragment>
                                {sex === TypeSex.Female ? (
                                  <FemaleIcon fontSize="small" />
                                ) : (
                                  <Fragment>
                                    {isEqual(
                                      getDataWithKey<TypeSex>(TypeSex, data.quest.genderRequirement),
                                      TypeSex.Male,
                                      EqualMode.IgnoreCaseSensitive
                                    ) ? (
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
                            {`${
                              data.quest.isMustBeBuddy ? (
                                <div className="d-flex align-items-end">
                                  <DirectionsWalkIcon fontSize="small" />
                                  <PetsIcon sx={{ fontSize: '1rem' }} />
                                </div>
                              ) : (
                                <DirectionsWalkIcon fontSize="small" />
                              )
                            } ${data.quest.kmBuddyDistanceRequirement}km`}
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
                              >{`x${data.itemCost}`}</span>
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
                                      e.currentTarget.src = APIService.getPokeSprite();
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
                              <img width={20} height={20} src={getItemSpritePath(ItemName.Incense)} />
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
              {chain.length > 1 || (chain.length === 1 && !isEqual(form, FORM_NORMAL) && isNotEmpty(form)) ? (
                <Fragment>
                  {!isEqual(form, FORM_NORMAL, EqualMode.IgnoreCaseSensitive) &&
                  isNotEmpty(form) &&
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
            <span className="img-evo-container">{renderImgGif(value)}</span>
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
                  - <img alt="img-stardust" height={20} src={getItemSpritePath(ItemName.RareCandy)} /> : Candy of pokemon.
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
                  - <img alt="img-stardust" height={20} src={APIService.getPokeSprite()} /> : Catch pokemon with type.
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
                  - <img width={20} height={20} src={getItemSpritePath(ItemName.Incense)} /> : Use Incense.
                </span>
                <span className="d-block caption">- Pokémon Battle.</span>
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
