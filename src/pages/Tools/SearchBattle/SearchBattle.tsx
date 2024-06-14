import React, { Fragment, useCallback, useState } from 'react';
import Find from '../../../components/Find/Find';

import { Badge, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import './SearchBattle.scss';
import APIService from '../../../services/API.service';

import { capitalize, splitAndCapitalize } from '../../../util/Utils';
import { calculateStats, queryStatesEvoChain } from '../../../util/Calculate';

import { Accordion, useAccordionButton } from 'react-bootstrap';
import { useSnackbar } from 'notistack';

import { Link } from 'react-router-dom';
import { marks, PokeGoSlider } from '../../../util/Utils';
import { useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../../store/actions/spinner.action';
import Candy from '../../../components/Sprites/Candy/Candy';
import CandyXL from '../../../components/Sprites/Candy/CandyXL';
import { SearchingState, StoreState } from '../../../store/models/state.model';
import { MIN_IV, MAX_IV, FORM_NORMAL, FORM_GALARIAN, FORM_HISUIAN } from '../../../util/Constants';
import { EvolutionModel } from '../../../core/models/evolution.model';
import { PokemonFormModify } from '../../../core/models/API/form.model';
import { BattleBaseStats, QueryStatesEvoChain } from '../../../util/models/calculate.model';
import FreeSoloInput from '../../../components/Input/FreeSoloInput';
import { PokemonDataModel } from '../../../core/models/pokemon.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';

const FindBattle = () => {
  useChangeTitle('Search Battle Leagues Stats - Tool');
  const dispatch = useDispatch();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);

  const [id, setId] = useState(searching ? searching.id : 1);
  const [name, setName] = useState(splitAndCapitalize(searching?.fullName, '-', ' '));
  const [form, setForm]: [PokemonFormModify | undefined, React.Dispatch<React.SetStateAction<PokemonFormModify | undefined>>] = useState();
  const [maxCP, setMaxCP] = useState(0);

  const [searchCP, setSearchCP] = useState('');

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [ATKIv, setATKIv] = useState(0);
  const [DEFIv, setDEFIv] = useState(0);
  const [STAIv, setSTAIv] = useState(0);

  const [evoChain, setEvoChain]: [QueryStatesEvoChain[][], React.Dispatch<React.SetStateAction<QueryStatesEvoChain[][]>>] = useState(
    [] as QueryStatesEvoChain[][]
  );
  const [bestInLeague, setBestInLeague]: [BattleBaseStats[], React.Dispatch<React.SetStateAction<BattleBaseStats[]>>] = useState(
    [] as BattleBaseStats[]
  );

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
    (currId: number[] | undefined, form: string, arr: EvolutionModel[]) => {
      form = form.replace(FORM_GALARIAN, 'GALAR').replace(FORM_HISUIAN, 'HISUI');
      if (currId?.length === 0) {
        return arr;
      }
      let curr;
      if (form === FORM_NORMAL) {
        curr = dataStore?.pokemon?.find((item) => currId?.includes(item.num) && form === item.forme);
      } else {
        curr = dataStore?.pokemon?.find((item) => currId?.includes(item.num) && item.forme?.includes(form));
      }
      if (!arr.map((i) => i.id).includes(curr?.num ?? 0)) {
        arr.push({
          ...curr,
          form,
          id: curr?.num ?? 0,
          name: curr?.pokemonId ?? '',
          evoList: curr?.evoList ?? [],
          tempEvo: curr?.tempEvo ?? [],
          canPurified: curr?.isShadow ?? false,
        });
      }
      currEvoChain(
        curr?.evoList?.map((i) => i.evoToId),
        form,
        arr
      );
    },
    [dataStore?.pokemon]
  );

  const prevEvoChain = useCallback(
    (obj: PokemonDataModel, defaultForm: string, arr: EvolutionModel[], result: EvolutionModel[][]) => {
      if (!arr.map((i) => i.id).includes(obj.num)) {
        arr.push({
          ...obj,
          name: obj.pokemonId ?? '',
          id: obj.num,
          evoList: obj.evoList ?? [],
          tempEvo: obj.tempEvo ?? [],
          form: defaultForm,
        });
      }
      obj.evoList?.forEach((i) => {
        currEvoChain([i.evoToId], i.evoToForm, arr);
      });
      const curr = dataStore?.pokemon?.filter((item) => item.evoList?.find((i) => obj.num === i.evoToId && i.evoToForm === defaultForm));
      if (curr && curr.length >= 1) {
        curr?.forEach((item) => prevEvoChain(item, defaultForm, arr, result));
      } else {
        result.push(arr);
      }
    },
    [currEvoChain, dataStore?.pokemon]
  );

  const getEvoChain = useCallback(
    (id: number) => {
      const isForm = form?.form.form_name?.toUpperCase() === '' ? FORM_NORMAL : form?.form.form_name.replaceAll('-', '_').toUpperCase();
      let curr = dataStore?.pokemon?.filter((item) => item.evoList?.find((i) => id === i.evoToId && isForm === i.evoToForm));
      if (curr?.length === 0) {
        if (isForm === FORM_NORMAL) {
          curr = dataStore?.pokemon?.filter((item) => id === item.num && isForm === item.forme);
        } else {
          curr = dataStore?.pokemon?.filter((item) => id === item.num && item.forme?.includes(isForm ?? FORM_NORMAL));
        }
      }
      if (curr?.length === 0) {
        curr = dataStore?.pokemon?.filter((item) => id === item.num && item.forme === FORM_NORMAL);
      }
      const result: EvolutionModel[][] = [];
      curr?.forEach((item) => prevEvoChain(item, isForm ?? FORM_NORMAL, [], result));
      return result;
    },
    [prevEvoChain, form, dataStore?.pokemon]
  );

  const searchStatsPoke = useCallback(
    (level: number) => {
      const arr: QueryStatesEvoChain[][] = [];
      getEvoChain(id)?.forEach((item) => {
        const tempArr: QueryStatesEvoChain[] = [];
        item.forEach((value) => {
          const data = queryStatesEvoChain(dataStore?.options, dataStore?.pokemon ?? [], value, level, ATKIv, DEFIv, STAIv);
          if (data.id === id) {
            setMaxCP(data.maxCP);
          }
          tempArr.push(data);
        });
        arr.push(tempArr.sort((a, b) => a.maxCP - b.maxCP));
      });
      setEvoChain(arr);
      let currBastStats: BattleBaseStats | undefined;
      const evoBaseStats: BattleBaseStats[] = [];
      arr.forEach((item) => {
        item.forEach((value) => {
          if (value.id !== id) {
            evoBaseStats.push({
              ...Object.values(value.battleLeague).reduce((a, b) => (!a ? b : !b ? a : (a.ratio ?? 0) > (b.ratio ?? 0) ? a : b)),
              id: value.id,
              name: value.name,
              form: value.form,
              maxCP: value.maxCP,
              league: Object.keys(value.battleLeague).reduce((a, b) =>
                !value.battleLeague[a]
                  ? b
                  : !value.battleLeague[b]
                  ? a
                  : (value.battleLeague[a]?.ratio ?? 0) > (value.battleLeague[b]?.ratio ?? 0)
                  ? a
                  : b
              ),
            });
          } else {
            currBastStats = {
              ...Object.values(value.battleLeague).reduce((a, b) => (!a ? b : !b ? a : (a.ratio ?? 0) > (b.ratio ?? 0) ? a : b)),
              id: value.id,
              name: value.name,
              form: value.form,
              maxCP: value.maxCP,
              league: Object.keys(value.battleLeague).reduce((a, b) =>
                !value.battleLeague[a]
                  ? b
                  : !value.battleLeague[b]
                  ? a
                  : (value.battleLeague[a]?.ratio ?? 0) > (value.battleLeague[b]?.ratio ?? 0)
                  ? a
                  : b
              ),
            };
          }
        });
      });
      if (currBastStats) {
        let bestLeague = evoBaseStats.filter((item) => (item.ratio ?? 0) > (currBastStats?.ratio ?? 0));
        bestLeague = bestLeague.filter(
          (item) =>
            (item.league === 'master' && (item.CP ?? 0) > 2500) ||
            (item.league === 'ultra' && (item.CP ?? 0) > 1500) ||
            (item.league === 'great' && (item.CP ?? 0) > 500)
        );
        if (bestLeague.length === 0) {
          bestLeague = evoBaseStats.filter((item) => (item.ratio ?? 0) > (currBastStats?.ratio ?? 0));
        }
        if (bestLeague.length === 0) {
          dispatch(hideSpinner());
          return setBestInLeague([currBastStats]);
        }
        if ((currBastStats.ratio ?? 0) >= 90) {
          bestLeague.push(currBastStats);
        }
        setBestInLeague(bestLeague.sort((a, b) => a.maxCP - b.maxCP));
        dispatch(hideSpinner());
      }
    },
    [dispatch, dataStore?.options, ATKIv, DEFIv, STAIv, getEvoChain, id]
  );

  const onSearchStatsPoke = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      if (!searchCP || parseInt(searchCP) < 10) {
        return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
      }
      const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
      if (!result.level) {
        return enqueueSnackbar(
          'At CP: ' + result.CP + ' and IV ' + result.IV.atk + '/' + result.IV.def + '/' + result.IV.sta + ' impossible found in ' + name,
          { variant: 'error' }
        );
      }
      dispatch(showSpinner());
      enqueueSnackbar(
        'Search success at CP: ' +
          result.CP +
          ' and IV ' +
          result.IV.atk +
          '/' +
          result.IV.def +
          '/' +
          result.IV.sta +
          ' found in ' +
          name +
          ' ' +
          splitAndCapitalize(form?.form.form_name, '-', ' '),
        { variant: 'success' }
      );
      setTimeout(() => {
        searchStatsPoke(result.level);
      }, 500);
    },
    [dispatch, searchStatsPoke, ATKIv, DEFIv, STAIv, enqueueSnackbar, name, searchCP, statATK, statDEF, statSTA, form]
  );

  const getImageList = (id: number) => {
    const isForm = form?.form.form_name?.toUpperCase() === '' ? FORM_NORMAL : form?.form.form_name.replaceAll('-', '_').toUpperCase();
    let img = dataStore?.assets?.find((item) => item.id === id)?.image.find((item) => item.form?.includes(isForm ?? FORM_NORMAL));
    if (!img) {
      img = dataStore?.assets?.find((item) => item.id === id)?.image.at(0);
    }
    return img?.default;
  };

  const getCandyEvo = (item: EvolutionModel[], evoId: number, candy: number): number => {
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

  const getTextColorRatio = (value: number) => {
    value = parseFloat(value.toFixed(2));
    return 'rank-' + (value === 100 ? 'max' : value >= 90 ? 'excellent' : value >= 80 ? 'great' : value >= 70 ? 'nice' : 'normal');
  };

  const LeaveToggle = ({ eventKey }: any) => {
    const decoratedOnClick = useAccordionButton(eventKey, () => <></>);

    return (
      <div className="accordion-footer" onClick={decoratedOnClick}>
        <span className="text-danger">
          Close <CloseIcon sx={{ color: 'red' }} />
        </span>
      </div>
    );
  };

  return (
    <div className="container">
      <Find
        hide={true}
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
              <FreeSoloInput
                statATK={statATK}
                statDEF={statDEF}
                statSTA={statSTA}
                IV_ATK={ATKIv}
                IV_DEF={DEFIv}
                IV_STA={STAIv}
                searchCP={searchCP}
                setSearchCP={setSearchCP}
                label={'Input CP'}
                width={'50%'}
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
              onChange={(_, v) => setATKIv(v as number)}
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
          </Box>
        </div>
        <div className="form-group d-flex justify-content-center text-center element-top">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>
      <Fragment>
        {evoChain.length > 0 && bestInLeague.length > 0 && (
          <div className="text-center">
            <div>
              <h4 className="text-decoration-underline">Recommend Battle League</h4>
              {bestInLeague.map((value, index) => (
                <Link
                  to={`/pokemon/${value.id}${value.form ? `?form=${value.form.toLowerCase().replaceAll('_', '-')}` : ''}`}
                  className="d-inline-block contain-poke-best-league border-best-poke"
                  key={index}
                  title={`#${value.id} ${splitAndCapitalize(value.name, '_', ' ')}`}
                >
                  <div className="d-flex align-items-center h-100">
                    <div className="border-best-poke h-100">
                      <img
                        className="poke-best-league"
                        alt="pokemon-model"
                        height={102}
                        src={
                          getImageList(value.id)
                            ? APIService.getPokemonModel(getImageList(value.id) ?? null)
                            : APIService.getPokeFullSprite(value.id)
                        }
                      />
                      <span className="caption text-black border-best-poke best-name">
                        <b>
                          #{value.id} {splitAndCapitalize(value.name, '_', ' ')} {splitAndCapitalize(form?.form.form_name, '-', ' ')}
                        </b>
                      </span>
                    </div>
                    <div className={'border-best-poke ' + getTextColorRatio(value.ratio ?? 0)}>
                      <div className="best-poke-desc border-best-poke">
                        <img
                          alt="pokemon-model"
                          height={32}
                          src={
                            value.league === 'little'
                              ? APIService.getPokeOtherLeague('GBL_littlecup')
                              : value.league === 'great'
                              ? APIService.getPokeLeague('great_league')
                              : value.league === 'ultra'
                              ? APIService.getPokeLeague('ultra_league')
                              : APIService.getPokeLeague('master_league')
                          }
                        />
                        <div>
                          <b>{value.ratio?.toFixed(2)}</b>
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
                  {!value.at(0)?.form?.toUpperCase() ? capitalize(FORM_NORMAL) : splitAndCapitalize(value.at(0)?.form, '-', ' ')}
                  {' Form'}
                </div>
                <Accordion.Item eventKey={'0'}>
                  <Accordion.Header>
                    <b>More information</b>
                  </Accordion.Header>
                  <Accordion.Body style={{ padding: 0 }}>
                    <div className="sub-body">
                      <div className="row justify-content-center league-info-content" style={{ margin: 0 }}>
                        {value.map((item, index) => (
                          <div className="col d-inline-block evo-item-desc justify-content-center" key={index} style={{ padding: 0 }}>
                            <Link
                              to={`/pokemon/${item.id}${item.form ? `?form=${item.form.toLowerCase().replaceAll('_', '-')}` : ''}`}
                              title={`#${item.id} ${splitAndCapitalize(item.name, '_', ' ')}`}
                            >
                              <Badge color="primary" overlap="circular" badgeContent={index + 1}>
                                <img
                                  alt="pokemon-model"
                                  height={100}
                                  src={
                                    getImageList(item.id)
                                      ? APIService.getPokemonModel(getImageList(item.id) ?? null)
                                      : APIService.getPokeFullSprite(item.id)
                                  }
                                />
                              </Badge>
                              <div>
                                <b>
                                  #{item.id} {splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}{' '}
                                  {splitAndCapitalize(form?.form.form_name, '-', ' ')}
                                </b>
                              </div>
                            </Link>
                            {item.maxCP < maxCP ? (
                              <div className="text-danger">
                                <b>
                                  <CloseIcon sx={{ color: 'red' }} /> Not Elidge
                                </b>
                              </div>
                            ) : (
                              <Fragment>
                                <hr />
                                <div className="element-top d-flex justify-content-center" style={{ textAlign: 'start' }}>
                                  {item.battleLeague.little ? (
                                    <ul className="list-best-league">
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={APIService.getPokeOtherLeague('GBL_littlecup')} />{' '}
                                        <b>Little Cup</b>
                                      </h6>
                                      <li>
                                        Rank: <b>#{item.battleLeague.little.rank}</b>
                                      </li>
                                      <li>CP: {item.battleLeague.little.CP}</li>
                                      <li>Level: {item.battleLeague.little.level}</li>
                                      <li>
                                        Stats Prod (%):{' '}
                                        <span
                                          style={{ backgroundColor: 'transparent' }}
                                          className={getTextColorRatio(item.battleLeague.little.ratio ?? 0)}
                                        >
                                          <b>{item.battleLeague.little.ratio?.toFixed(2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <Candy id={item.id} style={{ marginRight: 5 }} />
                                          <span className="d-flex align-items-center" style={{ marginRight: 5 }}>
                                            {(item.battleLeague.little.result_between_candy ?? 0) + getCandyEvo(value, item.id, 0)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id, 0)})</span>
                                          </span>
                                          <CandyXL id={id} />
                                          {item.battleLeague.little.result_between_xl_candy}
                                        </span>
                                      </li>
                                      <li>
                                        <img
                                          style={{ marginRight: 5 }}
                                          alt="img-stardust"
                                          height={20}
                                          src={APIService.getItemSprite('stardust_painted')}
                                        />{' '}
                                        {item.battleLeague.little.result_between_stadust}
                                      </li>
                                    </ul>
                                  ) : (
                                    <div>
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={APIService.getPokeOtherLeague('GBL_littlecup')} />{' '}
                                        <b>Little Cup</b>
                                      </h6>
                                      <b style={{ padding: '1rem' }} className="text-danger">
                                        <CloseIcon sx={{ color: 'red' }} /> Not Elidge
                                      </b>
                                    </div>
                                  )}
                                </div>
                                <div className="element-top d-flex justify-content-center" style={{ textAlign: 'start' }}>
                                  {item.battleLeague.great ? (
                                    <ul className="list-best-league">
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={APIService.getPokeLeague('great_league')} />{' '}
                                        <b>Great League</b>
                                      </h6>
                                      <li>
                                        Rank: <b>#{item.battleLeague.great.rank}</b>
                                      </li>
                                      <li>CP: {item.battleLeague.great.CP}</li>
                                      <li>Level: {item.battleLeague.great.level}</li>
                                      <li>
                                        Stats Prod (%):{' '}
                                        <span
                                          style={{ backgroundColor: 'transparent' }}
                                          className={getTextColorRatio(item.battleLeague.great.ratio ?? 0)}
                                        >
                                          <b>{item.battleLeague.great.ratio?.toFixed(2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <Candy id={item.id} style={{ marginRight: 5 }} />
                                          <span className="d-flex align-items-center">
                                            {(item.battleLeague.great.result_between_candy ?? 0) + getCandyEvo(value, item.id, 0)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id, 0)})</span>
                                          </span>
                                          <CandyXL id={id} />
                                          {item.battleLeague.great.result_between_xl_candy}
                                        </span>
                                      </li>
                                      <li>
                                        <img
                                          style={{ marginRight: 5 }}
                                          alt="img-stardust"
                                          height={20}
                                          src={APIService.getItemSprite('stardust_painted')}
                                        />{' '}
                                        {item.battleLeague.great.result_between_stadust}
                                      </li>
                                    </ul>
                                  ) : (
                                    <div>
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={APIService.getPokeLeague('great_league')} />{' '}
                                        <b>Little Cup</b>
                                      </h6>
                                      <b style={{ padding: '1rem' }} className="text-danger">
                                        <CloseIcon sx={{ color: 'red' }} /> Not Elidge
                                      </b>
                                    </div>
                                  )}
                                </div>
                                <div className="element-top d-flex justify-content-center" style={{ textAlign: 'start' }}>
                                  {item.battleLeague.ultra ? (
                                    <ul className="list-best-league">
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={APIService.getPokeLeague('ultra_league')} />{' '}
                                        <b>Ultra League</b>
                                      </h6>
                                      <li>
                                        Rank: <b>#{item.battleLeague.ultra.rank}</b>
                                      </li>
                                      <li>CP: {item.battleLeague.ultra.CP}</li>
                                      <li>Level: {item.battleLeague.ultra.level}</li>
                                      <li>
                                        Stats Prod (%):{' '}
                                        <span
                                          style={{ backgroundColor: 'transparent' }}
                                          className={getTextColorRatio(item.battleLeague.ultra.ratio ?? 0)}
                                        >
                                          <b>{item.battleLeague.ultra.ratio?.toFixed(2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <Candy id={item.id} style={{ marginRight: 5 }} />
                                          <span className="d-flex align-items-center">
                                            {(item.battleLeague.ultra.result_between_candy ?? 0) + getCandyEvo(value, item.id, 0)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id, 0)})</span>
                                          </span>
                                          <CandyXL id={id} />
                                          {item.battleLeague.ultra.result_between_xl_candy}
                                        </span>
                                      </li>
                                      <li>
                                        <img
                                          style={{ marginRight: 5 }}
                                          alt="img-stardust"
                                          height={20}
                                          src={APIService.getItemSprite('stardust_painted')}
                                        />{' '}
                                        {item.battleLeague.ultra.result_between_stadust}
                                      </li>
                                    </ul>
                                  ) : (
                                    <div>
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={APIService.getPokeLeague('ultra_league')} />{' '}
                                        <b>Little Cup</b>
                                      </h6>
                                      <b style={{ padding: '1rem' }} className="text-danger">
                                        <CloseIcon sx={{ color: 'red' }} /> Not Elidge
                                      </b>
                                    </div>
                                  )}
                                </div>
                                <div className="element-top d-flex justify-content-center" style={{ textAlign: 'start' }}>
                                  {item.battleLeague.master ? (
                                    <ul className="list-best-league">
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={APIService.getPokeLeague('master_league')} />{' '}
                                        <b>Master League</b>
                                      </h6>
                                      <li>
                                        Rank: <b>#{item.battleLeague.master.rank}</b>
                                      </li>
                                      <li>CP: {item.battleLeague.master.CP}</li>
                                      <li>Level: {item.battleLeague.master.level}</li>
                                      <li>
                                        Stats Prod (%):{' '}
                                        <span
                                          style={{ backgroundColor: 'transparent' }}
                                          className={getTextColorRatio(item.battleLeague.master.ratio ?? 0)}
                                        >
                                          <b>{item.battleLeague.master.ratio?.toFixed(2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <Candy id={item.id} style={{ marginRight: 5 }} />
                                          <span className="d-flex align-items-center">
                                            {(item.battleLeague.master.result_between_candy ?? 0) + getCandyEvo(value, item.id, 0)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id, 0)})</span>
                                          </span>
                                          <CandyXL id={id} />
                                          {item.battleLeague.master.result_between_xl_candy}
                                        </span>
                                      </li>
                                      <li>
                                        <img
                                          style={{ marginRight: 5 }}
                                          alt="img-stardust"
                                          height={20}
                                          src={APIService.getItemSprite('stardust_painted')}
                                        />{' '}
                                        {item.battleLeague.master.result_between_stadust}
                                      </li>
                                    </ul>
                                  ) : (
                                    <div>
                                      <h6>
                                        <img alt="pokemon-model" height={32} src={APIService.getPokeLeague('master_league')} />{' '}
                                        <b>Little Cup</b>
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
