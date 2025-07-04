import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch } from '@mui/material';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { FormGroup } from 'react-bootstrap';

import { capitalize, getDmgMultiplyBonus, getKeyWithData, LevelRating } from '../../../utils/utils';
import { calculateDamagePVE, calculateStatsBattle, getTypeEffective } from '../../../utils/calculate';

import './Damage.scss';
import TypeInfo from '../../../components/Sprites/Type/Type';
import { Box } from '@mui/system';
import DamageTable from './DamageTable';

import ATK_LOGO from '../../../assets/attack.png';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import Find from '../../../components/Find/Find';
import StatsTable from './StatsDamageTable';

import Move from '../../../components/Table/Move';
import { findStabType } from '../../../utils/compute';
import { useSelector } from 'react-redux';
import { SearchingState, StoreState } from '../../../store/models/state.model';
import { ICombat } from '../../../core/models/combat.model';
import { BattleState, ILabelDamage, LabelDamage, PokemonDmgOption } from '../../../core/models/damage.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { combineClasses, DynamicObj, getValueOrDefault, padding, toNumber } from '../../../utils/extension';
import { PokemonType, ThrowType, TypeAction, TypeMove, VariantType } from '../../../enums/type.enum';
import { getMultiplyFriendship, getThrowCharge, maxIv } from '../../../utils/helpers/context.helpers';

const labels: DynamicObj<ILabelDamage> = {
  0: LabelDamage.create({
    color: 'var(--text-primary)',
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

interface IFilter {
  isWeather: boolean;
  isDodge: boolean;
  isTrainer: boolean;
  friendshipLevel: number;
  throwLevel: number;
}

class Filter implements IFilter {
  isWeather = false;
  isDodge = false;
  isTrainer = false;
  friendshipLevel = 0;
  throwLevel = ThrowType.Excellent;

  static create(value: IFilter) {
    const obj = new Filter();
    Object.assign(obj, value);
    return obj;
  }
}

const Damage = () => {
  useTitle({
    title: 'Damage Simulator - Battle Simulator',
    description:
      'Simulate battle damage in Pokémon GO with our advanced damage calculator. Compare Pokémon attacks, optimize movesets, and plan your battle strategy.',
    keywords: [
      'damage simulator',
      'battle simulator',
      'Pokémon GO battles',
      'damage calculator',
      'move damage',
      'battle strategy',
    ],
  });
  const typeEff = useSelector((state: StoreState) => state.store.data.typeEff);
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);

  const [move, setMove] = useState<ICombat>();

  const [statLvATK, setStatLvATK] = useState(0);

  const [statLevel, setStatLevel] = useState(1);
  const [statType, setStatType] = useState(PokemonType.Normal);

  const [statLvDEFObj, setStatLvDEFObj] = useState(0);
  const [statLvSTAObj, setStatLvSTAObj] = useState(0);

  const [statLevelObj, setStatLevelObj] = useState(1);
  const [statTypeObj, setStatTypeObj] = useState(PokemonType.Normal);

  const [enableFriend, setEnableFriend] = useState(false);
  const [battleState, setBattleState] = useState(new Filter());
  const { isWeather, isDodge, isTrainer } = battleState;
  const [result, setResult] = useState(new PokemonDmgOption());

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (searching?.current?.pokemon?.statsGO?.atk !== 0) {
      setStatLvATK(
        calculateStatsBattle(
          searching?.current?.pokemon?.statsGO?.atk,
          maxIv(),
          statLevel,
          false,
          getDmgMultiplyBonus(statType, TypeAction.Atk)
        )
      );
    }
    if (searching?.object?.pokemon?.statsGO?.def !== 0) {
      setStatLvDEFObj(
        calculateStatsBattle(
          searching?.object?.pokemon?.statsGO?.def,
          maxIv(),
          statLevelObj,
          false,
          getDmgMultiplyBonus(statType, TypeAction.Def)
        )
      );
    }
    if (searching?.object?.pokemon?.statsGO?.sta !== 0) {
      setStatLvSTAObj(calculateStatsBattle(searching?.object?.pokemon?.statsGO?.sta, maxIv(), statLevelObj));
    }
  }, [
    searching?.current?.pokemon?.statsGO?.atk,
    statLevel,
    statType,
    searching?.object?.pokemon?.statsGO?.atk,
    searching?.current?.pokemon?.statsGO?.def,
    searching?.object?.pokemon?.statsGO?.def,
    statLevelObj,
    searching?.current?.pokemon?.statsGO?.sta,
    searching?.object?.pokemon?.statsGO?.sta,
    statTypeObj,
  ]);

  const clearData = () => {
    setResult(new PokemonDmgOption());
  };

  const clearMove = () => {
    setMove(undefined);
    clearData();
  };

  const onCalculateDamagePoke = useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (move) {
        const eff = BattleState.create({
          isStab: findStabType(searching?.current?.form?.form?.types, move.type),
          isWb: battleState.isWeather,
          isDodge: battleState.isDodge,
          isMega: searching?.current?.form?.form?.pokemonType === PokemonType.Mega,
          isTrainer: battleState.isTrainer,
          friendshipLevel: enableFriend ? battleState.friendshipLevel : 0,
          throwLevel: battleState.throwLevel,
          effective: getTypeEffective(typeEff, move.type, searching?.object?.form?.form?.types),
        });
        setResult((r) =>
          PokemonDmgOption.create({
            ...r,
            battleState: eff,
            move,
            damage: calculateDamagePVE(statLvATK, statLvDEFObj, move.pvePower, eff),
            hp: statLvSTAObj,
            currPoke: searching?.current?.form,
            objPoke: searching?.object?.form,
            type: statType,
            typeObj: statTypeObj,
            currLevel: statLevel,
            objLevel: statLevelObj,
          })
        );
      } else {
        enqueueSnackbar('Please select move for pokémon!', { variant: VariantType.Error });
      }
    },
    [
      enqueueSnackbar,
      enableFriend,
      battleState,
      move,
      searching?.current?.form,
      searching?.object?.form,
      statLvATK,
      statLvDEFObj,
      statLvSTAObj,
      statType,
      statTypeObj,
      statLevel,
      statLevelObj,
    ]
  );

  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBattleState({
      ...battleState,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Fragment>
      <div className="row battle-game">
        <div className="col-lg border-window">
          <Find isHide title="Attacker Pokémon" clearStats={clearMove} />
          <StatsTable
            setStatLvATK={setStatLvATK}
            setStatLevel={setStatLevel}
            setStatType={setStatType}
            statATK={searching?.current?.pokemon?.statsGO?.atk}
            statDEF={searching?.current?.pokemon?.statsGO?.def}
            statSTA={searching?.current?.pokemon?.statsGO?.sta}
            pokemonType={searching?.current?.form?.form?.pokemonType}
          />
        </div>
        <div className="col-lg border-window">
          <Find isHide title="Defender Pokémon" isSwap clearStats={clearData} isObjective />
          <StatsTable
            setStatLvDEF={setStatLvDEFObj}
            setStatLvSTA={setStatLvSTAObj}
            setStatLevel={setStatLevelObj}
            setStatType={setStatTypeObj}
            statATK={searching?.object?.pokemon?.statsGO?.atk}
            statDEF={searching?.object?.pokemon?.statsGO?.def}
            statSTA={searching?.object?.pokemon?.statsGO?.sta}
            pokemonType={searching?.object?.form?.form?.pokemonType}
          />
        </div>
      </div>
      <h1 id="main" className="text-center">
        Battle Damage Calculate
      </h1>
      <div className="d-flex justify-content-center">
        <div className="mt-2 container row mb-3">
          <div className="col mb-3">
            <form onSubmit={onCalculateDamagePoke.bind(this)}>
              <div className="d-flex justify-content-center">
                <div className="row text-center" style={{ width: 520 }}>
                  <div className="col">
                    <h5 className="text-success">- Current Pokémon Type -</h5>
                    {searching?.current?.form && <TypeInfo arr={searching?.current?.form.form?.types} />}
                  </div>
                  <div className="col">
                    <h5 className="text-danger">- Object Pokémon Type -</h5>
                    {searching?.object?.form && <TypeInfo arr={searching?.object?.form.form?.types} />}
                  </div>
                </div>
              </div>
              <Move
                text="Select Moves"
                id={searching?.current?.form?.defaultId}
                isSelectDefault
                form={getValueOrDefault(
                  String,
                  searching?.current?.form
                    ? searching?.current?.form.form?.name
                    : searching?.current?.form?.form?.formName
                )}
                setMove={setMove}
                move={move}
                isHighlight
                pokemonType={searching?.current?.form?.form?.pokemonType}
              />
              <div className="mt-2">
                {move && (
                  <div className="m-auto" style={{ width: 300 }}>
                    <p>
                      - Move Ability Type: <b>{getKeyWithData(TypeMove, move.typeMove)}</b>
                    </p>
                    <p>
                      {'- Move Type: '}
                      <span className={combineClasses('type-icon-small', move.type?.toLowerCase())}>
                        {capitalize(move.type)}
                      </span>
                    </p>
                    {findStabType(searching?.current?.form?.form?.types, move.type)}
                    <p>
                      {'- Damage: '}
                      <b>
                        {move.pvePower}
                        {findStabType(searching?.current?.form?.form?.types, move.type) && (
                          <span className="caption-small text-success"> (x1.2)</span>
                        )}
                      </b>
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={isWeather} onChange={handleCheckbox} name="isWeather" />}
                      label="Weather Boosts"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={isDodge} onChange={handleCheckbox} name="isDodge" />}
                      label="Dodge"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={isTrainer} onChange={handleCheckbox} name="isTrainer" />}
                      label="Trainer"
                    />
                  </FormGroup>
                  <Box className="d-flex align-items-center justify-content-center">
                    <FormControlLabel
                      control={
                        <Switch
                          onChange={(_, check) => {
                            setEnableFriend(check);
                            setBattleState(
                              Filter.create({
                                ...battleState,
                                friendshipLevel: 0,
                              })
                            );
                          }}
                        />
                      }
                      label="Friendship Level:"
                    />
                    <LevelRating
                      disabled={!enableFriend}
                      onChange={(_, value) => {
                        setBattleState(
                          Filter.create({
                            ...battleState,
                            friendshipLevel: toNumber(value),
                          })
                        );
                      }}
                      defaultValue={0}
                      max={4}
                      size="large"
                      value={battleState.friendshipLevel}
                      emptyIcon={<FavoriteBorder fontSize="inherit" />}
                      icon={<Favorite fontSize="inherit" />}
                    />
                    <Box sx={{ ml: 2, color: 'green', fontSize: 13 }}>
                      x{padding(getMultiplyFriendship(battleState.friendshipLevel), 2)}
                    </Box>
                  </Box>
                  <Box sx={{ marginTop: 2 }}>
                    <FormControl sx={{ width: 200 }}>
                      <InputLabel id="demo-simple-select-label">Charge ability</InputLabel>
                      <Select
                        name="throwLevel"
                        value={battleState.throwLevel}
                        label="Charge ability"
                        onChange={(event) => {
                          setBattleState(
                            Filter.create({
                              ...battleState,
                              throwLevel: toNumber(event.target.value),
                            })
                          );
                        }}
                      >
                        {Object.entries(getThrowCharge()).map(([type, value], index) => (
                          <MenuItem value={index} key={index} sx={{ color: labels[index].color }}>
                            {capitalize(type)}
                            <span className={combineClasses('caption-small dropdown-caption', labels[index].style)}>
                              x{value}
                            </span>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <button type="submit" className="btn btn-primary mt-2">
                    <img alt="ATK" width={20} height={20} src={ATK_LOGO} /> Battle
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
