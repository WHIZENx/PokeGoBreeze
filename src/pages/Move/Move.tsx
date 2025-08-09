import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import {
  capitalize,
  convertPokemonDataName,
  createDataRows,
  generateParamForm,
  getItemSpritePath,
  getKeyWithData,
  splitAndCapitalize,
} from '../../utils/utils';
import { Params } from '../../utils/constants';
import { getBarCharge } from '../../utils/calculate';

import TypeBar from '../../components/Sprites/TypeBar/TypeBar';

import APIService from '../../services/api.service';
import './Move.scss';

import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import CircleIcon from '@mui/icons-material/Circle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Checkbox } from '@mui/material';
import { BuffType, ColumnType, MoveType, TypeAction, TypeMove } from '../../enums/type.enum';
import ChargedBar from '../../components/Sprites/ChargedBar/ChargedBar';
import { BonusEffectType, ICombat } from '../../core/models/combat.model';
import { IPokemonTopMove } from '../../utils/models/pokemon-top-move.model';
import { IMovePage } from '../models/page.model';
import { TableColumnModify } from '../../utils/models/overrides/data-table.model';
import {
  combineClasses,
  getValueOrDefault,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  safeObjectEntries,
  toFloat,
  toFloatWithPadding,
  toNumber,
} from '../../utils/extension';
import { EqualMode, IncludeMode } from '../../utils/enums/string.enum';
import { PokemonTypeBadge } from '../../core/enums/pokemon-type.enum';
import { LinkToTop } from '../../components/Link/LinkToTop';
import { BonusType } from '../../core/enums/bonus-type.enum';
import Candy from '../../components/Sprites/Candy/Candy';
import CircularProgressTable from '../../components/Sprites/CircularProgress/CircularProgress';
import CustomDataTable from '../../components/Commons/Tables/CustomDataTable/CustomDataTable';
import { IMenuItem } from '../../components/Commons/models/menu.model';
import { useTitle } from '../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../utils/models/hook.model';
import { battleStab, getTypes, getWeatherBoost } from '../../utils/helpers/options-context.helpers';
import usePokemon from '../../composables/usePokemon';
import useCombats from '../../composables/useCombats';
import useCalculate from '../../composables/useCalculate';
import InputReleased from '../../components/Commons/Inputs/InputReleased';
import FormControlMui from '../../components/Commons/Forms/FormControlMui';
import SelectMui from '../../components/Commons/Selects/SelectMui';
import AccordionMui from '../../components/Commons/Accordions/AccordionMui';
import { useSnackbar } from '../../contexts/snackbar.context';

const nameSort = (rowA: IPokemonTopMove, rowB: IPokemonTopMove) => {
  const a = rowA.name.toLowerCase();
  const b = rowB.name.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const numSortDps = (rowA: IPokemonTopMove, rowB: IPokemonTopMove) => {
  const a = toFloat(rowA.dps);
  const b = toFloat(rowB.dps);
  return a - b;
};

const numSortTdo = (rowA: IPokemonTopMove, rowB: IPokemonTopMove) => {
  const a = toFloat(rowA.tdo);
  const b = toFloat(rowB.tdo);
  return a - b;
};

const columns = createDataRows<TableColumnModify<IPokemonTopMove>>(
  {
    id: ColumnType.Id,
    name: 'Id',
    selector: (row) => row.num,
    sortable: true,
    minWidth: '40px',
  },
  {
    id: ColumnType.Name,
    name: 'Name',
    selector: (row) => (
      <LinkToTop to={`/pokemon/${row.num}${generateParamForm(row.form)}`}>
        <img
          height={48}
          alt="Pokémon Image"
          className="tw-mr-2"
          src={APIService.getPokeIconSprite(row.sprite, false)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row.baseSpecies);
          }}
        />
        {row.name}
      </LinkToTop>
    ),
    sortable: true,
    minWidth: '250px',
    sortFunction: nameSort,
  },
  {
    id: ColumnType.Type,
    name: 'Type',
    selector: (row) => (
      <>
        {row.moveType !== MoveType.None && (
          <span
            className={combineClasses(
              'type-icon-small ic',
              `${getKeyWithData(MoveType, row.moveType)?.toLowerCase()}-ic`
            )}
          >
            {getKeyWithData(MoveType, row.moveType)}
          </span>
        )}
      </>
    ),
    minWidth: '100px',
  },
  {
    id: ColumnType.DPS,
    name: 'DPS',
    selector: (row) => toFloatWithPadding(row.dps, 2),
    sortable: true,
    sortFunction: numSortDps,
    minWidth: '90px',
  },
  {
    id: ColumnType.TDO,
    name: 'TDO',
    selector: (row) => toFloatWithPadding(row.tdo, 2),
    sortable: true,
    sortFunction: numSortTdo,
    minWidth: '90px',
  }
);

const Move = (props: IMovePage) => {
  const { checkPokemonGO } = usePokemon();
  const { findMoveByName, findMoveById, getCombatsById } = useCombats();
  const { queryTopMove } = useCalculate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [move, setMove] = useState<ICombat>();
  const [releasedGO, setReleaseGO] = useState(true);
  const [isMatch, setIsMatch] = useState(false);
  const [topList, setTopList] = useState<IPokemonTopMove[]>([]);
  const [topListFilter, setTopListFilter] = useState<IPokemonTopMove[]>([]);
  const [moveType, setMoveType] = useState<string>();
  const [progress, setProgress] = useState(false);

  const { showSnackbar } = useSnackbar();

  const menuItems = createDataRows<IMenuItem<IPokemonTopMove>>(
    {
      label: (
        <InputReleased
          releasedGO={releasedGO}
          setReleaseGO={(check) => setReleaseGO(check)}
          isAvailable={releasedGO}
          inputMode={'checkbox'}
        />
      ),
    },
    {
      label: (
        <FormControlMui
          control={<Checkbox checked={isMatch} onChange={(_, check) => setIsMatch(check)} />}
          label="Match Pokémon"
        />
      ),
    }
  );

  const getWeatherEffective = (type: string | undefined) => {
    const result = safeObjectEntries(getWeatherBoost())?.find(([, value]) => {
      if (isIncludeList(value, type, IncludeMode.IncludeIgnoreCaseSensitive)) {
        return value;
      }
    });
    if (result && isNotEmpty(result)) {
      return result[0];
    }
    return;
  };

  const [titleProps, setTitleProps] = useState<TitleSEOProps>({
    title: 'Move - Information',
    description:
      'Comprehensive database of Pokémon GO moves. Find detailed information about Fast and Charged moves, power, energy, DPS, and more.',
    keywords: [
      'Pokémon GO',
      'moves',
      'fast moves',
      'charged moves',
      'PVP moves',
      'move stats',
      'move database',
      'PokéGO Breeze',
    ],
  });

  useTitle(titleProps);

  const queryMoveData = useCallback(
    (id: number) => {
      const moves = getCombatsById(id);
      if (isNotEmpty(moves)) {
        let move = moves.find((item) => item.id === id);
        if (move?.isMultipleWithType) {
          let type = searchParams.get(Params.MoveType);
          if (type) {
            searchParams.set(Params.MoveType, type.toLowerCase());
            move = moves.find((item) => isEqual(item.type, type, EqualMode.IgnoreCaseSensitive));
          } else {
            type = getValueOrDefault(String, move.type).toLowerCase();
            searchParams.set(Params.MoveType, type);
          }
          setSearchParams(searchParams);
          setMoveType(type.toLowerCase());
        } else if (!isEqual(move?.moveType, MoveType.Dynamax)) {
          move = moves.find((item) => item.track === id);
        }
        if (move) {
          setMove(move);
          setTitleProps({
            title: `#${move.track} - ${splitAndCapitalize(move.name.toLowerCase(), '_', ' ')}`,
            description: `Detailed information about ${splitAndCapitalize(
              move.name.toLowerCase(),
              '_',
              ' '
            )}, a ${capitalize(move.type)} type ${
              move.typeMove === TypeMove.Fast ? 'Fast' : 'Charged'
            } move in Pokémon GO. See power, energy, and DPS stats.`,
            keywords: [
              'Pokémon GO',
              `${splitAndCapitalize(move.name.toLowerCase(), '_', ' ')}`,
              `${capitalize(move.type)} type`,
              `${move.typeMove === TypeMove.Fast ? 'Fast' : 'Charged'} move`,
              'move stats',
              'battle moves',
              'combat power',
              'PokéGO Breeze',
            ],
            image: APIService.getTypeHqSprite(move.type),
          });
        } else {
          showSnackbar(`Move ID: ${id} Not found!`, 'error');
          if (id) {
            setTitleProps({
              title: `#${id} - Not Found`,
              description: 'The requested move could not be found. Please check the move ID and try again.',
              keywords: ['Pokémon GO', 'move not found', 'error', 'PokéGO Breeze'],
            });
          }
        }
      }
    },
    [getCombatsById]
  );

  const getMoveIdByParam = () => {
    let id = toNumber(params.id ? params.id.toLowerCase() : props.id);
    if (id === 0 && params.id && isNotEmpty(params.id)) {
      const move = findMoveByName(params.id);
      if (move) {
        id = move.id;
      }
    }
    return id;
  };

  useEffect(() => {
    if (!move) {
      const id = getMoveIdByParam();
      if (id > 0) {
        queryMoveData(id);
      }
    }
  }, [params.id, props.id, queryMoveData, move, findMoveByName]);

  useEffect(() => {
    if (move) {
      const result = queryTopMove(move);
      setTopList(result);
      setProgress(true);
    }
  }, [move, queryTopMove]);

  useEffect(() => {
    setTopListFilter(
      topList.filter((pokemon) => {
        if (!releasedGO) {
          return true;
        }
        if (!pokemon.releasedGO) {
          return checkPokemonGO(pokemon.num, convertPokemonDataName(pokemon.sprite, pokemon.name.replaceAll(' ', '_')));
        }
        return pokemon.releasedGO;
      })
    );
  }, [topList, releasedGO]);

  useEffect(() => {
    const type = searchParams.get(Params.MoveType);
    if (move?.isMultipleWithType && type) {
      searchParams.set(Params.MoveType, type.toLowerCase());
      setSearchParams(searchParams);
      setMove(findMoveById(move.track, type));
      setMoveType(type.toLowerCase());
    }
  }, [move?.isMultipleWithType, searchParams, findMoveById]);

  const renderBonus = (bonusType: BonusType | undefined, value: string | number | string[]) => {
    if (
      isEqual(bonusType, BonusType.SpaceBonus) ||
      isEqual(bonusType, BonusType.SlowFreezeBonus) ||
      isEqual(bonusType, BonusType.AttackDefenseBonus)
    ) {
      return value;
    } else if (isEqual(bonusType, BonusType.TimeBonus)) {
      return (
        <div className="tw-flex tw-flex-wrap tw-gap-2">
          {getValueOrDefault<string[]>(Array, value as string[]).map((item) => renderReward(item))}
        </div>
      );
    }
    return renderReward(value as string);
  };

  const renderReward = (itemName: string) => (
    <div className="tw-flex tw-items-center tw-flex-col">
      <div style={{ width: 35 }}>
        <img alt="Icon Item" className="sprite-type" src={getItemSpritePath(itemName)} />
      </div>
      <span className="caption">{splitAndCapitalize(itemName.replace('ITEM_', ''), '_', ' ')}</span>
    </div>
  );

  return (
    <div className={combineClasses('tw-pb-3 poke-container', props.id ? '' : 'tw-container')}>
      {move ? (
        <>
          <div className="tw-h-full head-box tw-flex tw-flex-wrap tw-items-center">
            <h1 className="text-move">
              <b>{splitAndCapitalize(move.name.toLowerCase(), '_', ' ')}</b>
            </h1>
            <TypeBar type={move.type} />
          </div>
          {move.isMultipleWithType && (
            <SelectMui
              formClassName="tw-mt-2"
              formSx={{ width: 250 }}
              onChangeSelect={(value) => {
                searchParams.set(Params.MoveType, value.toLowerCase());
                setSearchParams(searchParams);
              }}
              value={moveType}
              menuItems={getTypes()
                .filter(
                  (type) =>
                    !isEqual(
                      type,
                      getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Fairy),
                      EqualMode.IgnoreCaseSensitive
                    )
                )
                .map((value) => ({
                  value,
                  label: splitAndCapitalize(value, /(?=[A-Z])/, ' '),
                }))}
            />
          )}
        </>
      ) : (
        <div className="ph-item">
          <div className="ph-row tw-h-full head-box tw-flex tw-mb-0 tw-pl-0">
            <div className="ph-picture tw-w-2/5" style={{ height: 45 }} />
          </div>
        </div>
      )}
      <hr />
      <div className="row !tw-m-0">
        <div className="col !tw-p-0">
          <table className="table-info move-table">
            <thead className="tw-text-center">
              <tr>
                <th colSpan={3}>{`Stats ${splitAndCapitalize(move?.name.toLowerCase(), '_', ' ')} in Pokémon GO`}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ID</td>
                <td colSpan={2}>
                  <b>{move && `#${move.track}`}</b>
                </td>
              </tr>
              <tr>
                <td>Name</td>
                <td colSpan={2}>
                  <b>{splitAndCapitalize(move?.name.toLowerCase(), '_', ' ')}</b>
                </td>
              </tr>
              <tr>
                <td>Type</td>
                <td colSpan={2}>
                  {move && (
                    <div className={combineClasses('type-icon-small tw-w-fit', move.type?.toLowerCase())}>
                      {capitalize(move.type)}
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td>Move Type</td>
                <td colSpan={2}>
                  <b>{move && `${getKeyWithData(TypeMove, move.typeMove)} Move`}</b>
                </td>
              </tr>
              <tr>
                <td>Weather Boosts</td>
                <td colSpan={2}>
                  {move && (
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <img
                        className="img-type-icon"
                        height={25}
                        alt="Image Weather"
                        src={APIService.getWeatherIconSprite(getWeatherEffective(move.type))}
                      />
                      <span className="caption">{splitAndCapitalize(getWeatherEffective(move.type), '_', ' ')}</span>
                    </div>
                  )}
                </td>
              </tr>
              <tr className="tw-text-center">
                <td className="table-sub-header" colSpan={3}>
                  PVE Stats
                </td>
              </tr>
              <tr>
                <td>PVE Power</td>
                <td colSpan={2}>{move?.pvePower}</td>
              </tr>
              <tr>
                <td>
                  PVE Power
                  <span className="caption">(Weather / STAB / Shadow Bonus)</span>
                </td>
                <td colSpan={2}>
                  {move && (
                    <div className="tw-flex tw-items-center tw-gap-1">
                      <span>{toFloatWithPadding(move.pvePower * battleStab(), 2)}</span>
                      <span className="tw-text-green-600 tw-inline-block caption tw-ml-1">
                        {`+${toFloatWithPadding(move.pvePower * 0.2, 2)}`}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td>PVE Energy</td>
                <td colSpan={2}>
                  {toNumber(move?.pveEnergy) > 0 && '+'}
                  {move?.pveEnergy}
                </td>
              </tr>
              {move?.typeMove === TypeMove.Charge && (
                <tr>
                  <td>PVE Bar Charged</td>
                  <td colSpan={2}>
                    <ChargedBar barCount={getBarCharge(move.pveEnergy, true)} color={move.type?.toLowerCase()} />
                  </td>
                </tr>
              )}
              <tr className="tw-text-center">
                <td className="table-sub-header" colSpan={3}>
                  PVP Stats
                </td>
              </tr>
              <tr>
                <td>PVP Power</td>
                <td colSpan={2}>{move?.pvpPower}</td>
              </tr>
              <tr>
                <td>
                  PVP Power
                  <span className="caption">(STAB / Shadow Bonus)</span>
                </td>
                <td colSpan={2}>
                  {move && (
                    <div className="tw-flex tw-items-center tw-gap-1">
                      <span>{toFloatWithPadding(move.pvpPower * battleStab(), 2)}</span>
                      <span className="tw-text-green-600 tw-inline-block caption tw-ml-1">
                        {`+${toFloatWithPadding(move.pvpPower * 0.2, 2)}`}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td>PVP Energy</td>
                <td colSpan={2}>
                  {toNumber(move?.pvpEnergy) > 0 && '+'}
                  {move?.pvpEnergy}
                </td>
              </tr>
              {move?.typeMove === TypeMove.Charge && (
                <tr>
                  <td>PVP Bar Charged</td>
                  <td colSpan={2}>
                    <ChargedBar barCount={getBarCharge(move.pvpEnergy)} color={move.type?.toLowerCase()} />
                  </td>
                </tr>
              )}
              {isNotEmpty(move?.buffs) && (
                <Fragment>
                  <tr className="tw-text-center">
                    <td className="table-sub-header" colSpan={3}>
                      PVP Buffs
                    </td>
                  </tr>
                  {move?.buffs.map((value, index) => (
                    <tr key={index}>
                      <td className="target-buff">
                        <CircleIcon className="tw-text-xs" /> {getKeyWithData(BuffType, value.target)}
                      </td>
                      <td>
                        {value.power > 0 ? <ArrowUpwardIcon color="success" /> : <ArrowDownwardIcon color="error" />}
                        <span className="tw-inline-block caption">
                          {value.type === TypeAction.Atk ? 'Attack ' : 'Defense '}
                          <span
                            className={combineClasses('buff-power', value.power > 0 ? 'text-success' : 'text-danger')}
                          >
                            <b>
                              {value.power > 0 && '+'}
                              {value.power}
                            </b>
                          </span>
                        </span>
                      </td>
                      <td className="tw-text-default">{toNumber(value.buffChance) * 100}%</td>
                    </tr>
                  ))}
                </Fragment>
              )}

              <tr className="tw-text-center">
                <td className="table-sub-header" colSpan={3}>
                  Other Stats
                </td>
              </tr>
              <tr>
                <td>Animation Duration</td>
                <td colSpan={2}>{move && `${move.durationMs} ms (${move.durationMs / 1000} sec)`}</td>
              </tr>
              <tr>
                <td>Damage Start Window</td>
                <td colSpan={2}>{move && `${move.damageWindowStartMs} ms (${move.damageWindowStartMs / 1000} sec)`}</td>
              </tr>
              <tr>
                <td>Damage End Window</td>
                <td colSpan={2}>{move && `${move.damageWindowEndMs} ms (${move.damageWindowEndMs / 1000} sec)`}</td>
              </tr>
              <tr>
                <td>Critical Chance</td>
                <td colSpan={2}>{move && `${move.criticalChance * 100}%`}</td>
              </tr>
              <tr className="tw-text-center">
                <td className="table-sub-header" colSpan={3}>
                  Effect
                </td>
              </tr>
              <tr>
                <td>Sound</td>
                <td colSpan={2}>
                  {move?.sound ? (
                    <audio className="tw-flex tw-w-full" controls style={{ height: 30 }}>
                      <source src={APIService.getSoundMove(move.sound)} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <span>Unavailable</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col !tw-p-0">
          <table className="table-info move-damage-table">
            <thead className="tw-text-center">
              <tr>
                <th colSpan={2}>{`Damage ${splitAndCapitalize(move?.name.toLowerCase(), '_', ' ')} Simulator`}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="tw-text-center">
                <td className="table-sub-header" colSpan={2}>
                  PVE Stats
                </td>
              </tr>
              <tr>
                <td>DPS</td>
                <td>{move && `${toFloatWithPadding(move.pvePower / (move.durationMs / 1000), 2)}`}</td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(Weather / STAB / Shadow Bonus)</span>
                </td>
                <td>{move && `${toFloatWithPadding((move.pvePower * battleStab()) / (move.durationMs / 1000), 2)}`}</td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(2 Effect Bonus)</span>
                </td>
                <td>
                  {move &&
                    `${toFloatWithPadding((move.pvePower * Math.pow(battleStab(), 2)) / (move.durationMs / 1000), 2)}`}
                </td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(STAB+Weather+Shadow Bonus)</span>
                </td>
                <td>
                  {move &&
                    `${toFloatWithPadding((move.pvePower * Math.pow(battleStab(), 3)) / (move.durationMs / 1000), 2)}`}
                </td>
              </tr>
              {move?.typeMove === TypeMove.Fast && (
                <tr>
                  <td>EPS</td>
                  <td>{move && `${toFloatWithPadding(move.pveEnergy / (move.durationMs / 1000), 2)}`}</td>
                </tr>
              )}
              <tr className="tw-text-center">
                <td className="table-sub-header" colSpan={2}>
                  PVP Stats
                </td>
              </tr>
              <tr>
                <td>DPS</td>
                <td>{move && `${toFloatWithPadding(move.pvpPower / (move.durationMs / 1000), 2)}`}</td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(STAB / Shadow Bonus)</span>
                </td>
                <td>{move && `${toFloatWithPadding((move.pvpPower * battleStab()) / (move.durationMs / 1000), 2)}`}</td>
              </tr>
              {move?.bonus && (
                <tr>
                  <td className="table-sub-header !tw-p-0" colSpan={2}>
                    <AccordionMui
                      defaultValue={0}
                      items={[
                        {
                          value: 0,
                          noPadding: true,
                          label: 'Bonus Combat',
                          children: (
                            <table>
                              <tbody>
                                <tr>
                                  <td>Bonus Type</td>
                                  <td colSpan={2}>
                                    {splitAndCapitalize(
                                      getKeyWithData(BonusType, move.bonus.bonusType),
                                      /(?=[A-Z])/,
                                      ' '
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Duration</td>
                                  <td colSpan={2}>{`${move.bonus.durationMs} ms (${
                                    move.bonus.durationMs / 1000
                                  } sec)`}</td>
                                </tr>
                                <tr>
                                  <td>Extra Duration</td>
                                  <td colSpan={2}>{`${move.bonus.extraDurationMs} ms (${
                                    move.bonus.extraDurationMs / 1000
                                  } sec)`}</td>
                                </tr>
                                <tr>
                                  <td>Multi Use</td>
                                  <td colSpan={2}>
                                    {move.bonus.enableMultiUse ? (
                                      <DoneIcon color="success" />
                                    ) : (
                                      <CloseIcon color="error" />
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td>None Combat</td>
                                  <td colSpan={2}>
                                    {move.bonus.enableNonCombatMove ? (
                                      <DoneIcon color="success" />
                                    ) : (
                                      <CloseIcon color="error" />
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Cost</td>
                                  <td className="table-bonus-cost">
                                    <Candy id={0} /> {move.bonus.cost.candyCost}
                                  </td>
                                  <td className="table-bonus-cost">
                                    <div className="tw-inline-flex tw-justify-center" style={{ width: 20 }}>
                                      <img
                                        alt="Image Stardust"
                                        height={20}
                                        src={APIService.getItemSprite('stardust_painted')}
                                      />
                                    </div>
                                    {move.bonus.cost.stardustCost}
                                  </td>
                                </tr>
                                {safeObjectEntries<BonusEffectType>(move.bonus.bonusEffect).map(([k, v], i) => (
                                  <Fragment key={i}>
                                    <tr>
                                      <td colSpan={3} className="tw-text-center">
                                        {`Bonus Effect (${splitAndCapitalize(k, /(?=[A-Z])/, ' ')})`}
                                      </td>
                                    </tr>
                                    {safeObjectEntries<number | string[] | string>(v).map(([key, value], j) => (
                                      <Fragment key={j}>
                                        {move?.bonus?.bonusEffect?.attackDefenseBonus ? (
                                          move?.bonus?.bonusEffect?.attackDefenseBonus.attributes.map((attr, k) => (
                                            <tr key={k}>
                                              <td>
                                                {splitAndCapitalize(key, /(?=[A-Z])/, ' ')}
                                                <span className="caption">
                                                  (
                                                  {attr.combatTypes
                                                    .map((type) => capitalize(type.replace('COMBAT_TYPE_', '')))
                                                    .join(', ')}
                                                  )
                                                </span>
                                              </td>
                                              <td colSpan={2} key={j}>
                                                {renderBonus(move.bonus?.bonusType, `x${attr.attackMultiplier}`)}
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr key={j}>
                                            <td>{splitAndCapitalize(key, /(?=[A-Z])/, ' ')}</td>
                                            <td colSpan={2} key={j}>
                                              {renderBonus(move.bonus?.bonusType, value)}
                                            </td>
                                          </tr>
                                        )}
                                      </Fragment>
                                    ))}
                                  </Fragment>
                                ))}
                              </tbody>
                            </table>
                          ),
                        },
                      ]}
                    />
                  </td>
                </tr>
              )}
              <tr className="tw-text-center">
                <td className="table-sub-header" colSpan={2}>
                  <div className="input-group tw-items-center tw-justify-center">
                    <span>{`Top Pokémon in move ${splitAndCapitalize(move?.name.toLowerCase(), '_', ' ')}`}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="table-top-of-move !tw-p-0" colSpan={2}>
                  <CustomDataTable
                    className="table-top-of-move-container"
                    customColumns={columns}
                    data={topListFilter}
                    pagination
                    defaultSortFieldId={ColumnType.DPS}
                    defaultSortAsc={false}
                    highlightOnHover
                    striped
                    fixedHeader
                    fixedHeaderScrollHeight="35vh"
                    progressPending={!progress}
                    progressComponent={<CircularProgressTable />}
                    isShowSearch
                    isAutoSearch
                    inputPlaceholder="Search Pokémon Name or ID"
                    menuItems={menuItems}
                    searchFunction={(pokemon, search) =>
                      isInclude(
                        splitAndCapitalize(pokemon.name, '-', ' '),
                        search,
                        IncludeMode.IncludeIgnoreCaseSensitive
                      ) || (isMatch ? isEqual(pokemon.num, search) : isInclude(pokemon.num, search))
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Move;
