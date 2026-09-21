import { Badge, Skeleton } from '@mui/material';
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
import QuestRequirements from './QuestRequirements';
import React, { Fragment, useEffect, useState } from 'react';
import Xarrow from 'react-xarrows';
import { Link } from 'react-router-dom';
import APIService from '../../../services/api.service';

import './Evolution.scss';
import {
  capitalize,
  convertFormGif,
  convertModelSpritName,
  generateFormName,
  generateParamForm,
  getDataWithKey,
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
import { ConditionType, QuestType } from '../../../core/enums/option.enum';
import { IPokemonDetail } from '../../../core/models/API/info.model';
import { ItemName } from '../../../pages/News/enums/item-type.enum';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
import IconType from '../../Sprites/Icon/Type/Type';
import { APIUrl } from '../../../services/constants';
import { formNormal, formStandard } from '../../../utils/helpers/options-context.helpers';
import usePokemon from '../../../composables/usePokemon';
import Tooltips from '../../Commons/Tooltips/Tooltips';

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
    formVaries = false
  ) {
    const obj = new PokemonEvo();
    obj.prev = prev;
    obj.name = getValueOrDefault(String, name);
    obj.id = toNumber(id);
    obj.isBaby = isBaby;
    obj.form = generateFormName(form, pokemonType, '-').toUpperCase();
    obj.dataForm = (form || formNormal()).toUpperCase();
    obj.formVaries = formVaries;
    obj.pokemonType = pokemonType;
    obj.sprite = sprite;
    return obj;
  }
}

const Evolution = (props: IEvolutionComponent) => {
  const { findPokemonByIdAndForm, getEvolutionParents, getPokemonById } = usePokemon();
  const [arrEvoList, setArrEvoList] = useState<IPokemonEvo[][]>([]);

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
    const sprite =
      pokemon.id === 664 || pokemon.id === 665
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
      pokemon.formVaries
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
    const pokemonEvoList = evoList?.map((evo) =>
      modelEvoChain(
        new EvolutionModel({
          id: evo.evoToId,
          name: evo.evoToName,
          form: evo.evoToForm,
          formVaries: evo.formVaries,
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

  const getIncomingEvolutions = (target: IPokemonEvo, stage: number) =>
    (arrEvoList[stage - 1] ?? []).flatMap((source, index) => {
      const pokemon = findPokemonByIdAndForm(source.id, source.dataForm);
      const branch = pokemon?.evoList?.find(
        (item) => item.evoToId === target.id && item.evoToForm.toUpperCase() === target.dataForm
      );
      return branch ? [{ index, branch }] : [];
    });

  const renderImgGif = (value: IPokemonEvo) => (
    <PokemonIconType pokemonType={props.pokemonData?.pokemonType} size={30}>
      <img
        className="pokemon-sprite"
        id="Pokémon Image"
        alt="Pokémon Image"
        src={
          value.formVaries
            ? APIService.getPokeSprite()
            : APIService.getPokemonAsset('pokemon-animation', 'all', convertFormGif(value.sprite), 'gif')
        }
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
    const isBranched = chain.length > 1 || (arrEvoList[evo - 1]?.length ?? 0) > 1;
    const isCurrent =
      value.id === props.id &&
      value.pokemonType === props.pokemonData?.pokemonType &&
      isEqual(form, generateFormName(props.pokemonData?.form, value.pokemonType, '-'), EqualMode.IgnoreCaseSensitive);
    return (
      <Fragment>
        <span id={`evo-${evo}-${index}`}>
          {evo > 0 &&
            getIncomingEvolutions(value, evo).map(({ index: sourceIndex, branch: data }) => (
              <Xarrow
                key={`evo-${evo}-${index}-from-${sourceIndex}`}
                labels={{
                  middle: (
                    <div className="evo-arrow-details">
                      {data && value.pokemonType !== PokemonType.GMax && (
                        <div>
                          {toNumber(data.evoToId) > 0 && (
                            <span className="tw-flex tw-items-center caption tw-w-max">
                              <Candy id={value.id} />
                              <span className="tw-ml-1">{`x${
                                props.pokemonData?.pokemonType === PokemonType.Purified
                                  ? data.purificationEvoCandyCost || data.candyCost
                                  : data.candyCost
                              }`}</span>
                            </span>
                          )}
                          {props.pokemonData?.pokemonType === PokemonType.Purified &&
                            data.purificationEvoCandyCost > 0 && (
                              <span className="tw-block tw-text-right caption !tw-text-red-500">{`-${
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
                              Random
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
                              <span className="caption">
                                <PetsIcon fontSize="small" /> Current Buddy
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
                                <span className="tw-flex tw-items-center caption tw-ml-1 tw-w-max">{`x${data.itemCost}`}</span>
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
                          {data?.quest?.isOnlyFullMoon && (
                            <span className="caption" title="Full moon active in Pokémon GO">
                              <DarkModeIcon fontSize="small" /> Full moon
                            </span>
                          )}
                          {data?.quest?.isOnlyDuskPeriod && (
                            <span className="caption">
                              <Brightness4Icon fontSize="small" /> Dusk · Eligible form
                            </span>
                          )}
                          {data?.quest?.noCandyCostViaTrade && (
                            <span className="caption">
                              <SwapHorizIcon fontSize="small" /> Traded: 0 Candy
                            </span>
                          )}
                          {data?.quest?.highestIv && (
                            <span className="caption">Highest {data.quest.highestIv} IV · Ties: Random</span>
                          )}
                          {data?.quest?.nickname && (
                            <span className="caption">{data.quest.nickname} · Once per Trainer</span>
                          )}
                          {Boolean(data?.quest?.requirements?.length) && (
                            <QuestRequirements requirements={data?.quest?.requirements ?? []} />
                          )}
                          {!data?.quest?.requirements?.length && data?.quest?.condition && (
                            <span className="caption">
                              {data.quest.condition.desc === ConditionType.Throw && (
                                <Fragment>
                                  <CallMadeIcon fontSize="small" />
                                  <span>{`${capitalize(data.quest.condition.throwType)} x${data.quest.goal}`}</span>
                                </Fragment>
                              )}
                              {data?.quest.condition.desc === ConditionType.Pokemon && (
                                <div className="tw-flex tw-items-center tw-mt-1">
                                  {data.quest.condition.pokemonType?.map((value, index) => (
                                    <IconType key={index} height={20} alt="Pokémon GO Type Logo" type={value} />
                                  ))}
                                  <span className="tw-ml-1">{`x${data.quest.goal}`}</span>
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
                                </Fragment>
                              )}
                            </span>
                          )}
                          {!data?.quest?.requirements?.length && data?.quest?.type === QuestType.BuddyEarn && (
                            <span className="caption">
                              <Fragment>
                                <FavoriteIcon fontSize="small" sx={{ color: 'red' }} />
                                <span>{`x${data.quest.goal}`}</span>
                              </Fragment>
                            </span>
                          )}
                          {!data?.quest?.requirements?.length && data?.quest?.type === QuestType.BuddyFeed && (
                            <span className="caption">
                              <Fragment>
                                <RestaurantIcon fontSize="small" />
                                <span>{`x${data.quest.goal}`}</span>
                              </Fragment>
                            </span>
                          )}
                          {!data?.quest?.requirements?.length && data?.quest?.type === QuestType.UseIncense && (
                            <span className="caption">
                              <Fragment>
                                <img
                                  alt="Icon Incense"
                                  width={20}
                                  height={20}
                                  src={getItemSpritePath(ItemName.Incense)}
                                />
                                <div className="tw-text-sm tw-leading-1">Use Incense</div>
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
                gridBreak={isBranched ? '90%' : '50%'}
                startAnchor={{ position: 'right', offset: { x: -8 } }}
                endAnchor={{ position: 'left', offset: { x: 8 } }}
                start={`evo-${evo - 1}-${sourceIndex}`}
                end={`evo-${evo}-${index}`}
              />
            ))}
          {evoCount > 1 ? (
            <Fragment>
              {chain.length > 1 || (chain.length === 1 && !isEqual(form, formNormal()) && isNotEmpty(form)) ? (
                <Fragment>
                  {!isEqual(form, formNormal(), EqualMode.IgnoreCaseSensitive) && isNotEmpty(form) ? (
                    <Badge
                      color="secondary"
                      overlap="circular"
                      badgeContent={
                        value.formVaries ? 'Pattern varies' : splitAndCapitalize(form.replaceAll('_', '-'), '-', ' ')
                      }
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
            <b className="tw-text-default">#{value.id}</b>
          </div>
          <div>
            <b className="link-title">
              {splitAndCapitalize(
                evoCount === 1 &&
                  form &&
                  !value.formVaries &&
                  !isEqual(form, formNormal(), EqualMode.IgnoreCaseSensitive)
                  ? `${value.name}-${form.replaceAll('_', '-')}`
                  : value.name,
                '-',
                ' '
              )}
            </b>
          </div>
        </span>
        {value.isBaby && <span className="caption tw-text-red-600">(Baby)</span>}
        <p>{isCurrent && <span className="caption">Current</span>}</p>
      </Fragment>
    );
  };

  const reload = (element: JSX.Element, color = 'var(--custom-default)') => {
    if (
      props.isLoadedForms ||
      (isNotEmpty(arrEvoList) && arrEvoList.some((evo) => evo.some((pokemon) => pokemon.id === props.id)))
    ) {
      return element;
    }
    return (
      <div
        className="slide-container !tw-w-3/4 !tw-p-0 !tw-m-auto !tw-h-30 tw-opacity-50"
        style={{ background: color }}
      >
        <Skeleton variant="rectangular" animation="wave" className="!tw-w-full !tw-h-full !tw-m-0 !tw-p-0" />
      </div>
    );
  };

  return (
    <Fragment>
      <h4 className="title-evo">
        <b>Evolution Chain</b>
        <Tooltips
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
            <div className="popover-info">
              <span className="info-evo">
                <span className="tw-block caption">
                  - <img alt="Image Stardust" height={20} src={getItemSpritePath(ItemName.RareCandy)} /> : Candy of
                  pokemon.
                </span>
                <span className="tw-block caption">
                  - <QuestionMarkIcon fontSize="small" /> : Random evolution.
                </span>
                <span className="tw-block caption">
                  - <MaleIcon fontSize="small" />/<FemaleIcon fontSize="small" /> : Only once gender can evolution.
                </span>
                <span className="tw-block caption">
                  - <DirectionsWalkIcon fontSize="small" />
                  <PetsIcon className="tw-text-sm" /> : Walk together with buddy.
                </span>
                <span className="tw-block caption">
                  - <DirectionsWalkIcon fontSize="small" /> : Buddy walk with trainer.
                </span>
                <span className="tw-block caption">
                  - <WbSunnyIcon fontSize="small" /> : Evolution during at day.
                </span>
                <span className="tw-block caption">
                  - <DarkModeIcon fontSize="small" /> : Evolution during at night.
                </span>
                <span className="tw-block caption">
                  - <img alt="Image Troy Required" height={20} src={APIService.getItemTroy()} /> : Evolution in lure
                  module.
                </span>
                <span className="tw-block caption">
                  - <SecurityUpdateIcon fontSize="small" /> : Evolution at upside down phone.
                </span>
                <span className="tw-block caption">
                  - <CallMadeIcon fontSize="small" /> : Throw pokeball with condition.
                </span>
                <span className="tw-block caption">
                  - <img alt="Image Stardust" height={20} src={APIService.getPokeSprite()} /> : Catch pokemon with type.
                </span>
                <span className="tw-block caption">
                  - <SportsMartialArtsIcon fontSize="small" /> : Win raid.
                </span>
                <span className="tw-block caption">
                  - <FavoriteIcon fontSize="small" sx={{ color: 'red' }} /> : Evolution with affection points.
                </span>
                <span className="tw-block caption">
                  - <RestaurantIcon fontSize="small" /> : Buddy feed.
                </span>
                <span className="tw-block caption">
                  - <img alt="icon-incense" width={20} height={20} src={getItemSpritePath(ItemName.Incense)} /> : Use
                  Incense.
                </span>
                <span className="tw-block caption">- Pokémon Battle.</span>
              </span>
            </div>
          }
        >
          <span className="tooltips-info">
            <InfoOutlinedIcon color="primary" />
          </span>
        </Tooltips>
      </h4>
      <div className="evo-container scroll-evolution">
        {reload(
          <ul className="ul-evo evo-chain tw-inline-flex">
            {arrEvoList.map((values, evo) => (
              <li key={evo} className="img-form-gender-group li-evo">
                <ul className="ul-evo tw-flex tw-flex-col">
                  {values.map((value, index) => (
                    <li key={index} className="img-form-gender-group img-evo-group li-evo">
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
