import { useSnackbar } from 'notistack';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { capitalize, checkPokemonGO, convertPokemonDataName, splitAndCapitalize } from '../../util/utils';
import { STAB_MULTIPLY } from '../../util/constants';
import { getBarCharge, queryTopMove } from '../../util/calculate';

import TypeBar from '../../components/Sprites/TypeBar/TypeBar';

import APIService from '../../services/API.service';
import './Move.scss';

import CircleIcon from '@mui/icons-material/Circle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FormControlLabel, Switch } from '@mui/material';
import { useSelector } from 'react-redux';
import { Form } from 'react-bootstrap';
import { TypeAction, TypeMove, VariantType } from '../../enums/type.enum';
import { StoreState } from '../../store/models/state.model';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import ChargedBar from '../../components/Sprites/ChargedBar/ChargedBar';
import { ICombat } from '../../core/models/combat.model';
import { IPokemonTopMove } from '../../util/models/pokemon-top-move.model';
import { IMovePage } from '../models/page.model';
import { WeatherBoost } from '../../core/models/weatherBoost.model';
import { TypeEff } from '../../core/models/type-eff.model';
import { TableColumnModify } from '../../util/models/overrides/data-table.model';
import {
  combineClasses,
  convertColumnDataType,
  getValueOrDefault,
  isEqual,
  isIncludeList,
  isNotEmpty,
  toFloat,
  toFloatWithPadding,
  toNumber,
} from '../../util/extension';
import { EqualMode, IncludeMode } from '../../util/enums/string.enum';

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
    name: 'Id',
    selector: (row) => row.num,
    sortable: true,
    minWidth: '40px',
  },
  {
    name: 'Name',
    selector: (row) => (
      <Link to={`/pokemon/${row.num}${row.forme ? `?form=${row.forme.toLowerCase().replaceAll('_', '-')}` : ''}`}>
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.sprite, true)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(getValueOrDefault(String, row.baseSpecies));
          }}
        />
        {row.name}
      </Link>
    ),
    sortable: true,
    minWidth: '250px',
    sortFunction: nameSort,
  },
  {
    name: 'Elite',
    selector: (row) => (row.isElite ? <DoneIcon sx={{ color: 'green' }} /> : <CloseIcon sx={{ color: 'red' }} />),
    width: '64px',
  },
  {
    name: 'DPS',
    selector: (row) => toFloatWithPadding(row.dps, 2),
    sortable: true,
    sortFunction: numSortDps,
    minWidth: '90px',
  },
  {
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
  const [topList, setTopList] = useState<IPokemonTopMove[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const getWeatherEffective = (type: string) => {
    const result = Object.entries(data?.weatherBoost ?? new WeatherBoost())?.find(([, value]: [string, string[]]) => {
      return isIncludeList(value, type, IncludeMode.IncludeIgnoreCaseSensitive);
    });
    return result && result.at(0);
  };

  const queryMoveData = useCallback(
    (id: number) => {
      if (isNotEmpty(data?.combat)) {
        const moves = data?.combat?.filter((item) => item.track === id || item.id === id);
        let move = moves?.find((item) => item.id === id);
        if (move?.isMultipleWithType) {
          searchParams.set('type', getValueOrDefault(String, move.type).toLowerCase());
        } else {
          move = moves?.find((item) => item.track === id);
        }
        // if (id === 281) {
        //   move = data?.combat?.find(
        //     (item) =>
        //       item.track === id &&
        //       isEqual(item.type, getValueOrDefault(String, searchParams.get('type'), 'NORMAL'), EqualMode.IgnoreCaseSensitive)
        //   );
        // } else {
        //   move = data?.combat?.find((item) => item.track === id);
        //   if (!move) {
        //     move = data?.combat?.find((item) => item.id === id);
        //     if (move?.isMultipleWithType) {
        //       searchParams.set('type', getValueOrDefault(String, move.type).toLowerCase());
        //     }
        //   }
        // }
        if (move) {
          setMove(move);
          document.title = `#${move.track} - ${splitAndCapitalize(move.name.toLowerCase(), '_', ' ')}`;
        } else {
          enqueueSnackbar(`Move ID: ${id} Not found!`, { variant: VariantType.Error });
          if (id) {
            document.title = `#${id} - Not Found`;
          }
        }
      }
    },
    [enqueueSnackbar, data?.combat]
  );

  useEffect(() => {
    if (!move) {
      const id = toNumber(params.id ? params.id.toLowerCase() : props.id);
      if (id > 0) {
        queryMoveData(id);
      }
    }
  }, [params.id, props.id, queryMoveData, move]);

  useEffect(() => {
    if (move && data?.options && isNotEmpty(data?.pokemon) && data?.typeEff && data?.weatherBoost) {
      const result = queryTopMove(data?.options, data?.pokemon, data?.typeEff, data?.weatherBoost, move);
      setTopList(result);
    }
  }, [move, data?.options, data?.pokemon, data?.typeEff, data?.weatherBoost]);

  return (
    <div className={combineClasses('element-bottom poke-container', props.id ? '' : 'container')}>
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
              className="element-top w-50"
              onChange={(e) => {
                searchParams.set('type', e.target.value.toLowerCase());
                setSearchParams(searchParams);
                setMove(
                  data?.combat?.find(
                    (item) => item.track === move.track && isEqual(item.type, e.target.value, EqualMode.IgnoreCaseSensitive)
                  )
                );
              }}
              defaultValue={searchParams.get('type') ? searchParams.get('type')?.toUpperCase() : 'NORMAL'}
            >
              {Object.keys(data?.typeEff ?? new TypeEff())
                .filter((type) => !isEqual(type, 'FAIRY', EqualMode.IgnoreCaseSensitive))
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
          <div className="ph-row h-100 head-box d-flex" style={{ marginBottom: 0, paddingLeft: 0 }}>
            <div className="ph-picture" style={{ width: '40%', height: 45 }} />
          </div>
        </div>
      )}
      <hr />
      <div className="row" style={{ margin: 0 }}>
        <div className="col" style={{ padding: 0 }}>
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
                    <div style={{ width: 'fit-content' }} className={combineClasses('type-icon-small', move.type?.toLowerCase())}>
                      {capitalize(move.type)}
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td>Move Type</td>
                <td colSpan={2}>
                  <b>{move && `${capitalize(move.typeMove)} Move`}</b>
                </td>
              </tr>
              <tr>
                <td>Weather Boosts</td>
                <td colSpan={2}>
                  {move && (
                    <>
                      <img
                        style={{ marginRight: 15 }}
                        className="img-type-icon"
                        height={25}
                        alt="img-type"
                        src={APIService.getWeatherIconSprite(getWeatherEffective(getValueOrDefault(String, move.type)))}
                      />
                      <span className="d-inline-block caption">
                        {splitAndCapitalize(getWeatherEffective(getValueOrDefault(String, move.type)), '_', ' ')}
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
                      <span>{toFloatWithPadding(move.pvePower * STAB_MULTIPLY(data?.options), 2)}</span>{' '}
                      <span className="text-success d-inline-block caption">+{toFloatWithPadding(move.pvePower * 0.2, 2)}</span>
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td>PVE Energy</td>
                <td colSpan={2}>
                  {getValueOrDefault(Number, move?.pveEnergy) > 0 && '+'}
                  {move?.pveEnergy}
                </td>
              </tr>
              {move?.typeMove === TypeMove.CHARGE && (
                <tr>
                  <td>PVE Bar Charged</td>
                  <td colSpan={2} style={{ border: 'none' }}>
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
                      <span>{toFloatWithPadding(move.pvpPower * STAB_MULTIPLY(data?.options), 2)}</span>{' '}
                      <span className="text-success d-inline-block caption">+{toFloatWithPadding(move.pvpPower * 0.2, 2)}</span>
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td>PVP Energy</td>
                <td colSpan={2}>
                  {getValueOrDefault(Number, move?.pvpEnergy) > 0 && '+'}
                  {move?.pvpEnergy}
                </td>
              </tr>
              {move?.typeMove === TypeMove.CHARGE && (
                <tr>
                  <td>PVP Bar Charged</td>
                  <td colSpan={2} style={{ border: 'none' }}>
                    <ChargedBar barCount={getBarCharge(move.pvpEnergy)} color={move.type?.toLowerCase()} />
                  </td>
                </tr>
              )}
              {getValueOrDefault(Array, move?.buffs).length > 0 && (
                <Fragment>
                  <tr className="text-center">
                    <td className="table-sub-header" colSpan={3}>
                      PVP Buffs
                    </td>
                  </tr>
                  {move?.buffs.map((value, index) => (
                    <tr key={index}>
                      <td className="target-buff">
                        <CircleIcon sx={{ fontSize: '5px' }} /> {capitalize(value.target)}
                      </td>
                      <td>
                        {value.power > 0 ? <ArrowUpwardIcon sx={{ color: 'green' }} /> : <ArrowDownwardIcon sx={{ color: 'red' }} />}
                        <span className="d-inline-block caption">
                          {value.type === TypeAction.ATK ? 'Attack ' : 'Defense '}
                          <span className={combineClasses('buff-power', value.power > 0 ? 'text-success' : 'text-danger')}>
                            <b>
                              {value.power > 0 && '+'}
                              {value.power}
                            </b>
                          </span>
                        </span>
                      </td>
                      <td>{getValueOrDefault(Number, value.buffChance) * 100}%</td>
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
                  {move?.sound && (
                    <audio className="d-flex w-100" controls={true} style={{ height: 30 }}>
                      <source src={APIService.getSoundMove(move.sound)} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col" style={{ padding: 0 }}>
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
                <td>{move && `${toFloatWithPadding((move.pvePower * STAB_MULTIPLY(data?.options)) / (move.durationMs / 1000), 2)}`}</td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(2 Effect Bonus)</span>
                </td>
                <td>
                  {move &&
                    `${toFloatWithPadding((move.pvePower * Math.pow(STAB_MULTIPLY(data?.options), 2)) / (move.durationMs / 1000), 2)}`}
                </td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(STAB+Weather+Shadow Bonus)</span>
                </td>
                <td>
                  {move &&
                    `${toFloatWithPadding((move.pvePower * Math.pow(STAB_MULTIPLY(data?.options), 3)) / (move.durationMs / 1000), 2)}`}
                </td>
              </tr>
              {move?.typeMove === TypeMove.FAST && (
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
                <td>{move && `${toFloatWithPadding((move.pvpPower * STAB_MULTIPLY(data?.options)) / (move.durationMs / 1000), 2)}`}</td>
              </tr>
              <tr className="text-center">
                <td className="table-sub-header" colSpan={2}>
                  <div className="input-group align-items-center justify-content-center">
                    <span>{`Top Pokémon in move ${splitAndCapitalize(move?.name.toLowerCase(), '_', ' ')}`}</span>
                    <FormControlLabel
                      control={<Switch checked={releasedGO} onChange={(_, check) => setReleaseGO(check)} />}
                      label={
                        <span className="d-flex align-items-center">
                          Released in GO
                          <img
                            className={releasedGO ? '' : 'filter-gray'}
                            width={28}
                            height={28}
                            style={{ marginLeft: 5 }}
                            alt="pokemon-go-icon"
                            src={APIService.getPokemonGoIcon(icon)}
                          />
                        </span>
                      }
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="table-top-of-move" colSpan={2} style={{ padding: 0 }}>
                  <DataTable
                    columns={convertColumnDataType(columns)}
                    data={topList.filter((pokemon) => {
                      if (!releasedGO) {
                        return true;
                      }
                      const result = checkPokemonGO(
                        pokemon.num,
                        convertPokemonDataName(pokemon.sprite ?? pokemon.name.replaceAll(' ', '_')),
                        getValueOrDefault(Array, data?.pokemon)
                      );
                      return getValueOrDefault(Boolean, pokemon.releasedGO, result?.releasedGO);
                    })}
                    pagination={true}
                    defaultSortFieldId={4}
                    defaultSortAsc={false}
                    highlightOnHover={true}
                    striped={true}
                    fixedHeader={true}
                    fixedHeaderScrollHeight="35vh"
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
