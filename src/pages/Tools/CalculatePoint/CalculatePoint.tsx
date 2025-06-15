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
import { useTitle } from '../../../util/hooks/useTitle';
import { BattleState } from '../../../core/models/damage.model';
import {
  combineClasses,
  DynamicObj,
  getValueOrDefault,
  isNotEmpty,
  toNumber,
  UniqValueInArray,
} from '../../../util/extension';
import { BreakPointAtk, BreakPointDef, BulkPointDef, ColorTone } from './models/calculate-point.model';
import { Color } from '../../../core/models/candy.model';

const CalculatePoint = () => {
  useTitle({
    title: 'Calculate Point Stats - Tools',
    description:
      "Calculate Pokémon GO point statistics and optimize your team's performance. Get precise stat calculations for better battle planning.",
    keywords: [
      'point stats calculator',
      'Pokémon GO point system',
      'battle points',
      'stat optimization',
      'Pokémon GO tools',
      'team optimization',
    ],
  });
  const globalOptions = useSelector((state: StoreState) => state.store.data.options);
  const typeEff = useSelector((state: StoreState) => state.store.data.typeEff);
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);

  const [move, setMove] = useState<ICombat>();

  const [DEFIv, setDEFIv] = useState(0);
  const [STAIv, setSTAIv] = useState(0);

  const [weatherBoosts, setWeatherBoosts] = useState(false);
  const [pvpDmg, setPvpDmg] = useState(false);
  const [showDiffBorder, setShowDiffBorder] = useState(false);

  const [isRaid, setIsRaid] = useState(true);
  const [tier, setTier] = useState(1);

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

  const calculateBreakpointAtk = () => {
    setResultBreakPointAtk(undefined);
    const dataList: number[][] = [];
    const group: number[] = [];
    let level = 0;
    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i += 0.5) {
      dataList[level] = getValueOrDefault(Array, dataList[level]);
      for (let j = MIN_IV; j <= MAX_IV; j += 1) {
        const atk = calculateStatsBattle(searching?.current?.pokemon?.statsGO?.atk, j, i, true);
        const result = getMoveDamagePVE(
          atk,
          toNumber(searching?.object?.pokemon?.statsGO?.def, 1),
          searching?.object?.form,
          searching?.current?.form,
          move
        );
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
        const def = calculateStatsBattle(searching?.current?.pokemon?.statsGO?.def, j, i, true);
        const resultDef = getMoveDamagePVE(
          toNumber(searching?.object?.pokemon?.statsGO?.atk, 1),
          def,
          searching?.current?.form,
          searching?.object?.form,
          moveDef
        );
        dataListDef[level].push(resultDef);
        groupDef.push(resultDef);
        const resultSta = calculateStatsBattle(searching?.current?.pokemon?.statsGO?.sta, j, i, true);
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
    const colorTone = new Object() as DynamicObj<ColorTone>;
    let r = 50,
      g = 255,
      b = 100;
    const diff = Math.max(1, 20 - data.length / 2);
    data.forEach((value, index) => {
      colorTone[value.toString()] = new ColorTone(value, Color.create(r, g, b, 0.85));
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
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  };

  const getMoveDamagePVE = (
    atk: number,
    def: number,
    pokemon: Partial<IPokemonFormModify> | undefined,
    pokemonDef: Partial<IPokemonFormModify> | undefined,
    move: ICombat | undefined
  ) => {
    return calculateDamagePVE(
      globalOptions,
      atk,
      def,
      toNumber(!isRaid && pvpDmg ? move?.pvpPower : move?.pvePower),
      BattleState.create({
        effective: getTypeEffective(typeEff, move?.type, pokemon?.form?.types),
        isStab: findStabType(pokemonDef?.form?.types, move?.type),
        isWb: (!pvpDmg || isRaid) && weatherBoosts,
      }),
      false
    );
  };

  const computeBulk = (count: number, level: number) => {
    const def = calculateStatsBattle(searching?.current?.pokemon?.statsGO?.def, DEFIv, level, true);
    return Math.max(
      0,
      Math.ceil(
        (calculateStatsBattle(searching?.current?.pokemon?.statsGO?.sta, STAIv, level, true) -
          count *
            getMoveDamagePVE(
              toNumber(searching?.object?.pokemon?.statsGO?.atk),
              def,
              searching?.current?.form,
              searching?.object?.form,
              cMove
            )) /
          getMoveDamagePVE(
            toNumber(searching?.object?.pokemon?.statsGO?.atk),
            def,
            searching?.current?.form,
            searching?.object?.form,
            fMove
          )
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

  const getIconBattle = (action: TypeAction, form: Partial<IPokemonFormModify> | undefined) => (
    <div className="border-type-stat text-center">
      <Badge
        color="primary"
        overlap="circular"
        badgeContent={isRaid && action === TypeAction.Def ? `Tier ${tier}` : undefined}
      >
        <span className="position-relative" style={{ width: 96 }}>
          <img
            className="position-absolute"
            alt="Image Logo"
            height={36}
            src={action === TypeAction.Atk ? `${ATK_LOGO}` : `${DEF_LOGO}`}
          />
          <img
            alt="Pokémon Image"
            className="pokemon-sprite-large"
            src={APIService.getPokeIconSprite(form?.form?.name, false)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = APIService.getPokeIconSprite();
            }}
          />
        </span>
      </Badge>
      <span className="caption">{splitAndCapitalize(form?.form?.name, '-', ' ')}</span>
      <span className="caption">
        <b>{action === TypeAction.Atk ? 'Attacker' : 'Defender'}</b>
      </span>
    </div>
  );

  const setIconBattle = (atk: TypeAction, def: TypeAction) => (
    <>
      <div className="d-flex">
        {getIconBattle(atk, searching?.current?.form)}
        {getIconBattle(def, searching?.object?.form)}
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
      <div className="row m-0 overflow-x-hidden">
        <div className="col-lg p-0">
          <Find isHide title="Attacker Pokémon" clearStats={clearData} />
        </div>
        <div className="col-lg d-flex justify-content-center p-0">
          <Find
            isSwap
            isRaid={isRaid}
            setRaid={setIsRaid}
            tier={tier}
            setTier={setTier}
            title="Defender Pokémon"
            clearStats={clearData}
            isObjective
          />
        </div>
      </div>
      <hr />
      <div className="container mb-3">
        <Tabs defaultActiveKey="breakpointAtk" className="lg-2">
          <Tab eventKey="breakpointAtk" title="Breakpoint Attacker">
            <div className="tab-body">
              <div className="row">
                <div className="col-lg-4">
                  <h2 className="text-center text-decoration-underline">Attacker move</h2>
                  <Move
                    text="Select Moves"
                    id={searching?.current?.pokemon?.id}
                    isSelectDefault
                    form={
                      searching?.current?.form
                        ? searching?.current?.form.form?.name
                        : searching?.current?.pokemon?.fullName
                    }
                    setMove={setMove}
                    move={move}
                    clearData={clearDataAtk}
                    isHighlight
                    pokemonType={searching?.current?.form?.form?.pokemonType}
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
                    <div className="m-auto" style={{ width: 300 }}>
                      <p>
                        - Move Ability Type: <b>{getKeyWithData(TypeMove, move.typeMove)}</b>
                      </p>
                      <p>
                        {'- Move Type: '}
                        <span className={combineClasses('type-icon-small', move.type?.toLowerCase())}>
                          {capitalize(move.type)}
                        </span>
                      </p>
                      {findStabType(searching?.current?.form?.form?.types, move.type)}
                      <p>
                        {'- Damage: '}
                        <b>
                          {move.pvePower}
                          {findStabType(searching?.current?.form?.form?.types, move.type) && (
                            <span className="caption-small text-success"> (x1.2)</span>
                          )}
                        </b>
                      </p>
                    </div>
                  )}
                  <button
                    className="text-center btn btn-primary w-100 mb-3"
                    onClick={() => calculateBreakpointAtk()}
                    disabled={!move}
                  >
                    Calculate
                  </button>
                </div>
                <div className="col-lg-8">
                  <h3>Attacker Breakpoint</h3>
                  {resultBreakPointAtk && setIconBattle(TypeAction.Atk, TypeAction.Def)}
                  <div className="overflow-x-auto">
                    <table className="table-info table-raid-cal sticky-left w-fit-content">
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
                    id={searching?.object?.pokemon?.id}
                    isSelectDefault
                    form={
                      searching?.object?.form
                        ? searching?.object?.form.form?.name
                        : searching?.object?.pokemon?.fullName
                    }
                    setMove={setMoveDef}
                    move={moveDef}
                    clearData={clearDataDef}
                    isHighlight
                    pokemonType={searching?.object?.form?.form?.pokemonType}
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
                    <div className="m-auto" style={{ width: 300 }}>
                      <p>
                        - Move Ability Type: <b>{getKeyWithData(TypeMove, moveDef.typeMove)}</b>
                      </p>
                      <p>
                        {'- Move Type: '}
                        <span className={combineClasses('type-icon-small', moveDef.type?.toLowerCase())}>
                          {capitalize(moveDef.type)}
                        </span>
                      </p>
                      {findStabType(searching?.object?.form?.form?.types, moveDef.type)}
                      <p>
                        {'- Damage: '}
                        <b>
                          {moveDef.pvePower}
                          {findStabType(searching?.object?.form?.form?.types, moveDef.type) && (
                            <span className="caption-small text-success"> (x1.2)</span>
                          )}
                        </b>
                      </p>
                    </div>
                  )}
                  <button
                    className="text-center btn btn-primary w-100 mb-3"
                    onClick={() => calculateBreakpointDef()}
                    disabled={!moveDef}
                  >
                    Calculate
                  </button>
                </div>
                <div className="col-lg-8">
                  <h3>Defender Breakpoint</h3>
                  {resultBreakPointDef && setIconBattle(TypeAction.Atk, TypeAction.Def)}
                  <div className="overflow-x-auto">
                    <table className="table-info table-raid-cal sticky-left w-fit-content">
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
                  <div className="overflow-x-auto">
                    <table className="table-info table-raid-cal sticky-left w-max-content">
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
                  <div className="mb-3">
                    <Move
                      text="Fast Moves"
                      id={searching?.object?.pokemon?.id}
                      isSelectDefault
                      form={
                        searching?.object?.form
                          ? searching?.object?.form.form?.name
                          : searching?.object?.pokemon?.fullName
                      }
                      setMove={setFMove}
                      move={fMove}
                      type={TypeMove.Fast}
                      clearData={clearDataBulk}
                      isHighlight
                      pokemonType={searching?.object?.form?.form?.pokemonType}
                    />
                    {fMove && (
                      <div className="mt-2 m-auto" style={{ width: 300 }}>
                        <p>
                          - Move Ability Type: <b>{getKeyWithData(TypeMove, fMove.typeMove)}</b>
                        </p>
                        <p>
                          {'- Move Type: '}
                          <span className={combineClasses('type-icon-small', fMove.type?.toLowerCase())}>
                            {capitalize(fMove.type)}
                          </span>
                        </p>
                        {findStabType(searching?.object?.form?.form?.types, fMove.type)}
                        <p>
                          {'- Damage: '}
                          <b>
                            {fMove.pvePower}
                            {findStabType(searching?.object?.form?.form?.types, fMove.type) && (
                              <span className="caption-small text-success"> (x1.2)</span>
                            )}
                          </b>
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Move
                      text="Charged Moves"
                      id={searching?.object?.pokemon?.id}
                      isSelectDefault
                      form={
                        searching?.object?.form
                          ? searching?.object?.form.form?.name
                          : searching?.object?.pokemon?.fullName
                      }
                      setMove={setCMove}
                      move={cMove}
                      type={TypeMove.Charge}
                      clearData={clearDataBulk}
                      isHighlight
                      pokemonType={searching?.object?.form?.form?.pokemonType}
                    />
                    {cMove && (
                      <div className="mt-2 m-auto" style={{ width: 300 }}>
                        <p>
                          - Move Ability Type: <b>{getKeyWithData(TypeMove, cMove.typeMove)}</b>
                        </p>
                        <p>
                          {'- Move Type: '}
                          <span className={combineClasses('type-icon-small', cMove.type?.toLowerCase())}>
                            {capitalize(cMove.type)}
                          </span>
                        </p>
                        {findStabType(searching?.object?.form?.form?.types, cMove.type)}
                        <p>
                          {'- Damage: '}
                          <b>
                            {cMove.pvePower}
                            {findStabType(searching?.object?.form?.form?.types, cMove.type) && (
                              <span className="caption-small text-success"> (x1.2)</span>
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
                    className="text-center btn btn-primary w-100 mb-3"
                    onClick={() => calculateBulkPointDef()}
                    disabled={!(fMove && cMove)}
                  >
                    Calculate
                  </button>
                </div>
                <div className="col-lg-8 overflow-x-auto">
                  <h3>BulkPoint</h3>
                  {resultBulkPointDef && setIconBattle(TypeAction.Atk, TypeAction.Def)}
                  <div className="overflow-x-auto">
                    <table className="table-info table-raid-cal sticky-left w-fit-content">
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
