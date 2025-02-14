import React, { Fragment, useCallback, useState } from 'react';
import Find from '../../../components/Find/Find';

import { Badge, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import './SearchBattle.scss';
import APIService from '../../../services/API.service';

import { capitalize, generateParamForm, getValidPokemonImgPath, splitAndCapitalize } from '../../../util/utils';
import { calculateStats, queryStatesEvoChain } from '../../../util/calculate';

import { Accordion, useAccordionButton } from 'react-bootstrap';
import { useSnackbar } from 'notistack';

import { Link } from 'react-router-dom';
import { marks, PokeGoSlider } from '../../../util/utils';
import { useDispatch, useSelector } from 'react-redux';
import Candy from '../../../components/Sprites/Candy/Candy';
import CandyXL from '../../../components/Sprites/Candy/CandyXL';
import { SearchingState, StoreState } from '../../../store/models/state.model';
import { MIN_IV, MAX_IV, FORM_NORMAL, FORM_GALAR, FORM_HISUI, MIN_CP } from '../../../util/constants';
import { IEvolution } from '../../../core/models/evolution.model';
import { IPokemonFormModify } from '../../../core/models/API/form.model';
import { BattleBaseStats, IBattleBaseStats, IQueryStatesEvoChain, StatsCalculate } from '../../../util/models/calculate.model';
import DynamicInputCP from '../../../components/Input/DynamicInputCP';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { SpinnerActions } from '../../../store/actions';
import {
  combineClasses,
  DynamicObj,
  getValueOrDefault,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  toFloatWithPadding,
  toNumber,
} from '../../../util/extension';
import { Toggle } from '../../../core/models/pvp.model';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { findAssetForm, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../util/compute';
import { BattleLeagueCPType } from '../../../util/enums/compute.enum';
import { VariantType } from '../../../enums/type.enum';

const FindBattle = () => {
  useChangeTitle('Search Battle Leagues Stats - Tool');
  const dispatch = useDispatch();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);

  const [id, setId] = useState(toNumber(searching?.id, 1));
  const [name, setName] = useState(splitAndCapitalize(searching?.fullName, '-', ' '));
  const [form, setForm] = useState<IPokemonFormModify>();
  const [maxCP, setMaxCP] = useState(0);

  const [searchCP, setSearchCP] = useState('');

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [ATKIv, setATKIv] = useState(0);
  const [DEFIv, setDEFIv] = useState(0);
  const [STAIv, setSTAIv] = useState(0);

  const [evoChain, setEvoChain] = useState<IQueryStatesEvoChain[][]>([]);
  const [bestInLeague, setBestInLeague] = useState<IBattleBaseStats[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const clearArrStats = () => {
    setSearchCP('');
    setEvoChain([]);
    setBestInLeague([]);
    setATKIv(0);
    setDEFIv(0);
    setSTAIv(0);
  };

  const currEvoChain = useCallback(
    (currId: number[], form: string, arr: IEvolution[]) => {
      form = form.replace(`${FORM_GALAR}IAN`, FORM_GALAR).replace(`${FORM_HISUI}AN`, FORM_HISUI);
      if (!isNotEmpty(currId)) {
        return arr;
      }
      let curr;
      if (form === FORM_NORMAL) {
        curr = dataStore.pokemon.find((item) => isIncludeList(currId, item.num) && isEqual(form, item.forme));
      } else {
        curr = dataStore.pokemon.find((item) => isIncludeList(currId, item.num) && isInclude(item.forme, form));
      }
      if (
        !isIncludeList(
          arr.map((i) => i.id),
          curr?.num
        )
      ) {
        arr.push({
          ...curr,
          form,
          id: toNumber(curr?.num),
          name: getValueOrDefault(String, curr?.pokemonId),
          evoList: getValueOrDefault(Array, curr?.evoList),
          tempEvo: getValueOrDefault(Array, curr?.tempEvo),
        });
      }
      currEvoChain(
        getValueOrDefault(
          Array,
          curr?.evoList?.map((i) => i.evoToId)
        ),
        form,
        arr
      );
    },
    [dataStore.pokemon]
  );

  const prevEvoChain = useCallback(
    (obj: IPokemonData, defaultForm: string, arr: IEvolution[], result: IEvolution[][]) => {
      if (
        !isIncludeList(
          arr.map((i) => i.id),
          obj.num
        )
      ) {
        arr.push({
          ...obj,
          name: getValueOrDefault(String, obj.pokemonId),
          id: obj.num,
          evoList: getValueOrDefault(Array, obj.evoList),
          tempEvo: getValueOrDefault(Array, obj.tempEvo),
          form: defaultForm,
        });
      }
      obj.evoList?.forEach((i) => {
        currEvoChain([i.evoToId], i.evoToForm, arr);
      });
      const curr = dataStore.pokemon.filter((item) =>
        item.evoList?.find((i) => obj.num === i.evoToId && isEqual(i.evoToForm, defaultForm))
      );
      if (isNotEmpty(curr)) {
        curr?.forEach((item) => prevEvoChain(item, defaultForm, arr, result));
      } else {
        result.push(arr);
      }
    },
    [currEvoChain, dataStore.pokemon]
  );

  const getEvoChain = useCallback(
    (id: number) => {
      const currentForm = form?.form.formName ? form.form.formName.replaceAll('-', '_').toUpperCase() : FORM_NORMAL;
      let curr = dataStore.pokemon.filter((item) => item.evoList?.find((i) => id === i.evoToId && isEqual(currentForm, i.evoToForm)));
      if (!isNotEmpty(curr)) {
        if (currentForm === FORM_NORMAL) {
          curr = dataStore.pokemon.filter((item) => id === item.num && isEqual(currentForm, item.forme));
        } else {
          curr = dataStore.pokemon.filter((item) => id === item.num && isInclude(item.forme, currentForm ?? FORM_NORMAL));
        }
      }
      if (!isNotEmpty(curr)) {
        curr = dataStore.pokemon.filter((item) => id === item.num && item.forme === FORM_NORMAL);
      }
      const result: IEvolution[][] = [];
      curr?.forEach((item) => prevEvoChain(item, currentForm ?? FORM_NORMAL, [], result));
      return result;
    },
    [prevEvoChain, form, dataStore.pokemon]
  );

  const searchStatsPoke = useCallback(
    (level: number) => {
      const arr: IQueryStatesEvoChain[][] = [];
      getEvoChain(id).forEach((item) => {
        const tempArr: IQueryStatesEvoChain[] = [];
        item.forEach((value) => {
          const data = queryStatesEvoChain(dataStore.options, dataStore.pokemon, value, level, ATKIv, DEFIv, STAIv);
          if (data.id === id) {
            setMaxCP(data.maxCP);
          }
          tempArr.push(data);
        });
        arr.push(tempArr.sort((a, b) => toNumber(a.maxCP) - toNumber(b.maxCP)));
      });
      setEvoChain(arr);
      let currBastStats: IBattleBaseStats | undefined;
      const evoBaseStats: IBattleBaseStats[] = [];
      arr.forEach((item) => {
        item.forEach((value) => {
          if (value.id !== id) {
            evoBaseStats.push(
              BattleBaseStats.create({
                ...Object.values(value.battleLeague).reduce((a: IBattleBaseStats, b: IBattleBaseStats) =>
                  !a ? b : !b ? a : toNumber(a.ratio) > toNumber(b.ratio) ? a : b
                ),
                id: value.id,
                name: value.name,
                form: value.form,
                maxCP: value.maxCP,
                league: Object.keys(value.battleLeague).reduce((a, b) =>
                  !(value.battleLeague as unknown as DynamicObj<IBattleBaseStats>)[a]
                    ? b
                    : !(value.battleLeague as unknown as DynamicObj<IBattleBaseStats>)[b]
                    ? a
                    : toNumber((value.battleLeague as unknown as DynamicObj<IBattleBaseStats>)[a]?.ratio) >
                      toNumber((value.battleLeague as unknown as DynamicObj<IBattleBaseStats>)[b]?.ratio)
                    ? a
                    : b
                ),
              })
            );
          } else {
            currBastStats = BattleBaseStats.create({
              ...Object.values(value.battleLeague).reduce((a, b) => (!a ? b : !b ? a : toNumber(a.ratio) > toNumber(b.ratio) ? a : b)),
              id: value.id,
              name: value.name,
              form: value.form,
              maxCP: value.maxCP,
              league: Object.keys(value.battleLeague).reduce((a, b) =>
                !(value.battleLeague as unknown as DynamicObj<IBattleBaseStats>)[a]
                  ? b
                  : !(value.battleLeague as unknown as DynamicObj<IBattleBaseStats>)[b]
                  ? a
                  : toNumber((value.battleLeague as unknown as DynamicObj<IBattleBaseStats>)[a]?.ratio) >
                    toNumber((value.battleLeague as unknown as DynamicObj<IBattleBaseStats>)[b]?.ratio)
                  ? a
                  : b
              ),
            });
          }
        });
      });
      if (currBastStats) {
        const ratio = toNumber(currBastStats.ratio);
        let bestLeague = evoBaseStats.filter((item) => toNumber(item.ratio) > ratio);
        bestLeague = bestLeague.filter(
          (item) =>
            (item.league === LeagueBattleType.Master && toNumber(item.CP) > BattleLeagueCPType.Ultra) ||
            (item.league === LeagueBattleType.Ultra && toNumber(item.CP) > BattleLeagueCPType.Great) ||
            (item.league === LeagueBattleType.Great && toNumber(item.CP) > BattleLeagueCPType.Little)
        );
        if (!isNotEmpty(bestLeague)) {
          bestLeague = evoBaseStats.filter((item) => toNumber(item.ratio) > ratio);
        }
        if (!isNotEmpty(bestLeague)) {
          dispatch(SpinnerActions.HideSpinner.create());
          return setBestInLeague([currBastStats]);
        }
        if (ratio >= 90) {
          bestLeague.push(currBastStats);
        }
        setBestInLeague(bestLeague.sort((a, b) => toNumber(a.maxCP) - toNumber(b.maxCP)));
        dispatch(SpinnerActions.HideSpinner.create());
      }
    },
    [dispatch, dataStore.options, ATKIv, DEFIv, STAIv, getEvoChain, id]
  );

  const onSearchStatsPoke = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (toNumber(searchCP) < MIN_CP) {
        return enqueueSnackbar(`Please input CP greater than or equal to ${MIN_CP}`, { variant: VariantType.Error });
      }
      dispatch(SpinnerActions.ShowSpinner.create());
      setTimeout(() => {
        const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
        processStatsPoke(result);
      }, 200);
    },
    [dispatch, searchStatsPoke, ATKIv, DEFIv, STAIv, enqueueSnackbar, name, searchCP, statATK, statDEF, statSTA, form]
  );

  const processStatsPoke = (result: StatsCalculate) => {
    if (result.level === 0) {
      dispatch(SpinnerActions.HideSpinner.create());
      return enqueueSnackbar(`At CP: ${result.CP} and IV ${result.IV.atk}/${result.IV.def}/${result.IV.sta} impossible found in ${name}`, {
        variant: VariantType.Error,
      });
    }
    setTimeout(() => {
      searchStatsPoke(result.level);
      enqueueSnackbar(
        `Search success at CP: ${result.CP} and IV ${result.IV.atk}/${result.IV.def}/${result.IV.sta} found in ${name} ${splitAndCapitalize(
          form?.form.formName,
          '-',
          ' '
        )}`,
        { variant: VariantType.Success }
      );
    }, 500);
  };

  const getCandyEvo = (item: IEvolution[], evoId: number, candy = 0): number => {
    if (evoId === id) {
      return candy;
    }
    const data = item.find((i) => i.evoList.find((e) => e.evoToId === evoId));
    if (!data) {
      return candy;
    }
    const prevEvo = data.evoList.find((e) => e.evoToId === evoId);
    if (!prevEvo) {
      return candy;
    }
    candy += prevEvo.candyCost;
    return getCandyEvo(item, data.id, candy);
  };

  const getTextColorRatio = (value: number | undefined) => {
    value = toNumber(value);
    return `rank-${value === 100 ? 'max' : value >= 90 ? 'excellent' : value >= 80 ? 'great' : value >= 70 ? 'nice' : 'normal'}`;
  };

  const LeaveToggle = (props: Toggle) => {
    const decoratedOnClick = useAccordionButton(props.eventKey);

    return (
      <div className="accordion-footer" onClick={decoratedOnClick}>
        <span className="text-danger">
          Close <CloseIcon sx={{ color: 'red' }} />
        </span>
      </div>
    );
  };

  const renderPokemon = (value: IBattleBaseStats | IQueryStatesEvoChain, className?: string, height = 100) => {
    const assets = findAssetForm(dataStore.assets, value.id, form?.form.formName);
    return (
      <img
        className={className}
        alt="pokemon-model"
        height={height}
        src={APIService.getPokemonModel(assets, value.id)}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, value.id, assets);
        }}
      />
    );
  };

  return (
    <div className="container">
      <Find
        isHide={true}
        clearStats={clearArrStats}
        setStatATK={setStatATK}
        setStatDEF={setStatDEF}
        setStatSTA={setStatSTA}
        setId={setId}
        setName={setName}
        setForm={setForm}
      />
      <h1 id="main" className="text-center">
        Search Battle Leagues Stats
      </h1>
      <form className="element-top" onSubmit={onSearchStatsPoke.bind(this)} style={{ paddingBottom: 15 }}>
        <div className="form-group d-flex justify-content-center text-center">
          <Box sx={{ width: '50%', minWidth: 350 }}>
            <div className="justify-content-center input-group mb-3">
              <DynamicInputCP
                statATK={statATK}
                statDEF={statDEF}
                statSTA={statSTA}
                ivAtk={ATKIv}
                ivDef={DEFIv}
                ivSta={STAIv}
                searchCP={searchCP}
                setSearchCP={setSearchCP}
                label="Input CP"
                width="50%"
                minWidth={350}
              />
            </div>
          </Box>
        </div>
        <div className="form-group d-flex justify-content-center text-center">
          <Box sx={{ width: '50%', minWidth: 300 }}>
            <div className="d-flex justify-content-between">
              <b>ATK</b>
              <b>{ATKIv}</b>
            </div>
            <PokeGoSlider
              value={ATKIv}
              aria-label="ATK marks"
              defaultValue={MIN_IV}
              min={MIN_IV}
              max={MAX_IV}
              step={1}
              valueLabelDisplay="auto"
              marks={marks}
              onChange={(_, v) => {
                setSearchCP('');
                setATKIv(v as number);
              }}
            />
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
              onChange={(_, v) => {
                setSearchCP('');
                setDEFIv(v as number);
              }}
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
              onChange={(_, v) => {
                setSearchCP('');
                setSTAIv(v as number);
              }}
            />
          </Box>
        </div>
        <div className="form-group d-flex justify-content-center text-center element-top">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>
      <Fragment>
        {isNotEmpty(evoChain) && isNotEmpty(bestInLeague) && (
          <div className="text-center">
            <div>
              <h4 className="text-decoration-underline">Recommend Battle League</h4>
              {bestInLeague.map((value, index) => (
                <Link
                  to={`/pokemon/${value.id}${generateParamForm(value.form)}`}
                  className="d-inline-block contain-poke-best-league border-best-poke"
                  key={index}
                  title={`#${value.id} ${splitAndCapitalize(value.name, '_', ' ')}`}
                >
                  <div className="d-flex align-items-center h-100">
                    <div className="border-best-poke h-100">
                      {renderPokemon(value, 'poke-best-league', 102)}
                      <span className="caption text-black border-best-poke best-name">
                        <b>
                          #{value.id} {splitAndCapitalize(value.name, '_', ' ')} {splitAndCapitalize(form?.form.formName, '-', ' ')}
                        </b>
                      </span>
                    </div>
                    <div className={combineClasses('border-best-poke', getTextColorRatio(value.ratio))}>
                      <div className="best-poke-desc border-best-poke">
                        <img
                          alt="pokemon-model"
                          height={32}
                          src={
                            value.league === LeagueBattleType.Little
                              ? getPokemonBattleLeagueIcon(BattleLeagueCPType.Little)
                              : value.league === LeagueBattleType.Great
                              ? getPokemonBattleLeagueIcon(BattleLeagueCPType.Great)
                              : value.league === LeagueBattleType.Ultra
                              ? getPokemonBattleLeagueIcon(BattleLeagueCPType.Ultra)
                              : getPokemonBattleLeagueIcon()
                          }
                        />
                        <div>
                          <b>{toFloatWithPadding(value.ratio, 2)}</b>
                        </div>
                        <span className="caption">CP: {value.CP}</span>
                      </div>
                      <span className="caption text-black border-best-poke">
                        <b>#{value.rank}</b>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {evoChain.map((value, index) => (
              <Accordion key={index} style={{ marginTop: '3%', marginBottom: '5%', paddingBottom: 15 }}>
                <div className="form-header">
                  {!value.at(0)?.form ? capitalize(FORM_NORMAL) : splitAndCapitalize(value.at(0)?.form, '-', ' ')}
                  {' Form'}
                </div>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    <b>More information</b>
                  </Accordion.Header>
                  <Accordion.Body style={{ padding: 0 }}>
                    <div className="sub-body">
                      <div className="row justify-content-center league-info-content" style={{ margin: 0 }}>
                        {value.map((item, index) => (
                          <div className="col d-inline-block evo-item-desc justify-content-center" key={index} style={{ padding: 0 }}>
                            <div className="pokemon-best-league">
                              <Link
                                to={`/pokemon/${item.id}${generateParamForm(item.form)}`}
                                title={`#${item.id} ${splitAndCapitalize(item.name, '_', ' ')}`}
                              >
                                <Badge color="primary" overlap="circular" badgeContent={index + 1}>
                                  {renderPokemon(item)}
                                </Badge>
                                <div>
                                  <b>
                                    {`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), '_', ' ')} `}
                                    {splitAndCapitalize(form?.form.formName, '-', ' ')}
                                  </b>
                                </div>
                              </Link>
                            </div>
                            {toNumber(item.maxCP) < maxCP ? (
                              <div className="text-danger">
                                <b>
                                  <CloseIcon sx={{ color: 'red' }} /> Not Elidge
                                </b>
                              </div>
                            ) : (
                              <Fragment>
                                <hr />
                                <div className="element-top d-flex justify-content-center" style={{ textAlign: 'start' }}>
                                  {item.battleLeague.little.rank ? (
                                    <ul className="list-best-league">
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Little)} />
                                        <b>{` ${getPokemonBattleLeagueName(BattleLeagueCPType.Little)}`}</b>
                                      </h6>
                                      <li>
                                        Rank: <b>#{item.battleLeague.little.rank}</b>
                                      </li>
                                      <li>CP: {item.battleLeague.little.CP}</li>
                                      <li>Level: {item.battleLeague.little.level}</li>
                                      <li>
                                        {'Stats Prod (%): '}
                                        <span
                                          style={{ backgroundColor: 'transparent' }}
                                          className={getTextColorRatio(item.battleLeague.little.ratio)}
                                        >
                                          <b>{toFloatWithPadding(item.battleLeague.little.ratio, 2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <Candy id={item.id} style={{ marginRight: 5 }} />
                                          <span className="d-flex align-items-center" style={{ marginRight: 5 }}>
                                            {toNumber(item.battleLeague.little.resultBetweenCandy) + getCandyEvo(value, item.id)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id)})</span>
                                          </span>
                                          <CandyXL id={id} />
                                          {item.battleLeague.little.resultBetweenXLCandy}
                                        </span>
                                      </li>
                                      <li>
                                        <img
                                          style={{ marginRight: 5 }}
                                          alt="img-stardust"
                                          height={20}
                                          src={APIService.getItemSprite('stardust_painted')}
                                        />
                                        {` ${item.battleLeague.little.resultBetweenStardust}`}
                                      </li>
                                    </ul>
                                  ) : (
                                    <div>
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Little)} />
                                        <b>{` ${getPokemonBattleLeagueName(BattleLeagueCPType.Little)}`}</b>
                                      </h6>
                                      <b style={{ padding: '1rem' }} className="text-danger">
                                        <CloseIcon sx={{ color: 'red' }} /> Not Elidge
                                      </b>
                                    </div>
                                  )}
                                </div>
                                <div className="element-top d-flex justify-content-center" style={{ textAlign: 'start' }}>
                                  {item.battleLeague.great.rank ? (
                                    <ul className="list-best-league">
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Great)} />
                                        <b>{` ${getPokemonBattleLeagueName(BattleLeagueCPType.Great)}`}</b>
                                      </h6>
                                      <li>
                                        Rank: <b>#{item.battleLeague.great.rank}</b>
                                      </li>
                                      <li>CP: {item.battleLeague.great.CP}</li>
                                      <li>Level: {item.battleLeague.great.level}</li>
                                      <li>
                                        {'Stats Prod (%): '}
                                        <span
                                          style={{ backgroundColor: 'transparent' }}
                                          className={getTextColorRatio(item.battleLeague.great.ratio)}
                                        >
                                          <b>{toFloatWithPadding(item.battleLeague.great.ratio, 2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <Candy id={item.id} style={{ marginRight: 5 }} />
                                          <span className="d-flex align-items-center">
                                            {toNumber(item.battleLeague.great.resultBetweenCandy) + getCandyEvo(value, item.id)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id)})</span>
                                          </span>
                                          <CandyXL id={id} />
                                          {item.battleLeague.great.resultBetweenXLCandy}
                                        </span>
                                      </li>
                                      <li>
                                        <img
                                          style={{ marginRight: 5 }}
                                          alt="img-stardust"
                                          height={20}
                                          src={APIService.getItemSprite('stardust_painted')}
                                        />
                                        {` ${item.battleLeague.great.resultBetweenStardust}`}
                                      </li>
                                    </ul>
                                  ) : (
                                    <div>
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Great)} />
                                        <b>{` ${getPokemonBattleLeagueName(BattleLeagueCPType.Great)}`}</b>
                                      </h6>
                                      <b style={{ padding: '1rem' }} className="text-danger">
                                        <CloseIcon sx={{ color: 'red' }} /> Not Elidge
                                      </b>
                                    </div>
                                  )}
                                </div>
                                <div className="element-top d-flex justify-content-center" style={{ textAlign: 'start' }}>
                                  {item.battleLeague.ultra.rank ? (
                                    <ul className="list-best-league">
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Ultra)} />
                                        <b>{` ${getPokemonBattleLeagueName(BattleLeagueCPType.Ultra)}`}</b>
                                      </h6>
                                      <li>
                                        Rank: <b>#{item.battleLeague.ultra.rank}</b>
                                      </li>
                                      <li>CP: {item.battleLeague.ultra.CP}</li>
                                      <li>Level: {item.battleLeague.ultra.level}</li>
                                      <li>
                                        {'Stats Prod (%): '}
                                        <span
                                          style={{ backgroundColor: 'transparent' }}
                                          className={getTextColorRatio(item.battleLeague.ultra.ratio)}
                                        >
                                          <b>{toFloatWithPadding(item.battleLeague.ultra.ratio, 2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <Candy id={item.id} style={{ marginRight: 5 }} />
                                          <span className="d-flex align-items-center">
                                            {toNumber(item.battleLeague.ultra.resultBetweenCandy) + getCandyEvo(value, item.id)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id)})</span>
                                          </span>
                                          <CandyXL id={id} />
                                          {item.battleLeague.ultra.resultBetweenXLCandy}
                                        </span>
                                      </li>
                                      <li>
                                        <img
                                          style={{ marginRight: 5 }}
                                          alt="img-stardust"
                                          height={20}
                                          src={APIService.getItemSprite('stardust_painted')}
                                        />
                                        {` ${item.battleLeague.ultra.resultBetweenStardust}`}
                                      </li>
                                    </ul>
                                  ) : (
                                    <div>
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Ultra)} />
                                        <b>{` ${getPokemonBattleLeagueName(BattleLeagueCPType.Ultra)}`}</b>
                                      </h6>
                                      <b style={{ padding: '1rem' }} className="text-danger">
                                        <CloseIcon sx={{ color: 'red' }} /> Not Elidge
                                      </b>
                                    </div>
                                  )}
                                </div>
                                <div className="element-top d-flex justify-content-center" style={{ textAlign: 'start' }}>
                                  {item.battleLeague.master.rank ? (
                                    <ul className="list-best-league">
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={getPokemonBattleLeagueIcon()} />
                                        <b>{` ${getPokemonBattleLeagueName()}`}</b>
                                      </h6>
                                      <li>
                                        Rank: <b>#{item.battleLeague.master.rank}</b>
                                      </li>
                                      <li>CP: {item.battleLeague.master.CP}</li>
                                      <li>Level: {item.battleLeague.master.level}</li>
                                      <li>
                                        {'Stats Prod (%): '}
                                        <span
                                          style={{ backgroundColor: 'transparent' }}
                                          className={getTextColorRatio(item.battleLeague.master.ratio)}
                                        >
                                          <b>{toFloatWithPadding(item.battleLeague.master.ratio, 2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <Candy id={item.id} style={{ marginRight: 5 }} />
                                          <span className="d-flex align-items-center">
                                            {toNumber(item.battleLeague.master.resultBetweenCandy) + getCandyEvo(value, item.id)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id)})</span>
                                          </span>
                                          <CandyXL id={id} />
                                          {item.battleLeague.master.resultBetweenXLCandy}
                                        </span>
                                      </li>
                                      <li>
                                        <img
                                          style={{ marginRight: 5 }}
                                          alt="img-stardust"
                                          height={20}
                                          src={APIService.getItemSprite('stardust_painted')}
                                        />
                                        {` ${item.battleLeague.master.resultBetweenStardust}`}
                                      </li>
                                    </ul>
                                  ) : (
                                    <div>
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={getPokemonBattleLeagueIcon()} />
                                        <b>{` ${getPokemonBattleLeagueName()}`}</b>
                                      </h6>
                                      <b style={{ padding: '1rem' }} className="text-danger">
                                        <CloseIcon sx={{ color: 'red' }} /> Not Elidge
                                      </b>
                                    </div>
                                  )}
                                </div>
                              </Fragment>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <LeaveToggle eventKey={index.toString()} />
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            ))}
          </div>
        )}
      </Fragment>
    </div>
  );
};

export default FindBattle;
