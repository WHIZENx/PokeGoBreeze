import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import SelectBadge from '../../../components/Input/SelectBadge';
import Find from '../../../components/Find/Find';
import Circle from '../../../components/Sprites/Circle/Circle';
import APIService from '../../../services/API.service';
import { calculateCatchChance, calculateCP } from '../../../util/calculate';
import {
  BRONZE_INC_CHANCE,
  CURVE_INC_CHANCE,
  EXCELLENT_THROW_INC_CHANCE,
  GOLD_INC_CHANCE,
  GOLD_RAZZ_BERRY_INC_CHANCE,
  GREAT_BALL_INC_CHANCE,
  GREAT_THROW_INC_CHANCE,
  MAX_LEVEL,
  MIN_LEVEL,
  NICE_THROW_INC_CHANCE,
  NORMAL_THROW_INC_CHANCE,
  PLATINUM_INC_CHANCE,
  POKE_BALL_INC_CHANCE,
  RAZZ_BERRY_INC_CHANCE,
  SILVER_INC_CHANCE,
  SILVER_PINAPS_INC_CHANCE,
  ULTRA_BALL_INC_CHANCE,
} from '../../../util/constants';
import {
  getItemSpritePath,
  getKeyWithData,
  getPokemonFormWithNoneSpecialForm,
  LevelSlider,
  splitAndCapitalize,
} from '../../../util/utils';

import './CatchChance.scss';
import { StoreState, SearchingState } from '../../../store/models/state.model';
import {
  DynamicObj,
  getValueOrDefault,
  isNotEmpty,
  isUndefined,
  toFloatWithPadding,
  toNumber,
} from '../../../util/extension';
import {
  Medal,
  MedalType,
  DataAdvance,
  PokemonCatchChance,
  AdvanceOption,
  PokeBallThreshold,
  ThrowThreshold,
  PokeBallOption,
} from './models/catch-chance.model';
import { PokeBallType } from './enums/poke-ball.enum';
import { PokemonType, ThrowType } from '../../../enums/type.enum';
import { BadgeType } from '../../../components/Input/enums/badge-type.enum';
import { ItemName } from '../../News/enums/item-type.enum';
import { IPokemonFormModify } from '../../../core/models/API/form.model';
import { IPokemonDetail } from '../../../core/models/API/info.model';

const balls: PokeBallThreshold[] = [
  {
    name: 'Poké Ball',
    itemName: ItemName.PokeBall,
    threshold: POKE_BALL_INC_CHANCE,
    pokeBallType: PokeBallType.PokeBall,
  },
  {
    name: 'Great Ball',
    itemName: ItemName.GreatBall,
    threshold: GREAT_BALL_INC_CHANCE,
    pokeBallType: PokeBallType.GreatBall,
  },
  {
    name: 'Ultra Ball',
    itemName: ItemName.UltraBall,
    threshold: ULTRA_BALL_INC_CHANCE,
    pokeBallType: PokeBallType.UltraBall,
  },
];
const throws: ThrowThreshold[] = [
  { name: 'Normal Throw', threshold: NORMAL_THROW_INC_CHANCE, throwType: ThrowType.Normal },
  { name: 'Nice Throw', threshold: NICE_THROW_INC_CHANCE, throwType: ThrowType.Nice },
  { name: 'Great Throw', threshold: GREAT_THROW_INC_CHANCE, throwType: ThrowType.Great },
  { name: 'Excellent Throw', threshold: EXCELLENT_THROW_INC_CHANCE, throwType: ThrowType.Excellent },
];

const CatchChance = () => {
  const playerSetting = useSelector((state: StoreState) => state.store.data.options.playerSetting);
  const pokemon = useSelector((state: SearchingState) => state.searching.toolSearching?.current?.pokemon);

  const circleDistance = useRef(200);

  const [form, setForm] = useState<IPokemonFormModify>();

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [data, setData] = useState<PokemonCatchChance>();
  const [dataAdv, setDataAdv] = useState(new DataAdvance());
  const [medal, setMedal] = useState(new Medal());
  const [level, setLevel] = useState(MIN_LEVEL);
  const [radius, setRadius] = useState(circleDistance.current / 2);
  const [advThrow, setAdvThrow] = useState<ThrowThreshold>();
  const [advanceOption, setAdvanceOption] = useState(new AdvanceOption());
  const { ballType, isNormalThrow } = advanceOption;
  const [colorCircle, setColorCircle] = useState('#00ff00');
  const [isEncounter, setIsEncounter] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState(new PokeBallOption());
  const { isAdvance, isCurveBall, isRazzBerry, isGoldenRazzBerry, isSilverPinaps, isShadow } = options;

  useEffect(() => {
    document.title = 'Calculate Catch Chance - Tool';
  }, []);

  useEffect(() => {
    if (pokemon) {
      findCatchCapture(pokemon);
    }
  }, [pokemon]);

  useEffect(() => {
    if (!isAdvance && data && medal) {
      calculateCatch();
    }
  }, [isAdvance, medal, level, isCurveBall, isRazzBerry, isGoldenRazzBerry, isSilverPinaps, isShadow]);

  useEffect(() => {
    if (data && medal) {
      renderRingColor();
    }
  }, [ballType, medal, level, isRazzBerry, isGoldenRazzBerry, isSilverPinaps]);

  useEffect(() => {
    if (isAdvance) {
      setAdvThrow(renderAdvThrow());
      calculateAdvance();
    }
  }, [isAdvance, radius]);

  useEffect(() => {
    if (isAdvance) {
      calculateAdvance();
    }
  }, [
    isAdvance,
    radius,
    medal,
    level,
    isCurveBall,
    isRazzBerry,
    isGoldenRazzBerry,
    isSilverPinaps,
    ballType,
    isNormalThrow,
  ]);

  useEffect(() => {
    setIsLoading(false);
  }, [form]);

  const medalCatchChance = (priority: BadgeType) => {
    switch (priority) {
      case BadgeType.Bronze:
        return BRONZE_INC_CHANCE;
      case BadgeType.Silver:
        return SILVER_INC_CHANCE;
      case BadgeType.Gold:
        return GOLD_INC_CHANCE;
      case BadgeType.Platinum:
        return PLATINUM_INC_CHANCE;
      default:
        return POKE_BALL_INC_CHANCE;
    }
  };

  const calculateCatch = () => {
    const result = new Object() as DynamicObj<DynamicObj<number>>;
    const medalChance =
      (medalCatchChance(medal.typePri.priority) + (medal.typeSec ? medalCatchChance(medal.typeSec.priority) : 0)) /
      (medal.typeSec ? 2 : 1);

    if (data) {
      balls.forEach((ball) => {
        const ballType = getValueOrDefault(String, getKeyWithData(ThrowType, ball.pokeBallType)?.toLowerCase());
        result[ballType] = new Object() as DynamicObj<number>;
        throws.forEach((type) => {
          const [minThreshold, maxThreshold] = type.threshold;
          const multiplier =
            ball.threshold *
            ((minThreshold + maxThreshold) / 2) *
            medalChance *
            (isCurveBall ? CURVE_INC_CHANCE : 1) *
            (isRazzBerry ? RAZZ_BERRY_INC_CHANCE : 1) *
            (isGoldenRazzBerry ? GOLD_RAZZ_BERRY_INC_CHANCE : 1) *
            (isSilverPinaps ? SILVER_PINAPS_INC_CHANCE : 1);
          const prob = calculateCatchChance(
            data.shadowBaseCaptureRate && options.isShadow ? data.shadowBaseCaptureRate : data.baseCaptureRate,
            level,
            multiplier
          );
          const throwType = getValueOrDefault(String, getKeyWithData(ThrowType, type.throwType)?.toLowerCase());
          result[ballType][throwType] = Math.min(prob * 100, 100);
        });
      });
    }

    setData({
      ...data,
      result,
    });
  };

  const findCatchCapture = (pokemon: Partial<IPokemonDetail>) => {
    if (!pokemon || !pokemon.encounter || isUndefined(pokemon.encounter.movementTimerS) || !pokemon.types) {
      setIsEncounter(false);
      return;
    }
    setIsEncounter(true);
    let medalType = new Medal();
    const [typePri, typeSec] = pokemon.types;
    medalType = Medal.create({
      ...medalType,
      typePri: MedalType.create({
        type: typePri,
        priority: medal && medal.typePri ? medal.typePri.priority : BadgeType.None,
      }),
    });
    if (typeSec) {
      medalType = Medal.create({
        ...medalType,
        typeSec: MedalType.create({
          type: typeSec,
          priority: medal && medal.typeSec ? medal.typeSec.priority : BadgeType.None,
        }),
      });
    }
    setMedal(medalType);
    setData(pokemon.encounter);
  };

  const onSetPriorityPri = (priority: BadgeType) => {
    setMedal(
      Medal.create({
        ...medal,
        typePri: MedalType.create({
          ...medal.typePri,
          priority,
        }),
      })
    );
  };

  const onSetPrioritySec = (priority: BadgeType) => {
    setMedal(
      Medal.create({
        ...medal,
        typeSec: MedalType.create({
          ...medal.typeSec,
          priority,
        }),
      })
    );
  };

  const onHandleLevel = (v: number) => {
    if (data) {
      setLevel(v);
    }
  };

  const onHandleRadius = (v: number) => {
    if (data) {
      setRadius(v);
    }
  };

  const handleChangeBallType = (event: SelectChangeEvent) => {
    setAdvanceOption({ ...advanceOption, ballType: toNumber(event.target.value) });
  };

  const renderRingColor = () => {
    setColorCircle(checkValueColor(calculateProb(true)));
  };

  const checkValueColor = (value: number) => {
    if (value >= 66) {
      return `rgb(${255 - Math.round(((value - 66) * 255) / 34)}, 255, 0)`;
    } else if (value >= 36) {
      return `rgb(255, ${165 + Math.round(((value - 36) * 165) / 64)}, 0)`;
    } else if (value >= 26) {
      return `rgb(255, ${Math.round((165 / 10) * (value - 26))}, 0)`;
    } else {
      return '#ff0000';
    }
  };

  const renderAdvThrow = () => {
    if (radius >= 70) {
      return throws.find((t) => t.throwType === ThrowType.Nice);
    } else if (radius >= 30) {
      return throws.find((t) => t.throwType === ThrowType.Great);
    } else {
      return throws.find((t) => t.throwType === ThrowType.Excellent);
    }
  };

  const calculateProb = (disable = false, threshold = 1) => {
    const medalChance =
      (medalCatchChance(medal.typePri.priority) + (medal.typeSec ? medalCatchChance(medal.typeSec.priority) : 0)) /
      (medal.typeSec ? 2 : 1);
    const pokeBall = Object.entries(balls).find((_, type) => type === ballType);
    let result = 0;
    if (pokeBall && isNotEmpty(pokeBall)) {
      const multiplier =
        pokeBall[1].threshold *
        threshold *
        medalChance *
        (isCurveBall && !disable ? CURVE_INC_CHANCE : 1) *
        (isRazzBerry ? RAZZ_BERRY_INC_CHANCE : 1) *
        (isGoldenRazzBerry ? GOLD_RAZZ_BERRY_INC_CHANCE : 1) *
        (isSilverPinaps ? SILVER_PINAPS_INC_CHANCE : 1);
      const prob = calculateCatchChance(data?.baseCaptureRate, level, multiplier);
      result = Math.min(prob * 100, 100);
    }
    return result;
  };

  const calculateAdvance = () => {
    const threshold = isNormalThrow ? 1 : 1 + (100 - radius) / 100;
    const result = calculateProb(false, threshold);
    const pokeBall = Object.entries(balls).find((_, index) => index === ballType);
    let throwText = '';
    if (isNormalThrow) {
      throwText = getValueOrDefault(String, throws.find((t) => t.throwType === ThrowType.Normal)?.name);
    } else if (advThrow) {
      throwText = advThrow.name;
    }
    if (pokeBall && isNotEmpty(pokeBall)) {
      setDataAdv(
        DataAdvance.create({
          result,
          ballName: pokeBall[1].name,
          ballItemName: pokeBall[1].itemName,
          pokeBallType: pokeBall[1].pokeBallType,
          throwText,
          throwType: advThrow?.throwType ?? ThrowType.Normal,
        })
      );
    }
  };

  const clearStats = () => {
    setIsLoading(true);
  };

  return (
    <div className="contanier element-top" style={{ paddingBottom: 15 }}>
      <div className="row" style={{ margin: 0 }}>
        <div className="col-md-6" style={{ padding: 0 }}>
          <div className="d-flex justify-content-center">
            <Find
              isHide={true}
              clearStats={clearStats}
              title="Select Pokémon"
              setStatATK={setStatATK}
              setStatDEF={setStatDEF}
              setStatSTA={setStatSTA}
              setForm={setForm}
            />
          </div>
        </div>
        <div className="col-md-6 position-relative" style={{ padding: 0 }}>
          {!isEncounter && (
            <div className="w-100 h-100 position-absolute d-flex justify-content-center align-items-center text-center impossible-encounter">
              <h5 className="text-not-encounter">
                <b>
                  {splitAndCapitalize(
                    getPokemonFormWithNoneSpecialForm(form?.form.name, form?.form.pokemonType),
                    '_',
                    ' '
                  )}
                </b>{' '}
                cannot be encountered in wild.
              </h5>
            </div>
          )}
          <div className="d-flex justify-content-center " style={{ margin: 0 }}>
            <div>
              {medal && (
                <SelectBadge
                  type={medal.typePri.type}
                  priority={medal.typePri.priority}
                  setPriority={onSetPriorityPri}
                />
              )}
              {medal && medal.typeSec.type && (
                <SelectBadge
                  type={medal.typeSec.type}
                  priority={medal.typeSec.priority}
                  setPriority={onSetPrioritySec}
                />
              )}
              <div className="d-flex flex-wrap justify-content-center w-100 element-top" style={{ gap: 10 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCurveBall}
                      onChange={(_, check) => setOptions(PokeBallOption.create({ ...options, isCurveBall: check }))}
                    />
                  }
                  label="Curve Ball"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isRazzBerry}
                      onChange={(_, check) =>
                        setOptions(
                          PokeBallOption.create({
                            ...options,
                            isRazzBerry: check,
                            isSilverPinaps: check ? false : check,
                            isGoldenRazzBerry: check ? false : check,
                          })
                        )
                      }
                    />
                  }
                  label={
                    <span>
                      <img alt="Icon Item" height={32} src={getItemSpritePath(ItemName.RazzBerry)} /> Razz Berry
                    </span>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isGoldenRazzBerry}
                      onChange={(_, check) =>
                        setOptions(
                          PokeBallOption.create({
                            ...options,
                            isGoldenRazzBerry: check,
                            isSilverPinaps: check ? false : check,
                            isRazzBerry: check ? false : check,
                          })
                        )
                      }
                    />
                  }
                  label={
                    <span>
                      <img alt="Icon Item" height={32} src={APIService.getItemSprite('Item_0706')} /> Golden Razz Berry
                    </span>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSilverPinaps}
                      onChange={(_, check) =>
                        setOptions(
                          PokeBallOption.create({
                            ...options,
                            isSilverPinaps: check,
                            isGoldenRazzBerry: check ? false : check,
                            isRazzBerry: check ? false : check,
                          })
                        )
                      }
                    />
                  }
                  label={
                    <span>
                      <img alt="Icon Item" height={32} src={getItemSpritePath(ItemName.GoldenPinapBerry)} /> Silver
                      Pinaps
                    </span>
                  }
                />
              </div>
              <div
                className="d-flex w-100 justify-content-center element-top"
                style={{ paddingLeft: 15, paddingRight: 15 }}
              >
                <LevelSlider
                  aria-label="Level"
                  className="w-75"
                  style={{ maxWidth: 400 }}
                  value={level}
                  defaultValue={MIN_LEVEL}
                  valueLabelDisplay="off"
                  marks={[
                    {
                      value: playerSetting.maxQuestEncounterPlayerLevel,
                      label: (
                        <span className="position-absolute" style={{ top: '-0.25rem' }}>
                          Max LV encounter in quest
                        </span>
                      ),
                    },
                    {
                      value: playerSetting.maxEncounterPlayerLevel,
                      label: (
                        <span className="position-absolute" style={{ bottom: '1.75rem' }}>
                          Max LV encounter in wild
                        </span>
                      ),
                    },
                  ]}
                  step={0.5}
                  min={MIN_LEVEL}
                  max={MAX_LEVEL - 1}
                  disabled={!data}
                  onChange={(_, v) => onHandleLevel(v as number)}
                />
              </div>
              <div className="d-flex w-100 element-top justify-content-center" style={{ gap: 20 }}>
                {data?.baseFleeRate && (
                  <div className="w-25 text-center d-inline-block">
                    <h1>FLEE</h1>
                    <hr className="w-100" />
                    <h5>{Math.round(data.baseFleeRate * 100)}%</h5>
                  </div>
                )}
                <div className="w-25 text-center d-inline-block">
                  <h1>CP</h1>
                  <hr className="w-100" />
                  <h5>{calculateCP(statATK, statDEF, statSTA, level)}</h5>
                </div>
                <div className="w-25 text-center d-inline-block">
                  <h1>LEVEL</h1>
                  <hr className="w-100" />
                  <h5>{level}</h5>
                </div>
              </div>
              <div className="d-flex w-100 element-top justify-content-center" style={{ gap: 20 }}>
                {data?.baseFleeRate && (
                  <div className="w-25 text-center d-inline-block">
                    <h1>Attack</h1>
                    <hr className="w-100" />
                    <h5>
                      {data &&
                        `${
                          (data.shadowAttackProbability && isShadow
                            ? data.shadowAttackProbability
                            : toNumber(data.attackProbability)) * 100
                        }%`}
                    </h5>
                    <p>{data && `Time: ${toFloatWithPadding(toNumber(data.attackTimerS) / 10, 2)} sec`}</p>
                  </div>
                )}
                <div className="w-25 text-center d-inline-block">
                  <h1>Dodge</h1>
                  <hr className="w-100" />
                  <h5>
                    {data &&
                      `${
                        data.shadowDodgeProbability && isShadow
                          ? data.shadowDodgeProbability
                          : toNumber(data.dodgeProbability) * 100
                      }%`}
                  </h5>
                  <p>{data && `Time: ${toFloatWithPadding(toNumber(data.dodgeDurationS) / 10, 2)} sec`}</p>
                </div>
              </div>
            </div>
          </div>
          {data?.shadowBaseCaptureRate && (
            <div className="d-flex justify-content-center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isShadow}
                    onChange={(_, check) => {
                      setOptions(PokeBallOption.create({ ...options, isShadow: check }));
                    }}
                  />
                }
                label={
                  <span>
                    <img height={32} alt="Image Shadow" src={APIService.getPokeShadow()} />{' '}
                    {getKeyWithData(PokemonType, PokemonType.Shadow)}
                  </span>
                }
              />
            </div>
          )}
          <div className="d-flex justify-content-center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAdvance}
                  onChange={(_, check) => {
                    setOptions(PokeBallOption.create({ ...options, isAdvance: check }));
                    if (check) {
                      calculateAdvance();
                    }
                  }}
                />
              }
              label="Advance options"
            />
          </div>
          {isAdvance && (
            <Fragment>
              <div className="d-flex flex-wrap justify-content-center" style={{ gap: 10 }}>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="demo-select-small">Ball</InputLabel>
                  <Select value={ballType.toString()} label="Ball" onChange={handleChangeBallType}>
                    {balls.map((value, index) => (
                      <MenuItem key={index} value={value.pokeBallType} className="d-flex" style={{ gap: 5 }}>
                        <img alt="Icon Item" height={16} src={getItemSpritePath(value.itemName)} /> {value.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isNormalThrow}
                      onChange={(_, check) => setAdvanceOption({ ...advanceOption, isNormalThrow: check })}
                    />
                  }
                  label="Normal Throw "
                />
              </div>
              <div className="row element-top position-relative" style={{ margin: 0 }}>
                {isNormalThrow && (
                  <div className="w-100 h-100 position-absolute d-flex justify-content-center align-items-center text-center impossible-encounter" />
                )}
                <div className="col-md-6">
                  <div className="d-flex flex-wrap h-100 justify-content-center align-items-center">
                    <div className="w-100 text-center">
                      <LevelSlider
                        aria-label="Radius"
                        className="w-100"
                        style={{ maxWidth: 300 }}
                        value={radius}
                        defaultValue={100}
                        valueLabelDisplay="off"
                        step={1}
                        min={0}
                        max={100}
                        marks={false}
                        disabled={!data}
                        onChange={(_, v) => onHandleRadius(v as number)}
                      />
                    </div>
                    <div className="w-50 text-center d-inline-block" style={{ marginBottom: 15 }}>
                      <h1>Radius</h1>
                      <hr className="w-100" />
                      <h5>{radius}</h5>
                    </div>
                  </div>
                </div>
                <div
                  className="col-md-6 d-flex flex-column justify-content-center align-items-center"
                  style={{ padding: 0 }}
                >
                  {advThrow && <h5 className="text-center">{getKeyWithData(ThrowType, advThrow.throwType)}!</h5>}
                  <div className="d-flex justify-content-center position-relative">
                    <Circle line={2} color="lightgray" size={circleDistance.current} />
                    <div className="position-absolute circle-ring">
                      <Circle
                        line={2}
                        color={colorCircle}
                        size={circleDistance.current - ((100 - radius) * circleDistance.current) / 100}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Fragment>
          )}
        </div>
      </div>
      <hr />
      <div className="position-relative">
        {isLoading && <div className="position-absolute w-100 h-100 impossible-encounter" />}
        {!isAdvance && isEncounter && data?.result && (
          <div className="d-flex flex-column flex-wrap justify-content-center align-items-center">
            <div className="container table-container">
              <table className="table-catch-chance w-100">
                <thead>
                  <tr>
                    <th>Throwing</th>
                    {balls.map((value, index) => (
                      <th key={index}>
                        <img alt="Icon Item" height={48} src={getItemSpritePath(value.itemName)} /> {value.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {throws.map((value, index) => (
                    <tr key={index} className="text-center">
                      <td>{value.name}</td>
                      {Object.entries(data.result ?? new Object())
                        .reduce(
                          (p, c) => [
                            ...p,
                            c[1][getValueOrDefault(String, getKeyWithData(ThrowType, value.throwType)?.toLowerCase())],
                          ],
                          [] as number[]
                        )
                        .map((value: number, index) => (
                          <td key={index} style={{ color: checkValueColor(value) }}>
                            {Math.round(value)} %
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="container element-top">
              <table>
                <thead />
                <tbody>
                  <tr>
                    <td className="text-center w-25 theme-table-info-bg">
                      <b>The Throw</b>
                    </td>
                    <td className="w-75">
                      Throwing inside the circle gives you an increased chance to catch, with the multiplier ranging
                      between 1 - 2 times. We&apos;ve taken the averages of the circles, where the nice throw gives you
                      a 1.15 times multiplier, the great throw gives you a 1.5 times multiplier and excellent throw
                      gives you a 1.85 times multiplier.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {isAdvance && isEncounter && (
          <div className="d-flex flex-wrap justify-content-center">
            <div className="container table-container">
              <table className="table-catch-chance w-100">
                <thead>
                  <tr>
                    <th>Throwing</th>
                    <th>
                      <img alt="Icon Item" height={48} src={getItemSpritePath(dataAdv.ballItemName)} />{' '}
                      {dataAdv.ballName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center">
                    <td>{dataAdv.throwText}</td>
                    <td style={{ color: checkValueColor(dataAdv.result) }}>{Math.round(dataAdv.result)} %</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatchChance;
