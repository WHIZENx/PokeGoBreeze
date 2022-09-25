import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch } from '@mui/material';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { FormGroup } from 'react-bootstrap';

import { capitalize, LevelRating } from '../../../util/Utils';
import { SHADOW_ATK_BONUS, SHADOW_DEF_BONUS } from '../../../util/Constants';
import { calculateDamagePVE, calculateStatsBattle, getTypeEffective } from '../../../util/Calculate';

import './Damage.css';
import Type from '../../../components/Sprites/Type/Type';
import { Box } from '@mui/system';
import DamageTable from './DamageTable';

import atk_logo from '../../../assets/attack.png';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import Find from '../../../components/Select/Find/Find';
import StatsTable from './StatsDamageTable';

import Move from '../../../components/Table/Move';
import { findStabType } from '../../../util/Compute';
import { RootStateOrAny, useSelector } from 'react-redux';

const labels: any = {
  0: '1.00',
  1: '1.03',
  2: '1.05',
  3: '1.07',
  4: '1.10',
};

const Damage = () => {
  const globalOptions = useSelector((state: RootStateOrAny) => state.store.data.options);
  const [id, setId] = useState(1);
  const [name, setName] = useState('Bulbasaur');
  const [form, setForm]: any = useState(null);
  const [move, setMove]: any = useState(null);

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [statLvATK, setStatLvATK] = useState(0);

  const [statLevel, setStatLevel] = useState(1);
  const [statType, setStatType] = useState('');

  const [formObj, setFormObj]: any = useState(null);

  const [statATKObj, setStatATKObj] = useState(0);
  const [statDEFObj, setStatDEFObj] = useState(0);
  const [statSTAObj, setStatSTAObj] = useState(0);

  const [statLvDEFObj, setStatLvDEFObj] = useState(0);
  const [statLvSTAObj, setStatLvSTAObj] = useState(0);

  const [statLevelObj, setStatLevelObj] = useState(1);
  const [statTypeObj, setStatTypeObj] = useState('');

  const [enableFriend, setEnableFriend] = useState(false);
  const [battleState, setBattleState] = useState({
    weather: false,
    dodge: false,
    trainer: false,
    flevel: 0,
    clevel: 3,
  });
  const { weather, dodge, trainer } = battleState;
  const [result, setResult]: any = useState({
    battleState: null,
    move: null,
    damage: null,
    hp: null,
    currPoke: null,
    objPoke: null,
    type: null,
    typeObj: null,
    currLevel: 1,
    objLevel: 1,
  });

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    document.title = 'Damage Simulator - Battle Simulator';
  }, []);

  useEffect(() => {
    if (statATK !== 0)
      setStatLvATK(calculateStatsBattle(statATK, 15, statLevel, false, statType === 'shadow' ? SHADOW_ATK_BONUS(globalOptions) : 1));
    if (statDEFObj !== 0)
      setStatLvDEFObj(
        calculateStatsBattle(statDEFObj, 15, statLevelObj, false, statTypeObj === 'shadow' ? SHADOW_DEF_BONUS(globalOptions) : 1)
      );
    if (statSTAObj !== 0) setStatLvSTAObj(calculateStatsBattle(statSTAObj, 15, statLevelObj));
  }, [globalOptions, statATK, statLevel, statType, statATKObj, statDEF, statDEFObj, statLevelObj, statSTA, statSTAObj, statTypeObj]);

  const clearData = () => {
    setResult({
      battleState: null,
      move: null,
      damage: null,
      hp: null,
      currPoke: null,
      objPoke: null,
      type: null,
      typeObj: null,
      currLevel: 1,
      objLevel: 1,
    });
  };

  const clearMove = () => {
    setMove(null);
    setResult({
      battleState: null,
      move: null,
      damage: null,
      hp: null,
      currPoke: null,
      objPoke: null,
      type: null,
      typeObj: null,
      currLevel: 1,
      objLevel: 1,
    });
  };

  const onSetForm = (form: any) => {
    setForm(form);
  };

  const onSetFormObj = (form: any) => {
    setFormObj(form);
  };

  const onCalculateDamagePoke = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      if (move) {
        const eff = {
          stab: findStabType(
            form.form.types.map((item: { type: { name: any } }) => item.type.name),
            move.type
          ),
          wb: battleState.weather,
          dodge: battleState.dodge,
          mega: form.form.pokemon.forme && form.form.pokemon.forme.toLowerCase().includes('mega') ? true : false,
          trainer: battleState.trainer,
          flevel: enableFriend ? battleState.flevel : 0,
          clevel: battleState.clevel,
          effective: getTypeEffective(move.type, formObj.form.types),
        };
        setResult((r: any) => ({
          ...r,
          battleState: eff,
          move,
          damage: calculateDamagePVE(globalOptions, statLvATK, statLvDEFObj, move.pve_power, eff),
          hp: statLvSTAObj,
          currPoke: form,
          objPoke: formObj,
          type: statType,
          typeObj: statTypeObj,
          currLevel: statLevel,
          objLevel: statLevelObj,
        }));
      } else {
        enqueueSnackbar('Please select move for pokémon!', { variant: 'error' });
      }
    },
    [
      enqueueSnackbar,
      globalOptions,
      enableFriend,
      battleState,
      move,
      form,
      formObj,
      statLvATK,
      statLvDEFObj,
      statLvSTAObj,
      statType,
      statTypeObj,
      statLevel,
      statLevelObj,
    ]
  );

  const handleCheckbox = (event: { target: { name: any; checked: any } }) => {
    setBattleState({
      ...battleState,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Fragment>
      <div className="row battle-game">
        <div className="col-lg border-window">
          <Find
            hide={true}
            title="Attacker Pokémon"
            clearStats={clearMove}
            setStatATK={setStatATK}
            setStatDEF={setStatDEF}
            setStatSTA={setStatSTA}
            setName={setName}
            setForm={onSetForm}
            setId={setId}
          />
          <StatsTable
            setStatLvATK={setStatLvATK}
            setStatLevel={setStatLevel}
            setStatType={setStatType}
            statATK={statATK}
            statDEF={statDEF}
            statSTA={statSTA}
          />
        </div>
        <div className="col-lg border-window">
          <Find
            hide={true}
            title="Defender Pokémon"
            swap={true}
            clearStats={clearData}
            setStatATK={setStatATKObj}
            setStatDEF={setStatDEFObj}
            setStatSTA={setStatSTAObj}
            setForm={onSetFormObj}
          />
          <StatsTable
            setStatLvDEF={setStatLvDEFObj}
            setStatLvSTA={setStatLvSTAObj}
            setStatLevel={setStatLevelObj}
            setStatType={setStatTypeObj}
            statATK={statATKObj}
            statDEF={statDEFObj}
            statSTA={statSTAObj}
          />
        </div>
      </div>
      <h1 id="main" className="text-center">
        Battle Damage Calculate
      </h1>
      <div className="d-flex justify-content-center">
        <div className="element-top container row" style={{ marginBottom: 20 }}>
          <div className="col" style={{ marginBottom: 15 }}>
            <form onSubmit={onCalculateDamagePoke.bind(this)}>
              <div className="d-flex justify-content-center">
                <div className="row text-center" style={{ width: 520 }}>
                  <div className="col">
                    <h5 className="text-success">- Current Pokémon Type -</h5>
                    {form && <Type arr={form.form.types.map((ele: { type: { name: any } }) => ele.type.name)} />}
                  </div>
                  <div className="col">
                    <h5 className="text-danger">- Object Pokémon Type -</h5>
                    {formObj && <Type arr={formObj.form.types.map((ele: { type: { name: any } }) => ele.type.name)} />}
                  </div>
                </div>
              </div>
              <Move
                text="Select Moves"
                id={id}
                selectDefault={true}
                form={form ? form.form.pokemon.name : name.toLowerCase()}
                setMove={setMove}
                move={move}
              />
              <div className="element-top">
                {move && (
                  <div style={{ width: 300, margin: 'auto' }}>
                    <p>
                      - Move Ability Type: <b>{capitalize(move.type_move.toLowerCase())}</b>
                    </p>
                    <p>
                      - Move Type:{' '}
                      <span className={'type-icon-small ' + move.type.toLowerCase()}>{capitalize(move.type.toLowerCase())}</span>
                    </p>
                    {findStabType(
                      form.form.types.map((item: { type: { name: any } }) => item.type.name),
                      move.type
                    )}
                    <p>
                      - Damage:{' '}
                      <b>
                        {move.pve_power}
                        {findStabType(
                          form.form.types.map((item: { type: { name: any } }) => item.type.name),
                          move.type
                        ) && <span className={'caption-small text-success'}> (x1.2)</span>}
                      </b>
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={weather} onChange={handleCheckbox} name="weather" />}
                      label="Weather Boosts"
                    />
                    <FormControlLabel control={<Checkbox checked={dodge} onChange={handleCheckbox} name="dodge" />} label="Dodge" />
                    <FormControlLabel control={<Checkbox checked={trainer} onChange={handleCheckbox} name="trainer" />} label="Trainer" />
                  </FormGroup>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          onChange={(event, check) => {
                            setEnableFriend(check);
                            setBattleState({
                              ...battleState,
                              flevel: 0,
                            });
                          }}
                        />
                      }
                      label="Friendship Level:"
                    />
                    <LevelRating
                      disabled={!enableFriend}
                      onChange={(event: any, value) => {
                        setBattleState({
                          ...battleState,
                          [event.target.name]: value,
                        });
                      }}
                      name="flevel"
                      defaultValue={0}
                      max={4}
                      size="large"
                      value={battleState.flevel}
                      emptyIcon={<FavoriteBorder fontSize="inherit" />}
                      icon={<Favorite fontSize="inherit" />}
                    />
                    <Box sx={{ ml: 2, color: 'green', fontSize: 13 }}>x{labels[battleState.flevel]}</Box>
                  </Box>
                  <Box sx={{ marginTop: 2 }}>
                    <FormControl sx={{ width: 200 }}>
                      <InputLabel id="demo-simple-select-label">Charge ablility</InputLabel>
                      <Select
                        name="clevel"
                        value={battleState.clevel}
                        label="Charge ablility"
                        onChange={(event) => {
                          setBattleState({
                            ...battleState,
                            [event.target.name]: event.target.value,
                          });
                        }}
                      >
                        <MenuItem value={0}>
                          Normal
                          <span className="caption-small dropdown-caption text-danger">x0.25</span>
                        </MenuItem>
                        <MenuItem value={1} sx={{ color: 'blue' }}>
                          Nice
                          <span className="caption-small dropdown-caption text-warning">x0.50</span>
                        </MenuItem>
                        <MenuItem value={2} sx={{ color: 'green' }}>
                          Great
                          <span className="caption-small dropdown-caption text-warning">x0.75</span>
                        </MenuItem>
                        <MenuItem value={3} sx={{ color: 'red' }}>
                          Excellent
                          <span className="caption-small dropdown-caption text-success">x1</span>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <button type="submit" className="btn btn-primary element-top">
                    <img alt="atk" width={20} height={20} src={atk_logo} /> Battle
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="col">
            <DamageTable result={result} />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Damage;
