import React, { Fragment, useRef, useState } from 'react';
import Find from '../../../components/Find/Find';

import { Tabs, Tab } from 'react-bootstrap';

import './CalculatePoint.scss';
import Move from '../../../components/Table/Move';
import { Badge, Checkbox, FormControlLabel } from '@mui/material';
import { capitalize, marks, PokeGoSlider, splitAndCapitalize } from '../../../util/Utils';
import { findStabType } from '../../../util/Compute';
import { MAX_IV, MAX_LEVEL, MIN_IV, MIN_LEVEL } from '../../../util/Constants';
import { calculateDamagePVE, calculateStatsBattle, getTypeEffective } from '../../../util/Calculate';
import { useSnackbar } from 'notistack';

import atk_logo from '../../../assets/attack.png';
import def_logo from '../../../assets/defense.png';
import APIService from '../../../services/API.service';
import { useSelector } from 'react-redux';
import { TypeMove } from '../../../enums/move.enum';
import { SearchingState, StoreState } from '../../../store/models/state.model';
import { PokemonFormModify } from '../../../core/models/API/form.model';
import { Combat } from '../../../core/models/combat.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';

class ColorTone {
  number!: number;
  color!: string;

  constructor(num: number, color: string) {
    this.number = num;
    this.color = color;
  }
}

interface BreakPointAtk {
  data: number[][];
  colorTone: { [x: string]: ColorTone };
}

interface BreakPointDef {
  dataDef: number[][];
  dataSta: number[][];
  colorToneDef: { [x: string]: ColorTone };
  colorToneSta: { [x: string]: ColorTone };
}

interface BulkPointDef {
  data: number[][];
  maxLength: number;
}

const CalculatePoint = () => {
  useChangeTitle('Calculate Point Stats - Tools');
  const globalOptions = useSelector((state: StoreState) => state.store?.data?.options);
  const typeEff = useSelector((state: StoreState) => state.store?.data?.typeEff ?? {});
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);

  const [id, setId] = useState(searching ? searching.id : 1);
  const [name, setName] = useState(splitAndCapitalize(searching?.fullName, '-', ' '));
  const [form, setForm]: [PokemonFormModify | undefined, React.Dispatch<React.SetStateAction<PokemonFormModify | undefined>>] = useState();
  const [move, setMove]: [Combat | undefined, React.Dispatch<React.SetStateAction<Combat | undefined>>] = useState();

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [DEFIv, setDEFIv] = useState(0);
  const [STAIv, setSTAIv] = useState(0);

  const [weatherBoosts, setWeatherBoosts] = useState(false);
  const [pvpDmg, setPvpDmg] = useState(false);

  const [statDefATK, setStatDefATK] = useState(0);
  const [statDefDEF, setStatDefDEF] = useState(0);

  const initialize = useRef(false);

  const [isRaid, setIsRaid] = useState(true);
  const [tier, setTier] = useState(1);

  const [idDef, setIdDef] = useState(searching?.obj ? searching.obj.id : 1);
  const [nameDef, setNameDef] = useState(splitAndCapitalize(searching?.obj?.fullName, '-', ' '));
  const [formDef, setFormDef]: [PokemonFormModify | undefined, React.Dispatch<React.SetStateAction<PokemonFormModify | undefined>>] =
    useState();
  const [moveDef, setMoveDef]: [Combat | undefined, React.Dispatch<React.SetStateAction<Combat | undefined>>] = useState();

  const [fMove, setFMove]: [Combat | undefined, React.Dispatch<React.SetStateAction<Combat | undefined>>] = useState();
  const [cMove, setCMove]: [Combat | undefined, React.Dispatch<React.SetStateAction<Combat | undefined>>] = useState();

  const [resultBreakPointAtk, setResultBreakPointAtk]: [
    BreakPointAtk | undefined,
    React.Dispatch<React.SetStateAction<BreakPointAtk | undefined>>
  ] = useState();
  const [resultBreakPointDef, setResultBreakPointDef]: [
    BreakPointDef | undefined,
    React.Dispatch<React.SetStateAction<BreakPointDef | undefined>>
  ] = useState();
  const [resultBulkPointDef, setResultBulkPointDef]: [
    BulkPointDef | undefined,
    React.Dispatch<React.SetStateAction<BulkPointDef | undefined>>
  ] = useState();

  const { enqueueSnackbar } = useSnackbar();

  const clearData = (reset = true) => {
    clearDataAtk(reset);
    clearDataDef(reset);
    clearDataBulk(reset);
    initialize.current = false;
  };

  const clearDataAtk = (reset = true) => {
    setResultBreakPointAtk(undefined);
    if (!reset) {
      setMove(undefined);
    }
  };

  const clearDataDef = (reset = true) => {
    setResultBreakPointDef(undefined);
    if (!reset) {
      setMoveDef(undefined);
    }
  };

  const clearDataBulk = (reset = true) => {
    setResultBulkPointDef(undefined);
    if (!reset) {
      setFMove(undefined);
      setCMove(undefined);
    }
  };

  const onSetForm = (form: PokemonFormModify | undefined) => {
    setForm(form);
  };

  const onSetFormDef = (form: PokemonFormModify | undefined) => {
    setFormDef(form);
  };

  const calculateBreakpointAtk = () => {
    setResultBreakPointAtk(undefined);
    const dataList: number[][] = [];
    const group = [];
    let lv = 0;
    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
      dataList[lv] = dataList[lv] ?? [];
      for (let j = MIN_IV; j <= MAX_IV; j += 1) {
        const result = calculateDamagePVE(
          globalOptions,
          calculateStatsBattle(statATK, j, i, true),
          statDefDEF,
          move ? (!isRaid && pvpDmg ? move.pvp_power : move.pve_power) : 0,
          {
            effective: getTypeEffective(typeEff, move?.type ?? '', formDef?.form.types ?? []),
            stab: findStabType(form?.form.types ?? [], move?.type ?? ''),
            wb: (!pvpDmg || isRaid) && weatherBoosts,
          },
          false
        );
        dataList[lv].push(result);
        group.push(result);
      }
      lv++;
    }
    const colorTone = computeColorTone([...new Set(group)].sort((a, b) => a - b));
    setResultBreakPointAtk({ data: dataList, colorTone });
    enqueueSnackbar('Calculate breakpoint attacker successfully!', { variant: 'success' });
  };

  const calculateBreakpointDef = () => {
    setResultBreakPointDef(undefined);
    const dataListDef: number[][] = [];
    const groupDef = [];
    const dataListSta: number[][] = [];
    const groupSta = [];
    let lv = 0;
    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
      dataListDef[lv] = dataListDef[lv] ?? [];
      dataListSta[lv] = dataListSta[lv] ?? [];
      for (let j = MIN_IV; j <= MAX_IV; j += 1) {
        const resultDef = calculateDamagePVE(
          globalOptions,
          statDefATK,
          calculateStatsBattle(statDEF, j, i, true),
          moveDef ? (!isRaid && pvpDmg ? moveDef.pvp_power : moveDef.pve_power) : 0,
          {
            effective: getTypeEffective(typeEff, moveDef?.type ?? '', form?.form.types ?? []),
            stab: findStabType(formDef?.form.types ?? [], moveDef?.type ?? ''),
            wb: (!pvpDmg || isRaid) && weatherBoosts,
          },
          false
        );
        dataListDef[lv].push(resultDef);
        groupDef.push(resultDef);
        const resultSta = calculateStatsBattle(statSTA, j, i, true);
        dataListSta[lv].push(resultSta);
        groupSta.push(resultSta);
      }
      lv++;
    }

    const colorToneDef = computeColorTone([...new Set(groupDef)].sort((a, b) => b - a));
    const colorToneSta = computeColorTone([...new Set(groupSta)].sort((a, b) => a - b));
    setResultBreakPointDef({
      dataDef: dataListDef,
      dataSta: dataListSta,
      colorToneDef,
      colorToneSta,
    });
    enqueueSnackbar('Calculate breakpoint defender successfully!', { variant: 'success' });
  };

  const computeColorTone = (data: number[]) => {
    const colorTone: { [x: string]: ColorTone } = {};
    let r = 50,
      g = 255,
      b = 100;
    const diff = Math.max(1, 20 - data.length / 2);
    data.forEach((value, index) => {
      colorTone[value.toString()] = new ColorTone(value, `rgb(${Math.max(0, r)}, ${Math.max(0, g)}, ${Math.max(0, b)})`);
      g -= diff;
      if (index % 2 === 0) {
        b -= diff;
      }
      if (g <= 0 && b <= 0) {
        r -= diff;
      }
    });
    return colorTone;
  };

  const computeBulk = (count: number, lv: number) => {
    return Math.max(
      0,
      Math.ceil(
        (calculateStatsBattle(statSTA, STAIv, lv, true) -
          count *
            calculateDamagePVE(
              globalOptions,
              statDefATK,
              calculateStatsBattle(statDEF, DEFIv, lv, true),
              (!isRaid && pvpDmg ? cMove?.pvp_power : cMove?.pve_power) ?? 0,
              {
                effective: getTypeEffective(typeEff, cMove?.type ?? '', form?.form.types ?? []),
                stab: findStabType(formDef?.form.types ?? [], cMove?.type ?? ''),
                wb: (!pvpDmg || isRaid) && weatherBoosts,
              },
              false
            )) /
          calculateDamagePVE(
            globalOptions,
            statDefATK,
            calculateStatsBattle(statDEF, DEFIv, lv, true),
            (!isRaid && pvpDmg ? fMove?.pvp_power : fMove?.pve_power) ?? 0,
            {
              effective: getTypeEffective(typeEff, fMove?.type ?? '', form?.form.types ?? []),
              stab: findStabType(formDef?.form.types ?? [], fMove?.type ?? ''),
              wb: (!pvpDmg || isRaid) && weatherBoosts,
            },
            false
          )
      )
    );
  };

  const calculateBulkPointDef = () => {
    setResultBulkPointDef(undefined);
    let dataList: number[][] = [];
    let lv = 0;
    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
      let count = 0;
      dataList[lv] = dataList[lv] ?? [];
      let result = computeBulk(count, i);
      while (result > 0) {
        dataList[lv].push(result);
        count++;
        result = computeBulk(count, i);
      }
      lv++;
    }
    const maxLength = Math.max(...dataList.map((item) => item.length));
    dataList = dataList.map((item) => item.concat(Array(maxLength - item.length).fill(0)));
    setResultBulkPointDef({ data: dataList, maxLength });
    enqueueSnackbar('Calculate bulkpoint defender successfully!', { variant: 'success' });
  };

  const setIconBattle = (pri: string, sec: string) => {
    return (
      <div className="d-flex">
        <div className="border-type-stat text-center">
          <Badge color="primary" overlap="circular" badgeContent={isRaid && pri === 'def' ? `Tier ${tier}` : null}>
            <span className="position-relative" style={{ width: 96 }}>
              <img className="position-absolute" alt="img-logo" height={36} src={pri === 'atk' ? `${atk_logo}` : `${def_logo}`} />
              <img
                alt="img-pokemon"
                className="pokemon-sprite-large"
                src={APIService.getPokeIconSprite(form?.form.name ?? '', true)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = APIService.getPokeIconSprite('unknown-pokemon');
                }}
              />
            </span>
          </Badge>
          <span className="caption">{splitAndCapitalize(form?.form.name ?? '', '-', ' ')}</span>
          <span className="caption">
            <b>{pri === 'atk' ? 'Attacker' : 'Defender'}</b>
          </span>
        </div>
        <div className="border-type-stat text-center">
          <Badge color="primary" overlap="circular" badgeContent={isRaid && sec === 'def' ? `Tier ${tier}` : null}>
            <span className="position-relative" style={{ width: 96 }}>
              <img className="position-absolute" alt="img-logo" height={36} src={sec === 'atk' ? `${atk_logo}` : `${def_logo}`} />
              <img
                alt="img-pokemon"
                className="pokemon-sprite-large"
                src={APIService.getPokeIconSprite(formDef?.form.name ?? '', true)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = APIService.getPokeIconSprite('unknown-pokemon');
                }}
              />
            </span>
          </Badge>
          <span className="caption">{splitAndCapitalize(formDef?.form.name ?? '', '-', ' ')}</span>
          <span className="caption">
            <b>{sec === 'atk' ? 'Attacker' : 'Defender'}</b>
          </span>
        </div>
      </div>
    );
  };

  const getBorderSplit = (row: number, column: number) => {
    const data = resultBulkPointDef?.data ?? [];
    let classes = ' bg-zero';
    if (data[row][column - 1] > 0) {
      classes += ' bp-left-border';
    }
    if (data[row + 1][column] > 0) {
      classes += ' bp-bottom-border';
    }
    return classes;
  };

  return (
    <Fragment>
      <div className="row" style={{ margin: 0, overflowX: 'hidden' }}>
        <div className="col-lg" style={{ padding: 0 }}>
          <Find
            hide={true}
            title="Attacker Pokémon"
            clearStats={clearData}
            setStatATK={setStatATK}
            setStatDEF={setStatDEF}
            setStatSTA={setStatSTA}
            setForm={onSetForm}
            setName={setName}
            setId={setId}
          />
        </div>
        <div className="col-lg d-flex justify-content-center" style={{ padding: 0 }}>
          <Find
            swap={true}
            raid={isRaid}
            setRaid={setIsRaid}
            tier={tier}
            setTier={setTier}
            title="Defender Pokémon"
            clearStats={clearData}
            setStatATK={setStatDefATK}
            setStatDEF={setStatDefDEF}
            setForm={onSetFormDef}
            setName={setNameDef}
            setId={setIdDef}
            objective={true}
          />
        </div>
      </div>
      <hr />
      <div className="container" style={{ marginBottom: 20 }}>
        <Tabs defaultActiveKey="breakpointAtk" className="lg-2">
          <Tab eventKey="breakpointAtk" title="Breakpoint Attacker">
            <div className="tab-body">
              <div className="row">
                <div className="col-lg-4">
                  <h2 className="text-center text-decoration-underline">Attacker move</h2>
                  <Move
                    text="Select Moves"
                    id={id}
                    selectDefault={true}
                    form={form ? form.form.name : name.toLowerCase()}
                    setMove={setMove}
                    move={move}
                    clearData={clearDataAtk}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={weatherBoosts}
                        onChange={(_, check) => {
                          setResultBreakPointAtk(undefined);
                          setWeatherBoosts(check);
                        }}
                      />
                    }
                    label="Weather Boosts"
                    disabled={pvpDmg && !isRaid}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={pvpDmg}
                        onChange={(_, check) => {
                          setResultBreakPointAtk(undefined);
                          setPvpDmg(check);
                        }}
                      />
                    }
                    label="PVP stats"
                    disabled={isRaid}
                  />
                  {move && (
                    <div style={{ width: 300, margin: 'auto' }}>
                      <p>
                        - Move Ability Type: <b>{capitalize(move.type_move)}</b>
                      </p>
                      <p>
                        - Move Type: <span className={'type-icon-small ' + move.type?.toLowerCase()}>{capitalize(move.type)}</span>
                      </p>
                      {findStabType(form?.form.types ?? [], move.type ?? '')}
                      <p>
                        - Damage:{' '}
                        <b>
                          {move.pve_power}
                          {findStabType(form?.form.types ?? [], move.type ?? '') && (
                            <span className={'caption-small text-success'}> (x1.2)</span>
                          )}
                        </b>
                      </p>
                    </div>
                  )}
                  <button
                    className="text-center btn btn-primary w-100"
                    style={{ marginBottom: 20 }}
                    onClick={() => calculateBreakpointAtk()}
                    disabled={!move}
                  >
                    Calculate
                  </button>
                </div>
                <div className="col-lg-8">
                  <h3>Attacker Breakpoint</h3>
                  {resultBreakPointAtk && setIconBattle('atk', 'def')}
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-info table-raid-cal sticky-left" style={{ width: 'fit-content' }}>
                      <thead className="text-center">
                        <tr className="table-header">
                          <th />
                          <th>IV</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        <tr>
                          <td>Level</td>
                          <td className="text-iv-bulk">Damage ATK stat to Attacker</td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="table-info table-raid-cal sticky-table-left">
                      <thead className="text-center">
                        <tr className="table-header">
                          <th />
                          {[...Array(MAX_IV + 1).keys()].map((value, index) => (
                            <th key={index}>{value}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {Array.from({ length: (MAX_LEVEL - MIN_LEVEL) / 0.5 + 1 }, (_, i) => 1 + i * 0.5).map((level, i) => (
                          <tr key={i}>
                            <td>{level}</td>
                            {[...Array(MAX_IV + 1).keys()].map((iv, index) => (
                              <td
                                className="text-iv"
                                style={{
                                  backgroundColor: resultBreakPointAtk
                                    ? `${
                                        Object.values(resultBreakPointAtk.colorTone).find(
                                          (item) => item.number === resultBreakPointAtk.data[i][index]
                                        )?.color
                                      }`
                                    : '',
                                }}
                                key={index}
                              >
                                {resultBreakPointAtk && `${resultBreakPointAtk.data[i][index]}`}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
          <Tab eventKey="breakpointDef" title="Breakpoint Defender">
            <div className="tab-body">
              <div className="row">
                <div className="col-lg-4">
                  <h2 className="text-center text-decoration-underline">Defender move</h2>
                  <Move
                    text="Select Moves"
                    id={idDef}
                    selectDefault={true}
                    form={formDef ? formDef.form.name : nameDef.toLowerCase()}
                    setMove={setMoveDef}
                    move={moveDef}
                    clearData={clearDataDef}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={weatherBoosts}
                        onChange={(_, check) => {
                          setResultBreakPointDef(undefined);
                          setWeatherBoosts(check);
                        }}
                      />
                    }
                    label="Weather Boosts"
                    disabled={pvpDmg}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={pvpDmg}
                        onChange={(_, check) => {
                          setResultBreakPointDef(undefined);
                          setPvpDmg(check);
                        }}
                      />
                    }
                    label="PVP stats"
                    disabled={isRaid}
                  />
                  {moveDef && (
                    <div style={{ width: 300, margin: 'auto' }}>
                      <p>
                        - Move Ability Type: <b>{capitalize(moveDef.type_move)}</b>
                      </p>
                      <p>
                        - Move Type: <span className={'type-icon-small ' + moveDef.type?.toLowerCase()}>{capitalize(moveDef.type)}</span>
                      </p>
                      {findStabType(formDef?.form.types ?? [], moveDef?.type ?? '')}
                      <p>
                        - Damage:{' '}
                        <b>
                          {moveDef.pve_power}
                          {findStabType(formDef?.form.types ?? [], moveDef?.type ?? '') && (
                            <span className={'caption-small text-success'}> (x1.2)</span>
                          )}
                        </b>
                      </p>
                    </div>
                  )}
                  <button
                    className="text-center btn btn-primary w-100"
                    style={{ marginBottom: 20 }}
                    onClick={() => calculateBreakpointDef()}
                    disabled={!moveDef}
                  >
                    Calculate
                  </button>
                </div>
                <div className="col-lg-8">
                  <h3>Defender Breakpoint</h3>
                  {resultBreakPointDef && setIconBattle('atk', 'def')}
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-info table-raid-cal sticky-left" style={{ width: 'fit-content' }}>
                      <thead className="text-center">
                        <tr className="table-header">
                          <th />
                          <th>IV</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        <tr>
                          <td>Level</td>
                          <td className="text-iv-bulk">Damage ATK stat to Defender</td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="table-info table-raid-cal sticky-table-left">
                      <thead className="text-center">
                        <tr className="table-header">
                          <th />
                          {[...Array(MAX_IV + 1).keys()].map((value, index) => (
                            <th key={index}>{value}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {Array.from({ length: (MAX_LEVEL - MIN_LEVEL) / 0.5 + 1 }, (_, i) => 1 + i * 0.5).map((level, i) => (
                          <tr key={i}>
                            <td>{level}</td>
                            {[...Array(MAX_IV + 1).keys()].map((iv, index) => (
                              <td
                                className="text-iv"
                                style={{
                                  backgroundColor: resultBreakPointDef
                                    ? `${
                                        Object.values(resultBreakPointDef.colorToneDef).find(
                                          (item) => item.number === resultBreakPointDef.dataDef[i][index]
                                        )?.color
                                      }`
                                    : '',
                                }}
                                key={index}
                              >
                                {resultBreakPointDef && `${resultBreakPointDef.dataDef[i][index]}`}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <hr />
                  <h3>Stamina Breakpoint</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-info table-raid-cal sticky-left" style={{ width: 'max-content' }}>
                      <thead className="text-center">
                        <tr className="table-header">
                          <th />
                          <th>IV</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        <tr>
                          <td>Level</td>
                          <td className="text-iv-bulk">HP remain of Defender</td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="table-info table-raid-cal sticky-table-left">
                      <thead className="text-center">
                        <tr className="table-header">
                          <th />
                          {[...Array(MAX_IV + 1).keys()].map((value, index) => (
                            <th key={index}>{value}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {Array.from({ length: (MAX_LEVEL - MIN_LEVEL) / 0.5 + 1 }, (_, i) => 1 + i * 0.5).map((level, i) => (
                          <tr key={i}>
                            <td>{level}</td>
                            {[...Array(MAX_IV + 1).keys()].map((_, index) => (
                              <td
                                className="text-iv"
                                style={{
                                  backgroundColor: resultBreakPointDef
                                    ? `${
                                        Object.values(resultBreakPointDef.colorToneSta).find(
                                          (item) => item.number === resultBreakPointDef.dataSta[i][index]
                                        )?.color
                                      }`
                                    : '',
                                }}
                                key={index}
                              >
                                {resultBreakPointDef && `${resultBreakPointDef.dataSta[i][index]}`}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
          <Tab eventKey="bulkpoint" title="BulkPoint Attacker">
            <div className="tab-body">
              <div className="row">
                <div className="col-lg-4">
                  <h2 className="text-center text-decoration-underline">Defender move</h2>
                  <div style={{ marginBottom: 15 }}>
                    <Move
                      text="Fast Moves"
                      id={idDef}
                      selectDefault={true}
                      form={formDef ? formDef.form.name : nameDef.toLowerCase()}
                      setMove={setFMove}
                      move={fMove}
                      type={TypeMove.FAST}
                      clearData={clearDataBulk}
                    />
                    {fMove && (
                      <div className="element-top" style={{ width: 300, margin: 'auto' }}>
                        <p>
                          - Move Ability Type: <b>{capitalize(fMove.type_move)}</b>
                        </p>
                        <p>
                          - Move Type: <span className={'type-icon-small ' + fMove?.type?.toLowerCase()}>{capitalize(fMove.type)}</span>
                        </p>
                        {findStabType(formDef?.form.types ?? [], fMove?.type ?? '')}
                        <p>
                          - Damage:{' '}
                          <b>
                            {fMove.pve_power}
                            {findStabType(formDef?.form.types ?? [], fMove?.type ?? '') && (
                              <span className={'caption-small text-success'}> (x1.2)</span>
                            )}
                          </b>
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Move
                      text="Charged Moves"
                      id={idDef}
                      selectDefault={true}
                      form={formDef ? formDef.form.name : nameDef.toLowerCase()}
                      setMove={setCMove}
                      move={cMove}
                      type={TypeMove.CHARGE}
                      clearData={clearDataBulk}
                    />
                    {cMove && (
                      <div className="element-top" style={{ width: 300, margin: 'auto' }}>
                        <p>
                          - Move Ability Type: <b>{capitalize(cMove.type_move)}</b>
                        </p>
                        <p>
                          - Move Type: <span className={'type-icon-small ' + cMove?.type?.toLowerCase()}>{capitalize(cMove.type)}</span>
                        </p>
                        {findStabType(formDef?.form.types ?? [], cMove?.type ?? '')}
                        <p>
                          - Damage:{' '}
                          <b>
                            {cMove.pve_power}
                            {findStabType(formDef?.form.types ?? [], cMove?.type ?? '') && (
                              <span className={'caption-small text-success'}> (x1.2)</span>
                            )}
                          </b>
                        </p>
                      </div>
                    )}
                  </div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={weatherBoosts}
                        onChange={(_, check) => {
                          setResultBulkPointDef(undefined);
                          setWeatherBoosts(check);
                        }}
                      />
                    }
                    label="Weather Boosts"
                    disabled={pvpDmg}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={pvpDmg}
                        onChange={(_, check) => {
                          setResultBulkPointDef(undefined);
                          setPvpDmg(check);
                        }}
                      />
                    }
                    label="PVP stats"
                    disabled={isRaid}
                  />
                  <hr />
                  <h2 className="text-center text-decoration-underline">Attacker stats</h2>
                  <div>
                    <div className="d-flex justify-content-between">
                      <b>DEF</b>
                      <b>{DEFIv}</b>
                    </div>
                    <PokeGoSlider
                      value={DEFIv}
                      aria-label="DEF marks"
                      defaultValue={MIN_IV}
                      min={MIN_IV}
                      max={MAX_IV}
                      step={1}
                      valueLabelDisplay="auto"
                      marks={marks}
                      onChange={(_, v) => setDEFIv(v as number)}
                    />
                    <div className="d-flex justify-content-between">
                      <b>STA</b>
                      <b>{STAIv}</b>
                    </div>
                    <PokeGoSlider
                      value={STAIv}
                      aria-label="STA marks"
                      defaultValue={MIN_IV}
                      min={MIN_IV}
                      max={MAX_IV}
                      step={1}
                      valueLabelDisplay="auto"
                      marks={marks}
                      onChange={(_, v) => setSTAIv(v as number)}
                    />
                  </div>
                  <button
                    className="text-center btn btn-primary w-100"
                    style={{ marginBottom: 20 }}
                    onClick={() => calculateBulkPointDef()}
                    disabled={!(fMove && cMove)}
                  >
                    Calculate
                  </button>
                </div>
                <div className="col-lg-8" style={{ overflowX: 'auto' }}>
                  <h3>BulkPoint</h3>
                  {resultBulkPointDef && setIconBattle('atk', 'def')}
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-info table-raid-cal sticky-left" style={{ width: 'fit-content' }}>
                      <thead className="text-center">
                        <tr className="table-header">
                          <th />
                          <th>Number of Charge attacks to defeat defender</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        <tr>
                          <td>Level</td>
                          <td className="text-iv-bulk">Number of Quick attacks to defeat defender</td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="table-info table-raid-cal sticky-table-left">
                      <thead className="text-center">
                        <tr className="table-header">
                          <th />
                          {resultBulkPointDef ? (
                            <Fragment>
                              {[...Array(resultBulkPointDef.maxLength).keys()].map((_, index) => (
                                <th key={index}>{index}</th>
                              ))}
                            </Fragment>
                          ) : (
                            <Fragment>
                              {[...Array(11).keys()].map((value, index) => (
                                <th key={index}>{value}</th>
                              ))}
                              <th>...</th>
                            </Fragment>
                          )}
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {Array.from({ length: (MAX_LEVEL - MIN_LEVEL) / 0.5 + 1 }, (_, i) => 1 + i * 0.5).map((level, i) => (
                          <tr key={i}>
                            <td>{level}</td>
                            {resultBulkPointDef ? (
                              <Fragment>
                                {resultBulkPointDef.data[i].map((value: number, index: number) => (
                                  <td className={'text-iv-bulk' + (value === 0 ? getBorderSplit(i, index) : '')} key={index}>
                                    {value}
                                  </td>
                                ))}
                              </Fragment>
                            ) : (
                              <Fragment>
                                {[...Array(12).keys()].map((_, index) => (
                                  <td key={index} />
                                ))}
                              </Fragment>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </Fragment>
  );
};

export default CalculatePoint;
