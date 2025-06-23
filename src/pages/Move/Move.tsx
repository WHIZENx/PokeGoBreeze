import { useSnackbar } from 'notistack';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import {
  capitalize,
  checkPokemonGO,
  convertPokemonDataName,
  generateParamForm,
  getItemSpritePath,
  getKeyWithData,
  splitAndCapitalize,
} from '../../utils/utils';
import { Params, STAB_MULTIPLY } from '../../utils/constants';
import { getBarCharge, queryTopMove } from '../../utils/calculate';

import TypeBar from '../../components/Sprites/TypeBar/TypeBar';

import APIService from '../../services/API.service';
import './Move.scss';

import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import CircleIcon from '@mui/icons-material/Circle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FormControlLabel, Checkbox } from '@mui/material';
import { useSelector } from 'react-redux';
import { Accordion, Form } from 'react-bootstrap';
import { BuffType, ColumnType, MoveType, TypeAction, TypeMove, VariantType } from '../../enums/type.enum';
import { StoreState } from '../../store/models/state.model';
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
  toFloat,
  toFloatWithPadding,
  toNumber,
} from '../../utils/extension';
import { EqualMode, IncludeMode } from '../../utils/enums/string.enum';
import { PokemonTypeBadge } from '../../core/models/type.model';
import { LinkToTop } from '../../utils/hooks/LinkToTop';
import { BonusType } from '../../core/enums/bonus-type.enum';
import Candy from '../../components/Sprites/Candy/Candy';
import CircularProgressTable from '../../components/Sprites/CircularProgress/CircularProgress';
import CustomDataTable from '../../components/Table/CustomDataTable/CustomDataTable';
import { IMenuItem } from '../../components/models/component.model';
import { useTitle } from '../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../utils/models/hook.model';

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

const columns: TableColumnModify<IPokemonTopMove>[] = [
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
          className="me-2"
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
  },
];

const Move = (props: IMovePage) => {
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [move, setMove] = useState<ICombat>();
  const [releasedGO, setReleaseGO] = useState(true);
  const [isMatch, setIsMatch] = useState(false);
  const [topList, setTopList] = useState<IPokemonTopMove[]>([]);
  const [topListFilter, setTopListFilter] = useState<IPokemonTopMove[]>([]);
  const [moveType, setMoveType] = useState<string>();
  const [progress, setProgress] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const menuItems: IMenuItem[] = [
    {
      label: (
        <FormControlLabel
          control={<Checkbox checked={releasedGO} onChange={(_, check) => setReleaseGO(check)} />}
          label={
            <span className="d-flex align-items-center">
              Released in GO
              <img
                className={combineClasses('ms-1', releasedGO ? '' : 'filter-gray')}
                width={28}
                height={28}
                alt="Pokémon GO Icon"
                src={APIService.getPokemonGoIcon(icon)}
              />
            </span>
          }
        />
      ),
    },
    {
      label: (
        <FormControlLabel
          control={<Checkbox checked={isMatch} onChange={(_, check) => setIsMatch(check)} />}
          label="Match Pokémon"
        />
      ),
    },
  ];

  const getWeatherEffective = (type: string | undefined) => {
    const result = Object.entries(data.weatherBoost)?.find(([, value]: [string, string[]]) => {
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
      if (isNotEmpty(data.combats)) {
        const moves = data.combats.filter((item) => item.track === id || item.id === id);
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
          setMoveType(type.toUpperCase());
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
          enqueueSnackbar(`Move ID: ${id} Not found!`, { variant: VariantType.Error });
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
    [enqueueSnackbar, data.combats]
  );

  const getMoveIdByParam = () => {
    let id = toNumber(params.id ? params.id.toLowerCase() : props.id);
    if (id === 0 && params.id && isNotEmpty(params.id) && isNotEmpty(data.combats)) {
      const move = data.combats.find((m) =>
        isEqual(m.name.replaceAll('_', '-'), params.id, EqualMode.IgnoreCaseSensitive)
      );
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
  }, [params.id, props.id, queryMoveData, move, data.combats]);

  useEffect(() => {
    if (move && isNotEmpty(data.pokemons)) {
      const result = queryTopMove(data.pokemons, data.typeEff, data.weatherBoost, move);
      setTopList(result);
      setProgress(true);
    }
  }, [move, data.pokemons, data.typeEff, data.weatherBoost]);

  useEffect(() => {
    setTopListFilter(
      topList.filter((pokemon) => {
        if (!releasedGO) {
          return true;
        }
        if (!pokemon.releasedGO) {
          return checkPokemonGO(
            pokemon.num,
            convertPokemonDataName(pokemon.sprite, pokemon.name.replaceAll(' ', '_')),
            data.pokemons
          );
        }
        return pokemon.releasedGO;
      })
    );
  }, [topList, releasedGO]);

  useEffect(() => {
    const type = searchParams.get(Params.MoveType);
    if (isNotEmpty(data.combats) && move?.isMultipleWithType && type) {
      searchParams.set(Params.MoveType, type.toLowerCase());
      setSearchParams(searchParams);
      setMove(
        data.combats.find(
          (item) => item.track === move.track && isEqual(item.type, type, EqualMode.IgnoreCaseSensitive)
        )
      );
      setMoveType(type.toUpperCase());
    }
  }, [move?.isMultipleWithType, searchParams, data.combats]);

  const renderReward = (itemName: string) => (
    <div className="d-flex align-items-center flex-column">
      <div style={{ width: 35 }}>
        <img alt="Icon Item" className="sprite-type" src={getItemSpritePath(itemName)} />
      </div>
      <span className="caption">{splitAndCapitalize(itemName.replace('ITEM_', ''), '_', ' ')}</span>
    </div>
  );

  return (
    <div className={combineClasses('pb-3 poke-container', props.id ? '' : 'container')}>
      {move ? (
        <>
          <div className="h-100 head-box d-flex flex-wrap align-items-center">
            <h1 className="text-move">
              <b>{splitAndCapitalize(move.name.toLowerCase(), '_', ' ')}</b>
            </h1>
            <TypeBar type={move.type} />
          </div>
          {move.isMultipleWithType && (
            <Form.Select
              style={{ maxWidth: 250 }}
              className="mt-2 w-50"
              onChange={(e) => {
                searchParams.set(Params.MoveType, e.target.value.toLowerCase());
                setSearchParams(searchParams);
              }}
              value={moveType}
            >
              {Object.keys(data.typeEff)
                .filter(
                  (type) =>
                    !isEqual(
                      type,
                      getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Fairy),
                      EqualMode.IgnoreCaseSensitive
                    )
                )
                .map((value, index) => (
                  <option key={index} value={value}>
                    {capitalize(value)}
                  </option>
                ))}
            </Form.Select>
          )}
        </>
      ) : (
        <div className="ph-item">
          <div className="ph-row h-100 head-box d-flex mb-0 ps-0">
            <div className="ph-picture w-pct-40" style={{ height: 45 }} />
          </div>
        </div>
      )}
      <hr />
      <div className="row m-0">
        <div className="col p-0">
          <table className="table-info move-table">
            <thead className="text-center">
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
                    <div className={combineClasses('type-icon-small w-fit-content', move.type?.toLowerCase())}>
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
                    <>
                      <img
                        className="img-type-icon me-3"
                        height={25}
                        alt="Image Weather"
                        src={APIService.getWeatherIconSprite(getWeatherEffective(move.type))}
                      />
                      <span className="d-inline-block caption">
                        {splitAndCapitalize(getWeatherEffective(move.type), '_', ' ')}
                      </span>
                    </>
                  )}
                </td>
              </tr>
              <tr className="text-center">
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
                    <>
                      <span>{toFloatWithPadding(move.pvePower * STAB_MULTIPLY(data.options), 2)}</span>
                      <span className="text-success d-inline-block caption">
                        {' +'}
                        {toFloatWithPadding(move.pvePower * 0.2, 2)}
                      </span>
                    </>
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
              <tr className="text-center">
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
                    <>
                      <span>{toFloatWithPadding(move.pvpPower * STAB_MULTIPLY(data.options), 2)}</span>
                      <span className="text-success d-inline-block caption">
                        {' +'}
                        {toFloatWithPadding(move.pvpPower * 0.2, 2)}
                      </span>
                    </>
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
                  <tr className="text-center">
                    <td className="table-sub-header" colSpan={3}>
                      PVP Buffs
                    </td>
                  </tr>
                  {move?.buffs.map((value, index) => (
                    <tr key={index}>
                      <td className="target-buff">
                        <CircleIcon sx={{ fontSize: '5px' }} /> {getKeyWithData(BuffType, value.target)}
                      </td>
                      <td>
                        {value.power > 0 ? (
                          <ArrowUpwardIcon sx={{ color: 'green' }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ color: 'red' }} />
                        )}
                        <span className="d-inline-block caption">
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
                      <td className="theme-text-primary">{toNumber(value.buffChance) * 100}%</td>
                    </tr>
                  ))}
                </Fragment>
              )}

              <tr className="text-center">
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
              <tr className="text-center">
                <td className="table-sub-header" colSpan={3}>
                  Effect
                </td>
              </tr>
              <tr>
                <td>Sound</td>
                <td colSpan={2}>
                  {move?.sound ? (
                    <audio className="d-flex w-100" controls style={{ height: 30 }}>
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
        <div className="col p-0">
          <table className="table-info move-damage-table">
            <thead className="text-center">
              <tr>
                <th colSpan={2}>{`Damage ${splitAndCapitalize(move?.name.toLowerCase(), '_', ' ')} Simulator`}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center">
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
                <td>
                  {move &&
                    `${toFloatWithPadding(
                      (move.pvePower * STAB_MULTIPLY(data.options)) / (move.durationMs / 1000),
                      2
                    )}`}
                </td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(2 Effect Bonus)</span>
                </td>
                <td>
                  {move &&
                    `${toFloatWithPadding(
                      (move.pvePower * Math.pow(STAB_MULTIPLY(data.options), 2)) / (move.durationMs / 1000),
                      2
                    )}`}
                </td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(STAB+Weather+Shadow Bonus)</span>
                </td>
                <td>
                  {move &&
                    `${toFloatWithPadding(
                      (move.pvePower * Math.pow(STAB_MULTIPLY(data.options), 3)) / (move.durationMs / 1000),
                      2
                    )}`}
                </td>
              </tr>
              {move?.typeMove === TypeMove.Fast && (
                <tr>
                  <td>EPS</td>
                  <td>{move && `${toFloatWithPadding(move.pveEnergy / (move.durationMs / 1000), 2)}`}</td>
                </tr>
              )}
              <tr className="text-center">
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
                <td>
                  {move &&
                    `${toFloatWithPadding(
                      (move.pvpPower * STAB_MULTIPLY(data.options)) / (move.durationMs / 1000),
                      2
                    )}`}
                </td>
              </tr>
              {move?.bonus && (
                <tr>
                  <td className="table-sub-header p-0" colSpan={2}>
                    <Accordion defaultActiveKey="0">
                      <Accordion.Item key={0} eventKey="0" className="table-sub-bonus">
                        <Accordion.Header className="table-sub-bonus">
                          <span>Bonus Combat</span>
                        </Accordion.Header>
                        <Accordion.Body>
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
                                    <DoneIcon sx={{ color: 'green' }} />
                                  ) : (
                                    <CloseIcon sx={{ color: 'red' }} />
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td>None Combat</td>
                                <td colSpan={2}>
                                  {move.bonus.enableNonCombatMove ? (
                                    <DoneIcon sx={{ color: 'green' }} />
                                  ) : (
                                    <CloseIcon sx={{ color: 'red' }} />
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td>Cost</td>
                                <td className="table-bonus-cost">
                                  <Candy id={0} /> {move.bonus.cost.candyCost}
                                </td>
                                <td className="table-bonus-cost">
                                  <div className="d-inline-flex justify-content-center" style={{ width: 20 }}>
                                    <img
                                      alt="Image Stardust"
                                      height={20}
                                      src={APIService.getItemSprite('stardust_painted')}
                                    />
                                  </div>
                                  {move.bonus.cost.stardustCost}
                                </td>
                              </tr>
                              {Object.entries(move.bonus.bonusEffect).map(([k, v]: [string, BonusEffectType], i) => (
                                <Fragment key={i}>
                                  <tr>
                                    <td colSpan={3} className="text-center">
                                      {`Bonus Effect (${splitAndCapitalize(k, /(?=[A-Z])/, ' ')})`}
                                    </td>
                                  </tr>
                                  {Object.entries(v).map(([key, value], j) => (
                                    <tr key={j}>
                                      <td>{splitAndCapitalize(key, /(?=[A-Z])/, ' ')}</td>
                                      <td colSpan={2} key={j}>
                                        {isEqual(move.bonus?.bonusType, BonusType.SpaceBonus) ||
                                        isEqual(move.bonus?.bonusType, BonusType.SlowFreezeBonus) ? (
                                          value
                                        ) : isEqual(move.bonus?.bonusType, BonusType.TimeBonus) ? (
                                          <div className="d-flex flex-wrap gap-2">
                                            {getValueOrDefault<string[]>(Array, value).map((item) =>
                                              renderReward(item)
                                            )}
                                          </div>
                                        ) : (
                                          renderReward(value)
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </Fragment>
                              ))}
                            </tbody>
                          </table>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </td>
                </tr>
              )}
              <tr className="text-center">
                <td className="table-sub-header" colSpan={2}>
                  <div className="input-group align-items-center justify-content-center">
                    <span>{`Top Pokémon in move ${splitAndCapitalize(move?.name.toLowerCase(), '_', ' ')}`}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="table-top-of-move p-0" colSpan={2}>
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
