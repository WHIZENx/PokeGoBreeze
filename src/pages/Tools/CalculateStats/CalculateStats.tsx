import React, { Fragment, useCallback, useState } from 'react';

import { capitalize, LevelSlider, marks, PokeGoSlider, splitAndCapitalize, TypeRadioGroup } from '../../../util/Utils';
import { calculateBattleLeague, calculateBetweenLevel, calculateStats, calculateStatsBattle } from '../../../util/Calculate';

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
import { FORM_PURIFIED, FORM_SHADOW, MAX_IV, MAX_LEVEL, MIN_IV, MIN_LEVEL } from '../../../util/Constants';
import { IBattleLeagueCalculate, IBetweenLevelCalculate, IStatsCalculate } from '../../../util/models/calculate.model';
import DynamicInputCP from '../../../components/Input/DynamicInputCP';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';

const Calculate = () => {
  useChangeTitle('Calculate CP&IV - Tool');
  const globalOptions = useSelector((state: StoreState) => state.store?.data?.options ?? undefined);
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

  const [typePoke, setTypePoke] = useState('');

  const [pokeStats, setPokeStats]: [IStatsCalculate | undefined, React.Dispatch<React.SetStateAction<IStatsCalculate | undefined>>] =
    useState();
  const [statLevel, setStatLevel] = useState(1);
  const [statData, setStatData]: [
    IBetweenLevelCalculate | undefined,
    React.Dispatch<React.SetStateAction<IBetweenLevelCalculate | undefined>>
  ] = useState();

  const [dataLittleLeague, setDataLittleLeague]: [
    IBattleLeagueCalculate | undefined,
    React.Dispatch<React.SetStateAction<IBattleLeagueCalculate | undefined>>
  ] = useState();
  const [dataGreatLeague, setDataGreatLeague]: [
    IBattleLeagueCalculate | undefined,
    React.Dispatch<React.SetStateAction<IBattleLeagueCalculate | undefined>>
  ] = useState();
  const [dataUltraLeague, setDataUltraLeague]: [
    IBattleLeagueCalculate | undefined,
    React.Dispatch<React.SetStateAction<IBattleLeagueCalculate | undefined>>
  ] = useState();
  const [dataMasterLeague, setDataMasterLeague]: [
    IBattleLeagueCalculate | undefined,
    React.Dispatch<React.SetStateAction<IBattleLeagueCalculate | undefined>>
  ] = useState();

  const [urlEvo, setUrlEvo] = useState({ url: '' });

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
    if (!searchCP || parseInt(searchCP) < 10 || isNaN(parseInt(searchCP))) {
      return enqueueSnackbar('Please input CP greater than or equal to 10', { variant: 'error' });
    }
    const result = calculateStats(statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP);
    if (!result.level) {
      return enqueueSnackbar(`At CP: ${result.CP} and IV ${result.IV.atk}/${result.IV.def}/${result.IV.sta} impossible found in ${name}`, {
        variant: 'error',
      });
    }
    enqueueSnackbar(`At CP: ${result.CP} and IV ${result.IV.atk}/${result.IV.def}/${result.IV.sta} found in ${typePoke} ${name}`, {
      variant: 'success',
    });
    setPokeStats(result);
    setStatLevel(result.level);
    setStatData(calculateBetweenLevel(globalOptions, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.level, typePoke));
    setDataLittleLeague(
      calculateBattleLeague(globalOptions, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.CP, 500, typePoke)
    );
    setDataGreatLeague(
      calculateBattleLeague(globalOptions, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.CP, 1500, typePoke)
    );
    setDataUltraLeague(
      calculateBattleLeague(globalOptions, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.CP, 2500, typePoke)
    );
    setDataMasterLeague(
      calculateBattleLeague(globalOptions, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, result.level, result.CP, null, typePoke)
    );
  }, [enqueueSnackbar, globalOptions, statATK, statDEF, statSTA, ATKIv, DEFIv, STAIv, searchCP, name, typePoke]);

  const onCalculateStatsPoke = useCallback(
    (e: { preventDefault: () => void }) => {
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
          hide={true}
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
              defaultValue={''}
              onChange={(e) => setTypePoke(e.target.value)}
            >
              <FormControlLabel value="" control={<Radio />} label={<span>None</span>} />
              <FormControlLabel
                value="buddy"
                control={<Radio />}
                label={
                  <span>
                    <img height={28} alt="img-buddy" src={APIService.getPokeBuddy()} /> Buddy
                  </span>
                }
              />
              <FormControlLabel
                value="shadow"
                control={<Radio />}
                label={
                  <span>
                    <img height={32} alt="img-shadow" src={APIService.getPokeShadow()} /> {capitalize(FORM_SHADOW)}
                  </span>
                }
              />
              <FormControlLabel
                value="purified"
                control={<Radio />}
                label={
                  <span>
                    <img height={32} alt="img-purified" src={APIService.getPokePurified()} /> {capitalize(FORM_PURIFIED)}
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
                max={typePoke === 'buddy' ? MAX_LEVEL : MAX_LEVEL - 1}
                marks={pokeStats ? [{ value: pokeStats.level, label: 'Result LV' }] : false}
                disabled={pokeStats ? false : true}
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
                        <td>{statData ? (statData?.powerUpCount != null ? statData?.powerUpCount : 'Unavailable') : '-'}</td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td>{statData ? statData?.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stadust Required
                        </td>
                        <td>
                          {statData ? (
                            statData?.resultBetweenStadust != null ? (
                              <span>
                                {statData?.resultBetweenStadust}
                                {statData?.type !== '' && (statData?.resultBetweenStadustDiff ?? 0) > 0 && (
                                  <Fragment>
                                    {statData?.type?.toUpperCase() === FORM_SHADOW && (
                                      <span className="shadow-text"> (+{statData?.resultBetweenStadustDiff})</span>
                                    )}
                                    {statData?.type?.toUpperCase() === FORM_PURIFIED && (
                                      <span className="purified-text"> (-{statData?.resultBetweenStadustDiff})</span>
                                    )}
                                    {statData?.type === 'buddy' && (
                                      <span className="buddy-text"> (-{statData?.resultBetweenStadustDiff})</span>
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
                            statData?.resultBetweenCandy != null ? (
                              <span>
                                {statData?.resultBetweenCandy}
                                {statData?.type !== '' && (statData?.resultBetweenCandyDiff ?? 0) > 0 && (
                                  <Fragment>
                                    {statData?.type?.toUpperCase() === FORM_SHADOW && (
                                      <span className="shadow-text"> (+{statData?.resultBetweenCandyDiff})</span>
                                    )}
                                    {statData?.type?.toUpperCase() === FORM_PURIFIED && (
                                      <span className="purified-text"> (-{statData?.resultBetweenCandyDiff})</span>
                                    )}
                                    {statData?.type === 'buddy' && (
                                      <span className="buddy-text"> (-{statData?.resultBetweenCandyDiff})</span>
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
                            statData?.resultBetweenXLCandy != null ? (
                              <span>
                                {statData?.resultBetweenXLCandy}
                                {statData?.type !== '' && (statData?.resultBetweenXLCandyDiff ?? 0) > 0 && (
                                  <Fragment>
                                    {statData?.type?.toUpperCase() === FORM_SHADOW && (
                                      <span className="shadow-text"> (+{statData?.resultBetweenXLCandyDiff})</span>
                                    )}
                                    {statData?.type?.toUpperCase() === FORM_PURIFIED && (
                                      <span className="purified-text"> (-{statData?.resultBetweenXLCandyDiff})</span>
                                    )}
                                    {statData?.type === 'buddy' && (
                                      <span className="buddy-text"> (-{statData?.resultBetweenXLCandyDiff})</span>
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
                            statData?.type?.toUpperCase() !== FORM_SHADOW ? (
                              calculateStatsBattle(statATK, pokeStats?.IV.atk ?? 0, statLevel, true)
                            ) : (
                              <Fragment>
                                {statData?.atkStat}
                                {(statData?.atkStatDiff ?? 0) > 0 && (
                                  <span className="text-success" style={{ fontWeight: 500 }}>
                                    {' '}
                                    (+{statData?.atkStatDiff})
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
                            statData?.type?.toUpperCase() !== FORM_SHADOW ? (
                              calculateStatsBattle(statDEF, pokeStats?.IV.def ?? 0, statLevel, true)
                            ) : (
                              <Fragment>
                                {statData?.defStat}
                                {(statData?.defStatDiff ?? 0) > 0 && (
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
                        <td>{statData ? calculateStatsBattle(statSTA, pokeStats?.IV.sta ?? 0, statLevel, true) : '-'}</td>
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
                            src={APIService.getPokeOtherLeague('GBL_littlecup')}
                          />
                          <span className={dataLittleLeague ? (dataLittleLeague.elidge ? '' : 'text-danger') : ''}>
                            Little Cup
                            {dataLittleLeague ? dataLittleLeague.elidge ? '' : <span> (Not Elidge)</span> : ''}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Level</td>
                        <td colSpan={3}>{dataLittleLeague && dataLittleLeague.elidge ? dataLittleLeague.level : '-'}</td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td colSpan={3}>{dataLittleLeague && dataLittleLeague.elidge ? dataLittleLeague.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stadust Required
                        </td>
                        <td colSpan={3}>
                          {dataLittleLeague && dataLittleLeague.elidge ? (
                            <span className={statData?.type + '-text'}>{dataLittleLeague.rangeValue?.resultBetweenStadust}</span>
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
                            {dataLittleLeague && dataLittleLeague.elidge ? (
                              <Candy id={id} style={{ marginRight: 10 }} />
                            ) : (
                              <img style={{ marginRight: 10 }} alt="img-stardust" height={20} src={APIService.getItemSprite('Item_1301')} />
                            )}
                            {dataLittleLeague && dataLittleLeague.elidge ? (
                              <span className={statData?.type !== 'buddy' ? statData?.type + '-text' : ''}>
                                {dataLittleLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="d-flex align-items-center td-style" style={{ float: 'right', width: '50%' }}>
                            {dataLittleLeague && dataLittleLeague.elidge ? (
                              <CandyXL id={id} />
                            ) : (
                              <img
                                style={{ marginRight: 10 }}
                                alt="img-stardust"
                                height={20}
                                src={APIService.getItemSprite('RareXLCandy_PSD')}
                              />
                            )}
                            {dataLittleLeague && dataLittleLeague.elidge ? (
                              <span className={statData?.type !== 'buddy' ? statData?.type + '-text' : ''}>
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
                          {dataLittleLeague && dataLittleLeague.elidge ? (
                            <span className={statData?.type?.toUpperCase() === FORM_SHADOW ? 'text-success' : ''}>
                              {dataLittleLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                          {dataLittleLeague && dataLittleLeague.elidge ? (
                            <span className={statData?.type?.toUpperCase() === FORM_SHADOW ? 'text-danger' : ''}>
                              {dataLittleLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={HP_LOGO} />
                          {dataLittleLeague && dataLittleLeague.elidge ? dataLittleLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-league"
                            width={30}
                            height={30}
                            src={APIService.getPokeLeague('great_league')}
                          />
                          <span className={dataGreatLeague ? (dataGreatLeague.elidge ? '' : 'text-danger') : ''}>
                            Great League
                            {dataGreatLeague ? dataGreatLeague.elidge ? '' : <span> (Not Elidge)</span> : ''}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Level</td>
                        <td colSpan={3}>{dataGreatLeague && dataGreatLeague.elidge ? dataGreatLeague.level : '-'}</td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td colSpan={3}>{dataGreatLeague && dataGreatLeague.elidge ? dataGreatLeague.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stadust Required
                        </td>
                        <td colSpan={3}>
                          {dataGreatLeague && dataGreatLeague.elidge ? (
                            <span className={statData?.type + '-text'}>{dataGreatLeague.rangeValue?.resultBetweenStadust}</span>
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
                            {dataGreatLeague && dataGreatLeague.elidge ? (
                              <Candy id={id} style={{ marginRight: 10 }} />
                            ) : (
                              <img style={{ marginRight: 10 }} alt="img-stardust" height={20} src={APIService.getItemSprite('Item_1301')} />
                            )}
                            {dataGreatLeague && dataGreatLeague.elidge ? (
                              <span className={statData?.type !== 'buddy' ? statData?.type + '-text' : ''}>
                                {dataGreatLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="d-flex align-items-center td-style" style={{ float: 'right', width: '50%' }}>
                            {dataGreatLeague && dataGreatLeague.elidge ? (
                              <CandyXL id={id} />
                            ) : (
                              <img
                                style={{ marginRight: 10 }}
                                alt="img-stardust"
                                height={20}
                                src={APIService.getItemSprite('RareXLCandy_PSD')}
                              />
                            )}
                            {dataGreatLeague && dataGreatLeague.elidge ? (
                              <span className={statData?.type !== 'buddy' ? statData?.type + '-text' : ''}>
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
                          {dataGreatLeague && dataGreatLeague.elidge ? (
                            <span className={statData?.type?.toUpperCase() === FORM_SHADOW ? 'text-success' : ''}>
                              {dataGreatLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                          {dataGreatLeague && dataGreatLeague.elidge ? (
                            <span className={statData?.type?.toUpperCase() === FORM_SHADOW ? 'text-danger' : ''}>
                              {dataGreatLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={HP_LOGO} />
                          {dataGreatLeague && dataGreatLeague.elidge ? dataGreatLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-league"
                            width={30}
                            height={30}
                            src={APIService.getPokeLeague('ultra_league')}
                          />
                          <span className={dataUltraLeague ? (dataUltraLeague.elidge ? '' : 'text-danger') : ''}>
                            Ultra League
                            {dataUltraLeague ? dataUltraLeague.elidge ? '' : <span> (Not Elidge)</span> : ''}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Level</td>
                        <td colSpan={3}>{dataUltraLeague && dataUltraLeague.elidge ? dataUltraLeague.level : '-'}</td>
                      </tr>
                      <tr>
                        <td>CP</td>
                        <td colSpan={3}>{dataUltraLeague && dataUltraLeague.elidge ? dataUltraLeague.CP : '-'}</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-stardust"
                            height={20}
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          Stadust Required
                        </td>
                        <td colSpan={3}>
                          {dataUltraLeague && dataUltraLeague.elidge ? (
                            <span className={statData?.type + '-text'}>{dataUltraLeague.rangeValue?.resultBetweenStadust}</span>
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
                            {dataUltraLeague && dataUltraLeague.elidge ? (
                              <Candy id={id} style={{ marginRight: 10 }} />
                            ) : (
                              <img style={{ marginRight: 10 }} alt="img-stardust" height={20} src={APIService.getItemSprite('Item_1301')} />
                            )}
                            {dataUltraLeague && dataUltraLeague.elidge ? (
                              <span className={statData?.type !== 'buddy' ? statData?.type + '-text' : ''}>
                                {dataUltraLeague.rangeValue?.resultBetweenCandy}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="d-flex align-items-center td-style" style={{ float: 'right', width: '50%' }}>
                            {dataUltraLeague && dataUltraLeague.elidge ? (
                              <CandyXL id={id} />
                            ) : (
                              <img
                                style={{ marginRight: 10 }}
                                alt="img-stardust"
                                height={20}
                                src={APIService.getItemSprite('RareXLCandy_PSD')}
                              />
                            )}
                            {dataUltraLeague && dataUltraLeague.elidge ? (
                              <span className={statData?.type !== 'buddy' ? statData?.type + '-text' : ''}>
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
                          {dataUltraLeague && dataUltraLeague.elidge ? (
                            <span className={statData?.type?.toUpperCase() === FORM_SHADOW ? 'text-success' : ''}>
                              {dataUltraLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                          {dataUltraLeague && dataUltraLeague.elidge ? (
                            <span className={statData?.type?.toUpperCase() === FORM_SHADOW ? 'text-danger' : ''}>
                              {dataUltraLeague.stats?.def}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={HP_LOGO} />
                          {dataUltraLeague && dataUltraLeague.elidge ? dataUltraLeague.stats?.sta : '-'}
                        </td>
                      </tr>
                      <tr className="text-center">
                        <td className="table-sub-header" colSpan={4}>
                          <img
                            style={{ marginRight: 10 }}
                            alt="img-league"
                            width={30}
                            height={30}
                            src={APIService.getPokeLeague('master_league')}
                          />
                          Master League
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
                          Stadust Required
                        </td>
                        <td colSpan={3}>
                          {dataMasterLeague ? (
                            <span className={statData?.type + '-text'}>{dataMasterLeague.rangeValue?.resultBetweenStadust}</span>
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
                              <span className={statData?.type !== 'buddy' ? statData?.type + '-text' : ''}>
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
                              <span className={statData?.type !== 'buddy' ? statData?.type + '-text' : ''}>
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
                            <span className={statData?.type?.toUpperCase() === FORM_SHADOW ? 'text-success' : ''}>
                              {dataMasterLeague.stats?.atk}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                          {dataMasterLeague ? (
                            <span className={statData?.type?.toUpperCase() === FORM_SHADOW ? 'text-danger' : ''}>
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
