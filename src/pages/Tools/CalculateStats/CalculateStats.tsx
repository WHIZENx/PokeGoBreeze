import React, { Fragment, useCallback, useState } from 'react';

import { capitalize, LevelSlider, marks, PokeGoSlider, splitAndCapitalize, TypeRadioGroup } from '../../../util/utils';
import { calculateBattleLeague, calculateBetweenLevel, calculateStats, calculateStatsBattle } from '../../../util/calculate';

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
import { StoreState, SearchingState } from '../../../store/models/state.model';
import { MAX_IV, MAX_LEVEL, MIN_IV, MIN_LEVEL } from '../../../util/constants';
import { IBattleLeagueCalculate, IBetweenLevelCalculate, IStatsCalculate } from '../../../util/models/calculate.model';
import DynamicInputCP from '../../../components/Input/DynamicInputCP';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { getValueOrDefault, isNullOrEmpty, isUndefined, toNumber } from '../../../util/extension';
import { EvoPath } from '../../../core/models/API/species.model';
import { PokemonType } from '../BattleDamage/enums/damage.enum';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../util/compute';
import { BattleLeagueCPType } from '../../../util/enums/compute.enum';
import { VariantType } from '../../../enums/type.enum';

const Calculate = () => {
  useChangeTitle('Calculate CP&IV - Tool');
  const globalOptions = useSelector((state: StoreState) => state.store.data.options);
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);

  const [id, setId] = useState(searching ? searching.id : 1);
  const [name, setName] = useState(splitAndCapitalize(searching?.fullName, '-', ' '));

  const [searchCP, setSearchCP] = useState('');

  const [ATKIv, setATKIv] = useState(0);
  const [DEFIv, setDEFIv] = useState(0);
  const [STAIv, setSTAIv] = useState(0);

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [typePoke, setTypePoke] = useState(PokemonType.None);

  const [pokeStats, setPokeStats] = useState<IStatsCalculate>();
  const [statLevel, setStatLevel] = useState(1);
  const [statData, setStatData] = useState<IBetweenLevelCalculate>();

  const [dataLittleLeague, setDataLittleLeague] = useState<IBattleLeagueCalculate>();
  const [dataGreatLeague, setDataGreatLeague] = useState<IBattleLeagueCalculate>();
  const [dataUltraLeague, setDataUltraLeague] = useState<IBattleLeagueCalculate>();
  const [dataMasterLeague, setDataMasterLeague] = useState<IBattleLeagueCalculate>();

  const [urlEvo, setUrlEvo] = useState<EvoPath>({ url: '' });

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
    if (toNumber(searchCP) < 10) {
      enqueueSnackbar('Please input CP greater than or equal to 10', { variant: VariantType.Error });
      return;
    }
    const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
    if (!result.level) {
      enqueueSnackbar(`At CP: ${result.CP} and IV ${result.IV.atk}/${result.IV.def}/${result.IV.sta} impossible found in ${name}`, {
        variant: VariantType.Error,
      });
      return;
    }
    enqueueSnackbar(`At CP: ${result.CP} and IV ${result.IV.atk}/${result.IV.def}/${result.IV.sta} found in ${typePoke} ${name}`, {
      variant: VariantType.Success,
    });
    setPokeStats(result);
    setStatLevel(result.level);
    setStatData(calculateBetweenLevel(globalOptions, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.level, typePoke));
    setDataLittleLeague(
      calculateBattleLeague(
        globalOptions,
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
        globalOptions,
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
        globalOptions,
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
      calculateBattleLeague(globalOptions, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.CP, typePoke)
    );
  }, [enqueueSnackbar, globalOptions, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP, name, typePoke]);

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
      setStatData(calculateBetweenLevel(globalOptions, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, pokeStats.level, level, typePoke));
    }
  };

  return (
    <Fragment>
      <div className="container element-top">
        <Find
          isHide={true}
          clearStats={clearArrStats}
          setStatATK={setStatATK}
          setStatDEF={setStatDEF}
          setStatSTA={setStatSTA}
          setId={setId}
          setName={setName}
          urlEvo={urlEvo}
          setUrlEvo={setUrlEvo}
        />
        <h1 id="main" className="text-center">
          Calculate Stats
        </h1>
        <form className="element-top" onSubmit={onCalculateStatsPoke.bind(this)}>
          <div className="form-group d-flex justify-content-center text-center">
            <Box sx={{ width: '50%', minWidth: 350 }}>
              <div className="input-group mb-3">
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
          <div className="d-flex justify-content-center text-center">
            <TypeRadioGroup
              row={true}
              aria-labelledby="row-types-group-label"
              name="row-types-group"
              defaultValue={PokemonType.None}
              onChange={(e) => {
                setPokeStats(undefined);
                setStatData(undefined);
                setStatLevel(0);
                setDataLittleLeague(undefined);
                setDataGreatLeague(undefined);
                setDataUltraLeague(undefined);
                setDataMasterLeague(undefined);
                setTypePoke(e.target.value as PokemonType);
              }}
            >
              <FormControlLabel value={PokemonType.None} control={<Radio />} label={<span>{capitalize(PokemonType.None)}</span>} />
              <FormControlLabel
                value={PokemonType.Buddy}
                control={<Radio />}
                label={
                  <span>
                    <img height={28} alt="img-buddy" src={APIService.getPokeBuddy()} /> {capitalize(PokemonType.Buddy)}
                  </span>
                }
              />
              <FormControlLabel
                value={PokemonType.Lucky}
                control={<Radio />}
                label={
                  <span>
                    <img height={28} alt="img-lucky" src={APIService.getPokeLucky()} /> {capitalize(PokemonType.Lucky)}
                  </span>
                }
              />
              <FormControlLabel
                value={PokemonType.Shadow}
                control={<Radio />}
                label={
                  <span>
                    <img height={32} alt="img-shadow" src={APIService.getPokeShadow()} /> {capitalize(PokemonType.Shadow)}
                  </span>
                }
              />
              <FormControlLabel
                value={PokemonType.Purified}
                control={<Radio />}
                label={
                  <span>
                    <img height={32} alt="img-purified" src={APIService.getPokePurified()} /> {capitalize(PokemonType.Purified)}
                  </span>
                }
              />
            </TypeRadioGroup>
          </div>
          <div className="form-group d-flex justify-content-center text-center element-top">
            <button type="submit" className="btn btn-primary">
              Calculate
            </button>
          </div>
        </form>
        <div>
          <div className="d-flex justify-content-center text-center" style={{ height: 80 }}>
            <Box sx={{ width: '60%', minWidth: 320 }}>
              <div className="d-flex justify-content-between">
                <b>Level</b>
                <b>{statData ? statLevel : 'None'}</b>
              </div>
              <LevelSlider
                aria-label="Level"
                value={statLevel}
                defaultValue={MIN_LEVEL}
                valueLabelDisplay="off"
                step={0.5}
                min={MIN_LEVEL}
                max={typePoke === PokemonType.Buddy ? MAX_LEVEL : MAX_LEVEL - 1}
                marks={pokeStats ? [{ value: pokeStats.level, label: 'Result LV' }] : false}
                disabled={!pokeStats}
                onChange={(_, value) => onHandleLevel(value as number)}
              />
            </Box>
          </div>
          <div className="d-flex justify-content-center" style={{ marginTop: 15 }}>
            <Box sx={{ width: '80%', minWidth: 320 }}>
              <div className="row">
                <div className="col" style={{ padding: 0 }}>
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
                        <td>{statData ? (!isUndefined(statData.powerUpCount) ? statData.powerUpCount : 'Unavailable') : '-'}</td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td>{statData ? statData.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stardust Required
                        </td>
                        <td>
                          {statData ? (
                            statData.resultBetweenStadust > 0 ? (
                              <span>
                                {statData.resultBetweenStadust}
                                {!isNullOrEmpty(statData.type) && getValueOrDefault(Number, statData.resultBetweenStadustDiff) > 0 && (
                                  <Fragment>
                                    {statData.type === PokemonType.Shadow && (
                                      <span className="shadow-text"> (+{statData.resultBetweenStadustDiff})</span>
                                    )}
                                    {statData.type === PokemonType.Purified && (
                                      <span className="purified-text"> (-{statData.resultBetweenStadustDiff})</span>
                                    )}
                                    {statData.type === PokemonType.Lucky && (
                                      <span className="buddy-text"> (-{statData.resultBetweenStadustDiff})</span>
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
                            <Candy id={id} style={{ marginRight: 8 }} />
                          ) : (
                            <img style={{ marginRight: 8 }} alt="img-stardust" height={20} src={APIService.getItemSprite('Item_1301')} />
                          )}
                          Candy Required
                        </td>
                        <td>
                          {statData ? (
                            statData.resultBetweenCandy > 0 ? (
                              <span>
                                {statData.resultBetweenCandy}
                                {!isNullOrEmpty(statData.type) && getValueOrDefault(Number, statData.resultBetweenCandyDiff) > 0 && (
                                  <Fragment>
                                    {statData.type === PokemonType.Shadow && (
                                      <span className="shadow-text"> (+{statData.resultBetweenCandyDiff})</span>
                                    )}
                                    {statData.type === PokemonType.Purified && (
                                      <span className="purified-text"> (-{statData.resultBetweenCandyDiff})</span>
                                    )}
                                    {statData.type === PokemonType.Lucky && (
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
                            <CandyXL id={id} />
                          ) : (
                            <img
                              style={{ marginRight: 10 }}
                              alt="img-stardust"
                              height={20}
                              src={APIService.getItemSprite('RareXLCandy_PSD')}
                            />
                          )}
                          XL Candy Required
                        </td>
                        <td>
                          {statData ? (
                            statData.resultBetweenXLCandy > 0 ? (
                              <span>
                                {statData.resultBetweenXLCandy}
                                {!isNullOrEmpty(statData.type) && getValueOrDefault(Number, statData.resultBetweenXLCandyDiff) > 0 && (
                                  <Fragment>
                                    {statData.type === PokemonType.Shadow && (
                                      <span className="shadow-text"> (+{statData.resultBetweenXLCandyDiff})</span>
                                    )}
                                    {statData.type === PokemonType.Purified && (
                                      <span className="purified-text"> (-{statData.resultBetweenXLCandyDiff})</span>
                                    )}
                                    {statData.type === PokemonType.Lucky && (
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
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={ATK_LOGO} />
                          ATK
                        </td>
                        <td>
                          {statData ? (
                            statData.type !== PokemonType.Shadow ? (
                              calculateStatsBattle(statATK, getValueOrDefault(Number, pokeStats?.IV.atk), statLevel, true)
                            ) : (
                              <Fragment>
                                {statData.atkStat}
                                {getValueOrDefault(Number, statData.atkStatDiff) > 0 && (
                                  <span className="text-success" style={{ fontWeight: 500 }}>
                                    {' '}
                                    (+{statData.atkStatDiff})
                                  </span>
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
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                          DEF
                        </td>
                        <td>
                          {statData ? (
                            statData.type !== PokemonType.Shadow ? (
                              calculateStatsBattle(statDEF, getValueOrDefault(Number, pokeStats?.IV.def), statLevel, true)
                            ) : (
                              <Fragment>
                                {statData.defStat}
                                {getValueOrDefault(Number, statData.defStatDiff) > 0 && (
                                  <span className="text-danger" style={{ fontWeight: 500 }}>
                                    {' '}
                                    (-{statData?.defStatDiff})
                                  </span>
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
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={HP_LOGO} />
                          HP
                        </td>
                        <td>
                          {statData ? calculateStatsBattle(statSTA, getValueOrDefault(Number, pokeStats?.IV.sta), statLevel, true) : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col" style={{ padding: 0 }}>
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
                            style={{ marginRight: 10 }}
                            alt="img-league"
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
                        <td colSpan={3}>{dataLittleLeague && dataLittleLeague.isElidge ? dataLittleLeague.level : '-'}</td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td colSpan={3}>{dataLittleLeague && dataLittleLeague.isElidge ? dataLittleLeague.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stardust Required
                        </td>
                        <td colSpan={3}>
                          {dataLittleLeague && dataLittleLeague.isElidge ? (
                            <span className={`${statData?.type}-text`}>{dataLittleLeague.rangeValue?.resultBetweenStadust}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Candy Required</td>
                        <td colSpan={3} style={{ padding: 0 }}>
                          <div
                            className="d-flex align-items-center td-style"
                            style={{
                              float: 'left',
                              width: '50%',
                              borderRight: '1px solid #b8d4da',
                            }}
                          >
                            {dataLittleLeague && dataLittleLeague.isElidge ? (
                              <Candy id={id} style={{ marginRight: 10 }} />
                            ) : (
                              <img style={{ marginRight: 10 }} alt="img-stardust" height={20} src={APIService.getItemSprite('Item_1301')} />
                            )}
                            {dataLittleLeague && dataLittleLeague.isElidge ? (
                              <span className={statData?.type !== PokemonType.Lucky ? `${statData?.type}-text` : ''}>
                                {dataLittleLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="d-flex align-items-center td-style" style={{ float: 'right', width: '50%' }}>
                            {dataLittleLeague && dataLittleLeague.isElidge ? (
                              <CandyXL id={id} />
                            ) : (
                              <img
                                style={{ marginRight: 10 }}
                                alt="img-stardust"
                                height={20}
                                src={APIService.getItemSprite('RareXLCandy_PSD')}
                              />
                            )}
                            {dataLittleLeague && dataLittleLeague.isElidge ? (
                              <span className={statData?.type !== PokemonType.Lucky ? `${statData?.type}-text` : ''}>
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
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={ATK_LOGO} />
                          {dataLittleLeague && dataLittleLeague.isElidge ? (
                            <span className={statData?.type === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataLittleLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                          {dataLittleLeague && dataLittleLeague.isElidge ? (
                            <span className={statData?.type === PokemonType.Shadow ? 'text-danger' : ''}>
                              {dataLittleLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={HP_LOGO} />
                          {dataLittleLeague && dataLittleLeague.isElidge ? dataLittleLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-league"
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
                            style={{ marginRight: 10 }}
                            alt="img-stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stardust Required
                        </td>
                        <td colSpan={3}>
                          {dataGreatLeague && dataGreatLeague.isElidge ? (
                            <span className={`${statData?.type}-text`}>{dataGreatLeague.rangeValue?.resultBetweenStadust}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Candy Required</td>
                        <td colSpan={3} style={{ padding: 0 }}>
                          <div
                            className="d-flex align-items-center td-style"
                            style={{
                              float: 'left',
                              width: '50%',
                              borderRight: '1px solid #b8d4da',
                            }}
                          >
                            {dataGreatLeague && dataGreatLeague.isElidge ? (
                              <Candy id={id} style={{ marginRight: 10 }} />
                            ) : (
                              <img style={{ marginRight: 10 }} alt="img-stardust" height={20} src={APIService.getItemSprite('Item_1301')} />
                            )}
                            {dataGreatLeague && dataGreatLeague.isElidge ? (
                              <span className={statData?.type !== PokemonType.Lucky ? `${statData?.type}-text` : ''}>
                                {dataGreatLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="d-flex align-items-center td-style" style={{ float: 'right', width: '50%' }}>
                            {dataGreatLeague && dataGreatLeague.isElidge ? (
                              <CandyXL id={id} />
                            ) : (
                              <img
                                style={{ marginRight: 10 }}
                                alt="img-stardust"
                                height={20}
                                src={APIService.getItemSprite('RareXLCandy_PSD')}
                              />
                            )}
                            {dataGreatLeague && dataGreatLeague.isElidge ? (
                              <span className={statData?.type !== PokemonType.Lucky ? `${statData?.type}-text` : ''}>
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
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={ATK_LOGO} />
                          {dataGreatLeague && dataGreatLeague.isElidge ? (
                            <span className={statData?.type === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataGreatLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                          {dataGreatLeague && dataGreatLeague.isElidge ? (
                            <span className={statData?.type === PokemonType.Shadow ? 'text-danger' : ''}>{dataGreatLeague.stats?.def}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={HP_LOGO} />
                          {dataGreatLeague && dataGreatLeague.isElidge ? dataGreatLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-league"
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
                            style={{ marginRight: 10 }}
                            alt="img-stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stardust Required
                        </td>
                        <td colSpan={3}>
                          {dataUltraLeague && dataUltraLeague.isElidge ? (
                            <span className={`${statData?.type}-text`}>{dataUltraLeague.rangeValue?.resultBetweenStadust}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Candy Required</td>
                        <td colSpan={3} style={{ padding: 0 }}>
                          <div
                            className="d-flex align-items-center td-style"
                            style={{
                              float: 'left',
                              width: '50%',
                              borderRight: '1px solid #b8d4da',
                            }}
                          >
                            {dataUltraLeague && dataUltraLeague.isElidge ? (
                              <Candy id={id} style={{ marginRight: 10 }} />
                            ) : (
                              <img style={{ marginRight: 10 }} alt="img-stardust" height={20} src={APIService.getItemSprite('Item_1301')} />
                            )}
                            {dataUltraLeague && dataUltraLeague.isElidge ? (
                              <span className={statData?.type !== PokemonType.Lucky ? `${statData?.type}-text` : ''}>
                                {dataUltraLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="d-flex align-items-center td-style" style={{ float: 'right', width: '50%' }}>
                            {dataUltraLeague && dataUltraLeague.isElidge ? (
                              <CandyXL id={id} />
                            ) : (
                              <img
                                style={{ marginRight: 10 }}
                                alt="img-stardust"
                                height={20}
                                src={APIService.getItemSprite('RareXLCandy_PSD')}
                              />
                            )}
                            {dataUltraLeague && dataUltraLeague.isElidge ? (
                              <span className={statData?.type !== PokemonType.Lucky ? `${statData?.type}-text` : ''}>
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
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={ATK_LOGO} />
                          {dataUltraLeague && dataUltraLeague.isElidge ? (
                            <span className={statData?.type === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataUltraLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                          {dataUltraLeague && dataUltraLeague.isElidge ? (
                            <span className={statData?.type === PokemonType.Shadow ? 'text-danger' : ''}>{dataUltraLeague.stats?.def}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={HP_LOGO} />
                          {dataUltraLeague && dataUltraLeague.isElidge ? dataUltraLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img style={{ marginRight: 10 }} alt="img-league" width={30} height={30} src={getPokemonBattleLeagueIcon()} />
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
                            style={{ marginRight: 10 }}
                            alt="img-stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stardust Required
                        </td>
                        <td colSpan={3}>
                          {dataMasterLeague ? (
                            <span className={`${statData?.type}-text`}>{dataMasterLeague.rangeValue?.resultBetweenStadust}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Candy Required</td>
                        <td colSpan={3} style={{ padding: 0 }}>
                          <div
                            className="d-flex align-items-center td-style"
                            style={{
                              float: 'left',
                              width: '50%',
                              borderRight: '1px solid #b8d4da',
                            }}
                          >
                            {dataMasterLeague ? (
                              <Candy id={id} style={{ marginRight: 10 }} />
                            ) : (
                              <img style={{ marginRight: 10 }} alt="img-stardust" height={20} src={APIService.getItemSprite('Item_1301')} />
                            )}
                            {dataMasterLeague ? (
                              <span className={statData?.type !== PokemonType.Lucky ? `${statData?.type}-text` : ''}>
                                {dataMasterLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="d-flex align-items-center td-style" style={{ float: 'right', width: '50%' }}>
                            {dataMasterLeague ? (
                              <CandyXL id={id} />
                            ) : (
                              <img
                                style={{ marginRight: 10 }}
                                alt="img-stardust"
                                height={20}
                                src={APIService.getItemSprite('RareXLCandy_PSD')}
                              />
                            )}
                            {dataMasterLeague ? (
                              <span className={statData?.type !== PokemonType.Lucky ? `${statData?.type}-text` : ''}>
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
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={ATK_LOGO} />
                          {dataMasterLeague ? (
                            <span className={statData?.type === PokemonType.Shadow ? 'text-success' : ''}>
                              {dataMasterLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                          {dataMasterLeague ? (
                            <span className={statData?.type === PokemonType.Shadow ? 'text-danger' : ''}>
                              {dataMasterLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={HP_LOGO} />
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
