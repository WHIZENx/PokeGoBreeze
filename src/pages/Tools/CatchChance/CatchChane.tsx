import { Checkbox, FormControlLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import { RootStateOrAny, useSelector } from 'react-redux';
import SelectBadge from '../../../components/Input/SelectBadge';
import Find from '../../../components/Select/Find/Find';
import Circle from '../../../components/Sprites/Circle/Circle';
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
  POKE_BALL_INC_CHANCE,
  RAZZ_BERRY_INC_CHANCE,
  SILVER_INC_CHANCE,
  ULTRA_BALL_INC_CHANCE,
} from '../../../util/Constants';
import { convertName, LevelSlider, splitAndCapitalize } from '../../../util/Utils';

import './CatchChane.css';

const CatchChance = () => {
  const pokemonData = useSelector((state: RootStateOrAny) => state.store.data.pokemon);

  const [id, setId] = useState(1);
  const [name, setName] = useState('Bulbasaur');
  const [form, setForm]: any = useState(null);

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [data, setData]: any = useState(null);
  const [medal, setMedal]: any = useState(null);
  const [level, setLevel] = useState(MIN_LEVEL);
  const [radius, setRadius] = useState(0);
  const [encounter, setEncounter] = useState(true);
  const [options, setOptions] = useState({
    curveBall: false,
    razzBerry: false,
    goldenRazzBerry: false,
    shadow: false,
  });
  const { curveBall, razzBerry, goldenRazzBerry } = options;

  useEffect(() => {
    document.title = 'Calculate Catch Chance - Tool';
  }, []);

  useEffect(() => {
    if (form) {
      findCatchCapture(id, form);
    }
  }, [form]);

  useEffect(() => {
    if (data && medal) {
      calculateCatch();
    }
  }, [medal, level, curveBall, razzBerry, goldenRazzBerry]);

  const medalCatchChance = (priority: number) => {
    if (priority === 1) {
      return BRONZE_INC_CHANCE;
    } else if (priority === 2) {
      return SILVER_INC_CHANCE;
    } else if (priority === 3) {
      return GOLD_INC_CHANCE;
    } else {
      return 1.0;
    }
  };

  const calculateCatch = () => {
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
    const result: any = {};

    const medalChance =
      (medalCatchChance(medal.typePri.priority) + (medal.typeSec ? medalCatchChance(medal.typeSec.priority) : 0)) / (medal.typeSec ? 2 : 1);

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < pokeballType.length; i++) {
      result[pokeballType[i].name.toLowerCase().replace(' ball', '')] = {};
      // tslint:disable-next-line: prefer-for-of
      for (let j = 0; j < throwType.length; j++) {
        const multiplier =
          pokeballType[i].threshold *
          throwType[j].threshold *
          medalChance *
          (curveBall ? CURVE_INC_CHANCE : 1) *
          (razzBerry ? RAZZ_BERRY_INC_CHANCE : 1) *
          (goldenRazzBerry ? GOLD_RAZZ_BERRY_INC_CHANCE : 1);
        const prob = calculateCatchChance(data?.baseCaptureRate, level, multiplier);
        result[pokeballType[i].name.toLowerCase().replace(' ball', '')][throwType[j].name.toLowerCase().replace(' throw', '')] = Math.min(
          prob * 100,
          100
        );
      }
    }
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
                  label="Razz Berry"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={goldenRazzBerry}
                      onChange={(event, check) => setOptions({ ...options, goldenRazzBerry: check, razzBerry: check ? false : check })}
                    />
                  }
                  label="Golden Razz Berry"
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
                  step={0.5}
                  min={1}
                  max={MAX_LEVEL - 1}
                  marks={false}
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
          <div className="row element-top" style={{ margin: 0 }}>
            <div className="col-md-6">
              <div className="d-flex flex-wrap h-100 justify-content-center align-items-center">
                <div className="w-100 text-center">
                  <LevelSlider
                    aria-label="Radius"
                    className="w-100"
                    style={{ maxWidth: 400 }}
                    value={radius}
                    defaultValue={0}
                    valueLabelDisplay="off"
                    step={1}
                    min={0}
                    max={100}
                    marks={false}
                    disabled={data ? false : true}
                    onChange={(data ? onHandleRadius : null) as any}
                  />
                </div>
                <div className="w-50 text-center d-inline-block">
                  <h1>Radius</h1>
                  <hr className="w-100" />
                  <h5>{radius}</h5>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-center position-relative">
              <Circle line={2} color={'lightgray'} size={200} />
              <div className="position-absolute circle-ring">
                <Circle line={2} color={'red'} size={200 - (radius * 200) / 100} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
    </div>
  );
};

export default CatchChance;
