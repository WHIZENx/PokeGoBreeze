import React, { Fragment, useCallback, useState } from 'react';
import Find from '../../../components/Find/Find';

import { Badge, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import './SearchBattle.scss';
import APIService from '../../../services/api.service';

import {
  capitalize,
  convertPokemonAPIDataName,
  generateParamForm,
  getValidPokemonImgPath,
  splitAndCapitalize,
} from '../../../utils/utils';
import { calculateStats } from '../../../utils/calculate';

import { marks, PokeGoSlider } from '../../../utils/utils';
import Candy from '../../../components/Sprites/Candy/Candy';
import CandyXL from '../../../components/Sprites/Candy/CandyXL';
import { IEvolution } from '../../../core/models/evolution.model';
import {
  BattleBaseStats,
  IBattleBaseStats,
  IQueryStatesEvoChain,
  StatsCalculate,
} from '../../../utils/models/calculate.model';
import DynamicInputCP from '../../../components/Commons/Inputs/DynamicInputCP';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { useTitle } from '../../../utils/hooks/useTitle';
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
} from '../../../utils/extension';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import { formNormal, maxIv, minCp, minIv } from '../../../utils/helpers/options-context.helpers';
import useAssets from '../../../composables/useAssets';
import useSpinner from '../../../composables/useSpinner';
import useCalculate from '../../../composables/useCalculate';
import usePokemon from '../../../composables/usePokemon';
import useSearch from '../../../composables/useSearch';
import ButtonMui from '../../../components/Commons/Buttons/ButtonMui';
import AccordionMui from '../../../components/Commons/Accordions/AccordionMui';
import { useSnackbar } from '../../../contexts/snackbar.context';

const FindBattle = () => {
  useTitle({
    title: 'Search Battle Leagues Stats - Tool',
    description:
      'Search and compare Pokémon GO battle league statistics. Find the best Pokémon for different PVP leagues, optimize movesets, and improve your battle strategies.',
    keywords: [
      'battle league stats',
      'Pokémon GO PVP',
      'PVP stats search',
      'competitive Pokémon',
      'battle league rankings',
      'PVP optimization',
    ],
  });
  const { getFilteredPokemons, getFindPokemon } = usePokemon();
  const { queryStatesEvoChain } = useCalculate();
  const { getAssetNameById } = useAssets();
  const { hideSpinner, showSpinner } = useSpinner();
  const { searchingToolCurrentData } = useSearch();

  const [maxCP, setMaxCP] = useState(0);

  const [searchCP, setSearchCP] = useState('');

  const [ATKIv, setATKIv] = useState(0);
  const [DEFIv, setDEFIv] = useState(0);
  const [STAIv, setSTAIv] = useState(0);

  const [evoChain, setEvoChain] = useState<IQueryStatesEvoChain[][]>([]);
  const [bestInLeague, setBestInLeague] = useState<IBattleBaseStats[]>([]);

  const { showSnackbar } = useSnackbar();

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
      if (!isNotEmpty(currId)) {
        return arr;
      }
      const curr = getFindPokemon((item) => isIncludeList(currId, item.num) && isInclude(item.form, form));
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
          name: getValueOrDefault(String, curr?.pokemonId?.toString()),
          pokemonId: curr?.pokemonId?.toString(),
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
    [getFindPokemon]
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
          name: getValueOrDefault(String, obj.pokemonId?.toString()),
          pokemonId: obj.pokemonId?.toString(),
          id: obj.num,
          evoList: getValueOrDefault(Array, obj.evoList),
          tempEvo: getValueOrDefault(Array, obj.tempEvo),
          form: defaultForm,
        });
      }
      obj.evoList?.forEach((i) => {
        currEvoChain([i.evoToId], i.evoToForm, arr);
      });
      const curr = getFilteredPokemons((item) =>
        item.evoList?.some((i) => obj.num === i.evoToId && isEqual(i.evoToForm, defaultForm))
      );
      if (isNotEmpty(curr)) {
        curr?.forEach((item) => prevEvoChain(item, defaultForm, arr, result));
      } else {
        result.push(arr);
      }
    },
    [currEvoChain, getFilteredPokemons]
  );

  const getEvoChain = useCallback(
    (id: number) => {
      const currentForm = convertPokemonAPIDataName(searchingToolCurrentData?.form?.form?.formName, formNormal());
      let curr = getFilteredPokemons((item) =>
        item.evoList?.some((i) => id === i.evoToId && isEqual(currentForm, i.evoToForm))
      );
      if (!isNotEmpty(curr)) {
        if (currentForm === formNormal()) {
          curr = getFilteredPokemons((item) => id === item.num && isEqual(currentForm, item.form));
        } else {
          curr = getFilteredPokemons((item) => id === item.num && isInclude(item.form, currentForm));
        }
      }
      if (!isNotEmpty(curr)) {
        curr = getFilteredPokemons((item) => id === item.num && item.form === formNormal());
      }
      const result: IEvolution[][] = [];
      curr?.forEach((item) => prevEvoChain(item, currentForm, [], result));
      return result;
    },
    [prevEvoChain, searchingToolCurrentData?.form, getFilteredPokemons]
  );

  const searchStatsPoke = useCallback(
    (level: number) => {
      const arr: IQueryStatesEvoChain[][] = [];
      getEvoChain(toNumber(searchingToolCurrentData?.form?.defaultId)).forEach((item) => {
        const tempArr: IQueryStatesEvoChain[] = [];
        item.forEach((value) => {
          const data = queryStatesEvoChain(value, level, ATKIv, DEFIv, STAIv);
          if (data.id === searchingToolCurrentData?.form?.defaultId) {
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
          if (value.id !== searchingToolCurrentData?.form?.defaultId) {
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
              ...Object.values(value.battleLeague).reduce((a, b) =>
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
          hideSpinner();
          return setBestInLeague([currBastStats]);
        }
        if (ratio >= 90) {
          bestLeague.push(currBastStats);
        }
        setBestInLeague(bestLeague.sort((a, b) => toNumber(a.maxCP) - toNumber(b.maxCP)));
      } else {
        setTimeout(() => showSnackbar(`Error! Something went wrong.`, 'error'), 300);
      }
      hideSpinner();
    },
    [ATKIv, DEFIv, STAIv, getEvoChain, searchingToolCurrentData?.form?.defaultId]
  );

  const onSearchStatsPoke = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (toNumber(searchCP) < minCp()) {
        return showSnackbar(`Please input CP greater than or equal to ${minCp()}`, 'error');
      }
      showSpinner();
      const statATK = toNumber(searchingToolCurrentData?.pokemon?.statsGO?.atk);
      const statDEF = toNumber(searchingToolCurrentData?.pokemon?.statsGO?.def);
      const statSTA = toNumber(searchingToolCurrentData?.pokemon?.statsGO?.sta);
      setTimeout(() => {
        const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
        processStatsPoke(result);
      }, 200);
    },
    [
      searchStatsPoke,
      ATKIv,
      DEFIv,
      STAIv,
      searchCP,
      searchingToolCurrentData?.pokemon?.statsGO?.atk,
      searchingToolCurrentData?.pokemon?.statsGO?.def,
      searchingToolCurrentData?.pokemon?.statsGO?.sta,
      searchingToolCurrentData?.form,
    ]
  );

  const processStatsPoke = (result: StatsCalculate) => {
    const name = splitAndCapitalize(searchingToolCurrentData?.pokemon?.fullName, '_', ' ');
    if (result.level === 0) {
      hideSpinner();
      return showSnackbar(
        `At CP: ${result.CP} and IV ${result.IV.atkIV}/${result.IV.defIV}/${result.IV.staIV} impossible found in ${name}`,
        'error'
      );
    }
    setTimeout(() => {
      searchStatsPoke(result.level);
      showSnackbar(
        `Search success at CP: ${result.CP} and IV ${result.IV.atkIV}/${result.IV.defIV}/${result.IV.staIV} found in ${name}`,
        'success'
      );
    }, 500);
  };

  const getCandyEvo = (item: IEvolution[], evoId: number, candy = 0): number => {
    if (evoId === searchingToolCurrentData?.form?.defaultId) {
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
    return `rank-${
      value === 100 ? 'max' : value >= 90 ? 'excellent' : value >= 80 ? 'great' : value >= 70 ? 'nice' : 'normal'
    }`;
  };

  const renderPokemon = (value: IBattleBaseStats | IQueryStatesEvoChain, className?: string, height = 100) => {
    const assets = getAssetNameById(value.id, value.name, value.form);
    return (
      <img
        className={className}
        alt="Pokémon Model"
        height={height}
        src={APIService.getPokemonModel(assets, value.id)}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, value.id, assets);
        }}
      />
    );
  };

  const renderPokemonBattleLeague = (
    value: IQueryStatesEvoChain[],
    item: IQueryStatesEvoChain,
    battleStats: IBattleBaseStats,
    cp: BattleLeagueCPType
  ) => (
    <div className="tw-mt-2 tw-flex tw-justify-center tw-text-left">
      {battleStats.rank ? (
        <ul className="list-best-league">
          <h6>
            <img alt="Pokémon Model" height={32} src={getPokemonBattleLeagueIcon(cp)} />
            <b>{` ${getPokemonBattleLeagueName(cp)}`}</b>
          </h6>
          <li>
            Rank: <b>#{battleStats.rank}</b>
          </li>
          <li>CP: {battleStats.CP}</li>
          <li>Level: {battleStats.level}</li>
          <li>
            {'Stats Prod (%): '}
            <span className={combineClasses('!tw-bg-transparent', getTextColorRatio(battleStats.ratio))}>
              <b>{toFloatWithPadding(battleStats.ratio, 2)}</b>
            </span>
          </li>
          <li>
            <span className="tw-flex tw-items-center">
              <Candy id={item.id} className="tw-mr-1" />
              <span className="tw-flex tw-items-center tw-mr-1">
                {toNumber(battleStats.resultBetweenCandy) + getCandyEvo(value, item.id)}
                <span className="tw-inline-block caption tw-text-green-600">(+{getCandyEvo(value, item.id)})</span>
              </span>
              <CandyXL id={searchingToolCurrentData?.form?.defaultId} />
              {battleStats.resultBetweenXLCandy}
            </span>
          </li>
          <li>
            <img
              className="tw-mr-1"
              alt="Image Stardust"
              height={20}
              src={APIService.getItemSprite('stardust_painted')}
            />
            {` ${battleStats.resultBetweenStardust}`}
          </li>
        </ul>
      ) : (
        <div>
          <h6>
            <img alt="Pokémon Model" height={32} src={getPokemonBattleLeagueIcon(cp)} />
            <b>{` ${getPokemonBattleLeagueName(cp)}`}</b>
          </h6>
          <b className="tw-text-red-600 tw-p-3">
            <CloseIcon color="error" /> Not Elidge
          </b>
        </div>
      )}
    </div>
  );

  return (
    <div className="tw-container">
      <Find isHide clearStats={clearArrStats} />
      <h1 id="main" className="tw-text-center">
        Search Battle Leagues Stats
      </h1>
      <form className="tw-mt-2 tw-pb-3" onSubmit={onSearchStatsPoke.bind(this)}>
        <div className="form-group tw-flex tw-justify-center tw-text-center">
          <Box className="tw-w-1/2" sx={{ minWidth: 350 }}>
            <div className="tw-justify-center input-group tw-mb-3">
              <DynamicInputCP
                statATK={searchingToolCurrentData?.pokemon?.statsGO?.atk}
                statDEF={searchingToolCurrentData?.pokemon?.statsGO?.def}
                statSTA={searchingToolCurrentData?.pokemon?.statsGO?.sta}
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
        <div className="form-group tw-flex tw-justify-center tw-text-center">
          <Box className="tw-w-1/2 tw-min-w-75">
            <div className="tw-flex tw-justify-between">
              <b>ATK</b>
              <b>{ATKIv}</b>
            </div>
            <PokeGoSlider
              value={ATKIv}
              aria-label="ATK marks"
              defaultValue={minIv()}
              min={minIv()}
              max={maxIv()}
              step={1}
              valueLabelDisplay="auto"
              marks={marks}
              onChange={(_, v) => {
                setSearchCP('');
                setATKIv(v as number);
              }}
            />
            <div className="tw-flex tw-justify-between">
              <b>DEF</b>
              <b>{DEFIv}</b>
            </div>
            <PokeGoSlider
              value={DEFIv}
              aria-label="DEF marks"
              defaultValue={minIv()}
              min={minIv()}
              max={maxIv()}
              step={1}
              valueLabelDisplay="auto"
              marks={marks}
              onChange={(_, v) => {
                setSearchCP('');
                setDEFIv(v as number);
              }}
            />
            <div className="tw-flex tw-justify-between">
              <b>STA</b>
              <b>{STAIv}</b>
            </div>
            <PokeGoSlider
              value={STAIv}
              aria-label="STA marks"
              defaultValue={minIv()}
              min={minIv()}
              max={maxIv()}
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
        <div className="form-group tw-flex tw-justify-center tw-text-center tw-mt-2">
          <ButtonMui type="submit" label="Search" />
        </div>
      </form>
      <Fragment>
        {isNotEmpty(evoChain) && isNotEmpty(bestInLeague) && (
          <div className="tw-text-center tw-pb-3">
            <div className="tw-mb-3">
              <h4 className="tw-underline">Recommend Battle League</h4>
              {bestInLeague.map((value, index) => (
                <LinkToTop
                  to={`/pokemon/${value.id}${generateParamForm(value.form)}`}
                  className="tw-inline-block contain-poke-best-league border-best-poke"
                  key={index}
                  title={`#${value.id} ${splitAndCapitalize(value.name, '_', ' ')}`}
                >
                  <div className="tw-flex tw-items-center tw-h-full">
                    <div className="border-best-poke tw-h-full">
                      {renderPokemon(value, 'poke-best-league', 102)}
                      <span className="caption border-best-poke best-name">
                        <b>
                          #{value.id} {splitAndCapitalize(value.name, '_', ' ')}{' '}
                          {splitAndCapitalize(searchingToolCurrentData?.form?.form?.formName, '-', ' ')}
                        </b>
                      </span>
                    </div>
                    <div className={combineClasses('border-best-poke', getTextColorRatio(value.ratio))}>
                      <div className="best-poke-desc border-best-poke">
                        <img
                          alt="Pokémon Model"
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
                        <span className="caption caption-constant text-shadow">CP: {value.CP}</span>
                      </div>
                      <span className="caption tw-text-black border-best-poke">
                        <b>#{value.rank}</b>
                      </span>
                    </div>
                  </div>
                </LinkToTop>
              ))}
            </div>
            {evoChain.map((value, index) => (
              <Fragment key={index}>
                <div className="form-header">
                  {!value.at(0)?.form ? capitalize(formNormal()) : splitAndCapitalize(value.at(0)?.form, '_', ' ')}
                  {' Form'}
                </div>
                <AccordionMui
                  key={index}
                  defaultValue={0}
                  className="tw-mb-3"
                  isShowAction
                  items={[
                    {
                      value: index,
                      label: <b>More information</b>,
                      children: (
                        <div className="sub-body">
                          <div className="row tw-justify-center league-info-content !tw-m-0">
                            {value.map((item, index) => (
                              <div className="col tw-inline-block evo-item-desc tw-justify-center !tw-p-0" key={index}>
                                <div className="pokemon-best-league">
                                  <LinkToTop
                                    to={`/pokemon/${item.id}${generateParamForm(item.form)}`}
                                    title={`#${item.id} ${splitAndCapitalize(item.name, '_', ' ')}`}
                                  >
                                    <Badge color="primary" overlap="circular" badgeContent={index + 1}>
                                      {renderPokemon(item)}
                                    </Badge>
                                    <div>
                                      <b>
                                        {`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), '_', ' ')} `}
                                        {splitAndCapitalize(searchingToolCurrentData?.form?.form?.formName, '-', ' ')}
                                      </b>
                                    </div>
                                  </LinkToTop>
                                </div>
                                {toNumber(item.maxCP) < maxCP ? (
                                  <div className="tw-text-red-600">
                                    <b>
                                      <CloseIcon color="error" /> Not Elidge
                                    </b>
                                  </div>
                                ) : (
                                  <Fragment>
                                    <hr />
                                    {renderPokemonBattleLeague(
                                      value,
                                      item,
                                      item.battleLeague.little,
                                      BattleLeagueCPType.Little
                                    )}
                                    {renderPokemonBattleLeague(
                                      value,
                                      item,
                                      item.battleLeague.great,
                                      BattleLeagueCPType.Great
                                    )}
                                    {renderPokemonBattleLeague(
                                      value,
                                      item,
                                      item.battleLeague.ultra,
                                      BattleLeagueCPType.Ultra
                                    )}
                                    {renderPokemonBattleLeague(
                                      value,
                                      item,
                                      item.battleLeague.master,
                                      BattleLeagueCPType.Master
                                    )}
                                  </Fragment>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    },
                  ]}
                />
              </Fragment>
            ))}
          </div>
        )}
      </Fragment>
    </div>
  );
};

export default FindBattle;
