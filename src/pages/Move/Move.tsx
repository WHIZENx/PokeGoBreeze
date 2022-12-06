import { useSnackbar } from 'notistack';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { capitalize, convertName, splitAndCapitalize } from '../../util/Utils';
import { STAB_MULTIPLY } from '../../util/Constants';
import { getBarCharge, queryTopMove } from '../../util/Calculate';

import TypeBar from '../../components/Sprites/TypeBar/TypeBar';

import APIService from '../../services/API.service';
import './Move.css';

import CircleIcon from '@mui/icons-material/Circle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FormControlLabel, Switch } from '@mui/material';
import { RootStateOrAny, useSelector } from 'react-redux';
import { Form } from 'react-bootstrap';

const nameSort = (rowA: { name: string }, rowB: { name: string }) => {
  const a = rowA.name.toLowerCase();
  const b = rowB.name.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const columns: any = [
  {
    name: 'id',
    selector: (row: { num: any }) => row.num,
    sortable: true,
    minWidth: '40px',
  },
  {
    name: 'Name',
    selector: (row: {
      num: any;
      forme: string;
      sprite: string;
      baseSpecies: string;
      name:
        | string
        | number
        | boolean
        | React.ReactElement<any, string | React.JSXElementConstructor<any>>
        | React.ReactFragment
        | React.ReactPortal
        | null
        | undefined;
    }) => (
      <Link to={`/pokemon/${row.num}${row.forme ? `?form=${row.forme.toLowerCase()}` : ''}`} target="_blank">
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.sprite, true)}
          onError={(e: any) => {
            e.onerror = null;
            e.target.src = APIService.getPokeIconSprite(row.baseSpecies);
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
    name: 'DPS',
    selector: (row: { dps: number }) => parseFloat(row.dps.toFixed(2)),
    sortable: true,
    minWidth: '90px',
  },
  {
    name: 'TDO',
    selector: (row: { tdo: number }) => parseFloat(row.tdo.toFixed(2)),
    sortable: true,
    minWidth: '90px',
  },
];

const Move = (props: { id?: any }) => {
  const icon = useSelector((state: RootStateOrAny) => state.store.icon);
  const data = useSelector((state: RootStateOrAny) => state.store.data);
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [move, setMove]: any = useState(null);
  const [releasedGO, setReleaseGO] = useState(true);
  const [topList, setTopList]: any = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const getWeatherEffective = (type: string) => {
    const result = Object.entries(data.weatherBoost).find(([, value]: any) => {
      return value.includes(type.toUpperCase());
    });
    return result && result[0];
  };

  const queryMoveData = useCallback(
    (id: any) => {
      let move;
      if (params.id && parseInt(id) === 281) {
        move = data.combat.find(
          (item: { type: string; track: number }) =>
            item.track === parseInt(id) && item.type === (searchParams.get('type') ? searchParams.get('type')?.toUpperCase() : 'NORMAL')
        );
      } else {
        move = data.combat.find((item: { track: number }) => item.track === parseInt(id));
      }
      if (move) {
        setMove(move);
        document.title = `#${move.track} - ${splitAndCapitalize(move.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}`;
      } else {
        enqueueSnackbar('Move ID: ' + id + ' Not found!', { variant: 'error' });
        if (params.id) {
          document.title = `#${params.id} - Not Found`;
        }
      }
    },
    [enqueueSnackbar, params.id, data.combat]
  );

  useEffect(() => {
    if (move === null) {
      const id = params.id ? params.id.toLowerCase() : props.id;
      queryMoveData(id);
    } else {
      setTopList(queryTopMove(data.options, data.typeEff, data.weatherBoost, data.pokemonCombat, move));
    }
  }, [data, params.id, props.id, queryMoveData, move]);

  return (
    <Fragment>
      {move && (
        <div className={'element-bottom poke-container' + (props.id ? '' : ' container')}>
          <div className="h-100 head-box d-flex flex-wrap align-items-center">
            <h1 className="text-move">
              <b>{splitAndCapitalize(move.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}</b>
            </h1>
            <TypeBar type={move.type} />
          </div>
          {move.track === 281 && (
            <Form.Select
              style={{ maxWidth: 250 }}
              className="element-top w-50"
              onChange={(e: any) => {
                searchParams.set('type', e.target.value.toLowerCase());
                setSearchParams(searchParams);
                setMove(
                  data.combat.find(
                    (item: { type: string; track: number }) => item.track === move.track && item.type === e.target.value.toUpperCase()
                  )
                );
              }}
              defaultValue={searchParams.get('type') ? searchParams.get('type')?.toUpperCase() : 'NORMAL'}
            >
              {Object.keys(data.typeEff)
                .filter((type) => type !== 'FAIRY')
                .map((value: string, index: React.Key | number) => (
                  <option key={index} value={value}>
                    {capitalize(value)}
                  </option>
                ))}
            </Form.Select>
          )}
          <hr />
          <div className="row" style={{ margin: 0 }}>
            <div className="col" style={{ padding: 0 }}>
              <table className="table-info move-table">
                <thead className="text-center">
                  <tr>
                    <th colSpan={3}>
                      {'Stats ' + splitAndCapitalize(move.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+') + ' in Pokémon Go'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ID</td>
                    <td colSpan={2}>
                      <b>#{move.track}</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Name</td>
                    <td colSpan={2}>
                      <b>{splitAndCapitalize(move.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Type</td>
                    <td colSpan={2}>
                      <div style={{ width: 'fit-content' }} className={'type-icon-small ' + move.type.toLowerCase()}>
                        {capitalize(move.type)}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Move Type</td>
                    <td colSpan={2}>
                      <b>{capitalize(move.type_move)} Move</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Weather Boosts</td>
                    <td colSpan={2}>
                      <img
                        style={{ marginRight: 15 }}
                        className="img-type-icon"
                        height={25}
                        alt="img-type"
                        src={APIService.getWeatherIconSprite(getWeatherEffective(move.type))}
                      />
                      <span className="d-inline-block caption">{splitAndCapitalize(getWeatherEffective(move.type) as any, '_', ' ')}</span>
                    </td>
                  </tr>
                  <tr className="text-center">
                    <td className="table-sub-header" colSpan={3}>
                      PVE Stats
                    </td>
                  </tr>
                  <tr>
                    <td>PVE Power</td>
                    <td colSpan={2}>{move.pve_power}</td>
                  </tr>
                  <tr>
                    <td>
                      PVE Power
                      <span className="caption">(Weather / STAB / Shadow Bonus)</span>
                    </td>
                    <td colSpan={2}>
                      {(move.pve_power * STAB_MULTIPLY(data.options)).toFixed(2)}{' '}
                      <span className="text-success d-inline-block caption">+{(move.pve_power * 0.2).toFixed(2)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>PVE Energy</td>
                    <td colSpan={2}>
                      {move.pve_energy > 0 && '+'}
                      {move.pve_energy}
                    </td>
                  </tr>
                  {move.type_move === 'CHARGE' && (
                    <tr>
                      <td>PVE Bar Charged</td>
                      <td colSpan={2} style={{ border: 'none' }}>
                        {[...Array(getBarCharge(true, move.pve_energy)).keys()].map((value, index) => (
                          <div
                            style={{
                              width: (120 - 5 * Math.max(1, getBarCharge(true, move.pve_energy))) / getBarCharge(true, move.pve_energy),
                            }}
                            key={index}
                            className={'d-inline-block bar-charge ' + move.type.toLowerCase()}
                          />
                        ))}
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
                    <td colSpan={2}>{move.pvp_power}</td>
                  </tr>
                  <tr>
                    <td>
                      PVP Power
                      <span className="caption">(STAB / Shadow Bonus)</span>
                    </td>
                    <td colSpan={2}>
                      {(move.pvp_power * STAB_MULTIPLY(data.options)).toFixed(2)}{' '}
                      <span className="text-success d-inline-block caption">+{(move.pvp_power * 0.2).toFixed(2)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>PVP Energy</td>
                    <td colSpan={2}>
                      {move.pvp_energy > 0 && '+'}
                      {move.pvp_energy}
                    </td>
                  </tr>
                  {move.type_move === 'CHARGE' && (
                    <tr>
                      <td>PVP Bar Charged</td>
                      <td colSpan={2} style={{ border: 'none' }}>
                        {[...Array(getBarCharge(false, move.pvp_energy)).keys()].map((value, index) => (
                          <div
                            style={{
                              width: (120 - 5 * Math.max(1, getBarCharge(false, move.pvp_energy))) / getBarCharge(false, move.pvp_energy),
                            }}
                            key={index}
                            className={'d-inline-block bar-charge ' + move.type.toLowerCase()}
                          />
                        ))}
                      </td>
                    </tr>
                  )}
                  {move.buffs.length > 0 && (
                    <Fragment>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={3}>
                          PVP Buffs
                        </td>
                      </tr>
                      {move.buffs.map(
                        (
                          value: {
                            target: string;
                            power: number;
                            type: string;
                            buffChance: number;
                          },
                          index: React.Key
                        ) => (
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
                            <td>{value.buffChance * 100}%</td>
                          </tr>
                        )
                      )}
                    </Fragment>
                  )}

                  <tr className="text-center">
                    <td className="table-sub-header" colSpan={3}>
                      Other Stats
                    </td>
                  </tr>
                  <tr>
                    <td>Animation Duration</td>
                    <td colSpan={2}>
                      {move.durationMs} ms ({move.durationMs / 1000} sec)
                    </td>
                  </tr>
                  <tr>
                    <td>Damage Start Window</td>
                    <td colSpan={2}>
                      {move.damageWindowStartMs} ms ({move.damageWindowStartMs / 1000} sec)
                    </td>
                  </tr>
                  <tr>
                    <td>Damage End Window</td>
                    <td colSpan={2}>
                      {move.damageWindowEndMs} ms ({move.damageWindowEndMs / 1000} sec)
                    </td>
                  </tr>
                  <tr>
                    <td>Critical Chance</td>
                    <td colSpan={2}>{move.criticalChance * 100}%</td>
                  </tr>
                  <tr className="text-center">
                    <td className="table-sub-header" colSpan={3}>
                      Effect
                    </td>
                  </tr>
                  <tr>
                    <td>Sound</td>
                    <td colSpan={2}>
                      <audio className="d-flex w-100" controls={true} style={{ height: 30 }}>
                        <source src={APIService.getSoundMove(move.sound)} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
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
                      {'Damage ' + splitAndCapitalize(move.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+') + ' Simulator'}
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
                    <td>{(move.pve_power / (move.durationMs / 1000)).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>
                      DPS
                      <span className="caption">(Weather / STAB / Shadow Bonus)</span>
                    </td>
                    <td>{((move.pve_power * STAB_MULTIPLY(data.options)) / (move.durationMs / 1000)).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>
                      DPS
                      <span className="caption">(2 Effect Bonus)</span>
                    </td>
                    <td>{((move.pve_power * Math.pow(STAB_MULTIPLY(data.options), 2)) / (move.durationMs / 1000)).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>
                      DPS
                      <span className="caption">(STAB+Weather+Shadow Bonus)</span>
                    </td>
                    <td>{((move.pve_power * Math.pow(STAB_MULTIPLY(data.options), 3)) / (move.durationMs / 1000)).toFixed(2)}</td>
                  </tr>
                  {move.type_move === 'FAST' && (
                    <tr>
                      <td>EPS</td>
                      <td>{(move.pve_energy / (move.durationMs / 1000)).toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="text-center">
                    <td className="table-sub-header" colSpan={2}>
                      PVP Stats
                    </td>
                  </tr>
                  <tr>
                    <td>DPS</td>
                    <td>{(move.pvp_power / (move.durationMs / 1000)).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>
                      DPS
                      <span className="caption">(STAB / Shadow Bonus)</span>
                    </td>
                    <td>{((move.pvp_power * STAB_MULTIPLY(data.options)) / (move.durationMs / 1000)).toFixed(2)}</td>
                  </tr>
                  <tr className="text-center">
                    <td className="table-sub-header" colSpan={2}>
                      <div className="input-group align-items-center justify-content-center">
                        <span>
                          {'Top Pokémon in move ' + splitAndCapitalize(move.name.toLowerCase(), '_', ' ').replaceAll(' Plus', '+')}
                        </span>
                        <FormControlLabel
                          control={<Switch checked={releasedGO} onChange={(event, check) => setReleaseGO(check)} />}
                          label={
                            <span className="d-flex align-items-center">
                              Released in GO
                              <img
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
                        data={topList.filter((pokemon: { num: any; name: string }) => {
                          if (!releasedGO) {
                            return true;
                          }
                          const result = data.details.find(
                            (item: { name: string; id: any }) =>
                              item.id === pokemon.num &&
                              item.name ===
                                (item.id === 555 && !pokemon.name.toLowerCase().includes('zen')
                                  ? pokemon.name.toUpperCase().replaceAll(' ', '_').replace('_GALAR', '_GALARIAN') + '_STANDARD'
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
      )}
    </Fragment>
  );
};

export default Move;
