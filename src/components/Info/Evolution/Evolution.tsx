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
import {
  capitalize,
  convertFormGif,
  convertModelSpritName,
  generateFormName,
  generateParamForm,
  getDataWithKey,
  getGenerationPokemon,
  getItemSpritePath,
  isSpecialMegaFormType,
  splitAndCapitalize,
} from '../../../util/utils';

import { OverlayTrigger } from 'react-bootstrap';
import PopoverConfig from '../../Popover/PopoverConfig';
import { useSelector } from 'react-redux';
import Candy from '../../Sprites/Candy/Candy';
import { RouterState, StoreState } from '../../../store/models/state.model';
import { EvoList, EvolutionModel, EvolutionQuest, IEvoList, IEvolution } from '../../../core/models/evolution.model';
import { FORM_NORMAL, FORM_STANDARD } from '../../../util/constants';
import { IEvolutionComponent } from '../../models/component.model';
import { PokemonType, TypeSex } from '../../../enums/type.enum';
import { Action } from 'history';
import { getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber } from '../../../util/extension';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import { ConditionType, QuestType } from '../../../core/enums/option.enum';
import {
  IInfoEvoChain,
  IPokemonDetail,
  IPokemonDetailEvoChain,
  PokemonDetailEvoChain,
  PokemonInfoEvo,
} from '../../../core/models/API/info.model';
import { ItemName } from '../../../pages/News/enums/item-type.enum';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
import IconType from '../../Sprites/Icon/Type/Type';
import { APIUrl } from '../../../services/constants';

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
  pokemonType = PokemonType.Normal;
  sprite = '';

  static create(
    name: string | undefined,
    id: number | undefined,
    form: string | undefined,
    sprite: string,
    pokemonType = PokemonType.Normal,
    prev = '',
    isBaby = false
  ) {
    const obj = new PokemonEvo();
    obj.prev = prev;
    obj.name = getValueOrDefault(String, name);
    obj.id = toNumber(id);
    obj.isBaby = isBaby;
    obj.form = generateFormName(form, pokemonType, '-').toUpperCase();
    obj.pokemonType = pokemonType;
    obj.sprite = sprite;
    return obj;
  }
}

const Evolution = (props: IEvolutionComponent) => {
  const router = useSelector((state: RouterState) => state.router);
  const pokemonData = useSelector((state: StoreState) => state.store.data.pokemons);
  const evolutionChains = useSelector((state: StoreState) => state.store.data.evolutionChains);
  const [arrEvoList, setArrEvoList] = useState<IPokemonEvo[][]>([]);

  const [idEvoChain, setIdEvoChain] = useState(0);

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
            PokemonType.Normal,
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
        PokemonType.Normal,
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

  const queryPokemonEvolutionChain = (url: string, idUrlChain: number, result: IPokemonEvo[][]) =>
    APIService.getFetchUrl<PokemonInfoEvo>(url)
      .then((res) => {
        if (res.data) {
          setIdEvoChain(idUrlChain);
          const data = PokemonDetailEvoChain.mapping(res.data);
          fetchEvoChain(data, result);
        }
      })
      .catch();

  const pokeSetName = (name: string) => name.replace(`_${FORM_NORMAL}`, '').replaceAll('_', '-').replace('MR', 'MR.');

  const modelEvoChain = (pokemon: IEvolution) => {
    const name = pokeSetName(
      !isEqual(pokemon.form, FORM_NORMAL, EqualMode.IgnoreCaseSensitive)
        ? pokemon.name.replace(`_${pokemon.form}`, '')
        : pokemon.name
    );
    const form =
      pokemon.id === 718 && !pokemon.form
        ? 'TEN_PERCENT'
        : pokemon.form?.replace(/^STANDARD$/, '').replace(`_${FORM_STANDARD}`, '');
    const sprite =
      pokemon.id === 664 || pokemon.id === 665
        ? getValueOrDefault(String, pokemon.pokemonId?.toLowerCase(), pokemon.name)
        : convertModelSpritName(form ? `${name}_${form}` : name);

    return PokemonEvo.create(
      name,
      pokemon.id,
      form,
      sprite,
      props.pokemonData?.pokemonType,
      pokemon.prev,
      pokemon.isBaby
    );
  };

  const getPrevEvoChainStore = (id: number | undefined, form: string | undefined, result: IPokemonEvo[][]) => {
    const evoList: IPokemonEvo[] = [];
    const pokemon = pokemonData.filter((pokemon) =>
      pokemon.evoList?.find((evo) => evo.evoToId === id && isEqual(evo.evoToForm, form))
    );
    if (!isNotEmpty(pokemon)) {
      return;
    }
    pokemon.forEach((evo) => {
      evoList.unshift(
        modelEvoChain(
          new EvolutionModel({
            ...evo,
            name: evo.name.replaceAll('-', '_').toUpperCase(),
            id: evo.num,
            form: getValueOrDefault(String, evo.form, FORM_NORMAL),
            evoList: getValueOrDefault(Array, evo.evoList),
            tempEvo: getValueOrDefault(Array, evo.tempEvo),
          })
        )
      );
      getPrevEvoChainStore(evo.num, evo.form, result);
    });
    return result.push(evoList);
  };

  const getCurrEvoChainStore = (poke: Partial<IPokemonDetail>, result: IPokemonEvo[][]) => {
    let evoList: IPokemonEvo[] = [];
    const pokemon = pokemonData.find((pokemon) =>
      pokemon.evoList?.find(
        (evo) => evo.evoToId === poke.id && isEqual(evo.evoToForm, poke.form?.replace(`_${FORM_STANDARD}`, ''))
      )
    );
    if (!pokemon) {
      evoList.push(
        modelEvoChain(
          new EvolutionModel({
            ...poke,
            name: getValueOrDefault(String, poke.fullName),
            id: toNumber(poke.id),
            form: getValueOrDefault(String, poke.form, FORM_NORMAL),
            evoList: [],
            tempEvo: getValueOrDefault(Array, poke.tempEvo),
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
                evoList: [],
                tempEvo: [],
              })
            )
          )
          .filter((pokemon) => pokemon.id === poke.id)
      );
    }
    return result.push(evoList);
  };

  const getNextEvoChainStore = (name: string | undefined, evoList: IEvoList[] | undefined, result: IPokemonEvo[][]) => {
    if (!isNotEmpty(evoList)) {
      return;
    }
    const pokemonEvoList = evoList?.map((evo) =>
      modelEvoChain(
        new EvolutionModel({
          id: evo.evoToId,
          name: evo.evoToName,
          form: evo.evoToForm,
          prev: name,
          evoList: [],
          tempEvo: [],
        })
      )
    );
    if (pokemonEvoList && isNotEmpty(pokemonEvoList)) {
      if (result.length === 3) {
        result.at(2)?.push(...pokemonEvoList);
      } else {
        result.push(pokemonEvoList);
      }
    }

    evoList?.forEach((evo) => {
      const pokemon = pokemonData.find(
        (pokemon) => pokemon.num === evo.evoToId && isEqual(pokemon.form, evo.evoToForm)
      );
      getNextEvoChainStore(pokemon?.name, pokemon?.evoList, result);
    });

    return result;
  };

  const getCombineEvoChainFromPokeGo = (result: IPokemonEvo[][], id: number | undefined, form: string | undefined) => {
    const pokemonChain = evolutionChains.find((chain) => chain.id === id);
    if (pokemonChain) {
      const chainForms = pokemonChain.evolutionInfos.filter((info) =>
        isEqual(info.form, form, EqualMode.IgnoreCaseSensitive)
      );
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

  const getEvoChainStore = (pokemon: Partial<IPokemonDetail>) => {
    const result: IPokemonEvo[][] = [];
    getPrevEvoChainStore(pokemon.id, pokemon.form, result);
    getCurrEvoChainStore(pokemon, result);
    getNextEvoChainStore(pokemon.name, pokemon.evoList, result);
    const form = getValueOrDefault(String, pokemon.form, FORM_NORMAL);
    if (pokemon.prevEvo && result.length === 1 && result[0].length === 1) {
      getCombineEvoChainFromPokeGo(result, pokemon.id, form);
    }
    if (
      props.urlEvolutionChain &&
      result.length === 1 &&
      result[0].length === 1 &&
      isEqual(pokemon.form, FORM_NORMAL)
    ) {
      const idUrlChain = getGenerationPokemon(props.urlEvolutionChain);
      if (idUrlChain !== idEvoChain) {
        queryPokemonEvolutionChain(props.urlEvolutionChain, idUrlChain, result);
      } else {
        setArrEvoList(result);
      }
    } else {
      setArrEvoList(result);
    }
  };

  const getSpecialEvoChain = (pokemon: Partial<IPokemonDetail>) =>
    setArrEvoList([
      [
        PokemonEvo.create(
          pokemon.pokemonId,
          pokemon.id,
          FORM_NORMAL,
          convertModelSpritName(pokemon.pokemonId),
          PokemonType.Normal
        ),
      ],
      [
        PokemonEvo.create(
          pokemon.pokemonId,
          pokemon.id,
          pokemon.form,
          convertModelSpritName(pokemon.sprite),
          pokemon.pokemonType
        ),
      ],
    ]);

  useEffect(() => {
    if (props.pokemonData?.fullName) {
      if (props.pokemonData.pokemonType === PokemonType.GMax || isSpecialMegaFormType(props.pokemonData.pokemonType)) {
        getSpecialEvoChain(props.pokemonData);
      } else {
        getEvoChainStore(props.pokemonData);
      }
    }
  }, [props.pokemonData, props.pokemonData?.pokemonType]);

  const getQuestEvo = (prevId: number, form: string) => {
    const pokemon = pokemonData.find((item) =>
      item.evoList?.find(
        (value) => isInclude(value.evoToForm, form, IncludeMode.IncludeIgnoreCaseSensitive) && value.evoToId === prevId
      )
    );
    if (pokemon) {
      return pokemon.evoList?.find(
        (item) => isInclude(item.evoToForm, form, IncludeMode.IncludeIgnoreCaseSensitive) && item.evoToId === prevId
      );
    } else {
      const pokemonChain = evolutionChains.find((chain) => chain.id === prevId);
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

  const renderImgGif = (value: IPokemonEvo) => (
    <PokemonIconType pokemonType={props.pokemonData?.pokemonType} size={30}>
      <img
        className="pokemon-sprite"
        id="Pokémon Image"
        alt="Pokémon Image"
        src={APIService.getPokemonAsset('pokemon-animation', 'all', convertFormGif(value.sprite), 'gif')}
        onError={(e) => {
          e.currentTarget.onerror = null;
          if (e.currentTarget.src.includes(APIUrl.POKE_SPRITES_API_URL)) {
            e.currentTarget.src = APIService.getPokeSprite();
          } else {
            e.currentTarget.src = APIService.getPokeSprite(value.id);
          }
        }}
      />
    </PokemonIconType>
  );

  const renderImageEvo = (value: IPokemonEvo, chain: IPokemonEvo[], evo: number, index: number, evoCount: number) => {
    const form = getValueOrDefault(String, value.form, props.pokemonData?.form);
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
              y: arrEvoList[Math.max(0, evo - 1)].length > 1 ? offsetY + 246 / 3 : offsetY,
            }
          : { x: -8 },
    };
    const data = getQuestEvo(value.id, form);
    const isCurrent =
      value.id === props.id &&
      value.pokemonType === props.pokemonData?.pokemonType &&
      isEqual(form, generateFormName(props.pokemonData?.form, value.pokemonType, '-'), EqualMode.IgnoreCaseSensitive);
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
                        {toNumber(data?.evoToId) > 0 &&
                          !data?.itemCost &&
                          (data?.candyCost || data?.purificationEvoCandyCost) && (
                            <span className="d-flex align-items-center caption" style={{ width: 'max-content' }}>
                              <Candy id={value.id} />
                              <span style={{ marginLeft: 2 }}>{`x${
                                props.pokemonData?.pokemonType === PokemonType.Purified
                                  ? data.purificationEvoCandyCost
                                  : data.candyCost
                              }`}</span>
                            </span>
                          )}
                        {props.pokemonData?.pokemonType === PokemonType.Purified &&
                          data?.candyCost &&
                          data?.purificationEvoCandyCost && (
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
                            <img
                              alt="Image Item Required"
                              height={20}
                              src={APIService.getItemEvo(data.quest.evolutionItemRequirement)}
                            />
                            {data.itemCost && (
                              <span
                                className="d-flex align-items-center caption"
                                style={{ width: 'max-content', marginLeft: 2 }}
                              >{`x${data.itemCost}`}</span>
                            )}
                          </Fragment>
                        )}
                        {data?.quest?.lureItemRequirement && (
                          <img
                            alt="Image Troy Required"
                            height={20}
                            src={APIService.getItemTroy(data.quest.lureItemRequirement)}
                          />
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
                              <div className="d-flex align-items-center mt-1">
                                {data.quest.condition.pokemonType?.map((value, index) => (
                                  <IconType key={index} height={20} alt="Pokémon GO Type Logo" type={value} />
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
                                    <IconType
                                      key={index}
                                      width={20}
                                      height={20}
                                      alt="Pokémon GO Type Logo"
                                      type={value}
                                    />
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
                              <img
                                alt="Icon Incense"
                                width={20}
                                height={20}
                                src={getItemSpritePath(ItemName.Incense)}
                              />
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
                  {!isEqual(form, FORM_NORMAL, EqualMode.IgnoreCaseSensitive) && isNotEmpty(form) ? (
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
          <div id="id-pokemon">
            <b className="theme-text-primary">#{value.id}</b>
          </div>
          <div>
            <b className="link-title">{splitAndCapitalize(value.name, '-', ' ')}</b>
          </div>
        </span>
        {value.isBaby && <span className="caption text-danger">(Baby)</span>}
        <p>{isCurrent && <span className="caption">Current</span>}</p>
      </Fragment>
    );
  };

  const reload = (element: JSX.Element, color = 'var(--background-default)') => {
    if (
      props.isLoadedForms ||
      (isNotEmpty(arrEvoList) && arrEvoList.some((evo) => evo.some((pokemon) => pokemon.id === props.id)))
    ) {
      return element;
    }
    return (
      <div className="ph-item w-75 p-0" style={{ margin: 'auto', height: 120 }}>
        <div className="ph-picture ph-col-3 w-100 h-100 m-0 p-0" style={{ background: color }} />
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
            <PopoverConfig id="popover-info">
              <span className="info-evo">
                <span className="d-block caption">
                  - <img alt="Image Stardust" height={20} src={getItemSpritePath(ItemName.RareCandy)} /> : Candy of
                  pokemon.
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
                  - <img alt="Image Troy Required" height={20} src={APIService.getItemTroy()} /> : Evolution in lure
                  module.
                </span>
                <span className="d-block caption">
                  - <SecurityUpdateIcon fontSize="small" /> : Evolution at upside down phone.
                </span>
                <span className="d-block caption">
                  - <CallMadeIcon fontSize="small" /> : Throw pokeball with condition.
                </span>
                <span className="d-block caption">
                  - <img alt="Image Stardust" height={20} src={APIService.getPokeSprite()} /> : Catch pokemon with type.
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
                  - <img alt="icon-incense" width={20} height={20} src={getItemSpritePath(ItemName.Incense)} /> : Use
                  Incense.
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
                      {props.setSearchOption ? (
                        <div
                          className="select-evo"
                          onClick={() => {
                            if (router.action === Action.Pop) {
                              router.action = Action.Replace;
                            }
                            props.setSearchOption?.({ id: value.id, form: value.form, pokemonType: value.pokemonType });
                          }}
                          title={`#${value.id} ${splitAndCapitalize(value.name, '-', ' ')}`}
                        >
                          {renderImageEvo(value, values, evo, index, arrEvoList.length)}
                        </div>
                      ) : (
                        <Link
                          className="select-evo"
                          to={`/pokemon/${value.id}${generateParamForm(props.pokemonData?.form, value.pokemonType)}`}
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
