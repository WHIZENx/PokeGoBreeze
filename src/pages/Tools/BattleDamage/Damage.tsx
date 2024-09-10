import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch } from '@mui/material';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { FormGroup } from 'react-bootstrap';

import { capitalize, combineClasses, getDataWithKey, LevelRating, splitAndCapitalize } from '../../../util/utils';
import { FORM_MEGA, FORM_SHADOW, MAX_IV, SHADOW_ATK_BONUS, SHADOW_DEF_BONUS } from '../../../util/constants';
import { calculateDamagePVE, calculateStatsBattle, getTypeEffective } from '../../../util/calculate';

import './Damage.scss';
import TypeInfo from '../../../components/Sprites/Type/Type';
import { Box } from '@mui/system';
import DamageTable from './DamageTable';

import ATK_LOGO from '../../../assets/attack.png';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import Find from '../../../components/Find/Find';
import StatsTable from './StatsDamageTable';

import Move from '../../../components/Table/Move';
import { findStabType } from '../../../util/compute';
import { useSelector } from 'react-redux';
import { SearchingState, StoreState } from '../../../store/models/state.model';
import { ITrainerFriendship, ThrowOption } from '../../../core/models/options.model';
import { IPokemonFormModify } from '../../../core/models/API/form.model';
import { ICombat } from '../../../core/models/combat.model';
import { BattleState, ILabelDamage, LabelDamage, PokemonDmgOption } from '../../../core/models/damage.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { DynamicObj, getValueOrDefault } from '../../../util/models/util.model';

const labels: DynamicObj<ILabelDamage> = {
  0: LabelDamage.create({
    color: 'black',
    style: 'text-danger',
  }),
  1: LabelDamage.create({
    color: 'blue',
    style: 'text-warning',
  }),
  2: LabelDamage.create({
    color: 'green',
    style: 'text-warning',
  }),
  3: LabelDamage.create({
    color: 'red',
    style: 'text-success',
  }),
};

const Damage = () => {
  useChangeTitle('Damage Simulator - Battle Simulator');
  const globalOptions = useSelector((state: StoreState) => state.store?.data?.options);
  const typeEff = useSelector((state: StoreState) => state.store?.data?.typeEff);
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);

  const [id, setId] = useState(searching ? searching.id : 1);
  const [name, setName] = useState(splitAndCapitalize(searching?.fullName, '-', ' '));
  const [form, setForm] = useState<IPokemonFormModify>();
  const [move, setMove] = useState<ICombat>();

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);
  const [statSTA, setStatSTA] = useState(0);

  const [statLvATK, setStatLvATK] = useState(0);

  const [statLevel, setStatLevel] = useState(1);
  const [statType, setStatType] = useState('');

  const [formObj, setFormObj] = useState<IPokemonFormModify>();

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
    fLevel: 0,
    cLevel: 3,
  });
  const { weather, dodge, trainer } = battleState;
  const [result, setResult] = useState(new PokemonDmgOption());

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (statATK !== 0) {
      setStatLvATK(
        calculateStatsBattle(
          statATK,
          MAX_IV,
          statLevel,
          false,
          statType.toUpperCase() === FORM_SHADOW ? SHADOW_ATK_BONUS(globalOptions) : 1
        )
      );
    }
    if (statDEFObj !== 0) {
      setStatLvDEFObj(
        calculateStatsBattle(
          statDEFObj,
          MAX_IV,
          statLevelObj,
          false,
          statTypeObj.toUpperCase() === FORM_SHADOW ? SHADOW_DEF_BONUS(globalOptions) : 1
        )
      );
    }
    if (statSTAObj !== 0) {
      setStatLvSTAObj(calculateStatsBattle(statSTAObj, MAX_IV, statLevelObj));
    }
  }, [globalOptions, statATK, statLevel, statType, statATKObj, statDEF, statDEFObj, statLevelObj, statSTA, statSTAObj, statTypeObj]);

  const clearData = () => {
    setResult({
      currLevel: 1,
      objLevel: 1,
    });
  };

  const clearMove = () => {
    setMove(undefined);
    setResult({
      currLevel: 1,
      objLevel: 1,
    });
  };

  const onSetForm = (form: IPokemonFormModify | undefined) => {
    setForm(form);
  };

  const onSetFormObj = (form: IPokemonFormModify | undefined) => {
    setFormObj(form);
  };

  const onCalculateDamagePoke = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (move) {
        const eff = BattleState.create({
          stab: findStabType(getValueOrDefault(Array, form?.form.types), getValueOrDefault(String, move.type)),
          wb: battleState.weather,
          dodge: battleState.dodge,
          mega: getValueOrDefault(Boolean, form?.form.formName?.toUpperCase().includes(FORM_MEGA)),
          trainer: battleState.trainer,
          fLevel: enableFriend ? battleState.fLevel : 0,
          cLevel: battleState.cLevel,
          effective: getTypeEffective(typeEff, getValueOrDefault(String, move.type), getValueOrDefault(Array, formObj?.form.types)),
        });
        setResult((r) => ({
          ...r,
          battleState: eff,
          move,
          damage: calculateDamagePVE(globalOptions, statLvATK, statLvDEFObj, move.pvePower, eff),
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

  const handleCheckbox = (event: { target: { name: string; checked: boolean } }) => {
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
            objective={true}
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
                    {form && <TypeInfo arr={form.form.types} />}
                  </div>
                  <div className="col">
                    <h5 className="text-danger">- Object Pokémon Type -</h5>
                    {formObj && <TypeInfo arr={formObj.form.types} />}
                  </div>
                </div>
              </div>
              <Move
                text="Select Moves"
                id={id}
                selectDefault={true}
                form={form ? form.form.name : name.toLowerCase()}
                setMove={setMove}
                move={move}
                highlight={true}
              />
              <div className="element-top">
                {move && (
                  <div style={{ width: 300, margin: 'auto' }}>
                    <p>
                      - Move Ability Type: <b>{capitalize(move.typeMove)}</b>
                    </p>
                    <p>
                      - Move Type:{' '}
                      <span className={combineClasses('type-icon-small', move.type?.toLowerCase())}>{capitalize(move.type)}</span>
                    </p>
                    {findStabType(getValueOrDefault(Array, form?.form.types), getValueOrDefault(String, move.type))}
                    <p>
                      - Damage:{' '}
                      <b>
                        {move.pvePower}
                        {findStabType(getValueOrDefault(Array, form?.form.types), getValueOrDefault(String, move.type)) && (
                          <span className="caption-small text-success"> (x1.2)</span>
                        )}
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
                          onChange={(_, check) => {
                            setEnableFriend(check);
                            setBattleState({
                              ...battleState,
                              fLevel: 0,
                            });
                          }}
                        />
                      }
                      label="Friendship Level:"
                    />
                    <LevelRating
                      disabled={!enableFriend}
                      onChange={(_, value) => {
                        setBattleState({
                          ...battleState,
                          fLevel: getValueOrDefault(Number, value),
                        });
                      }}
                      defaultValue={0}
                      max={4}
                      size="large"
                      value={battleState.fLevel}
                      emptyIcon={<FavoriteBorder fontSize="inherit" />}
                      icon={<Favorite fontSize="inherit" />}
                    />
                    <Box sx={{ ml: 2, color: 'green', fontSize: 13 }}>
                      x{getDataWithKey<ITrainerFriendship>(globalOptions?.trainerFriendship, battleState.fLevel).atkBonus?.toFixed(2)}
                    </Box>
                  </Box>
                  <Box sx={{ marginTop: 2 }}>
                    <FormControl sx={{ width: 200 }}>
                      <InputLabel id="demo-simple-select-label">Charge ability</InputLabel>
                      <Select
                        name="cLevel"
                        value={battleState.cLevel}
                        label="Charge ability"
                        onChange={(event) => {
                          setBattleState({
                            ...battleState,
                            [event.target.name]: event.target.value,
                          });
                        }}
                      >
                        {Object.entries(globalOptions?.throwCharge ?? new ThrowOption()).map(([type, value], index) => (
                          <MenuItem value={index} key={index} sx={{ color: labels[index].color }}>
                            {capitalize(type)}
                            <span className={combineClasses('caption-small dropdown-caption', labels[index].style)}>x{value}</span>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <button type="submit" className="btn btn-primary element-top">
                    <img alt="atk" width={20} height={20} src={ATK_LOGO} /> Battle
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
