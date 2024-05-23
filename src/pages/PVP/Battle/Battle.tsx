import React, { Fragment, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import SelectPoke from './Select';
import APIService from '../../../services/API.service';
import { capitalize, convertNameRankingToOri, splitAndCapitalize } from '../../../util/Utils';
import { findAssetForm } from '../../../util/Compute';
import { calculateCP, calculateStatsBattle, calculateStatsByTag, getTypeEffective } from '../../../util/Calculate';
import { MAX_IV, MAX_LEVEL, MIN_IV, MIN_LEVEL, SHADOW_ATK_BONUS, SHADOW_DEF_BONUS, STAB_MULTIPLY } from '../../../util/Constants';
import { Accordion, Button, Card, Form, useAccordionButton } from 'react-bootstrap';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import { TimeLine, TimeLineFit, TimeLineVertical } from './Timeline';
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Radio, RadioGroup, Select } from '@mui/material';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import atk_logo from '../../../assets/attack.png';
import def_logo from '../../../assets/defense.png';
import hp_logo from '../../../assets/hp.png';
import CircleBar from '../../../components/Sprites/ProgressBar/Circle';
import HpBar from '../../../components/Sprites/ProgressBar/HpBar';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../../store/actions/spinner.action';

import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import { StoreState } from '../../../store/models/state.model';
import { BattlePokemonData, RankingsPVP } from '../../../core/models/pvp.model';
import { Buff, Combat } from '../../../core/models/combat.model';
import { PokemonBattle, PokemonBattleData, Timeline } from '../models/battle.model';
import { StatsPokemon } from '../../../core/models/stats.model';

interface OptionsBattle {
  showTap: boolean;
  timelineType: number;
  duration: number;
  league: number;
}

const Battle = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const params = useParams();
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  const [openBattle, setOpenBattle] = useState(false);
  const [data, setData]: [BattlePokemonData[], React.Dispatch<React.SetStateAction<BattlePokemonData[]>>] = useState(
    [] as BattlePokemonData[]
  );
  const [options, setOptions] = useState({
    showTap: false,
    timelineType: 1,
    duration: 1,
    league: params.cp ? parseInt(params.cp) : 500,
  });
  const { showTap, timelineType, duration, league }: OptionsBattle = options;

  const timelineFit: React.MutableRefObject<Element | undefined> = useRef();
  const timelineNormal: React.MutableRefObject<Element | undefined> = useRef();
  const timelineNormalContainer: React.MutableRefObject<Element | undefined> = useRef();
  const playLine: React.MutableRefObject<Element | undefined> = useRef();

  let timelineInterval: NodeJS.Timeout;
  let turnInterval: NodeJS.Timeout;

  const [pokemonCurr, setPokemonCurr]: [PokemonBattle, React.Dispatch<React.SetStateAction<PokemonBattle>>] = useState({
    timeline: [] as Timeline[],
    energy: 0,
    block: 2,
  });

  const [pokemonObj, setPokemonObj]: [PokemonBattle, React.Dispatch<React.SetStateAction<PokemonBattle>>] = useState({
    timeline: [] as Timeline[],
    energy: 0,
    block: 2,
  });

  const [playTimeline, setPlayTimeline]: any = useState({
    pokemonCurr: { hp: 0, energy: 0 },
    pokemonObj: { hp: 0, energy: 0 },
  });

  const State = (
    timer: number,
    type: string | null,
    color: string | null,
    size: number | null,
    tap: boolean,
    block: number,
    energy: number,
    hp: number,
    move: Combat | null = null,
    immune = null
  ): Timeline => {
    return {
      timer: timer ?? 0,
      type,
      move,
      color,
      size: size ?? 12,
      tap: tap ?? false,
      block: block ?? 0,
      energy: energy ?? 0,
      hp: hp ? Math.max(0, hp) : 0,
      dmgImmune: immune ?? false,
      buff: null,
    };
  };

  const calculateMoveDmgActual = (poke: PokemonBattleData | null, pokeObj: PokemonBattleData | null, move: Combat | undefined | null) => {
    if (poke && pokeObj) {
      const atkPoke = calculateStatsBattle(poke.stats.atk, poke.currentStats.IV.atk, poke.currentStats.level, true);
      const defPokeObj = calculateStatsBattle(pokeObj.stats.def, pokeObj.currentStats.IV.def, pokeObj.currentStats.level, true);
      poke.shadow = poke.shadow ?? false;
      pokeObj.shadow = pokeObj.shadow ?? false;
      return (
        (atkPoke *
          (move?.pvp_power ?? 0) *
          (poke.pokemon?.types.includes(move?.type ?? '') ? STAB_MULTIPLY(dataStore?.options) : 1) *
          (poke.shadow ? SHADOW_ATK_BONUS(dataStore?.options) : 1) *
          getTypeEffective(dataStore?.typeEff, move?.type ?? '', pokeObj.pokemon?.types ?? [])) /
        (defPokeObj * (pokeObj.shadow ? SHADOW_DEF_BONUS(dataStore?.options) : 1))
      );
    }
    return 1;
  };

  const Pokemon = (poke: PokemonBattle): PokemonBattleData => {
    return {
      hp: poke.pokemonData?.currentStats.stats.statsSTA,
      stats: poke.pokemonData?.stats,
      currentStats: poke.pokemonData?.currentStats,
      bestStats: poke.pokemonData?.bestStats,
      pokemon: poke.pokemonData?.pokemon ?? null,
      fmove: poke.fMove ?? null,
      cmove: poke.cMovePri ?? null,
      cmoveSec: poke.cMoveSec ?? null,
      energy: poke.energy ?? 0,
      block: poke.block ?? 2,
      turn: Math.ceil((poke.fMove?.durationMs ?? 0) / 500),
      shadow: poke.shadow ?? false,
      disableCMovePri: poke.disableCMovePri,
      disableCMoveSec: poke.disableCMoveSec,
    };
  };

  const battleAnimation = () => {
    if (!pokemonCurr.pokemonData || !pokemonObj.pokemonData) {
      return false;
    }

    if ((pokemonCurr.disableCMovePri && !pokemonCurr.cMoveSec) || (pokemonObj.disableCMovePri && !pokemonObj.cMoveSec)) {
      return false;
    }
    arrBound.current = [];
    arrStore.current = [];
    resetTimeLine();
    clearInterval(timelineInterval);
    clearInterval(turnInterval);

    let player1 = Pokemon(pokemonCurr);
    let player2 = Pokemon(pokemonObj);

    if (player1.disableCMovePri) {
      player1.cmove = player1.cmoveSec;
    }
    if (player1.disableCMoveSec) {
      player1.cmoveSec = player1.cmove;
    }

    if (player2.disableCMovePri) {
      player2.cmove = player2.cmoveSec;
    }
    if (player2.disableCMoveSec) {
      player2.cmoveSec = player2.cmove;
    }

    const timelinePri: Timeline[] = [];
    const timelineSec: Timeline[] = [];

    timelinePri.push(State(0, 'W', null, null, false, player1.block, player1.energy, player1.hp));
    timelinePri.push(State(1, 'W', null, null, false, player1.block, player1.energy, player1.hp));

    timelineSec.push(State(0, 'W', null, null, false, player2.block, player2.energy, player2.hp));
    timelineSec.push(State(1, 'W', null, null, false, player2.block, player2.energy, player2.hp));

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
    let chargeType: number;
    timelineInterval = setInterval(() => {
      timer += 1;
      timelinePri.push(State(timer, null, null, null, false, player1.block, player1.energy, player1.hp));
      timelineSec.push(State(timer, null, null, null, false, player2.block, player2.energy, player2.hp));
      if (!chargedPri && !chargedSec) {
        if (
          (!player1.disableCMovePri || !player1.disableCMoveSec) &&
          !preChargeSec &&
          (player1.energy >= Math.abs(player1.cmove?.pvp_energy ?? 1) ||
            (player1.cmoveSec && player1.energy >= Math.abs(player1.cmoveSec?.pvp_energy ?? 0)))
        ) {
          if (player1.energy >= Math.abs(player1.cmove?.pvp_energy ?? 0)) {
            chargeType = 1;
            player1.energy += player1.cmove?.pvp_energy ?? 0;
            timelinePri[timer] = {
              ...timelinePri[timer],
              type: 'P',
              color: player1.cmove?.type?.toLowerCase() ?? null,
              size: 12,
              move: player1.cmove,
            };
          }
          if (player1.cmoveSec && player1.energy >= Math.abs(player1.cmoveSec.pvp_energy)) {
            chargeType = 2;
            player1.energy += player1.cmoveSec.pvp_energy;
            timelinePri[timer] = {
              ...timelinePri[timer],
              type: 'P',
              color: player1.cmoveSec.type?.toLowerCase() ?? null,
              size: 12,
              move: player2.cmoveSec,
            };
          }
          if (tapSec) {
            immuneSec = true;
          }
          preChargePri = true;
          chargedPriCount = 16;
        }

        if (
          (!player2.disableCMovePri || !player2.disableCMoveSec) &&
          !preChargePri &&
          (player2.energy >= Math.abs(player2.cmove?.pvp_energy ?? 0) ||
            (player2.cmoveSec && player2.energy >= Math.abs(player2.cmoveSec.pvp_energy)))
        ) {
          if (player2.energy >= Math.abs(player2.cmove?.pvp_energy ?? 0)) {
            chargeType = 1;
            player2.energy += player2.cmove?.pvp_energy ?? 0;
            timelineSec[timer] = {
              ...timelineSec[timer],
              type: 'P',
              color: player2.cmove?.type?.toLowerCase() ?? null,
              size: 12,
              move: player2.cmove,
            };
          }
          if (player2.cmoveSec && player2.energy >= Math.abs(player2.cmoveSec.pvp_energy)) {
            chargeType = 2;
            player2.energy += player2.cmoveSec.pvp_energy;
            timelineSec[timer] = {
              ...timelineSec[timer],
              type: 'P',
              color: player2.cmoveSec.type?.toLowerCase() ?? null,
              size: 12,
              move: player2.cmoveSec,
            };
          }
          if (tapPri) {
            immunePri = true;
          }
          preChargeSec = true;
          chargedSecCount = 16;
        }

        if (!preChargePri) {
          if (!tapPri) {
            tapPri = true;
            if (!preChargeSec) {
              timelinePri[timer] = { ...timelinePri[timer], tap: true, move: player1.fmove };
            } else {
              timelinePri[timer].tap = false;
            }
            fastPriDelay = player1.turn - 1;
          } else {
            if (timelinePri[timer]) {
              timelinePri[timer].tap = false;
            }
          }

          if (tapPri && fastPriDelay === 0) {
            tapPri = false;
            if (!preChargeSec) {
              player2.hp -= calculateMoveDmgActual(player1, player2, player1.fmove);
            }
            player1.energy += player1.fmove?.pvp_energy ?? 0;
            timelinePri[timer] = {
              ...timelinePri[timer],
              type: 'F',
              color: player1.fmove?.type?.toLowerCase() ?? null,
              move: player1.fmove,
              dmgImmune: preChargeSec,
              tap: preChargeSec && player1.turn === 1 ? true : timelinePri[timer].tap,
            };
          } else {
            fastPriDelay -= 1;
            if (!preChargePri) {
              timelinePri[timer].type = 'W';
            }
          }
        }

        if (!preChargeSec) {
          if (!tapSec) {
            tapSec = true;
            if (!preChargePri) {
              timelineSec[timer] = { ...timelineSec[timer], tap: true, move: player2.fmove };
            } else {
              timelineSec[timer].tap = false;
            }
            fastSecDelay = player2.turn - 1;
          } else {
            if (timelineSec[timer]) {
              timelineSec[timer].tap = false;
            }
          }

          if (tapSec && fastSecDelay === 0) {
            tapSec = false;
            if (!preChargePri) {
              player1.hp -= calculateMoveDmgActual(player2, player1, player2.fmove);
            } else {
              immuneSec = true;
            }
            player2.energy += player2.fmove?.pvp_energy ?? 0;
            timelineSec[timer] = {
              ...timelineSec[timer],
              type: 'F',
              color: player2.fmove?.type?.toLowerCase() ?? null,
              move: player2.fmove,
              dmgImmune: preChargePri,
              tap: preChargePri && player2.turn === 1 ? true : timelineSec[timer].tap,
            };
          } else {
            fastSecDelay -= 1;
            if (!preChargeSec) {
              timelineSec[timer].type = 'W';
            }
          }
        }
      } else {
        if (chargedPri) {
          if (isDelay || chargedPriCount % 2 === 0) {
            timelinePri[timer].type = 'N';
          } else {
            if (chargeType === 1) {
              timelinePri[timer] = {
                ...timelinePri[timer],
                type: chargedPriCount === -1 ? 'C' : 'S',
                color: player1.cmove?.type?.toLowerCase() ?? null,
                size: timelinePri[timer - 2].size + 2,
                move: player1.cmove,
              };
            }
            if (chargeType === 2) {
              timelinePri[timer] = {
                ...timelinePri[timer],
                type: chargedPriCount === -1 ? 'C' : 'S',
                color: player1.cmoveSec?.type?.toLowerCase() ?? null,
                size: timelinePri[timer - 2].size + 2,
                move: player1.cmoveSec,
              };
            }
          }
          if (timelinePri[timer - 2]) {
            timelineSec[timer - 2].size = timelinePri[timer - 2].size;
          }
        } else {
          if (!isDelay && player1.block > 0 && chargedSecCount === -1) {
            timelinePri[timer].type = 'B';
          }
        }
        if (chargedSec) {
          if (isDelay || chargedSecCount % 2 === 0) {
            timelineSec[timer].type = 'N';
          } else {
            if (chargeType === 1) {
              timelineSec[timer] = {
                ...timelineSec[timer],
                type: chargedSecCount === -1 ? 'C' : 'S',
                color: player2.cmove?.type?.toLowerCase() ?? null,
                size: timelineSec[timer - 2].size + 2,
                move: player2.cmove,
              };
            }
            if (chargeType === 2) {
              timelineSec[timer] = {
                ...timelineSec[timer],
                type: chargedSecCount === -1 ? 'C' : 'S',
                color: player2.cmoveSec?.type?.toLowerCase() ?? null,
                size: timelineSec[timer - 2].size + 2,
                move: player2.cmoveSec,
              };
            }
          }
          if (timelineSec[timer - 2]) {
            timelinePri[timer - 2].size = timelineSec[timer - 2].size;
          }
        } else {
          if (!isDelay && player2.block > 0 && chargedPriCount === -1) {
            timelineSec[timer].type = 'B';
          }
        }
        timelinePri[timer].tap = false;
        timelineSec[timer].tap = false;
      }
    }, 1);
    let isDelay = false,
      delay = 1;
    turnInterval = setInterval(() => {
      if (!isDelay) {
        if (chargedPri) {
          if (chargedPriCount >= 0) {
            chargedPriCount--;
          } else {
            if (player2.block === 0) {
              if (chargeType === 1) {
                player2.hp -= calculateMoveDmgActual(player1, player2, player1.cmove);
              }
              if (chargeType === 2) {
                player2.hp -= calculateMoveDmgActual(player1, player2, player1.cmoveSec);
              }
            } else {
              player2.block -= 1;
            }
            const moveType = chargeType === 1 ? player1.cmove : player1.cmoveSec;
            const arrBufAtk: Buff[] = [],
              arrBufTarget: Buff[] = [];
            const randInt = parseFloat(Math.random().toFixed(3));
            if (moveType?.buffs && moveType?.buffs.length > 0 && randInt > 0 && randInt <= (moveType?.buffs?.at(0)?.buffChance ?? 0)) {
              moveType?.buffs.forEach((value) => {
                if (value.target === 'target') {
                  player2 = {
                    ...player2,
                    stats: {
                      ...player2.stats,
                      atk: value.type === 'atk' ? player2.stats.atk + value.power : player2.stats.atk,
                      def: value.type === 'def' ? player2.stats.def + value.power : player2.stats.def,
                    },
                  };
                  arrBufTarget.push(value);
                } else {
                  player1 = {
                    ...player1,
                    stats: {
                      ...player1.stats,
                      atk: value.type === 'atk' ? player1.stats.atk + value.power : player1.stats.atk,
                      def: value.type === 'def' ? player1.stats.def + value.power : player1.stats.def,
                    },
                  };
                  arrBufAtk.push(value);
                }
                timelinePri[timer].buff = arrBufAtk;
                timelineSec[timer].buff = arrBufTarget;
              });
            }
            isDelay = true;
            delay = 1;
          }
        } else if (preChargePri) {
          if (chargedPriCount === 16) {
            chargedPri = true;
          } else {
            chargedPriCount--;
          }
        } else if (chargedSec) {
          if (chargedSecCount >= 0) {
            chargedSecCount--;
          } else {
            if (player1.block === 0) {
              if (chargeType === 1) {
                player1.hp -= calculateMoveDmgActual(player2, player1, player2.cmove);
              }
              if (chargeType === 2) {
                player1.hp -= calculateMoveDmgActual(player2, player1, player2.cmoveSec);
              }
            } else {
              player1.block -= 1;
            }
            const moveType = chargeType === 1 ? player2.cmove : player2.cmoveSec;
            const arrBufAtk: Buff[] = [],
              arrBufTarget: Buff[] = [];
            const randInt = parseFloat(Math.random().toFixed(3));
            if (moveType?.buffs && moveType?.buffs.length > 0 && randInt > 0 && randInt <= (moveType?.buffs?.at(0)?.buffChance ?? 0)) {
              moveType?.buffs.forEach((value) => {
                if (value.target === 'target') {
                  player1 = {
                    ...player1,
                    stats: {
                      ...player1.stats,
                      atk: value.type === 'atk' ? player1.stats.atk + value.power : player1.stats.atk,
                      def: value.type === 'def' ? player1.stats.def + value.power : player1.stats.def,
                    },
                  };
                  arrBufTarget.push(value);
                } else {
                  player2 = {
                    ...player2,
                    stats: {
                      ...player2.stats,
                      atk: value.type === 'atk' ? player2.stats.atk + value.power : player2.stats.atk,
                      def: value.type === 'def' ? player2.stats.def + value.power : player2.stats.def,
                    },
                  };
                  arrBufAtk.push(value);
                }
                timelinePri[timer].buff = arrBufTarget;
                timelineSec[timer].buff = arrBufAtk;
              });
            }
            isDelay = true;
            delay = 1;
          }
        } else if (preChargeSec) {
          if (chargedSecCount === 16) {
            chargedSec = true;
          } else {
            chargedSecCount--;
          }
        }
      } else {
        if (delay === 0) {
          isDelay = false;
          if (chargedPri) {
            chargedPri = false;
            preChargePri = false;
          }
          if (chargedSec) {
            chargedSec = false;
            preChargeSec = false;
          }
          tapPri = false;
          tapSec = false;
          if (immunePri) {
            player2.hp -= calculateMoveDmgActual(player1, player2, player1.fmove);
            timelinePri[timer].dmgImmune = true;
          } else if (immuneSec) {
            player1.hp -= calculateMoveDmgActual(player2, player1, player2.fmove);
            timelineSec[timer].dmgImmune = true;
          }
          immunePri = false;
          immuneSec = false;
        } else {
          delay -= 1;
        }
      }
      if (player1.hp <= 0 || player2.hp <= 0) {
        clearInterval(timelineInterval);
        clearInterval(turnInterval);
        if (player1.hp <= 0) {
          timelinePri.push(State(timer, 'X', null, null, false, 0, player1.energy, player1.hp));
          if (player2.hp <= 0) {
            timelineSec.push(State(timer, 'X', null, null, false, 0, player2.energy, player2.hp));
          } else {
            if (timelinePri.length === timelineSec.length) {
              timelineSec[timelineSec.length - 1] = State(timer, 'Q', null, null, false, 0, player2.energy, player2.hp);
            } else {
              timelineSec.push(State(timer, 'Q', null, null, false, 0, player2.energy, player2.hp));
            }
          }
        } else if (player2.hp <= 0) {
          timelineSec.push(State(timer, 'X', null, null, false, 0, player2.energy, player2.hp));
          if (player1.hp <= 0) {
            timelinePri.push(State(timer, 'X', null, null, false, 0, player1.energy, player1.hp));
          } else {
            if (timelinePri.length === timelineSec.length) {
              timelinePri[timelinePri.length - 1] = State(timer, 'Q', null, null, false, 0, player1.energy, player1.hp);
            } else {
              timelinePri.push(State(timer, 'Q', null, null, false, 0, player1.energy, player1.hp));
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

  const clearData = useCallback(() => {
    setPokemonObj({
      pokemonData: null,
      fMove: null,
      cMovePri: null,
      cMoveSec: null,
      timeline: [],
      energy: 0,
      block: 2,
      shadow: false,
      disableCMovePri: false,
      disableCMoveSec: false,
    });
    setPokemonCurr({
      pokemonData: null,
      fMove: null,
      cMovePri: null,
      cMoveSec: null,
      timeline: [],
      energy: 0,
      block: 2,
      shadow: false,
      disableCMovePri: false,
      disableCMoveSec: false,
    });
  }, []);

  const fetchPokemonBattle = useCallback(
    async (league: number) => {
      dispatch(showSpinner());
      try {
        clearData();
        const file = (await APIService.getFetchUrl<RankingsPVP[]>(APIService.getRankingFile('all', league, 'overall'))).data;
        document.title = `PVP Battle Simalator - ${
          league === 500 ? 'Little Cup' : league === 1500 ? 'Great League' : league === 2500 ? 'Ultra League' : 'Master League'
        }`;

        setData(
          file
            .filter((pokemon) => !pokemon.speciesId.includes('_xs'))
            .map((item) => {
              const name = convertNameRankingToOri(item.speciesId.replace('_shadow', ''), item.speciesName);
              let pokemon = dataStore?.pokemon?.find((pokemon) => pokemon.slug === name);

              if (!pokemon) {
                pokemon = dataStore?.pokemon?.find((pokemon) => pokemon.slug === item.speciesId.replace('_shadow', ''));
                if (!pokemon) {
                  return null;
                }
              }

              const id = pokemon.num;
              const form = findAssetForm(dataStore?.assets ?? [], pokemon.num, pokemon.name);

              const stats = calculateStatsByTag(pokemon, pokemon.baseStats, pokemon.slug);

              return {
                ...item,
                name,
                pokemon,
                id,
                form,
                stats,
              };
            })
            .filter((pokemon) => pokemon) as BattlePokemonData[]
        );
        dispatch(hideSpinner());
      } catch (e: any) {
        dispatch(
          showSpinner({
            error: true,
            msg: e.message,
          })
        );
      }
    },
    [dataStore?.options, dataStore?.pokemon, dataStore?.assets]
  );

  useEffect(() => {
    const fetchPokemon = async (league: number) => {
      await fetchPokemonBattle(league);
    };
    if (dataStore?.options && dataStore?.pokemon && dataStore?.assets) {
      fetchPokemon(league);
    }
  }, [fetchPokemonBattle, league]);

  const clearDataPokemonCurr = (removeCMoveSec: boolean) => {
    setPokemonObj({ ...pokemonObj, timeline: [] });
    setPlayTimeline({
      pokemonCurr: { hp: 0, energy: 0 },
      pokemonObj: { hp: 0, energy: 0 },
    });
    if (removeCMoveSec) {
      setPokemonCurr({ ...pokemonCurr, cMoveSec: null, timeline: [] });
    } else {
      setPokemonCurr({
        ...pokemonCurr,
        pokemonData: null,
        fMove: null,
        cMovePri: null,
        cMoveSec: null,
        timeline: [],
        block: 2,
        shadow: false,
        disableCMovePri: false,
        disableCMoveSec: false,
      });
    }
  };

  const clearDataPokemonObj = (removeCMoveSec: boolean) => {
    setPokemonCurr({ ...pokemonCurr, timeline: [] });
    setPlayTimeline({
      pokemonCurr: { hp: 0, energy: 0 },
      pokemonObj: { hp: 0, energy: 0 },
    });
    if (removeCMoveSec) {
      setPokemonObj({ ...pokemonObj, cMoveSec: null, timeline: [] });
    } else {
      setPokemonObj({
        ...pokemonObj,
        pokemonData: null,
        fMove: null,
        cMovePri: null,
        cMoveSec: null,
        timeline: [],
        block: 2,
        shadow: false,
        disableCMovePri: false,
        disableCMoveSec: false,
      });
    }
  };

  const timelinePlay: MutableRefObject<number | null> = useRef(null);
  const start = useRef(0);
  const [playState, setPlayState] = useState(false);
  const scrollWidth = useRef(0);
  const xFit = useRef(0);
  const xNormal: MutableRefObject<number | null> = useRef(null);
  const arrBound: MutableRefObject<(DOMRect | undefined)[]> = useRef([]);
  const arrStore: MutableRefObject<(DOMRect | undefined)[]> = useRef([]);

  const getTranslation = (elem: HTMLElement) => {
    return elem ? parseInt(elem.style.transform.replace('translate(', '').replace('px, -50%)', '')) : 0;
  };

  const onPlayLineMove = (e: {
    currentTarget: { getBoundingClientRect: () => { left: number } };
    clientX: number;
    changedTouches: { clientX: number }[];
  }) => {
    stopTimeLine();
    const elem = document.getElementById('play-line');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, (e.clientX ?? e.changedTouches[0].clientX) - rect.left);
    if (elem && x <= (timelineNormal.current?.clientWidth ?? 0) - 2) {
      elem.style.transform = 'translate(' + x + 'px, -50%)';
    }
    if (arrBound.current.length === 0 && pokemonCurr.timeline) {
      for (let i = 0; i < pokemonCurr.timeline.length; i++) {
        arrBound.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
      }
    }
    if (!xNormal.current) {
      const element: any = ReactDOM.findDOMNode(timelineNormalContainer.current);
      const rect = element?.getBoundingClientRect();
      xNormal.current = rect.left;
    }
    overlappingPos(arrBound.current, x + (xNormal.current ?? 0));
  };

  const onPlayLineFitMove = (e: {
    currentTarget: { getBoundingClientRect: () => any; clientWidth: number };
    clientX: number;
    changedTouches: { clientX: number }[];
  }) => {
    stopTimeLine();
    const elem = document.getElementById('play-line');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, (e.clientX ?? e.changedTouches[0].clientX) - rect.left);
    if (elem && x <= (timelineFit.current?.clientWidth ?? 0)) {
      elem.style.transform = 'translate(' + x + 'px, -50%)';
    }
    if ((xFit.current !== e.currentTarget.clientWidth || arrStore.current.length === 0) && pokemonCurr.timeline) {
      xFit.current = e.currentTarget.clientWidth;
      for (let i = 0; i < pokemonCurr.timeline.length; i++) {
        arrStore.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
      }
    }
    overlappingPos(arrStore.current, elem?.getBoundingClientRect().left);
  };

  const playingTimeLine = () => {
    setPlayState(true);
    const range = pokemonCurr.timeline?.length ?? 0;
    const elem = document.getElementById('play-line');
    let xCurrent = 0;
    if (elem) {
      if (timelineType) {
        xCurrent = elem.style.transform
          ? getTranslation(elem) >= (timelineNormal.current?.clientWidth ?? 0) - 2
            ? 0
            : getTranslation(elem)
          : 0;
        timelineNormalContainer.current?.scrollTo({
          left: Math.max(0, xCurrent - timelineNormalContainer.current?.clientWidth / 2),
        });
        if (!xNormal.current) {
          const element: any = ReactDOM.findDOMNode(timelineNormalContainer.current);
          const rect = element?.getBoundingClientRect();
          xNormal.current = rect.left;
        }
        if (arrBound.current.length === 0 && pokemonCurr.timeline) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            arrBound.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
          }
        }
      } else {
        xCurrent = elem.style.transform
          ? getTranslation(elem) >= (timelineFit.current?.clientWidth ?? 0) - 1
            ? 0
            : getTranslation(elem)
          : 0;
        xFit.current = timelineFit.current?.clientWidth ?? 0;
        if (arrStore.current.length === 0) {
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
      if (timelineType) {
        const durationFactor = Math.min(1, Math.max(0, (timestamp - start.current) / (500 * arrBound.current.length))) * duration;
        const width = Math.min(
          (timelineNormal.current?.clientWidth ?? 0) - 2,
          xCurrent + durationFactor * ((timelineNormal.current?.clientWidth ?? 0) - 2)
        );
        if (width >= (timelineNormal.current?.clientWidth ?? 0) - 2) {
          if (elem) {
            elem.style.transform = 'translate(' + ((timelineNormal.current?.clientWidth ?? 0) - 2) + 'px, -50%)';
          }
          return stopTimeLine();
        }
        if (elem) {
          elem.style.transform = 'translate(' + width + 'px, -50%)';
          overlappingPos(arrBound.current, width + (xNormal.current ?? 0), true);
        }
        if (
          Math.min(width, (timelineNormalContainer.current?.clientWidth ?? 0) / 2) ===
          (timelineNormalContainer.current?.clientWidth ?? 0) / 2
        ) {
          timelineNormalContainer.current?.scrollTo({
            left: width - timelineNormalContainer.current?.clientWidth / 2,
          });
        }
        if (width < (timelineNormal.current?.clientWidth ?? 0)) {
          timelinePlay.current = requestAnimationFrame(animate);
        }
      } else {
        const durationFactor = Math.min(1, Math.max(0, (timestamp - start.current) / (500 * arrStore.current.length))) * duration;
        const width = Math.min(timelineFit.current?.clientWidth ?? 0, xCurrent + durationFactor * (timelineFit.current?.clientWidth ?? 0));
        if (elem) {
          elem.style.transform = 'translate(' + width + 'px, -50%)';
          overlappingPos(arrStore.current, elem.getBoundingClientRect().left, true);
        }
        if (width < (timelineFit.current?.clientWidth ?? 0)) {
          timelinePlay.current = requestAnimationFrame(animate);
        } else {
          if (elem) {
            elem.style.transform = 'translate(' + timelineFit.current?.clientWidth + 'px, -50%)';
          }
          return stopTimeLine();
        }
      }
    });
  };

  const stopTimeLine = () => {
    setPlayState(false);
    cancelAnimationFrame(timelinePlay.current ?? 0);
    timelinePlay.current = null;
    start.current = 0;
    return;
  };

  const resetTimeLine = () => {
    stopTimeLine();
    const elem = document.getElementById('play-line');
    if (timelineType && timelineNormalContainer.current) {
      timelineNormalContainer.current.scrollTo({
        left: 0,
      });
    }
    if (elem) {
      elem.style.transform = 'translate(0px, -50%)';
    }
    setPlayTimeline({
      pokemonCurr: {
        hp: Math.floor(pokemonCurr.pokemonData?.currentStats.stats.statsSTA),
        energy: pokemonCurr.energy,
      },
      pokemonObj: { hp: Math.floor(pokemonObj.pokemonData?.currentStats.stats.statsSTA), energy: pokemonObj.energy },
    });
  };

  const overlappingPos = (arr: (DOMRect | undefined)[], pos = 0, sound = false) => {
    const index = arr.filter((dom) => (dom?.left ?? 0) <= pos).length;
    if (index >= 0 && index < arr.length) {
      updateTimeline(index, sound);
    }
  };

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const updateTimeline = (index: string | number, sound = false) => {
    const pokeCurrData = pokemonCurr.timeline?.at(parseInt(index.toString()));
    const pokeObjData = pokemonObj.timeline?.at(parseInt(index.toString()));
    // if (sound) {
    //   if (pokemonCurr.audio.fMove.paused && pokeCurrData.type === 'F') {
    //     pokemonCurr.audio.fMove.currentTime = 0;
    //     pokemonCurr.audio.fMove.play();
    //   } else if (!pokemonCurr.audio.fMove.paused && pokeCurrData.type === 'F') {
    //     pokemonCurr.audio.fMove.pause();
    //   }
    //   if (pokemonObj.audio.fMove.paused && pokeObjData.type === 'F') {
    //     pokemonObj.audio.fMove.currentTime = 0;
    //     pokemonObj.audio.fMove.play();
    //   } else if (!pokemonObj.audio.fMove.paused && pokeObjData.type === 'F') {
    //     pokemonObj.audio.fMove.pause();
    //   }
    // }
    setPlayTimeline({
      pokemonCurr: { hp: pokeCurrData?.hp ?? 0, energy: pokeCurrData?.energy ?? 0 },
      pokemonObj: { hp: pokeObjData?.hp ?? 0, energy: pokeObjData?.energy ?? 0 },
    });
  };

  const onScrollTimeline = (e: { currentTarget: { scrollLeft: number } }) => {
    scrollWidth.current = e.currentTarget.scrollLeft;
  };

  const onChangeTimeline = (type: number, prevWidth: number) => {
    stopTimeLine();
    let elem = document.getElementById('play-line');
    let xCurrent = 0,
      transform;
    if (elem) {
      xCurrent = parseInt(elem.style.transform.replace('translate(', '').replace('px, -50%)', ''));
    }
    setOptions({ ...options, timelineType: type });
    setTimeout(() => {
      if (type) {
        if (arrBound.current.length === 0 && pokemonCurr.timeline) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            arrBound.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
          }
        }
        transform = (xCurrent / prevWidth) * (timelineNormal.current?.clientWidth ?? 0) - 2;
        elem = document.getElementById('play-line');
        if (elem) {
          elem.style.transform = 'translate(' + Math.max(0, transform) + 'px, -50%)';
        }
        timelineNormalContainer.current?.scrollTo({
          left: Math.min(transform, transform - timelineNormalContainer.current?.clientWidth / 2),
        });
      } else {
        if (arrStore.current.length === 0 && pokemonCurr.timeline) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            arrStore.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
          }
        }
        transform = (xCurrent / prevWidth) * (timelineFit.current?.clientWidth ?? 0);
        elem = document.getElementById('play-line');
        if (elem) {
          elem.style.transform = 'translate(' + transform + 'px, -50%)';
        }
      }
    }, 100);
  };

  const findBuff = (move: Combat | undefined | null) => {
    if (move?.buffs.length === 0) {
      return;
    }
    return (
      <div className="bufs-container d-flex flex-row" style={{ columnGap: 5 }}>
        {move?.buffs.map((value, index) => (
          <div key={index} className="d-flex position-relative" style={{ columnGap: 5 }}>
            <img width={15} height={15} alt="img-atk" src={value.type === 'atk' ? atk_logo : def_logo} />
            <div className="position-absolute icon-buff">
              {value.power === 2 ? (
                <KeyboardDoubleArrowUpIcon fontSize="small" sx={{ color: value.power < 0 ? 'red' : 'green' }} />
              ) : (
                <Fragment>
                  {value.power === 1 ? (
                    <KeyboardArrowUpIcon fontSize="small" sx={{ color: value.power < 0 ? 'red' : 'green' }} />
                  ) : (
                    <Fragment>
                      {value.power === -1 ? (
                        <KeyboardArrowDownIcon fontSize="small" sx={{ color: value.power < 0 ? 'red' : 'green' }} />
                      ) : (
                        <KeyboardDoubleArrowDownIcon fontSize="small" sx={{ color: value.power < 0 ? 'red' : 'green' }} />
                      )}
                    </Fragment>
                  )}
                </Fragment>
              )}
              <span className={value.power < 0 ? 'text-danger' : 'text-success'} style={{ fontSize: 12 }}>
                {value.power}
              </span>
            </div>
            <b style={{ fontSize: 12 }}>{(value.buffChance ?? 0) * 100}%</b>
          </div>
        ))}
      </div>
    );
  };

  const calculateStatPokemon = (
    e: React.FormEvent<HTMLFormElement>,
    type: string,
    pokemon: PokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<PokemonBattle>>
  ) => {
    e.preventDefault();
    const level = parseInt((document.getElementById('level' + capitalize(type)) as HTMLInputElement).value);
    const atk = parseInt((document.getElementById('atkIV' + capitalize(type)) as HTMLInputElement).value);
    const def = parseInt((document.getElementById('defIV' + capitalize(type)) as HTMLInputElement).value);
    const sta = parseInt((document.getElementById('hpIV' + capitalize(type)) as HTMLInputElement).value);

    const cp = calculateCP(atk, def, sta, level);

    if (cp > parseInt(params?.cp ?? '')) {
      enqueueSnackbar('This stats Pokémon CP is greater than ' + params.cp + ', which is not permitted by the league.', {
        variant: 'error',
      });
      return;
    }

    let stats = pokemon.pokemonData?.allStats.find(
      (data: { level: number; IV: StatsPokemon }) =>
        data.level === level && data.IV.atk === atk && data.IV.def === def && data.IV.sta === sta
    );

    if (!stats) {
      const statsBattle = calculateStatsByTag(
        pokemon.pokemonData?.pokemon,
        pokemon.pokemonData?.pokemon?.baseStats,
        pokemon.pokemonData?.pokemon?.slug
      );

      const statsATK = calculateStatsBattle(statsBattle.atk, atk, level);
      const statsDEF = calculateStatsBattle(statsBattle.def, def, level);
      const statsSTA = calculateStatsBattle(statsBattle?.sta ?? 0, sta, level);
      stats = {
        IV: { atk, def, sta },
        CP: cp,
        level,
        stats: { statsATK, statsDEF, statsSTA },
        statsProds: statsATK * statsDEF * statsSTA,
      };
    }

    if (pokemon.pokemonData) {
      setPokemon({
        ...pokemon,
        timeline: [],
        pokemonData: {
          ...pokemon.pokemonData,
          currentStats: stats,
        },
      });
    }
  };

  const onSetStats = (
    type: string,
    pokemon: PokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<PokemonBattle>>,
    isRandom: boolean
  ) => {
    let stats: { level: string; IV: StatsPokemon };
    if (isRandom) {
      stats = pokemon.pokemonData?.allStats[Math.floor(Math.random() * pokemon.pokemonData?.allStats.length)];
    } else {
      stats = pokemon.pokemonData?.bestStats;
    }

    (document.getElementById('level' + capitalize(type)) as HTMLInputElement).value = stats.level;
    (document.getElementById('atkIV' + capitalize(type)) as HTMLInputElement).value = stats.IV.atk.toString();
    (document.getElementById('defIV' + capitalize(type)) as HTMLInputElement).value = stats.IV.def.toString();
    (document.getElementById('hpIV' + capitalize(type)) as HTMLInputElement).value = stats.IV.sta?.toString() ?? '';

    if (pokemon.pokemonData) {
      setPokemon({
        ...pokemon,
        timeline: [],
        pokemonData: {
          ...pokemon.pokemonData,
          currentStats: stats,
        },
      });
    }
  };

  const renderInfoPokemon = (type: string, pokemon: PokemonBattle, setPokemon: React.Dispatch<React.SetStateAction<PokemonBattle>>) => {
    return (
      <Accordion defaultActiveKey={[]} alwaysOpen={true}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Information</Accordion.Header>
          <Accordion.Body>
            <div className="w-100 d-flex justify-content-center">
              <div className="position-relative filter-shadow" style={{ width: 128 }}>
                {pokemon.shadow && <img height={64} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
                <img
                  alt="img-league"
                  className="pokemon-sprite-raid"
                  src={
                    pokemon.pokemonData?.form
                      ? APIService.getPokemonModel(pokemon.pokemonData.form)
                      : APIService.getPokeFullSprite(pokemon.pokemonData?.id)
                  }
                />
              </div>
            </div>
            <div className="w-100 d-flex justify-content-center align-items-center" style={{ gap: 5 }}>
              <Link to={`/pvp/${params.cp}/overall/${pokemon.pokemonData?.speciesId?.replaceAll('_', '-')}`}>
                <VisibilityIcon className="view-pokemon" fontSize="large" sx={{ color: 'black' }} />
              </Link>
              <b>{`#${pokemon.pokemonData?.id} ${splitAndCapitalize(pokemon.pokemonData?.name, '-', ' ')}`}</b>
            </div>
            <h6>
              <b>Stats</b>
            </h6>
            CP: <b>{Math.floor(pokemon.pokemonData?.currentStats.CP)}</b> | Level: <b>{pokemon.pokemonData?.currentStats.level}</b>
            <br />
            IV:{' '}
            <b>
              {pokemon.pokemonData?.currentStats.IV.atk}/{pokemon.pokemonData?.currentStats.IV.def}/
              {pokemon.pokemonData?.currentStats.IV.sta}
            </b>
            <br />
            <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={atk_logo} />
            Attack:{' '}
            <b>
              {Math.floor(pokemon.pokemonData?.currentStats.stats.statsATK * (pokemon.shadow ? SHADOW_ATK_BONUS(dataStore?.options) : 1))}
            </b>
            <br />
            <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={def_logo} />
            Defense:{' '}
            <b>
              {Math.floor(pokemon.pokemonData?.currentStats.stats.statsDEF * (pokemon.shadow ? SHADOW_DEF_BONUS(dataStore?.options) : 1))}
            </b>
            <br />
            <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={hp_logo} />
            HP: <b>{Math.floor(pokemon.pokemonData?.currentStats.stats.statsSTA)}</b>
            <br />
            Stats Prod:{' '}
            <b>
              {Math.round(
                pokemon.pokemonData?.currentStats.stats.statsATK *
                  pokemon.pokemonData?.currentStats.stats.statsDEF *
                  pokemon.pokemonData?.currentStats.stats.statsSTA *
                  (pokemon.shadow ? SHADOW_ATK_BONUS(dataStore?.options) * SHADOW_DEF_BONUS(dataStore?.options) : 1)
              )}
            </b>
            <br />
            <form
              onSubmit={(e) => {
                calculateStatPokemon(e, type, pokemon, setPokemon);
              }}
            >
              <div className="element-top input-group">
                <span className="input-group-text">Level</span>
                <input
                  className="form-control shadow-none"
                  defaultValue={pokemon.pokemonData?.currentStats.level}
                  id={'level' + capitalize(type)}
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
                  defaultValue={pokemon.pokemonData?.currentStats.IV.atk}
                  id={'atkIV' + capitalize(type)}
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
                  defaultValue={pokemon.pokemonData?.currentStats.IV.def}
                  id={'defIV' + capitalize(type)}
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
                  defaultValue={pokemon.pokemonData?.currentStats.IV.sta}
                  id={'hpIV' + capitalize(type)}
                  type="number"
                  step={1}
                  min={MIN_IV}
                  max={MAX_IV}
                />
              </div>
              <div className="w-100 element-top">
                <Button type="submit" className="w-100" color="primary">
                  Calculate Stats
                </Button>
              </div>
            </form>
            <div className="w-100 element-top">
              <Button className="w-100" color="primary" onClick={() => onSetStats(type, pokemon, setPokemon, true)}>
                Set Random Stats
              </Button>
            </div>
            <div className="w-100 element-top">
              <Button className="w-100" color="primary" onClick={() => onSetStats(type, pokemon, setPokemon, false)}>
                Set Best Stats
              </Button>
            </div>
            <hr />
            <TypeBadge
              find={true}
              title="Fast Move"
              move={pokemon.fMove}
              elite={pokemon.pokemonData?.combatPoke?.eliteQuickMove?.includes(pokemon.fMove?.name ?? '')}
            />
            <div className="d-flex w-100 position-relative" style={{ columnGap: 10 }}>
              <TypeBadge
                find={true}
                title="Primary Charged Move"
                move={pokemon.cMovePri}
                elite={pokemon.pokemonData?.combatPoke?.eliteCinematicMove?.includes(pokemon.cMovePri?.name ?? '')}
                special={pokemon.pokemonData?.combatPoke?.specialMoves?.includes(pokemon.cMovePri?.name ?? '')}
              />
              {findBuff(pokemon.cMovePri)}
            </div>
            {pokemon.cMoveSec && (
              <div className="d-flex w-100 position-relative" style={{ columnGap: 10 }}>
                <TypeBadge
                  find={true}
                  title="Secondary Charged Move"
                  move={pokemon.cMoveSec}
                  elite={pokemon.pokemonData?.combatPoke?.eliteCinematicMove?.includes(pokemon.cMoveSec?.name ?? '')}
                  special={pokemon.pokemonData?.combatPoke?.specialMoves?.includes(pokemon.cMovePri?.name ?? '')}
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
    type: string,
    pokemon: PokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<PokemonBattle>>,
    // eslint-disable-next-line no-unused-vars
    clearDataPokemon: (removeMove: boolean) => void
  ) => {
    return (
      <Fragment>
        <SelectPoke data={data} league={league} pokemonBattle={pokemon} setPokemonBattle={setPokemon} clearData={clearDataPokemon} />
        {pokemon.pokemonData && (
          <Fragment>
            <div className="input-group">
              <span className="input-group-text">Energy</span>
              <input
                className="form-control shadow-none"
                defaultValue={pokemon.energy}
                type="number"
                min={0}
                max={100}
                onInput={(e) => {
                  if (type === 'pokemonCurr') {
                    setPlayTimeline({
                      ...playTimeline,
                      pokemonCurr: { ...playTimeline.pokemonCurr, energy: e.currentTarget.value ? parseInt(e.currentTarget.value) : 0 },
                    });
                  } else if (type === 'pokemonObj') {
                    setPlayTimeline({
                      ...playTimeline,
                      pokemonObj: { ...playTimeline.pokemonObj, energy: e.currentTarget.value ? parseInt(e.currentTarget.value) : 0 },
                    });
                  }
                  setPokemon({ ...pokemon, timeline: [], energy: e.currentTarget.value ? parseInt(e.currentTarget.value) : 0 });
                }}
              />
            </div>
            <div className="input-group">
              <span className="input-group-text">Block</span>
              <Form.Select
                style={{ borderRadius: 0 }}
                className="form-control"
                defaultValue={pokemon.block}
                onChange={(e) => {
                  setPokemon({ ...pokemon, timeline: [], block: parseInt(e.target.value) });
                }}
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
              </Form.Select>
            </div>
            {pokemon && (
              <div className="w-100 bg-ref-pokemon">
                <div className="w-100 bg-type-moves">
                  <CircleBar
                    text={splitAndCapitalize(pokemon.cMovePri?.name, '_', ' ')}
                    type={pokemon.cMovePri?.type}
                    size={80}
                    maxEnergy={100}
                    moveEnergy={Math.abs(pokemon.cMovePri?.pvp_energy ?? 0)}
                    energy={playTimeline[type]?.energy ?? pokemon.energy ?? 0}
                    disable={pokemon.disableCMovePri}
                  />
                  {pokemon.cMoveSec && (
                    <CircleBar
                      text={splitAndCapitalize(pokemon.cMoveSec.name, '_', ' ')}
                      type={pokemon.cMoveSec.type}
                      size={80}
                      maxEnergy={100}
                      moveEnergy={Math.abs(pokemon.cMoveSec.pvp_energy)}
                      energy={playTimeline[type]?.energy ?? pokemon.energy ?? 0}
                      disable={pokemon.disableCMoveSec}
                    />
                  )}
                </div>
                {pokemonCurr.timeline && pokemonCurr.timeline.length > 0 && pokemonObj.timeline && pokemonObj.timeline.length > 0 && (
                  <Fragment>
                    <HpBar
                      text={'HP'}
                      height={15}
                      hp={Math.floor(playTimeline[type].hp)}
                      maxHp={Math.floor(pokemon.pokemonData.currentStats.stats.statsSTA)}
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

  const CustomToggle = ({ eventKey }: any) => {
    const decoratedOnClick = useAccordionButton(eventKey);

    return (
      <div className="btn-collape-battle" onClick={decoratedOnClick}>
        {openBattle ? (
          <RemoveCircleIcon
            onClick={() => {
              setOpenBattle(!openBattle);
            }}
            fontSize="large"
            color="error"
          />
        ) : (
          <AddCircleIcon
            onClick={() => {
              setOpenBattle(!openBattle);
            }}
            fontSize="large"
            color="primary"
          />
        )}
      </div>
    );
  };

  return (
    <div className="container element-top battle-body-container">
      <Form.Select
        onChange={(e) => {
          navigate(`/pvp/battle/${parseInt(e.target.value)}`);
          setOptions({ ...options, league: parseInt(e.target.value) });
        }}
        defaultValue={league}
      >
        <option value={500}>Little Cup</option>
        <option value={1500}>Great League</option>
        <option value={2500}>Ultra League</option>
        <option value={10000}>Master League</option>
      </Form.Select>
      <div className="row element-top" style={{ margin: 0 }}>
        <div className="col-lg-3">{renderPokemonInfo('pokemonCurr', pokemonCurr, setPokemonCurr, clearDataPokemonCurr)}</div>
        <div className="col-lg-6">
          {pokemonCurr.pokemonData &&
            pokemonObj.pokemonData &&
            pokemonCurr.timeline &&
            pokemonCurr.timeline.length > 0 &&
            pokemonObj.timeline &&
            pokemonObj.timeline.length > 0 && (
              <Fragment>
                <Accordion defaultActiveKey={[]}>
                  <Card className="position-relative">
                    <Card.Header style={{ padding: 0 }}>
                      <div className="d-flex timeline-vertical">
                        <div className="w-50">
                          <div
                            className="w-100 h-100 pokemon-battle-header d-flex align-items-center justify-content-start"
                            style={{ gap: 10 }}
                          >
                            <div className="position-relative filter-shadow" style={{ width: 35 }}>
                              <img
                                alt="img-league"
                                className="sprite-type"
                                src={
                                  pokemonCurr.pokemonData.form
                                    ? APIService.getPokemonModel(pokemonCurr.pokemonData.form)
                                    : APIService.getPokeFullSprite(pokemonCurr.pokemonData.id)
                                }
                              />
                            </div>
                            <b>{splitAndCapitalize(pokemonCurr.pokemonData.name, '-', ' ')}</b>
                          </div>
                        </div>
                        <div className="w-50">
                          <div
                            className="w-100 h-100 pokemon-battle-header d-flex align-items-center justify-content-end"
                            style={{ gap: 10 }}
                          >
                            <div className="position-relative filter-shadow" style={{ width: 35 }}>
                              <img
                                alt="img-league"
                                className="sprite-type"
                                src={
                                  pokemonObj.pokemonData.form
                                    ? APIService.getPokemonModel(pokemonObj.pokemonData.form)
                                    : APIService.getPokeFullSprite(pokemonObj.pokemonData.id)
                                }
                              />
                            </div>
                            <b>{splitAndCapitalize(pokemonObj.pokemonData.name, '-', ' ')}</b>
                          </div>
                        </div>
                      </div>
                      <CustomToggle eventKey="0" />
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                      <Card.Body style={{ padding: 0 }}>{TimeLineVertical(pokemonCurr, pokemonObj)}</Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
                <div>
                  {timelineType ? (
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
                      control={<Checkbox checked={showTap} onChange={(_, check) => setOptions({ ...options, showTap: check })} />}
                      label="Show Tap Move"
                    />
                    <RadioGroup
                      row={true}
                      aria-labelledby="row-timeline-group-label"
                      name="row-timeline-group"
                      value={timelineType}
                      onChange={(e) =>
                        onChangeTimeline(
                          parseInt(e.target.value),
                          (timelineType ? timelineNormal.current?.clientWidth : timelineFit.current?.clientWidth) ?? 0
                        )
                      }
                    >
                      <FormControlLabel value={0} control={<Radio />} label={<span>Fit Timeline</span>} />
                      <FormControlLabel value={1} control={<Radio />} label={<span>Normal Timeline</span>} />
                    </RadioGroup>
                    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }} disabled={playState}>
                      <InputLabel>Speed</InputLabel>
                      <Select
                        value={duration}
                        onChange={(e) => setOptions({ ...options, duration: parseFloat(e.target.value.toString()) })}
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
                  <div className="d-flex justify-content-center" style={{ columnGap: 10 }}>
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
        <div className="col-lg-3">{renderPokemonInfo('pokemonObj', pokemonObj, setPokemonObj, clearDataPokemonObj)}</div>
      </div>
      {pokemonCurr.pokemonData &&
        pokemonObj.pokemonData &&
        ((pokemonCurr.timeline && pokemonCurr.timeline.length === 0) || (pokemonObj.timeline && pokemonObj.timeline.length === 0)) && (
          <div className="text-center element-top">
            <button className="btn btn-primary" onClick={() => battleAnimation()}>
              <span className="position-relative">
                <img height={36} alt="atk-left" src={atk_logo} />
                <img className="battle-logo" height={36} alt="atk-right" src={atk_logo} />
              </span>{' '}
              Battle Simulator
            </button>
          </div>
        )}
    </div>
  );
};

export default Battle;
