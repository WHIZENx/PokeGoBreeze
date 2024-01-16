import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import SelectMove from '../../../components/Input/SelectMove';
import Raid from '../../../components/Raid/Raid';
import Find from '../../../components/Find/Find';
import { Link } from 'react-router-dom';

import { checkPokemonGO, convertFormName, convertName, splitAndCapitalize } from '../../../util/Utils';
import { findAssetForm } from '../../../util/Compute';
import {
  FORM_GMAX,
  FORM_MEGA,
  MAX_IV,
  MAX_LEVEL,
  MIN_IV,
  MIN_LEVEL,
  RAID_BOSS_TIER,
  SHADOW_ATK_BONUS,
  SHADOW_DEF_BONUS,
} from '../../../util/Constants';
import {
  calculateBattleDPS,
  calculateBattleDPSDefender,
  calculateStatsBattle,
  calculateStatsByTag,
  TimeToKill,
} from '../../../util/Calculate';

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
import { Modal, Button, Form } from 'react-bootstrap';

import update from 'immutability-helper';
import { useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../../store/actions/spinner.action';
import { StoreState, SearchingState } from '../../../store/models/state.model';
import { PokemonDataModel, PokemonModel, PokemonMoveData, PokemonRaidModel } from '../../../core/models/pokemon.model';
import { CombatPokemon } from '../../../core/models/combat.model';
import { SelectMoveModel } from '../../../components/Input/models/select-move.model';
import { TypeMove } from '../../../enums/move.enum';
import { PokemonFormModify } from '../../../core/models/API/form.model';

interface TrainerBattle {
  pokemons: PokemonRaidModel[];
  trainerId: number | undefined;
}

interface BattleResult {
  minDPS: number;
  maxDPS: number;
  minTDO: number;
  maxTDO: number;
  minHP: number;
  maxHP: number;
}

interface RaidResult {
  pokemon: PokemonMoveData[];
  summary: {
    dpsAtk: number;
    dpsDef: number;
    tdoAtk: number;
    tdoDef: number;
    timer: number;
    bossHp: number;
  };
}

interface RaidSetting {
  isShow?: boolean;
  id: number;
  pokemon?: PokemonDataModel | undefined;
}

const RaidBattle = () => {
  const dispatch = useDispatch();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);

  const [id, setId] = useState(searching ? searching.id : 1);
  const [name, setName] = useState('');
  const [form, setForm]: [PokemonFormModify | undefined, React.Dispatch<React.SetStateAction<PokemonFormModify | undefined>>] = useState();

  const initialize = useRef(false);

  const [statATK, setStatATK] = useState(0);
  const [statDEF, setStatDEF] = useState(0);

  const [statBossATK, setStatBossATK] = useState(0);
  const [statBossDEF, setStatBossDEF] = useState(0);
  const [statBossHP, setStatBossHP] = useState(0);

  const [tier, setTier] = useState(1);

  const [fMove, setFMove]: [SelectMoveModel | undefined, React.Dispatch<React.SetStateAction<SelectMoveModel | undefined>>] = useState();
  const [cMove, setCMove]: [SelectMoveModel | undefined, React.Dispatch<React.SetStateAction<SelectMoveModel | undefined>>] = useState();

  const [resultFMove, setResultFMove]: [
    SelectMoveModel[] | undefined,
    React.Dispatch<React.SetStateAction<SelectMoveModel[] | undefined>>
  ] = useState();
  const [resultCMove, setResultCMove]: [
    SelectMoveModel[] | undefined,
    React.Dispatch<React.SetStateAction<SelectMoveModel[] | undefined>>
  ] = useState();

  const [options, setOptions] = useState({
    weatherBoss: false,
    weatherCounter: false,
    released: true,
    enableTimeAllow: true,
  });

  const [filters, setFilters] = useState({
    used: {
      level: 40,
      isShadow: false,
      iv: {
        atk: MAX_IV,
        def: MAX_IV,
        sta: MAX_IV,
      },
      onlyShadow: false,
      onlyMega: false,
      onlyReleasedGO: true,
      sortBy: 0,
      sorted: 0,
    },
    selected: {
      level: 40,
      isShadow: false,
      iv: {
        atk: MAX_IV,
        def: MAX_IV,
        sta: MAX_IV,
      },
      onlyShadow: false,
      onlyMega: false,
      onlyReleasedGO: true,
      sortBy: 0,
      sorted: 0,
    },
  });

  const { used, selected } = filters;

  const { weatherBoss, weatherCounter, released, enableTimeAllow } = options;

  const [timeAllow, setTimeAllow] = useState(0);

  const [resultBoss, setResultBoss]: [BattleResult | undefined, React.Dispatch<React.SetStateAction<BattleResult | undefined>>] =
    useState();
  const [resultRaid, setResultRaid]: [RaidResult[] | undefined, React.Dispatch<React.SetStateAction<RaidResult[] | undefined>>] =
    useState();
  const [result, setResult]: [PokemonMoveData[], React.Dispatch<React.SetStateAction<PokemonMoveData[]>>] = useState(
    [] as PokemonMoveData[]
  );

  const [show, setShow] = useState(false);
  const [showOption, setShowOption] = useState(false);

  const [showSettingPokemon, setShowSettingPokemon]: [RaidSetting, React.Dispatch<React.SetStateAction<RaidSetting>>] = useState({
    id: 0,
  });

  const handleClose = () => {
    setTrainerBattle(update(trainerBattle, { [trainerBattleId]: { pokemons: { $set: tempPokemonBattle } } }));
    setShow(false);
  };

  const handleSave = () => {
    setTrainerBattle(update(trainerBattle, { [trainerBattleId]: { pokemons: { $set: pokemonBattle } } }));
    setShow(false);
  };

  const handleShow = (pokemons: PokemonRaidModel[], id: number) => {
    setShow(true);
    setTrainerBattleId(id);
    setPokemonBattle(pokemons);
    setTempPokemonBattle([...pokemons]);
  };

  const handleShowOption = () => {
    setShowOption(true);
  };

  const validIV = (value: number | undefined) => {
    return !value || value < MIN_IV || value > MAX_IV;
  };

  const handleSaveOption = () => {
    if (validIV(selected.iv.atk) || validIV(selected.iv.def) || validIV(selected.iv.sta)) {
      return;
    }
    const changeResult =
      selected.level !== used.level ||
      selected.iv.atk !== used.iv.atk ||
      selected.iv.def !== used.iv.def ||
      selected.iv.sta !== used.iv.sta;
    setFilters({
      ...filters,
      used: selected,
    });
    setShowOption(false);

    if (changeResult) {
      handleCalculate();
    }
    const sordIndex = ['dpsAtk', 'tdoAtk', 'ttkAtk', 'ttkDef'];
    setResult(
      result.sort((a: any, b: any) =>
        filters.selected.sorted
          ? a[sordIndex[filters.selected.sortBy]] - b[sordIndex[filters.selected.sortBy]]
          : b[sordIndex[filters.selected.sortBy]] - a[sordIndex[filters.selected.sortBy]]
      )
    );
  };

  const handleCloseOption = () => {
    setShowOption(false);
  };

  const handleCloseSettingPokemon = () => {
    setShowSettingPokemon({
      isShow: false,
      id: 0,
      pokemon: undefined,
    });
  };

  const handleSaveSettingPokemon = () => {
    const pokemon = showSettingPokemon.pokemon;
    if (validIV(pokemon?.stats?.iv.atk) || validIV(pokemon?.stats?.iv.def) || validIV(pokemon?.stats?.iv.sta)) {
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

  const initDataPoke: PokemonRaidModel = {
    dataTargetPokemon: undefined,
    fmoveTargetPokemon: undefined,
    cmoveTargetPokemon: undefined,
  };
  const initTrainer: TrainerBattle = {
    pokemons: [initDataPoke] as PokemonRaidModel[],
    trainerId: 1,
  };

  const [trainerBattle, setTrainerBattle]: [TrainerBattle[], React.Dispatch<React.SetStateAction<TrainerBattle[]>>] = useState([
    initTrainer,
  ]);

  const [trainerBattleId, setTrainerBattleId] = useState(0);
  const [pokemonBattle, setPokemonBattle]: [PokemonRaidModel[], React.Dispatch<React.SetStateAction<PokemonRaidModel[]>>] = useState(
    [] as PokemonRaidModel[]
  );
  const [tempPokemonBattle, setTempPokemonBattle]: [PokemonRaidModel[], React.Dispatch<React.SetStateAction<PokemonRaidModel[]>>] =
    useState([] as PokemonRaidModel[]);
  const [countTrainer, setCountTrainer] = useState(1);

  const { enqueueSnackbar } = useSnackbar();

  const resetData = () => {
    clearData();
    initialize.current = false;
  };

  const clearData = () => {
    setResult([]);
  };

  const clearDataTarget = () => {
    setResultRaid(undefined);
  };

  const onSetForm = (form: PokemonFormModify | undefined) => {
    setForm(form);
  };

  const onCopyPokemon = (index: number) => {
    setPokemonBattle(update(pokemonBattle, { $push: [pokemonBattle[index]] }));
  };

  const onRemovePokemon = (index: number) => {
    setPokemonBattle(update(pokemonBattle, { $splice: [[index, 1]] }));
  };

  const onOptionsPokemon = (index: number, pokemon: PokemonDataModel) => {
    setShowSettingPokemon({
      isShow: true,
      id: index,
      pokemon,
    });
  };

  const findMove = useCallback(
    (id: number, form: string) => {
      const resultFirst = data?.pokemonCombat?.filter((item) => item.id === id);
      form = form.replaceAll('-', '_').replaceAll('_standard', '').toUpperCase();
      const result = resultFirst?.find((item) => item.name === form);
      let simpleMove: SelectMoveModel[] = [];
      if (resultFirst && (resultFirst.length === 1 || result == null)) {
        if (resultFirst.length === 0) {
          setFMove(undefined);
          setResultFMove(undefined);
          setCMove(undefined);
          setResultCMove(undefined);
          return;
        }
        let simpleMove: SelectMoveModel[] = [];
        resultFirst.at(0)?.quickMoves.forEach((value) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
        });
        resultFirst.at(0)?.eliteQuickMoves.forEach((value) => {
          simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
        });
        setFMove(simpleMove.at(0));
        setResultFMove(simpleMove);
        simpleMove = [];
        resultFirst.at(0)?.cinematicMoves.forEach((value) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
        });
        resultFirst.at(0)?.eliteCinematicMoves.forEach((value) => {
          simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
        });
        resultFirst.at(0)?.shadowMoves.forEach((value) => {
          simpleMove.push({ name: value, elite: false, shadow: true, purified: false, special: false });
        });
        resultFirst.at(0)?.purifiedMoves.forEach((value) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: true, special: false });
        });
        resultFirst.at(0)?.specialMoves.forEach((value) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: true });
        });
        setCMove(simpleMove.at(0));
        return setResultCMove(simpleMove);
      }
      simpleMove = [];
      result?.quickMoves.forEach((value) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
      });
      result?.eliteQuickMoves.forEach((value) => {
        simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
      });
      setFMove(simpleMove.at(0));
      setResultFMove(simpleMove);
      simpleMove = [];
      result?.cinematicMoves.forEach((value) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
      });
      result?.eliteCinematicMoves.forEach((value) => {
        simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
      });
      result?.shadowMoves.forEach((value) => {
        simpleMove.push({ name: value, elite: false, shadow: true, purified: false, special: false });
      });
      result?.purifiedMoves.forEach((value) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: true, special: false });
      });
      result?.specialMoves.forEach((value) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: true });
      });
      setCMove(simpleMove.at(0));
      return setResultCMove(simpleMove);
    },
    [data?.pokemonCombat]
  );

  const addCPokeData = (
    dataList: PokemonMoveData[],
    movePoke: string[],
    value: PokemonDataModel | undefined,
    vf: string,
    shadow: boolean,
    purified: boolean,
    felite: boolean,
    celite: boolean,
    specialMove: string | string[] | null,
    pokemonTarget: boolean
  ) => {
    movePoke.forEach((vc) => {
      const fmove = data?.combat?.find((item) => item.name === vf);
      const cmove = data?.combat?.find((item) => item.name === vc);
      if (fmove && cmove) {
        const stats = calculateStatsByTag(value, value?.baseStats, value?.slug);
        const statsAttackerTemp = {
          atk: calculateStatsBattle(stats.atk, used.iv.atk, used.level),
          def: calculateStatsBattle(stats.def, used.iv.def, used.level),
          hp: calculateStatsBattle(stats?.sta ?? 0, used.iv.sta, used.level),
          fmove,
          cmove,
          types: value?.types ?? [],
          shadow,
          WEATHER_BOOSTS: String(weatherCounter),
        };
        let statsDefender = {
          atk: statBossATK,
          def: statBossDEF,
          hp: statBossHP,
          fmove: data?.combat?.find((item) => item.name === fMove?.name),
          cmove: data?.combat?.find((item) => item.name === cMove?.name),
          types: form?.form.types ?? [],
          WEATHER_BOOSTS: String(weatherBoss),
        };
        const statsAttacker = pokemonTarget ? statsDefender : statsAttackerTemp;
        statsDefender = pokemonTarget ? statsAttackerTemp : statsDefender;

        if (!statsAttacker || !statsDefender) {
          enqueueSnackbar('Something went wrong!', { variant: 'error' });
          return;
        }

        const dpsDef = calculateBattleDPSDefender(data?.options, data?.typeEff, data?.weatherBoost, statsAttacker, statsDefender);
        const dpsAtk = calculateBattleDPS(data?.options, data?.typeEff, data?.weatherBoost, statsAttacker, statsDefender, dpsDef);

        const ttkAtk = TimeToKill(Math.floor(statsDefender.hp), dpsAtk); // Time to Attacker kill Defender
        const ttkDef = TimeToKill(Math.floor(statsAttacker.hp), dpsDef); // Time to Defender kill Attacker

        const tdoAtk = dpsAtk * ttkDef;
        const tdoDef = dpsDef * ttkAtk;

        dataList.push({
          pokemon: value,
          fmove: statsAttacker.fmove,
          cmove: statsAttacker.cmove,
          dpsDef,
          dpsAtk,
          tdoAtk,
          tdoDef,
          multiDpsTdo: Math.pow(dpsAtk, 3) * tdoAtk,
          ttkAtk,
          ttkDef,
          attackHpRemain: Math.floor(statsAttacker.hp) - Math.min(timeAllow, ttkDef) * dpsDef,
          defendHpRemain: Math.floor(statsDefender.hp) - Math.min(timeAllow, ttkAtk) * dpsAtk,
          death: Math.floor(statsDefender.hp / tdoAtk),
          shadow,
          purified: purified && specialMove != null && specialMove.includes(statsAttacker?.cmove?.name ?? ''),
          mShadow: shadow && specialMove != null && specialMove.includes(statsAttacker?.cmove?.name ?? ''),
          elite: {
            fmove: felite,
            cmove: celite,
          },
        });
      }
    });
  };

  const addFPokeData = (
    dataList: PokemonMoveData[],
    combat: CombatPokemon,
    movePoke: string[],
    pokemon: PokemonDataModel,
    felite: boolean,
    pokemonTarget: boolean
  ) => {
    movePoke.forEach((vf) => {
      addCPokeData(dataList, combat.cinematicMoves, pokemon, vf, false, false, felite, false, null, pokemonTarget);
      if (!pokemon.forme || !pokemon.forme?.toUpperCase().includes(FORM_MEGA)) {
        if (combat.shadowMoves.length > 0) {
          addCPokeData(dataList, combat.cinematicMoves, pokemon, vf, true, false, felite, false, combat.shadowMoves, pokemonTarget);
        }
        addCPokeData(dataList, combat.shadowMoves, pokemon, vf, true, false, felite, false, combat.shadowMoves, pokemonTarget);
        addCPokeData(dataList, combat.purifiedMoves, pokemon, vf, false, true, felite, false, combat.purifiedMoves, pokemonTarget);
      }
      if ((!pokemon.forme || !pokemon.forme?.toUpperCase().includes(FORM_MEGA)) && combat.shadowMoves.length > 0) {
        addCPokeData(dataList, combat.eliteCinematicMoves, pokemon, vf, true, false, felite, true, combat.shadowMoves, pokemonTarget);
      } else {
        addCPokeData(dataList, combat.eliteCinematicMoves, pokemon, vf, false, false, felite, true, null, pokemonTarget);
      }
    });
  };

  const calculateTopBattle = (pokemonTarget: boolean) => {
    let dataList: PokemonMoveData[] = [];
    (data?.pokemonData ?? []).forEach((pokemon) => {
      if (pokemon.forme?.toUpperCase() !== FORM_GMAX) {
        const pokemonCombatResult = data?.pokemonCombat?.filter(
          (item) =>
            item.id === pokemon.num &&
            item.baseSpecies === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
        );
        const result = pokemonCombatResult?.find((item) => item.name === convertName(pokemon.name));
        let combatPoke: CombatPokemon | undefined;
        if (!result && pokemonCombatResult && pokemonCombatResult.length > 0) {
          combatPoke = pokemonCombatResult.at(0);
        } else {
          combatPoke = result;
        }
        if (combatPoke) {
          addFPokeData(dataList, combatPoke, combatPoke.quickMoves, pokemon, false, pokemonTarget);
          addFPokeData(dataList, combatPoke, combatPoke.eliteQuickMoves, pokemon, true, pokemonTarget);
        }
      }
    });
    if (pokemonTarget) {
      const sortedDPS = dataList.sort((a, b) => a.dpsAtk - b.dpsAtk);
      const sortedTDO = dataList.sort((a, b) => a.tdoAtk - b.tdoAtk);
      const sortedHP = dataList.sort((a, b) => (a.attackHpRemain ?? 0) - (b.attackHpRemain ?? 0));
      const result = {
        minDPS: sortedDPS.at(0)?.dpsAtk ?? 0,
        maxDPS: sortedDPS[dataList.length - 1].dpsAtk,
        minTDO: sortedTDO.at(0)?.tdoAtk ?? 0,
        maxTDO: sortedTDO[dataList.length - 1].tdoAtk,
        minHP: sortedHP.at(0)?.attackHpRemain ?? 0,
        maxHP: sortedHP[dataList.length - 1].attackHpRemain ?? 0,
      };
      setResultBoss(result);
    } else {
      const group = dataList.reduce((result: { [x: string]: PokemonMoveData[] }, obj) => {
        (result[obj.pokemon?.name ?? ''] = result[obj.pokemon?.name ?? ''] || []).push(obj);
        return result;
      }, {});
      dataList = Object.values(group)
        .map((pokemon) => pokemon.reduce((p, c) => (p.dpsAtk > c.dpsAtk ? p : c)))
        .sort((a, b) => b.dpsAtk - a.dpsAtk);
      setResult(dataList);
      dispatch(hideSpinner());
    }
  };

  const calculateBossBattle = () => {
    calculateTopBattle(true);
    calculateTopBattle(false);
  };

  const calculateDPSBattle = (pokemon: PokemonRaidModel, HpRemain: number, timer: number) => {
    const fmove = data?.combat?.find((item) => item.name === pokemon.fmoveTargetPokemon?.name);
    const cmove = data?.combat?.find((item) => item.name === pokemon.cmoveTargetPokemon?.name);

    if (fmove && cmove) {
      const stats = calculateStatsByTag(pokemon.dataTargetPokemon, pokemon.dataTargetPokemon?.baseStats, pokemon.dataTargetPokemon?.slug);
      const statsGO = pokemon.dataTargetPokemon?.stats ?? used;
      const statsAttacker = {
        atk: calculateStatsBattle(stats.atk, statsGO.iv.atk * (statsGO.isShadow ? SHADOW_ATK_BONUS(data?.options) : 1), statsGO.level),
        def: calculateStatsBattle(stats.def, statsGO.iv.def * (statsGO.isShadow ? SHADOW_DEF_BONUS(data?.options) : 1), statsGO.level),
        hp: calculateStatsBattle(stats?.sta ?? 0, statsGO.iv.sta ?? 0, statsGO.level),
        fmove,
        cmove,
        types: pokemon.dataTargetPokemon?.types ?? [],
        shadow: false,
        WEATHER_BOOSTS: String(weatherCounter),
      };
      const statsDefender = {
        atk: statBossATK,
        def: statBossDEF,
        hp: Math.floor(HpRemain),
        fmove: data?.combat?.find((item) => item.name === fMove?.name),
        cmove: data?.combat?.find((item) => item.name === cMove?.name),
        types: form?.form.types ?? [],
        WEATHER_BOOSTS: String(weatherBoss),
      };

      if (!statsDefender) {
        enqueueSnackbar('Something went wrong!', { variant: 'error' });
        return;
      }

      const dpsDef = calculateBattleDPSDefender(data?.options, data?.typeEff, data?.weatherBoost, statsAttacker, statsDefender);
      const dpsAtk = calculateBattleDPS(data?.options, data?.typeEff, data?.weatherBoost, statsAttacker, statsDefender, dpsDef);

      const ttkAtk = enableTimeAllow
        ? Math.min(timeAllow - timer, TimeToKill(Math.floor(statsDefender.hp), dpsAtk))
        : TimeToKill(Math.floor(statsDefender.hp), dpsAtk);
      const ttkDef = enableTimeAllow
        ? Math.min(timeAllow - timer, TimeToKill(Math.floor(statsAttacker.hp), dpsDef))
        : TimeToKill(Math.floor(statsAttacker.hp), dpsDef);

      const timeKill = Math.min(ttkAtk, ttkDef);

      const tdoAtk = dpsAtk * (enableTimeAllow ? timeKill : ttkDef);
      const tdoDef = dpsDef * (enableTimeAllow ? timeKill : ttkAtk);

      return {
        pokemon: pokemon.dataTargetPokemon,
        fmove: statsAttacker.fmove,
        cmove: statsAttacker.cmove,
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
        defHpRemain: Math.floor(statsDefender.hp) - tdoAtk,
      };
    }
  };

  const calculateTrainerBattle = (trainerBattle: TrainerBattle[]) => {
    const trainer = trainerBattle.map((trainer) => trainer.pokemons);
    const trainerNoPokemon = trainer.filter((pokemon) => pokemon.filter((item) => !item.dataTargetPokemon)?.length > 0);
    if (trainerNoPokemon.length > 0) {
      enqueueSnackbar('Please select Pokémon to raid battle!', { variant: 'error' });
      return;
    }
    enqueueSnackbar('Simulator battle raid successfully!', { variant: 'success' });

    const turn: PokemonRaidModel[][] = [];
    trainer.forEach((pokemons, id) => {
      pokemons.forEach((_, index) => {
        turn[index] = turn[index] ?? [];
        turn[index].push({ ...trainer[id][index], trainerId: id ?? 0 });
      });
    });
    const result: RaidResult[] = [];
    let timer = 0,
      bossHp = statBossHP;
    turn.forEach((group) => {
      const dataList: RaidResult = {
        pokemon: [],
        summary: {
          dpsAtk: 0,
          dpsDef: 0,
          tdoAtk: 0,
          tdoDef: 0,
          timer,
          bossHp: Math.max(0, bossHp),
        },
      };
      group.forEach((pokemon) => {
        if (pokemon.dataTargetPokemon) {
          const stat = calculateDPSBattle(pokemon, dataList.summary.bossHp, timer);
          if (stat) {
            dataList.pokemon.push({ ...stat, trainerId: pokemon.trainerId ?? 0 });
          }

          if (enableTimeAllow) {
            dataList.summary.timer = Math.min(timeAllow, dataList.summary.timer);
          }
        }
      });

      dataList.summary.tdoAtk = Math.min(
        dataList.summary.bossHp,
        dataList.pokemon.reduce((prev, curr) => prev + (curr.tdoAtk ?? 0), 0)
      );
      dataList.summary.dpsAtk = dataList.pokemon.reduce((prev, curr) => prev + (curr.dpsAtk ?? 0), 0);
      dataList.summary.tdoDef = dataList.pokemon.reduce((prev, curr) => prev + (curr.tdoDef ?? 0), 0);
      dataList.summary.dpsDef = dataList.pokemon.reduce((prev, curr) => prev + (curr.dpsDef ?? 0), 0);

      const sumHp = dataList.pokemon.reduce((prev, curr) => prev + (curr.hp ?? 0), 0);

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
        const tdoAtk = (dataList.summary.tdoAtk / dataList.summary.dpsAtk) * (pokemon.dpsAtk ?? 0);
        return {
          ...pokemon,
          tdoAtk,
          atkHpRemain:
            dataList.summary.tdoAtk >= Math.floor(dataList.summary.bossHp)
              ? Math.max(0, Math.floor(pokemon.hp ?? 0) - Math.min(timeKill, pokemon.ttkDef ?? 0) * (pokemon.dpsDef ?? 0))
              : Math.max(0, Math.floor(pokemon.hp ?? 0) - Math.max(timeKill, pokemon.ttkDef ?? 0) * (pokemon.dpsDef ?? 0)),
        };
      });
      result.push(dataList);
    });
    setResultRaid(result);
  };

  useEffect(() => {
    document.title = 'Raid Battle - Tools';
  }, []);

  useEffect(() => {
    if (form && !initialize.current) {
      findMove(id, form.form.name);
      initialize.current = true;
    }
  }, [findMove, id, form]);

  const handleCalculate = () => {
    dispatch(showSpinner());
    clearData();
    clearDataTarget();
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
            style={{ marginTop: 0, width: percent + '%' }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          <div
            className="progress-bar bg-danger"
            style={{ marginTop: 0, width: 100 - percent + '%' }}
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
          <div className="box-text rank-text justify-content-end d-flex position-absolute">
            <span>HP: {`${Math.floor(bossHp - tdo)} / ${Math.floor(bossHp)}`}</span>
          </div>
        </div>
      </Fragment>
    );
  };

  const resultBattle = (bossHp: number, timer: number) => {
    const status = enableTimeAllow && timer >= timeAllow ? 1 : bossHp === 0 ? 0 : 2;
    return (
      <td colSpan={3} className={'text-center bg-' + (status === 0 ? 'success' : 'danger')}>
        <span className="text-white">{status === 0 ? 'WIN' : status === 1 ? 'TIME OUT' : 'LOSS'}</span>
      </td>
    );
  };

  const modalFormFilters = () => {
    return (
      <form>
        <label className="form-label">Pokémon level</label>
        <div className="input-group mb-3">
          <span className="input-group-text">Level</span>
          <Form.Select
            value={filters.selected.level}
            className="form-control"
            onChange={(e) => setFilters({ ...filters, selected: { ...selected, level: parseFloat(e.target.value) } })}
          >
            {Array.from({ length: (MAX_LEVEL - MIN_LEVEL) / 0.5 + 1 }, (_, i) => 1 + i * 0.5).map((value, index) => (
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
            value={filters.selected.iv.atk}
            type="number"
            min={MIN_IV}
            max={MAX_IV}
            required={true}
            className="form-control"
            placeholder="IV ATK"
            onInput={(e) =>
              setFilters({ ...filters, selected: { ...selected, iv: { ...selected.iv, atk: parseInt(e.currentTarget.value) } } })
            }
          />
          <span className="input-group-text">DEF</span>
          <input
            value={filters.selected.iv.def}
            type="number"
            min={MIN_IV}
            max={MAX_IV}
            required={true}
            className="form-control"
            placeholder="IV DEF"
            onInput={(e) =>
              setFilters({ ...filters, selected: { ...selected, iv: { ...selected.iv, def: parseInt(e.currentTarget.value) } } })
            }
          />
          <span className="input-group-text">STA</span>
          <input
            value={filters.selected.iv.sta}
            type="number"
            min={MIN_IV}
            max={MAX_IV}
            required={true}
            className="form-control"
            placeholder="IV STA"
            onInput={(e) =>
              setFilters({ ...filters, selected: { ...selected, iv: { ...selected.iv, sta: parseInt(e.currentTarget.value) } } })
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
                  setFilters({ ...filters, selected: { ...selected, onlyShadow: check, onlyMega: check ? false : selected.onlyMega } })
                }
              />
            }
            label="Shadow"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.selected.onlyMega}
                onChange={(_, check) =>
                  setFilters({ ...filters, selected: { ...selected, onlyMega: check, onlyShadow: check ? false : selected.onlyShadow } })
                }
              />
            }
            label="Mega"
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
                  className={filters.selected.onlyReleasedGO ? '' : 'filter-gray'}
                  width={28}
                  height={28}
                  style={{ marginLeft: 5 }}
                  alt="pokemon-go-icon"
                  src={APIService.getPokemonGoIcon(icon ?? 'Standard')}
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
            onChange={(e) => setFilters({ ...filters, selected: { ...selected, sortBy: parseInt(e.target.value) } })}
          >
            <option value={0}>Damage Per Second</option>
            <option value={1}>Total Damage Output</option>
            <option value={2}>Time To Kill</option>
            <option value={3}>Tankiness</option>
          </Form.Select>
          <span className="input-group-text">Priority</span>
          <Form.Select
            style={{ width: '15%' }}
            value={filters.selected.sorted}
            className="form-control"
            onChange={(e) => setFilters({ ...filters, selected: { ...selected, sorted: parseInt(e.target.value) } })}
          >
            <option value={0}>Best</option>
            <option value={1}>Worst</option>
          </Form.Select>
        </div>
      </form>
    );
  };

  const modalFormSetting = () => {
    const pokemon = showSettingPokemon.pokemon;
    if (!pokemon) {
      return;
    }
    return (
      <Fragment>
        <div className="w-100 d-flex flex-column align-items-center">
          <div className="position-relative" style={{ width: 96 }}>
            {showSettingPokemon.pokemon?.stats?.isShadow && (
              <img height={36} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
            )}
            <img
              alt="img-pokemon"
              className="pokemon-sprite-large"
              src={APIService.getPokeIconSprite(pokemon.sprite)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = APIService.getPokeIconSprite('unknown-pokemon');
              }}
            />
          </div>
          <div>
            <b>{splitAndCapitalize(pokemon.name, '-', ' ')}</b>
          </div>
        </div>
        <form className="element-top">
          <FormControlLabel
            control={
              <Checkbox
                checked={showSettingPokemon.pokemon?.stats?.isShadow}
                onChange={(_, check) => {
                  if (showSettingPokemon.pokemon?.stats) {
                    setShowSettingPokemon({
                      ...showSettingPokemon,
                      pokemon: {
                        ...showSettingPokemon.pokemon,
                        stats: {
                          ...showSettingPokemon.pokemon.stats,
                          isShadow: check,
                        },
                      },
                    });
                  }
                }}
              />
            }
            label={
              <span className="d-flex align-items-center">
                <img
                  className={showSettingPokemon.pokemon?.stats?.isShadow ? '' : 'filter-gray'}
                  width={28}
                  height={28}
                  alt="pokemon-go-icon"
                  src={APIService.getPokeShadow()}
                />
                <span style={{ color: showSettingPokemon.pokemon?.stats?.isShadow ? 'black' : 'lightgray' }}>Shadow</span>
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
                  setShowSettingPokemon({
                    ...showSettingPokemon,
                    pokemon: {
                      ...showSettingPokemon.pokemon,
                      stats: { ...showSettingPokemon.pokemon.stats, level: parseFloat(e.target.value) },
                    },
                  });
                }
              }}
            >
              {Array.from({ length: (MAX_LEVEL - MIN_LEVEL) / 0.5 + 1 }, (_, i) => 1 + i * 0.5).map((value, index) => (
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
              value={pokemon.stats?.iv.atk}
              type="number"
              min={MIN_IV}
              max={MAX_IV}
              required={true}
              className="form-control"
              placeholder="IV ATK"
              onInput={(e) => {
                if (showSettingPokemon.pokemon?.stats) {
                  setShowSettingPokemon({
                    ...showSettingPokemon,
                    pokemon: {
                      ...showSettingPokemon.pokemon,
                      stats: {
                        ...showSettingPokemon.pokemon.stats,
                        iv: { ...showSettingPokemon.pokemon.stats.iv, atk: parseInt(e.currentTarget.value) },
                      },
                    },
                  });
                }
              }}
            />
            <span className="input-group-text">DEF</span>
            <input
              value={pokemon.stats?.iv.def}
              type="number"
              min={MIN_IV}
              max={MAX_IV}
              required={true}
              className="form-control"
              placeholder="IV DEF"
              onInput={(e) => {
                if (showSettingPokemon.pokemon?.stats) {
                  setShowSettingPokemon({
                    ...showSettingPokemon,
                    pokemon: {
                      ...showSettingPokemon.pokemon,
                      stats: {
                        ...showSettingPokemon.pokemon.stats,
                        iv: { ...showSettingPokemon.pokemon.stats.iv, def: parseInt(e.currentTarget.value) },
                      },
                    },
                  });
                }
              }}
            />
            <span className="input-group-text">STA</span>
            <input
              value={pokemon.stats?.iv.sta}
              type="number"
              min={MIN_IV}
              max={MAX_IV}
              required={true}
              className="form-control"
              placeholder="IV STA"
              onInput={(e) => {
                if (showSettingPokemon.pokemon?.stats) {
                  setShowSettingPokemon({
                    ...showSettingPokemon,
                    pokemon: {
                      ...showSettingPokemon.pokemon,
                      stats: {
                        ...showSettingPokemon.pokemon.stats,
                        iv: { ...showSettingPokemon.pokemon.stats.iv, sta: parseInt(e.currentTarget.value) },
                      },
                    },
                  });
                }
              }}
            />
          </div>
        </form>
      </Fragment>
    );
  };

  return (
    <Fragment>
      <div className="row" style={{ margin: 0, overflowX: 'hidden' }}>
        <div className="col-lg" style={{ padding: 0 }}>
          <Find
            hide={true}
            title="Raid Boss"
            clearStats={resetData}
            setStatATK={setStatATK}
            setStatDEF={setStatDEF}
            setForm={onSetForm}
            setName={setName}
            setId={setId}
          />
        </div>
        <div className="col-lg d-flex justify-content-center align-items-center" style={{ padding: 0 }}>
          <div className="element-top position-relative">
            {(!resultFMove || !resultCMove) && (
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
                    pokemon={new PokemonDataModel(new PokemonModel(id, form?.form.form_name), form?.form.types ?? [])}
                    clearData={clearData}
                    move={fMove}
                    setMovePokemon={setFMove}
                    moveType={TypeMove.FAST}
                  />
                </div>
              </div>
              <div className="col d-flex justify-content-center">
                <div>
                  <h6 className="text-center">
                    <b>Charged Moves</b>
                  </h6>
                  <SelectMove
                    pokemon={new PokemonDataModel(new PokemonModel(id, form?.form.form_name), form?.form.types ?? [])}
                    clearData={clearData}
                    move={cMove}
                    setMovePokemon={setCMove}
                    moveType={TypeMove.CHARGE}
                  />
                </div>
              </div>
            </div>
            <hr />
            <Raid
              clearData={clearData}
              setTierBoss={setTier}
              setTimeAllow={setTimeAllow}
              currForm={form}
              id={id}
              statATK={statATK}
              statDEF={statDEF}
              setStatBossATK={setStatBossATK}
              setStatBossDEF={setStatBossDEF}
              setStatBossHP={setStatBossHP}
            />
            <hr />
            <div className="row align-items-center element-top" style={{ margin: 0 }}>
              <div className="col-6 d-flex justify-content-end">
                <FormControlLabel
                  control={<Checkbox checked={weatherBoss} onChange={(_, check) => setOptions({ ...options, weatherBoss: check })} />}
                  label="Boss Weather Boost"
                />
              </div>
              <div className="col-6">
                <FormControlLabel
                  control={<Checkbox checked={released} onChange={(_, check) => setOptions({ ...options, released: check })} />}
                  label="Only Release in Pokémon GO"
                />
              </div>
            </div>
            <div className="row align-items-center element-top" style={{ margin: 0 }}>
              <div className="col-6 d-flex justify-content-end" style={{ paddingRight: 0 }}>
                <FormControlLabel
                  control={<Switch checked={enableTimeAllow} onChange={(_, check) => setOptions({ ...options, enableTimeAllow: check })} />}
                  label="Time Allow"
                />
              </div>
              <div className="col-6" style={{ paddingLeft: 0 }}>
                <input
                  type="number"
                  className="form-control"
                  value={RAID_BOSS_TIER[tier].timer}
                  placeholder="Battle Time"
                  aria-label="Battle Time"
                  min={0}
                  disabled={!enableTimeAllow}
                  onInput={(e) => setTimeAllow(parseInt(e.currentTarget.value))}
                />
              </div>
            </div>
            {resultFMove && resultCMove && (
              <div className="text-center element-top">
                <button className="btn btn-primary w-50" onClick={() => handleCalculate()}>
                  Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <hr />
      {result.length > 0 && (
        <div className="container" style={{ paddingBottom: 15 }}>
          <div className="d-flex flex-wrap align-items-center justify-content-between">
            <div>
              <h4>
                {`${used.sorted ? 'Worst' : 'Best'} 10 Counters Level: `}
                {<span>{`${used.level} - ${used.iv.atk}/${used.iv.def}/${used.iv.sta}`}</span>}
              </h4>
              <p className="text-primary">
                <b>
                  {`Sort By: ${
                    used.sortBy === 0 ? 'Damage Per Seconds (DPS)' : used.sortBy === 1 ? 'Total Damage Output (TDO)' : 'Tankiness'
                  }`}{' '}
                  <span className="text-danger">{`${used.onlyShadow ? '*Only Shadow' : ''}${used.onlyMega ? '*Only Mega' : ''}`}</span>
                </b>
              </p>
            </div>
            <div>
              <button className="btn btn-primary" onClick={handleShowOption}>
                Search options
              </button>
            </div>
          </div>
          <div className="top-raid-group">
            {result
              .filter((obj) => {
                if (!used.onlyReleasedGO) {
                  return true;
                }
                if (obj.pokemon) {
                  obj.pokemon.name = splitAndCapitalize(obj.pokemon.name, ' ', ' ');
                  const result = checkPokemonGO(obj.pokemon, data?.details ?? []);
                  return result ? result.releasedGO : false;
                }
                return false;
              })
              .filter((obj) => {
                if (!used.onlyMega) {
                  return true;
                }
                return splitAndCapitalize(obj.pokemon?.name, '-', ' ').includes(' Mega');
              })
              .filter((obj) => {
                if (!used.onlyShadow) {
                  return true;
                }
                return obj.shadow;
              })
              .slice(0, 10)
              .map((value, index) => (
                <div className="top-raid-pokemon" key={index}>
                  <div className="d-flex justify-content-center w-100">
                    <Link
                      to={`/pokemon/${value.pokemon?.num}${
                        value.pokemon?.forme ? `?form=${convertFormName(value.pokemon?.num, value.pokemon?.forme.toLowerCase())}` : ''
                      }`}
                      className="sprite-raid position-relative"
                    >
                      {value.shadow && <img height={64} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
                      <img
                        className="pokemon-sprite-raid"
                        alt="img-pokemon"
                        src={
                          findAssetForm(data?.assets ?? [], value.pokemon?.num, value.pokemon?.name)
                            ? APIService.getPokemonModel(findAssetForm(data?.assets ?? [], value.pokemon?.num, value.pokemon?.name))
                            : APIService.getPokeFullSprite(value.pokemon?.num)
                        }
                      />
                    </Link>
                  </div>
                  <span className="d-flex justify-content-center w-100">
                    <b>
                      #{value.pokemon?.num} {splitAndCapitalize(value.pokemon?.name, '-', ' ')}
                    </b>
                  </span>
                  <span className="d-block element-top">
                    DPS: <b>{value.dpsAtk.toFixed(2)}</b>
                  </span>
                  <span className="d-block">
                    Total Damage Output: <b>{value.tdoAtk.toFixed(2)}</b>
                  </span>
                  <span className="d-block">
                    Death: <b className={value.death === 0 ? 'text-success' : 'text-danger'}>{value.death}</b>
                  </span>
                  <span className="d-block">
                    Time to Kill <span className="d-inline-block caption">(Boss)</span>: <b>{value.ttkAtk.toFixed(2)} sec</b>
                  </span>
                  <span className="d-block">
                    Time is Killed: <b>{value.ttkDef.toFixed(2)} sec</b>
                  </span>
                  <hr />
                  <div className="container" style={{ marginBottom: 15 }}>
                    <TypeBadge title="Fast Move" move={value.fmove} elite={value.elite?.fmove} />
                    <TypeBadge
                      title="Charged Move"
                      move={value.cmove}
                      elite={value.elite?.cmove}
                      shadow={value.mShadow}
                      purified={value.purified}
                      special={value.special}
                    />
                  </div>
                </div>
              ))}
          </div>
          <div className="row" style={{ marginLeft: 0, marginRight: 0, marginBottom: 15 }}>
            <div className="col-lg-5 justify-content-center" style={{ marginBottom: 20 }}>
              {trainerBattle.map((trainer, index) => (
                <div className="trainer-battle d-flex align-items-center position-relative" key={index}>
                  <Badge
                    color="primary"
                    overlap="circular"
                    badgeContent={'Trainer ' + (index + 1)}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                  >
                    <img width={80} height={80} alt="img-trainer" src={APIService.getTrainerModel((trainer.trainerId ?? 0) % 294)} />
                  </Badge>
                  <button className="btn btn-primary" style={{ marginRight: 10 }} onClick={() => handleShow(trainer.pokemons, index)}>
                    <EditIcon fontSize="small" />
                  </button>
                  <div className="pokemon-battle-group">
                    {trainer.pokemons.map((pokemon, index) => (
                      <div key={index} className="pokemon-battle">
                        {pokemon.dataTargetPokemon ? (
                          <span className="position-relative">
                            {pokemon.dataTargetPokemon.stats?.isShadow && (
                              <img height={18} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
                            )}
                            <img
                              className="pokemon-sprite-battle"
                              alt="img-pokemon"
                              src={APIService.getPokeIconSprite(pokemon.dataTargetPokemon.sprite, true)}
                            />
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
                      className={
                        'ic-copy text-white ' + (trainer.pokemons.at(0)?.dataTargetPokemon ? 'bg-primary' : 'click-none bg-secondary')
                      }
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
                      className={'ic-remove text-white ' + (index > 0 ? 'bg-danger' : 'click-none bg-secondary')}
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
                <button className="btn btn-primary" onClick={() => calculateTrainerBattle(trainerBattle)}>
                  Raid Battle
                </button>
              </div>
              <div className="d-flex flex-wrap justify-content-center align-items-center element-top">
                <RemoveCircleIcon
                  className={'cursor-pointer link-danger ' + (trainerBattle.length > 1 ? '' : 'click-none')}
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
                    #{id} {form ? splitAndCapitalize(form.form.name, '-', ' ') : name.toLowerCase()} Tier {tier}
                  </b>
                </h3>
                <TypeInfo arr={form?.form.types ?? []} />
              </div>
              <div className="d-flex flex-wrap align-items-center" style={{ columnGap: 15 }}>
                <TypeBadge title="Fast Move" move={fMove} elite={fMove?.elite} />
                <TypeBadge
                  title="Charged Move"
                  move={cMove}
                  elite={cMove?.elite}
                  shadow={cMove?.shadow}
                  purified={cMove?.purified}
                  special={cMove?.special}
                />
              </div>
              <hr />
              <div className="row" style={{ margin: 0 }}>
                <div className="col-lg-6" style={{ marginBottom: 20 }}>
                  <span className="d-block element-top">
                    DPS:{' '}
                    <b>
                      {resultBoss?.minDPS.toFixed(2)} - {resultBoss?.maxDPS.toFixed(2)}
                    </b>
                  </span>
                  <span className="d-block">
                    Average DPS: <b>{(((resultBoss?.minDPS ?? 0) + (resultBoss?.maxDPS ?? 0)) / 2).toFixed(2)}</b>
                  </span>
                  <span className="d-block">
                    Total Damage Output:{' '}
                    <b>
                      {resultBoss?.minTDO.toFixed(2)} - {resultBoss?.maxTDO.toFixed(2)}
                    </b>
                  </span>
                  <span className="d-block">
                    Average Total Damage Output: <b>{(((resultBoss?.minTDO ?? 0) + (resultBoss?.maxTDO ?? 0)) / 2).toFixed(2)}</b>
                  </span>
                  <span className="d-block">
                    Boss HP Remaining:{' '}
                    <b>
                      {Math.round(resultBoss?.minHP ?? 0)} - {Math.round(resultBoss?.maxHP ?? 0)}
                    </b>
                  </span>
                  <span className="d-block">
                    Boss Average HP Remaining: <b>{Math.round(((resultBoss?.minHP ?? 0) + (resultBoss?.maxHP ?? 0)) / 2)}</b>
                  </span>
                </div>
                <div className="col-lg-6 d-flex flex-wrap justify-content-center align-items-center" style={{ marginBottom: 20 }}>
                  <h2 className="text-center" style={{ margin: 0 }}>
                    Suggested players
                  </h2>
                  <hr className="w-100" />
                  <div className="d-inline-block text-center">
                    <h3 className="d-block" style={{ margin: 0 }}>
                      {Math.ceil(statBossHP / (statBossHP - Math.round(resultBoss?.minHP ?? 0)))}
                    </h3>
                    {Math.ceil(statBossHP / (statBossHP - Math.round(resultBoss?.minHP ?? 0))) === 1 ? (
                      <span className="caption text-success">Easy</span>
                    ) : (
                      <span className="caption text-danger">Hard</span>
                    )}
                  </div>
                  <h3 style={{ marginBottom: 15, marginLeft: 10, marginRight: 10 }}> - </h3>
                  <div className="d-inline-block text-center">
                    <h3 className="d-block" style={{ margin: 0 }}>
                      {Math.ceil(statBossHP / (statBossHP - Math.round(((resultBoss?.minHP ?? 0) + (resultBoss?.maxHP ?? 0)) / 2)))}+
                    </h3>
                    <span className="caption text-success">Easy</span>
                  </div>
                </div>
              </div>
              {resultRaid && (
                <Fragment>
                  <hr />
                  <ul className="element-top" style={{ listStyleType: 'initial' }}>
                    {resultRaid.map((result, turn) => (
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
                                  <td>#{(data?.trainerId ?? 0) + 1}</td>
                                  <td>
                                    <div className="d-flex align-items-center table-pokemon">
                                      <img
                                        className="pokemon-sprite-battle"
                                        height={36}
                                        alt="img-pokemon"
                                        src={APIService.getPokeIconSprite(data?.pokemon?.sprite ?? '', true)}
                                      />
                                      <span className="caption">
                                        {splitAndCapitalize(data?.pokemon?.name.replaceAll('_', '-'), '-', ' ')}
                                      </span>
                                    </div>
                                  </td>
                                  <td>{data?.dpsAtk.toFixed(2)}</td>
                                  <td>{Math.floor(data?.tdoAtk) === 0 ? '-' : data?.tdoAtk.toFixed(2)}</td>
                                  <td>{Math.floor(data?.atkHpRemain ?? 0) === 0 ? data?.ttkDef.toFixed(2) : '-'}</td>
                                  <td>
                                    <b>
                                      <span className={Math.floor(data?.atkHpRemain ?? 0) === 0 ? 'text-danger' : 'text-success'}>
                                        {Math.max(0, Math.floor(data?.atkHpRemain ?? 0))}
                                      </span>{' '}
                                      / {Math.floor(data?.hp ?? 0)}
                                    </b>
                                  </td>
                                </tr>
                              ))}
                              {((turn > 0 && Math.floor(result.summary.tdoAtk) > 0) ||
                                turn === 0 ||
                                (!enableTimeAllow && result.summary.timer <= timeAllow)) && (
                                <tr>
                                  <td colSpan={6}>{calculateHpBar(result.summary.bossHp, result.summary.tdoAtk, result.summary.dpsAtk)}</td>
                                </tr>
                              )}
                              <tr className="text-summary">
                                <td colSpan={2}>Total DPS: {result.summary.dpsAtk.toFixed(2)}</td>
                                <td className="text-center" colSpan={2}>
                                  Total TDO: {result.summary.tdoAtk.toFixed(2)}
                                </td>
                                <td colSpan={2}>Boss HP Remain: {Math.floor(result.summary.bossHp - result.summary.tdoAtk)}</td>
                              </tr>
                              {((turn > 0 && Math.floor(result.summary.tdoAtk) > 0) ||
                                turn === 0 ||
                                (!enableTimeAllow && result.summary.timer <= timeAllow)) && (
                                <tr className="text-summary">
                                  <td colSpan={3}>
                                    <TimerIcon /> Time To Battle Remain: {result.summary.timer.toFixed(2)}{' '}
                                    {enableTimeAllow && `/ ${timeAllow}`}
                                  </td>
                                  {resultBattle(Math.floor(result.summary.bossHp - result.summary.tdoAtk), result.summary.timer)}
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
      )}
      <Modal show={show && !showSettingPokemon.isShow} onHide={handleClose} centered={true}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Trainer #{trainerBattleId !== null ? trainerBattleId + 1 : 0}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
            {trainerBattleId !== null && (
              <Fragment>
                {pokemonBattle.map((pokemon, index) => (
                  <div className={'' + (index === 0 ? '' : 'element-top')} key={index}>
                    <PokemonRaid
                      controls={true}
                      id={index}
                      pokemon={pokemon}
                      data={pokemonBattle}
                      setData={setPokemonBattle}
                      defaultSetting={{
                        level: filters.selected.level,
                        isShadow: false,
                        iv: {
                          atk: filters.selected.iv.atk,
                          def: filters.selected.iv.def,
                          sta: filters.selected.iv.sta,
                        },
                      }}
                      onCopyPokemon={onCopyPokemon}
                      onRemovePokemon={onRemovePokemon}
                      onOptionsPokemon={onOptionsPokemon}
                    />
                  </div>
                ))}
              </Fragment>
            )}
          </div>
          <div className="d-flex flex-wrap justify-content-center align-items-center element-top">
            <RemoveCircleIcon
              className={'cursor-pointer link-danger ' + (pokemonBattle.length > 1 ? '' : 'click-none')}
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
              onClick={() => {
                setPokemonBattle(update(pokemonBattle, { $push: [initDataPoke] }));
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
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
          <Button variant="secondary" onClick={handleCloseOption}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveOption}>
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
          <Button variant="secondary" onClick={handleCloseSettingPokemon}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveSettingPokemon}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default RaidBattle;
