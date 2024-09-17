import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { Fragment, useEffect, useState } from 'react';
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
  FORM_SHADOW,
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
import { capitalize, convertPokemonAPIDataName, LevelSlider, splitAndCapitalize } from '../../../util/utils';

import './CatchChance.scss';
import { StoreState, SearchingState } from '../../../store/models/state.model';
import { IPokemonFormModify } from '../../../core/models/API/form.model';
import { DynamicObj, getValueOrDefault, isNotEmpty, isNullOrEmpty } from '../../../util/extension';

interface PokemonCatchChance {
  baseCaptureRate?: number;
  baseFleeRate?: number;
  movementType?: string;
  movementTimerS?: number;
  jumpTimeS?: number;
  attackTimerS?: number;
  attackProbability?: number;
  dodgeProbability?: number;
  dodgeDurationS?: number;
  dodgeDistance?: number;
  obShadowFormBaseCaptureRate?: number;
  obShadowFormAttackProbability?: number;
  obShadowFormDodgeProbability?: number;
  result?: DynamicObj<DynamicObj<number>>;
}

interface ITitleThrow {
  title: string;
  type: string;
  threshold: number[];
}

class TitleThrow implements ITitleThrow {
  title = '';
  type = '';
  threshold: number[] = [];

  constructor({ ...props }: ITitleThrow) {
    Object.assign(this, props);
  }
}

const CatchChance = () => {
  const pokemonData = useSelector((state: StoreState) => getValueOrDefault(Array, state.store?.data?.pokemon));
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);

  const CIRCLE_DISTANCE = 200;

  const [id, setId] = useState(searching ? searching.id : 1);
  const [form, setForm] = useState<IPokemonFormModify>();

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [data, setData] = useState<PokemonCatchChance>();
  const [dataAdv, setDataAdv] = useState({
    result: 0,
    ballName: '',
    throwType: '',
  });
  const [medal, setMedal] = useState({
    typePri: { priority: 0, type: '' },
    typeSec: { priority: 0, type: '' },
  });
  const [level, setLevel] = useState(MIN_LEVEL);
  const [radius, setRadius] = useState(100);
  const [throwTitle, setThrowTitle] = useState({
    title: 'Nice!',
    type: 'Nice Throw',
    threshold: NICE_THROW_INC_CHANCE,
  });
  const [advanceOption, setAdvanceOption] = useState({
    ballType: 0,
    normalThrow: false,
  });
  const { ballType, normalThrow } = advanceOption;
  const [colorCircle, setColorCirCle] = useState('rgb(0, 255, 0)');
  const [encounter, setEncounter] = useState(true);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({
    advance: false,
    curveBall: false,
    razzBerry: false,
    goldenRazzBerry: false,
    silverPinaps: false,
    shadow: false,
  });
  const { advance, curveBall, razzBerry, goldenRazzBerry, silverPinaps, shadow } = options;

  const pokeballType = [
    { name: 'Poke Ball', threshold: POKE_BALL_INC_CHANCE },
    { name: 'Great Ball', threshold: GREAT_BALL_INC_CHANCE },
    { name: 'Ultra Ball', threshold: ULTRA_BALL_INC_CHANCE },
  ];
  const throwType = [
    { name: 'Normal Throw', threshold: NORMAL_THROW_INC_CHANCE },
    { name: 'Nice Throw', threshold: NICE_THROW_INC_CHANCE },
    { name: 'Great Throw', threshold: GREAT_THROW_INC_CHANCE },
    { name: 'Excellent Throw', threshold: EXCELLENT_THROW_INC_CHANCE },
  ];

  useEffect(() => {
    document.title = 'Calculate Catch Chance - Tool';
  }, []);

  useEffect(() => {
    if (form) {
      findCatchCapture(id, form);
    }
  }, [form]);

  useEffect(() => {
    if (!advance && data && medal) {
      calculateCatch();
    }
  }, [advance, medal, level, curveBall, razzBerry, goldenRazzBerry, silverPinaps, shadow]);

  useEffect(() => {
    if (data && medal) {
      renderRingColor();
    }
  }, [ballType, medal, level, razzBerry, goldenRazzBerry, silverPinaps]);

  useEffect(() => {
    if (advance) {
      setThrowTitle(renderTitleThrow());
      calculateAdvance();
    }
  }, [advance, radius]);

  useEffect(() => {
    if (advance) {
      calculateAdvance();
    }
  }, [advance, radius, medal, level, curveBall, razzBerry, goldenRazzBerry, silverPinaps, ballType, normalThrow]);

  useEffect(() => {
    setLoading(false);
  }, [form]);

  const medalCatchChance = (priority: number) => {
    if (priority === 1) {
      return BRONZE_INC_CHANCE;
    } else if (priority === 2) {
      return SILVER_INC_CHANCE;
    } else if (priority === 3) {
      return GOLD_INC_CHANCE;
    } else if (priority === 4) {
      return PLATINUM_INC_CHANCE;
    } else {
      return 1.0;
    }
  };

  const calculateCatch = () => {
    const result: DynamicObj<DynamicObj<number>> = {};
    const medalChance =
      (medalCatchChance(medal.typePri.priority) + (medal.typeSec ? medalCatchChance(medal.typeSec.priority) : 0)) / (medal.typeSec ? 2 : 1);

    if (data) {
      pokeballType.forEach((ball) => {
        result[ball.name.toLowerCase().replace(' ball', '')] = {};
        throwType.forEach((type) => {
          const [minThreshold, maxThreshold] = type.threshold;
          const multiplier =
            ball.threshold *
            ((minThreshold + maxThreshold) / 2) *
            medalChance *
            (curveBall ? CURVE_INC_CHANCE : 1) *
            (razzBerry ? RAZZ_BERRY_INC_CHANCE : 1) *
            (goldenRazzBerry ? GOLD_RAZZ_BERRY_INC_CHANCE : 1) *
            (silverPinaps ? SILVER_PINAPS_INC_CHANCE : 1);
          const prob = calculateCatchChance(
            data.obShadowFormBaseCaptureRate && options.shadow
              ? data.obShadowFormBaseCaptureRate
              : getValueOrDefault(Number, data.baseCaptureRate),
            level,
            multiplier
          );
          result[ball.name.toLowerCase().replace(' ball', '')][type.name.toLowerCase().replace(' throw', '')] = Math.min(prob * 100, 100);
        });
      });
    }

    setData({
      ...data,
      result,
    });
  };

  const findCatchCapture = (id: number, form: IPokemonFormModify) => {
    const formName = convertPokemonAPIDataName(form.form.name);
    const pokemon = pokemonData.find((data) => data.num === id && data.fullName === formName);
    if (!pokemon || !pokemon.encounter) {
      return setEncounter(false);
    }
    setEncounter(true);
    if (pokemon) {
      let medalType = {
        typePri: { priority: 0, type: '' },
        typeSec: { priority: 0, type: '' },
      };
      const [typePri, typeSec] = pokemon.types;
      medalType = {
        ...medalType,
        typePri: {
          type: typePri,
          priority: medal && medal.typePri ? medal.typePri.priority : 0,
        },
      };
      if (!isNullOrEmpty(typeSec)) {
        medalType = {
          ...medalType,
          typeSec: {
            type: typeSec,
            priority: medal && medal.typeSec ? medal.typeSec.priority : 0,
          },
        };
      }
      setMedal(medalType);
      setData(pokemon.encounter);
    }
  };

  const onSetForm = (form: IPokemonFormModify | undefined) => {
    setForm(form);
  };

  const onSetPriorityPri = (priority: number) => {
    setMedal({
      ...medal,
      typePri: {
        ...medal.typePri,
        priority,
      },
    });
  };

  const onSetPrioritySec = (priority: number) => {
    setMedal({
      ...medal,
      typeSec: {
        ...medal.typeSec,
        priority,
      },
    });
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
    setAdvanceOption({ ...advanceOption, ballType: parseInt(event.target.value) });
  };

  const renderRingColor = () => {
    setColorCirCle(checkValueColor(calculateProb(true)));
  };

  const checkValueColor = (value: number) => {
    if (value >= 66) {
      return `rgb(${255 - Math.round(((value - 66) * 255) / 34)}, 255, 0)`;
    } else if (value >= 36) {
      return `rgb(255, ${165 + Math.round(((value - 36) * 165) / 64)}, 0)`;
    } else if (value >= 26) {
      return `rgb(255, ${(165 / 10) * Math.round(value - 26)}, 0)`;
    } else {
      return 'rgb(255, 0, 0)';
    }
  };

  const titleThrowModel = (title: string, type: string, threshold: number[]) => {
    return new TitleThrow({
      title,
      type,
      threshold,
    });
  };

  const renderTitleThrow = () => {
    if (radius >= 70) {
      return titleThrowModel('Nice!', 'Nice Throw', NICE_THROW_INC_CHANCE);
    } else if (radius >= 30) {
      return titleThrowModel('Great!', 'Great Throw', GREAT_THROW_INC_CHANCE);
    } else {
      return titleThrowModel('Excellent!', 'Excellent Throw', EXCELLENT_THROW_INC_CHANCE);
    }
  };

  const calculateProb = (disable = false, threshold = 1) => {
    const medalChance =
      (medalCatchChance(medal.typePri.priority) + (medal.typeSec ? medalCatchChance(medal.typeSec.priority) : 0)) / (medal.typeSec ? 2 : 1);
    const pokeball = Object.entries(pokeballType).find((_, index) => index === ballType);
    if (pokeball && isNotEmpty(pokeball)) {
      const multiplier =
        pokeball[1].threshold *
        threshold *
        medalChance *
        (curveBall && !disable ? CURVE_INC_CHANCE : 1) *
        (razzBerry ? RAZZ_BERRY_INC_CHANCE : 1) *
        (goldenRazzBerry ? GOLD_RAZZ_BERRY_INC_CHANCE : 1) *
        (silverPinaps ? SILVER_PINAPS_INC_CHANCE : 1);
      const prob = calculateCatchChance(getValueOrDefault(Number, data?.baseCaptureRate), level, multiplier);
      const result = Math.min(prob * 100, 100);
      return result;
    }
    return 0;
  };

  const calculateAdvance = () => {
    const threshold = normalThrow ? 1 : 1 + (100 - radius) / 100;
    const result = calculateProb(false, threshold);
    const pokeball = Object.entries(pokeballType).find((_, index) => index === ballType);
    if (pokeball) {
      setDataAdv({
        result,
        ballName: pokeball[1].name,
        throwType: normalThrow ? 'Normal Throw' : throwTitle.type,
      });
    }
  };

  const clearStats = () => {
    setLoading(true);
  };

  return (
    <div className="contanier element-top" style={{ paddingBottom: 15 }}>
      <div className="row" style={{ margin: 0 }}>
        <div className="col-md-6" style={{ padding: 0 }}>
          <div className="d-flex justify-content-center">
            <Find
              hide={true}
              clearStats={clearStats}
              title="Select Pokémon"
              setStatATK={setStatATK}
              setStatDEF={setStatDEF}
              setStatSTA={setStatSTA}
              setForm={onSetForm}
              setId={setId}
            />
          </div>
        </div>
        <div className="col-md-6 position-relative" style={{ padding: 0 }}>
          {!encounter && (
            <div className="w-100 h-100 position-absolute d-flex justify-content-center align-items-center text-center impossible-encounter">
              <h5 className="text-not-encounter">
                <b>{splitAndCapitalize(convertPokemonAPIDataName(form?.form.name), '_', ' ')}</b> cannot be encountered in wild.
              </h5>
            </div>
          )}
          <div className="d-flex justify-content-center " style={{ margin: 0 }}>
            <div>
              {medal && <SelectBadge type={medal.typePri.type} priority={medal.typePri.priority} setPriority={onSetPriorityPri} />}
              {medal && medal.typeSec.type && (
                <SelectBadge type={medal.typeSec.type} priority={medal.typeSec.priority} setPriority={onSetPrioritySec} />
              )}
              <div className="d-flex flex-wrap justify-content-center w-100 element-top" style={{ gap: 10 }}>
                <FormControlLabel
                  control={<Checkbox checked={curveBall} onChange={(_, check) => setOptions({ ...options, curveBall: check })} />}
                  label="Curve Ball"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={razzBerry}
                      onChange={(_, check) =>
                        setOptions({
                          ...options,
                          razzBerry: check,
                          silverPinaps: check ? false : check,
                          goldenRazzBerry: check ? false : check,
                        })
                      }
                    />
                  }
                  label={
                    <span>
                      <img height={32} src={APIService.getItemSprite('Item_0701')} /> Razz Berry
                    </span>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={goldenRazzBerry}
                      onChange={(_, check) =>
                        setOptions({
                          ...options,
                          goldenRazzBerry: check,
                          silverPinaps: check ? false : check,
                          razzBerry: check ? false : check,
                        })
                      }
                    />
                  }
                  label={
                    <span>
                      <img height={32} src={APIService.getItemSprite('Item_0706')} /> Golden Razz Berry
                    </span>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={silverPinaps}
                      onChange={(_, check) =>
                        setOptions({
                          ...options,
                          silverPinaps: check,
                          goldenRazzBerry: check ? false : check,
                          razzBerry: check ? false : check,
                        })
                      }
                    />
                  }
                  label={
                    <span>
                      <img height={32} src={APIService.getItemSprite('Item_0707')} /> Silver Pinaps
                    </span>
                  }
                />
              </div>
              <div className="d-flex w-100 justify-content-center element-top" style={{ paddingLeft: 15, paddingRight: 15 }}>
                <LevelSlider
                  aria-label="Level"
                  className="w-75"
                  style={{ maxWidth: 400 }}
                  value={level}
                  defaultValue={MIN_LEVEL}
                  valueLabelDisplay="off"
                  marks={[
                    {
                      value: 30,
                      label: 'Max LV counter in wild',
                    },
                  ]}
                  step={0.5}
                  min={MIN_LEVEL}
                  max={MAX_LEVEL - 1}
                  disabled={data ? false : true}
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
                          (data.obShadowFormAttackProbability && shadow
                            ? data.obShadowFormAttackProbability
                            : getValueOrDefault(Number, data.attackProbability)) * 100
                        }%`}
                    </h5>
                    <p>{data && `Time: ${(getValueOrDefault(Number, data.attackTimerS) / 10).toFixed(2)} sec`}</p>
                  </div>
                )}
                <div className="w-25 text-center d-inline-block">
                  <h1>Dodge</h1>
                  <hr className="w-100" />
                  <h5>
                    {data &&
                      `${
                        data.obShadowFormDodgeProbability && shadow
                          ? data.obShadowFormDodgeProbability
                          : getValueOrDefault(Number, data.dodgeProbability) * 100
                      }%`}
                  </h5>
                  <p>{data && `Time: ${(getValueOrDefault(Number, data.dodgeDurationS) / 10).toFixed(2)} sec`}</p>
                </div>
              </div>
            </div>
          </div>
          {data?.obShadowFormBaseCaptureRate && (
            <div className="d-flex justify-content-center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={shadow}
                    onChange={(_, check) => {
                      setOptions({ ...options, shadow: check });
                    }}
                  />
                }
                label={
                  <span>
                    <img height={32} alt="img-shadow" src={APIService.getPokeShadow()} /> {capitalize(FORM_SHADOW)}
                  </span>
                }
              />
            </div>
          )}
          <div className="d-flex justify-content-center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={advance}
                  onChange={(_, check) => {
                    setOptions({ ...options, advance: check });
                    if (check) {
                      calculateAdvance();
                    }
                  }}
                />
              }
              label="Advance options"
            />
          </div>
          {advance && (
            <Fragment>
              <div className="d-flex flex-wrap justify-content-center" style={{ gap: 10 }}>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="demo-select-small">Ball</InputLabel>
                  <Select value={ballType.toString()} label="Ball" onChange={handleChangeBallType}>
                    <MenuItem value={0} className="d-flex" style={{ gap: 5 }}>
                      <img height={16} src={APIService.getItemSprite('pokeball_sprite')} /> Poke Ball
                    </MenuItem>
                    <MenuItem value={1} className="d-flex" style={{ gap: 5 }}>
                      <img height={16} src={APIService.getItemSprite('greatball_sprite')} /> Great Ball
                    </MenuItem>
                    <MenuItem value={2} className="d-flex" style={{ gap: 5 }}>
                      <img height={16} src={APIService.getItemSprite('ultraball_sprite')} /> Ultra Ball
                    </MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox checked={normalThrow} onChange={(_, check) => setAdvanceOption({ ...advanceOption, normalThrow: check })} />
                  }
                  label="Normal Throw "
                />
              </div>
              <div className="row element-top position-relative" style={{ margin: 0 }}>
                {normalThrow && (
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
                        disabled={data ? false : true}
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
                <div className="col-md-6 d-flex flex-column justify-content-center align-items-center" style={{ padding: 0 }}>
                  <h5 className="text-center">{throwTitle.title}</h5>
                  <div className="d-flex justify-content-center position-relative">
                    <Circle line={2} color="lightgray" size={CIRCLE_DISTANCE} />
                    <div className="position-absolute circle-ring">
                      <Circle line={2} color={colorCircle} size={CIRCLE_DISTANCE - ((100 - radius) * CIRCLE_DISTANCE) / 100} />
                    </div>
                  </div>
                </div>
              </div>
            </Fragment>
          )}
          {shadow && <></>}
        </div>
      </div>
      <hr />
      <div className="position-relative">
        {loading && <div className="position-absolute w-100 h-100 impossible-encounter" />}
        {!advance && encounter && data && Object.keys(data).includes('result') && (
          <div className="d-flex flex-column flex-wrap justify-content-center align-items-center">
            <div className="container table-container">
              <table className="table-catch-chance w-100">
                <thead>
                  <tr>
                    <th>Throwing</th>
                    <th>
                      <img height={48} src={APIService.getItemSprite('pokeball_sprite')} /> Poke Ball
                    </th>
                    <th>
                      <img height={48} src={APIService.getItemSprite('greatball_sprite')} /> Great Ball
                    </th>
                    <th>
                      <img height={48} src={APIService.getItemSprite('ultraball_sprite')} /> Ultra Ball
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center">
                    <td>Normal Throw</td>
                    {Object.entries(data.result ?? new Object())
                      .reduce((p, c) => [...p, c[1].normal], [] as number[])
                      .map((value, index) => (
                        <td key={index} style={{ color: checkValueColor(value) }}>
                          {Math.round(value)} %
                        </td>
                      ))}
                  </tr>
                  <tr className="text-center">
                    <td>Nice Throw</td>
                    {Object.entries(data.result ?? new Object())
                      .reduce((p, c) => [...p, c[1].nice], [] as number[])
                      .map((value, index) => (
                        <td key={index} style={{ color: checkValueColor(value) }}>
                          {Math.round(value)} %
                        </td>
                      ))}
                  </tr>
                  <tr className="text-center">
                    <td>Great Throw</td>
                    {Object.entries(data.result ?? new Object())
                      .reduce((p, c) => [...p, c[1].great], [] as number[])
                      .map((value, index) => (
                        <td key={index} style={{ color: checkValueColor(value) }}>
                          {Math.round(value)} %
                        </td>
                      ))}
                  </tr>
                  <tr className="text-center">
                    <td>Excellent Throw</td>
                    {Object.entries(data.result ?? new Object())
                      .reduce((p, c) => [...p, c[1].excellent], [] as number[])
                      .map((value, index) => (
                        <td key={index} style={{ color: checkValueColor(value) }}>
                          {Math.round(value)} %
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="container element-top">
              <table>
                <thead />
                <tbody>
                  <tr>
                    <td className="text-center w-25" style={{ backgroundColor: '#f1ffff' }}>
                      <b>The Throw</b>
                    </td>
                    <td className="w-75">
                      Throwing inside the circle gives you an increased chance to catch, with the multiplier ranging between 1 - 2 times.
                      We&apos;ve taken the averages of the circles, where the nice throw gives you a 1.15 times multiplier, the great throw
                      gives you a 1.5 times multiplier and excellent throw gives you a 1.85 times multiplier.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {advance && encounter && dataAdv && (
          <div className="d-flex flex-wrap justify-content-center">
            <div className="container table-container">
              <table className="table-catch-chance w-100">
                <thead>
                  <tr>
                    <th>Throwing</th>
                    <th>
                      <img height={48} src={APIService.getItemSprite(`${dataAdv.ballName.replaceAll(' ', '').toLowerCase()}_sprite`)} />{' '}
                      {dataAdv.ballName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center">
                    <td>{dataAdv.throwType}</td>
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
