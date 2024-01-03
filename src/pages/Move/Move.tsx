import { useSnackbar } from 'notistack';
import React, { Dispatch, Fragment, SetStateAction, useCallback, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { capitalize, convertFormName, convertName, splitAndCapitalize } from '../../util/Utils';
import { FORM_GALARIAN, FORM_STANDARD, STAB_MULTIPLY } from '../../util/Constants';
import { getBarCharge, queryTopMove } from '../../util/Calculate';

import TypeBar from '../../components/Sprites/TypeBar/TypeBar';

import APIService from '../../services/API.service';
import './Move.scss';

import CircleIcon from '@mui/icons-material/Circle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FormControlLabel, Switch } from '@mui/material';
import { useSelector } from 'react-redux';
import { Form } from 'react-bootstrap';
import { TypeMove } from '../../enums/move.enum';
import { StoreState } from '../../store/models/state.model';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import ChargedBar from '../../components/Sprites/ChargedBar/ChargedBar';
import { Combat } from '../../core/models/combat.model';
import { PokemonTopMove } from '../../util/models/pokemon-top-move.model';

const nameSort = (rowA: { name: string }, rowB: { name: string }) => {
  const a = rowA.name.toLowerCase();
  const b = rowB.name.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const columns: any = [
  {
    name: 'Id',
    selector: (row: PokemonTopMove) => row.num,
    sortable: true,
    minWidth: '40px',
  },
  {
    name: 'Name',
    selector: (row: PokemonTopMove) => (
      <Link to={`/pokemon/${row.num}${row.forme ? `?form=${convertFormName(row.num, row.forme.toLowerCase())}` : ''}`}>
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.sprite, true)}
          onError={(e: any) => {
            e.onerror = null;
            e.target.src = APIService.getPokeIconSprite(row.baseSpecies ?? '');
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
    selector: (row: PokemonTopMove) => (row.isElite ? <DoneIcon sx={{ color: 'green' }} /> : <CloseIcon sx={{ color: 'red' }} />),
    width: '64px',
  },
  {
    name: 'DPS',
    selector: (row: PokemonTopMove) => parseFloat(row.dps.toFixed(2)),
    sortable: true,
    minWidth: '90px',
  },
  {
    name: 'TDO',
    selector: (row: PokemonTopMove) => parseFloat(row.tdo.toFixed(2)),
    sortable: true,
    minWidth: '90px',
  },
];

const Move = (props: { id?: number }) => {
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [move, setMove]: [Combat | undefined, Dispatch<SetStateAction<Combat | undefined>>] = useState();
  const [releasedGO, setReleaseGO] = useState(true);
  const [topList, setTopList]: [PokemonTopMove[], any] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const getWeatherEffective = (type: string) => {
    const result = Object.entries(data?.weatherBoost ?? {})?.find(([, value]: any) => {
      return value.includes(type?.toUpperCase());
    });
    return result && result.at(0);
  };

  const queryMoveData = useCallback(
    (id: string | number | undefined) => {
      if (id && data?.combat) {
        let move;
        if (id && parseInt(id.toString()) === 281) {
          move = data?.combat?.find(
            (item) =>
              item.track === parseInt(id.toString()) &&
              item.type === (searchParams.get('type') ? searchParams.get('type')?.toUpperCase() : 'NORMAL')
          );
        } else {
          move = data?.combat?.find((item) => item.track === parseInt(id.toString()));
        }
        if (move) {
          setMove(move);
          document.title = `#${move?.track} - ${splitAndCapitalize(move?.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}`;
        } else {
          enqueueSnackbar('Move ID: ' + id + ' Not found!', { variant: 'error' });
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
      const id = params.id ? params.id.toLowerCase() : props.id;
      queryMoveData(id);
    }
  }, [params.id, props.id, queryMoveData, move]);

  useEffect(() => {
    if (move && data?.options && data?.released && data?.typeEff && data?.weatherBoost && data?.pokemonCombat) {
      setTopList(queryTopMove(data?.options, data?.released, data?.typeEff, data?.weatherBoost, data?.pokemonCombat, move));
    }
  }, [move, data?.options, data?.released, data?.typeEff, data?.weatherBoost, data?.pokemonCombat]);

  return (
    <div className={'element-bottom poke-container' + (props.id ? '' : ' container')}>
      {move ? (
        <>
          <div className="h-100 head-box d-flex flex-wrap align-items-center">
            <h1 className="text-move">
              <b>{splitAndCapitalize(move?.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}</b>
            </h1>
            <TypeBar type={move?.type} />
          </div>
          {move?.track === 281 && (
            <Form.Select
              style={{ maxWidth: 250 }}
              className="element-top w-50"
              onChange={(e: any) => {
                searchParams.set('type', e.target.value.toLowerCase());
                setSearchParams(searchParams);
                setMove(data?.combat?.find((item) => item.track === move?.track && item.type === e.target.value?.toUpperCase()));
              }}
              defaultValue={searchParams.get('type') ? searchParams.get('type')?.toUpperCase() : 'NORMAL'}
            >
              {Object.keys(data?.typeEff ?? {})
                .filter((type) => type !== 'FAIRY')
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
                <th colSpan={3}>
                  {'Stats ' + splitAndCapitalize(move?.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+') + ' in Pokémon Go'}
                </th>
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
                  <b>{splitAndCapitalize(move?.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}</b>
                </td>
              </tr>
              <tr>
                <td>Type</td>
                <td colSpan={2}>
                  {move && (
                    <div style={{ width: 'fit-content' }} className={'type-icon-small ' + move?.type?.toLowerCase()}>
                      {capitalize(move?.type)}
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td>Move Type</td>
                <td colSpan={2}>
                  <b>{move && `${capitalize(move.type_move)} Move`}</b>
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
                        src={APIService.getWeatherIconSprite(getWeatherEffective(move?.type ?? ''))}
                      />
                      <span className="d-inline-block caption">{splitAndCapitalize(getWeatherEffective(move?.type ?? ''), '_', ' ')}</span>
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
                <td colSpan={2}>{move?.pve_power}</td>
              </tr>
              <tr>
                <td>
                  PVE Power
                  <span className="caption">(Weather / STAB / Shadow Bonus)</span>
                </td>
                <td colSpan={2}>
                  {move && (
                    <>
                      <span>{(move.pve_power * STAB_MULTIPLY(data?.options)).toFixed(2)}</span>{' '}
                      <span className="text-success d-inline-block caption">+{(move.pve_power * 0.2).toFixed(2)}</span>
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td>PVE Energy</td>
                <td colSpan={2}>
                  {(move?.pve_energy ?? 0) > 0 && '+'}
                  {move?.pve_energy}
                </td>
              </tr>
              {move?.type_move === TypeMove.CHARGE && (
                <tr>
                  <td>PVE Bar Charged</td>
                  <td colSpan={2} style={{ border: 'none' }}>
                    <ChargedBar barCount={getBarCharge(true, move?.pve_energy)} color={move?.type?.toLowerCase()} />
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
                <td colSpan={2}>{move?.pvp_power}</td>
              </tr>
              <tr>
                <td>
                  PVP Power
                  <span className="caption">(STAB / Shadow Bonus)</span>
                </td>
                <td colSpan={2}>
                  {move && (
                    <>
                      <span>{(move.pvp_power * STAB_MULTIPLY(data?.options)).toFixed(2)}</span>{' '}
                      <span className="text-success d-inline-block caption">+{(move.pvp_power * 0.2).toFixed(2)}</span>
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td>PVP Energy</td>
                <td colSpan={2}>
                  {(move?.pvp_energy ?? 0) > 0 && '+'}
                  {move?.pvp_energy}
                </td>
              </tr>
              {move?.type_move === TypeMove.CHARGE && (
                <tr>
                  <td>PVP Bar Charged</td>
                  <td colSpan={2} style={{ border: 'none' }}>
                    <ChargedBar barCount={getBarCharge(false, move?.pvp_energy)} color={move?.type?.toLowerCase()} />
                  </td>
                </tr>
              )}
              {(move?.buffs ?? []).length > 0 && (
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
                          {value.type === 'atk' ? 'Attack ' : 'Defense '}
                          <span className={'buff-power ' + (value.power > 0 ? 'text-success' : 'text-danger')}>
                            <b>
                              {value.power > 0 && '+'}
                              {value.power}
                            </b>
                          </span>
                        </span>
                      </td>
                      <td>{(value.buffChance ?? 0) * 100}%</td>
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
                <th colSpan={2}>
                  {'Damage ' + splitAndCapitalize(move?.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+') + ' Simulator'}
                </th>
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
                <td>{move && `${(move?.pve_power / (move?.durationMs / 1000)).toFixed(2)}`}</td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(Weather / STAB / Shadow Bonus)</span>
                </td>
                <td>{move && `${((move?.pve_power * STAB_MULTIPLY(data?.options)) / (move?.durationMs / 1000)).toFixed(2)}`}</td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(2 Effect Bonus)</span>
                </td>
                <td>
                  {move && `${((move?.pve_power * Math.pow(STAB_MULTIPLY(data?.options), 2)) / (move?.durationMs / 1000)).toFixed(2)}`}
                </td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(STAB+Weather+Shadow Bonus)</span>
                </td>
                <td>
                  {move && `${((move?.pve_power * Math.pow(STAB_MULTIPLY(data?.options), 3)) / (move?.durationMs / 1000)).toFixed(2)}`}
                </td>
              </tr>
              {move?.type_move === TypeMove.FAST && (
                <tr>
                  <td>EPS</td>
                  <td>{move && `${(move?.pve_energy / (move?.durationMs / 1000)).toFixed(2)}`}</td>
                </tr>
              )}
              <tr className="text-center">
                <td className="table-sub-header" colSpan={2}>
                  PVP Stats
                </td>
              </tr>
              <tr>
                <td>DPS</td>
                <td>{move && `${(move?.pvp_power / (move?.durationMs / 1000)).toFixed(2)}`}</td>
              </tr>
              <tr>
                <td>
                  DPS
                  <span className="caption">(STAB / Shadow Bonus)</span>
                </td>
                <td>{move && `${((move?.pvp_power * STAB_MULTIPLY(data?.options)) / (move?.durationMs / 1000)).toFixed(2)}`}</td>
              </tr>
              <tr className="text-center">
                <td className="table-sub-header" colSpan={2}>
                  <div className="input-group align-items-center justify-content-center">
                    <span>{'Top Pokémon in move ' + splitAndCapitalize(move?.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}</span>
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
                            src={APIService.getPokemonGoIcon(icon ?? 'Standard')}
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
                    columns={columns}
                    data={topList.filter((pokemon) => {
                      if (!releasedGO) {
                        return true;
                      }
                      const result = data?.details?.find(
                        (item) =>
                          item.id === pokemon.num &&
                          item.name ===
                            (item.id === 555 && !pokemon.name.toLowerCase().includes('zen')
                              ? pokemon.name?.toUpperCase().replaceAll(' ', '_').replace('_GALAR', `_${FORM_GALARIAN}`) +
                                `_${FORM_STANDARD}`
                              : convertName(pokemon.name).replace('NIDORAN_F', 'NIDORAN_FEMALE').replace('NIDORAN_M', 'NIDORAN_MALE'))
                      );
                      return result ? result.releasedGO : false;
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
