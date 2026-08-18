import { IPokemonDetail } from '../core/models/API/info.model';
import { Combat, ICombat } from '../core/models/combat.model';
import { MoveType, TypeMove } from '../enums/type.enum';
import { OptionOtherDPS, Delay } from '../store/models/options.model';
import {
  calculateStatsBattle,
  calculateAvgDPS,
  calculateStatsByTag,
  calculateBetweenLevel,
  calStatsProd,
  findCPforLeague,
  sortStatsProd,
} from '../utils/calculate';
import {
  defaultEnemyAtkDelay,
  defaultPokemonDefObj,
  maxIv,
  defaultPokemonLevel,
  minCp,
} from '../utils/helpers/options-context.helpers';
import { BattleBaseStats, BattleLeague, QueryMovesPokemon, QueryStatesEvoChain } from '../utils/models/calculate.model';
import { PokemonQueryMove, EDPS, PokemonQueryRankMove } from '../utils/models/pokemon-top-move.model';
import { getMoveType, moveTypeToFormType, getAllMoves } from '../utils/utils';
import useDataStore from './useDataStore';
import { isEqual, isInclude, toNumber } from '../utils/extension';
import usePokemon from './usePokemon';
import { useMemo } from 'react';
import { IEvolution } from '../core/models/evolution.model';
import { IPokemonData, PokemonData } from '../core/models/pokemon.model';
import { BattleLeagueCPType } from '../utils/enums/compute.enum';
import { EqualMode, IncludeMode } from '../utils/enums/string.enum';

export const useCalculate = () => {
  const { combatsData } = useDataStore();
  const { getFindPokemon } = usePokemon();

  // O(1) move name lookup shared by all query functions in this hook
  const combatMap = useMemo(() => new Map(combatsData.map((c) => [c.name, c])), [combatsData]);

  const rankMove = (
    pokemon: Partial<IPokemonDetail> | undefined,
    atk: number | undefined,
    def: number | undefined,
    sta: number | undefined,
    types: string[] | undefined
  ) => {
    if (!pokemon) {
      return new PokemonQueryRankMove();
    }
    const data = new QueryMovesPokemon(pokemon, atk, def, sta, types);
    const fastMoveSet = getAllMoves(pokemon, TypeMove.Fast);
    const chargedMoveSet = getAllMoves(pokemon, TypeMove.Charge);
    setQueryMove(data, fastMoveSet, chargedMoveSet);

    let maxOff = 0;
    let maxDef = 0;
    for (const item of data.dataList) {
      if (item.eDPS.offensive > maxOff) {
        maxOff = item.eDPS.offensive;
      }
      if (item.eDPS.defensive > maxDef) {
        maxDef = item.eDPS.defensive;
      }
    }
    return PokemonQueryRankMove.create({ data: data.dataList, maxOff, maxDef });
  };

  const setQueryMove = (data: QueryMovesPokemon, fastMoveSet: string[], chargedMoveSet: string[]) => {
    // Hoist constant options and stats outside the move-combo loop
    const iv = maxIv();
    const level = defaultPokemonLevel();
    const options = OptionOtherDPS.create({
      delay: Delay.create({ fTime: defaultEnemyAtkDelay(), cTime: defaultEnemyAtkDelay() }),
      pokemonDefObj: defaultPokemonDefObj(),
      ivAtk: iv,
      ivDef: iv,
      ivHp: iv,
      pokemonLevel: level,
    });
    const statsAtkBattle = calculateStatsBattle(data.atk, iv, level, true);
    const statsDefBattle = calculateStatsBattle(data.def, iv, level, true);
    const statsStaBattle = calculateStatsBattle(data.sta, iv, level, true);

    for (const vf of fastMoveSet) {
      const fMove = combatMap.get(vf);
      if (!fMove) {
        continue;
      }
      const quickMoveType = getMoveType(data.pokemon, vf);
      const fMoveCopy = Combat.create({ ...fMove, moveType: quickMoveType });
      queryMove(data, fMoveCopy, chargedMoveSet, statsAtkBattle, statsDefBattle, statsStaBattle, options);
    }
  };

  const queryMove = (
    data: QueryMovesPokemon,
    fMoveCopy: ICombat,
    cMove: string[],
    statsAtkBattle: number,
    statsDefBattle: number,
    statsStaBattle: number,
    options: OptionOtherDPS
  ) => {
    for (const vc of cMove) {
      const mc = combatMap.get(vc);
      if (!mc) {
        continue;
      }
      const cMoveType = getMoveType(data.pokemon, vc);
      if (isEqual(cMoveType, MoveType.Dynamax)) {
        continue;
      }

      const mcCopy = Combat.create({ ...mc, moveType: cMoveType });
      const pokemonType = moveTypeToFormType(cMoveType);

      const offensive = calculateAvgDPS(
        fMoveCopy,
        mcCopy,
        statsAtkBattle,
        statsDefBattle,
        statsStaBattle,
        data.types,
        pokemonType
      );
      const defensive = calculateAvgDPS(
        fMoveCopy,
        mcCopy,
        statsAtkBattle,
        statsDefBattle,
        statsStaBattle,
        data.types,
        pokemonType,
        options
      );

      data.dataList.push(
        new PokemonQueryMove({ fMove: fMoveCopy, cMove: mcCopy, eDPS: EDPS.create({ offensive, defensive }) })
      );
    }
  };

  const queryStatesEvoChain = (item: IEvolution, level: number, atkIV: number, defIV: number, staIV: number) => {
    let pokemon: IPokemonData | undefined = new PokemonData();
    if (!item.form) {
      pokemon = getFindPokemon(
        (value) => value.num === item.id && isEqual(value.slug, item.name, EqualMode.IgnoreCaseSensitive)
      );
    } else {
      pokemon = getFindPokemon(
        (value) => value.num === item.id && isInclude(value.slug, item.form, IncludeMode.IncludeIgnoreCaseSensitive)
      );
    }
    if (!pokemon) {
      pokemon = getFindPokemon((value) => value.num === item.id);
    }
    const pokemonStats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);
    const dataLittle = findCPforLeague(
      pokemonStats.atk,
      pokemonStats.def,
      pokemonStats.sta,
      atkIV,
      defIV,
      staIV,
      level,
      BattleLeagueCPType.Little
    );
    const dataGreat = findCPforLeague(
      pokemonStats.atk,
      pokemonStats.def,
      pokemonStats.sta,
      atkIV,
      defIV,
      staIV,
      level,
      BattleLeagueCPType.Great
    );
    const dataUltra = findCPforLeague(
      pokemonStats.atk,
      pokemonStats.def,
      pokemonStats.sta,
      atkIV,
      defIV,
      staIV,
      level,
      BattleLeagueCPType.Ultra
    );
    const dataMaster = findCPforLeague(
      pokemonStats.atk,
      pokemonStats.def,
      pokemonStats.sta,
      atkIV,
      defIV,
      staIV,
      level
    );

    const statsProd = calStatsProd(
      pokemonStats.atk,
      pokemonStats.def,
      pokemonStats.sta,
      minCp(),
      BattleLeagueCPType.Master,
      true
    );
    const ultraStatsProd = sortStatsProd(statsProd.filter((item) => toNumber(item.CP) <= BattleLeagueCPType.Ultra));
    const greatStatsProd = sortStatsProd(
      ultraStatsProd.filter((item) => toNumber(item.CP) <= BattleLeagueCPType.Great)
    );
    const littleStatsProd = sortStatsProd(
      greatStatsProd.filter((item) => toNumber(item.CP) <= BattleLeagueCPType.Little)
    );

    const little = littleStatsProd.find(
      (item) =>
        item.level === dataLittle.level &&
        item.CP === dataLittle.CP &&
        item.IV &&
        item.IV.atkIV === atkIV &&
        item.IV.defIV === defIV &&
        item.IV.staIV === staIV
    );
    const great = greatStatsProd.find(
      (item) =>
        item.level === dataGreat.level &&
        item.CP === dataGreat.CP &&
        item.IV &&
        item.IV.atkIV === atkIV &&
        item.IV.defIV === defIV &&
        item.IV.staIV === staIV
    );
    const ultra = ultraStatsProd.find(
      (item) =>
        item.level === dataUltra.level &&
        item.CP === dataUltra.CP &&
        item.IV &&
        item.IV.atkIV === atkIV &&
        item.IV.defIV === defIV &&
        item.IV.staIV === staIV
    );
    const master = sortStatsProd(statsProd).find(
      (item) =>
        item.level === dataMaster.level &&
        item.CP === dataMaster.CP &&
        item.IV &&
        item.IV.atkIV === atkIV &&
        item.IV.defIV === defIV &&
        item.IV.staIV === staIV
    );

    const battleLeague = new BattleLeague();

    if (little) {
      battleLeague.little = BattleBaseStats.create({
        ...little,
        ...calculateBetweenLevel(
          pokemonStats.atk,
          pokemonStats.def,
          pokemonStats.sta,
          atkIV,
          defIV,
          staIV,
          level,
          little.level
        ),
      });
    }
    if (great) {
      battleLeague.great = BattleBaseStats.create({
        ...great,
        ...calculateBetweenLevel(
          pokemonStats.atk,
          pokemonStats.def,
          pokemonStats.sta,
          atkIV,
          defIV,
          staIV,
          level,
          great.level
        ),
      });
    }
    if (ultra) {
      battleLeague.ultra = BattleBaseStats.create({
        ...ultra,
        ...calculateBetweenLevel(
          pokemonStats.atk,
          pokemonStats.def,
          pokemonStats.sta,
          atkIV,
          defIV,
          staIV,
          level,
          ultra.level
        ),
      });
    }
    if (master) {
      battleLeague.master = BattleBaseStats.create({
        ...master,
        ...calculateBetweenLevel(
          pokemonStats.atk,
          pokemonStats.def,
          pokemonStats.sta,
          atkIV,
          defIV,
          staIV,
          level,
          master.level
        ),
      });
    }
    return new QueryStatesEvoChain({
      ...item,
      battleLeague,
      maxCP: battleLeague.master.CP,
      form: pokemon?.form,
    });
  };

  return {
    rankMove,
    queryStatesEvoChain,
  };
};
export default useCalculate;
