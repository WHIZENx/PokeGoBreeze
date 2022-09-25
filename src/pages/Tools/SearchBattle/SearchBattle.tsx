import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Find from '../../../components/Select/Find/Find';

import { Badge, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import './SearchBattle.css';
import APIService from '../../../services/API.service';

import { splitAndCapitalize } from '../../../util/Utils';
import { computeCandyBgColor, computeCandyColor } from '../../../util/Compute';
import { calculateStats, queryStatesEvoChain } from '../../../util/Calculate';

import { Accordion, useAccordionButton } from 'react-bootstrap';
import { useSnackbar } from 'notistack';

import { Link } from 'react-router-dom';
import { marks, PokeGoSlider } from '../../../util/Utils';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../../store/actions/spinner.action';

const FindBattle = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: RootStateOrAny) => state.store.data);

  const [id, setId] = useState(1);
  const [name, setName] = useState('Bulbasaur');
  const [form, setForm]: any = useState(null);
  const [maxCP, setMaxCP] = useState(0);

  const [searchCP, setSearchCP]: any = useState('');

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [ATKIv, setATKIv]: any = useState(0);
  const [DEFIv, setDEFIv]: any = useState(0);
  const [STAIv, setSTAIv]: any = useState(0);

  const [evoChain, setEvoChain]: any = useState([]);
  const [bestInLeague, setBestInLeague]: any = useState([]);

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
    (currId: any, form: string, arr: any): void => {
      if (form === 'GALARIAN') form = 'GALAR';
      if (currId.length === 0) return arr;
      let curr;
      if (form === '') curr = dataStore.evolution.find((item: { id: any; form: any }) => currId.includes(item.id) && form === item.form);
      else
        curr = dataStore.evolution.find((item: { id: any; form: string | any[] }) => currId.includes(item.id) && item.form.includes(form));
      if (!arr.map((i: { id: any }) => i.id).includes(curr.id)) arr.push({ ...curr, form });
      return currEvoChain(
        curr.evo_list.map((i: { evo_to_id: any }) => i.evo_to_id),
        form,
        arr
      );
    },
    [dataStore.evolution]
  );

  const prevEvoChain = useCallback(
    (obj: { id: any; evo_list: any[] }, defaultForm: any, arr: any[]): any => {
      if (!arr.map((i: { id: any }) => i.id).includes(obj.id)) arr.push({ ...obj, form: defaultForm });
      obj.evo_list.forEach((i: { evo_to_id: any; evo_to_form: any }) => {
        currEvoChain([i.evo_to_id], i.evo_to_form, arr);
      });
      const curr = dataStore.evolution.filter((item: { evo_list: any[] }) =>
        item.evo_list.find((i: { evo_to_id: any; evo_to_form: any }) => obj.id === i.evo_to_id && i.evo_to_form === defaultForm)
      );
      if (curr.length === 0) return arr;
      else if (curr.length === 1) return prevEvoChain(curr[0], defaultForm, arr);
      else return curr.map((item: any) => prevEvoChain(item, defaultForm, arr));
    },
    [currEvoChain, dataStore.evolution]
  );

  const getEvoChain = useCallback(
    (id: any) => {
      const isForm = form.form.form_name.toUpperCase();
      let curr = dataStore.evolution.filter((item: { evo_list: any[] }) =>
        item.evo_list.find((i: { evo_to_id: any; evo_to_form: any }) => id === i.evo_to_id && isForm === i.evo_to_form)
      );
      if (curr.length === 0) {
        if (isForm === '') curr = dataStore.evolution.filter((item: { id: any; form: any }) => id === item.id && isForm === item.form);
        else curr = dataStore.evolution.filter((item: { id: any; form: string | any[] }) => id === item.id && item.form.includes(isForm));
      }
      if (curr.length === 0) curr = dataStore.evolution.filter((item: { id: any; form: string }) => id === item.id && item.form === '');
      return curr.map((item: any) => prevEvoChain(item, isForm, []));
    },
    [prevEvoChain, form, dataStore.evolution]
  );

  const searchStatsPoke = useCallback(
    (level: any) => {
      const arr: ((prevState: any[]) => any[]) | any[][] = [];
      getEvoChain(id).forEach((item: any[]) => {
        const tempArr: { battleLeague: any; maxCP: any; form: any; id: number; name: string }[] = [];
        item.forEach((value: { form: string; id: number; name: string }) => {
          const data = queryStatesEvoChain(dataStore.options, value, level, ATKIv, DEFIv, STAIv);
          if (data.id === id) setMaxCP(data.maxCP);
          tempArr.push(data);
        });
        arr.push(tempArr.sort((a, b) => a.maxCP - b.maxCP));
      });
      setEvoChain(arr);
      let currBastStats: any;
      const evoBaseStats: any[] = [];
      arr.forEach((item) => {
        item.forEach((value: any) => {
          if (value.id !== id)
            evoBaseStats.push({
              ...(Object.values(value.battleLeague).reduce((a: any, b: any) => (!a ? b : !b ? a : a.ratio > b.ratio ? a : b)) as any),
              id: value.id,
              name: value.name,
              form: value.form,
              maxCP: value.maxCP,
              league: Object.keys(value.battleLeague).reduce((a, b) =>
                !value.battleLeague[a] ? b : !value.battleLeague[b] ? a : value.battleLeague[a].ratio > value.battleLeague[b].ratio ? a : b
              ),
            });
          else
            currBastStats = {
              ...(Object.values(value.battleLeague).reduce((a: any, b: any) => (!a ? b : !b ? a : a.ratio > b.ratio ? a : b)) as any),
              id: value.id,
              name: value.name,
              form: value.form,
              maxCP: value.maxCP,
              league: Object.keys(value.battleLeague).reduce((a, b) =>
                !value.battleLeague[a] ? b : !value.battleLeague[b] ? a : value.battleLeague[a].ratio > value.battleLeague[b].ratio ? a : b
              ),
            };
        });
      });
      let bestLeague = evoBaseStats.filter((item) => item.ratio > currBastStats.ratio);
      bestLeague = bestLeague.filter(
        (item) =>
          (item.league === 'master' && item.CP > 2500) ||
          (item.league === 'ultra' && item.CP > 1500) ||
          (item.league === 'great' && item.CP > 500)
      );
      if (bestLeague.length === 0) bestLeague = evoBaseStats.filter((item) => item.ratio > currBastStats.ratio);
      if (bestLeague.length === 0) return setBestInLeague([currBastStats]);
      if (currBastStats.ratio >= 90) bestLeague.push(currBastStats);
      setBestInLeague(bestLeague.sort((a, b) => a.maxCP - b.maxCP));
      dispatch(hideSpinner());
    },
    [dispatch, dataStore.options, ATKIv, DEFIv, STAIv, getEvoChain, id]
  );

  const onSearchStatsPoke = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      if (parseInt(searchCP) < 10) return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
      const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
      if (result.level == null)
        return enqueueSnackbar(
          'At CP: ' + result.CP + ' and IV ' + result.IV.atk + '/' + result.IV.def + '/' + result.IV.sta + ' impossible found in ' + name,
          { variant: 'error' }
        );
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
          splitAndCapitalize(form.form.form_name, '-', ' '),
        { variant: 'success' }
      );
      setTimeout(() => {
        searchStatsPoke(result.level);
      }, 500);
    },
    [dispatch, searchStatsPoke, ATKIv, DEFIv, STAIv, enqueueSnackbar, name, searchCP, statATK, statDEF, statSTA, form]
  );

  useEffect(() => {
    document.title = 'Search Battle Leagues Stats - Tool';
  }, []);

  const getImageList = (id: any) => {
    const isForm = form.form.form_name === '' ? 'NORMAL' : form.form.form_name.replaceAll('-', '_').toUpperCase();
    let img = dataStore.assets
      .find((item: { id: any }) => item.id === id)
      .image.find((item: { form: string | any[] }) => item.form.includes(isForm));
    if (!img) img = dataStore.assets.find((item: { id: any }) => item.id === id).image[0];
    try {
      return img.default;
    } catch {
      return null;
    }
  };

  const getCandyEvo = (item: any[], evoId: number, candy: number): any => {
    if (evoId === id) return candy;
    const data = item.find((i: { evo_list: any[] }) => i.evo_list.find((e: { evo_to_id: any }) => e.evo_to_id === evoId));
    if (!data) return candy;
    const prevEvo = data.evo_list.find((e: { evo_to_id: any }) => e.evo_to_id === evoId);
    if (!prevEvo) return candy;
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
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">CP</span>
              </div>
              <input
                required={true}
                value={searchCP}
                type="number"
                min={10}
                className="form-control"
                aria-label="cp"
                aria-describedby="input-cp"
                placeholder="Enter CP"
                onInput={(e: any) => setSearchCP(e.target.value)}
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
              defaultValue={0}
              min={0}
              max={15}
              step={1}
              valueLabelDisplay="auto"
              marks={marks}
              onChange={(e: any, v: any) => setATKIv(v)}
            />
            <div className="d-flex justify-content-between">
              <b>DEF</b>
              <b>{DEFIv}</b>
            </div>
            <PokeGoSlider
              value={DEFIv}
              aria-label="DEF marks"
              defaultValue={0}
              min={0}
              max={15}
              step={1}
              valueLabelDisplay="auto"
              marks={marks}
              onChange={(e: any, v: any) => setDEFIv(v)}
            />
            <div className="d-flex justify-content-between">
              <b>STA</b>
              <b>{STAIv}</b>
            </div>
            <PokeGoSlider
              value={STAIv}
              aria-label="STA marks"
              defaultValue={0}
              min={0}
              max={15}
              step={1}
              valueLabelDisplay="auto"
              marks={marks}
              onChange={(e: any, v: any) => setSTAIv(v)}
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
              {bestInLeague.map(
                (
                  value: {
                    id:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined;
                    form: string;
                    name: string;
                    ratio: number;
                    league: string;
                    CP:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined;
                    rank:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | React.ReactFragment
                      | React.ReactPortal
                      | null
                      | undefined;
                  },
                  index: React.Key | null | undefined
                ) => (
                  <Link
                    to={`/pokemon/${value.id}${value.form ? `?form=${value.form.toLowerCase()}` : ''}`}
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
                              ? APIService.getPokemonModel(getImageList(value.id))
                              : APIService.getPokeFullSprite(value.id)
                          }
                        />
                        <span className="caption text-black border-best-poke best-name">
                          <b>
                            #{value.id} {splitAndCapitalize(value.name, '_', ' ')} {splitAndCapitalize(form.form.form_name, '-', ' ')}
                          </b>
                        </span>
                      </div>
                      <div className={'border-best-poke ' + getTextColorRatio(value.ratio)}>
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
                            <b>{value.ratio.toFixed(2)}</b>
                          </div>
                          <span className="caption">CP: {value.CP}</span>
                        </div>
                        <span className="caption text-black border-best-poke">
                          <b>#{value.rank}</b>
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
            {evoChain.map((value: any[], index: React.Key | null | undefined) => (
              <Accordion key={index} style={{ marginTop: '3%', marginBottom: '5%' }}>
                <div className="form-header">
                  {!value[0].form ? 'Normal' : splitAndCapitalize(value[0].form, '-', ' ')}
                  {' Form'}
                </div>
                <Accordion.Item eventKey={'0'}>
                  <Accordion.Header>
                    <b>More information</b>
                  </Accordion.Header>
                  <Accordion.Body style={{ padding: 0 }}>
                    <div className="sub-body">
                      <div className="row justify-content-center league-info-content" style={{ margin: 0 }}>
                        {value.map((item: any, index: number) => (
                          <div className="col d-inline-block evo-item-desc justify-content-center" key={index} style={{ padding: 0 }}>
                            <Link
                              to={`/pokemon/${item.id}${item.form ? `?form=${item.form.toLowerCase()}` : ''}`}
                              title={`#${item.id} ${splitAndCapitalize(item.name, '_', ' ')}`}
                            >
                              <Badge color="primary" overlap="circular" badgeContent={index + 1}>
                                <img
                                  alt="pokemon-model"
                                  height={100}
                                  src={
                                    getImageList(item.id)
                                      ? APIService.getPokemonModel(getImageList(item.id))
                                      : APIService.getPokeFullSprite(item.id)
                                  }
                                />
                              </Badge>
                              <div>
                                <b>
                                  #{item.id} {splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}{' '}
                                  {splitAndCapitalize(form.form.form_name, '-', ' ')}
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
                                          className={getTextColorRatio(item.battleLeague.little.ratio)}
                                        >
                                          <b>{item.battleLeague.little.ratio.toFixed(2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <div
                                            className="d-inline-block bg-poke-candy"
                                            style={{
                                              backgroundColor: computeCandyBgColor(item.id),
                                              marginRight: 5,
                                            }}
                                          >
                                            <div
                                              className="poke-candy"
                                              style={{
                                                background: computeCandyColor(item.id),
                                                width: 20,
                                                height: 20,
                                              }}
                                            />
                                          </div>
                                          <span className="d-flex align-items-center" style={{ marginRight: 5 }}>
                                            {item.battleLeague.little.result_between_candy + getCandyEvo(value, item.id, 0)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id, 0)})</span>
                                          </span>
                                          <div className="position-relative d-inline-block">
                                            <div
                                              className="bg-poke-xl-candy"
                                              style={{
                                                background: computeCandyBgColor(id),
                                                width: 30,
                                                height: 30,
                                              }}
                                            />
                                            <div
                                              className="poke-xl-candy"
                                              style={{
                                                background: computeCandyColor(id),
                                                width: 30,
                                                height: 30,
                                              }}
                                            />
                                          </div>
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
                                          className={getTextColorRatio(item.battleLeague.great.ratio)}
                                        >
                                          <b>{item.battleLeague.great.ratio.toFixed(2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <div
                                            className="d-inline-block bg-poke-candy"
                                            style={{
                                              backgroundColor: computeCandyBgColor(item.id),
                                              marginRight: 5,
                                            }}
                                          >
                                            <div
                                              className="poke-candy"
                                              style={{
                                                background: computeCandyColor(item.id),
                                                width: 20,
                                                height: 20,
                                              }}
                                            />
                                          </div>
                                          <span className="d-flex align-items-center">
                                            {item.battleLeague.great.result_between_candy + getCandyEvo(value, item.id, 0)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id, 0)})</span>
                                          </span>
                                          <div className="position-relative d-inline-block">
                                            <div
                                              className="bg-poke-xl-candy"
                                              style={{
                                                background: computeCandyBgColor(id),
                                                width: 30,
                                                height: 30,
                                              }}
                                            />
                                            <div
                                              className="poke-xl-candy"
                                              style={{
                                                background: computeCandyColor(id),
                                                width: 30,
                                                height: 30,
                                              }}
                                            />
                                          </div>
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
                                          className={getTextColorRatio(item.battleLeague.ultra.ratio)}
                                        >
                                          <b>{item.battleLeague.ultra.ratio.toFixed(2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <div
                                            className="d-inline-block bg-poke-candy"
                                            style={{
                                              backgroundColor: computeCandyBgColor(item.id),
                                              marginRight: 5,
                                            }}
                                          >
                                            <div
                                              className="poke-candy"
                                              style={{
                                                background: computeCandyColor(item.id),
                                                width: 20,
                                                height: 20,
                                              }}
                                            />
                                          </div>
                                          <span className="d-flex align-items-center">
                                            {item.battleLeague.ultra.result_between_candy + getCandyEvo(value, item.id, 0)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id, 0)})</span>
                                          </span>
                                          <div className="position-relative d-inline-block">
                                            <div
                                              className="bg-poke-xl-candy"
                                              style={{
                                                background: computeCandyBgColor(id),
                                                width: 30,
                                                height: 30,
                                              }}
                                            />
                                            <div
                                              className="poke-xl-candy"
                                              style={{
                                                background: computeCandyColor(id),
                                                width: 30,
                                                height: 30,
                                              }}
                                            />
                                          </div>
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
                                          className={getTextColorRatio(item.battleLeague.master.ratio)}
                                        >
                                          <b>{item.battleLeague.master.ratio.toFixed(2)}</b>
                                        </span>
                                      </li>
                                      <li>
                                        <span className="d-flex align-items-center">
                                          <div
                                            className="d-inline-block bg-poke-candy"
                                            style={{
                                              backgroundColor: computeCandyBgColor(item.id),
                                              marginRight: 5,
                                            }}
                                          >
                                            <div
                                              className="poke-candy"
                                              style={{
                                                background: computeCandyColor(item.id),
                                                width: 20,
                                                height: 20,
                                              }}
                                            />
                                          </div>
                                          <span className="d-flex align-items-center">
                                            {item.battleLeague.master.result_between_candy + getCandyEvo(value, item.id, 0)}
                                            <span className="d-inline-block caption text-success">(+{getCandyEvo(value, item.id, 0)})</span>
                                          </span>
                                          <div className="position-relative d-inline-block">
                                            <div
                                              className="bg-poke-xl-candy"
                                              style={{
                                                background: computeCandyBgColor(id),
                                                width: 30,
                                                height: 30,
                                              }}
                                            />
                                            <div
                                              className="poke-xl-candy"
                                              style={{
                                                background: computeCandyColor(id),
                                                width: 30,
                                                height: 30,
                                              }}
                                            />
                                          </div>
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
                    <LeaveToggle eventKey={index} />
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
