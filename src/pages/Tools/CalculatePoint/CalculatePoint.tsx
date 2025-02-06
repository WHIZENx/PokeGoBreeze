import React, { Fragment, useState } from 'react';
import Find from '../../../components/Find/Find';

import { Tabs, Tab } from 'react-bootstrap';

import './CalculatePoint.scss';
import Move from '../../../components/Table/Move';
import { Badge, Checkbox, FormControlLabel } from '@mui/material';
import { capitalize, getKeyWithData, marks, PokeGoSlider, splitAndCapitalize } from '../../../util/utils';
import { findStabType } from '../../../util/compute';
import { levelList, MAX_IV, MAX_LEVEL, MIN_IV, MIN_LEVEL } from '../../../util/constants';
import { calculateDamagePVE, calculateStatsBattle, getTypeEffective } from '../../../util/calculate';
import { useSnackbar } from 'notistack';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import APIService from '../../../services/API.service';
import { useSelector } from 'react-redux';
import { TypeAction, TypeMove, VariantType } from '../../../enums/type.enum';
import { SearchingState, StoreState } from '../../../store/models/state.model';
import { IPokemonFormModify } from '../../../core/models/API/form.model';
import { ICombat } from '../../../core/models/combat.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { BattleState } from '../../../core/models/damage.model';
import { combineClasses, DynamicObj, getValueOrDefault, isNotEmpty, toNumber, UniqValueInArray } from '../../../util/extension';
import { BreakPointAtk, BreakPointDef, BulkPointDef, ColorTone } from './models/calculate-point.model';
import { Color } from '../../../core/models/candy.model';

const CalculatePoint = () => {
  useChangeTitle('Calculate Point Stats - Tools');
  const globalOptions = useSelector((state: StoreState) => state.store.data.options);
  const typeEff = useSelector((state: StoreState) => state.store.data.typeEff);
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);

  const [id, setId] = useState(toNumber(searching?.id, 1));
  const [name, setName] = useState(splitAndCapitalize(searching?.fullName, '-', ' '));
  const [form, setForm] = useState<IPokemonFormModify>();
  const [move, setMove] = useState<ICombat>();

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [DEFIv, setDEFIv] = useState(0);
  const [STAIv, setSTAIv] = useState(0);

  const [weatherBoosts, setWeatherBoosts] = useState(false);
  const [pvpDmg, setPvpDmg] = useState(false);
  const [showDiffBorder, setShowDiffBorder] = useState(false);

  const [statDefATK, setStatDefATK] = useState(0);
  const [statDefDEF, setStatDefDEF] = useState(0);

  const [isRaid, setIsRaid] = useState(true);
  const [tier, setTier] = useState(1);

  const [idDef, setIdDef] = useState(toNumber(searching?.obj?.id, 1));
  const [nameDef, setNameDef] = useState(splitAndCapitalize(searching?.obj?.fullName, '-', ' '));
  const [formDef, setFormDef] = useState<IPokemonFormModify>();
  const [moveDef, setMoveDef] = useState<ICombat>();

  const [fMove, setFMove] = useState<ICombat>();
  const [cMove, setCMove] = useState<ICombat>();

  const [resultBreakPointAtk, setResultBreakPointAtk] = useState<BreakPointAtk>();
  const [resultBreakPointDef, setResultBreakPointDef] = useState<BreakPointDef>();
  const [resultBulkPointDef, setResultBulkPointDef] = useState<BulkPointDef>();

  const { enqueueSnackbar } = useSnackbar();

  const clearData = (reset = true) => {
    clearDataAtk(reset);
    clearDataDef(reset);
    clearDataBulk(reset);
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

  const onSetForm = (form: IPokemonFormModify | undefined) => {
    setForm(form);
  };

  const onSetFormDef = (form: IPokemonFormModify | undefined) => {
    setFormDef(form);
  };

  const calculateBreakpointAtk = () => {
    setResultBreakPointAtk(undefined);
    const dataList: number[][] = [];
    const group: number[] = [];
    let level = 0;
    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
      dataList[level] = getValueOrDefault(Array, dataList[level]);
      for (let j = MIN_IV; j <= MAX_IV; j += 1) {
        const atk = calculateStatsBattle(statATK, j, i, true);
        const result = getMoveDamagePVE(atk, statDefDEF, formDef, form, move);
        dataList[level].push(result);
        group.push(result);
      }
      level++;
    }
    const colorTone = computeColorTone(UniqValueInArray(group).sort((a, b) => a - b));
    setResultBreakPointAtk({ data: dataList, colorTone });
    enqueueSnackbar('Calculate breakpoint attacker successfully!', { variant: VariantType.Success });
  };

  const calculateBreakpointDef = () => {
    setResultBreakPointDef(undefined);
    const dataListDef: number[][] = [];
    const groupDef: number[] = [];
    const dataListSta: number[][] = [];
    const groupSta: number[] = [];
    let level = 0;
    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
      dataListDef[level] ??= [];
      dataListSta[level] ??= [];
      for (let j = MIN_IV; j <= MAX_IV; j += 1) {
        const def = calculateStatsBattle(statDEF, j, i, true);
        const resultDef = getMoveDamagePVE(statDefATK, def, form, formDef, moveDef);
        dataListDef[level].push(resultDef);
        groupDef.push(resultDef);
        const resultSta = calculateStatsBattle(statSTA, j, i, true);
        dataListSta[level].push(resultSta);
        groupSta.push(resultSta);
      }
      level++;
    }

    const colorToneDef = computeColorTone(UniqValueInArray(groupDef).sort((a, b) => b - a));
    const colorToneSta = computeColorTone(UniqValueInArray(groupSta).sort((a, b) => a - b));
    setResultBreakPointDef({
      dataDef: dataListDef,
      dataSta: dataListSta,
      colorToneDef,
      colorToneSta,
    });
    enqueueSnackbar('Calculate breakpoint defender successfully!', { variant: VariantType.Success });
  };

  const computeColorTone = (data: number[]) => {
    const colorTone: DynamicObj<ColorTone> = {};
    let r = 50,
      g = 255,
      b = 100;
    const diff = Math.max(1, 20 - data.length / 2);
    data.forEach((value, index) => {
      colorTone[value.toString()] = new ColorTone(value, Color.create(r, g, b));
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

  const computeColor = (color: Color | undefined) => {
    if (!color) {
      color = new Color();
    }
    return `rgb(${Math.max(0, color.r)}, ${Math.max(0, color.g)}, ${Math.max(0, color.b)})`;
  };

  const getMoveDamagePVE = (
    atk: number,
    def: number,
    pokemon: IPokemonFormModify | undefined,
    pokemonDef: IPokemonFormModify | undefined,
    move: ICombat | undefined
  ) => {
    return calculateDamagePVE(
      globalOptions,
      atk,
      def,
      toNumber(!isRaid && pvpDmg ? move?.pvpPower : move?.pvePower),
      BattleState.create({
        effective: getTypeEffective(typeEff, move?.type, pokemon?.form.types),
        isStab: findStabType(pokemonDef?.form.types, move?.type),
        isWb: (!pvpDmg || isRaid) && weatherBoosts,
      }),
      false
    );
  };

  const computeBulk = (count: number, level: number) => {
    const def = calculateStatsBattle(statDEF, DEFIv, level, true);
    return Math.max(
      0,
      Math.ceil(
        (calculateStatsBattle(statSTA, STAIv, level, true) - count * getMoveDamagePVE(statDefATK, def, form, formDef, cMove)) /
          getMoveDamagePVE(statDefATK, def, form, formDef, fMove)
      )
    );
  };

  const calculateBulkPointDef = () => {
    setResultBulkPointDef(undefined);
    let dataList: number[][] = [];
    let level = 0;
    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
      let count = 0;
      dataList[level] ??= [];
      let result = computeBulk(count, i);
      while (result > 0) {
        dataList[level].push(result);
        count++;
        result = computeBulk(count, i);
      }
      level++;
    }
    const maxLength = Math.max(...dataList.map((item) => item.length));
    dataList = dataList.map((item) => item.concat(Array(maxLength - item.length).fill(0)));
    setResultBulkPointDef({ data: dataList, maxLength });
    enqueueSnackbar('Calculate bulkpoint defender successfully!', { variant: VariantType.Success });
  };

  const getIconBattle = (action: TypeAction, form: IPokemonFormModify | undefined) => (
    <div className="border-type-stat text-center">
      <Badge color="primary" overlap="circular" badgeContent={isRaid && action === TypeAction.Def ? `Tier ${tier}` : undefined}>
        <span className="position-relative" style={{ width: 96 }}>
          <img className="position-absolute" alt="img-logo" height={36} src={action === TypeAction.Atk ? `${ATK_LOGO}` : `${DEF_LOGO}`} />
          <img
            alt="img-pokemon"
            className="pokemon-sprite-large"
            src={APIService.getPokeIconSprite(form?.form.name, false)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = APIService.getPokeIconSprite();
            }}
          />
        </span>
      </Badge>
      <span className="caption">{splitAndCapitalize(form?.form.name, '-', ' ')}</span>
      <span className="caption">
        <b>{action === TypeAction.Atk ? 'Attacker' : 'Defender'}</b>
      </span>
    </div>
  );

  const setIconBattle = (atk: TypeAction, def: TypeAction) => (
    <>
      <div className="d-flex">
        {getIconBattle(atk, form)}
        {getIconBattle(def, formDef)}
      </div>
      <FormControlLabel
        control={<Checkbox checked={showDiffBorder} onChange={(_, check) => setShowDiffBorder(check)} />}
        label="Show different border highlight"
      />
    </>
  );

  const getBorderHighlight = (row: number, column: number, data: number[][] | undefined) => {
    data = getValueOrDefault(Array, data);
    const classes: string[] = [];
    if (isNotEmpty(data)) {
      const current = data[row][column];
      const left = data[row]?.[column - 1];
      const right = data[row]?.[column + 1];
      const upper = data[row - 1]?.[column];
      const lower = data[row + 1]?.[column];
      if (toNumber(left) > 0 && left !== current) {
        classes.push('bp-left-border');
      }
      if (toNumber(right) > 0 && right !== current) {
        classes.push('bp-right-border');
      }
      if (toNumber(upper) > 0 && upper !== current) {
        classes.push('bp-top-border');
      }
      if (toNumber(lower) > 0 && lower !== current) {
        classes.push('bp-bottom-border');
      }
    }
    return classes.join(' ');
  };

  const getBorderSplit = (row: number, column: number) => {
    const data = getValueOrDefault(Array, resultBulkPointDef?.data);
    const classes = ['bg-zero'];
    if (data[row]?.[column - 1] > 0) {
      classes.push('bp-left-border');
    }
    if (data[row - 1]?.[column] > 0) {
      classes.push('bp-top-border');
    }
    if (data[row + 1]?.[column] > 0) {
      classes.push('bp-bottom-border');
    }
    return classes.join(' ');
  };

  return (
    <Fragment>
      <div className="row" style={{ margin: 0, overflowX: 'hidden' }}>
        <div className="col-lg" style={{ padding: 0 }}>
          <Find
            isHide={true}
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
            isSwap={true}
            isRaid={isRaid}
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
            isObjective={true}
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
                    isSelectDefault={true}
                    form={form ? form.form.name : name.toLowerCase()}
                    setMove={setMove}
                    move={move}
                    clearData={clearDataAtk}
                    isHighlight={true}
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
                        - Move Ability Type: <b>{getKeyWithData(TypeMove, move.typeMove)}</b>
                      </p>
                      <p>
                        - Move Type:{' '}
                        <span className={combineClasses('type-icon-small', move.type?.toLowerCase())}>{capitalize(move.type)}</span>
                      </p>
                      {findStabType(form?.form.types, move.type)}
                      <p>
                        - Damage:{' '}
                        <b>
                          {move.pvePower}
                          {findStabType(form?.form.types, move.type) && <span className="caption-small text-success"> (x1.2)</span>}
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
                  {resultBreakPointAtk && setIconBattle(TypeAction.Atk, TypeAction.Def)}
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
                        {levelList.map((level, i) => (
                          <tr key={i}>
                            <td>{level}</td>
                            {[...Array(MAX_IV + 1).keys()].map((_, index) => (
                              <td
                                className={combineClasses(
                                  'text-iv',
                                  showDiffBorder ? getBorderHighlight(i, index, resultBreakPointAtk?.data) : ''
                                )}
                                style={{
                                  backgroundColor: resultBreakPointAtk
                                    ? computeColor(
                                        Object.values(resultBreakPointAtk.colorTone).find(
                                          (item) => item.number === resultBreakPointAtk.data[i][index]
                                        )?.color
                                      )
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
                    isSelectDefault={true}
                    form={formDef ? formDef.form.name : nameDef.toLowerCase()}
                    setMove={setMoveDef}
                    move={moveDef}
                    clearData={clearDataDef}
                    isHighlight={true}
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
                        - Move Ability Type: <b>{getKeyWithData(TypeMove, moveDef.typeMove)}</b>
                      </p>
                      <p>
                        - Move Type:{' '}
                        <span className={combineClasses('type-icon-small', moveDef.type?.toLowerCase())}>{capitalize(moveDef.type)}</span>
                      </p>
                      {findStabType(formDef?.form.types, moveDef.type)}
                      <p>
                        - Damage:{' '}
                        <b>
                          {moveDef.pvePower}
                          {findStabType(formDef?.form.types, moveDef.type) && <span className="caption-small text-success"> (x1.2)</span>}
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
                  {resultBreakPointDef && setIconBattle(TypeAction.Atk, TypeAction.Def)}
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
                        {levelList.map((level, i) => (
                          <tr key={i}>
                            <td>{level}</td>
                            {[...Array(MAX_IV + 1).keys()].map((_, index) => (
                              <td
                                className={combineClasses(
                                  'text-iv',
                                  showDiffBorder ? getBorderHighlight(i, index, resultBreakPointDef?.dataDef) : ''
                                )}
                                style={{
                                  backgroundColor: resultBreakPointDef
                                    ? computeColor(
                                        Object.values(resultBreakPointDef.colorToneDef).find(
                                          (item) => item.number === resultBreakPointDef.dataDef[i][index]
                                        )?.color
                                      )
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
                        {levelList.map((level, i) => (
                          <tr key={i}>
                            <td>{level}</td>
                            {[...Array(MAX_IV + 1).keys()].map((_, index) => (
                              <td
                                className={combineClasses(
                                  'text-iv',
                                  showDiffBorder ? getBorderHighlight(i, index, resultBreakPointDef?.dataSta) : ''
                                )}
                                style={{
                                  backgroundColor: resultBreakPointDef
                                    ? computeColor(
                                        Object.values(resultBreakPointDef.colorToneSta).find(
                                          (item) => item.number === resultBreakPointDef.dataSta[i][index]
                                        )?.color
                                      )
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
                      isSelectDefault={true}
                      form={formDef ? formDef.form.name : nameDef.toLowerCase()}
                      setMove={setFMove}
                      move={fMove}
                      type={TypeMove.Fast}
                      clearData={clearDataBulk}
                      isHighlight={true}
                    />
                    {fMove && (
                      <div className="element-top" style={{ width: 300, margin: 'auto' }}>
                        <p>
                          - Move Ability Type: <b>{getKeyWithData(TypeMove, fMove.typeMove)}</b>
                        </p>
                        <p>
                          - Move Type:{' '}
                          <span className={combineClasses('type-icon-small', fMove.type?.toLowerCase())}>{capitalize(fMove.type)}</span>
                        </p>
                        {findStabType(formDef?.form.types, fMove.type)}
                        <p>
                          - Damage:{' '}
                          <b>
                            {fMove.pvePower}
                            {findStabType(formDef?.form.types, fMove.type) && <span className="caption-small text-success"> (x1.2)</span>}
                          </b>
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Move
                      text="Charged Moves"
                      id={idDef}
                      isSelectDefault={true}
                      form={formDef ? formDef.form.name : nameDef.toLowerCase()}
                      setMove={setCMove}
                      move={cMove}
                      type={TypeMove.Charge}
                      clearData={clearDataBulk}
                      isHighlight={true}
                    />
                    {cMove && (
                      <div className="element-top" style={{ width: 300, margin: 'auto' }}>
                        <p>
                          - Move Ability Type: <b>{getKeyWithData(TypeMove, cMove.typeMove)}</b>
                        </p>
                        <p>
                          - Move Type:{' '}
                          <span className={combineClasses('type-icon-small', cMove.type?.toLowerCase())}>{capitalize(cMove.type)}</span>
                        </p>
                        {findStabType(formDef?.form.types, cMove.type)}
                        <p>
                          - Damage:{' '}
                          <b>
                            {cMove.pvePower}
                            {findStabType(formDef?.form.types, cMove.type) && <span className="caption-small text-success"> (x1.2)</span>}
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
                  {resultBulkPointDef && setIconBattle(TypeAction.Atk, TypeAction.Def)}
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
                        {levelList.map((level, i) => (
                          <tr key={i}>
                            <td>{level}</td>
                            {resultBulkPointDef ? (
                              <Fragment>
                                {resultBulkPointDef.data[i].map((value, index) => (
                                  <td
                                    className={combineClasses(
                                      'text-iv-bulk',
                                      value === 0 && showDiffBorder ? getBorderSplit(i, index) : ''
                                    )}
                                    key={index}
                                  >
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
