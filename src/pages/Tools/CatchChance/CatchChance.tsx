import { Checkbox, FormControlLabel } from '@mui/material';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import SelectBadge from '../../../components/Commons/Selects/SelectBadge';
import Find from '../../../components/Find/Find';
import Circle from '../../../components/Sprites/Circle/Circle';
import APIService from '../../../services/api.service';
import { calculateCatchChance, calculateCP } from '../../../utils/calculate';
import {
  createDataRows,
  getItemSpritePath,
  getKeyWithData,
  getPokemonFormWithNoneSpecialForm,
  LevelSlider,
  splitAndCapitalize,
} from '../../../utils/utils';

import './CatchChance.scss';
import {
  DynamicObj,
  getValueOrDefault,
  isNotEmpty,
  isUndefined,
  safeObjectEntries,
  toFloatWithPadding,
  toNumber,
} from '../../../utils/extension';
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
import { BadgeType } from '../../../components/enums/badge-type.enum';
import { ItemName } from '../../News/enums/item-type.enum';
import { IPokemonFormModify } from '../../../core/models/API/form.model';
import { IPokemonDetail } from '../../../core/models/API/info.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import {
  bronzeIncChance,
  curveIncChance,
  excellentThrowIncChance,
  goldIncChance,
  goldRazzBerryIncChance,
  greatBallIncChance,
  greatThrowIncChance,
  maxEncounterPlayerLevel,
  maxLevel,
  maxQuestEncounterPlayerLevel,
  minLevel,
  niceThrowIncChance,
  normalThrowIncChance,
  platinumIncChance,
  pokeBallIncChance,
  razzBerryIncChance,
  silverIncChance,
  silverPinapsIncChance,
  stepLevel,
  ultraBallIncChance,
} from '../../../utils/helpers/options-context.helpers';
import useSearch from '../../../composables/useSearch';
import SelectMui from '../../../components/Commons/Selects/SelectMui';

const balls = createDataRows<PokeBallThreshold>(
  {
    name: 'Poké Ball',
    itemName: ItemName.PokeBall,
    threshold: pokeBallIncChance(),
    pokeBallType: PokeBallType.PokeBall,
  },
  {
    name: 'Great Ball',
    itemName: ItemName.GreatBall,
    threshold: greatBallIncChance(),
    pokeBallType: PokeBallType.GreatBall,
  },
  {
    name: 'Ultra Ball',
    itemName: ItemName.UltraBall,
    threshold: ultraBallIncChance(),
    pokeBallType: PokeBallType.UltraBall,
  }
);
const throws = createDataRows<ThrowThreshold>(
  { name: 'Normal Throw', threshold: normalThrowIncChance(), throwType: ThrowType.Normal },
  { name: 'Nice Throw', threshold: niceThrowIncChance(), throwType: ThrowType.Nice },
  { name: 'Great Throw', threshold: greatThrowIncChance(), throwType: ThrowType.Great },
  { name: 'Excellent Throw', threshold: excellentThrowIncChance(), throwType: ThrowType.Excellent }
);

const CatchChance = () => {
  const { searchingToolCurrentDetails } = useSearch();
  const circleDistance = useRef(200);

  const [form, setForm] = useState<IPokemonFormModify>();

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [data, setData] = useState<PokemonCatchChance>();
  const [dataAdv, setDataAdv] = useState(new DataAdvance());
  const [medal, setMedal] = useState(new Medal());
  const [level, setLevel] = useState(minLevel());
  const [radius, setRadius] = useState(circleDistance.current / 2);
  const [advThrow, setAdvThrow] = useState<ThrowThreshold>();
  const [advanceOption, setAdvanceOption] = useState(new AdvanceOption());
  const { ballType, isNormalThrow } = advanceOption;
  const [colorCircle, setColorCircle] = useState('#00ff00');
  const [isEncounter, setIsEncounter] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState(new PokeBallOption());
  const { isAdvance, isCurveBall, isRazzBerry, isGoldenRazzBerry, isSilverPinaps, isShadow } = options;

  useTitle({
    title: 'Calculate Catch Chance - Tool',
    description:
      'Calculate the probability of catching any Pokémon in Pokémon GO based on ball type, berries, throw accuracy, and medals.',
    keywords: [
      'Pokémon GO',
      'catch rate',
      'catch calculator',
      'catch chance',
      'Poké Ball',
      'Great Ball',
      'Ultra Ball',
      'PokéGO Breeze',
    ],
  });

  useEffect(() => {
    if (searchingToolCurrentDetails) {
      findCatchCapture(searchingToolCurrentDetails);
    }
  }, [searchingToolCurrentDetails]);

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
        return bronzeIncChance();
      case BadgeType.Silver:
        return silverIncChance();
      case BadgeType.Gold:
        return goldIncChance();
      case BadgeType.Platinum:
        return platinumIncChance();
      default:
        return pokeBallIncChance();
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
            (isCurveBall ? curveIncChance() : 1) *
            (isRazzBerry ? razzBerryIncChance() : 1) *
            (isGoldenRazzBerry ? goldRazzBerryIncChance() : 1) *
            (isSilverPinaps ? silverPinapsIncChance() : 1);
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
    const pokeBall = safeObjectEntries<PokeBallThreshold>(balls).find((_, type) => type === ballType);
    let result = 0;
    if (pokeBall && isNotEmpty(pokeBall)) {
      const multiplier =
        pokeBall[1].threshold *
        threshold *
        medalChance *
        (isCurveBall && !disable ? curveIncChance() : 1) *
        (isRazzBerry ? razzBerryIncChance() : 1) *
        (isGoldenRazzBerry ? goldRazzBerryIncChance() : 1) *
        (isSilverPinaps ? silverPinapsIncChance() : 1);
      const prob = calculateCatchChance(data?.baseCaptureRate, level, multiplier);
      result = Math.min(prob * 100, 100);
    }
    return result;
  };

  const calculateAdvance = () => {
    const threshold = isNormalThrow ? 1 : 1 + (100 - radius) / 100;
    const result = calculateProb(false, threshold);
    const pokeBall = safeObjectEntries<PokeBallThreshold>(balls).find((_, index) => index === ballType);
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
    <div className="container mt-2 pb-3">
      <div className="row m-0">
        <div className="col-md-6 p-0">
          <div className="d-flex justify-content-center">
            <Find
              isHide
              clearStats={clearStats}
              title="Select Pokémon"
              setStatATK={setStatATK}
              setStatDEF={setStatDEF}
              setStatSTA={setStatSTA}
              setForm={setForm}
            />
          </div>
        </div>
        <div className="col-md-6 position-relative p-0">
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
          <div className="d-flex justify-content-center m-0">
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
              <div className="d-flex flex-wrap justify-content-center w-100 mt-2 gap-2">
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
              <div className="d-flex w-100 justify-content-center mt-2 px-3">
                <LevelSlider
                  aria-label="Level"
                  className="w-75"
                  style={{ maxWidth: 400 }}
                  value={level}
                  defaultValue={minLevel()}
                  valueLabelDisplay="off"
                  marks={[
                    {
                      value: maxQuestEncounterPlayerLevel(),
                      label: <span className="position-absolute -top-1">Max LV encounter in quest</span>,
                    },
                    {
                      value: maxEncounterPlayerLevel(),
                      label: <span className="position-absolute bottom-4">Max LV encounter in wild</span>,
                    },
                  ]}
                  step={stepLevel()}
                  min={minLevel()}
                  max={maxLevel() - 1}
                  disabled={!data}
                  onChange={(_, v) => onHandleLevel(v as number)}
                />
              </div>
              <div className="d-flex w-100 mt-2 justify-content-center gap-3">
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
              <div className="d-flex w-100 mt-2 justify-content-center gap-3">
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
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <SelectMui
                  formSx={{ m: 1, minWidth: 120 }}
                  inputLabel="Ball"
                  value={ballType}
                  onChangeSelect={(value) => setAdvanceOption({ ...advanceOption, ballType: value })}
                  menuItems={balls.map((value) => ({
                    className: 'd-flex gap-1',
                    value: value.pokeBallType,
                    label: (
                      <>
                        <img alt="Icon Item" height={16} src={getItemSpritePath(value.itemName)} /> {value.name}
                      </>
                    ),
                  }))}
                />
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
              <div className="row mt-2 position-relative m-0">
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
                    <div className="w-50 text-center d-inline-block mb-3">
                      <h1>Radius</h1>
                      <hr className="w-100" />
                      <h5>{radius}</h5>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-0">
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
                      {safeObjectEntries(data.result)
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
            <div className="container mt-2">
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
