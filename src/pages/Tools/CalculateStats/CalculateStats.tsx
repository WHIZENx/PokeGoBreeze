import React, { Fragment, useCallback, useState } from 'react';

import {
  getItemSpritePath,
  getKeyWithData,
  LevelSlider,
  marks,
  PokeGoSlider,
  splitAndCapitalize,
  TypeRadioGroup,
} from '../../../utils/utils';
import {
  calculateBattleLeague,
  calculateBetweenLevel,
  calculateStats,
  calculateStatsBattle,
} from '../../../utils/calculate';

import { Box, FormControlLabel, Radio } from '@mui/material';

import APIService from '../../../services/api.service';

import './CalculateStats.scss';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import Find from '../../../components/Find/Find';
import Candy from '../../../components/Sprites/Candy/Candy';
import CandyXL from '../../../components/Sprites/Candy/CandyXL';
import { IBattleLeagueCalculate, IBetweenLevelCalculate, IStatsCalculate } from '../../../utils/models/calculate.model';
import DynamicInputCP from '../../../components/Commons/Inputs/DynamicInputCP';
import { useTitle } from '../../../utils/hooks/useTitle';
import { isUndefined, toNumber } from '../../../utils/extension';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import { PokemonType } from '../../../enums/type.enum';
import { ItemName } from '../../News/enums/item-type.enum';
import { minCp, minIv, maxIv, minLevel, maxLevel, stepLevel } from '../../../utils/helpers/options-context.helpers';
import useSearch from '../../../composables/useSearch';
import ButtonMui from '../../../components/Commons/Buttons/ButtonMui';
import { useSnackbar } from '../../../contexts/snackbar.context';

const Calculate = () => {
  useTitle({
    title: 'Calculate CP&IV - Tool',
    description:
      'Calculate Pokémon GO CP and IV values with our advanced calculator. Optimize your Pokémon stats for battles, raids, and gym defense.',
    keywords: [
      'CP calculator',
      'IV calculator',
      'Pokémon GO stats',
      'CP optimization',
      'IV optimization',
      'Pokémon stats tool',
    ],
  });
  const { searchingToolCurrentDetails } = useSearch();

  const [searchCP, setSearchCP] = useState('');

  const [ATKIv, setATKIv] = useState(0);
  const [DEFIv, setDEFIv] = useState(0);
  const [STAIv, setSTAIv] = useState(0);

  const [typePoke, setTypePoke] = useState(PokemonType.Normal);

  const [pokeStats, setPokeStats] = useState<IStatsCalculate>();
  const [statLevel, setStatLevel] = useState(1);
  const [statData, setStatData] = useState<IBetweenLevelCalculate>();

  const [dataLittleLeague, setDataLittleLeague] = useState<IBattleLeagueCalculate>();
  const [dataGreatLeague, setDataGreatLeague] = useState<IBattleLeagueCalculate>();
  const [dataUltraLeague, setDataUltraLeague] = useState<IBattleLeagueCalculate>();
  const [dataMasterLeague, setDataMasterLeague] = useState<IBattleLeagueCalculate>();

  const { showSnackbar } = useSnackbar();

  const clearArrStats = () => {
    setSearchCP('');
    setPokeStats(undefined);
    setStatLevel(1);
    setStatData(undefined);
    setATKIv(0);
    setDEFIv(0);
    setSTAIv(0);
    setDataLittleLeague(undefined);
    setDataGreatLeague(undefined);
    setDataUltraLeague(undefined);
    setDataMasterLeague(undefined);
  };

  const calculateStatsPoke = useCallback(() => {
    if (toNumber(searchCP) < minCp()) {
      showSnackbar(`Please input CP greater than or equal to ${minCp()}`, 'error');
      return;
    }
    const statATK = toNumber(searchingToolCurrentDetails?.statsGO?.atk);
    const statDEF = toNumber(searchingToolCurrentDetails?.statsGO?.def);
    const statSTA = toNumber(searchingToolCurrentDetails?.statsGO?.sta);
    const name = splitAndCapitalize(searchingToolCurrentDetails?.fullName, '_', ' ');
    const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
    if (!result.level) {
      showSnackbar(
        `At CP: ${result.CP} and IV ${result.IV.atkIV}/${result.IV.defIV}/${result.IV.staIV} impossible found in ${name}`,
        'error'
      );
      return;
    }
    showSnackbar(
      `At CP: ${result.CP} and IV ${result.IV.atkIV}/${result.IV.defIV}/${result.IV.staIV} found in ${typePoke} ${name}`,
      'success'
    );
    setPokeStats(result);
    setStatLevel(result.level);
    setStatData(
      calculateBetweenLevel(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.level, typePoke)
    );
    setDataLittleLeague(
      calculateBattleLeague(
        statATK,
        statDEF,
        statSTA,
        ATKIv,
        DEFIv,
        STAIv,
        result.level,
        result.CP,
        typePoke,
        BattleLeagueCPType.Little
      )
    );
    setDataGreatLeague(
      calculateBattleLeague(
        statATK,
        statDEF,
        statSTA,
        ATKIv,
        DEFIv,
        STAIv,
        result.level,
        result.CP,
        typePoke,
        BattleLeagueCPType.Great
      )
    );
    setDataUltraLeague(
      calculateBattleLeague(
        statATK,
        statDEF,
        statSTA,
        ATKIv,
        DEFIv,
        STAIv,
        result.level,
        result.CP,
        typePoke,
        BattleLeagueCPType.Ultra
      )
    );
    setDataMasterLeague(
      calculateBattleLeague(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.CP, typePoke)
    );
  }, [
    searchingToolCurrentDetails?.statsGO?.atk,
    searchingToolCurrentDetails?.statsGO?.def,
    searchingToolCurrentDetails?.statsGO?.sta,
    ATKIv,
    DEFIv,
    STAIv,
    searchCP,
    searchingToolCurrentDetails?.fullName,
    typePoke,
  ]);

  const onCalculateStatsPoke = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      calculateStatsPoke();
    },
    [calculateStatsPoke]
  );

  const onHandleLevel = (level: number) => {
    if (pokeStats) {
      setStatLevel(level);
      const statATK = toNumber(searchingToolCurrentDetails?.statsGO?.atk);
      const statDEF = toNumber(searchingToolCurrentDetails?.statsGO?.def);
      const statSTA = toNumber(searchingToolCurrentDetails?.statsGO?.sta);
      setStatData(
        calculateBetweenLevel(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, pokeStats.level, level, typePoke)
      );
    }
  };

  return (
    <Fragment>
      <div className="tw-container tw-mt-2">
        <Find isHide clearStats={clearArrStats} />
        <h1 id="main" className="tw-text-center">
          Calculate Stats
        </h1>
        <form className="tw-mt-2" onSubmit={onCalculateStatsPoke.bind(this)}>
          <div className="form-group tw-flex tw-justify-center tw-text-center">
            <Box className="tw-w-1/2" sx={{ minWidth: 350 }}>
              <div className="input-group tw-mb-3 tw-justify-center">
                <DynamicInputCP
                  statATK={searchingToolCurrentDetails?.statsGO?.atk}
                  statDEF={searchingToolCurrentDetails?.statsGO?.def}
                  statSTA={searchingToolCurrentDetails?.statsGO?.sta}
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
            <Box className="tw-w-1/2" sx={{ minWidth: 300 }}>
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
          <div className="tw-flex tw-justify-center tw-text-center">
            <TypeRadioGroup
              row
              aria-labelledby="row-types-group-label"
              name="row-types-group"
              defaultValue={PokemonType.Normal}
              onChange={(e) => {
                setPokeStats(undefined);
                setStatData(undefined);
                setStatLevel(0);
                setDataLittleLeague(undefined);
                setDataGreatLeague(undefined);
                setDataUltraLeague(undefined);
                setDataMasterLeague(undefined);
                setTypePoke(toNumber(e.target.value));
              }}
            >
              <FormControlLabel
                value={PokemonType.Normal}
                control={<Radio />}
                label={<span>{getKeyWithData(PokemonType, PokemonType.Normal)}</span>}
              />
              <FormControlLabel
                value={PokemonType.Buddy}
                control={<Radio />}
                label={
                  <span>
                    <img height={28} alt="Image Buddy" src={APIService.getPokeBuddy()} />{' '}
                    {getKeyWithData(PokemonType, PokemonType.Buddy)}
                  </span>
                }
              />
              <FormControlLabel
                value={PokemonType.Lucky}
                control={<Radio />}
                label={
                  <span>
                    <img height={28} alt="Image Lucky" src={APIService.getPokeLucky()} />{' '}
                    {getKeyWithData(PokemonType, PokemonType.Lucky)}
                  </span>
                }
              />
              <FormControlLabel
                value={PokemonType.Shadow}
                control={<Radio />}
                label={
                  <span>
                    <img height={32} alt="Image Shadow" src={APIService.getPokeShadow()} />{' '}
                    {getKeyWithData(PokemonType, PokemonType.Shadow)}
                  </span>
                }
              />
              <FormControlLabel
                value={PokemonType.Purified}
                control={<Radio />}
                label={
                  <span>
                    <img height={32} alt="Image Purified" src={APIService.getPokePurified()} />
                    {` ${getKeyWithData(PokemonType, PokemonType.Purified)}`}
                  </span>
                }
              />
            </TypeRadioGroup>
          </div>
          <div className="form-group tw-flex tw-justify-center tw-text-center tw-mt-2">
            <ButtonMui type="submit" label="Calculate" />
          </div>
        </form>
        <div>
          <div className="tw-flex tw-justify-center tw-text-center" style={{ height: 80 }}>
            <Box className="tw-w-3/5" sx={{ minWidth: 320 }}>
              <div className="tw-flex tw-justify-between">
                <b>Level</b>
                <b>{statData ? statLevel : 'None'}</b>
              </div>
              <LevelSlider
                aria-label="Level"
                value={statLevel}
                defaultValue={minLevel()}
                valueLabelDisplay="off"
                step={stepLevel()}
                min={minLevel()}
                max={typePoke === PokemonType.Buddy ? maxLevel() : maxLevel() - 1}
                marks={pokeStats ? [{ value: pokeStats.level, label: 'Result LV' }] : false}
                disabled={!pokeStats}
                onChange={(_, value) => onHandleLevel(value as number)}
              />
            </Box>
          </div>
          <div className="tw-flex tw-justify-center tw-mt-3">
            <Box className="tw-w-4/5" sx={{ minWidth: 320 }}>
              <div className="row">
                <div className="col !tw-p-0">
                  <table className="table-info table-stats">
                    <thead>
                      <tr className="tw-text-center">
                        <th colSpan={2}>Simulate Power Up Pokémon</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Pokémon Level</td>
                        <td>{statLevel && statData ? statLevel : '-'}</td>
                      </tr>
                      <tr>
                        <td>Power Up Count</td>
                        <td>
                          {statData
                            ? !isUndefined(statData.powerUpCount)
                              ? statData.powerUpCount
                              : 'Unavailable'
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td>{statData ? statData.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            className="tw-mr-2"
                            alt="Image Stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stardust Required
                        </td>
                        <td>
                          {statData ? (
                            statData.resultBetweenStardust > 0 ? (
                              <span>
                                {statData.resultBetweenStardust}
                                {statData.pokemonType && toNumber(statData.resultBetweenStardustDiff) > 0 && (
                                  <Fragment>
                                    {statData.pokemonType === PokemonType.Shadow && (
                                      <span className="shadow-text"> (+{statData.resultBetweenStardustDiff})</span>
                                    )}
                                    {statData.pokemonType === PokemonType.Purified && (
                                      <span className="purified-text"> (-{statData.resultBetweenStardustDiff})</span>
                                    )}
                                    {statData.pokemonType === PokemonType.Lucky && (
                                      <span className="buddy-text"> (-{statData.resultBetweenStardustDiff})</span>
                                    )}
                                  </Fragment>
                                )}
                              </span>
                            ) : (
                              'Unavailable'
                            )
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          {statData ? (
                            <Candy id={searchingToolCurrentDetails?.id} className="tw-mr-2" />
                          ) : (
                            <img
                              className="tw-mr-2"
                              alt="Image Stardust"
                              height={20}
                              src={getItemSpritePath(ItemName.RareCandy)}
                            />
                          )}
                          Candy Required
                        </td>
                        <td>
                          {statData ? (
                            statData.resultBetweenCandy > 0 ? (
                              <span>
                                {statData.resultBetweenCandy}
                                {statData.pokemonType && toNumber(statData.resultBetweenCandyDiff) > 0 && (
                                  <Fragment>
                                    {statData.pokemonType === PokemonType.Shadow && (
                                      <span className="shadow-text"> (+{statData.resultBetweenCandyDiff})</span>
                                    )}
                                    {statData.pokemonType === PokemonType.Purified && (
                                      <span className="purified-text"> (-{statData.resultBetweenCandyDiff})</span>
                                    )}
                                    {statData.pokemonType === PokemonType.Lucky && (
                                      <span className="buddy-text"> (-{statData.resultBetweenCandyDiff})</span>
                                    )}
                                  </Fragment>
                                )}
                              </span>
                            ) : (
                              'Unavailable'
                            )
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          {statData ? (
                            <CandyXL id={searchingToolCurrentDetails?.id} />
                          ) : (
                            <img
                              className="tw-mr-2"
                              alt="Image Stardust"
                              height={20}
                              src={getItemSpritePath(ItemName.XlRareCandy)}
                            />
                          )}
                          XL Candy Required
                        </td>
                        <td>
                          {statData ? (
                            statData.resultBetweenXLCandy > 0 ? (
                              <span>
                                {statData.resultBetweenXLCandy}
                                {statData.pokemonType && toNumber(statData.resultBetweenXLCandyDiff) > 0 && (
                                  <Fragment>
                                    {statData.pokemonType === PokemonType.Shadow && (
                                      <span className="shadow-text"> (+{statData.resultBetweenXLCandyDiff})</span>
                                    )}
                                    {statData.pokemonType === PokemonType.Purified && (
                                      <span className="purified-text"> (-{statData.resultBetweenXLCandyDiff})</span>
                                    )}
                                    {statData.pokemonType === PokemonType.Lucky && (
                                      <span className="buddy-text"> (-{statData.resultBetweenXLCandyDiff})</span>
                                    )}
                                  </Fragment>
                                )}
                              </span>
                            ) : (
                              'Unavailable'
                            )
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr className="tw-text-center">
                        <td className="table-sub-header" colSpan={2}>
                          Stats
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                          ATK
                        </td>
                        <td>
                          {statData ? (
                            statData.pokemonType !== PokemonType.Shadow ? (
                              calculateStatsBattle(
                                toNumber(searchingToolCurrentDetails?.statsGO?.atk),
                                pokeStats?.IV.atkIV,
                                statLevel,
                                true
                              )
                            ) : (
                              <Fragment>
                                {statData.atkStat}
                                {toNumber(statData.atkStatDiff) > 0 && (
                                  <span className="tw-text-green-600 tw-font-medium">{` (+${statData.atkStatDiff})`}</span>
                                )}
                              </Fragment>
                            )
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                          DEF
                        </td>
                        <td>
                          {statData ? (
                            statData.pokemonType !== PokemonType.Shadow ? (
                              calculateStatsBattle(
                                toNumber(searchingToolCurrentDetails?.statsGO?.def),
                                pokeStats?.IV.defIV,
                                statLevel,
                                true
                              )
                            ) : (
                              <Fragment>
                                {statData.defStat}
                                {toNumber(statData.defStatDiff) > 0 && (
                                  <span className="tw-text-red-600 tw-font-medium">{` (-${statData.defStatDiff})`}</span>
                                )}
                              </Fragment>
                            )
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                          HP
                        </td>
                        <td>
                          {statData
                            ? calculateStatsBattle(
                                toNumber(searchingToolCurrentDetails?.statsGO?.sta),
                                pokeStats?.IV.staIV,
                                statLevel,
                                true
                              )
                            : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col !tw-p-0">
                  <table className="table-info battle-league">
                    <thead className="tw-text-center">
                      <tr>
                        <th colSpan={5}>Recommend in Battle League</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="tw-text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            className="tw-mr-2"
                            alt="Image League"
                            width={30}
                            height={30}
                            src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Little)}
                          />
                          <span className={dataLittleLeague ? (dataLittleLeague.isElidge ? '' : 'text-danger') : ''}>
                            {getPokemonBattleLeagueName(BattleLeagueCPType.Little)}
                            {dataLittleLeague ? dataLittleLeague.isElidge ? '' : <span> (Not Elidge)</span> : ''}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Level</td>
                        <td colSpan={3}>
                          {dataLittleLeague && dataLittleLeague.isElidge ? dataLittleLeague.level : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td colSpan={3}>{dataLittleLeague && dataLittleLeague.isElidge ? dataLittleLeague.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            className="tw-mr-2"
                            alt="Image Stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stardust Required
                        </td>
                        <td colSpan={3}>
                          {dataLittleLeague && dataLittleLeague.isElidge ? (
                            <span
                              className={`${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`}
                            >
                              {dataLittleLeague.rangeValue?.resultBetweenStardust}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Candy Required</td>
                        <td colSpan={3} className="!tw-p-0">
                          <div className="tw-flex tw-items-center td-style custom-border-right tw-float-left tw-w-1/2">
                            {dataLittleLeague && dataLittleLeague.isElidge ? (
                              <Candy id={searchingToolCurrentDetails?.id} className="tw-mr-2" />
                            ) : (
                              <img
                                className="tw-mr-2"
                                alt="Image Stardust"
                                height={20}
                                src={getItemSpritePath(ItemName.RareCandy)}
                              />
                            )}
                            {dataLittleLeague && dataLittleLeague.isElidge ? (
                              <span
                                className={
                                  statData?.pokemonType !== PokemonType.Lucky
                                    ? `${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`
                                    : ''
                                }
                              >
                                {dataLittleLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="tw-flex tw-items-center td-style tw-float-right tw-w-1/2">
                            {dataLittleLeague && dataLittleLeague.isElidge ? (
                              <CandyXL id={searchingToolCurrentDetails?.id} />
                            ) : (
                              <img
                                className="tw-mr-2"
                                alt="Image Stardust"
                                height={20}
                                src={getItemSpritePath(ItemName.XlRareCandy)}
                              />
                            )}
                            {dataLittleLeague && dataLittleLeague.isElidge ? (
                              <span
                                className={
                                  statData?.pokemonType !== PokemonType.Lucky
                                    ? `${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`
                                    : ''
                                }
                              >
                                {dataLittleLeague.rangeValue?.resultBetweenXLCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>Stats</td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                          {dataLittleLeague && dataLittleLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataLittleLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                          {dataLittleLeague && dataLittleLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-danger' : ''}>
                              {dataLittleLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                          {dataLittleLeague && dataLittleLeague.isElidge ? dataLittleLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="tw-text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            className="tw-mr-2"
                            alt="Image League"
                            width={30}
                            height={30}
                            src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Great)}
                          />
                          <span className={dataGreatLeague ? (dataGreatLeague.isElidge ? '' : 'text-danger') : ''}>
                            {getPokemonBattleLeagueName(BattleLeagueCPType.Great)}
                            {dataGreatLeague ? dataGreatLeague.isElidge ? '' : <span> (Not Elidge)</span> : ''}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Level</td>
                        <td colSpan={3}>{dataGreatLeague && dataGreatLeague.isElidge ? dataGreatLeague.level : '-'}</td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td colSpan={3}>{dataGreatLeague && dataGreatLeague.isElidge ? dataGreatLeague.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            className="tw-mr-2"
                            alt="Image Stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stardust Required
                        </td>
                        <td colSpan={3}>
                          {dataGreatLeague && dataGreatLeague.isElidge ? (
                            <span
                              className={`${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`}
                            >
                              {dataGreatLeague.rangeValue?.resultBetweenStardust}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Candy Required</td>
                        <td colSpan={3} className="!tw-p-0">
                          <div className="tw-flex tw-items-center td-style custom-border-right tw-float-left tw-w-1/2">
                            {dataGreatLeague && dataGreatLeague.isElidge ? (
                              <Candy id={searchingToolCurrentDetails?.id} className="tw-mr-2" />
                            ) : (
                              <img
                                className="tw-mr-2"
                                alt="Image Stardust"
                                height={20}
                                src={getItemSpritePath(ItemName.RareCandy)}
                              />
                            )}
                            {dataGreatLeague && dataGreatLeague.isElidge ? (
                              <span
                                className={
                                  statData?.pokemonType !== PokemonType.Lucky
                                    ? `${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`
                                    : ''
                                }
                              >
                                {dataGreatLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="tw-flex tw-items-center td-style tw-float-right tw-w-1/2">
                            {dataGreatLeague && dataGreatLeague.isElidge ? (
                              <CandyXL id={searchingToolCurrentDetails?.id} />
                            ) : (
                              <img
                                className="tw-mr-2"
                                alt="Image Stardust"
                                height={20}
                                src={getItemSpritePath(ItemName.XlRareCandy)}
                              />
                            )}
                            {dataGreatLeague && dataGreatLeague.isElidge ? (
                              <span
                                className={
                                  statData?.pokemonType !== PokemonType.Lucky
                                    ? `${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`
                                    : ''
                                }
                              >
                                {dataGreatLeague.rangeValue?.resultBetweenXLCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>Stats</td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                          {dataGreatLeague && dataGreatLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataGreatLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                          {dataGreatLeague && dataGreatLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-danger' : ''}>
                              {dataGreatLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                          {dataGreatLeague && dataGreatLeague.isElidge ? dataGreatLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="tw-text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            className="tw-mr-2"
                            alt="Image League"
                            width={30}
                            height={30}
                            src={getPokemonBattleLeagueIcon(BattleLeagueCPType.Ultra)}
                          />
                          <span className={dataUltraLeague ? (dataUltraLeague.isElidge ? '' : 'text-danger') : ''}>
                            {getPokemonBattleLeagueName(BattleLeagueCPType.Ultra)}
                            {dataUltraLeague ? dataUltraLeague.isElidge ? '' : <span> (Not Elidge)</span> : ''}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Level</td>
                        <td colSpan={3}>{dataUltraLeague && dataUltraLeague.isElidge ? dataUltraLeague.level : '-'}</td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td colSpan={3}>{dataUltraLeague && dataUltraLeague.isElidge ? dataUltraLeague.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            className="tw-mr-2"
                            alt="Image Stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stardust Required
                        </td>
                        <td colSpan={3}>
                          {dataUltraLeague && dataUltraLeague.isElidge ? (
                            <span
                              className={`${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`}
                            >
                              {dataUltraLeague.rangeValue?.resultBetweenStardust}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Candy Required</td>
                        <td colSpan={3} className="!tw-p-0">
                          <div className="tw-flex tw-items-center td-style custom-border-right tw-float-left tw-w-1/2">
                            {dataUltraLeague && dataUltraLeague.isElidge ? (
                              <Candy id={searchingToolCurrentDetails?.id} className="tw-mr-2" />
                            ) : (
                              <img
                                className="tw-mr-2"
                                alt="Image Stardust"
                                height={20}
                                src={getItemSpritePath(ItemName.RareCandy)}
                              />
                            )}
                            {dataUltraLeague && dataUltraLeague.isElidge ? (
                              <span
                                className={
                                  statData?.pokemonType !== PokemonType.Lucky
                                    ? `${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`
                                    : ''
                                }
                              >
                                {dataUltraLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="tw-flex tw-items-center td-style tw-float-right tw-w-1/2">
                            {dataUltraLeague && dataUltraLeague.isElidge ? (
                              <CandyXL id={searchingToolCurrentDetails?.id} />
                            ) : (
                              <img
                                className="tw-mr-2"
                                alt="Image Stardust"
                                height={20}
                                src={getItemSpritePath(ItemName.XlRareCandy)}
                              />
                            )}
                            {dataUltraLeague && dataUltraLeague.isElidge ? (
                              <span
                                className={
                                  statData?.pokemonType !== PokemonType.Lucky
                                    ? `${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`
                                    : ''
                                }
                              >
                                {dataUltraLeague.rangeValue?.resultBetweenXLCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>Stats</td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                          {dataUltraLeague && dataUltraLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataUltraLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                          {dataUltraLeague && dataUltraLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-danger' : ''}>
                              {dataUltraLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                          {dataUltraLeague && dataUltraLeague.isElidge ? dataUltraLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="tw-text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            className="tw-mr-2"
                            alt="Image League"
                            width={30}
                            height={30}
                            src={getPokemonBattleLeagueIcon()}
                          />
                          {getPokemonBattleLeagueName()}
                        </td>
                      </tr>
                      <tr>
                        <td>Level</td>
                        <td colSpan={3}>{dataMasterLeague ? dataMasterLeague.level : '-'}</td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td colSpan={3}>{dataMasterLeague ? dataMasterLeague.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            className="tw-mr-2"
                            alt="Image Stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stardust Required
                        </td>
                        <td colSpan={3}>
                          {dataMasterLeague ? (
                            <span
                              className={`${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`}
                            >
                              {dataMasterLeague.rangeValue?.resultBetweenStardust}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Candy Required</td>
                        <td colSpan={3} className="!tw-p-0">
                          <div className="tw-flex tw-items-center td-style custom-border-right tw-float-left tw-w-1/2">
                            {dataMasterLeague ? (
                              <Candy id={searchingToolCurrentDetails?.id} className="tw-mr-2" />
                            ) : (
                              <img
                                className="tw-mr-2"
                                alt="Image Stardust"
                                height={20}
                                src={getItemSpritePath(ItemName.RareCandy)}
                              />
                            )}
                            {dataMasterLeague ? (
                              <span
                                className={
                                  statData?.pokemonType !== PokemonType.Lucky
                                    ? `${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`
                                    : ''
                                }
                              >
                                {dataMasterLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="tw-flex tw-items-center td-style tw-float-right tw-w-1/2">
                            {dataMasterLeague ? (
                              <CandyXL id={searchingToolCurrentDetails?.id} />
                            ) : (
                              <img
                                className="tw-mr-2"
                                alt="Image Stardust"
                                height={20}
                                src={getItemSpritePath(ItemName.XlRareCandy)}
                              />
                            )}
                            {dataMasterLeague ? (
                              <span
                                className={
                                  statData?.pokemonType !== PokemonType.Lucky
                                    ? `${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`
                                    : ''
                                }
                              >
                                {dataMasterLeague.rangeValue?.resultBetweenXLCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>Stats</td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                          {dataMasterLeague ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataMasterLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                          {dataMasterLeague ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-danger' : ''}>
                              {dataMasterLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="tw-text-center">
                          <img className="tw-mr-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                          {dataMasterLeague ? dataMasterLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Box>
          </div>
        </div>
        <hr />
      </div>
    </Fragment>
  );
};

export default Calculate;
