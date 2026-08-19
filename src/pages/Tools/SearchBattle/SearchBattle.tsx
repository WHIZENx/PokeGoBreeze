import React, { Fragment, useCallback, useState } from 'react';
import Find from '../../../components/Find/Find';

import { Badge, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import './SearchBattle.scss';
import APIService from '../../../services/api.service';

import { capitalize, generateParamForm, getValidPokemonImgPath, splitAndCapitalize } from '../../../utils/utils';

import { marks, PokeGoSlider } from '../../../utils/utils';
import Candy from '../../../components/Sprites/Candy/Candy';
import CandyXL from '../../../components/Sprites/Candy/CandyXL';
import { IBattleBaseStats, IQueryStatesEvoChain } from '../../../utils/models/calculate.model';
import DynamicInputCP from '../../../components/Commons/Inputs/DynamicInputCP';
import { useTitle } from '../../../utils/hooks/useTitle';
import { combineClasses, isNotEmpty, toFloatWithPadding, toNumber } from '../../../utils/extension';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import {
  formNormal,
  maxIv,
  maxLevel,
  minCp,
  minIv,
  minLevel,
  stepLevel,
} from '../../../utils/helpers/options-context.helpers';
import useAssets from '../../../composables/useAssets';
import useSpinner from '../../../composables/useSpinner';
import useSearch from '../../../composables/useSearch';
import ButtonMui from '../../../components/Commons/Buttons/ButtonMui';
import AccordionMui from '../../../components/Commons/Accordions/AccordionMui';
import { useSnackbar } from '../../../contexts/snackbar.context';
import type { BattleLeagueApiItem } from '../../../services/models/tools-api.model';

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
    setMaxCP(0);
    setEvoChain([]);
    setBestInLeague([]);
    setATKIv(0);
    setDEFIv(0);
    setSTAIv(0);
  };

  const onSearchStatsPoke = useCallback(
    async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (toNumber(searchCP) < minCp()) {
        return showSnackbar(`Please input CP greater than or equal to ${minCp()}`, 'error');
      }
      const pokemonId = toNumber(searchingToolCurrentData?.form?.defaultId);
      const name = splitAndCapitalize(searchingToolCurrentData?.pokemon?.fullName, '_', ' ');
      if (!pokemonId) {
        return showSnackbar('Please select a Pokémon before searching Battle League stats', 'error');
      }
      showSpinner();
      try {
        const response = await APIService.postBattleLeagueSearch({
          id: pokemonId,
          form: searchingToolCurrentData?.pokemon?.fullName,
          cp: toNumber(searchCP),
          iv: { atk: ATKIv, def: DEFIv, sta: STAIv },
          config: {
            minLevel: minLevel(),
            maxLevel: maxLevel(),
            step: stepLevel(),
            minIv: minIv(),
            maxIv: maxIv(),
            minCp: minCp(),
          },
        });
        const result = response.data.data;
        if (!result.possible) {
          setMaxCP(0);
          setEvoChain([]);
          setBestInLeague([]);
          showSnackbar(
            `At CP: ${result.stats.CP} and IV ${result.stats.IV.atkIV}/${result.stats.IV.defIV}/${result.stats.IV.staIV} impossible found in ${name}`,
            'error'
          );
          return;
        }
        setMaxCP(result.maxCP);
        setEvoChain(result.chains as IQueryStatesEvoChain[][]);
        setBestInLeague(result.bestInLeague);
        showSnackbar(
          `Search success at CP: ${result.stats.CP} and IV ${result.stats.IV.atkIV}/${result.stats.IV.defIV}/${result.stats.IV.staIV} found in ${name}`,
          'success'
        );
      } catch {
        setMaxCP(0);
        setEvoChain([]);
        setBestInLeague([]);
        showSnackbar('Battle League API is unavailable.', 'error');
      } finally {
        hideSpinner();
      }
    },
    [
      ATKIv,
      DEFIv,
      STAIv,
      searchCP,
      searchingToolCurrentData?.pokemon?.fullName,
      searchingToolCurrentData?.form,
      showSnackbar,
      showSpinner,
      hideSpinner,
    ]
  );

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
                {toNumber(battleStats.resultBetweenCandy) + toNumber((item as BattleLeagueApiItem).evolutionCandy)}
                <span className="tw-inline-block caption !tw-text-green-600">
                  (+{toNumber((item as BattleLeagueApiItem).evolutionCandy)})
                </span>
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
                      <span className="caption !tw-text-black border-best-poke">
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
                                      item,
                                      item.battleLeague.little,
                                      BattleLeagueCPType.Little
                                    )}
                                    {renderPokemonBattleLeague(item, item.battleLeague.great, BattleLeagueCPType.Great)}
                                    {renderPokemonBattleLeague(item, item.battleLeague.ultra, BattleLeagueCPType.Ultra)}
                                    {renderPokemonBattleLeague(
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
