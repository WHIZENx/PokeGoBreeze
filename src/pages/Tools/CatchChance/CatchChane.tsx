import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { RootStateOrAny, useSelector } from 'react-redux';
import SelectBadge from '../../../components/Input/SelectBadge';
import Find from '../../../components/Select/Find/Find';
import Circle from '../../../components/Sprites/Circle/Circle';
import APIService from '../../../services/API.service';
import { calculateCatchChance, calculateCP } from '../../../util/Calculate';
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
  ULTRA_BALL_INC_CHANCE,
} from '../../../util/Constants';
import { convertName, LevelSlider, splitAndCapitalize } from '../../../util/Utils';

import './CatchChane.css';

const CatchChance = () => {
  const pokemonData = useSelector((state: RootStateOrAny) => state.store.data.pokemon);

  const CIRCLR_DISTANCE = 200;

  const [id, setId] = useState(1);
  const [name, setName] = useState('Bulbasaur');
  const [form, setForm]: any = useState(null);

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [data, setData]: any = useState(null);
  const [dataAdv, setDataAdv]: any = useState(null);
  const [medal, setMedal]: any = useState(null);
  const [level, setLevel] = useState(MIN_LEVEL);
  const [radius, setRadius] = useState(100);
  const [throwTitle, setThrowTitle]: any = useState({
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
  const [options, setOptions] = useState({
    advance: false,
    curveBall: false,
    razzBerry: false,
    goldenRazzBerry: false,
    shadow: false,
  });
  const { advance, curveBall, razzBerry, goldenRazzBerry } = options;

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
  }, [advance, medal, level, curveBall, razzBerry, goldenRazzBerry]);

  useEffect(() => {
    if (data && medal) {
      renderRingColor();
    }
  }, [ballType, medal, level, razzBerry, goldenRazzBerry]);

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
  }, [advance, radius, medal, level, razzBerry, goldenRazzBerry, ballType, normalThrow]);

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
    const result: any = {};
    const medalChance =
      (medalCatchChance(medal.typePri.priority) + (medal.typeSec ? medalCatchChance(medal.typeSec.priority) : 0)) / (medal.typeSec ? 2 : 1);

    pokeballType.forEach((ball) => {
      result[ball.name.toLowerCase().replace(' ball', '')] = {};
      throwType.forEach((type) => {
        const multiplier =
          ball.threshold *
          ((type.threshold[0] + type.threshold[1]) / 2) *
          medalChance *
          (curveBall ? CURVE_INC_CHANCE : 1) *
          (razzBerry ? RAZZ_BERRY_INC_CHANCE : 1) *
          (goldenRazzBerry ? GOLD_RAZZ_BERRY_INC_CHANCE : 1);
        const prob = calculateCatchChance(data?.baseCaptureRate, level, multiplier);
        result[ball.name.toLowerCase().replace(' ball', '')][type.name.toLowerCase().replace(' throw', '')] = Math.min(prob * 100, 100);
      });
    });
    setData({
      ...data,
      result,
    });
  };

  const findCatchCapture = (id: number, form: any) => {
    const pokemon = pokemonData.find((data: { id: number; name: any }) => data.id === id && data.name === convertName(form.form.name));
    if (!pokemon) {
      return setEncounter(false);
    }
    setEncounter(true);
    if (pokemon) {
      let medalType: any = {
        typePri: null,
        typeSec: null,
      };
      medalType = {
        ...medalType,
        typePri: {
          type: pokemon.type.replace('POKEMON_TYPE_', ''),
          priority: medal && medal.typePri ? medal.typePri.priority : 0,
        },
      };
      if (pokemon.type2) {
        medalType = {
          ...medalType,
          typeSec: {
            type: pokemon.type2.replace('POKEMON_TYPE_', ''),
            priority: medal && medal.typeSec ? medal.typeSec.priority : 0,
          },
        };
      }
      setMedal(medalType);
      setData(pokemon.encounter);
    }
  };

  const onSetForm = (form: any) => {
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

  const onHandleLevel = (e: any, v: any) => {
    setLevel(v);
  };

  const onHandleRadius = (e: any, v: any) => {
    setRadius(v);
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

  const titleThrowModel = (title: string, type: string, threshold: any) => {
    return {
      title,
      type,
      threshold,
    };
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
    const pokeball: any = Object.entries(pokeballType).find((item, index) => index === ballType);
    const multiplier =
      pokeball[1].threshold *
      threshold *
      medalChance *
      (curveBall && !disable ? CURVE_INC_CHANCE : 1) *
      (razzBerry ? RAZZ_BERRY_INC_CHANCE : 1) *
      (goldenRazzBerry ? GOLD_RAZZ_BERRY_INC_CHANCE : 1);
    const prob = calculateCatchChance(data?.baseCaptureRate, level, multiplier);
    const result = Math.min(prob * 100, 100);
    return result;
  };

  const calculateAdvance = () => {
    const threshold = normalThrow ? 1 : 1 + (100 - radius) / 100;
    const result = calculateProb(false, threshold);
    const pokeball: any = Object.entries(pokeballType).find((item, index) => index === ballType);
    setDataAdv({
      result,
      ballName: pokeball[1].name,
      throwType: normalThrow ? 'Normal Throw' : throwTitle.type,
    });
  };

  return (
    <div className="contanier element-top" style={{ paddingBottom: 15 }}>
      <div className="row" style={{ margin: 0 }}>
        <div className="col-md-6" style={{ padding: 0 }}>
          <div className="d-flex justify-content-center">
            <Find
              hide={true}
              title="Select Pokémon"
              setStatATK={setStatATK}
              setStatDEF={setStatDEF}
              setStatSTA={setStatSTA}
              setForm={onSetForm}
              setName={setName}
              setId={setId}
            />
          </div>
        </div>
        <div className="col-md-6 position-relative" style={{ padding: 0 }}>
          {!encounter && (
            <div className="w-100 h-100 position-absolute d-flex justify-content-center align-items-center text-center impossible-encounter">
              <h5 className="text-not-encounter">
                <b>{splitAndCapitalize(convertName(form.form.name), '_', ' ')}</b> cannot be encountered.
              </h5>
            </div>
          )}
          <div className="d-flex justify-content-center " style={{ margin: 0 }}>
            <div>
              {medal && <SelectBadge type={medal.typePri.type} priority={medal.typePri.priority} setPriority={onSetPriorityPri} />}
              {medal && medal.typeSec && (
                <SelectBadge type={medal.typeSec.type} priority={medal.typeSec.priority} setPriority={onSetPrioritySec} />
              )}
              <div className="d-flex flex-wrap justify-content-center w-100 element-top" style={{ gap: 10 }}>
                <FormControlLabel
                  control={<Checkbox checked={curveBall} onChange={(event, check) => setOptions({ ...options, curveBall: check })} />}
                  label="Curve Ball"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={razzBerry}
                      onChange={(event, check) => setOptions({ ...options, razzBerry: check, goldenRazzBerry: check ? false : check })}
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
                      onChange={(event, check) => setOptions({ ...options, goldenRazzBerry: check, razzBerry: check ? false : check })}
                    />
                  }
                  label={
                    <span>
                      <img height={32} src={APIService.getItemSprite('Item_0706')} /> Golden Razz Berry
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
                  defaultValue={1}
                  valueLabelDisplay="off"
                  marks={[
                    {
                      value: 30,
                      label: 'Max LV counter in wild',
                    },
                  ]}
                  step={0.5}
                  min={1}
                  max={MAX_LEVEL - 1}
                  disabled={data ? false : true}
                  onChange={(data ? onHandleLevel : null) as any}
                />
              </div>
              <div className="d-flex w-100 element-top justify-content-center" style={{ gap: 20 }}>
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
            </div>
          </div>
          <div className="d-flex justify-content-center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={advance}
                  onChange={(event, check) => {
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
                    <Checkbox
                      checked={normalThrow}
                      onChange={(event, check) => setAdvanceOption({ ...advanceOption, normalThrow: check })}
                    />
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
                        onChange={(data ? onHandleRadius : null) as any}
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
                    <Circle line={2} color={'lightgray'} size={CIRCLR_DISTANCE} />
                    <div className="position-absolute circle-ring">
                      <Circle line={2} color={colorCircle} size={CIRCLR_DISTANCE - ((100 - radius) * CIRCLR_DISTANCE) / 100} />
                    </div>
                  </div>
                </div>
              </div>
            </Fragment>
          )}
        </div>
      </div>
      <hr />
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
                  {Object.entries(data.result)
                    .reduce((p: number[], c: any) => [...p, c[1].normal], [] as number[])
                    .map((value, index) => (
                      <td key={index} style={{ color: checkValueColor(value) }}>
                        {Math.round(value)} %
                      </td>
                    ))}
                </tr>
                <tr className="text-center">
                  <td>Nice Throw</td>
                  {Object.entries(data.result)
                    .reduce((p: number[], c: any) => [...p, c[1].nice], [] as number[])
                    .map((value, index) => (
                      <td key={index} style={{ color: checkValueColor(value) }}>
                        {Math.round(value)} %
                      </td>
                    ))}
                </tr>
                <tr className="text-center">
                  <td>Great Throw</td>
                  {Object.entries(data.result)
                    .reduce((p: number[], c: any) => [...p, c[1].great], [] as number[])
                    .map((value, index) => (
                      <td key={index} style={{ color: checkValueColor(value) }}>
                        {Math.round(value)} %
                      </td>
                    ))}
                </tr>
                <tr className="text-center">
                  <td>Excellent Throw</td>
                  {Object.entries(data.result)
                    .reduce((p: number[], c: any) => [...p, c[1].excellent], [] as number[])
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
                    We've taken the averages of the circles, where the nice throw gives you a 1.15 times multiplier, the great throw gives
                    you a 1.5 times multiplier and excellent throw gives you a 1.85 times multiplier.
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
                    <img height={48} src={APIService.getItemSprite(`${dataAdv.ballName.replace(' ', '').toLowerCase()}_sprite`)} />{' '}
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
  );
};

export default CatchChance;
