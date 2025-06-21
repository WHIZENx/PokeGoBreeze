import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import SelectPoke from './Select';
import APIService from '../../../services/API.service';
import {
  convertNameRankingToOri,
  getArrayBySeq,
  getDmgMultiplyBonus,
  getKeyWithData,
  getMoveType,
  getValidPokemonImgPath,
  splitAndCapitalize,
} from '../../../utils/utils';
import {
  findAssetForm,
  findStabType,
  getPokemonBattleLeagueIcon,
  getPokemonBattleLeagueName,
} from '../../../utils/compute';
import {
  calculateCP,
  calculateStatsBattle,
  calculateStatsByTag,
  getBaseStatsByIVandLevel,
  getTypeEffective,
} from '../../../utils/calculate';
import {
  BATTLE_DELAY,
  DEFAULT_AMOUNT,
  DEFAULT_BLOCK,
  DEFAULT_PLUS_SIZE,
  DEFAULT_SIZE,
  FORM_SHADOW,
  MAX_ENERGY,
  MAX_IV,
  MAX_LEVEL,
  MIN_CP,
  MIN_IV,
  MIN_LEVEL,
  STAB_MULTIPLY,
} from '../../../utils/constants';
import { Accordion, Button, Card, Form, useAccordionButton } from 'react-bootstrap';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import { TimeLine, TimeLineFit, TimeLineVertical } from './Timeline';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from '@mui/material';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import CircleBar from '../../../components/Sprites/ProgressBar/Circle';
import HpBar from '../../../components/Sprites/ProgressBar/HpBar';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useSnackbar } from 'notistack';
import { StoreState } from '../../../store/models/state.model';
import { BattlePokemonData, IBattlePokemonData, RankingsPVP, Toggle } from '../../../core/models/pvp.model';
import { IBuff, ICombat } from '../../../core/models/combat.model';
import {
  IPokemonBattleData,
  PokemonBattle,
  PokemonBattleData,
  ITimeline,
  TimelineModel,
  IPokemonBattle,
  ChargeType,
} from '../models/battle.model';
import { BattleBaseStats, IBattleBaseStats, StatsCalculate } from '../../../utils/models/calculate.model';
import { AttackType } from './enums/attack-type.enum';
import { BuffType, PokemonType, TypeAction, VariantType } from '../../../enums/type.enum';
import { SpinnerActions } from '../../../store/actions';
import { loadPVPMoves } from '../../../store/effects/store.effects';
import {
  DynamicObj,
  getPropertyName,
  getValueOrDefault,
  isEqual,
  isInclude,
  isNotEmpty,
  isUndefined,
  toFloat,
  toNumber,
} from '../../../utils/extension';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { BattleType, TimelineType } from './enums/battle.enum';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import { ScoreType } from '../../../utils/enums/constants.enum';
import { TimelineEvent } from '../../../utils/models/overrides/dom.model';
import { LinkToTop, useNavigateToTop } from '../../../utils/hooks/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { HexagonStats, StatsPokemonGO } from '../../../core/models/stats.model';
import { IncludeMode } from '../../../utils/enums/string.enum';
import Error from '../../Error/Error';
import { AxiosError } from 'axios';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../../utils/models/hook.model';

interface OptionsBattle {
  showTap: boolean;
  timelineType: TimelineType;
  duration: number;
  league: number;
}

interface IBattleState {
  pokemonCurr: IPokemonBattleData;
  pokemonObj: IPokemonBattleData;
}

class BattleState implements IBattleState {
  pokemonCurr = new PokemonBattleData();
  pokemonObj = new PokemonBattleData();
}

const Battle = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const params = useParams();
  const navigateToTop = useNavigateToTop();

  const { enqueueSnackbar } = useSnackbar();
  const [openBattle, setOpenBattle] = useState(false);
  const [data, setData] = useState<IBattlePokemonData[]>([]);
  const [options, setOptions] = useState<OptionsBattle>({
    showTap: false,
    timelineType: TimelineType.Normal,
    duration: 1,
    league: toNumber(params.cp, BattleLeagueCPType.Little),
  });
  const { showTap, timelineType, duration, league } = options;

  const timelineFit = useRef<HTMLDivElement>();
  const timelineNormal = useRef<HTMLDivElement>();
  const timelineNormalContainer = useRef<HTMLDivElement>();
  const playLine = useRef<HTMLDivElement>();

  let timelineInterval: NodeJS.Timeout;
  let turnInterval: NodeJS.Timeout;

  const [pokemonCurr, setPokemonCurr] = useState(new PokemonBattle());
  const [pokemonObj, setPokemonObj] = useState(new PokemonBattle());
  const [playTimeline, setPlayTimeline] = useState(new BattleState());

  const [isFound, setIsFound] = useState(true);

  const State = (timer: number, block: number, energy: number, hp: number, type?: AttackType) =>
    new TimelineModel({
      timer,
      type,
      size: DEFAULT_SIZE,
      block,
      energy,
      hp: Math.max(0, hp),
    });

  const calculateMoveDmgActual = (poke: IPokemonBattleData, pokeObj: IPokemonBattleData, move: ICombat | undefined) => {
    if (poke && pokeObj && move) {
      const atkPoke = calculateStatsBattle(
        poke.stats?.atk,
        poke.currentStats?.IV?.atkIV,
        toNumber(poke.currentStats?.level, MIN_LEVEL),
        true
      );
      const defPokeObj = calculateStatsBattle(
        pokeObj.stats?.def,
        pokeObj.currentStats?.IV?.defIV,
        toNumber(pokeObj.currentStats?.level, MIN_LEVEL),
        true
      );
      return (
        (atkPoke *
          move.pvpPower *
          (findStabType(poke.pokemon?.types, move.type) ? STAB_MULTIPLY(dataStore.options) : 1) *
          getDmgMultiplyBonus(poke.pokemonType, dataStore.options, TypeAction.Atk) *
          getTypeEffective(dataStore.typeEff, move.type, pokeObj.pokemon?.types)) /
        (defPokeObj * getDmgMultiplyBonus(pokeObj.pokemonType, dataStore.options, TypeAction.Def))
      );
    }
    return 1;
  };

  const Pokemon = (poke: IPokemonBattle) =>
    PokemonBattleData.create({
      ...poke,
      hp: toNumber(poke.pokemonData?.currentStats?.stats?.statSTA),
      stats: poke.pokemonData?.stats,
      currentStats: poke.pokemonData?.currentStats,
      bestStats: poke.pokemonData?.bestStats,
      pokemon: poke.pokemonData?.pokemon,
      fMove: poke.fMove,
      cMove: poke.cMovePri,
      cMoveSec: poke.cMoveSec,
      energy: poke.energy,
      block: toNumber(poke.block, DEFAULT_BLOCK),
      turn: Math.ceil(toNumber(poke.fMove?.durationMs) / 500),
      pokemonType: poke.pokemonType,
      disableCMovePri: poke.disableCMovePri,
    });

  const getRandomNumber = (min: number, max: number, step = 1) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    if (step === 1) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      const steps = Math.floor((max - min) / step) + 1;
      return min + Math.floor(Math.random() * steps) * step;
    }
  };

  const battleAnimation = () => {
    if (!pokemonCurr.pokemonData || !pokemonObj.pokemonData) {
      enqueueSnackbar('Something went wrong! Please try again.', {
        variant: VariantType.Error,
      });
      return;
    }

    if (
      (!pokemonCurr.disableCMoveSec && !pokemonCurr.cMoveSec) ||
      (!pokemonObj.disableCMoveSec && !pokemonObj.cMoveSec) ||
      (!pokemonCurr.disableCMovePri && !pokemonCurr.cMovePri) ||
      (!pokemonObj.disableCMovePri && !pokemonObj.cMovePri)
    ) {
      enqueueSnackbar('Required charge move', {
        variant: VariantType.Error,
      });
      return;
    }
    arrBound.current = [];
    arrStore.current = [];
    resetTimeLine();
    clearInterval(timelineInterval);
    clearInterval(turnInterval);

    let player1 = Pokemon(pokemonCurr);
    let player2 = Pokemon(pokemonObj);

    let chargeSlotPlayer1 = pokemonCurr.chargeSlot;
    let chargeSlotPlayer2 = pokemonObj.chargeSlot;

    if (player1.cMoveSec && (player1.disableCMovePri || chargeSlotPlayer1 === ChargeType.Secondary)) {
      player1.cMove = player1.cMoveSec;
      chargeSlotPlayer1 = ChargeType.Primary;
    }

    if (player2.cMoveSec && (player2.disableCMovePri || chargeSlotPlayer2 === ChargeType.Secondary)) {
      player2.cMove = player2.cMoveSec;
      chargeSlotPlayer2 = ChargeType.Primary;
    }

    if (player1.disableCMovePri && player1.disableCMoveSec) {
      chargeSlotPlayer1 = ChargeType.None;
    }

    if (player2.disableCMovePri && player2.disableCMoveSec) {
      chargeSlotPlayer2 = ChargeType.None;
    }

    const preRandomPlayer1 = chargeSlotPlayer1 === ChargeType.Random,
      preRandomPlayer2 = chargeSlotPlayer2 === ChargeType.Random;
    let postRandomPlayer1 = false,
      postRandomPlayer2 = false;

    const timelinePri: ITimeline[] = [];
    const timelineSec: ITimeline[] = [];

    let timer = 1;
    let tapPri: boolean,
      fastPriDelay = 0,
      preChargePri: boolean,
      immunePri: boolean,
      chargedPri: boolean,
      chargedPriCount = 0;
    let tapSec: boolean,
      fastSecDelay = 0,
      preChargeSec: boolean,
      immuneSec: boolean,
      chargedSec: boolean,
      chargedSecCount = 0;
    let chargeType = ChargeType.None;

    timelinePri.push(State(timer - 1, player1.block, player1.energy, player1.hp, AttackType.Wait));
    timelinePri.push(State(timer, player1.block, player1.energy, player1.hp, AttackType.Wait));

    timelineSec.push(State(timer - 1, player2.block, player2.energy, player2.hp, AttackType.Wait));
    timelineSec.push(State(timer, player2.block, player2.energy, player2.hp, AttackType.Wait));

    const player1EnergyMoveSec = toNumber(player1.cMoveSec?.pvpEnergy);
    const player2EnergyMoveSec = toNumber(player2.cMoveSec?.pvpEnergy);

    timelineInterval = setInterval(() => {
      timer += 1;
      timelinePri.push(State(timer, player1.block, player1.energy, player1.hp));
      timelineSec.push(State(timer, player2.block, player2.energy, player2.hp));
      if (!chargedPri && !chargedSec) {
        if ((!player1.disableCMovePri || !player1.disableCMoveSec) && !preChargeSec) {
          if (preRandomPlayer1 && !postRandomPlayer1) {
            postRandomPlayer1 = true;
            chargeSlotPlayer1 = getRandomNumber(ChargeType.Primary, ChargeType.Secondary);
          }
          if (
            player1.energy >= Math.abs(player1.cMove.pvpEnergy) &&
            ((!preRandomPlayer1 && chargeSlotPlayer1 !== ChargeType.Secondary) ||
              (postRandomPlayer1 && chargeSlotPlayer1 === ChargeType.Primary))
          ) {
            chargeType = ChargeType.Primary;
            player1.energy += player1.cMove.pvpEnergy;
            timelinePri[timer] = new TimelineModel({
              ...timelinePri[timer],
              type: AttackType.Prepare,
              color: player1.cMove.type?.toLowerCase(),
              size: DEFAULT_SIZE,
              move: player1.cMove,
            });
            preChargePri = true;
            if (tapSec) {
              immuneSec = true;
            }
            chargedPriCount = DEFAULT_AMOUNT;
          }
          if (
            player1.energy >= Math.abs(player1EnergyMoveSec) &&
            ((!preRandomPlayer1 && chargeSlotPlayer1 !== ChargeType.Primary) ||
              (postRandomPlayer1 && chargeSlotPlayer1 === ChargeType.Secondary))
          ) {
            chargeType = ChargeType.Secondary;
            player1.energy += player1EnergyMoveSec;
            timelinePri[timer] = new TimelineModel({
              ...timelinePri[timer],
              type: AttackType.Prepare,
              color: player1.cMoveSec?.type?.toLowerCase(),
              size: DEFAULT_SIZE,
              move: player1.cMoveSec,
            });
            preChargePri = true;
            if (tapSec) {
              immuneSec = true;
            }
            chargedPriCount = DEFAULT_AMOUNT;
          }
        }

        if ((!player2.disableCMovePri || !player2.disableCMoveSec) && !preChargePri) {
          if (preRandomPlayer2 && !postRandomPlayer2) {
            postRandomPlayer2 = true;
            chargeSlotPlayer2 = getRandomNumber(ChargeType.Primary, ChargeType.Secondary);
          }
          if (
            player2.energy >= Math.abs(player2.cMove.pvpEnergy) &&
            ((!preRandomPlayer2 && !postRandomPlayer2 && chargeSlotPlayer2 !== ChargeType.Secondary) ||
              (postRandomPlayer2 && chargeSlotPlayer2 === ChargeType.Primary))
          ) {
            chargeType = ChargeType.Primary;
            player2.energy += player2.cMove.pvpEnergy;
            timelineSec[timer] = new TimelineModel({
              ...timelineSec[timer],
              type: AttackType.Prepare,
              color: player2.cMove.type?.toLowerCase(),
              size: DEFAULT_SIZE,
              move: player2.cMove,
            });
            preChargeSec = true;
            if (tapPri) {
              immunePri = true;
            }
            chargedSecCount = DEFAULT_AMOUNT;
          }
          if (
            player2.energy >= Math.abs(player2EnergyMoveSec) &&
            ((!preRandomPlayer2 && !postRandomPlayer2 && chargeSlotPlayer2 !== ChargeType.Primary) ||
              (postRandomPlayer2 && chargeSlotPlayer2 === ChargeType.Secondary))
          ) {
            chargeType = ChargeType.Secondary;
            player2.energy += player2EnergyMoveSec;
            timelineSec[timer] = new TimelineModel({
              ...timelineSec[timer],
              type: AttackType.Prepare,
              color: player2.cMoveSec?.type?.toLowerCase(),
              size: DEFAULT_SIZE,
              move: player2.cMoveSec,
            });
            preChargeSec = true;
            if (tapPri) {
              immunePri = true;
            }
            chargedSecCount = DEFAULT_AMOUNT;
          }
        }

        if (!preChargePri) {
          if (!tapPri) {
            tapPri = true;
            if (!preChargeSec) {
              timelinePri[timer] = new TimelineModel({ ...timelinePri[timer], isTap: true, move: player1.fMove });
            } else {
              timelinePri[timer].isTap = false;
            }
            fastPriDelay = player1.turn - 1;
          } else {
            if (timelinePri[timer]) {
              timelinePri[timer].isTap = false;
            }
          }

          if (tapPri && fastPriDelay === 0) {
            tapPri = false;
            if (!preChargeSec) {
              player2.hp -= calculateMoveDmgActual(player1, player2, player1.fMove);
            }
            player1.energy += player1.fMove.pvpEnergy;
            timelinePri[timer] = new TimelineModel({
              ...timelinePri[timer],
              type: AttackType.Fast,
              color: player1.fMove.type?.toLowerCase(),
              move: player1.fMove,
              isDmgImmune: preChargeSec,
              isTap: preChargeSec && player1.turn === 1 ? true : timelinePri[timer].isTap,
            });
          } else {
            fastPriDelay -= 1;
            timelinePri[timer].type = AttackType.Wait;
          }
        }

        if (!preChargeSec) {
          if (!tapSec) {
            tapSec = true;
            if (!preChargePri) {
              timelineSec[timer] = new TimelineModel({ ...timelineSec[timer], isTap: true, move: player2.fMove });
            } else {
              timelineSec[timer].isTap = false;
            }
            fastSecDelay = player2.turn - 1;
          } else {
            if (timelineSec[timer]) {
              timelineSec[timer].isTap = false;
            }
          }

          if (tapSec && fastSecDelay === 0) {
            tapSec = false;
            if (!preChargePri) {
              player1.hp -= calculateMoveDmgActual(player2, player1, player2.fMove);
            } else {
              immuneSec = true;
            }
            player2.energy += player2.fMove.pvpEnergy;
            timelineSec[timer] = new TimelineModel({
              ...timelineSec[timer],
              type: AttackType.Fast,
              color: player2.fMove.type?.toLowerCase(),
              move: player2.fMove,
              isDmgImmune: preChargePri,
              isTap: preChargePri && player2.turn === 1 ? true : timelineSec[timer].isTap,
            });
          } else {
            fastSecDelay -= 1;
            timelineSec[timer].type = AttackType.Wait;
          }
        }
      } else {
        if (chargedPri) {
          if (isDelay || chargedPriCount % 2 === 0) {
            timelinePri[timer].type = AttackType.New;
          } else {
            if (chargeType === ChargeType.Primary) {
              timelinePri[timer] = new TimelineModel({
                ...timelinePri[timer],
                type: chargedPriCount === -1 ? AttackType.Charge : AttackType.Spin,
                color: player1.cMove.type?.toLowerCase(),
                size: timelinePri[timer - 2].size + DEFAULT_PLUS_SIZE,
                move: player1.cMove,
              });
            }
            if (chargeType === ChargeType.Secondary) {
              timelinePri[timer] = new TimelineModel({
                ...timelinePri[timer],
                type: chargedPriCount === -1 ? AttackType.Charge : AttackType.Spin,
                color: player1.cMoveSec?.type?.toLowerCase(),
                size: timelinePri[timer - 2].size + DEFAULT_PLUS_SIZE,
                move: player1.cMoveSec,
              });
            }
          }
          if (timelinePri[timer - 2]) {
            timelineSec[timer - 2].size = timelinePri[timer - 2].size;
          }
        } else {
          if (!isDelay && player1.block > 0 && chargedSecCount === -1) {
            timelinePri[timer].type = AttackType.Block;
          }
        }
        if (chargedSec) {
          if (isDelay || chargedSecCount % 2 === 0) {
            timelineSec[timer].type = AttackType.New;
          } else {
            if (chargeType === ChargeType.Primary) {
              timelineSec[timer] = new TimelineModel({
                ...timelineSec[timer],
                type: chargedSecCount === -1 ? AttackType.Charge : AttackType.Spin,
                color: player2.cMove.type?.toLowerCase(),
                size: timelineSec[timer - 2].size + DEFAULT_PLUS_SIZE,
                move: player2.cMove,
              });
            }
            if (chargeType === ChargeType.Secondary) {
              timelineSec[timer] = new TimelineModel({
                ...timelineSec[timer],
                type: chargedSecCount === -1 ? AttackType.Charge : AttackType.Spin,
                color: player2.cMoveSec?.type?.toLowerCase(),
                size: timelineSec[timer - 2].size + DEFAULT_PLUS_SIZE,
                move: player2.cMoveSec,
              });
            }
          }
          if (timelineSec[timer - 2]) {
            timelinePri[timer - 2].size = timelineSec[timer - 2].size;
          }
        } else {
          if (!isDelay && player2.block > 0 && chargedPriCount === -1) {
            timelineSec[timer].type = AttackType.Block;
          }
        }
        timelinePri[timer].isTap = false;
        timelineSec[timer].isTap = false;
      }
    }, 1);
    let isDelay = false,
      delay = BATTLE_DELAY;
    turnInterval = setInterval(() => {
      if (!isDelay) {
        if (chargedPri) {
          if (chargedPriCount >= 0) {
            chargedPriCount--;
          } else {
            if (player2.block === 0) {
              if (chargeType === ChargeType.Primary) {
                player2.hp -= calculateMoveDmgActual(player1, player2, player1.cMove);
              }
              if (chargeType === ChargeType.Secondary) {
                player2.hp -= calculateMoveDmgActual(player1, player2, player1.cMoveSec);
              }
            } else {
              player2.block -= 1;
            }
            const moveType = chargeType === ChargeType.Primary ? player1.cMove : player1.cMoveSec;
            const arrBufAtk: IBuff[] = [],
              arrBufTarget: IBuff[] = [];
            const randInt = toFloat(Math.random(), 3);
            if (isNotEmpty(moveType?.buffs) && randInt > 0 && randInt <= toNumber(moveType?.buffs[0].buffChance)) {
              moveType?.buffs.forEach((value) => {
                if (value.target === BuffType.Target) {
                  player2 = PokemonBattleData.create({
                    ...player2,
                    stats: StatsPokemonGO.create(
                      value.type === TypeAction.Atk
                        ? toNumber(player2.stats?.atk) + value.power
                        : toNumber(player2.stats?.atk),
                      value.type === TypeAction.Def
                        ? toNumber(player2.stats?.def) + value.power
                        : toNumber(player2.stats?.def),
                      toNumber(player2.stats?.sta)
                    ),
                  });
                  arrBufTarget.push(value);
                } else {
                  player1 = PokemonBattleData.create({
                    ...player1,
                    stats: StatsPokemonGO.create(
                      value.type === TypeAction.Atk
                        ? toNumber(player1.stats?.atk) + value.power
                        : toNumber(player1.stats?.atk),
                      value.type === TypeAction.Def
                        ? toNumber(player1.stats?.def) + value.power
                        : toNumber(player1.stats?.def),
                      toNumber(player2.stats?.sta)
                    ),
                  });
                  arrBufAtk.push(value);
                }
                timelinePri[timer].buff = arrBufAtk;
                timelineSec[timer].buff = arrBufTarget;
              });
            }
            isDelay = true;
            delay = BATTLE_DELAY;
          }
        } else if (preChargePri) {
          if (chargedPriCount === DEFAULT_AMOUNT) {
            chargedPri = true;
          } else {
            chargedPriCount--;
          }
        } else if (chargedSec) {
          if (chargedSecCount >= 0) {
            chargedSecCount--;
          } else {
            if (player1.block === 0) {
              if (chargeType === ChargeType.Primary) {
                player1.hp -= calculateMoveDmgActual(player2, player1, player2.cMove);
              }
              if (chargeType === ChargeType.Secondary) {
                player1.hp -= calculateMoveDmgActual(player2, player1, player2.cMoveSec);
              }
            } else {
              player1.block -= 1;
            }
            const moveType = chargeType === ChargeType.Primary ? player2.cMove : player2.cMoveSec;
            const arrBufAtk: IBuff[] = [],
              arrBufTarget: IBuff[] = [];
            const randInt = toFloat(Math.random(), 3);
            if (isNotEmpty(moveType?.buffs) && randInt > 0 && randInt <= toNumber(moveType?.buffs[0].buffChance)) {
              moveType?.buffs.forEach((value) => {
                if (value.target === BuffType.Target) {
                  player1 = PokemonBattleData.create({
                    ...player1,
                    stats: StatsPokemonGO.create(
                      value.type === TypeAction.Atk
                        ? toNumber(player1.stats?.atk) + value.power
                        : toNumber(player1.stats?.atk),
                      value.type === TypeAction.Def
                        ? toNumber(player1.stats?.def) + value.power
                        : toNumber(player1.stats?.def),
                      toNumber(player2.stats?.sta)
                    ),
                  });
                  arrBufTarget.push(value);
                } else {
                  player2 = PokemonBattleData.create({
                    ...player2,
                    stats: StatsPokemonGO.create(
                      value.type === TypeAction.Atk
                        ? toNumber(player2.stats?.atk) + value.power
                        : toNumber(player2.stats?.atk),
                      value.type === TypeAction.Def
                        ? toNumber(player2.stats?.def) + value.power
                        : toNumber(player2.stats?.def),
                      toNumber(player2.stats?.sta)
                    ),
                  });
                  arrBufAtk.push(value);
                }
                timelinePri[timer].buff = arrBufTarget;
                timelineSec[timer].buff = arrBufAtk;
              });
            }
            isDelay = true;
            delay = BATTLE_DELAY;
          }
        } else if (preChargeSec) {
          if (chargedSecCount === DEFAULT_AMOUNT) {
            chargedSec = true;
          } else {
            chargedSecCount--;
          }
        }
      } else {
        if (delay <= 0) {
          isDelay = false;
          if (chargedPri) {
            chargedPri = false;
            preChargePri = false;
            postRandomPlayer1 = false;
          }
          if (chargedSec) {
            chargedSec = false;
            preChargeSec = false;
            postRandomPlayer2 = false;
          }
          tapPri = false;
          tapSec = false;
          if (immunePri) {
            player2.hp -= calculateMoveDmgActual(player1, player2, player1.fMove);
            if (player2.hp > 0) {
              const lastTapPos = timelinePri
                .map((timeline) => timeline.isTap && !isUndefined(timeline.type))
                .lastIndexOf(true);
              const lastFastAtkPos = timelinePri.map((timeline) => timeline.type).lastIndexOf(AttackType.Fast);
              timelinePri[lastFastAtkPos > lastTapPos ? timer : lastTapPos].isDmgImmune = true;
            }
          } else if (immuneSec) {
            player1.hp -= calculateMoveDmgActual(player2, player1, player2.fMove);
            if (player1.hp > 0) {
              const lastTapPos = timelineSec
                .map((timeline) => timeline.isTap && !isUndefined(timeline.type))
                .lastIndexOf(true);
              const lastFastAtkPos = timelineSec.map((timeline) => timeline.type).lastIndexOf(AttackType.Fast);
              timelineSec[lastFastAtkPos > lastTapPos ? timer : lastTapPos].isDmgImmune = true;
            }
          }
          immunePri = false;
          immuneSec = false;
        } else {
          delay -= BATTLE_DELAY;
        }
      }
      if (player1.hp <= 0 || player2.hp <= 0) {
        clearInterval(timelineInterval);
        clearInterval(turnInterval);
        if (player1.hp <= 0) {
          timelinePri.push(State(timer, player1.block, player1.energy, player1.hp, AttackType.Dead));
          if (player2.hp <= 0) {
            timelineSec.push(State(timer, player2.block, player2.energy, player2.hp, AttackType.Dead));
          } else {
            if (timelinePri.length === timelineSec.length) {
              timelineSec[timelineSec.length - 1] = State(
                timer,
                player2.block,
                player2.energy,
                player2.hp,
                AttackType.Win
              );
            } else {
              timelineSec.push(State(timer, player2.block, player2.energy, player2.hp, AttackType.Win));
            }
          }
        } else if (player2.hp <= 0) {
          timelineSec.push(State(timer, player2.block, player2.energy, player2.hp, AttackType.Dead));
          if (player1.hp <= 0) {
            timelinePri.push(State(timer, player1.block, player1.energy, player1.hp, AttackType.Dead));
          } else {
            if (timelinePri.length === timelineSec.length) {
              timelinePri[timelinePri.length - 1] = State(
                timer,
                player1.block,
                player1.energy,
                player1.hp,
                AttackType.Win
              );
            } else {
              timelinePri.push(State(timer, player1.block, player1.energy, player1.hp, AttackType.Win));
            }
          }
        }
        if (timelinePri.length === timelineSec.length) {
          setPokemonCurr({ ...pokemonCurr, timeline: timelinePri });
          setPokemonObj({ ...pokemonObj, timeline: timelineSec });
        } else {
          battleAnimation();
        }
      }
    }, 1);
  };

  const clearData = () => {
    setPokemonObj(new PokemonBattle());
    setPokemonCurr(new PokemonBattle());
  };

  const [titleProps, setTitleProps] = useState<TitleSEOProps>({
    title: 'PVP Battle Simulator',
    description:
      'Simulate Pokémon GO PVP battles between any Pokémon across different leagues. Test movesets, strategies, and optimize your team.',
    keywords: [
      'Pokémon GO',
      'PVP battles',
      'battle simulator',
      'Great League',
      'Ultra League',
      'Master League',
      'PokéGO Breeze',
    ],
  });

  useTitle(titleProps);

  const fetchPokemonBattle = useCallback(
    async (league: number) => {
      dispatch(SpinnerActions.ShowSpinner.create());
      try {
        clearData();
        const file = (
          await APIService.getFetchUrl<RankingsPVP[]>(
            APIService.getRankingFile(LeagueBattleType.All, league, getKeyWithData(ScoreType, ScoreType.Overall))
          )
        ).data;
        if (!isNotEmpty(file)) {
          setIsFound(false);
          return;
        }
        setTitleProps({
          title: `PVP Battle Simulator - ${getPokemonBattleLeagueName(league)}`,
          description: `Simulate Pokémon GO PVP battles in the ${getPokemonBattleLeagueName(
            league
          )}. Test different Pokémon, movesets, and battle strategies.`,
          keywords: [
            'Pokémon GO',
            `${getPokemonBattleLeagueName(league)}`,
            'PVP battles',
            'battle simulator',
            'PVP strategies',
            'PokéGO Breeze',
          ],
          image: getPokemonBattleLeagueIcon(league),
        });

        const result = file
          .filter((pokemon) => !isInclude(pokemon.speciesId, '_xs'))
          .map((item) => {
            const name = convertNameRankingToOri(item.speciesId, item.speciesName);
            const pokemon = dataStore.pokemons.find((pokemon) => isEqual(pokemon.slug, name));
            if (!pokemon) {
              return new BattlePokemonData();
            }

            const id = pokemon.num;
            const form = findAssetForm(dataStore.assets, pokemon.num, pokemon.form);

            const stats = calculateStatsByTag(pokemon, pokemon.baseStats, pokemon.slug);

            item.scorePVP = HexagonStats.create(item.scores);

            let pokemonType = PokemonType.Normal;
            if (isInclude(item.speciesName, `(${FORM_SHADOW})`, IncludeMode.IncludeIgnoreCaseSensitive)) {
              pokemonType = PokemonType.Shadow;
            }

            return BattlePokemonData.create({
              ...item,
              name,
              pokemon,
              id,
              form,
              stats,
              pokemonType,
            });
          })
          .filter((pokemon) => pokemon.id > 0);
        setData(result);
        dispatch(SpinnerActions.HideSpinner.create());
      } catch (e) {
        if ((e as AxiosError)?.status === 404) {
          setIsFound(false);
        } else {
          dispatch(
            SpinnerActions.ShowSpinnerMsg.create({
              isError: true,
              message: (e as AxiosError).message,
            })
          );
        }
      }
    },
    [dataStore.options, dataStore.pokemons, dataStore.assets, dispatch]
  );

  useEffect(() => {
    const fetchPokemon = async (league: number) => {
      await fetchPokemonBattle(league);
    };
    if (isNotEmpty(dataStore.pokemons) && isNotEmpty(dataStore.assets)) {
      fetchPokemon(league);
    }
    return () => {
      dispatch(SpinnerActions.HideSpinner.create());
    };
  }, [fetchPokemonBattle, league, dispatch]);

  useEffect(() => {
    loadPVPMoves(dispatch);
  }, [dispatch]);

  const clearDataPokemonCurr = (removeCMoveSec: boolean) => {
    setPokemonObj(PokemonBattle.create({ ...pokemonObj, timeline: [] }));
    setPlayTimeline(new BattleState());
    if (removeCMoveSec) {
      setPokemonCurr(PokemonBattle.create({ ...pokemonCurr, cMoveSec: undefined, timeline: [] }));
    } else {
      setPokemonCurr(new PokemonBattle());
    }
  };

  const clearDataPokemonObj = (removeCMoveSec: boolean) => {
    setPokemonCurr(PokemonBattle.create({ ...pokemonCurr, timeline: [] }));
    setPlayTimeline(new BattleState());
    if (removeCMoveSec) {
      setPokemonObj(PokemonBattle.create({ ...pokemonObj, cMoveSec: undefined, timeline: [] }));
    } else {
      setPokemonObj(new PokemonBattle());
    }
  };

  const timelinePlay = useRef<number | null>(null);
  const start = useRef(0);
  const [playState, setPlayState] = useState(false);
  const scrollWidth = useRef(0);
  const xFit = useRef(0);
  const xNormal = useRef<number | null>(null);
  const arrBound = useRef<(DOMRect | undefined)[]>([]);
  const arrStore = useRef<(DOMRect | undefined)[]>([]);

  const getTranslation = (elem: HTMLElement) =>
    elem ? toNumber(elem.style.transform.replace('translate(', '').replace('px, -50%)', '')) : 0;

  const onPlayLineMove = (e: TimelineEvent<HTMLDivElement>) => {
    stopTimeLine();
    const elem = document.getElementById('play-line');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, (e.clientX ?? e.changedTouches?.[0].clientX ?? 0) - rect.left);
    const xPos = toNumber(xNormal.current);
    if (elem && x <= toNumber(timelineNormal.current?.clientWidth) - 2) {
      elem.style.transform = `translate(${x}px, -50%)`;
    }
    if (
      !isNotEmpty(arrBound.current) &&
      isNotEmpty(pokemonCurr.timeline) &&
      arrBound.current.length < pokemonCurr.timeline.length
    ) {
      for (let i = 0; i < pokemonCurr.timeline.length; i++) {
        arrBound.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
      }
    }
    if (xPos <= 0) {
      if (timelineNormalContainer.current) {
        const rect = timelineNormalContainer.current.getBoundingClientRect();
        xNormal.current = rect.left;
      }
    }
    overlappingPos(arrBound.current, x + xPos);
  };

  const onPlayLineFitMove = (e: TimelineEvent<HTMLDivElement>) => {
    stopTimeLine();
    const elem = document.getElementById('play-line');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, (e.clientX ?? e.changedTouches?.[0].clientX ?? 0) - rect.left);
    if (elem && x <= toNumber(timelineFit.current?.clientWidth)) {
      elem.style.transform = `translate(${x}px, -50%)`;
    }
    if (
      (xFit.current !== e.currentTarget.clientWidth || !isNotEmpty(arrStore.current)) &&
      isNotEmpty(pokemonCurr.timeline) &&
      arrStore.current.length < pokemonCurr.timeline.length
    ) {
      xFit.current = e.currentTarget.clientWidth;
      for (let i = 0; i < pokemonCurr.timeline.length; i++) {
        arrStore.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
      }
    }
    overlappingPos(arrStore.current, elem?.getBoundingClientRect().left);
  };

  const playingTimeLine = () => {
    setPlayState(true);
    const range = pokemonCurr.timeline.length;
    const elem = document.getElementById('play-line');
    let xCurrent = 0;
    if (elem) {
      if (timelineType === TimelineType.Normal) {
        xCurrent = elem.style.transform
          ? getTranslation(elem) >= toNumber(timelineNormal.current?.clientWidth) - 2
            ? 0
            : getTranslation(elem)
          : 0;
        timelineNormalContainer.current?.scrollTo({
          left: Math.max(0, xCurrent - timelineNormalContainer.current?.clientWidth / 2),
        });
        if (!xNormal.current) {
          if (timelineNormalContainer.current) {
            const rect = timelineNormalContainer.current.getBoundingClientRect();
            xNormal.current = rect.left;
          }
        }
        if (!isNotEmpty(arrBound.current)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            arrBound.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
          }
        }
      } else {
        const clientWidth = toNumber(timelineFit.current?.clientWidth);
        xCurrent = elem.style.transform ? (getTranslation(elem) >= clientWidth - 1 ? 0 : getTranslation(elem)) : 0;
        xFit.current = clientWidth;
        if (!isNotEmpty(arrStore.current)) {
          for (let i = 0; i < range; i++) {
            arrStore.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
          }
        }
      }
    }
    if (!start.current) {
      start.current = performance.now();
    }
    timelinePlay.current = requestAnimationFrame(function animate(timestamp: number) {
      if (timelineType === TimelineType.Normal) {
        const durationFactor =
          Math.min(1, Math.max(0, (timestamp - start.current) / (500 * arrBound.current.length))) * duration;
        const clientWidth = toNumber(timelineNormal.current?.clientWidth);
        const clientWidthContainer = toNumber(timelineNormalContainer.current?.clientWidth);
        const width = Math.min(clientWidth - 2, xCurrent + durationFactor * (clientWidth - 2));
        if (width >= clientWidth - 2) {
          if (elem) {
            elem.style.transform = `translate(${clientWidth - 2}px, -50%)`;
          }
          return stopTimeLine();
        }
        if (elem) {
          elem.style.transform = `translate(${width}px, -50%)`;
          overlappingPos(arrBound.current, width + toNumber(xNormal.current));
        }
        if (Math.min(width, clientWidthContainer / 2) === clientWidthContainer / 2) {
          timelineNormalContainer.current?.scrollTo({
            left: width - timelineNormalContainer.current?.clientWidth / 2,
          });
        }
        if (width < clientWidth) {
          timelinePlay.current = requestAnimationFrame(animate);
        }
      } else {
        const clientWidth = toNumber(timelineFit.current?.clientWidth);
        const durationFactor =
          Math.min(1, Math.max(0, (timestamp - start.current) / (500 * arrStore.current.length))) * duration;
        const width = Math.min(clientWidth, xCurrent + durationFactor * clientWidth);
        if (elem) {
          elem.style.transform = `translate(${width}px, -50%)`;
          overlappingPos(arrStore.current, elem.getBoundingClientRect().left);
        }
        if (width < clientWidth) {
          timelinePlay.current = requestAnimationFrame(animate);
        } else {
          if (elem) {
            elem.style.transform = `translate(${timelineFit.current?.clientWidth}px, -50%)`;
          }
          return stopTimeLine();
        }
      }
    });
  };

  const stopTimeLine = () => {
    setPlayState(false);
    cancelAnimationFrame(toNumber(timelinePlay.current));
    timelinePlay.current = null;
    start.current = 0;
    return;
  };

  const resetTimeLine = () => {
    stopTimeLine();
    const elem = document.getElementById('play-line');
    if (timelineType === TimelineType.Normal && timelineNormalContainer.current) {
      timelineNormalContainer.current.scrollTo({
        left: 0,
      });
    }
    if (elem) {
      elem.style.transform = 'translate(0px, -50%)';
    }
    setPlayTimeline({
      pokemonCurr: PokemonBattleData.setValue(
        pokemonCurr.energy,
        Math.floor(toNumber(pokemonCurr.pokemonData?.currentStats?.stats?.statSTA))
      ),
      pokemonObj: PokemonBattleData.setValue(
        pokemonObj.energy,
        Math.floor(toNumber(pokemonObj.pokemonData?.currentStats?.stats?.statSTA))
      ),
    });
  };

  const overlappingPos = (arr: (DOMRect | undefined)[], pos = 0, sound = false) => {
    const index = arr.filter((dom) => toNumber(dom?.left) <= pos).length;
    if (index >= 0 && index < arr.length) {
      updateTimeline(index, sound);
    }
  };

  const isPlaySound = (sound: HTMLAudioElement | undefined) =>
    sound && sound.currentTime > 0 && !sound.paused && !sound.ended && sound.readyState > sound.HAVE_CURRENT_DATA;

  const updateTimeline = (index: number, sound = false) => {
    const pokeCurrData = pokemonCurr.timeline.at(index);
    const pokeObjData = pokemonObj.timeline.at(index);
    if (sound && pokemonCurr.audio?.fMove && pokemonObj.audio?.fMove) {
      if (!isPlaySound(pokemonCurr.audio.fMove) && pokeCurrData?.type === AttackType.Fast) {
        pokemonCurr.audio.fMove.currentTime = 0;
        pokemonCurr.audio.fMove.play();
      } else if (isPlaySound(pokemonCurr.audio.fMove) && pokeCurrData?.type === AttackType.Fast) {
        pokemonCurr.audio.fMove.pause();
      }
      if (!isPlaySound(pokemonObj.audio.fMove) && pokeObjData?.type === AttackType.Fast) {
        pokemonObj.audio.fMove.currentTime = 0;
        pokemonObj.audio.fMove.play();
      } else if (isPlaySound(pokemonObj.audio.fMove) && pokeObjData?.type === AttackType.Fast) {
        pokemonObj.audio.fMove.pause();
      }
    }
    setPlayTimeline({
      pokemonCurr: PokemonBattleData.setValue(pokeCurrData?.energy, pokeCurrData?.hp),
      pokemonObj: PokemonBattleData.setValue(pokeObjData?.energy, pokeObjData?.hp),
    });
  };

  const onScrollTimeline = (e: React.SyntheticEvent<HTMLDivElement>) => {
    scrollWidth.current = e.currentTarget.scrollLeft;
  };

  const onChangeTimeline = (type: TimelineType, prevWidth: number | undefined) => {
    stopTimeLine();
    let elem = document.getElementById('play-line');
    let xCurrent = 0,
      transform;
    if (elem) {
      xCurrent = toNumber(elem.style.transform.replace('translate(', '').replace('px, -50%)', ''));
    }
    setOptions({ ...options, timelineType: type });
    setTimeout(() => {
      if (type === TimelineType.Normal) {
        if (!isNotEmpty(arrBound.current) && isNotEmpty(pokemonCurr.timeline)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            arrBound.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
          }
        }
        transform = (xCurrent / toNumber(prevWidth)) * toNumber(timelineNormal.current?.clientWidth) - 2;
        elem = document.getElementById('play-line');
        if (elem) {
          elem.style.transform = `translate(${Math.max(0, transform)}px, -50%)`;
        }
        timelineNormalContainer.current?.scrollTo({
          left: Math.min(transform, transform - timelineNormalContainer.current?.clientWidth / 2),
        });
      } else {
        if (!isNotEmpty(arrStore.current) && isNotEmpty(pokemonCurr.timeline)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            arrStore.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
          }
        }
        transform = (xCurrent / toNumber(prevWidth)) * toNumber(timelineFit.current?.clientWidth);
        elem = document.getElementById('play-line');
        if (elem) {
          elem.style.transform = `translate(${transform}px, -50%)`;
        }
      }
    }, 100);
  };

  const findBuff = (move: ICombat | undefined) => {
    if (!isNotEmpty(move?.buffs)) {
      return <></>;
    }
    return (
      <div className="bufs-container d-flex flex-row column-gap-1">
        {move?.buffs.map((value, index) => (
          <div key={index} className="d-flex position-relative column-gap-1">
            <img width={15} height={15} alt="Image ATK" src={value.type === TypeAction.Atk ? ATK_LOGO : DEF_LOGO} />
            <div className="position-absolute icon-buff">
              {value.power >= 2 && <KeyboardDoubleArrowUpIcon fontSize="small" sx={{ color: 'green' }} />}
              {value.power === 1 && <KeyboardArrowUpIcon fontSize="small" sx={{ color: 'green' }} />}
              {value.power === -1 && <KeyboardArrowDownIcon fontSize="small" sx={{ color: 'red' }} />}
              {value.power <= -2 && <KeyboardDoubleArrowDownIcon fontSize="small" sx={{ color: 'red' }} />}
              <span className={value.power < 0 ? 'text-danger' : 'text-success'} style={{ fontSize: 12 }}>
                {value.power}
              </span>
            </div>
            <b style={{ fontSize: 12 }}>{toNumber(value.buffChance) * 100}%</b>
          </div>
        ))}
      </div>
    );
  };

  const calculateStatPokemon = (
    e: React.FormEvent<HTMLFormElement>,
    type: BattleType,
    pokemon: IPokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>
  ) => {
    e.preventDefault();
    if (!pokemon.pokemonData) {
      enqueueSnackbar('Pokémon not found.', {
        variant: VariantType.Error,
      });
      return;
    }
    const battleType = getKeyWithData(BattleType, type);
    const atk = toNumber(pokemon.pokemonData.stats?.atk);
    const def = toNumber(pokemon.pokemonData.stats?.def);
    const sta = toNumber(pokemon.pokemonData.stats?.sta);
    const atkIV = toNumber((document.getElementById(`atkIV${battleType}`) as HTMLInputElement).value);
    const defIV = toNumber((document.getElementById(`defIV${battleType}`) as HTMLInputElement).value);
    const staIV = toNumber((document.getElementById(`hpIV${battleType}`) as HTMLInputElement).value);
    const level = toNumber((document.getElementById(`level${battleType}`) as HTMLInputElement).value);
    const cp = calculateCP(atk + atkIV, def + defIV, sta + staIV, level);

    const paramCP = toNumber(params?.cp);
    if (cp > paramCP) {
      enqueueSnackbar(`This stats Pokémon CP is greater than ${paramCP}, which is not permitted by the league.`, {
        variant: VariantType.Error,
      });
      return;
    }

    const id = toNumber(pokemon.pokemonData.pokemon?.num);
    const stats = getBaseStatsByIVandLevel(atk, def, sta, cp, id, level, atkIV, defIV, staIV);
    setPokemon(
      PokemonBattle.create({
        ...pokemon,
        timeline: [],
        pokemonData: PokemonBattleData.create({
          ...pokemon.pokemonData,
          currentStats: stats,
        }),
      })
    );
  };

  const randomCP = (atk: number, def: number, sta: number) => {
    const atkIV = getRandomNumber(MIN_IV, MAX_IV);
    const defIV = getRandomNumber(MIN_IV, MAX_IV);
    const staIV = getRandomNumber(MIN_IV, MAX_IV);
    const level = getRandomNumber(MIN_LEVEL, MAX_LEVEL, 0.5);
    const cp = calculateCP(atk + atkIV, def + defIV, sta + staIV, level);
    return new StatsCalculate(atkIV, defIV, staIV, cp, level);
  };

  const onSetStats = (
    type: BattleType,
    pokemon: IPokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>,
    isRandom = false
  ) => {
    if (!pokemon.pokemonData) {
      return;
    }

    let stats: IBattleBaseStats | undefined = new BattleBaseStats();
    if (isRandom) {
      const maxCP = toNumber(params?.cp);
      const id = toNumber(pokemon.pokemonData.pokemon?.num);
      const atk = toNumber(pokemon.pokemonData.stats?.atk);
      const def = toNumber(pokemon.pokemonData.stats?.def);
      const sta = toNumber(pokemon.pokemonData.stats?.sta);
      let statsCalculate = randomCP(atk, def, sta);
      while (statsCalculate.CP < MIN_CP || statsCalculate.CP > maxCP) {
        statsCalculate = randomCP(atk, def, sta);
      }
      stats = getBaseStatsByIVandLevel(
        atk,
        def,
        sta,
        statsCalculate.CP,
        id,
        statsCalculate.level,
        statsCalculate.IV.atkIV,
        statsCalculate.IV.defIV,
        statsCalculate.IV.staIV
      );
    } else {
      stats = pokemon.pokemonData.bestStats;
    }

    const battleType = getKeyWithData(BattleType, type);
    (document.getElementById(`level${battleType}`) as HTMLInputElement).value = getValueOrDefault(
      String,
      stats?.level?.toString()
    );
    (document.getElementById(`atkIV${battleType}`) as HTMLInputElement).value = getValueOrDefault(
      String,
      stats?.IV?.atkIV.toString()
    );
    (document.getElementById(`defIV${battleType}`) as HTMLInputElement).value = getValueOrDefault(
      String,
      stats?.IV?.defIV.toString()
    );
    (document.getElementById(`hpIV${battleType}`) as HTMLInputElement).value = getValueOrDefault(
      String,
      stats?.IV?.staIV.toString()
    );

    setPokemon(
      PokemonBattle.create({
        ...pokemon,
        timeline: [],
        pokemonData: PokemonBattleData.create({
          ...pokemon.pokemonData,
          currentStats: stats,
        }),
      })
    );
  };

  const renderInfoPokemon = (
    type: BattleType,
    pokemon: IPokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>
  ) => {
    const battleType = getKeyWithData(BattleType, type);
    return (
      <Accordion defaultActiveKey={[]} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Information</Accordion.Header>
          <Accordion.Body>
            <div className="w-100 d-flex justify-content-center">
              <div className="position-relative filter-shadow" style={{ width: 128 }}>
                <PokemonIconType pokemonType={pokemon.pokemonType} size={64}>
                  <img
                    alt="Image League"
                    className="pokemon-sprite-raid"
                    src={APIService.getPokemonModel(pokemon.pokemonData?.form, pokemon.pokemonData?.id)}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getValidPokemonImgPath(
                        e.currentTarget.src,
                        pokemon.pokemonData?.id,
                        pokemon.pokemonData?.form
                      );
                    }}
                  />
                </PokemonIconType>
              </div>
            </div>
            <div className="w-100 d-flex justify-content-center align-items-center gap-1">
              <LinkToTop
                to={`/pvp/${params.cp}/${getKeyWithData(
                  ScoreType,
                  ScoreType.Overall
                )?.toLowerCase()}/${pokemon.pokemonData?.speciesId?.replaceAll('_', '-')}`}
              >
                <VisibilityIcon className="view-pokemon theme-text-primary" fontSize="large" />
              </LinkToTop>
              <b>{`#${pokemon.pokemonData?.id} ${splitAndCapitalize(pokemon.pokemonData?.name, '-', ' ')}`}</b>
            </div>
            <h6>
              <b>Stats</b>
            </h6>
            CP: <b>{Math.floor(toNumber(pokemon.pokemonData?.currentStats?.CP))}</b> | {'Level: '}
            <b>{pokemon.pokemonData?.currentStats?.level ?? MIN_LEVEL}</b>
            <br />
            {'IV: '}
            <b>
              {toNumber(pokemon.pokemonData?.currentStats?.IV?.atkIV)}/
              {toNumber(pokemon.pokemonData?.currentStats?.IV?.defIV)}/
              {toNumber(pokemon.pokemonData?.currentStats?.IV?.staIV)}
            </b>
            <br />
            <img className="me-2" alt="Image Logo" width={20} height={20} src={ATK_LOGO} />
            {'Attack: '}
            <b>
              {Math.floor(
                toNumber(pokemon.pokemonData?.currentStats?.stats?.statATK) *
                  getDmgMultiplyBonus(pokemon.pokemonType, dataStore.options, TypeAction.Atk)
              )}
            </b>
            <br />
            <img className="me-2" alt="Image Logo" width={20} height={20} src={DEF_LOGO} />
            {'Defense: '}
            <b>
              {Math.floor(
                toNumber(pokemon.pokemonData?.currentStats?.stats?.statDEF) *
                  getDmgMultiplyBonus(pokemon.pokemonType, dataStore.options, TypeAction.Def)
              )}
            </b>
            <br />
            <img className="me-2" alt="Image Logo" width={20} height={20} src={HP_LOGO} />
            HP: <b>{toNumber(Math.floor(toNumber(pokemon.pokemonData?.currentStats?.stats?.statSTA)))}</b>
            <br />
            {'Stats Prod: '}
            <b>
              {Math.round(
                toNumber(pokemon.pokemonData?.currentStats?.stats?.statATK) *
                  toNumber(pokemon.pokemonData?.currentStats?.stats?.statDEF) *
                  toNumber(pokemon.pokemonData?.currentStats?.stats?.statSTA) *
                  getDmgMultiplyBonus(pokemon.pokemonType, dataStore.options, TypeAction.Prod)
              )}
            </b>
            <br />
            <form
              onSubmit={(e) => {
                calculateStatPokemon(e, type, pokemon, setPokemon);
              }}
            >
              <div className="mt-2 input-group">
                <span className="input-group-text">Level</span>
                <input
                  className="form-control shadow-none"
                  defaultValue={pokemon.pokemonData?.currentStats?.level}
                  id={`level${battleType}`}
                  type="number"
                  step={0.5}
                  min={MIN_LEVEL}
                  max={MAX_LEVEL}
                />
              </div>
              <div className="input-group">
                <span className="input-group-text">Attack IV</span>
                <input
                  className="form-control shadow-none"
                  defaultValue={pokemon.pokemonData?.currentStats?.IV?.atkIV}
                  id={`atkIV${battleType}`}
                  type="number"
                  step={1}
                  min={MIN_IV}
                  max={MAX_IV}
                />
              </div>
              <div className="input-group">
                <span className="input-group-text">Defense IV</span>
                <input
                  className="form-control shadow-none"
                  defaultValue={pokemon.pokemonData?.currentStats?.IV?.defIV}
                  id={`defIV${battleType}`}
                  type="number"
                  step={1}
                  min={MIN_IV}
                  max={MAX_IV}
                />
              </div>
              <div className="input-group">
                <span className="input-group-text">HP IV</span>
                <input
                  className="form-control shadow-none"
                  defaultValue={pokemon.pokemonData?.currentStats?.IV?.staIV}
                  id={`hpIV${battleType}`}
                  type="number"
                  step={1}
                  min={MIN_IV}
                  max={MAX_IV}
                />
              </div>
              <div className="w-100 mt-2">
                <Button type="submit" className="w-100" color="primary">
                  Calculate Stats
                </Button>
              </div>
            </form>
            <div className="w-100 mt-2">
              <Button className="w-100" color="primary" onClick={() => onSetStats(type, pokemon, setPokemon, true)}>
                Set Random Stats
              </Button>
            </div>
            <div className="w-100 mt-2">
              <Button className="w-100" color="primary" onClick={() => onSetStats(type, pokemon, setPokemon)}>
                Set Best Stats
              </Button>
            </div>
            <hr />
            <TypeBadge
              isFind
              title="Fast Move"
              move={pokemon.fMove}
              moveType={getMoveType(pokemon.pokemonData?.pokemon, pokemon.fMove?.name)}
            />
            <div className="d-flex w-100 position-relative column-gap-2">
              <TypeBadge
                isFind
                title="Primary Charged Move"
                move={pokemon.cMovePri}
                moveType={getMoveType(pokemon.pokemonData?.pokemon, pokemon.cMovePri?.name)}
              />
              {findBuff(pokemon.cMovePri)}
            </div>
            {pokemon.cMoveSec && (
              <div className="d-flex w-100 position-relative column-gap-2">
                <TypeBadge
                  isFind
                  title="Secondary Charged Move"
                  move={pokemon.cMoveSec}
                  moveType={getMoveType(pokemon.pokemonData?.pokemon, pokemon.cMoveSec.name)}
                />
                {findBuff(pokemon.cMoveSec)}
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const renderPokemonInfo = (
    type: BattleType,
    pokemon: IPokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>,
    clearDataPokemon: (removeMove: boolean) => void
  ) => {
    const pokemonType = getPropertyName(playTimeline, (o) =>
      type === BattleType.Object ? o.pokemonObj : o.pokemonCurr
    );
    return (
      <Fragment>
        <SelectPoke
          data={data}
          league={league}
          pokemonBattle={pokemon}
          setPokemonBattle={setPokemon}
          clearData={clearDataPokemon}
        />
        {pokemon.pokemonData && (
          <Fragment>
            <div className="input-group">
              <span className="input-group-text">Energy</span>
              <input
                className="form-control shadow-none"
                defaultValue={pokemon.energy}
                type="number"
                min={0}
                max={MAX_ENERGY(dataStore.options)}
                onInput={(e) => {
                  const value = toNumber(e.currentTarget.value);
                  if (isNaN(value)) {
                    return;
                  }
                  if (type === BattleType.Current) {
                    setPlayTimeline({
                      ...playTimeline,
                      pokemonCurr: PokemonBattleData.create({
                        ...playTimeline.pokemonCurr,
                        energy: value,
                      }),
                    });
                  } else if (type === BattleType.Object) {
                    setPlayTimeline({
                      ...playTimeline,
                      pokemonObj: PokemonBattleData.create({
                        ...playTimeline.pokemonObj,
                        energy: value,
                      }),
                    });
                  }
                  setPokemon(PokemonBattle.create({ ...pokemon, timeline: [], energy: value }));
                }}
              />
            </div>
            <div className="input-group">
              <span className="input-group-text">Block</span>
              <Form.Select
                className="form-control rounded-0"
                defaultValue={pokemon.block}
                onChange={(e) => {
                  setPlayTimeline({
                    ...playTimeline,
                    pokemonCurr: PokemonBattleData.create({
                      ...playTimeline.pokemonCurr,
                      energy: 0,
                    }),
                    pokemonObj: PokemonBattleData.create({
                      ...playTimeline.pokemonObj,
                      energy: 0,
                    }),
                  });
                  setPokemon(
                    PokemonBattle.create({ ...pokemon, timeline: [], energy: 0, block: toNumber(e.target.value) })
                  );
                }}
              >
                {getArrayBySeq(DEFAULT_BLOCK + 1).map((value, index) => (
                  <option key={index} value={value}>
                    {value}
                  </option>
                ))}
              </Form.Select>
            </div>
            {(!pokemon.disableCMovePri || !pokemon.disableCMoveSec) && (pokemon.cMovePri || pokemon.cMoveSec) && (
              <div className="input-group">
                <span className="input-group-text">Charge Slot</span>
                <Form.Select
                  className="form-control rounded-0"
                  value={pokemon.chargeSlot}
                  onChange={(e) => {
                    setPlayTimeline({
                      ...playTimeline,
                      pokemonCurr: PokemonBattleData.create({
                        ...playTimeline.pokemonCurr,
                        energy: 0,
                      }),
                      pokemonObj: PokemonBattleData.create({
                        ...playTimeline.pokemonObj,
                        energy: 0,
                      }),
                    });
                    setPokemon(
                      PokemonBattle.create({
                        ...pokemon,
                        timeline: [],
                        energy: 0,
                        chargeSlot: toNumber(e.target.value),
                      })
                    );
                  }}
                >
                  <option value={ChargeType.Primary} disabled={pokemon.disableCMovePri || !pokemon.cMovePri}>
                    {ChargeType.Primary}
                  </option>
                  <option value={ChargeType.Secondary} disabled={pokemon.disableCMoveSec || !pokemon.cMoveSec}>
                    {ChargeType.Secondary}
                  </option>
                  <option
                    value={ChargeType.Random}
                    disabled={
                      pokemon.disableCMovePri || pokemon.disableCMoveSec || !pokemon.cMovePri || !pokemon.cMoveSec
                    }
                  >
                    Random
                  </option>
                </Form.Select>
              </div>
            )}
            {pokemon && (
              <div className="w-100 bg-ref-pokemon">
                <div className="w-100 bg-type-moves">
                  <CircleBar
                    text={splitAndCapitalize(pokemon.cMovePri?.name, '_', ' ')}
                    type={pokemon.cMovePri?.type}
                    size={80}
                    maxEnergy={MAX_ENERGY(dataStore.options)}
                    moveEnergy={Math.abs(toNumber(pokemon.cMovePri?.pvpEnergy))}
                    energy={toNumber(
                      (playTimeline as unknown as DynamicObj<IPokemonBattleData>)[pokemonType]?.energy,
                      pokemon.energy
                    )}
                    isDisable={pokemon.disableCMovePri}
                  />
                  {pokemon.cMoveSec && (
                    <CircleBar
                      text={splitAndCapitalize(pokemon.cMoveSec.name, '_', ' ')}
                      type={pokemon.cMoveSec.type}
                      size={80}
                      maxEnergy={MAX_ENERGY(dataStore.options)}
                      moveEnergy={Math.abs(pokemon.cMoveSec.pvpEnergy)}
                      energy={toNumber(
                        (playTimeline as unknown as DynamicObj<IPokemonBattleData>)[pokemonType]?.energy,
                        pokemon.energy
                      )}
                      isDisable={pokemon.disableCMoveSec}
                    />
                  )}
                </div>
                {isNotEmpty(pokemonCurr.timeline) && isNotEmpty(pokemonObj.timeline) && (
                  <Fragment>
                    <HpBar
                      text="HP"
                      height={15}
                      hp={Math.floor((playTimeline as unknown as DynamicObj<IPokemonBattleData>)[pokemonType].hp)}
                      maxHp={Math.floor(toNumber(pokemon.pokemonData.currentStats?.stats?.statSTA))}
                    />
                  </Fragment>
                )}
              </div>
            )}
            {renderInfoPokemon(type, pokemon, setPokemon)}
          </Fragment>
        )}
      </Fragment>
    );
  };

  const CustomToggle = (props: Toggle) => {
    const decoratedOnClick = useAccordionButton(props.eventKey);

    return (
      <div className="btn-collapse-battle" onClick={decoratedOnClick}>
        {openBattle ? (
          <RemoveCircleIcon onClick={() => setOpenBattle(!openBattle)} fontSize="large" color="error" />
        ) : (
          <AddCircleIcon onClick={() => setOpenBattle(!openBattle)} fontSize="large" color="primary" />
        )}
      </div>
    );
  };

  return (
    <Error isError={!isFound}>
      <div className="container mt-2 battle-body-container">
        <Form.Select
          onChange={(e) => {
            navigateToTop(`/pvp/battle/${toNumber(e.target.value)}`);
            setOptions({ ...options, league: toNumber(e.target.value) });
          }}
          defaultValue={league}
        >
          <option value={BattleLeagueCPType.Little}>{getPokemonBattleLeagueName(BattleLeagueCPType.Little)}</option>
          <option value={BattleLeagueCPType.Great}>{getPokemonBattleLeagueName(BattleLeagueCPType.Great)}</option>
          <option value={BattleLeagueCPType.Ultra}>{getPokemonBattleLeagueName(BattleLeagueCPType.Ultra)}</option>
          <option value={BattleLeagueCPType.InsMaster}>{getPokemonBattleLeagueName(BattleLeagueCPType.Master)}</option>
        </Form.Select>
        <div className="row mt-2 m-0">
          <div className="col-lg-3">
            {renderPokemonInfo(BattleType.Current, pokemonCurr, setPokemonCurr, clearDataPokemonCurr)}
          </div>
          <div className="col-lg-6">
            {pokemonCurr.pokemonData &&
              pokemonObj.pokemonData &&
              isNotEmpty(pokemonCurr.timeline) &&
              isNotEmpty(pokemonObj.timeline) && (
                <Fragment>
                  <Accordion defaultActiveKey={[]}>
                    <Card className="position-relative">
                      <Card.Header className="p-0">
                        <div className="d-flex timeline-vertical">
                          <div className="w-50">
                            <div className="w-100 h-100 pokemon-battle-header d-flex align-items-center justify-content-start gap-2">
                              <div className="position-relative filter-shadow" style={{ width: 35 }}>
                                <PokemonIconType pokemonType={pokemonCurr.pokemonType} size={20}>
                                  <img
                                    alt="Image League"
                                    className="sprite-type"
                                    src={APIService.getPokemonModel(
                                      pokemonCurr.pokemonData.form,
                                      pokemonCurr.pokemonData.id
                                    )}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = getValidPokemonImgPath(
                                        e.currentTarget.src,
                                        pokemonCurr.pokemonData?.id,
                                        pokemonCurr.pokemonData?.form
                                      );
                                    }}
                                  />
                                </PokemonIconType>
                              </div>
                              <b>{splitAndCapitalize(pokemonCurr.pokemonData.name, '-', ' ')}</b>
                            </div>
                          </div>
                          <div className="w-50">
                            <div className="w-100 h-100 pokemon-battle-header d-flex align-items-center justify-content-end gap-2">
                              <div className="position-relative filter-shadow" style={{ width: 35 }}>
                                <PokemonIconType pokemonType={pokemonObj.pokemonType} size={20}>
                                  <img
                                    alt="Image League"
                                    className="sprite-type"
                                    src={APIService.getPokemonModel(
                                      pokemonObj.pokemonData.form,
                                      pokemonObj.pokemonData.id
                                    )}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = getValidPokemonImgPath(
                                        e.currentTarget.src,
                                        pokemonObj.pokemonData?.id,
                                        pokemonObj.pokemonData?.form
                                      );
                                    }}
                                  />
                                </PokemonIconType>
                              </div>
                              <b>{splitAndCapitalize(pokemonObj.pokemonData.name, '-', ' ')}</b>
                            </div>
                          </div>
                        </div>
                        <CustomToggle eventKey="0" />
                      </Card.Header>
                      <Accordion.Collapse eventKey="0">
                        <Card.Body className="p-0">{TimeLineVertical(pokemonCurr, pokemonObj)}</Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                  <div>
                    {timelineType === TimelineType.Normal ? (
                      <Fragment>
                        {TimeLine(
                          pokemonCurr,
                          pokemonObj,
                          timelineNormalContainer as React.LegacyRef<HTMLDivElement>,
                          onScrollTimeline,
                          timelineNormal as React.LegacyRef<HTMLDivElement>,
                          playLine as React.LegacyRef<HTMLDivElement>,
                          onPlayLineMove,
                          showTap
                        )}
                      </Fragment>
                    ) : (
                      <Fragment>
                        {TimeLineFit(
                          pokemonCurr,
                          pokemonObj,
                          timelineFit as React.LegacyRef<HTMLDivElement>,
                          playLine as React.LegacyRef<HTMLDivElement>,
                          onPlayLineFitMove,
                          showTap
                        )}
                      </Fragment>
                    )}
                    <div className="d-flex justify-content-center">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showTap}
                            onChange={(_, check) => setOptions({ ...options, showTap: check })}
                          />
                        }
                        label="Show Tap Move"
                      />
                      <RadioGroup
                        row
                        aria-labelledby="row-timeline-group-label"
                        name="row-timeline-group"
                        value={timelineType}
                        onChange={(e) =>
                          onChangeTimeline(
                            toNumber(e.target.value),
                            timelineType === TimelineType.Normal
                              ? timelineNormal.current?.clientWidth
                              : timelineFit.current?.clientWidth
                          )
                        }
                      >
                        <FormControlLabel
                          value={TimelineType.Fit}
                          control={<Radio />}
                          label={<span>Fit Timeline</span>}
                        />
                        <FormControlLabel
                          value={TimelineType.Normal}
                          control={<Radio />}
                          label={<span>Normal Timeline</span>}
                        />
                      </RadioGroup>
                      <FormControl variant={VariantType.Standard} sx={{ m: 1, minWidth: 120 }} disabled={playState}>
                        <InputLabel>Speed</InputLabel>
                        <Select
                          value={duration}
                          onChange={(e) => setOptions({ ...options, duration: toFloat(e.target.value) })}
                          label="Speed"
                        >
                          <MenuItem value={0.5}>x0.5</MenuItem>
                          <MenuItem value={1}>Normal</MenuItem>
                          <MenuItem value={2}>x2</MenuItem>
                          <MenuItem value={5}>x5</MenuItem>
                          <MenuItem value={10}>x10</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    <div className="d-flex justify-content-center column-gap-2">
                      <button
                        className="btn btn-primary"
                        onMouseDown={() => (playState ? stopTimeLine() : playingTimeLine())}
                        onTouchEnd={() => (playState ? stopTimeLine() : playingTimeLine())}
                      >
                        {playState ? (
                          <Fragment>
                            <PauseIcon /> Stop
                          </Fragment>
                        ) : (
                          <Fragment>
                            <PlayArrowIcon /> Play
                          </Fragment>
                        )}
                      </button>
                      <button disabled={playState} className="btn btn-danger" onClick={() => resetTimeLine()}>
                        <RestartAltIcon /> Reset
                      </button>
                    </div>
                  </div>
                </Fragment>
              )}
          </div>
          <div className="col-lg-3">
            {renderPokemonInfo(BattleType.Object, pokemonObj, setPokemonObj, clearDataPokemonObj)}
          </div>
        </div>
        {pokemonCurr.pokemonData && pokemonObj.pokemonData && (
          <div className="text-center mt-2">
            <button className="btn btn-primary" style={{ height: 50 }} onClick={() => battleAnimation()}>
              {isNotEmpty(pokemonCurr.timeline) && isNotEmpty(pokemonObj.timeline) ? (
                <Fragment>
                  <RestartAltIcon /> Reset Battle
                </Fragment>
              ) : (
                <Fragment>
                  <span className="position-relative">
                    <img height={36} alt="ATK Left" src={ATK_LOGO} />
                    <img className="battle-logo" height={36} alt="ATK Right" src={ATK_LOGO} />
                  </span>
                  {' Battle Simulator'}
                </Fragment>
              )}
            </button>
          </div>
        )}
      </div>
    </Error>
  );
};

export default Battle;
