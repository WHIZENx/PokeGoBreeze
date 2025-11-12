import React, { Fragment, useEffect, useState } from 'react';
import SelectMove from '../../../components/Commons/Selects/SelectMove';
import Raid from '../../../components/Raid/Raid';
import Find from '../../../components/Find/Find';

import {
  addSelectMovesByType,
  generateParamForm,
  getAllMoves,
  getKeyWithData,
  getMoveType,
  getValidPokemonImgPath,
  isInvalidIV,
  isSpecialMegaFormType,
  splitAndCapitalize,
} from '../../../utils/utils';
import { RAID_BOSS_TIER } from '../../../utils/constants';
import {
  calculateBattleDPS,
  calculateBattleDPSDefender,
  calculateStatsBattle,
  calculateStatsByTag,
  TimeToKill,
} from '../../../utils/calculate';

import { Badge, Checkbox, FormControlLabel, IconButton, LinearProgress, Switch } from '@mui/material';

import './RaidBattle.scss';
import APIService from '../../../services/api.service';
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

import update from 'immutability-helper';
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
} from '../../../components/Commons/Inputs/models/select-move.model';
import { MoveType, PokemonType, TypeMove } from '../../../enums/type.enum';
import { useTitle } from '../../../utils/hooks/useTitle';
import { BattleCalculate } from '../../../utils/models/calculate.model';
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
} from '../../../utils/extension';
import {
  BattleResult,
  MovePokemon,
  IRaidResult,
  ITrainerBattle,
  RaidResult,
  RaidSetting,
  RaidSummary,
  TrainerBattle,
  Filter,
  FilterGroup,
  RaidOption,
} from './models/raid-battle.model';
import { RaidState, SortType } from './enums/raid-state.enum';
import { SortDirectionType } from '../../Sheets/DpsTdo/enums/column-select-type.enum';
import { ICombat } from '../../../core/models/combat.model';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { StatsIV } from '../../../core/models/stats.model';
import { defaultPokemonLevel, maxIv, minIv } from '../../../utils/helpers/options-context.helpers';
import useAssets from '../../../composables/useAssets';
import useSpinner from '../../../composables/useSpinner';
import usePokemon from '../../../composables/usePokemon';
import useCombats from '../../../composables/useCombats';
import useSearch from '../../../composables/useSearch';
import { levelList } from '../../../utils/compute';
import InputMui from '../../../components/Commons/Inputs/InputMui';
import FormControlMui from '../../../components/Commons/Forms/FormControlMui';
import InputReleased from '../../../components/Commons/Inputs/InputReleased';
import ButtonMui from '../../../components/Commons/Buttons/ButtonMui';
import { useSnackbar } from '../../../contexts/snackbar.context';
import DialogMui from '../../../components/Commons/Dialogs/Dialogs';
import Tooltips from '../../../components/Commons/Tooltips/Tooltips';

const RaidBattle = () => {
  useTitle({
    title: 'Raid Battle - Tools',
    description:
      'Plan your Pokémon GO raid battles with our comprehensive raid battle simulator. Find the best counters and strategies for defeating raid bosses.',
    keywords: [
      'raid battle simulator',
      'Pokémon GO raids',
      'raid counters',
      'raid strategy',
      'raid boss guide',
      'raid team builder',
    ],
  });
  const { getFilteredPokemons } = usePokemon();
  const { findMoveByName } = useCombats();
  const { getAssetNameById } = useAssets();
  const { showSpinner, hideSpinner } = useSpinner();
  const { retrieveMoves, checkPokemonGO } = usePokemon();
  const { searchingToolCurrentData } = useSearch();

  const [statBossATK, setStatBossATK] = useState(0);
  const [statBossDEF, setStatBossDEF] = useState(0);
  const [statBossHP, setStatBossHP] = useState(0);

  const [tier, setTier] = useState(1);

  const [fMove, setFMove] = useState<ISelectMoveModel>();
  const [cMove, setCMove] = useState<ISelectMoveModel>();

  const [resultFMove, setResultFMove] = useState<ISelectMoveModel[]>();
  const [resultCMove, setResultCMove] = useState<ISelectMoveModel[]>();

  const [options, setOptions] = useState(
    new RaidOption({
      isWeatherBoss: false,
      isWeatherCounter: false,
      isReleased: true,
      enableTimeAllow: true,
    })
  );

  const initFilter = FilterGroup.create({
    level: defaultPokemonLevel(),
    pokemonType: PokemonType.Normal,
    iv: StatsIV.setValue(maxIv(), maxIv(), maxIv()),
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

  const { showSnackbar } = useSnackbar();

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

  const onOptionsPokemon = (index: number, pokemon: IPokemonData | undefined) => {
    setShowSettingPokemon(
      RaidSetting.create({
        isShow: true,
        id: index,
        pokemon,
      })
    );
  };

  const findMove = (id: number, form: string, pokemonType = PokemonType.None) => {
    const result = retrieveMoves(id, form, pokemonType);
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
      const cMoveCurrent = findMoveByName(vc);
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
            fMove: findMoveByName(fMove?.name),
            cMove: findMoveByName(cMove?.name),
            types: searchingToolCurrentData?.form?.form?.types,
            isStab: isWeatherBoss,
          });
          const statsAttacker = pokemonTarget ? statsDefender : statsAttackerTemp;
          if (pokemonTarget) {
            statsDefender = statsAttackerTemp;
          }

          if (!statsAttacker || !statsDefender) {
            showSnackbar('Something went wrong!', 'error');
            return;
          }

          const dpsDef = calculateBattleDPSDefender(statsAttacker, statsDefender);
          const dpsAtk = calculateBattleDPS(statsAttacker, statsDefender, dpsDef);

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
      const fMove = findMoveByName(vf);
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
    getFilteredPokemons().forEach((pokemon) => {
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
      const group = dataList.reduce(
        (result, obj) => {
          const name = getValueOrDefault(String, obj.pokemon?.name);
          (result[name] = getValueOrDefault(Array, result[name])).push(obj);
          return result;
        },
        new Object() as DynamicObj<IPokemonMoveData[]>
      );
      dataList = Object.values(group)
        .map((pokemon) => pokemon.reduce((p, c) => (p.dpsAtk > c.dpsAtk ? p : c)))
        .sort((a, b) => b.dpsAtk - a.dpsAtk);
      setResult(dataList);
      hideSpinner();
    }
  };

  const calculateBossBattle = () => {
    calculateTopBattle(true);
    calculateTopBattle(false);
  };

  const calculateDPSBattle = (pokemonRaid: IPokemonRaidModel, hpRemain: number, timer: number) => {
    const fMoveCurrent = findMoveByName(pokemonRaid.fMoveTargetPokemon?.name);
    const cMoveCurrent = findMoveByName(pokemonRaid.cMoveTargetPokemon?.name);

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
        fMove: findMoveByName(fMove?.name),
        cMove: findMoveByName(cMove?.name),
        types: searchingToolCurrentData?.form?.form?.types,
        isStab: isWeatherBoss,
      });

      const dpsDef = calculateBattleDPSDefender(statsAttacker, statsDefender);
      const dpsAtk = calculateBattleDPS(statsAttacker, statsDefender, dpsDef);

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
      showSnackbar('Please select Pokémon to raid battle!', 'error');
      return;
    }
    showSnackbar('Simulator battle raid successfully!', 'success');

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
    if (searchingToolCurrentData) {
      setIsLoadedForms(true);
    } else {
      setIsLoadedForms(false);
    }
  }, [searchingToolCurrentData]);

  useEffect(() => {
    if (searchingToolCurrentData?.form && isNotEmpty(getFilteredPokemons())) {
      findMove(
        toNumber(searchingToolCurrentData?.form.defaultId, 1),
        getValueOrDefault(String, searchingToolCurrentData?.form.form?.name),
        searchingToolCurrentData?.form.form?.pokemonType
      );
    }
  }, [getFilteredPokemons, searchingToolCurrentData?.form]);

  const handleCalculate = () => {
    showSpinner();
    setTimeout(() => {
      calculateBossBattle();
    }, 500);
  };

  const calculateHpBar = (bossHp: number, tdo: number, sumDps: number) => {
    const dps = (sumDps * 100) / bossHp;
    const percent = (Math.floor(bossHp - tdo) * 100) / Math.floor(bossHp);
    return (
      <Fragment>
        <div className="progress tw-relative">
          <div className="tw-absolute tw-flex tw-w-full">
            <LinearProgress
              color="success"
              className="!tw-h-7.5 tw-rounded-s-sm"
              style={{ width: `${Math.round(percent)}%` }}
              variant="determinate"
              value={100}
            />
            <LinearProgress
              color="error"
              className="!tw-h-7.5 tw-rounded-e-sm"
              style={{ width: `${Math.round(100 - percent)}%` }}
              variant="determinate"
              value={100}
            />
          </div>
          <div className="tw-justify-start tw-items-center tw-flex tw-absolute tw-h-full tw-w-full">
            <div className="line-dps tw-relative" style={{ width: `calc(${dps}% + 2px` }}>
              <hr className="tw-w-full !tw-mt-[3px]" />
              <span className="line-left">
                <b>|</b>
              </span>
              <span className="line-right">
                <b>|</b>
              </span>
              <div className="caption text-dps">DPS</div>
            </div>
          </div>
          <div className="box-text rank-text tw-text-black tw-justify-end tw-flex tw-w-full tw-absolute">
            <span>HP: {`${Math.floor(bossHp - tdo)} / ${Math.floor(bossHp)}`}</span>
          </div>
        </div>
      </Fragment>
    );
  };

  const resultBattle = (bossHp: number, timer: number) => {
    const status =
      enableTimeAllow && timer >= timeAllow ? RaidState.TimeOut : bossHp > 0 ? RaidState.Loss : RaidState.Win;
    const result = splitAndCapitalize(getKeyWithData(RaidState, status), /(?=[A-Z])/, ' ').toUpperCase();
    const className = `!tw-bg-${status === RaidState.Win ? 'green-600' : 'red-600'}`;
    return (
      <td colSpan={3} className={combineClasses('!tw-text-center bg-summary', className)}>
        <span className="tw-text-white">{result}</span>
      </td>
    );
  };

  const modalFormFilters = () => (
    <form>
      <label className="tw-mb-2">Pokémon level</label>
      <InputMui
        labelPrepend="Level"
        className="tw-mb-3"
        value={filters.selected.level}
        fullWidth
        select
        menuItems={levelList.map((value) => ({ value, label: value }))}
        onChange={(value) => setFilters({ ...filters, selected: { ...selected, level: toFloat(value) } })}
      />
      <label className="tw-mb-2">Pokémon IV</label>
      <div className="input-control-group tw-mb-3">
        <InputMui
          labelPrepend="ATK"
          value={filters.selected.iv.atkIV}
          placeholder="IV ATK"
          fullWidth
          inputProps={{
            type: 'number',
            min: minIv(),
            max: maxIv(),
            required: true,
            onInput: (e) =>
              setFilters({
                ...filters,
                selected: { ...selected, iv: { ...selected.iv, atkIV: toNumber(e.currentTarget.value) } },
              }),
          }}
        />
        <InputMui
          labelPrepend="DEF"
          value={filters.selected.iv.defIV}
          placeholder="IV DEF"
          fullWidth
          inputProps={{
            type: 'number',
            min: minIv(),
            max: maxIv(),
            required: true,
            onInput: (e) =>
              setFilters({
                ...filters,
                selected: { ...selected, iv: { ...selected.iv, defIV: toNumber(e.currentTarget.value) } },
              }),
          }}
        />
        <InputMui
          labelPrepend="STA"
          value={filters.selected.iv.staIV}
          placeholder="IV STA"
          fullWidth
          inputProps={{
            type: 'number',
            min: minIv(),
            max: maxIv(),
            required: true,
            onInput: (e) =>
              setFilters({
                ...filters,
                selected: { ...selected, iv: { ...selected.iv, staIV: toNumber(e.currentTarget.value) } },
              }),
          }}
        />
      </div>
      <div className="input-group tw-mb-3">
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
      <div className="input-group tw-mb-3">
        <InputReleased
          releasedGO={filters.selected.onlyReleasedGO}
          setReleaseGO={(check) => setFilters({ ...filters, selected: { ...selected, onlyReleasedGO: check } })}
          isAvailable={filters.selected.onlyReleasedGO}
        />
      </div>
      <InputMui
        labelPrepend="Sorting"
        value={filters.selected.sortBy}
        fullWidth
        select
        menuItems={[
          { value: SortType.DPS, label: 'Damage Per Second' },
          { value: SortType.TDO, label: 'Total Damage Output' },
          { value: SortType.TTK, label: 'Time To Kill' },
          { value: SortType.TANK, label: 'Tankiness' },
        ]}
        onChange={(value) => setFilters({ ...filters, selected: { ...selected, sortBy: toNumber(value) } })}
      />
      <InputMui
        labelPrepend="Priority"
        value={filters.selected.sorted}
        fullWidth
        select
        menuItems={[
          { value: SortDirectionType.ASC, label: 'Best' },
          { value: SortDirectionType.DESC, label: 'Worst' },
        ]}
        onChange={(value) => setFilters({ ...filters, selected: { ...selected, sorted: toNumber(value) } })}
      />
    </form>
  );

  const modalFormSetting = () => {
    const pokemon = showSettingPokemon.pokemon;
    if (!pokemon) {
      return <></>;
    }
    return (
      <Fragment>
        <div className="tw-w-full tw-flex tw-flex-col tw-items-center">
          <div className="tw-relative tw-w-24">
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
        <form className="tw-mt-2">
          <FormControlMui
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
              <div className="tw-flex tw-items-center tw-gap-2">
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
                      showSettingPokemon.pokemon?.stats?.pokemonType === PokemonType.Shadow
                        ? 'var(--text-primary)'
                        : 'lightgray',
                  }}
                >
                  {getKeyWithData(PokemonType, PokemonType.Shadow)}
                </span>
              </div>
            }
          />
          <div>
            <label className="tw-mb-2">Pokémon level</label>
          </div>
          <InputMui
            labelPrepend="Level"
            className="tw-mb-3"
            value={pokemon.stats?.level}
            fullWidth
            select
            menuItems={levelList.map((value) => ({ value, label: value }))}
            onChange={(value) => {
              if (showSettingPokemon.pokemon?.stats) {
                setShowSettingPokemon(
                  RaidSetting.create({
                    ...showSettingPokemon,
                    pokemon: {
                      ...showSettingPokemon.pokemon,
                      stats: { ...showSettingPokemon.pokemon.stats, level: toFloat(value) },
                    },
                  })
                );
              }
            }}
          />
          <label className="tw-mb-2">Pokémon IV</label>
          <div className="input-control-group tw-mb-3">
            <InputMui
              labelPrepend="ATK"
              value={pokemon.stats?.iv.atkIV}
              placeholder="IV ATK"
              fullWidth
              inputProps={{
                type: 'number',
                min: minIv(),
                max: maxIv(),
                required: true,
                onInput: (e) => {
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
                },
              }}
            />
            <InputMui
              labelPrepend="DEF"
              value={pokemon.stats?.iv.defIV}
              placeholder="IV DEF"
              fullWidth
              inputProps={{
                type: 'number',
                min: minIv(),
                max: maxIv(),
                required: true,
                onInput: (e) => {
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
                },
              }}
            />
            <InputMui
              labelPrepend="STA"
              value={pokemon.stats?.iv.staIV}
              placeholder="IV STA"
              fullWidth
              inputProps={{
                type: 'number',
                min: minIv(),
                max: maxIv(),
                required: true,
                onInput: (e) => {
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
                },
              }}
            />
          </div>
        </form>
      </Fragment>
    );
  };

  const renderMove = (value: Partial<ICombat> | undefined) => (
    <div
      className={combineClasses(
        value?.type?.toLowerCase(),
        'tw-relative type-select-bg tw-flex tw-items-center filter-shadow'
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
      <div className="tw-w-3 tw-contents">
        <img
          className="pokemon-sprite-small sprite-type-select filter-shadow"
          alt="Pokémon GO Type Logo"
          src={APIService.getTypeHqSprite(value?.type)}
        />
      </div>
      <span className="filter-shadow">{splitAndCapitalize(value?.name, '_', ' ')}</span>
    </div>
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
        <div className="tw-flex tw-flex-wrap tw-items-center tw-pl-2 tw-gap-x-1">
          <div className="pokemon-battle">
            <span className="tw-relative">
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
          <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-x-2">
            {renderMove({ ...pokemon.fMove, moveType: pokemon.fMoveType })}
            {renderMove({ ...pokemon.cMove, moveType: pokemon.cMoveType })}
          </div>
        </div>
        <p className="tw-mt-2">Select slot Pokémon that you want to replace.</p>
        <div className="tw-mt-2 tw-justify-center tw-px-2">
          {trainerBattle.map((trainer) => (
            <div className="trainer-battle tw-flex tw-items-center tw-relative" key={trainer.trainerId}>
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
                      <span className="tw-relative">
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
      <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
        {renderMove(pokemon.fMove)}
        {renderMove(pokemon.cMove)}
      </div>
    );
  };

  const renderPokemon = (value: IPokemonMoveData) => {
    const assets = getAssetNameById(value.pokemon?.num, value.pokemon?.name, value.pokemon?.form);
    return (
      <LinkToTop
        to={`/pokemon/${value.pokemon?.num}${generateParamForm(value.pokemon?.form, value.pokemonType)}`}
        className="sprite-raid tw-relative"
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
      <div className="row !tw-m-0 tw-overflow-x-hidden">
        <div className="lg:tw-flex-1 !tw-p-0">
          <Find isHide title="Raid Boss" clearStats={clearDataBoss} />
        </div>
        <div className="lg:tw-flex-1 tw-flex tw-justify-center tw-items-center !tw-p-0">
          <div className="tw-mt-2 tw-relative">
            {!isNotEmpty(resultFMove) && !isNotEmpty(resultCMove) && (
              <div className="tw-absolute tw-w-full tw-h-full tw-z-2">
                <div className="moveset-error" />
                <span className="moveset-error-msg">Moveset not Available</span>
              </div>
            )}
            <h3 className="tw-text-center tw-underline">Select Boss Moveset</h3>
            <div className="row tw-mt-2">
              <div className="col tw-flex tw-justify-center">
                <div>
                  <h6 className="tw-text-center">
                    <b>Fast Moves</b>
                  </h6>
                  <SelectMove
                    pokemon={
                      new SelectMovePokemonModel(
                        searchingToolCurrentData?.form?.defaultId,
                        searchingToolCurrentData?.form?.form?.formName,
                        searchingToolCurrentData?.form?.form?.pokemonType
                      )
                    }
                    clearData={clearDataBoss}
                    move={fMove}
                    setMovePokemon={setFMove}
                    moveType={TypeMove.Fast}
                  />
                </div>
              </div>
              <div className="col tw-flex tw-justify-center">
                <div>
                  <h6 className="tw-text-center">
                    <b>Charged Moves</b>
                  </h6>
                  <SelectMove
                    pokemon={
                      new SelectMovePokemonModel(
                        searchingToolCurrentData?.form?.defaultId,
                        searchingToolCurrentData?.form?.form?.formName,
                        searchingToolCurrentData?.form?.form?.pokemonType
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
              pokemonType={searchingToolCurrentData?.form?.form?.pokemonType}
              id={searchingToolCurrentData?.form?.defaultId}
              statATK={searchingToolCurrentData?.pokemon?.statsGO?.atk}
              statDEF={searchingToolCurrentData?.pokemon?.statsGO?.def}
              setStatBossATK={setStatBossATK}
              setStatBossDEF={setStatBossDEF}
              setStatBossHP={setStatBossHP}
              isLoadedForms={isLoadedForms}
            />
            <hr />
            <div className="row tw-items-center tw-mt-2 !tw-m-0">
              <div className="!tw-w-1/2 tw-flex-none tw-flex tw-justify-end">
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
              <div className="!tw-w-1/2 tw-flex-none">
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
            <div className="row tw-items-center tw-mt-2 !tw-m-0">
              <div className="!tw-w-1/2 tw-flex-none tw-flex tw-justify-end pr-0">
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
              <div className="!tw-w-1/2 tw-flex-none tw-pl-0">
                <InputMui
                  labelAppend="sec"
                  placeholder="Battle Time"
                  value={timeAllow}
                  inputAlign="right"
                  inputProps={{
                    type: 'number',
                    min: 0,
                    disabled: !enableTimeAllow,
                    onInput: (e) => setTimeAllow(toNumber(e.currentTarget.value)),
                  }}
                />
              </div>
            </div>
            {resultFMove && resultCMove && (
              <div className="tw-text-center tw-mt-2">
                <ButtonMui
                  className="tw-w-1/2"
                  disabled={Boolean(resultBoss)}
                  onClick={() => handleCalculate()}
                  label="Search"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <hr />
      <div className="tw-container tw-pb-3">
        <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between">
          <div>
            <h4>
              {`${used.sorted ? 'Worst' : 'Best'} 10 Counters Level: `}
              {<span>{`${used.level} - ${used.iv.atkIV}/${used.iv.defIV}/${used.iv.staIV}`}</span>}
            </h4>
            <p className="tw-text-blue-600">
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
                <span className="tw-text-red-600">{`${used.onlyShadow ? '*Only Shadow' : ''}${
                  used.onlyMega ? '*Only Mega' : ''
                }`}</span>
              </b>
            </p>
          </div>
          <div>
            <ButtonMui onClick={handleShowOption} label="Search options" />
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
                    getValueOrDefault(String, obj.pokemon.fullName, obj.pokemon.pokemonId?.toString())
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
                <div className="tw-relative top-raid-pokemon" key={index}>
                  <div>
                    <IconButton
                      color="success"
                      className="tw-absolute !tw-p-0"
                      onClick={() => handleShowMovePokemon(value)}
                    >
                      <AddCircleIcon fontSize="large" />
                    </IconButton>
                  </div>
                  <div className="tw-flex tw-flex-col tw-gap-2">
                    <div className="tw-flex tw-justify-center tw-w-full">{renderPokemon(value)}</div>
                    <span className="tw-flex tw-justify-center tw-gap-2 tw-font-bold tw-w-full">
                      <span>#{value.pokemon?.num}</span>
                      <span>{splitAndCapitalize(value.pokemon?.name, '-', ' ')}</span>
                    </span>
                    <span className="tw-flex tw-gap-2">
                      <span>DPS:</span>
                      <b>{toFloatWithPadding(value.dpsAtk, 2)}</b>
                    </span>
                    <span className="tw-flex tw-gap-2">
                      <span>Total Damage Output:</span>
                      <b>{toFloatWithPadding(value.tdoAtk, 2)}</b>
                    </span>
                    <span className="tw-flex tw-gap-2">
                      <span>Death:</span>
                      <b className={value.death === 0 ? '!tw-text-green-600' : '!tw-text-red-600'}>{value.death}</b>
                    </span>
                    <span className="tw-flex tw-gap-2">
                      <span>Time to Kill (Boss):</span>
                      <b>{toFloatWithPadding(value.ttkAtk, 2)} sec</b>
                    </span>
                    <span className="tw-flex tw-gap-2">
                      <span>Time is Killed:</span>
                      <b>{toFloatWithPadding(value.ttkDef, 2)} sec</b>
                    </span>
                  </div>
                  <hr />
                  <div className="tw-mb-3">
                    <TypeBadge title="Fast Move" move={value.fMove} moveType={value.fMoveType ?? MoveType.None} />
                    <TypeBadge title="Charged Move" move={value.cMove} moveType={value.cMoveType ?? MoveType.None} />
                  </div>
                </div>
              ))}
          </div>
        )}
        <div className="row tw-my-3 tw-mx-0">
          <div className="lg:tw-w-5/12 tw-justify-center tw-mb-3">
            {trainerBattle.map((trainer, index) => (
              <div className="trainer-battle tw-flex tw-items-center tw-relative" key={index}>
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
                <ButtonMui
                  className="!tw-mr-2"
                  onClick={() => handleShow(trainer.pokemons, index)}
                  label={<EditIcon fontSize="small" />}
                />
                <div className="pokemon-battle-group">
                  {trainer.pokemons.map((pokemon, index) => (
                    <div key={index} className="pokemon-battle">
                      {pokemon.dataTargetPokemon ? (
                        <span className="tw-relative">
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
                <span className="tw-flex tw-items-center ic-group tw-gap-2">
                  <ButtonMui
                    isRound
                    className="ic-copy !tw-p-0 !tw-min-w-8 !tw-h-8"
                    disabled={!trainer.pokemons.at(0)?.dataTargetPokemon}
                    title="Copy"
                    label={<ContentCopyIcon color="inherit" className="!tw-text-small" />}
                    onClick={() => {
                      setCountTrainer(countTrainer + 1);
                      setTrainerBattle(
                        update(trainerBattle, {
                          $push: [{ ...trainerBattle[index], trainerId: countTrainer + 1 }],
                        })
                      );
                    }}
                  />
                  <ButtonMui
                    isRound
                    className="ic-remove !tw-p-0 !tw-min-w-8 !tw-h-8"
                    disabled={index === 0}
                    color="error"
                    title="Remove"
                    label={<DeleteIcon color="inherit" className="!tw-text-small" />}
                    onClick={() => setTrainerBattle(update(trainerBattle, { $splice: [[index, 1]] }))}
                  />
                </span>
              </div>
            ))}
            <div className="tw-text-center tw-mt-2">
              <ButtonMui
                onClick={() => calculateTrainerBattle(trainerBattle)}
                disabled={!resultBoss}
                label="Raid Battle"
              />
            </div>
            <div className="tw-flex tw-flex-wrap tw-justify-center tw-items-center tw-mt-2">
              <IconButton
                disabled={trainerBattle.length <= 1}
                color="error"
                onClick={() => setTrainerBattle(update(trainerBattle, { $splice: [[trainerBattle.length - 1]] }))}
              >
                <RemoveCircleIcon fontSize="large" />
              </IconButton>
              <div className="count-pokemon">{trainerBattle.length}</div>
              <IconButton
                color="success"
                onClick={() => {
                  setCountTrainer(countTrainer + 1);
                  setTrainerBattle(
                    update(trainerBattle, {
                      $push: [{ ...initTrainer, trainerId: countTrainer + 1 }],
                    })
                  );
                }}
              >
                <AddCircleIcon fontSize="large" />
              </IconButton>
            </div>
          </div>
          <div className="lg:tw-w-7/12 stats-boss tw-h-full">
            <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-x-3">
              <h3>
                <b>
                  {searchingToolCurrentData?.form ? `#${searchingToolCurrentData?.form?.defaultId}` : ''}{' '}
                  {searchingToolCurrentData?.form
                    ? splitAndCapitalize(searchingToolCurrentData?.form.form?.name, '-', ' ')
                    : splitAndCapitalize(searchingToolCurrentData?.pokemon?.fullName, '_', ' ')}{' '}
                  Tier {tier}
                </b>
              </h3>
              <TypeInfo arr={searchingToolCurrentData?.form?.form?.types} />
            </div>
            <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-x-3">
              <TypeBadge title="Fast Move" move={fMove} moveType={fMove?.moveType ?? MoveType.None} />
              <TypeBadge title="Charged Move" move={cMove} moveType={cMove?.moveType ?? MoveType.None} />
            </div>
            {resultBoss && (
              <Fragment>
                <hr />
                <div className="row !tw-m-0">
                  <div className="lg:tw-w-1/2 tw-flex tw-flex-col tw-gap-2 tw-mb-3">
                    <span className="tw-flex tw-gap-2">
                      <span>DPS:</span>
                      <b>
                        {toFloatWithPadding(resultBoss.minDPS, 2)} - {toFloatWithPadding(resultBoss.maxDPS, 2)}
                      </b>
                    </span>
                    <span className="tw-flex tw-gap-2">
                      <span>Average DPS:</span>
                      <b>{toFloatWithPadding((resultBoss.minDPS + resultBoss.maxDPS) / 2, 2)}</b>
                    </span>
                    <span className="tw-flex tw-gap-2 tw-flex-col">
                      <span>Total Damage Output:</span>
                      <b>
                        {toFloatWithPadding(resultBoss.minTDO, 2)} - {toFloatWithPadding(resultBoss.maxTDO, 2)}
                      </b>
                    </span>
                    <span className="tw-flex tw-gap-2">
                      <span>Average Total Damage Output:</span>
                      <b>{toFloatWithPadding((resultBoss.minTDO + resultBoss.maxTDO) / 2, 2)}</b>
                    </span>
                    <span className="tw-flex tw-gap-2">
                      <span>Boss HP Remaining:</span>
                      <b>
                        {Math.round(resultBoss.minHP)} - {Math.round(resultBoss.maxHP)}
                      </b>
                    </span>
                    <span className="tw-flex tw-gap-2">
                      <span>Boss Average HP Remaining:</span>
                      <b>{Math.round((resultBoss.minHP + resultBoss.maxHP) / 2)}</b>
                    </span>
                  </div>
                  <div className="lg:tw-w-1/2 tw-flex tw-flex-wrap tw-justify-center tw-items-center tw-mb-3">
                    <h2 className="tw-text-center !tw-m-0">Suggested players</h2>
                    <hr className="tw-w-full" />
                    <div className="tw-inline-block tw-text-center">
                      <h3 className="tw-block !tw-m-0">
                        {Math.ceil(statBossHP / (statBossHP - Math.round(resultBoss.minHP)))}
                      </h3>
                      {Math.ceil(statBossHP / (statBossHP - Math.round(resultBoss.minHP))) === 1 ? (
                        <span className="caption !tw-text-green-600">Easy</span>
                      ) : (
                        <span className="caption !tw-text-red-600">Hard</span>
                      )}
                    </div>
                    <h3 className="tw-mx-2 tw-mb-3"> - </h3>
                    <div className="tw-inline-block tw-text-center">
                      <h3 className="tw-block !tw-m-0">
                        {Math.ceil(statBossHP / (statBossHP - Math.round((resultBoss.minHP + resultBoss.maxHP) / 2)))}+
                      </h3>
                      <span className="caption !tw-text-green-600">Easy</span>
                    </div>
                  </div>
                </div>
              </Fragment>
            )}
            {isNotEmpty(resultRaid) && (
              <Fragment>
                <hr />
                <ul className="tw-mt-2 list-style-initial">
                  {resultRaid?.map((result, turn) => (
                    <li className="tw-mb-3" key={turn}>
                      <h4>
                        <b>Pokémon Round {turn + 1}</b>
                      </h4>
                      <div className="tw-w-full tw-overflow-x-auto">
                        <table className="table-info table-round-battle">
                          <thead className="tw-text-center">
                            <tr className="table-header">
                              <th>Trainer ID</th>
                              <th>Pokémon</th>
                              <th>DPS</th>
                              <th>TDO</th>
                              <th>TTD</th>
                              <th>HP</th>
                            </tr>
                          </thead>
                          <tbody className="tw-text-center">
                            {result.pokemon.map((data, index) => (
                              <tr key={index}>
                                <td>#{toNumber(data.trainerId) + 1}</td>
                                <td>
                                  <Tooltips
                                    hideBackground
                                    arrow
                                    colorArrow="var(--custom-pop-over)"
                                    title={<div className="popover-info">{modalDetailsPokemon(data)}</div>}
                                  >
                                    <span className="tooltips-info">
                                      <div className="tw-flex tw-items-center table-pokemon">
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
                                  </Tooltips>
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
                                        Math.floor(toNumber(data.atkHpRemain)) === 0
                                          ? '!tw-text-red-600'
                                          : '!tw-text-green-600'
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
                              <td className="tw-text-center" colSpan={2}>
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
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <TimerIcon />
                                    <span>
                                      Time To Battle Remain: {toFloatWithPadding(result.summary.timer, 2)}
                                      {enableTimeAllow && ` / ${timeAllow}`}
                                    </span>
                                  </div>
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
      <DialogMui
        open={show && !showSettingPokemon.isShow}
        onClose={handleClose}
        title={`Trainer #${trainerBattleId + 1}`}
        content={
          <>
            <div className="tw-overflow-y-auto tw-max-h-[60vh]">
              {pokemonBattle.map((pokemon, index) => (
                <div className={index === 0 ? '' : 'tw-mt-2'} key={index}>
                  <PokemonRaid
                    isControls
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
            <div className="tw-flex tw-flex-wrap tw-justify-center tw-items-center tw-mt-2">
              <IconButton
                disabled={pokemonBattle.length <= 1}
                color="error"
                onClick={() => setPokemonBattle(update(pokemonBattle, { $splice: [[pokemonBattle.length - 1]] }))}
              >
                <RemoveCircleIcon fontSize="large" />
              </IconButton>
              <div className="count-pokemon">{pokemonBattle.length}</div>
              <IconButton
                color="success"
                onClick={() => setPokemonBattle(update(pokemonBattle, { $push: [new PokemonRaidModel()] }))}
              >
                <AddCircleIcon fontSize="large" />
              </IconButton>
            </div>
          </>
        }
        actions={[
          {
            label: 'Cancel',
            color: 'tertiary',
            isClose: true,
          },
          {
            label: 'Save',
            onClick: handleSave,
          },
        ]}
      />

      <DialogMui
        open={showOption}
        onClose={handleCloseOption}
        title="Search Options"
        content={<div className="tw-overflow-y-auto tw-max-h-[60vh]">{modalFormFilters()}</div>}
        actions={[
          {
            label: 'Cancel',
            color: 'tertiary',
            isClose: true,
          },
          {
            label: 'Save',
            onClick: handleSaveOption,
          },
        ]}
      />

      <DialogMui
        open={showSettingPokemon.isShow}
        onClose={handleCloseSettingPokemon}
        title="Pokémon Settings"
        content={<div className="tw-overflow-y-auto tw-max-h-[60vh]">{modalFormSetting()}</div>}
        actions={[
          {
            label: 'Cancel',
            color: 'tertiary',
            isClose: true,
          },
          {
            label: 'Save',
            onClick: handleSaveSettingPokemon,
          },
        ]}
      />

      <DialogMui
        open={showMovePokemon.isShow}
        onClose={handleCloseMovePokemon}
        title="Move Pokémon"
        content={<div className="tw-overflow-y-auto tw-max-h-[60vh]">{modalMovePokemon()}</div>}
        actions={[
          {
            label: 'Cancel',
            color: 'tertiary',
            isClose: true,
          },
        ]}
      />
    </Fragment>
  );
};

export default RaidBattle;
