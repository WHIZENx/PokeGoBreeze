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
import { useSnackbar } from 'notistack';

import APIService from '../../../services/API.service';

import './CalculateStats.scss';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import Find from '../../../components/Find/Find';
import { useSelector } from 'react-redux';
import Candy from '../../../components/Sprites/Candy/Candy';
import CandyXL from '../../../components/Sprites/Candy/CandyXL';
import { SearchingState } from '../../../store/models/state.model';
import { IBattleLeagueCalculate, IBetweenLevelCalculate, IStatsCalculate } from '../../../utils/models/calculate.model';
import DynamicInputCP from '../../../components/Input/DynamicInputCP';
import { useTitle } from '../../../utils/hooks/useTitle';
import { isUndefined, toNumber } from '../../../utils/extension';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import { PokemonType, VariantType } from '../../../enums/type.enum';
import { ItemName } from '../../News/enums/item-type.enum';
import { minCp, minIv, maxIv, minLevel, maxLevel, stepLevel } from '../../../utils/helpers/context.helpers';

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
  const pokemon = useSelector((state: SearchingState) => state.searching.toolSearching?.current?.pokemon);

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

  const { enqueueSnackbar } = useSnackbar();

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
      enqueueSnackbar(`Please input CP greater than or equal to ${minCp()}`, { variant: VariantType.Error });
      return;
    }
    const statATK = toNumber(pokemon?.statsGO?.atk);
    const statDEF = toNumber(pokemon?.statsGO?.def);
    const statSTA = toNumber(pokemon?.statsGO?.sta);
    const name = splitAndCapitalize(pokemon?.fullName, '_', ' ');
    const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
    if (!result.level) {
      enqueueSnackbar(
        `At CP: ${result.CP} and IV ${result.IV.atkIV}/${result.IV.defIV}/${result.IV.staIV} impossible found in ${name}`,
        {
          variant: VariantType.Error,
        }
      );
      return;
    }
    enqueueSnackbar(
      `At CP: ${result.CP} and IV ${result.IV.atkIV}/${result.IV.defIV}/${result.IV.staIV} found in ${typePoke} ${name}`,
      {
        variant: VariantType.Success,
      }
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
    enqueueSnackbar,
    pokemon?.statsGO?.atk,
    pokemon?.statsGO?.def,
    pokemon?.statsGO?.sta,
    ATKIv,
    DEFIv,
    STAIv,
    searchCP,
    pokemon?.fullName,
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
      const statATK = toNumber(pokemon?.statsGO?.atk);
      const statDEF = toNumber(pokemon?.statsGO?.def);
      const statSTA = toNumber(pokemon?.statsGO?.sta);
      setStatData(
        calculateBetweenLevel(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, pokeStats.level, level, typePoke)
      );
    }
  };

  return (
    <Fragment>
      <div className="container mt-2">
        <Find isHide clearStats={clearArrStats} />
        <h1 id="main" className="text-center">
          Calculate Stats
        </h1>
        <form className="mt-2" onSubmit={onCalculateStatsPoke.bind(this)}>
          <div className="form-group d-flex justify-content-center text-center">
            <Box className="w-50" sx={{ minWidth: 350 }}>
              <div className="input-group mb-3 justify-content-center">
                <DynamicInputCP
                  statATK={pokemon?.statsGO?.atk}
                  statDEF={pokemon?.statsGO?.def}
                  statSTA={pokemon?.statsGO?.sta}
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
            <Box className="w-50" sx={{ minWidth: 300 }}>
              <div className="d-flex justify-content-between">
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
              <div className="d-flex justify-content-between">
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
              <div className="d-flex justify-content-between">
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
          <div className="d-flex justify-content-center text-center">
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
          <div className="form-group d-flex justify-content-center text-center mt-2">
            <button type="submit" className="btn btn-primary">
              Calculate
            </button>
          </div>
        </form>
        <div>
          <div className="d-flex justify-content-center text-center" style={{ height: 80 }}>
            <Box className="w-pct-60" sx={{ minWidth: 320 }}>
              <div className="d-flex justify-content-between">
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
          <div className="d-flex justify-content-center mt-3">
            <Box className="w-pct-80" sx={{ minWidth: 320 }}>
              <div className="row">
                <div className="col p-0">
                  <table className="table-info table-stats">
                    <thead>
                      <tr className="text-center">
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
                            className="me-2"
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
                            <Candy id={pokemon?.id} className="me-2" />
                          ) : (
                            <img
                              className="me-2"
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
                            <CandyXL id={pokemon?.id} />
                          ) : (
                            <img
                              className="me-2"
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
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={2}>
                          Stats
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img className="me-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                          ATK
                        </td>
                        <td>
                          {statData ? (
                            statData.pokemonType !== PokemonType.Shadow ? (
                              calculateStatsBattle(
                                toNumber(pokemon?.statsGO?.atk),
                                pokeStats?.IV.atkIV,
                                statLevel,
                                true
                              )
                            ) : (
                              <Fragment>
                                {statData.atkStat}
                                {toNumber(statData.atkStatDiff) > 0 && (
                                  <span className="text-success fw-medium">{` (+${statData.atkStatDiff})`}</span>
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
                          <img className="me-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                          DEF
                        </td>
                        <td>
                          {statData ? (
                            statData.pokemonType !== PokemonType.Shadow ? (
                              calculateStatsBattle(
                                toNumber(pokemon?.statsGO?.def),
                                pokeStats?.IV.defIV,
                                statLevel,
                                true
                              )
                            ) : (
                              <Fragment>
                                {statData.defStat}
                                {toNumber(statData.defStatDiff) > 0 && (
                                  <span className="text-danger fw-medium">{` (-${statData.defStatDiff})`}</span>
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
                          <img className="me-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                          HP
                        </td>
                        <td>
                          {statData
                            ? calculateStatsBattle(
                                toNumber(pokemon?.statsGO?.sta),
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
                <div className="col p-0">
                  <table className="table-info battle-league">
                    <thead className="text-center">
                      <tr>
                        <th colSpan={5}>Recommend in Battle League</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            className="me-2"
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
                            className="me-2"
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
                        <td colSpan={3} className="p-0">
                          <div className="d-flex align-items-center td-style custom-border-right float-start w-50">
                            {dataLittleLeague && dataLittleLeague.isElidge ? (
                              <Candy id={pokemon?.id} className="me-2" />
                            ) : (
                              <img
                                className="me-2"
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
                          <div className="d-flex align-items-center td-style float-end w-50">
                            {dataLittleLeague && dataLittleLeague.isElidge ? (
                              <CandyXL id={pokemon?.id} />
                            ) : (
                              <img
                                className="me-2"
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
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                          {dataLittleLeague && dataLittleLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataLittleLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                          {dataLittleLeague && dataLittleLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-danger' : ''}>
                              {dataLittleLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                          {dataLittleLeague && dataLittleLeague.isElidge ? dataLittleLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            className="me-2"
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
                            className="me-2"
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
                        <td colSpan={3} className="p-0">
                          <div className="d-flex align-items-center td-style custom-border-right float-start w-50">
                            {dataGreatLeague && dataGreatLeague.isElidge ? (
                              <Candy id={pokemon?.id} className="me-2" />
                            ) : (
                              <img
                                className="me-2"
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
                          <div className="d-flex align-items-center td-style float-end w-50">
                            {dataGreatLeague && dataGreatLeague.isElidge ? (
                              <CandyXL id={pokemon?.id} />
                            ) : (
                              <img
                                className="me-2"
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
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                          {dataGreatLeague && dataGreatLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataGreatLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                          {dataGreatLeague && dataGreatLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-danger' : ''}>
                              {dataGreatLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                          {dataGreatLeague && dataGreatLeague.isElidge ? dataGreatLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            className="me-2"
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
                            className="me-2"
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
                        <td colSpan={3} className="p-0">
                          <div className="d-flex align-items-center td-style custom-border-right float-start w-50">
                            {dataUltraLeague && dataUltraLeague.isElidge ? (
                              <Candy id={pokemon?.id} className="me-2" />
                            ) : (
                              <img
                                className="me-2"
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
                          <div className="d-flex align-items-center td-style float-end w-50">
                            {dataUltraLeague && dataUltraLeague.isElidge ? (
                              <CandyXL id={pokemon?.id} />
                            ) : (
                              <img
                                className="me-2"
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
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                          {dataUltraLeague && dataUltraLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataUltraLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                          {dataUltraLeague && dataUltraLeague.isElidge ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-danger' : ''}>
                              {dataUltraLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                          {dataUltraLeague && dataUltraLeague.isElidge ? dataUltraLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            className="me-2"
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
                            className="me-2"
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
                        <td colSpan={3} className="p-0">
                          <div className="d-flex align-items-center td-style custom-border-right float-start w-50">
                            {dataMasterLeague ? (
                              <Candy id={pokemon?.id} className="me-2" />
                            ) : (
                              <img
                                className="me-2"
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
                          <div className="d-flex align-items-center td-style float-end w-50">
                            {dataMasterLeague ? (
                              <CandyXL id={pokemon?.id} />
                            ) : (
                              <img
                                className="me-2"
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
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                          {dataMasterLeague ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataMasterLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                          {dataMasterLeague ? (
                            <span className={statData?.pokemonType === PokemonType.Shadow ? 'text-danger' : ''}>
                              {dataMasterLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img className="me-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
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
