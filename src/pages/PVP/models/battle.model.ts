import { Combat, IBuff, ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import {
  IStatsAtk,
  IStatsDef,
  IStatsPokemonGO,
  IStatsProd,
  IStatsSta,
  StatsPokemonGO,
} from '../../../core/models/stats.model';
import { BuffType, PokemonType, TypeAction } from '../../../enums/type.enum';
import { IDataModel } from '../../../store/models/store.model';
import { BATTLE_DELAY, DEFAULT_AMOUNT, DEFAULT_BLOCK, DEFAULT_PLUS_SIZE, DEFAULT_SIZE } from '../../../utils/constants';
import { isNotEmpty, isUndefined, toFloat, toNumber } from '../../../utils/extension';
import { IBattleBaseStats } from '../../../utils/models/calculate.model';
import { getPokemonType } from '../../../utils/utils';
import { AttackType } from '../Battle/enums/attack-type.enum';
import { addState, calculateMoveDmgActual, getRandomNumber, state, updateState } from '../utils/battle.utils';

export enum ChargeType {
  None = -1,
  Random,
  Primary,
  Secondary,
}

interface MoveAudio {
  fMove?: HTMLAudioElement;
  cMovePri?: HTMLAudioElement;
  cMoveSec?: HTMLAudioElement;
}

export interface IPokemonBattleData {
  speciesId?: string;
  name?: string;
  form?: string;
  id?: number;
  pokemonType: PokemonType;
  hp: number;
  stats: IStatsPokemonGO | undefined;
  bestStats: IBattleBaseStats | undefined;
  currentStats: IBattleBaseStats | undefined;
  pokemon: IPokemonData | undefined;
  fMove: ICombat | undefined;
  cMove: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  energy: number;
  block: number;
  turn: number;
  disableCMoveSec: boolean;
  disableCMovePri: boolean;
}

export class PokemonBattleData implements IPokemonBattleData {
  speciesId?: string;
  name?: string;
  form?: string;
  id?: number;
  pokemonType = PokemonType.Normal;
  hp = 0;
  stats: IStatsPokemonGO | undefined;
  bestStats: IBattleBaseStats | undefined;
  currentStats: IBattleBaseStats | undefined;
  pokemon: IPokemonData | undefined;
  fMove = new Combat();
  cMove = new Combat();
  cMoveSec: ICombat | undefined;
  energy = 0;
  block = 0;
  turn = 0;
  disableCMoveSec = false;
  disableCMovePri = false;

  static create(value: IPokemonBattleData) {
    const obj = new PokemonBattleData();
    obj.pokemonType = getPokemonType(obj.form);
    Object.assign(obj, value);
    return obj;
  }

  static battle(value: IPokemonBattle) {
    const obj = new PokemonBattleData();
    Object.assign(obj, {
      ...value,
      hp: toNumber(value.pokemonData?.currentStats?.stats?.statSTA),
      stats: value.pokemonData?.stats,
      currentStats: value.pokemonData?.currentStats,
      bestStats: value.pokemonData?.bestStats,
      pokemon: value.pokemonData?.pokemon,
      fMove: value.fMove,
      cMove: value.cMovePri,
      cMoveSec: value.cMoveSec,
      energy: value.energy,
      block: toNumber(value.block, DEFAULT_BLOCK),
      turn: Math.ceil(toNumber(value.fMove?.durationMs) / 500),
      pokemonType: value.pokemonType,
      disableCMovePri: value.disableCMovePri,
    });
    return obj;
  }

  static setValue(energy: number | undefined, hp: number | undefined) {
    const obj = new PokemonBattleData();
    obj.energy = toNumber(energy);
    obj.hp = toNumber(hp);
    return obj;
  }
}

export interface IPokemonBattle {
  disableCMoveSec: boolean;
  disableCMovePri: boolean;
  pokemonType: PokemonType;
  pokemonData?: IPokemonBattleData;
  fMove?: ICombat;
  cMovePri?: ICombat;
  cMoveSec?: ICombat;
  timeline: ITimeline[];
  energy: number;
  block: number;
  chargeSlot: ChargeType;
  audio?: MoveAudio;
}

export class PokemonBattle implements IPokemonBattle {
  disableCMoveSec = false;
  disableCMovePri = false;
  pokemonType = PokemonType.Normal;
  pokemonData?: IPokemonBattleData;
  fMove?: ICombat;
  cMovePri?: ICombat;
  cMoveSec?: ICombat;
  timeline: ITimeline[] = [];
  energy = 0;
  block = DEFAULT_BLOCK;
  chargeSlot = ChargeType.Primary;
  audio?: MoveAudio;

  static create(value: IPokemonBattle) {
    const obj = new PokemonBattle();
    obj.pokemonType = obj.pokemonData?.pokemonType ?? PokemonType.Normal;
    Object.assign(obj, value);
    return obj;
  }
}

export interface TimelineConfig {
  color?: string;
  timer: number;
  size?: number;
  isTap?: boolean;
  isDmgImmune?: boolean;
  type?: AttackType;
  move?: ICombat;
}

export interface ITimeline extends TimelineConfig {
  block: number;
  energy: number;
  hp: number;
  buff?: IBuff[];
}

export class TimelineModel implements ITimeline {
  timer = 0;
  type?: AttackType;
  color?: string;
  size = 0;
  isTap?: boolean;
  block = 0;
  energy = 0;
  move?: ICombat;
  hp = 0;
  buff?: IBuff[];
  isDmgImmune?: boolean;

  constructor({ ...props }: ITimeline) {
    Object.assign(this, props);
  }
}

export interface IPokemonTeamData {
  id: number | undefined;
  name: string | undefined;
  speciesId: string;
  pokemonData: IPokemonData | undefined;
  form: string | undefined;
  stats: IStatsPokemonGO;
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  pokemonType: PokemonType;
}

export class PokemonTeamData implements IPokemonTeamData {
  id: number | undefined;
  name: string | undefined;
  speciesId = '';
  pokemonData: IPokemonData | undefined;
  form = '';
  stats = new StatsPokemonGO();
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  pokemonType = PokemonType.Normal;

  constructor({ ...props }: IPokemonTeamData) {
    if (props.pokemonType === PokemonType.Normal || props.pokemonType === PokemonType.None) {
      props.pokemonType = getPokemonType(props.speciesId);
    }
    Object.assign(this, props);
  }
}

export interface IPokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number | undefined;
  name: string | undefined;
  pokemon: IPokemonData | undefined;
  form: string | undefined;
  stats: IStatsPokemonGO;
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  prod: IStatsProd | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  bestStats?: IBattleBaseStats;
  pokemonType: PokemonType;
}

export class PokemonBattleRanking implements IPokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number | undefined;
  name: string | undefined;
  pokemon: IPokemonData | undefined;
  form = '';
  stats = new StatsPokemonGO();
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  prod: IStatsProd | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  bestStats?: IBattleBaseStats;
  pokemonType = PokemonType.Normal;

  constructor({ ...props }: IPokemonBattleRanking) {
    if (props.pokemonType === PokemonType.Normal || props.pokemonType === PokemonType.None) {
      props.pokemonType = getPokemonType(props.form);
    }
    Object.assign(this, props);
  }
}

export interface IPokemonBattleConfig {
  tap: boolean;
  fastDelay: number;
  preCharge: boolean;
  immune: boolean;
  charged: boolean;
  chargeSlot: ChargeType;
  chargedCount: number;
  preRandomPlayer: boolean;
  postRandomPlayer: boolean;
}

export class PokemonBattleConfig implements IPokemonBattleConfig {
  tap = false;
  fastDelay = 0;
  preCharge = false;
  immune = false;
  charged = false;
  chargeSlot = ChargeType.None;
  chargedCount = 0;
  preRandomPlayer = false;
  postRandomPlayer = false;
}

export interface IBattlePVP {
  pokemon: PokemonBattleData;
  pokemonOpponent: PokemonBattleData;
  timeline: ITimeline[];
  timelineOpponent: ITimeline[];
  config: IPokemonBattleConfig;
  configOpponent: IPokemonBattleConfig;
  timer: number;
  chargeType: ChargeType;
  isDelay: boolean;
  delay: number;
  dataStore: IDataModel;
}

export class BattlePVP implements IBattlePVP {
  pokemon = new PokemonBattleData();
  pokemonOpponent = new PokemonBattleData();
  timeline: ITimeline[] = [];
  timelineOpponent: ITimeline[] = [];
  config = new PokemonBattleConfig();
  configOpponent = new PokemonBattleConfig();
  timer = 0;
  chargeType = ChargeType.None;
  isDelay = false;
  delay = BATTLE_DELAY;
  dataStore!: IDataModel;

  static create(initPokemon: PokemonBattle, initPokemonOpponent: PokemonBattle, store: IDataModel, isWaiting = true) {
    const obj = new BattlePVP();
    obj.pokemon = PokemonBattleData.battle(initPokemon);
    obj.pokemonOpponent = PokemonBattleData.battle(initPokemonOpponent);
    obj.dataStore = store;
    obj.config.chargeSlot = initPokemon.chargeSlot;
    obj.configOpponent.chargeSlot = initPokemonOpponent.chargeSlot;

    if (obj.pokemon.cMoveSec && (obj.pokemon.disableCMovePri || obj.config.chargeSlot === ChargeType.Secondary)) {
      obj.pokemon.cMove = obj.pokemon.cMoveSec;
      obj.config.chargeSlot = ChargeType.Primary;
    }

    if (
      obj.pokemonOpponent.cMoveSec &&
      (obj.pokemonOpponent.disableCMovePri || obj.configOpponent.chargeSlot === ChargeType.Secondary)
    ) {
      obj.pokemonOpponent.cMove = obj.pokemonOpponent.cMoveSec;
      obj.configOpponent.chargeSlot = ChargeType.Primary;
    }

    if (obj.pokemon.disableCMovePri && obj.pokemon.disableCMoveSec) {
      obj.config.chargeSlot = ChargeType.None;
    }

    if (obj.pokemonOpponent.disableCMovePri && obj.pokemonOpponent.disableCMoveSec) {
      obj.configOpponent.chargeSlot = ChargeType.None;
    }

    obj.config.preRandomPlayer = obj.config.chargeSlot === ChargeType.Random;
    obj.configOpponent.preRandomPlayer = obj.configOpponent.chargeSlot === ChargeType.Random;

    if (isWaiting) {
      addState(obj.timeline, obj.timer, obj.pokemon.block, obj.pokemon.energy, obj.pokemon.hp, AttackType.Wait);
      addState(obj.timeline, obj.timer + 1, obj.pokemon.block, obj.pokemon.energy, obj.pokemon.hp, AttackType.Wait);
      addState(
        obj.timelineOpponent,
        obj.timer,
        obj.pokemonOpponent.block,
        obj.pokemonOpponent.energy,
        obj.pokemonOpponent.hp,
        AttackType.Wait
      );
      addState(
        obj.timelineOpponent,
        obj.timer + 1,
        obj.pokemonOpponent.block,
        obj.pokemonOpponent.energy,
        obj.pokemonOpponent.hp,
        AttackType.Wait
      );
    }
    obj.timer = 1;
    return obj;
  }

  updateBattle() {
    this.timer += 1;
    addState(this.timeline, this.timer, this.pokemon.block, this.pokemon.energy, this.pokemon.hp);
    addState(
      this.timelineOpponent,
      this.timer,
      this.pokemonOpponent.block,
      this.pokemonOpponent.energy,
      this.pokemonOpponent.hp
    );
  }

  gainEnergy(chargeType: ChargeType, isOpponent = false) {
    const pokemon = isOpponent ? this.pokemonOpponent : this.pokemon;
    const config = isOpponent ? this.configOpponent : this.config;
    const configOpponent = isOpponent ? this.config : this.configOpponent;
    const timeline = isOpponent ? this.timelineOpponent : this.timeline;
    const move = chargeType === ChargeType.Primary ? pokemon.cMove : pokemon.cMoveSec;
    if (
      pokemon.energy >= Math.abs(toNumber(move?.pvpEnergy)) &&
      ((!config.preRandomPlayer &&
        (!isOpponent || !configOpponent.postRandomPlayer) &&
        this.config.chargeSlot !== (chargeType === ChargeType.Primary ? ChargeType.Secondary : ChargeType.Primary)) ||
        (config.postRandomPlayer && this.config.chargeSlot === chargeType))
    ) {
      this.chargeType = chargeType;
      pokemon.energy += toNumber(move?.pvpEnergy);
      updateState(timeline, {
        type: AttackType.Prepare,
        move,
        size: DEFAULT_SIZE,
        timer: this.timer,
      });
      config.preCharge = true;
      if (configOpponent.tap) {
        configOpponent.immune = true;
      }
      config.chargedCount = DEFAULT_AMOUNT;
    }
  }

  chargeAttack(isOpponent = false) {
    const pokemon = isOpponent ? this.pokemonOpponent : this.pokemon;
    const config = isOpponent ? this.configOpponent : this.config;
    const configOpponent = isOpponent ? this.config : this.configOpponent;

    if ((!pokemon.disableCMovePri || !pokemon.disableCMoveSec) && !configOpponent.preCharge) {
      if (config.preRandomPlayer && !config.postRandomPlayer) {
        this.config.chargeSlot = getRandomNumber(ChargeType.Primary, ChargeType.Secondary);
        config.postRandomPlayer = true;
      }
      this.gainEnergy(ChargeType.Primary, isOpponent);
      this.gainEnergy(ChargeType.Secondary, isOpponent);
    }
  }

  preCharge(isOpponent = false) {
    const config = isOpponent ? this.configOpponent : this.config;
    const configOpponent = isOpponent ? this.config : this.configOpponent;
    const timeline = isOpponent ? this.timelineOpponent : this.timeline;
    const player = isOpponent ? this.pokemonOpponent : this.pokemon;
    const playerOpponent = isOpponent ? this.pokemon : this.pokemonOpponent;

    if (!config.preCharge) {
      if (!config.tap) {
        config.tap = true;
        if (!configOpponent.preCharge) {
          updateState(timeline, {
            timer: this.timer,
            move: player.fMove,
            isTap: true,
          });
        } else {
          timeline[this.timer].isTap = false;
        }
        config.fastDelay = player.turn - 1;
      } else if (timeline[this.timer]) {
        timeline[this.timer].isTap = false;
      }

      if (config.tap && config.fastDelay === 0) {
        config.tap = false;
        if (!configOpponent.preCharge) {
          playerOpponent.hp -= calculateMoveDmgActual(this.dataStore, player, playerOpponent, player.fMove);
        }
        player.energy += player.fMove.pvpEnergy;
        updateState(timeline, {
          timer: this.timer,
          move: player.fMove,
          type: AttackType.Fast,
          isTap: configOpponent.preCharge && player.turn === 1 ? true : timeline[this.timer].isTap,
          isDmgImmune: configOpponent.preCharge,
        });
      } else {
        config.fastDelay -= 1;
        timeline[this.timer].type = AttackType.Wait;
      }
    }
  }

  charging(isOpponent = false) {
    const config = isOpponent ? this.configOpponent : this.config;
    const configOpponent = isOpponent ? this.config : this.configOpponent;
    const timeline = isOpponent ? this.timelineOpponent : this.timeline;
    const timelineOpponent = isOpponent ? this.timeline : this.timelineOpponent;
    const player = isOpponent ? this.pokemonOpponent : this.pokemon;

    if (config.charged) {
      if (this.isDelay || config.chargedCount % 2 === 0) {
        timeline[this.timer].type = AttackType.New;
      } else {
        updateState(timeline, {
          timer: this.timer,
          move: this.chargeType === ChargeType.Primary ? player.cMove : player.cMoveSec,
          size: (timeline[this.timer - 2].size || 0) + DEFAULT_PLUS_SIZE,
          type: config.chargedCount === -1 ? AttackType.Charge : AttackType.Spin,
        });
      }
      if (timeline[this.timer - 2]) {
        timelineOpponent[this.timer - 2].size = timeline[this.timer - 2].size;
      }
    } else {
      if (!this.isDelay && player.block > 0 && configOpponent.chargedCount === -1) {
        timelineOpponent[this.timer].type = AttackType.Block;
      }
    }
  }

  updatePokemonStat(value: IBuff, isOpponent = false) {
    const playerOpponent = isOpponent ? this.pokemon : this.pokemonOpponent;
    playerOpponent.stats = StatsPokemonGO.create(
      value.type === TypeAction.Atk
        ? toNumber(playerOpponent.stats?.atk) + value.power
        : toNumber(playerOpponent.stats?.atk),
      value.type === TypeAction.Def
        ? toNumber(playerOpponent.stats?.def) + value.power
        : toNumber(playerOpponent.stats?.def),
      toNumber(playerOpponent.stats?.sta)
    );
  }

  turnChargeAttack(isOpponent = false) {
    const config = isOpponent ? this.configOpponent : this.config;
    const player = isOpponent ? this.pokemonOpponent : this.pokemon;
    const playerOpponent = isOpponent ? this.pokemon : this.pokemonOpponent;
    if (config.chargedCount >= 0) {
      config.chargedCount--;
    } else {
      if (playerOpponent.block === 0) {
        playerOpponent.hp -= calculateMoveDmgActual(
          this.dataStore,
          player,
          playerOpponent,
          this.chargeType === ChargeType.Primary ? player.cMove : player.cMoveSec
        );
      } else {
        playerOpponent.block -= 1;
      }
      const moveType = this.chargeType === ChargeType.Primary ? player.cMove : player.cMoveSec;
      const arrBufAtk: IBuff[] = [],
        arrBufTarget: IBuff[] = [];
      const randInt = toFloat(Math.random(), 3);
      if (isNotEmpty(moveType?.buffs) && randInt > 0 && randInt <= toNumber(moveType?.buffs[0].buffChance)) {
        moveType?.buffs.forEach((value) => {
          this.updatePokemonStat(value, value.target === BuffType.Target);
          if (value.target === BuffType.Target) {
            arrBufTarget.push(value);
          } else {
            arrBufAtk.push(value);
          }
          this.timeline[this.timer].buff = arrBufAtk;
          this.timelineOpponent[this.timer].buff = arrBufTarget;
        });
      }
      this.isDelay = true;
      this.delay = BATTLE_DELAY;
    }
  }

  turnPreCharge(isOpponent = false) {
    const config = isOpponent ? this.configOpponent : this.config;

    if (config.chargedCount === DEFAULT_AMOUNT) {
      config.charged = true;
    } else {
      config.chargedCount--;
    }
  }

  immuneChargeAttack(isOpponent = false) {
    const player = isOpponent ? this.pokemon : this.pokemonOpponent;
    const playerOpponent = isOpponent ? this.pokemonOpponent : this.pokemon;
    const timeline = isOpponent ? this.timelineOpponent : this.timeline;

    playerOpponent.hp -= calculateMoveDmgActual(this.dataStore, player, playerOpponent, player.fMove);
    if (playerOpponent.hp > 0) {
      const lastTapPos = timeline.map((tl) => tl.isTap && !isUndefined(tl.type)).lastIndexOf(true);
      const lastFastAtkPos = timeline.map((tl) => tl.type).lastIndexOf(AttackType.Fast);
      timeline[lastFastAtkPos > lastTapPos ? this.timer : lastTapPos].isDmgImmune = true;
    }
  }

  clearCharge(isOpponent = false) {
    const config = isOpponent ? this.configOpponent : this.config;
    if (config.charged) {
      config.charged = false;
      config.preCharge = false;
      config.postRandomPlayer = false;
    }
    config.tap = false;
  }

  result(isOpponent = false) {
    const timeline = isOpponent ? this.timelineOpponent : this.timeline;
    const timelineOpponent = isOpponent ? this.timeline : this.timelineOpponent;
    const pokemon = isOpponent ? this.pokemonOpponent : this.pokemon;
    const pokemonOpponent = isOpponent ? this.pokemon : this.pokemonOpponent;

    addState(timeline, this.timer, pokemon.block, pokemon.energy, pokemon.hp, AttackType.Dead);
    if (pokemonOpponent.hp <= 0) {
      addState(
        timelineOpponent,
        this.timer,
        pokemonOpponent.block,
        pokemonOpponent.energy,
        pokemonOpponent.hp,
        AttackType.Dead
      );
    } else {
      if (timeline.length === timelineOpponent.length) {
        timelineOpponent[timelineOpponent.length - 1] = state(
          this.timer,
          pokemonOpponent.block,
          pokemonOpponent.energy,
          pokemonOpponent.hp,
          AttackType.Win
        );
      } else {
        addState(
          timelineOpponent,
          this.timer,
          pokemonOpponent.block,
          pokemonOpponent.energy,
          pokemonOpponent.hp,
          AttackType.Win
        );
      }
    }
  }
}
