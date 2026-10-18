import { Skeleton } from '@mui/material';
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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness3Icon from '@mui/icons-material/Brightness3';
import StadiumIcon from '@mui/icons-material/Stadium';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuestRequirements from './QuestRequirements';
import React, { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Xarrow from 'react-xarrows';
import { Link } from 'react-router-dom';
import APIService from '../../../services/api.service';

import './Evolution.scss';
import {
  capitalize,
  convertModelSpritName,
  generateFormName,
  generateParamForm,
  getItemSpritePath,
  isSpecialMegaFormType,
  splitAndCapitalize,
} from '../../../utils/utils';

import Candy from '../../Sprites/Candy/Candy';
import { EvolutionModel, EvolutionQuest, IEvoList, IEvolution } from '../../../core/models/evolution.model';
import { IEvolutionComponent } from '../../models/component.model';
import { PokemonType, TypeSex } from '../../../enums/type.enum';
import { getValueOrDefault, isEqual, isNotEmpty, isNumber, toNumber } from '../../../utils/extension';
import { EqualMode } from '../../../utils/enums/string.enum';
import { ConditionType, ItemEvolutionRequireType, QuestType } from '../../../core/enums/option.enum';
import { IPokemonDetail } from '../../../core/models/API/info.model';
import { ItemName } from '../../../pages/News/enums/item-type.enum';
import IconType from '../../Sprites/Icon/Type/Type';
import { formNormal, formStandard } from '../../../utils/helpers/options-context.helpers';
import usePokemon from '../../../composables/usePokemon';
import Tooltips from '../../Commons/Tooltips/Tooltips';
import EvolutionPokemonDisplay from './EvolutionPokemonDisplay';

interface IPokemonEvo {
  prev?: string;
  name: string;
  id: number;
  isBaby: boolean;
  form: string;
  dataForm: string;
  formVaries: boolean;
  pokemonType: PokemonType;
  sprite: string;
}

class PokemonEvo implements IPokemonEvo {
  prev?: string;
  name = '';
  id = 0;
  isBaby = false;
  form = '';
  dataForm = '';
  formVaries = false;
  pokemonType = PokemonType.Normal;
  sprite = '';

  static create(
    name: string | undefined,
    id: number | undefined,
    form: string | undefined,
    sprite: string,
    pokemonType = PokemonType.Normal,
    prev = '',
    isBaby = false,
    formVaries = false,
    dataForm = form
  ) {
    const obj = new PokemonEvo();
    obj.prev = prev;
    obj.name = getValueOrDefault(String, name);
    obj.id = toNumber(id);
    obj.isBaby = isBaby;
    obj.form = generateFormName(form, pokemonType, '-').toUpperCase();
    obj.dataForm = (dataForm || formNormal()).toUpperCase();
    obj.formVaries = formVaries;
    obj.pokemonType = pokemonType;
    obj.sprite = sprite;
    return obj;
  }
}

const Evolution = (props: IEvolutionComponent) => {
  const { findPokemonByIdAndForm, getEvolutionParents, getPokemonById } = usePokemon();
  const [arrEvoList, setArrEvoList] = useState<IPokemonEvo[][]>([]);
  const [evolutionMinHeight, setEvolutionMinHeight] = useState(0);
  const evolutionContainerRef = useRef<HTMLDivElement>(null);

  const pokeSetName = (name: string) => name.replace(`_${formNormal()}`, '').replaceAll('_', '-').replace('MR', 'MR.');

  const modelEvoChain = (pokemon: IEvolution) => {
    let name = pokeSetName(
      !isEqual(pokemon.form, formNormal(), EqualMode.IgnoreCaseSensitive)
        ? pokemon.name.replace(`_${pokemon.form}`, '')
        : pokemon.name
    );
    const form =
      pokemon.id === 718 && !pokemon.form
        ? 'TEN_PERCENT'
        : pokemon.form?.replace?.(/^STANDARD$/, '')?.replace?.(`_${formStandard()}`, '');
    const sprite = pokemon.sprite
      ? convertModelSpritName(pokemon.sprite)
      : pokemon.id === 664 || pokemon.id === 665
        ? getValueOrDefault(String, pokemon.pokemonId?.toLowerCase(), pokemon.name)
        : convertModelSpritName(form ? `${name}_${form}` : name);

    if (isNumber(name)) {
      const result = getPokemonById(pokemon.id);
      if (result) {
        name = result.name;
      }
    }

    return PokemonEvo.create(
      name,
      pokemon.id,
      form,
      sprite,
      props.pokemonData?.pokemonType,
      pokemon.prev,
      pokemon.isBaby,
      pokemon.formVaries,
      pokemon.form
    );
  };

  const getPrevEvoChainStore = (id: number | undefined, form: string | undefined, result: IPokemonEvo[][]) => {
    const evoList: IPokemonEvo[] = [];
    const pokemon = getEvolutionParents(id, form);
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
            form: getValueOrDefault(String, evo.form, formNormal()),
            evoList: getValueOrDefault(Array, evo.evoList),
            tempEvo: getValueOrDefault(Array, evo.tempEvo),
            pokemonId: evo.pokemonId?.toString(),
            sprite: evo.sprite,
          })
        )
      );
      getPrevEvoChainStore(evo.num, evo.form, result);
    });
    return result.push(evoList);
  };

  const getCurrEvoChainStore = (poke: Partial<IPokemonDetail>, result: IPokemonEvo[][]) => {
    return result.push([
      modelEvoChain(
        new EvolutionModel({
          ...poke,
          name: getValueOrDefault(String, poke.fullName),
          id: toNumber(poke.id),
          form: getValueOrDefault(String, poke.form, formNormal()),
          evoList: [],
          tempEvo: getValueOrDefault(Array, poke.tempEvo),
        })
      ),
    ]);
  };

  const getNextEvoChainStore = (name: string | undefined, evoList: IEvoList[] | undefined, result: IPokemonEvo[][]) => {
    if (!isNotEmpty(evoList)) {
      return;
    }
    const pokemonEvoList = evoList?.map((evo) => {
      const pokemon = findPokemonByIdAndForm(evo.evoToId, evo.evoToForm);
      return modelEvoChain(
        new EvolutionModel({
          id: evo.evoToId,
          name: evo.evoToName,
          form: evo.evoToForm,
          formVaries: evo.formVaries,
          prev: name,
          evoList: [],
          tempEvo: [],
          sprite: pokemon?.sprite,
        })
      );
    });
    if (pokemonEvoList && isNotEmpty(pokemonEvoList)) {
      if (result.length === 3) {
        result.at(2)?.push(...pokemonEvoList);
      } else {
        result.push(pokemonEvoList);
      }
    }

    evoList?.forEach((evo) => {
      const pokemon = findPokemonByIdAndForm(evo.evoToId, evo.evoToForm);
      getNextEvoChainStore(pokemon?.name, pokemon?.evoList, result);
    });

    return result;
  };

  const getEvoChainStore = (pokemon: Partial<IPokemonDetail>) => {
    const result: IPokemonEvo[][] = [];
    // Only explicit Pokémon GO branches prove a permanent evolution path.
    // PokeAPI species chains and numeric Pokédex ordering cannot establish it.
    getPrevEvoChainStore(pokemon.id, pokemon.form, result);
    getCurrEvoChainStore(pokemon, result);
    getNextEvoChainStore(pokemon.name, pokemon.evoList, result);
    setArrEvoList(result);
  };

  const getSpecialEvoChain = (pokemon: Partial<IPokemonDetail>) =>
    setArrEvoList([
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

  useLayoutEffect(() => {
    const container = evolutionContainerRef.current;
    if (!container) {
      return;
    }

    let animationFrame = 0;
    const resizeObserver = new ResizeObserver(() => scheduleMeasurement());
    const observeContent = () => {
      const chain = container.querySelector<HTMLElement>('.evo-chain');
      if (chain) {
        resizeObserver.observe(chain);
      }
      container.querySelectorAll<HTMLElement>('[data-testid="evolution-edge"]').forEach((edge) => {
        resizeObserver.observe(edge);
      });
    };
    const measureContent = () => {
      const chain = container.querySelector<HTMLElement>('.evo-chain');
      if (!chain) {
        setEvolutionMinHeight(0);
        return;
      }
      const containerTop = container.getBoundingClientRect().top;
      const content = [chain, ...container.querySelectorAll<HTMLElement>('[data-testid="evolution-edge"]')];
      const contentBottom = Math.max(...content.map((element) => element.getBoundingClientRect().bottom));
      const nextHeight = Math.max(0, Math.ceil(contentBottom - containerTop + 16));
      setEvolutionMinHeight((current) => (Math.abs(current - nextHeight) > 1 ? nextHeight : current));
    };
    const scheduleMeasurement = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measureContent);
    };
    const mutationObserver = new MutationObserver(() => {
      resizeObserver.disconnect();
      observeContent();
      scheduleMeasurement();
    });

    observeContent();
    mutationObserver.observe(container, { childList: true, subtree: true });
    window.addEventListener('resize', scheduleMeasurement);
    scheduleMeasurement();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', scheduleMeasurement);
    };
  }, [arrEvoList]);

  const getIncomingEvolutions = (target: IPokemonEvo, stage: number) =>
    (arrEvoList[stage - 1] ?? []).flatMap((source, index) => {
      const pokemon = findPokemonByIdAndForm(source.id, source.dataForm);
      const branch = pokemon?.evoList?.find(
        (item) => item.evoToId === target.id && item.evoToForm.toUpperCase() === target.dataForm
      );
      return branch ? [{ index, branch }] : [];
    });

  const renderImageEvo = (value: IPokemonEvo, chain: IPokemonEvo[], evo: number, index: number, evoCount: number) => {
    const form = getValueOrDefault(String, value.form, props.pokemonData?.form);
    const sex = isEqual(form, 'MALE', EqualMode.IgnoreCaseSensitive)
      ? TypeSex.Male
      : isEqual(form, 'FEMALE', EqualMode.IgnoreCaseSensitive)
        ? TypeSex.Female
        : undefined;
    const isBranched = chain.length > 1 || (arrEvoList[evo - 1]?.length ?? 0) > 1;
    const incomingEvolutions = evo > 0 ? getIncomingEvolutions(value, evo) : [];
    const isConverging = incomingEvolutions.length > 1;
    const edgeLabelAnchor = isConverging ? 'source' : isBranched ? 'target' : 'middle';
    const isCurrent =
      value.id === props.id &&
      value.pokemonType === props.pokemonData?.pokemonType &&
      isEqual(form, generateFormName(props.pokemonData?.form, value.pokemonType, '-'), EqualMode.IgnoreCaseSensitive);
    return (
      <Fragment>
        <span
          id={`evo-${evo}-${index}`}
          data-testid="evolution-node"
          data-evolution-stage={evo}
          data-evolution-index={index}
          data-evolution-id={value.id}
          data-evolution-form={value.dataForm}
        >
          {evo > 0 &&
            incomingEvolutions.map(({ index: sourceIndex, branch: data }) => {
              const hasEvolutionQuest = isNotEmpty(Object.keys(data?.quest ?? new EvolutionQuest()));
              const edgeLayer = chain.length - index;
              const edgeDetails = (
                <div
                  className={`evo-arrow-details${
                    edgeLabelAnchor === 'target'
                      ? ' evo-arrow-details--target'
                      : edgeLabelAnchor === 'source'
                        ? ' evo-arrow-details--source'
                        : ''
                  }${hasEvolutionQuest ? ' evo-arrow-details--with-requirements' : ' evo-arrow-details--simple'}`}
                  data-testid="evolution-edge"
                  data-evolution-source={`${evo - 1}:${sourceIndex}`}
                  data-evolution-target={`${evo}:${index}`}
                  data-evolution-target-form={value.dataForm}
                  data-evolution-label-anchor={edgeLabelAnchor}
                  data-evolution-gender-requirement={data?.quest?.genderRequirement ?? ''}
                  data-evolution-layer={edgeLayer}
                >
                  {data && value.pokemonType !== PokemonType.GMax && (
                    <div className="evo-arrow-cost">
                      {toNumber(data.evoToId) > 0 && (
                        <span className="tw-flex tw-items-center caption tw-w-max">
                          <Candy id={value.id} />
                          {props.pokemonData?.pokemonType === PokemonType.Purified &&
                          data.purificationEvoCandyCost > 0 &&
                          data.purificationEvoCandyCost < data.candyCost ? (
                            <span className="tw-ml-1 tw-inline-flex tw-items-center tw-gap-1">
                              <span className="tw-line-through tw-opacity-70">{`x${data.candyCost}`}</span>
                              <span aria-hidden="true">→</span>
                              <span className="tw-font-semibold tw-text-success">{`x${data.purificationEvoCandyCost}`}</span>
                            </span>
                          ) : (
                            <span className="tw-ml-1">{`x${data.candyCost}`}</span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                  {hasEvolutionQuest && (
                    <div className="evo-arrow-requirements">
                      {data?.quest?.isRandomEvolution && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="isRandomEvolution"
                          data-evolution-icon="random"
                        >
                          <QuestionMarkIcon fontSize="small" />
                          Random
                        </span>
                      )}
                      {data?.quest?.genderRequirement && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="genderRequirement"
                          data-evolution-icon="gender"
                        >
                          {sex === TypeSex.Male ? (
                            <MaleIcon fontSize="small" />
                          ) : (
                            <Fragment>
                              {sex === TypeSex.Female ? (
                                <FemaleIcon fontSize="small" />
                              ) : (
                                <Fragment>
                                  {isEqual(data.quest.genderRequirement, 'MALE', EqualMode.IgnoreCaseSensitive) ? (
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
                        <span
                          className="caption"
                          data-evolution-detail-condition={
                            data.quest.isMustBeBuddy
                              ? 'kmBuddyDistanceRequirementWithCurrentBuddy'
                              : 'kmBuddyDistanceRequirement'
                          }
                          data-evolution-icon={data.quest.isMustBeBuddy ? 'walk-current-buddy' : 'buddy-walk'}
                        >
                          {data.quest.isMustBeBuddy ? (
                            <div className="tw-flex tw-items-end">
                              <DirectionsWalkIcon fontSize="small" />
                              <PetsIcon className="tw-text-sm" />
                            </div>
                          ) : (
                            <DirectionsWalkIcon fontSize="small" />
                          )}
                          {` ${data.quest.kmBuddyDistanceRequirement} km`}
                        </span>
                      )}
                      {data?.quest?.isMustBeBuddy &&
                        !data.quest.kmBuddyDistanceRequirement &&
                        !data.quest.requirements?.length && (
                          <span
                            className="caption"
                            data-evolution-detail-condition="isMustBeBuddy"
                            data-evolution-icon="current-buddy"
                          >
                            <PetsIcon fontSize="small" /> Current Buddy
                          </span>
                        )}
                      {data?.quest?.isOnlyDaytime && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="isOnlyDaytime"
                          data-evolution-icon="daytime"
                        >
                          <WbSunnyIcon fontSize="small" />
                        </span>
                      )}
                      {data?.quest?.isOnlyNighttime && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="isOnlyNighttime"
                          data-evolution-icon="nighttime"
                        >
                          <DarkModeIcon fontSize="small" />
                        </span>
                      )}
                      {data?.quest?.evolutionItemRequirement && (
                        <span
                          className="tw-inline-flex tw-items-center"
                          data-evolution-detail-condition="evolutionItemRequirement"
                          data-evolution-icon="evolution-item"
                        >
                          <img
                            alt="Image Item Required"
                            height={20}
                            src={APIService.getItemEvo(data.quest.evolutionItemRequirement)}
                          />
                          {data.itemCost && (
                            <span className="tw-flex tw-items-center caption tw-ml-1 tw-w-max">{`x${data.itemCost}`}</span>
                          )}
                        </span>
                      )}
                      {data?.quest?.lureItemRequirement && (
                        <span
                          className="tw-inline-flex tw-items-center"
                          data-evolution-detail-condition="lureItemRequirement"
                          data-evolution-icon="lure-module"
                        >
                          <img
                            alt="Image Troy Required"
                            height={20}
                            src={APIService.getItemTroy(data.quest.lureItemRequirement)}
                          />
                        </span>
                      )}
                      {data?.quest?.isOnlyUpsideDown && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="isOnlyUpsideDown"
                          data-evolution-icon="upside-down"
                        >
                          <SecurityUpdateIcon fontSize="small" />
                        </span>
                      )}
                      {data?.quest?.isOnlyFullMoon && (
                        <span
                          className="caption"
                          title="Full moon active in Pokémon GO"
                          data-evolution-detail-condition="isOnlyFullMoon"
                          data-evolution-icon="full-moon"
                        >
                          <Brightness3Icon fontSize="small" /> Full moon
                        </span>
                      )}
                      {data?.quest?.isOnlyDuskPeriod && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="isOnlyDuskPeriod"
                          data-evolution-icon="dusk"
                        >
                          <Brightness4Icon fontSize="small" /> Dusk · Eligible form
                        </span>
                      )}
                      {data?.quest?.noCandyCostViaTrade && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="noCandyCostViaTrade"
                          data-evolution-icon="trade"
                        >
                          <SwapHorizIcon fontSize="small" /> Traded: 0 Candy
                        </span>
                      )}
                      {data?.quest?.highestIv && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="highestIv"
                          data-evolution-icon="highest-iv"
                        >
                          <AssessmentIcon fontSize="small" /> Highest {data.quest.highestIv} IV · Ties: Random
                        </span>
                      )}
                      {data?.quest?.nickname && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="nickname"
                          data-evolution-icon="nickname"
                        >
                          <DriveFileRenameOutlineIcon fontSize="small" /> {data.quest.nickname} · Once per Trainer
                        </span>
                      )}
                      {Boolean(data?.quest?.requirements?.length) && (
                        <QuestRequirements requirements={data?.quest?.requirements ?? []} />
                      )}
                      {!data?.quest?.requirements?.length && data?.quest?.condition && (
                        <span className="caption">
                          {data.quest.condition.desc === ConditionType.Throw && (
                            <span data-evolution-detail-condition="QUEST_LAND_THROW" data-evolution-icon="throw">
                              <CallMadeIcon fontSize="small" />
                              <span>{`${capitalize(data.quest.condition.throwType)} x${data.quest.goal}`}</span>
                            </span>
                          )}
                          {data?.quest.condition.desc === ConditionType.Pokemon && (
                            <div
                              className="tw-flex tw-items-center tw-mt-1"
                              data-evolution-detail-condition="QUEST_CATCH_POKEMON"
                              data-evolution-icon="catch"
                            >
                              <img alt="Pokémon" height={20} src={APIService.getPokeSprite()} />
                              {data.quest.condition.pokemonType?.map((value, index) => (
                                <IconType key={index} height={20} alt="Pokémon GO Type Logo" type={value} />
                              ))}
                              <span className="tw-ml-1">{`x${data.quest.goal}`}</span>
                            </div>
                          )}
                          {data.quest.condition.desc === ConditionType.WinRaid && (
                            <span
                              data-evolution-detail-condition="QUEST_COMPLETE_RAID_BATTLE"
                              data-evolution-icon="raid"
                            >
                              <StadiumIcon fontSize="small" />
                              <span>{`x${data.quest.goal}`}</span>
                            </span>
                          )}
                          {data.quest.condition.desc === ConditionType.PokemonBattle && (
                            <span
                              data-evolution-detail-condition="QUEST_FIGHT_POKEMON"
                              data-evolution-icon="battle-pokemon"
                            >
                              <SportsMartialArtsIcon fontSize="small" />
                              <div className="tw-inline-flex tw-gap-1">
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
                              <span className="tw-text-sm tw-leading-1">{`Battle x${data.quest.goal} ${
                                data.quest.condition.opponentPokemonBattle?.requireDefeat ? 'Defeat' : ''
                              }`}</span>
                            </span>
                          )}
                        </span>
                      )}
                      {!data?.quest?.requirements?.length && data?.quest?.type === QuestType.BuddyEarn && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="QUEST_BUDDY_EARN_AFFECTION_POINTS"
                          data-evolution-icon="buddy-hearts"
                        >
                          <Fragment>
                            <FavoriteIcon fontSize="small" className="tw-text-accent-red" />
                            <span>{`x${data.quest.goal}`}</span>
                          </Fragment>
                        </span>
                      )}
                      {!data?.quest?.requirements?.length && data?.quest?.type === QuestType.BuddyFeed && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="QUEST_BUDDY_FEED"
                          data-evolution-icon="buddy-feed"
                        >
                          <Fragment>
                            <RestaurantIcon fontSize="small" />
                            <span>{`x${data.quest.goal}`}</span>
                          </Fragment>
                        </span>
                      )}
                      {!data?.quest?.requirements?.length && data?.quest?.type === QuestType.UseIncense && (
                        <span
                          className="caption"
                          data-evolution-detail-condition="QUEST_USE_INCENSE"
                          data-evolution-icon="incense"
                        >
                          <Fragment>
                            <img alt="Icon Incense" width={20} height={20} src={getItemSpritePath(ItemName.Incense)} />
                            <div className="tw-text-sm tw-leading-1">Use Incense</div>
                          </Fragment>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
              return (
                <Xarrow
                  key={`evo-${evo}-${index}-from-${sourceIndex}`}
                  labels={
                    edgeLabelAnchor === 'source'
                      ? { start: edgeDetails }
                      : edgeLabelAnchor === 'target'
                        ? { end: edgeDetails }
                        : { middle: edgeDetails }
                  }
                  strokeWidth={2}
                  zIndex={edgeLayer}
                  path="grid"
                  gridBreak={isConverging ? '65%' : isBranched ? '35%' : '50%'}
                  startAnchor={{ position: 'right', offset: { x: -8 } }}
                  endAnchor={{ position: 'left', offset: { x: 8 } }}
                  start={`evo-${evo - 1}-${sourceIndex}`}
                  end={`evo-${evo}-${index}`}
                />
              );
            })}
          <EvolutionPokemonDisplay
            id={value.id}
            form={value.dataForm}
            sprite={value.sprite}
            pokemonType={props.pokemonData?.pokemonType}
            stage={evoCount > 1 ? evo + 1 : undefined}
            formVaries={value.formVaries}
            formLabel={
              evoCount > 1 &&
              (chain.length > 1 || (chain.length === 1 && !isEqual(form, formNormal()) && isNotEmpty(form))) &&
              !isEqual(form, formNormal(), EqualMode.IgnoreCaseSensitive) &&
              isNotEmpty(form)
                ? value.formVaries
                  ? 'Pattern varies'
                  : splitAndCapitalize(form.replaceAll('_', '-'), '-', ' ')
                : undefined
            }
            name={splitAndCapitalize(
              evoCount === 1 && form && !value.formVaries && !isEqual(form, formNormal(), EqualMode.IgnoreCaseSensitive)
                ? `${value.name}-${form.replaceAll('_', '-')}`
                : value.name,
              '-',
              ' '
            )}
          />
        </span>
        {value.isBaby && <span className="caption tw-text-error">(Baby)</span>}
        <p>{isCurrent && <span className="caption">Current</span>}</p>
      </Fragment>
    );
  };

  const reload = (element: JSX.Element) => {
    if (
      props.isLoadedForms ||
      (isNotEmpty(arrEvoList) && arrEvoList.some((evo) => evo.some((pokemon) => pokemon.id === props.id)))
    ) {
      return element;
    }
    return (
      <div className="slide-container !tw-w-3/4 !tw-p-0 !tw-m-auto !tw-h-30">
        <Skeleton variant="rectangular" animation="wave" className="!tw-w-full !tw-h-full !tw-m-0 !tw-p-0" />
      </div>
    );
  };

  return (
    <Fragment>
      <h4 className="title-evo">
        <b>Evolution Chain</b>
        <Tooltips
          openOnClick
          hideBackground
          arrow
          colorArrow="var(--custom-pop-over)"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, -4],
                  },
                },
              ],
            },
          }}
          title={
            <div className="popover-info tw-max-h-[70vh] tw-overflow-y-auto">
              <span className="info-evo">
                <span className="tw-block caption" data-evolution-condition="candyCost" data-evolution-icon="candy">
                  - <img alt="Candy" height={20} src={getItemSpritePath(ItemName.RareCandy)} /> : Candy required.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="evolutionItemRequirement"
                  data-evolution-icon="evolution-item"
                >
                  -{' '}
                  <img
                    alt="Evolution Item"
                    height={20}
                    src={APIService.getItemEvo(ItemEvolutionRequireType.Gen4Stone)}
                  />{' '}
                  : Shown Evolution Item required.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="isRandomEvolution"
                  data-evolution-icon="random"
                >
                  - <QuestionMarkIcon fontSize="small" /> : Random evolution outcome.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="genderRequirement"
                  data-evolution-icon="gender"
                >
                  - <MaleIcon fontSize="small" />/<FemaleIcon fontSize="small" /> : Specific gender required.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="kmBuddyDistanceRequirementWithCurrentBuddy"
                  data-evolution-icon="walk-current-buddy"
                >
                  - <DirectionsWalkIcon fontSize="small" />
                  <PetsIcon className="tw-text-sm" /> : Walk, then keep as current Buddy.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="kmBuddyDistanceRequirement QUEST_BUDDY_EVOLUTION_WALK"
                  data-evolution-icon="buddy-walk"
                >
                  - <DirectionsWalkIcon fontSize="small" /> : Walk as your Buddy.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="isMustBeBuddy"
                  data-evolution-icon="current-buddy"
                >
                  - <PetsIcon fontSize="small" /> : Keep as your current Buddy.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="isOnlyDaytime"
                  data-evolution-icon="daytime"
                >
                  - <WbSunnyIcon fontSize="small" /> : Evolve during daytime.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="isOnlyNighttime"
                  data-evolution-icon="nighttime"
                >
                  - <DarkModeIcon fontSize="small" /> : Evolve during nighttime.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="isOnlyFullMoon"
                  data-evolution-icon="full-moon"
                >
                  - <Brightness3Icon fontSize="small" /> : Evolve during an in-game full moon.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="isOnlyDuskPeriod"
                  data-evolution-icon="dusk"
                >
                  - <Brightness4Icon fontSize="small" /> : Evolve during in-game dusk.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="lureItemRequirement"
                  data-evolution-icon="lure-module"
                >
                  - <img alt="Lure Module" height={20} src={APIService.getItemTroy()} /> : Use the shown Lure Module.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="isOnlyUpsideDown"
                  data-evolution-icon="upside-down"
                >
                  - <SecurityUpdateIcon fontSize="small" /> : Turn your phone upside down.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="noCandyCostViaTrade"
                  data-evolution-icon="trade"
                >
                  - <SwapHorizIcon fontSize="small" /> : Traded Pokémon use 0 Candy.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="highestIv"
                  data-evolution-icon="highest-iv"
                >
                  - <AssessmentIcon fontSize="small" /> : Highest IV determines the outcome.
                </span>
                <span className="tw-block caption" data-evolution-condition="nickname" data-evolution-icon="nickname">
                  - <DriveFileRenameOutlineIcon fontSize="small" /> : Each nickname trick works once.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="QUEST_LAND_THROW"
                  data-evolution-icon="throw"
                >
                  - <CallMadeIcon fontSize="small" /> : Make the required throws.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="QUEST_CATCH_POKEMON"
                  data-evolution-icon="catch"
                >
                  - <img alt="Pokémon" height={20} src={APIService.getPokeSprite()} /> : Catch the required Pokémon
                  type.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="QUEST_COMPLETE_RAID_BATTLE"
                  data-evolution-icon="raid"
                >
                  - <StadiumIcon fontSize="small" /> : Win the required Raid Battles.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="QUEST_BUDDY_EARN_AFFECTION_POINTS"
                  data-evolution-icon="buddy-hearts"
                >
                  - <FavoriteIcon fontSize="small" className="tw-text-accent-red" /> : Earn Buddy hearts.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="QUEST_BUDDY_FEED"
                  data-evolution-icon="buddy-feed"
                >
                  - <RestaurantIcon fontSize="small" /> : Feed your Buddy.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="QUEST_USE_INCENSE"
                  data-evolution-icon="incense"
                >
                  - <img alt="icon-incense" width={20} height={20} src={getItemSpritePath(ItemName.Incense)} /> : Use an
                  Incense.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="QUEST_COMPLETE_BATTLE"
                  data-evolution-icon="complete-battle"
                >
                  - <EmojiEventsIcon fontSize="small" /> : Complete the required battles.
                </span>
                <span
                  className="tw-block caption"
                  data-evolution-condition="QUEST_FIGHT_POKEMON"
                  data-evolution-icon="battle-pokemon"
                >
                  - <SportsMartialArtsIcon fontSize="small" /> : Battle the required Pokémon.
                </span>
              </span>
            </div>
          }
        >
          <button
            aria-label="Evolution information"
            aria-haspopup="dialog"
            className="tooltips-info tw-border-0 tw-bg-transparent tw-p-0"
            data-testid="evolution-info-button"
            type="button"
          >
            <InfoOutlinedIcon color="primary" />
          </button>
        </Tooltips>
      </h4>
      <div
        ref={evolutionContainerRef}
        className="evo-container scroll-evolution"
        data-testid="evolution-container"
        style={evolutionMinHeight ? { minHeight: `${evolutionMinHeight}px` } : undefined}
      >
        {reload(
          <ul className="ul-evo evo-chain tw-inline-flex">
            {arrEvoList.map((values, evo) => (
              <li key={evo} className="img-form-gender-group li-evo !tw-w-auto tw-min-w-24 !tw-mr-0">
                <ul className="ul-evo tw-flex tw-flex-col">
                  {values.map((value, index) => (
                    <li
                      key={index}
                      className="img-form-gender-group img-evo-group li-evo !tw-w-auto tw-min-w-24 !tw-mr-0"
                    >
                      {value.formVaries ? (
                        <div className="select-evo" title="Vivillon pattern depends on the Scatterbug encounter">
                          {renderImageEvo(value, values, evo, index, arrEvoList.length)}
                        </div>
                      ) : props.setSearchOption ? (
                        <div
                          className="select-evo"
                          onClick={() => {
                            props.setSearchOption?.({ id: value.id, form: value.form, pokemonType: value.pokemonType });
                          }}
                          title={`#${value.id} ${splitAndCapitalize(value.name, '-', ' ')}`}
                        >
                          {renderImageEvo(value, values, evo, index, arrEvoList.length)}
                        </div>
                      ) : (
                        <Link
                          className="select-evo"
                          to={`/pokemon/${value.id}${generateParamForm(value.form, value.pokemonType)}`}
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
