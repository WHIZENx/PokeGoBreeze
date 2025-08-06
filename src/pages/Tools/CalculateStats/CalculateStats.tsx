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

  const renderLeague = (cp: BattleLeagueCPType, dataLeague: IBattleLeagueCalculate | undefined) => (
    <>
      <tr className="tw-text-center">
        <td className="table-sub-header" colSpan={4}>
          <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
            <img alt="Image League" width={30} height={30} src={getPokemonBattleLeagueIcon(cp)} />
            <span className={dataLeague ? (dataLeague.isElidge ? '' : 'text-danger') : ''}>
              {getPokemonBattleLeagueName(cp)}
              {dataLeague ? dataLeague.isElidge ? '' : <span> (Not Elidge)</span> : ''}
            </span>
          </div>
        </td>
      </tr>
      <tr>
        <td>Level</td>
        <td colSpan={3}>{dataLeague?.isElidge ? dataLeague.level : '-'}</td>
      </tr>
      <tr>
        <td>CP</td>
        <td colSpan={3}>{dataLeague?.isElidge ? dataLeague.CP : '-'}</td>
      </tr>
      <tr>
        <td>
          <div className="tw-flex tw-items-center tw-gap-2">
            <img alt="Image Stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
            <span>Stardust Required</span>
          </div>
        </td>
        <td colSpan={3}>
          {dataLeague?.isElidge ? (
            <span className={`${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`}>
              {dataLeague.rangeValue?.resultBetweenStardust}
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
            {dataLeague?.isElidge ? (
              <Candy id={searchingToolCurrentDetails?.id} className="tw-mr-2" />
            ) : (
              <img className="tw-mr-2" alt="Image Stardust" height={20} src={getItemSpritePath(ItemName.RareCandy)} />
            )}
            {dataLeague?.isElidge ? (
              <span
                className={
                  statData?.pokemonType !== PokemonType.Lucky
                    ? `${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`
                    : ''
                }
              >
                {dataLeague.rangeValue?.resultBetweenCandy}
              </span>
            ) : (
              '-'
            )}
          </div>
          <div className="tw-flex tw-items-center td-style tw-float-right tw-w-1/2">
            {dataLeague?.isElidge ? (
              <CandyXL id={searchingToolCurrentDetails?.id} />
            ) : (
              <img className="tw-mr-2" alt="Image Stardust" height={20} src={getItemSpritePath(ItemName.XlRareCandy)} />
            )}
            {dataLeague?.isElidge ? (
              <span
                className={
                  statData?.pokemonType !== PokemonType.Lucky
                    ? `${getKeyWithData(PokemonType, statData?.pokemonType)?.toLowerCase()}-text`
                    : ''
                }
              >
                {dataLeague.rangeValue?.resultBetweenXLCandy}
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
          <div className="tw-flex tw-items-center tw-gap-2">
            <img alt="Image League" width={20} height={20} src={ATK_LOGO} />
            {dataLeague?.isElidge ? (
              <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-success' : ''}>
                {dataLeague.stats?.atk}
              </span>
            ) : (
              '-'
            )}
          </div>
        </td>
        <td className="tw-text-center">
          <div className="tw-flex tw-items-center tw-gap-2">
            <img alt="Image League" width={20} height={20} src={DEF_LOGO} />
            {dataLeague?.isElidge ? (
              <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-danger' : ''}>
                {dataLeague.stats?.def}
              </span>
            ) : (
              '-'
            )}
          </div>
        </td>
        <td className="tw-text-center">
          <div className="tw-flex tw-items-center tw-gap-2">
            <img alt="Image League" width={20} height={20} src={HP_LOGO} />
            <span>{dataLeague?.isElidge ? dataLeague.stats?.sta : '-'}</span>
          </div>
        </td>
      </tr>
    </>
  );

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
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <img height={28} alt="Image Buddy" src={APIService.getPokeBuddy()} />
                    <span>{getKeyWithData(PokemonType, PokemonType.Buddy)}</span>
                  </div>
                }
              />
              <FormControlLabel
                value={PokemonType.Lucky}
                control={<Radio />}
                label={
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <img height={28} alt="Image Lucky" src={APIService.getPokeLucky()} />
                    <span>{getKeyWithData(PokemonType, PokemonType.Lucky)}</span>
                  </div>
                }
              />
              <FormControlLabel
                value={PokemonType.Shadow}
                control={<Radio />}
                label={
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <img height={32} alt="Image Shadow" src={APIService.getPokeShadow()} />
                    <span>{getKeyWithData(PokemonType, PokemonType.Shadow)}</span>
                  </div>
                }
              />
              <FormControlLabel
                value={PokemonType.Purified}
                control={<Radio />}
                label={
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <img height={32} alt="Image Purified" src={APIService.getPokePurified()} />
                    <span>{getKeyWithData(PokemonType, PokemonType.Purified)}</span>
                  </div>
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
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <img alt="Image Stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                            <span>Stardust Required</span>
                          </div>
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
                          <div className="tw-flex tw-items-center tw-gap-2">
                            {statData ? (
                              <Candy id={searchingToolCurrentDetails?.id} />
                            ) : (
                              <img alt="Image Stardust" height={20} src={getItemSpritePath(ItemName.RareCandy)} />
                            )}
                            <span>Candy Required</span>
                          </div>
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
                          <div className="tw-flex tw-items-center tw-gap-2">
                            {statData ? (
                              <CandyXL id={searchingToolCurrentDetails?.id} />
                            ) : (
                              <img alt="Image Stardust" height={20} src={getItemSpritePath(ItemName.XlRareCandy)} />
                            )}
                            <span>XL Candy Required</span>
                          </div>
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
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <img alt="Image League" width={20} height={20} src={ATK_LOGO} />
                            <span>ATK</span>
                          </div>
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
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <img alt="Image League" width={20} height={20} src={DEF_LOGO} />
                            <span>DEF</span>
                          </div>
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
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <img alt="Image League" width={20} height={20} src={HP_LOGO} />
                            <span>HP</span>
                          </div>
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
                      {renderLeague(BattleLeagueCPType.Little, dataLittleLeague)}
                      {renderLeague(BattleLeagueCPType.Great, dataGreatLeague)}
                      {renderLeague(BattleLeagueCPType.Ultra, dataUltraLeague)}
                      {renderLeague(BattleLeagueCPType.Master, dataMasterLeague)}
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
