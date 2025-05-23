import React, { Fragment, useEffect, useState } from 'react';
import SelectMove from '../../../components/Input/SelectMove';
import Raid from '../../../components/Raid/Raid';
import Find from '../../../components/Find/Find';

import {
  addSelectMovesByType,
  checkPokemonGO,
  generateParamForm,
  getAllMoves,
  getKeyWithData,
  getMoveType,
  getValidPokemonImgPath,
  isInvalidIV,
  isSpecialMegaFormType,
  retrieveMoves,
  splitAndCapitalize,
} from '../../../util/utils';
import { findAssetForm } from '../../../util/compute';
import { DEFAULT_POKEMON_LEVEL, levelList, MAX_IV, MIN_IV, MIN_LEVEL, RAID_BOSS_TIER } from '../../../util/constants';
import {
  calculateBattleDPS,
  calculateBattleDPSDefender,
  calculateStatsBattle,
  calculateStatsByTag,
  TimeToKill,
} from '../../../util/calculate';

import { Badge, Checkbox, FormControlLabel, Switch } from '@mui/material';

import './RaidBattle.scss';
import APIService from '../../../services/API.service';
import TypeInfo from '../../../components/Sprites/Type/Type';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';

import PokemonRaid from '../../../components/Raid/PokemonRaid';

import AddIcon from '@mui/icons-material/Add';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import EditIcon from '@mui/icons-material/Edit';
import TimerIcon from '@mui/icons-material/Timer';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

import { useSnackbar } from 'notistack';
import { Modal, Button, Form, OverlayTrigger } from 'react-bootstrap';

import update from 'immutability-helper';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState, SearchingState } from '../../../store/models/state.model';
import {
  IPokemonData,
  IPokemonMoveData,
  IPokemonRaidModel,
  PokemonDataStats,
  PokemonDPSBattle,
  PokemonMoveData,
  PokemonRaidModel,
} from '../../../core/models/pokemon.model';
import {
  ISelectMoveModel,
  SelectMoveModel,
  SelectMovePokemonModel,
} from '../../../components/Input/models/select-move.model';
import { MoveType, PokemonType, TypeMove, VariantType } from '../../../enums/type.enum';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { BattleCalculate } from '../../../util/models/calculate.model';
import { SpinnerActions } from '../../../store/actions';
import {
  combineClasses,
  DynamicObj,
  getPropertyName,
  getValueOrDefault,
  isEqual,
  isNotEmpty,
  toFloat,
  toFloatWithPadding,
  toNumber,
} from '../../../util/extension';
import {
  BattleResult,
  MovePokemon,
  IRaidResult,
  ITrainerBattle,
  RaidResult,
  RaidSetting,
  RaidSummary,
  TrainerBattle,
} from './models/raid-battle.model';
import { RaidState, SortType } from './enums/raid-state.enum';
import { SortDirectionType } from '../../Sheets/DpsTdo/enums/column-select-type.enum';
import { ICombat } from '../../../core/models/combat.model';
import PopoverConfig from '../../../components/Popover/PopoverConfig';
import { LinkToTop } from '../../../util/hooks/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { IStatsIV, StatsIV } from '../../../core/models/stats.model';

interface IOption {
  isWeatherBoss: boolean;
  isWeatherCounter: boolean;
  isReleased: boolean;
  enableTimeAllow: boolean;
}

class Option implements IOption {
  isWeatherBoss = false;
  isWeatherCounter = false;
  isReleased = false;
  enableTimeAllow = false;

  constructor({ ...props }: IOption) {
    Object.assign(this, props);
  }
}

interface IFilterGroup {
  level: number;
  pokemonType: PokemonType;
  iv: IStatsIV;
  onlyShadow: boolean;
  onlyMega: boolean;
  onlyReleasedGO: boolean;
  sortBy: SortType;
  sorted: SortDirectionType;
}

class FilterGroup implements IFilterGroup {
  level = MIN_LEVEL;
  pokemonType = PokemonType.Normal;
  iv = new StatsIV();
  onlyShadow = false;
  onlyMega = false;
  onlyReleasedGO = false;
  sortBy = SortType.DPS;
  sorted = SortDirectionType.ASC;

  static create(value: IFilterGroup) {
    const obj = new FilterGroup();
    Object.assign(obj, value);
    return obj;
  }
}

interface IFilter {
  used: IFilterGroup;
  selected: IFilterGroup;
}

class Filter implements IFilter {
  used = new FilterGroup();
  selected = new FilterGroup();

  constructor({ ...props }: IFilter) {
    Object.assign(this, props);
  }
}

const RaidBattle = () => {
  useChangeTitle('Raid Battle - Tools');
  const dispatch = useDispatch();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const pokemon = useSelector((state: SearchingState) => state.searching.toolSearching?.current);

  const [statBossATK, setStatBossATK] = useState(0);
  const [statBossDEF, setStatBossDEF] = useState(0);
  const [statBossHP, setStatBossHP] = useState(0);

  const [tier, setTier] = useState(1);

  const [fMove, setFMove] = useState<ISelectMoveModel>();
  const [cMove, setCMove] = useState<ISelectMoveModel>();

  const [resultFMove, setResultFMove] = useState<ISelectMoveModel[]>();
  const [resultCMove, setResultCMove] = useState<ISelectMoveModel[]>();

  const [options, setOptions] = useState(
    new Option({
      isWeatherBoss: false,
      isWeatherCounter: false,
      isReleased: true,
      enableTimeAllow: true,
    })
  );

  const initFilter = FilterGroup.create({
    level: DEFAULT_POKEMON_LEVEL,
    pokemonType: PokemonType.Normal,
    iv: StatsIV.setValue(MAX_IV, MAX_IV, MAX_IV),
    onlyShadow: false,
    onlyMega: false,
    onlyReleasedGO: true,
    sortBy: SortType.DPS,
    sorted: SortDirectionType.ASC,
  });

  const [filters, setFilters] = useState(
    new Filter({
      used: initFilter,
      selected: initFilter,
    })
  );

  const initPokemonStats = new PokemonDataStats({
    level: filters.selected.level,
    pokemonType: PokemonType.Normal,
    iv: StatsIV.setValue(filters.selected.iv.atkIV, filters.selected.iv.defIV, filters.selected.iv.staIV),
  });

  const { used, selected } = filters;

  const { isWeatherBoss, isReleased, enableTimeAllow } = options;

  const [timeAllow, setTimeAllow] = useState(0);

  const [resultBoss, setResultBoss] = useState<BattleResult>();
  const [resultRaid, setResultRaid] = useState<IRaidResult[]>();
  const [result, setResult] = useState<IPokemonMoveData[]>([]);

  const [show, setShow] = useState(false);
  const [showOption, setShowOption] = useState(false);
  const [showSettingPokemon, setShowSettingPokemon] = useState(new RaidSetting());
  const [showMovePokemon, setShowMovePokemon] = useState(new MovePokemon());

  const [hoverSlot, setHoverSlot] = useState<string>();

  const handleClose = () => {
    setTrainerBattle(update(trainerBattle, { [trainerBattleId]: { pokemons: { $set: tempPokemonBattle } } }));
    setShow(false);
  };

  const handleSave = () => {
    setTrainerBattle(update(trainerBattle, { [trainerBattleId]: { pokemons: { $set: pokemonBattle } } }));
    setShow(false);
  };

  const handleShow = (pokemons: IPokemonRaidModel[], id: number) => {
    setShow(true);
    setTrainerBattleId(id);
    setPokemonBattle(pokemons);
    setTempPokemonBattle([...pokemons]);
  };

  const handleShowOption = () => {
    setShowOption(true);
  };

  const handleShowMovePokemon = (pokemon: IPokemonMoveData | undefined) => {
    setHoverSlot(undefined);
    setShowMovePokemon(
      MovePokemon.create({
        isShow: true,
        id: toNumber(pokemon?.pokemon?.num),
        pokemon,
      })
    );
  };

  const setSortedResult = (primary: IPokemonMoveData, secondary: IPokemonMoveData) => {
    const type = getPropertyName(primary || secondary, (r) =>
      filters.selected.sortBy === SortType.TDO
        ? r.tdoAtk
        : filters.selected.sortBy === SortType.TTK
        ? r.ttkAtk
        : filters.selected.sortBy === SortType.TANK
        ? r.ttkDef
        : r.dpsAtk
    );
    const a = primary as unknown as DynamicObj<SortType>;
    const b = secondary as unknown as DynamicObj<SortType>;
    return filters.selected.sorted ? a[type] - b[type] : b[type] - a[type];
  };

  const handleSaveOption = () => {
    if (isInvalidIV(selected.iv.atkIV) || isInvalidIV(selected.iv.defIV) || isInvalidIV(selected.iv.staIV)) {
      return;
    }
    const changeResult =
      selected.level !== used.level ||
      selected.iv.atkIV !== used.iv.atkIV ||
      selected.iv.defIV !== used.iv.defIV ||
      selected.iv.staIV !== used.iv.staIV;
    setFilters({
      ...filters,
      used: selected,
    });
    setShowOption(false);

    if (changeResult) {
      handleCalculate();
    }
    setResult(result.sort((a, b) => setSortedResult(a, b)));
  };

  const handleCloseOption = () => {
    setShowOption(false);
  };

  const handleCloseSettingPokemon = () => {
    setShowSettingPokemon(new RaidSetting());
  };

  const handleCloseMovePokemon = () => {
    setHoverSlot(undefined);
    setShowMovePokemon(new MovePokemon());
  };

  const handleSaveSettingPokemon = () => {
    const pokemon = showSettingPokemon.pokemon;
    if (
      isInvalidIV(pokemon?.stats?.iv.atkIV) ||
      isInvalidIV(pokemon?.stats?.iv.defIV) ||
      isInvalidIV(pokemon?.stats?.iv.staIV)
    ) {
      return;
    }
    setPokemonBattle(
      update(pokemonBattle, {
        [showSettingPokemon.id]: {
          dataTargetPokemon: {
            $set: pokemon,
          },
        },
      })
    );
    handleCloseSettingPokemon();
  };

  const initTrainer = TrainerBattle.create({
    pokemons: [new PokemonRaidModel()],
    trainerId: 1,
  });

  const [trainerBattle, setTrainerBattle] = useState([initTrainer]);

  const [trainerBattleId, setTrainerBattleId] = useState(0);
  const [pokemonBattle, setPokemonBattle] = useState<IPokemonRaidModel[]>([]);
  const [tempPokemonBattle, setTempPokemonBattle] = useState<IPokemonRaidModel[]>([]);
  const [countTrainer, setCountTrainer] = useState(1);
  const [isLoadedForms, setIsLoadedForms] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const clearDataBoss = () => {
    setResult([]);
    setResultRaid(undefined);
    setResultBoss(undefined);
  };

  const onCopyPokemon = (index: number) => {
    setPokemonBattle(update(pokemonBattle, { $push: [pokemonBattle[index]] }));
  };

  const onRemovePokemon = (index: number) => {
    setPokemonBattle(update(pokemonBattle, { $splice: [[index, 1]] }));
  };

  const onOptionsPokemon = (index: number, pokemon: IPokemonData) => {
    setShowSettingPokemon(
      RaidSetting.create({
        isShow: true,
        id: index,
        pokemon,
      })
    );
  };

  const findMove = (id: number, form: string, pokemonType = PokemonType.None) => {
    const result = retrieveMoves(data.pokemons, id, form, pokemonType);
    if (result) {
      const simpleFMove = addSelectMovesByType(result, TypeMove.Fast);
      setFMove(simpleFMove.at(0));
      setResultFMove(simpleFMove);
      const simpleCMove = addSelectMovesByType(result, TypeMove.Charge);
      setCMove(simpleCMove.at(0));
      setResultCMove(simpleCMove);
    } else {
      setFMove(undefined);
      setResultFMove(undefined);
      setCMove(undefined);
      setResultCMove(undefined);
    }
  };

  const addCPokeData = (
    dataList: IPokemonMoveData[],
    movePoke: string[] | undefined,
    value: IPokemonData | undefined,
    fMove: ICombat,
    fMoveType: MoveType,
    pokemonTarget: boolean,
    pokemonType = PokemonType.Normal
  ) =>
    movePoke?.forEach((vc) => {
      const cMoveCurrent = data.combats.find((item) => isEqual(item.name, vc));
      if (cMoveCurrent) {
        const cMoveType = getMoveType(value, vc);
        if (!isEqual(cMoveType, MoveType.Dynamax)) {
          const stats = calculateStatsByTag(value, value?.baseStats, value?.slug);
          const statsAttackerTemp = new BattleCalculate({
            atk: calculateStatsBattle(stats.atk, used.iv.atkIV, used.level),
            def: calculateStatsBattle(stats.def, used.iv.defIV, used.level),
            hp: calculateStatsBattle(stats.sta, used.iv.staIV, used.level),
            fMove,
            cMove: cMoveCurrent,
            types: value?.types,
            pokemonType,
          });
          let statsDefender = new BattleCalculate({
            atk: statBossATK,
            def: statBossDEF,
            hp: statBossHP,
            fMove: data.combats.find((item) => isEqual(item.name, fMove?.name)),
            cMove: data.combats.find((item) => isEqual(item.name, cMove?.name)),
            types: pokemon?.form?.form?.types,
            isStab: isWeatherBoss,
          });
          const statsAttacker = pokemonTarget ? statsDefender : statsAttackerTemp;
          if (pokemonTarget) {
            statsDefender = statsAttackerTemp;
          }

          if (!statsAttacker || !statsDefender) {
            enqueueSnackbar('Something went wrong!', { variant: VariantType.Error });
            return;
          }

          const dpsDef = calculateBattleDPSDefender(
            data.options,
            data.typeEff,
            data.weatherBoost,
            statsAttacker,
            statsDefender
          );
          const dpsAtk = calculateBattleDPS(
            data.options,
            data.typeEff,
            data.weatherBoost,
            statsAttacker,
            statsDefender,
            dpsDef
          );

          const ttkAtk = TimeToKill(Math.floor(toNumber(statsDefender.hp)), dpsAtk); // Time to Attacker kill Defender
          const ttkDef = TimeToKill(Math.floor(toNumber(statsAttacker.hp)), dpsDef); // Time to Defender kill Attacker

          const tdoAtk = dpsAtk * ttkDef;
          const tdoDef = dpsDef * ttkAtk;

          dataList.push({
            pokemon: value,
            fMove: statsAttacker.fMove,
            cMove: statsAttacker.cMove,
            dpsDef,
            dpsAtk,
            tdoAtk,
            tdoDef,
            multiDpsTdo: Math.pow(dpsAtk, 3) * tdoAtk,
            ttkAtk,
            ttkDef,
            attackHpRemain: Math.floor(toNumber(statsAttacker.hp)) - Math.min(timeAllow, ttkDef) * dpsDef,
            defendHpRemain: Math.floor(toNumber(statsDefender.hp)) - Math.min(timeAllow, ttkAtk) * dpsAtk,
            death: Math.floor(toNumber(statsDefender.hp) / tdoAtk),
            pokemonType,
            fMoveType,
            cMoveType,
          });
        }
      }
    });

  const addFPokeData = (
    dataList: IPokemonMoveData[],
    pokemon: IPokemonData,
    movePoke: string[],
    pokemonTarget: boolean
  ) =>
    movePoke.forEach((vf) => {
      const fMove = data.combats.find((item) => isEqual(item.name, vf));
      if (!fMove) {
        return;
      }
      const fMoveType = getMoveType(pokemon, vf);
      addCPokeData(dataList, pokemon.cinematicMoves, pokemon, fMove, fMoveType, pokemonTarget);
      if (!pokemon.form || pokemon.hasShadowForm) {
        if (isNotEmpty(pokemon.shadowMoves)) {
          addCPokeData(dataList, pokemon.cinematicMoves, pokemon, fMove, fMoveType, pokemonTarget, PokemonType.Shadow);
        }
        addCPokeData(dataList, pokemon.shadowMoves, pokemon, fMove, fMoveType, pokemonTarget, PokemonType.Shadow);
        addCPokeData(dataList, pokemon.purifiedMoves, pokemon, fMove, fMoveType, pokemonTarget, PokemonType.Purified);
      }
      if (!pokemon.form || (!isSpecialMegaFormType(pokemon.pokemonType) && isNotEmpty(pokemon.shadowMoves))) {
        addCPokeData(
          dataList,
          pokemon.eliteCinematicMoves,
          pokemon,
          fMove,
          fMoveType,
          pokemonTarget,
          PokemonType.Shadow
        );
      }
      addCPokeData(dataList, pokemon.eliteCinematicMoves, pokemon, fMove, fMoveType, pokemonTarget);
      addCPokeData(dataList, pokemon.specialMoves, pokemon, fMove, fMoveType, pokemonTarget);
      addCPokeData(dataList, pokemon.exclusiveMoves, pokemon, fMove, fMoveType, pokemonTarget);
    });

  const calculateTopBattle = (pokemonTarget: boolean) => {
    let dataList: IPokemonMoveData[] = [];
    data.pokemons.forEach((pokemon) => {
      if (pokemon.pokemonType !== PokemonType.GMax) {
        addFPokeData(dataList, pokemon, getAllMoves(pokemon, TypeMove.Fast), pokemonTarget);
      }
    });
    if (pokemonTarget) {
      const sortedDPS = dataList.sort((a, b) => a.dpsAtk - b.dpsAtk);
      const sortedTDO = dataList.sort((a, b) => a.tdoAtk - b.tdoAtk);
      const sortedHP = dataList.sort((a, b) => toNumber(a.attackHpRemain) - toNumber(b.attackHpRemain));
      const result = {
        minDPS: sortedDPS[dataList.length - 1].dpsAtk,
        maxDPS: toNumber(sortedDPS.at(0)?.dpsAtk),
        minTDO: toNumber(sortedTDO.at(0)?.tdoAtk),
        maxTDO: sortedTDO[dataList.length - 1].tdoAtk,
        minHP: toNumber(sortedHP.at(0)?.attackHpRemain),
        maxHP: toNumber(sortedHP[dataList.length - 1].attackHpRemain),
      };
      setResultBoss(result);
    } else {
      const group = dataList.reduce((result, obj) => {
        const name = getValueOrDefault(String, obj.pokemon?.name);
        (result[name] = getValueOrDefault(Array, result[name])).push(obj);
        return result;
      }, new Object() as DynamicObj<IPokemonMoveData[]>);
      dataList = Object.values(group)
        .map((pokemon) => pokemon.reduce((p, c) => (p.dpsAtk > c.dpsAtk ? p : c)))
        .sort((a, b) => b.dpsAtk - a.dpsAtk);
      setResult(dataList);
      dispatch(SpinnerActions.HideSpinner.create());
    }
  };

  const calculateBossBattle = () => {
    calculateTopBattle(true);
    calculateTopBattle(false);
  };

  const calculateDPSBattle = (pokemonRaid: IPokemonRaidModel, hpRemain: number, timer: number) => {
    const fMoveCurrent = data.combats.find((item) => isEqual(item.name, pokemonRaid.fMoveTargetPokemon?.name));
    const cMoveCurrent = data.combats.find((item) => isEqual(item.name, pokemonRaid.cMoveTargetPokemon?.name));

    if (fMoveCurrent && cMoveCurrent) {
      fMoveCurrent.moveType = pokemonRaid.fMoveTargetPokemon?.moveType;
      cMoveCurrent.moveType = pokemonRaid.cMoveTargetPokemon?.moveType;
      const stats = calculateStatsByTag(
        pokemonRaid.dataTargetPokemon,
        pokemonRaid.dataTargetPokemon?.baseStats,
        pokemonRaid.dataTargetPokemon?.slug
      );
      const statsGO = pokemonRaid.dataTargetPokemon?.stats ?? used;
      const statsAttacker = new BattleCalculate({
        atk: calculateStatsBattle(stats.atk, statsGO.iv.atkIV, statsGO.level),
        def: calculateStatsBattle(stats.def, statsGO.iv.defIV, statsGO.level),
        hp: calculateStatsBattle(stats?.sta, statsGO.iv.staIV, statsGO.level),
        fMove: fMoveCurrent,
        cMove: cMoveCurrent,
        types: pokemonRaid.dataTargetPokemon?.types,
        pokemonType: statsGO.pokemonType,
      });
      const statsDefender = new BattleCalculate({
        atk: statBossATK,
        def: statBossDEF,
        hp: Math.floor(hpRemain),
        fMove: data.combats.find((item) => isEqual(item.name, fMove?.name)),
        cMove: data.combats.find((item) => isEqual(item.name, cMove?.name)),
        types: pokemon?.form?.form?.types,
        isStab: isWeatherBoss,
      });

      const dpsDef = calculateBattleDPSDefender(
        data.options,
        data.typeEff,
        data.weatherBoost,
        statsAttacker,
        statsDefender
      );
      const dpsAtk = calculateBattleDPS(
        data.options,
        data.typeEff,
        data.weatherBoost,
        statsAttacker,
        statsDefender,
        dpsDef
      );

      const ttkAtk = enableTimeAllow
        ? Math.min(timeAllow - timer, TimeToKill(Math.floor(toNumber(statsDefender.hp)), dpsAtk))
        : TimeToKill(Math.floor(toNumber(statsDefender.hp)), dpsAtk);
      const ttkDef = enableTimeAllow
        ? Math.min(timeAllow - timer, TimeToKill(Math.floor(toNumber(statsAttacker.hp)), dpsDef))
        : TimeToKill(Math.floor(toNumber(statsAttacker.hp)), dpsDef);

      const timeKill = Math.min(ttkAtk, ttkDef);

      const tdoAtk = dpsAtk * (enableTimeAllow ? timeKill : ttkDef);
      const tdoDef = dpsDef * (enableTimeAllow ? timeKill : ttkAtk);

      return PokemonDPSBattle.create({
        pokemon: pokemonRaid.dataTargetPokemon,
        fMove: statsAttacker.fMove,
        cMove: statsAttacker.cMove,
        atk: statsAttacker.atk,
        def: statsAttacker.def,
        hp: statsAttacker.hp,
        dpsAtk,
        dpsDef,
        tdoAtk,
        tdoDef,
        ttkAtk,
        ttkDef,
        timer: timeKill,
        defHpRemain: Math.floor(toNumber(statsDefender.hp)) - tdoAtk,
      });
    }
  };

  const calculateTrainerBattle = (trainerBattle: ITrainerBattle[]) => {
    const trainer = trainerBattle.map((trainer) => trainer.pokemons);
    const trainerNoPokemon = trainer.filter((pokemon) => isNotEmpty(pokemon.filter((item) => !item.dataTargetPokemon)));
    if (isNotEmpty(trainerNoPokemon)) {
      enqueueSnackbar('Please select Pokémon to raid battle!', { variant: VariantType.Error });
      return;
    }
    enqueueSnackbar('Simulator battle raid successfully!', { variant: VariantType.Success });

    const turn: IPokemonRaidModel[][] = [];
    trainer.forEach((pokemons, trainerId) => {
      pokemons.forEach((_, index) => {
        turn[index] ??= [];
        turn[index].push(PokemonRaidModel.create({ ...trainer[trainerId][index], trainerId }));
      });
    });
    const result: IRaidResult[] = [];
    let timer = 0,
      bossHp = statBossHP;
    turn.forEach((group) => {
      const dataList = new RaidResult({
        pokemon: [],
        summary: RaidSummary.create({
          dpsAtk: 0,
          dpsDef: 0,
          tdoAtk: 0,
          tdoDef: 0,
          timer,
          bossHp: Math.max(0, bossHp),
        }),
      });
      group.forEach((pokemon) => {
        if (pokemon.dataTargetPokemon) {
          const stat = calculateDPSBattle(pokemon, dataList.summary.bossHp, timer);
          if (stat) {
            dataList.pokemon.push({ ...stat, trainerId: toNumber(pokemon.trainerId) });
          }

          if (enableTimeAllow) {
            dataList.summary.timer = Math.min(timeAllow, dataList.summary.timer);
          }
        }
      });

      dataList.summary.tdoAtk = Math.min(
        dataList.summary.bossHp,
        dataList.pokemon.reduce((prev, curr) => prev + curr.tdoAtk, 0)
      );
      dataList.summary.dpsAtk = dataList.pokemon.reduce((prev, curr) => prev + curr.dpsAtk, 0);
      dataList.summary.tdoDef = dataList.pokemon.reduce((prev, curr) => prev + curr.tdoDef, 0);
      dataList.summary.dpsDef = dataList.pokemon.reduce((prev, curr) => prev + curr.dpsDef, 0);

      const sumHp = dataList.pokemon.reduce((prev, curr) => prev + toNumber(curr.hp), 0);

      const ttkAtk = enableTimeAllow
        ? Math.min(timeAllow - timer, TimeToKill(Math.floor(dataList.summary.bossHp), dataList.summary.dpsAtk))
        : TimeToKill(Math.floor(dataList.summary.bossHp), dataList.summary.dpsAtk);
      const ttkDef = enableTimeAllow
        ? Math.min(timeAllow - timer, TimeToKill(Math.floor(sumHp), dataList.summary.dpsDef))
        : TimeToKill(Math.floor(sumHp), dataList.summary.dpsDef);
      const timeKill = Math.min(ttkAtk, ttkDef);

      bossHp -= dataList.summary.tdoAtk;
      timer += timeKill;
      dataList.summary.timer = timer;

      dataList.pokemon = dataList.pokemon.map((pokemon) => {
        const tdoAtk = (dataList.summary.tdoAtk / dataList.summary.dpsAtk) * pokemon.dpsAtk;
        const ttkDef = toNumber(timeKill, pokemon.ttkDef);
        return PokemonMoveData.create({
          ...pokemon,
          tdoAtk,
          atkHpRemain:
            dataList.summary.tdoAtk >= Math.floor(dataList.summary.bossHp)
              ? Math.max(0, Math.floor(toNumber(pokemon.hp)) - Math.min(ttkDef) * pokemon.dpsDef)
              : Math.max(0, Math.floor(toNumber(pokemon.hp)) - Math.max(ttkDef) * pokemon.dpsDef),
        });
      });
      result.push(dataList);
    });
    setResultRaid(result);
  };

  useEffect(() => {
    if (pokemon) {
      setIsLoadedForms(true);
    } else {
      setIsLoadedForms(false);
    }
  }, [pokemon]);

  useEffect(() => {
    if (pokemon?.form && isNotEmpty(data.pokemons)) {
      findMove(
        toNumber(pokemon?.form.defaultId, 1),
        getValueOrDefault(String, pokemon?.form.form?.name),
        pokemon?.form.form?.pokemonType
      );
    }
  }, [data.pokemons, pokemon?.form]);

  const handleCalculate = () => {
    dispatch(SpinnerActions.ShowSpinner.create());
    setTimeout(() => {
      calculateBossBattle();
    }, 500);
  };

  const calculateHpBar = (bossHp: number, tdo: number, sumDps: number) => {
    const dps = (sumDps * 100) / bossHp;
    const percent = (Math.floor(bossHp - tdo) * 100) / Math.floor(bossHp);
    return (
      <Fragment>
        <div className="progress position-relative">
          <div
            className="progress-bar bg-success"
            style={{ marginTop: 0, width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          <div
            className="progress-bar bg-danger"
            style={{ marginTop: 0, width: `${100 - percent}%` }}
            role="progressbar"
            aria-valuenow={100 - percent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          <div className="justify-content-start align-items-center d-flex position-absolute h-100 w-100">
            <div className="line-dps position-relative" style={{ width: `calc(${dps}% + 2px` }}>
              <span className="line-left">
                <b>|</b>
              </span>
              <hr className="w-100" />
              <span className="line-right">
                <b>|</b>
              </span>
              <div className="caption text-dps">DPS</div>
            </div>
          </div>
          <div className="box-text rank-text text-black justify-content-end d-flex w-100 position-absolute">
            <span>HP: {`${Math.floor(bossHp - tdo)} / ${Math.floor(bossHp)}`}</span>
          </div>
        </div>
      </Fragment>
    );
  };

  const resultBattle = (bossHp: number, timer: number) => {
    const status =
      enableTimeAllow && timer >= timeAllow ? RaidState.TimeOut : bossHp > 0 ? RaidState.Loss : RaidState.Win;
    const result = getKeyWithData(RaidState, status)
      ?.split(/(?=[A-Z])/)
      .join(' ')
      .toUpperCase();
    return (
      <td
        colSpan={3}
        className={combineClasses('text-center bg-summary', `bg-${status === RaidState.Win ? 'success' : 'danger'}`)}
      >
        <span className="text-white">{result}</span>
      </td>
    );
  };

  const modalFormFilters = () => (
    <form>
      <label className="form-label">Pokémon level</label>
      <div className="input-group mb-3">
        <span className="input-group-text">Level</span>
        <Form.Select
          value={filters.selected.level}
          className="form-control"
          onChange={(e) => setFilters({ ...filters, selected: { ...selected, level: toFloat(e.target.value) } })}
        >
          {levelList.map((value, index) => (
            <option key={index} value={value}>
              {value}
            </option>
          ))}
        </Form.Select>
      </div>
      <label className="form-label">Pokémon IV</label>
      <div className="input-group mb-3">
        <span className="input-group-text">ATK</span>
        <input
          value={filters.selected.iv.atkIV}
          type="number"
          min={MIN_IV}
          max={MAX_IV}
          required={true}
          className="form-control"
          placeholder="IV ATK"
          onInput={(e) =>
            setFilters({
              ...filters,
              selected: { ...selected, iv: { ...selected.iv, atkIV: toNumber(e.currentTarget.value) } },
            })
          }
        />
        <span className="input-group-text">DEF</span>
        <input
          value={filters.selected.iv.defIV}
          type="number"
          min={MIN_IV}
          max={MAX_IV}
          required={true}
          className="form-control"
          placeholder="IV DEF"
          onInput={(e) =>
            setFilters({
              ...filters,
              selected: { ...selected, iv: { ...selected.iv, defIV: toNumber(e.currentTarget.value) } },
            })
          }
        />
        <span className="input-group-text">STA</span>
        <input
          value={filters.selected.iv.staIV}
          type="number"
          min={MIN_IV}
          max={MAX_IV}
          required={true}
          className="form-control"
          placeholder="IV STA"
          onInput={(e) =>
            setFilters({
              ...filters,
              selected: { ...selected, iv: { ...selected.iv, staIV: toNumber(e.currentTarget.value) } },
            })
          }
        />
      </div>
      <div className="input-group mb-3 border-input">
        <span className="input-group-text">Search filter only by</span>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.selected.onlyShadow}
              onChange={(_, check) =>
                setFilters({
                  ...filters,
                  selected: { ...selected, onlyShadow: check, onlyMega: check ? false : selected.onlyMega },
                })
              }
            />
          }
          label={getKeyWithData(PokemonType, PokemonType.Shadow)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.selected.onlyMega}
              onChange={(_, check) =>
                setFilters({
                  ...filters,
                  selected: { ...selected, onlyMega: check, onlyShadow: check ? false : selected.onlyShadow },
                })
              }
            />
          }
          label={getKeyWithData(PokemonType, PokemonType.Mega)}
        />
      </div>
      <div className="input-group mb-3">
        <FormControlLabel
          control={
            <Switch
              checked={filters.selected.onlyReleasedGO}
              onChange={(_, check) => setFilters({ ...filters, selected: { ...selected, onlyReleasedGO: check } })}
            />
          }
          label={
            <span className="d-flex align-items-center">
              Released in GO
              <img
                className={combineClasses('ms-1', filters.selected.onlyReleasedGO ? '' : 'filter-gray')}
                width={28}
                height={28}
                alt="Pokémon GO Icon"
                src={APIService.getPokemonGoIcon(icon)}
              />
            </span>
          }
        />
      </div>
      <label className="form-label">Sorting</label>
      <div className="input-group mb-3">
        <span className="input-group-text">Sort By</span>
        <Form.Select
          style={{ width: '40%' }}
          value={filters.selected.sortBy}
          className="form-control"
          onChange={(e) => setFilters({ ...filters, selected: { ...selected, sortBy: toNumber(e.target.value) } })}
        >
          <option value={SortType.DPS}>Damage Per Second</option>
          <option value={SortType.TDO}>Total Damage Output</option>
          <option value={SortType.TTK}>Time To Kill</option>
          <option value={SortType.TANK}>Tankiness</option>
        </Form.Select>
        <span className="input-group-text">Priority</span>
        <Form.Select
          style={{ width: '15%' }}
          value={filters.selected.sorted}
          className="form-control"
          onChange={(e) => setFilters({ ...filters, selected: { ...selected, sorted: toNumber(e.target.value) } })}
        >
          <option value={SortDirectionType.ASC}>Best</option>
          <option value={SortDirectionType.DESC}>Worst</option>
        </Form.Select>
      </div>
    </form>
  );

  const modalFormSetting = () => {
    const pokemon = showSettingPokemon.pokemon;
    if (!pokemon) {
      return <></>;
    }
    return (
      <Fragment>
        <div className="w-100 d-flex flex-column align-items-center">
          <div className="position-relative" style={{ width: 96 }}>
            <PokemonIconType pokemonType={showSettingPokemon.pokemon?.stats?.pokemonType} size={36}>
              <img
                alt="Pokémon Image"
                className="pokemon-sprite-large"
                src={APIService.getPokeIconSprite(pokemon.sprite)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = APIService.getPokeIconSprite();
                }}
              />
            </PokemonIconType>
          </div>
          <div>
            <b>{splitAndCapitalize(pokemon.name, '-', ' ')}</b>
          </div>
        </div>
        <form className="element-top">
          <FormControlLabel
            control={
              <Checkbox
                checked={showSettingPokemon.pokemon?.stats?.pokemonType === PokemonType.Shadow}
                disabled={
                  isSpecialMegaFormType(showSettingPokemon.pokemon?.pokemonType) ||
                  showSettingPokemon.pokemon?.pokemonType === PokemonType.GMax
                }
                onChange={(_, check) => {
                  if (showSettingPokemon.pokemon?.stats) {
                    setShowSettingPokemon(
                      RaidSetting.create({
                        ...showSettingPokemon,
                        pokemon: {
                          ...showSettingPokemon.pokemon,
                          stats: {
                            ...showSettingPokemon.pokemon.stats,
                            pokemonType: check ? PokemonType.Shadow : PokemonType.Normal,
                          },
                        },
                      })
                    );
                  }
                }}
              />
            }
            label={
              <span className="d-flex align-items-center">
                <img
                  className={showSettingPokemon.pokemon?.stats?.pokemonType === PokemonType.Shadow ? '' : 'filter-gray'}
                  width={28}
                  height={28}
                  alt="Pokémon GO Icon"
                  src={APIService.getPokeShadow()}
                />
                <span
                  style={{
                    color:
                      showSettingPokemon.pokemon?.stats?.pokemonType === PokemonType.Shadow ? 'black' : 'lightgray',
                  }}
                >
                  {getKeyWithData(PokemonType, PokemonType.Shadow)}
                </span>
              </span>
            }
          />
          <div>
            <label className="form-label">Pokémon level</label>
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text">Level</span>
            <Form.Select
              value={pokemon.stats?.level}
              className="form-control"
              onChange={(e) => {
                if (showSettingPokemon.pokemon?.stats) {
                  setShowSettingPokemon(
                    RaidSetting.create({
                      ...showSettingPokemon,
                      pokemon: {
                        ...showSettingPokemon.pokemon,
                        stats: { ...showSettingPokemon.pokemon.stats, level: toFloat(e.target.value) },
                      },
                    })
                  );
                }
              }}
            >
              {levelList.map((value, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </div>
          <label className="form-label">Pokémon IV</label>
          <div className="input-group mb-3">
            <span className="input-group-text">ATK</span>
            <input
              value={pokemon.stats?.iv.atkIV}
              type="number"
              min={MIN_IV}
              max={MAX_IV}
              required={true}
              className="form-control"
              placeholder="IV ATK"
              onInput={(e) => {
                if (showSettingPokemon.pokemon?.stats) {
                  setShowSettingPokemon(
                    RaidSetting.create({
                      ...showSettingPokemon,
                      pokemon: {
                        ...showSettingPokemon.pokemon,
                        stats: {
                          ...showSettingPokemon.pokemon.stats,
                          iv: { ...showSettingPokemon.pokemon.stats.iv, atkIV: toNumber(e.currentTarget.value) },
                        },
                      },
                    })
                  );
                }
              }}
            />
            <span className="input-group-text">DEF</span>
            <input
              value={pokemon.stats?.iv.defIV}
              type="number"
              min={MIN_IV}
              max={MAX_IV}
              required={true}
              className="form-control"
              placeholder="IV DEF"
              onInput={(e) => {
                if (showSettingPokemon.pokemon?.stats) {
                  setShowSettingPokemon(
                    RaidSetting.create({
                      ...showSettingPokemon,
                      pokemon: {
                        ...showSettingPokemon.pokemon,
                        stats: {
                          ...showSettingPokemon.pokemon.stats,
                          iv: { ...showSettingPokemon.pokemon.stats.iv, defIV: toNumber(e.currentTarget.value) },
                        },
                      },
                    })
                  );
                }
              }}
            />
            <span className="input-group-text">STA</span>
            <input
              value={pokemon.stats?.iv.staIV}
              type="number"
              min={MIN_IV}
              max={MAX_IV}
              required={true}
              className="form-control"
              placeholder="IV STA"
              onInput={(e) => {
                if (showSettingPokemon.pokemon?.stats) {
                  setShowSettingPokemon(
                    RaidSetting.create({
                      ...showSettingPokemon,
                      pokemon: {
                        ...showSettingPokemon.pokemon,
                        stats: {
                          ...showSettingPokemon.pokemon.stats,
                          iv: { ...showSettingPokemon.pokemon.stats.iv, staIV: toNumber(e.currentTarget.value) },
                        },
                      },
                    })
                  );
                }
              }}
            />
          </div>
        </form>
      </Fragment>
    );
  };

  const renderMove = (value: Partial<ICombat> | undefined) => (
    <span
      className={combineClasses(
        value?.type?.toLowerCase(),
        'position-relative type-select-bg d-flex align-items-center filter-shadow'
      )}
    >
      {value && value.moveType !== MoveType.None && (
        <span className="move-badge">
          <span
            className={combineClasses(
              'type-icon-small ic',
              `${getKeyWithData(MoveType, value.moveType)?.toLowerCase()}-ic`
            )}
          >
            {getKeyWithData(MoveType, value.moveType)}
          </span>
        </span>
      )}
      <div style={{ display: 'contents', width: 16 }}>
        <img
          className="pokemon-sprite-small sprite-type-select filter-shadow"
          alt="Pokémon GO Type Logo"
          src={APIService.getTypeHqSprite(value?.type)}
        />
      </div>
      <span className="filter-shadow">{splitAndCapitalize(value?.name, '_', ' ')}</span>
    </span>
  );

  const onHoverSlot = (id: string) => {
    setHoverSlot(id);
  };

  const onLeaveSlot = () => {
    setHoverSlot(undefined);
  };

  const onMovePokemon = (pokemonBattle: PokemonRaidModel) => {
    if (showMovePokemon.pokemon?.pokemon) {
      const stats = pokemonBattle.dataTargetPokemon?.stats ?? initPokemonStats;
      pokemonBattle.dataTargetPokemon = showMovePokemon.pokemon.pokemon;
      pokemonBattle.dataTargetPokemon.stats = new PokemonDataStats({
        ...stats,
        pokemonType: showMovePokemon.pokemon.pokemonType ?? PokemonType.None,
      });
      pokemonBattle.fMoveTargetPokemon = new SelectMoveModel(
        showMovePokemon.pokemon.fMove?.name,
        showMovePokemon.pokemon.fMoveType
      );
      pokemonBattle.cMoveTargetPokemon = new SelectMoveModel(
        showMovePokemon.pokemon.cMove?.name,
        showMovePokemon.pokemon.cMoveType
      );
    }
  };

  const modalMovePokemon = () => {
    const pokemon = showMovePokemon.pokemon;
    if (!pokemon) {
      return <></>;
    }
    return (
      <Fragment>
        <div className="d-flex flex-wrap align-items-center" style={{ columnGap: 5, paddingLeft: 10 }}>
          <div className="pokemon-battle">
            <span className="position-relative">
              <PokemonIconType pokemonType={pokemon.pokemonType} size={18}>
                <img
                  className="pokemon-sprite-battle"
                  alt="Pokémon Image"
                  src={APIService.getPokeIconSprite(pokemon.pokemon?.sprite, false)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = APIService.getPokeIconSprite();
                  }}
                />
              </PokemonIconType>
            </span>
          </div>
          <div className="d-flex flex-wrap align-items-center" style={{ columnGap: 8 }}>
            {renderMove({ ...pokemon.fMove, moveType: pokemon.fMoveType })}
            {renderMove({ ...pokemon.cMove, moveType: pokemon.cMoveType })}
          </div>
        </div>
        <p className="element-top">Select slot Pokémon that you want to replace.</p>
        <div className="element-top justify-content-center" style={{ padding: '0 10px' }}>
          {trainerBattle.map((trainer) => (
            <div className="trainer-battle d-flex align-items-center position-relative" key={trainer.trainerId}>
              <Badge
                color="primary"
                overlap="circular"
                badgeContent={`Trainer ${trainer.trainerId}`}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <img
                  width={80}
                  height={80}
                  alt="Image Trainer"
                  src={APIService.getTrainerModel(trainer.trainerId % 294)}
                />
              </Badge>
              <div className="pokemon-battle-group">
                {trainer.pokemons.map((poke, index) => (
                  <div
                    onMouseOver={() => onHoverSlot(`${trainer.trainerId}-${index}`)}
                    onMouseLeave={onLeaveSlot}
                    onTouchEnd={onLeaveSlot}
                    key={index}
                    className={combineClasses(
                      'pokemon-battle',
                      hoverSlot === `${trainer.trainerId}-${index}` ? 'slot-active' : ''
                    )}
                    onClick={() => onMovePokemon(poke)}
                  >
                    {poke.dataTargetPokemon ? (
                      <span className="position-relative">
                        <PokemonIconType
                          pokemonType={
                            hoverSlot === `${trainer.trainerId}-${index}`
                              ? pokemon.pokemonType
                              : poke.dataTargetPokemon.stats?.pokemonType
                          }
                          size={18}
                        >
                          <img
                            className="pokemon-sprite-battle"
                            alt="Pokémon Image"
                            src={APIService.getPokeIconSprite(
                              hoverSlot === `${trainer.trainerId}-${index}`
                                ? pokemon.pokemon?.sprite
                                : poke.dataTargetPokemon.sprite,
                              true
                            )}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = APIService.getPokeIconSprite();
                            }}
                          />
                        </PokemonIconType>
                      </span>
                    ) : (
                      <span>
                        <AddIcon fontSize="large" sx={{ color: 'lightgray' }} />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Fragment>
    );
  };

  const modalDetailsPokemon = (pokemon: IPokemonMoveData | undefined) => {
    if (!pokemon?.pokemon) {
      return <></>;
    }
    return (
      <div className="d-flex flex-wrap align-items-center" style={{ gap: 8 }}>
        {renderMove(pokemon.fMove)}
        {renderMove(pokemon.cMove)}
      </div>
    );
  };

  const renderPokemon = (value: IPokemonMoveData) => {
    const assets = findAssetForm(data.assets, value.pokemon?.num, value.pokemon?.form);
    return (
      <LinkToTop
        to={`/pokemon/${value.pokemon?.num}${generateParamForm(value.pokemon?.form, value.pokemonType)}`}
        className="sprite-raid position-relative"
      >
        <PokemonIconType pokemonType={value.pokemonType} size={64}>
          <img
            className="pokemon-sprite-raid"
            alt="Pokémon Image"
            src={APIService.getPokemonModel(assets, value.pokemon?.num)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, value.pokemon?.num, assets);
            }}
          />
        </PokemonIconType>
      </LinkToTop>
    );
  };

  return (
    <Fragment>
      <div className="row" style={{ margin: 0, overflowX: 'hidden' }}>
        <div className="col-lg" style={{ padding: 0 }}>
          <Find isHide={true} title="Raid Boss" clearStats={clearDataBoss} />
        </div>
        <div className="col-lg d-flex justify-content-center align-items-center" style={{ padding: 0 }}>
          <div className="element-top position-relative">
            {!isNotEmpty(resultFMove) && !isNotEmpty(resultCMove) && (
              <div className="position-absolute w-100 h-100" style={{ zIndex: 2 }}>
                <div className="moveset-error" />
                <span className="moveset-error-msg">Moveset not Available</span>
              </div>
            )}
            <h3 className="text-center text-decoration-underline">Select Boss Moveset</h3>
            <div className="row element-top">
              <div className="col d-flex justify-content-center">
                <div>
                  <h6 className="text-center">
                    <b>Fast Moves</b>
                  </h6>
                  <SelectMove
                    pokemon={
                      new SelectMovePokemonModel(
                        pokemon?.form?.defaultId,
                        pokemon?.form?.form?.formName,
                        pokemon?.form?.form?.pokemonType
                      )
                    }
                    clearData={clearDataBoss}
                    move={fMove}
                    setMovePokemon={setFMove}
                    moveType={TypeMove.Fast}
                  />
                </div>
              </div>
              <div className="col d-flex justify-content-center">
                <div>
                  <h6 className="text-center">
                    <b>Charged Moves</b>
                  </h6>
                  <SelectMove
                    pokemon={
                      new SelectMovePokemonModel(
                        pokemon?.form?.defaultId,
                        pokemon?.form?.form?.formName,
                        pokemon?.form?.form?.pokemonType
                      )
                    }
                    clearData={clearDataBoss}
                    move={cMove}
                    setMovePokemon={setCMove}
                    moveType={TypeMove.Charge}
                  />
                </div>
              </div>
            </div>
            <hr />
            <Raid
              clearData={clearDataBoss}
              setTierBoss={setTier}
              setTimeAllow={setTimeAllow}
              currForm={pokemon?.form}
              id={pokemon?.form?.defaultId}
              statATK={pokemon?.pokemon?.statsGO?.atk}
              statDEF={pokemon?.pokemon?.statsGO?.def}
              setStatBossATK={setStatBossATK}
              setStatBossDEF={setStatBossDEF}
              setStatBossHP={setStatBossHP}
              isLoadedForms={isLoadedForms}
            />
            <hr />
            <div className="row align-items-center element-top" style={{ margin: 0 }}>
              <div className="col-6 d-flex justify-content-end">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isWeatherBoss}
                      onChange={(_, check) => setOptions({ ...options, isWeatherBoss: check })}
                    />
                  }
                  label="Boss Weather Boost"
                />
              </div>
              <div className="col-6">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isReleased}
                      onChange={(_, check) => setOptions({ ...options, isReleased: check })}
                    />
                  }
                  label="Only Release in Pokémon GO"
                />
              </div>
            </div>
            <div className="row align-items-center element-top" style={{ margin: 0 }}>
              <div className="col-6 d-flex justify-content-end" style={{ paddingRight: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableTimeAllow}
                      onChange={(_, check) => setOptions({ ...options, enableTimeAllow: check })}
                    />
                  }
                  label={`Time Allow (Default: ${RAID_BOSS_TIER[tier].timer}sec)`}
                />
              </div>
              <div className="col-6" style={{ paddingLeft: 0 }}>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    value={timeAllow}
                    placeholder="Battle Time"
                    aria-label="Battle Time"
                    min={0}
                    disabled={!enableTimeAllow}
                    onInput={(e) => setTimeAllow(toNumber(e.currentTarget.value))}
                  />
                  <span className="input-group-text">sec</span>
                </div>
              </div>
            </div>
            {resultFMove && resultCMove && (
              <div className="text-center element-top">
                <button
                  className="btn btn-primary w-50"
                  disabled={Boolean(resultBoss)}
                  onClick={() => handleCalculate()}
                >
                  Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <hr />
      <div className="container" style={{ paddingBottom: 15 }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between">
          <div>
            <h4>
              {`${used.sorted ? 'Worst' : 'Best'} 10 Counters Level: `}
              {<span>{`${used.level} - ${used.iv.atkIV}/${used.iv.defIV}/${used.iv.staIV}`}</span>}
            </h4>
            <p className="text-primary">
              <b>
                {`Sort By: ${
                  used.sortBy === SortType.DPS
                    ? 'Damage Per Seconds (DPS)'
                    : used.sortBy === SortType.TDO
                    ? 'Total Damage Output (TDO)'
                    : used.sortBy === SortType.TTK
                    ? 'Time To Kill'
                    : 'Tankiness'
                } `}
                <span className="text-danger">{`${used.onlyShadow ? '*Only Shadow' : ''}${
                  used.onlyMega ? '*Only Mega' : ''
                }`}</span>
              </b>
            </p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleShowOption}>
              Search options
            </button>
          </div>
        </div>
        {isNotEmpty(result) && (
          <div className="top-raid-group">
            {result
              .filter((obj) => {
                if (!used.onlyReleasedGO) {
                  return true;
                }
                if (obj.pokemon) {
                  const isReleasedGO = checkPokemonGO(
                    obj.pokemon.num,
                    getValueOrDefault(String, obj.pokemon.fullName, obj.pokemon.pokemonId),
                    data.pokemons
                  );
                  return getValueOrDefault(Boolean, obj.pokemon.releasedGO, isReleasedGO);
                }
                return false;
              })
              .filter((obj) => {
                if (!used.onlyMega) {
                  return true;
                }
                return obj.pokemon?.pokemonType === PokemonType.Mega;
              })
              .filter((obj) => {
                if (!used.onlyShadow) {
                  return true;
                }
                return obj.pokemonType === PokemonType.Shadow;
              })
              .slice(0, 10)
              .map((value, index) => (
                <div className="position-relative top-raid-pokemon" key={index}>
                  <div>
                    <AddCircleIcon
                      className="position-absolute cursor-pointer link-success"
                      fontSize="large"
                      onClick={() => handleShowMovePokemon(value)}
                    />
                  </div>
                  <div className="d-flex justify-content-center w-100">{renderPokemon(value)}</div>
                  <span className="d-flex justify-content-center w-100">
                    <b>
                      #{value.pokemon?.num} {splitAndCapitalize(value.pokemon?.name, '-', ' ')}
                    </b>
                  </span>
                  <span className="d-block element-top">
                    DPS: <b>{toFloatWithPadding(value.dpsAtk, 2)}</b>
                  </span>
                  <span className="d-block">
                    Total Damage Output: <b>{toFloatWithPadding(value.tdoAtk, 2)}</b>
                  </span>
                  <span className="d-block">
                    Death: <b className={value.death === 0 ? 'text-success' : 'text-danger'}>{value.death}</b>
                  </span>
                  <span className="d-block">
                    Time to Kill <span className="d-inline-block caption">(Boss)</span>:{' '}
                    <b>{toFloatWithPadding(value.ttkAtk, 2)} sec</b>
                  </span>
                  <span className="d-block">
                    Time is Killed: <b>{toFloatWithPadding(value.ttkDef, 2)} sec</b>
                  </span>
                  <hr />
                  <div className="container" style={{ marginBottom: 15 }}>
                    <TypeBadge title="Fast Move" move={value.fMove} moveType={value.fMoveType ?? MoveType.None} />
                    <TypeBadge title="Charged Move" move={value.cMove} moveType={value.cMoveType ?? MoveType.None} />
                  </div>
                </div>
              ))}
          </div>
        )}
        <div className="row my-3 mx-0">
          <div className="col-lg-5 justify-content-center" style={{ marginBottom: 20 }}>
            {trainerBattle.map((trainer, index) => (
              <div className="trainer-battle d-flex align-items-center position-relative" key={index}>
                <Badge
                  color="primary"
                  overlap="circular"
                  badgeContent={`Trainer ${index + 1}`}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <img
                    width={80}
                    height={80}
                    alt="Image Trainer"
                    src={APIService.getTrainerModel(trainer.trainerId % 294)}
                  />
                </Badge>
                <button
                  className="btn btn-primary"
                  style={{ marginRight: 10 }}
                  onClick={() => handleShow(trainer.pokemons, index)}
                >
                  <EditIcon fontSize="small" />
                </button>
                <div className="pokemon-battle-group">
                  {trainer.pokemons.map((pokemon, index) => (
                    <div key={index} className="pokemon-battle">
                      {pokemon.dataTargetPokemon ? (
                        <span className="position-relative">
                          <PokemonIconType pokemonType={pokemon.dataTargetPokemon.stats?.pokemonType} size={18}>
                            <img
                              className="pokemon-sprite-battle"
                              alt="Pokémon Image"
                              src={APIService.getPokeIconSprite(pokemon.dataTargetPokemon.sprite, false)}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = APIService.getPokeIconSprite();
                              }}
                            />
                          </PokemonIconType>
                        </span>
                      ) : (
                        <span>
                          <AddIcon fontSize="large" sx={{ color: 'lightgray' }} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <span className="d-flex ic-group">
                  <span
                    className={combineClasses(
                      'ic-copy text-white',
                      trainer.pokemons.at(0)?.dataTargetPokemon ? 'bg-primary' : 'click-none bg-secondary'
                    )}
                    title="Copy"
                    style={{ marginRight: 5 }}
                    onClick={() => {
                      if (trainer.pokemons.at(0)?.dataTargetPokemon) {
                        setCountTrainer(countTrainer + 1);
                        setTrainerBattle(
                          update(trainerBattle, {
                            $push: [{ ...trainerBattle[index], trainerId: countTrainer + 1 }],
                          })
                        );
                      }
                    }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                  </span>
                  <span
                    className={combineClasses(
                      'ic-remove text-white',
                      index > 0 ? 'bg-danger' : 'click-none bg-secondary'
                    )}
                    title="Remove"
                    onClick={() => {
                      if (index > 0) {
                        setTrainerBattle(update(trainerBattle, { $splice: [[index, 1]] }));
                      }
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </span>
                </span>
              </div>
            ))}
            <div className="text-center element-top">
              <button
                className="btn btn-primary"
                onClick={() => calculateTrainerBattle(trainerBattle)}
                disabled={!resultBoss}
              >
                Raid Battle
              </button>
            </div>
            <div className="d-flex flex-wrap justify-content-center align-items-center element-top">
              <RemoveCircleIcon
                className={combineClasses('cursor-pointer link-danger', trainerBattle.length > 1 ? '' : 'click-none')}
                fontSize="large"
                onClick={() => {
                  if (trainerBattle.length > 1) {
                    setTrainerBattle(update(trainerBattle, { $splice: [[trainerBattle.length - 1]] }));
                  }
                }}
              />
              <div className="count-pokemon">{trainerBattle.length}</div>
              <AddCircleIcon
                className="cursor-pointer link-success"
                fontSize="large"
                onClick={() => {
                  setCountTrainer(countTrainer + 1);
                  setTrainerBattle(
                    update(trainerBattle, {
                      $push: [{ ...initTrainer, trainerId: countTrainer + 1 }],
                    })
                  );
                }}
              />
            </div>
          </div>
          <div className="col-lg-7 stats-boss h-100">
            <div className="d-flex flex-wrap align-items-center" style={{ columnGap: 15 }}>
              <h3>
                <b>
                  {pokemon?.form ? `#${pokemon?.form?.defaultId}` : ''}{' '}
                  {pokemon?.form
                    ? splitAndCapitalize(pokemon?.form.form?.name, '-', ' ')
                    : splitAndCapitalize(pokemon?.pokemon?.fullName, '_', ' ')}{' '}
                  Tier {tier}
                </b>
              </h3>
              <TypeInfo arr={pokemon?.form?.form?.types} />
            </div>
            <div className="d-flex flex-wrap align-items-center" style={{ columnGap: 15 }}>
              <TypeBadge title="Fast Move" move={fMove} moveType={fMove?.moveType ?? MoveType.None} />
              <TypeBadge title="Charged Move" move={cMove} moveType={cMove?.moveType ?? MoveType.None} />
            </div>
            {resultBoss && (
              <Fragment>
                <hr />
                <div className="row" style={{ margin: 0 }}>
                  <div className="col-lg-6" style={{ marginBottom: 20 }}>
                    <span className="d-block element-top">
                      {`DPS: `}
                      <b>
                        {toFloatWithPadding(resultBoss.minDPS, 2)} - {toFloatWithPadding(resultBoss.maxDPS, 2)}
                      </b>
                    </span>
                    <span className="d-block">
                      Average DPS: <b>{toFloatWithPadding((resultBoss.minDPS + resultBoss.maxDPS) / 2, 2)}</b>
                    </span>
                    <span className="d-block">
                      {'Total Damage Output: '}
                      <b>
                        {toFloatWithPadding(resultBoss.minTDO, 2)} - {toFloatWithPadding(resultBoss.maxTDO, 2)}
                      </b>
                    </span>
                    <span className="d-block">
                      Average Total Damage Output:{' '}
                      <b>{toFloatWithPadding((resultBoss.minTDO + resultBoss.maxTDO) / 2, 2)}</b>
                    </span>
                    <span className="d-block">
                      {'Boss HP Remaining: '}
                      <b>
                        {Math.round(resultBoss.minHP)} - {Math.round(resultBoss.maxHP)}
                      </b>
                    </span>
                    <span className="d-block">
                      Boss Average HP Remaining: <b>{Math.round((resultBoss.minHP + resultBoss.maxHP) / 2)}</b>
                    </span>
                  </div>
                  <div
                    className="col-lg-6 d-flex flex-wrap justify-content-center align-items-center"
                    style={{ marginBottom: 20 }}
                  >
                    <h2 className="text-center" style={{ margin: 0 }}>
                      Suggested players
                    </h2>
                    <hr className="w-100" />
                    <div className="d-inline-block text-center">
                      <h3 className="d-block" style={{ margin: 0 }}>
                        {Math.ceil(statBossHP / (statBossHP - Math.round(resultBoss.minHP)))}
                      </h3>
                      {Math.ceil(statBossHP / (statBossHP - Math.round(resultBoss.minHP))) === 1 ? (
                        <span className="caption text-success">Easy</span>
                      ) : (
                        <span className="caption text-danger">Hard</span>
                      )}
                    </div>
                    <h3 className="mx-2 mb-3"> - </h3>
                    <div className="d-inline-block text-center">
                      <h3 className="d-block" style={{ margin: 0 }}>
                        {Math.ceil(statBossHP / (statBossHP - Math.round((resultBoss.minHP + resultBoss.maxHP) / 2)))}+
                      </h3>
                      <span className="caption text-success">Easy</span>
                    </div>
                  </div>
                </div>
              </Fragment>
            )}
            {isNotEmpty(resultRaid) && (
              <Fragment>
                <hr />
                <ul className="element-top" style={{ listStyleType: 'initial' }}>
                  {resultRaid?.map((result, turn) => (
                    <li style={{ marginBottom: 15 }} key={turn}>
                      <h4>
                        <b>Pokémon Round {turn + 1}</b>
                      </h4>
                      <div className="w-100" style={{ overflowX: 'auto' }}>
                        <table className="table-info table-round-battle">
                          <thead className="text-center">
                            <tr className="table-header">
                              <th>Trainer ID</th>
                              <th>Pokémon</th>
                              <th>DPS</th>
                              <th>TDO</th>
                              <th>TTD</th>
                              <th>HP</th>
                            </tr>
                          </thead>
                          <tbody className="text-center">
                            {result.pokemon.map((data, index) => (
                              <tr key={index}>
                                <td>#{toNumber(data.trainerId) + 1}</td>
                                <td>
                                  <OverlayTrigger
                                    placement="auto"
                                    overlay={<PopoverConfig>{modalDetailsPokemon(data)}</PopoverConfig>}
                                  >
                                    <span className="tooltips-info">
                                      <div className="d-flex align-items-center table-pokemon">
                                        <PokemonIconType pokemonType={data.pokemon?.stats?.pokemonType} size={18}>
                                          <img
                                            className="pokemon-sprite-battle"
                                            height={36}
                                            alt="Pokémon Image"
                                            src={APIService.getPokeIconSprite(data.pokemon?.sprite, false)}
                                            onError={(e) => {
                                              e.currentTarget.onerror = null;
                                              e.currentTarget.src = APIService.getPokeIconSprite();
                                            }}
                                          />
                                        </PokemonIconType>
                                        <span className="caption link-url">
                                          {splitAndCapitalize(data.pokemon?.name.replaceAll('_', '-'), '-', ' ')}
                                        </span>
                                      </div>
                                    </span>
                                  </OverlayTrigger>
                                </td>
                                <td>{toFloatWithPadding(data.dpsAtk, 2)}</td>
                                <td>{Math.floor(data.tdoAtk) === 0 ? '-' : toFloatWithPadding(data.tdoAtk, 2)}</td>
                                <td>
                                  {Math.floor(toNumber(data.atkHpRemain)) === 0
                                    ? toFloatWithPadding(data.ttkDef, 2)
                                    : '-'}
                                </td>
                                <td>
                                  <b>
                                    <span
                                      className={
                                        Math.floor(toNumber(data.atkHpRemain)) === 0 ? 'text-danger' : 'text-success'
                                      }
                                    >
                                      {Math.max(0, Math.floor(toNumber(data.atkHpRemain)))}
                                    </span>
                                    {' / '}
                                    {Math.floor(toNumber(data.hp))}
                                  </b>
                                </td>
                              </tr>
                            ))}
                            {((turn > 0 && Math.floor(result.summary.tdoAtk) > 0) ||
                              turn === 0 ||
                              (!enableTimeAllow && result.summary.timer <= timeAllow)) && (
                              <tr>
                                <td colSpan={6}>
                                  {calculateHpBar(result.summary.bossHp, result.summary.tdoAtk, result.summary.dpsAtk)}
                                </td>
                              </tr>
                            )}
                            <tr className="text-summary">
                              <td colSpan={2}>Total DPS: {toFloatWithPadding(result.summary.dpsAtk, 2)}</td>
                              <td className="text-center" colSpan={2}>
                                Total TDO: {toFloatWithPadding(result.summary.tdoAtk, 2)}
                              </td>
                              <td colSpan={2}>
                                Boss HP Remain: {Math.floor(result.summary.bossHp - result.summary.tdoAtk)}
                              </td>
                            </tr>
                            {((turn > 0 && Math.floor(result.summary.tdoAtk) > 0) ||
                              turn === 0 ||
                              (!enableTimeAllow && result.summary.timer <= timeAllow)) && (
                              <tr className="text-summary">
                                <td colSpan={3}>
                                  <TimerIcon /> Time To Battle Remain: {toFloatWithPadding(result.summary.timer, 2)}
                                  {enableTimeAllow && ` / ${timeAllow}`}
                                </td>
                                {resultBattle(
                                  Math.floor(result.summary.bossHp - result.summary.tdoAtk),
                                  result.summary.timer
                                )}
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </li>
                  ))}
                </ul>
              </Fragment>
            )}
          </div>
        </div>
      </div>
      <Modal show={show && !showSettingPokemon.isShow} onHide={handleClose} centered={true}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Trainer #{trainerBattleId + 1}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
            {pokemonBattle.map((pokemon, index) => (
              <div className={index === 0 ? '' : 'element-top'} key={index}>
                <PokemonRaid
                  isControls={true}
                  id={index}
                  pokemon={pokemon}
                  data={pokemonBattle}
                  setData={setPokemonBattle}
                  defaultSetting={initPokemonStats}
                  onCopyPokemon={onCopyPokemon}
                  onRemovePokemon={onRemovePokemon}
                  onOptionsPokemon={onOptionsPokemon}
                />
              </div>
            ))}
          </div>
          <div className="d-flex flex-wrap justify-content-center align-items-center element-top">
            <RemoveCircleIcon
              className={combineClasses('cursor-pointer link-danger', pokemonBattle.length > 1 ? '' : 'click-none')}
              fontSize="large"
              onClick={() => {
                if (pokemonBattle.length > 1) {
                  setPokemonBattle(update(pokemonBattle, { $splice: [[pokemonBattle.length - 1]] }));
                }
              }}
            />
            <div className="count-pokemon">{pokemonBattle.length}</div>
            <AddCircleIcon
              className="cursor-pointer link-success"
              fontSize="large"
              onClick={() => setPokemonBattle(update(pokemonBattle, { $push: [new PokemonRaidModel()] }))}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={VariantType.Secondary} onClick={handleClose}>
            Close
          </Button>
          <Button variant={VariantType.Primary} onClick={handleSave}>
            Save changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showOption} onHide={handleCloseOption} centered={true}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Search Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>{modalFormFilters()}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={VariantType.Secondary} onClick={handleCloseOption}>
            Close
          </Button>
          <Button variant={VariantType.Primary} onClick={handleSaveOption}>
            Save changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSettingPokemon.isShow} onHide={handleCloseSettingPokemon} centered={true}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Pokémon Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>{modalFormSetting()}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={VariantType.Secondary} onClick={handleCloseSettingPokemon}>
            Close
          </Button>
          <Button variant={VariantType.Primary} onClick={handleSaveSettingPokemon}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showMovePokemon.isShow} onHide={handleCloseMovePokemon} centered={true}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Move Pokémon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>{modalMovePokemon()}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={VariantType.Secondary} onClick={handleCloseMovePokemon}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default RaidBattle;
