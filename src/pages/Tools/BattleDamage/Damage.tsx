import { Checkbox, FormControlLabel, Switch } from '@mui/material';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Button, FormGroup } from 'react-bootstrap';

import { capitalize, getDmgMultiplyBonus, getKeyWithData, LevelRating } from '../../../utils/utils';
import { calculateDamagePVE, calculateStatsBattle, getTypeEffective } from '../../../utils/calculate';

import './Damage.scss';
import TypeInfo from '../../../components/Sprites/Type/Type';
import { Box } from '@mui/system';
import DamageTable from './DamageTable';

import ATK_LOGO from '../../../assets/attack.png';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import Find from '../../../components/Find/Find';
import StatsDamageTable from './StatsDamageTable';

import SelectCustomMove from '../../../components/Commons/Select/SelectCustomMove';
import { findStabType } from '../../../utils/compute';
import { ICombat } from '../../../core/models/combat.model';
import { BattleState, ILabelDamage, LabelDamage, PokemonDmgOption } from '../../../core/models/damage.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import {
  combineClasses,
  DynamicObj,
  getValueOrDefault,
  padding,
  safeObjectEntries,
  toNumber,
} from '../../../utils/extension';
import { PokemonType, ThrowType, TypeAction, TypeMove, VariantType } from '../../../enums/type.enum';
import { getMultiplyFriendship, getThrowCharge, maxIv } from '../../../utils/helpers/options-context.helpers';
import useSearch from '../../../composables/useSearch';
import SelectMui from '../../../components/Commons/Select/SelectMui';

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
  const { searchingToolCurrentData, searchingToolObjectData } = useSearch();

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
    if (searchingToolCurrentData?.pokemon?.statsGO?.atk !== 0) {
      setStatLvATK(
        calculateStatsBattle(
          searchingToolCurrentData?.pokemon?.statsGO?.atk,
          maxIv(),
          statLevel,
          false,
          getDmgMultiplyBonus(statType, TypeAction.Atk)
        )
      );
    }
    if (searchingToolObjectData?.pokemon?.statsGO?.def !== 0) {
      setStatLvDEFObj(
        calculateStatsBattle(
          searchingToolObjectData?.pokemon?.statsGO?.def,
          maxIv(),
          statLevelObj,
          false,
          getDmgMultiplyBonus(statType, TypeAction.Def)
        )
      );
    }
    if (searchingToolObjectData?.pokemon?.statsGO?.sta !== 0) {
      setStatLvSTAObj(calculateStatsBattle(searchingToolObjectData?.pokemon?.statsGO?.sta, maxIv(), statLevelObj));
    }
  }, [
    searchingToolCurrentData?.pokemon?.statsGO?.atk,
    statLevel,
    statType,
    searchingToolObjectData?.pokemon?.statsGO?.atk,
    searchingToolCurrentData?.pokemon?.statsGO?.def,
    searchingToolObjectData?.pokemon?.statsGO?.def,
    statLevelObj,
    searchingToolCurrentData?.pokemon?.statsGO?.sta,
    searchingToolObjectData?.pokemon?.statsGO?.sta,
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
          isStab: findStabType(searchingToolCurrentData?.form?.form?.types, move.type),
          isWb: battleState.isWeather,
          isDodge: battleState.isDodge,
          isMega: searchingToolCurrentData?.form?.form?.pokemonType === PokemonType.Mega,
          isTrainer: battleState.isTrainer,
          friendshipLevel: enableFriend ? battleState.friendshipLevel : 0,
          throwLevel: battleState.throwLevel,
          effective: getTypeEffective(move.type, searchingToolObjectData?.form?.form?.types),
        });
        setResult((r) =>
          PokemonDmgOption.create({
            ...r,
            battleState: eff,
            move,
            damage: calculateDamagePVE(statLvATK, statLvDEFObj, move.pvePower, eff),
            hp: statLvSTAObj,
            currPoke: searchingToolCurrentData?.form,
            objPoke: searchingToolObjectData?.form,
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
      searchingToolCurrentData?.form,
      searchingToolObjectData?.form,
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
          <StatsDamageTable
            setStatLvATK={setStatLvATK}
            setStatLevel={setStatLevel}
            setStatType={setStatType}
            statATK={searchingToolCurrentData?.pokemon?.statsGO?.atk}
            statDEF={searchingToolCurrentData?.pokemon?.statsGO?.def}
            statSTA={searchingToolCurrentData?.pokemon?.statsGO?.sta}
            pokemonType={searchingToolCurrentData?.form?.form?.pokemonType}
          />
        </div>
        <div className="col-lg border-window">
          <Find isHide title="Defender Pokémon" isSwap clearStats={clearData} isObjective />
          <StatsDamageTable
            setStatLvDEF={setStatLvDEFObj}
            setStatLvSTA={setStatLvSTAObj}
            setStatLevel={setStatLevelObj}
            setStatType={setStatTypeObj}
            statATK={searchingToolObjectData?.pokemon?.statsGO?.atk}
            statDEF={searchingToolObjectData?.pokemon?.statsGO?.def}
            statSTA={searchingToolObjectData?.pokemon?.statsGO?.sta}
            pokemonType={searchingToolObjectData?.form?.form?.pokemonType}
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
                    {searchingToolCurrentData?.form && <TypeInfo arr={searchingToolCurrentData?.form.form?.types} />}
                  </div>
                  <div className="col">
                    <h5 className="text-danger">- Object Pokémon Type -</h5>
                    {searchingToolObjectData?.form && <TypeInfo arr={searchingToolObjectData?.form.form?.types} />}
                  </div>
                </div>
              </div>
              <SelectCustomMove
                text="Select Moves"
                id={searchingToolCurrentData?.form?.defaultId}
                isSelectDefault
                form={getValueOrDefault(
                  String,
                  searchingToolCurrentData?.form
                    ? searchingToolCurrentData?.form.form?.name
                    : searchingToolCurrentData?.form?.form?.formName
                )}
                setMove={setMove}
                move={move}
                isHighlight
                pokemonType={searchingToolCurrentData?.form?.form?.pokemonType}
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
                    {findStabType(searchingToolCurrentData?.form?.form?.types, move.type)}
                    <p>
                      {'- Damage: '}
                      <b>
                        {move.pvePower}
                        {findStabType(searchingToolCurrentData?.form?.form?.types, move.type) && (
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
                    <Box className="u-fs-2-75" sx={{ ml: 2, color: 'green' }}>
                      x{padding(getMultiplyFriendship(battleState.friendshipLevel), 2)}
                    </Box>
                  </Box>
                  <Box sx={{ marginTop: 2 }}>
                    <SelectMui
                      formSx={{ width: 200 }}
                      inputLabel="Charge ability"
                      value={battleState.throwLevel}
                      onChangeSelect={(throwLevel) => setBattleState({ ...battleState, throwLevel })}
                      menuItems={safeObjectEntries(getThrowCharge()).map(([type, value], index) => ({
                        value: index,
                        label: (
                          <>
                            {capitalize(type)}
                            <span className={combineClasses('caption-small dropdown-caption', labels[index].style)}>
                              x{value}
                            </span>
                          </>
                        ),
                        sx: { color: labels[index].color },
                      }))}
                    />
                  </Box>
                  <Button variant={VariantType.Primary} type="submit" className="mt-2">
                    <img alt="ATK" width={20} height={20} src={ATK_LOGO} /> Battle
                  </Button>
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
