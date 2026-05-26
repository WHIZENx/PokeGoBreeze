import { IPokemonDetail } from '../core/models/API/info.model';
import { Combat, ICombat } from '../core/models/combat.model';
import { MoveType, PokemonType, TypeMove } from '../enums/type.enum';
import { OptionOtherDPS, Delay } from '../store/models/options.model';
import {
  calculateStatsBattle,
  calculateAvgDPS,
  calculateStatsByTag,
  calculateTDO,
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
import {
  BattleBaseStats,
  BattleLeague,
  QueryMovesCounterPokemon,
  QueryMovesPokemon,
  QueryStatesEvoChain,
} from '../utils/models/calculate.model';
import {
  PokemonQueryMove,
  EDPS,
  PokemonQueryRankMove,
  IPokemonQueryCounter,
  PokemonQueryCounter,
  IPokemonTopMove,
  PokemonTopMove,
} from '../utils/models/pokemon-top-move.model';
import {
  getMoveType,
  moveTypeToFormType,
  getAllMoves,
  checkMoveSetAvailable,
  splitAndCapitalize,
} from '../utils/utils';
import useDataStore from './useDataStore';
import { CounterModel } from '../components/Commons/Tables/Counter/models/counter.model';
import { isEqual, isInclude, toNumber } from '../utils/extension';
import usePokemon from './usePokemon';
import useCombats from './useCombats';
import { useCallback, useMemo } from 'react';
import { IEvolution } from '../core/models/evolution.model';
import { IPokemonData, PokemonData } from '../core/models/pokemon.model';
import { BattleLeagueCPType } from '../utils/enums/compute.enum';
import { EqualMode, IncludeMode } from '../utils/enums/string.enum';

export const useCalculate = () => {
  const { combatsData } = useDataStore();
  const { getFilteredPokemons, getFindPokemon } = usePokemon();
  const { findMoveByName } = useCombats();

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

  // Process pokemon in chunks, yielding to the browser between batches so the UI
  // can paint and respond to input. ~150 × ~10 move combos ≈ 1500 calculateAvgDPS
  // calls per chunk — a typical frame budget on a modern device.
  const COUNTER_CHUNK_SIZE = 150;
  const yieldToMain = () => new Promise<void>((resolve) => window.setTimeout(resolve, 0));

  const counterPokemon = async (
    def: number,
    types: string[] | undefined,
    signal?: AbortSignal
  ): Promise<CounterModel[]> => {
    const dataList: IPokemonQueryCounter[] = [];
    const pokemons = getFilteredPokemons();

    // Hoist constant options shared across all pokemon in this counter run
    const iv = maxIv();
    const level = defaultPokemonLevel();
    const defBattle = calculateStatsBattle(def, iv, level, true);
    const baseOptions = OptionOtherDPS.create({
      objTypes: types,
      pokemonDefObj: defBattle,
      ivAtk: iv,
      ivDef: iv,
      ivHp: iv,
      pokemonLevel: level,
    });

    for (let i = 0; i < pokemons.length; i += COUNTER_CHUNK_SIZE) {
      if (signal?.aborted) {
        throw new DOMException('aborted', 'AbortError');
      }
      const end = Math.min(i + COUNTER_CHUNK_SIZE, pokemons.length);
      for (let j = i; j < end; j++) {
        const pokemon = pokemons[j];
        if (
          checkMoveSetAvailable(pokemon) &&
          !isInclude(pokemon.fullName, '_FEMALE') &&
          !isEqual(pokemon.pokemonType, PokemonType.GMax)
        ) {
          const data = new QueryMovesCounterPokemon(pokemon, def, types, dataList);
          const fastMoveSet = getAllMoves(pokemon, TypeMove.Fast);
          const chargedMoveSet = getAllMoves(pokemon, TypeMove.Charge);
          setQueryMoveCounter(data, fastMoveSet, chargedMoveSet, baseOptions, iv, level);
        }
      }
      if (end < pokemons.length) {
        await yieldToMain();
      }
    }

    dataList.sort((a, b) => b.dps - a.dps);
    const topDps = toNumber(dataList[0]?.dps, 1);
    return dataList.map((item) => new CounterModel({ ...item, ratio: (item.dps * 100) / topDps }));
  };

  const setQueryMoveCounter = (
    data: QueryMovesCounterPokemon,
    fastMoveSet: string[],
    chargedMoveSet: string[],
    baseOptions: OptionOtherDPS,
    iv: number,
    level: number
  ) => {
    // Hoist per-pokemon battle stats outside the move-combo loop
    const atkBattle = calculateStatsBattle(data.pokemon.statsGO.atk, iv, level, true);
    const defBattle = calculateStatsBattle(data.pokemon.statsGO.def, iv, level, true);
    const staBattle = calculateStatsBattle(data.pokemon.statsGO.sta, iv, level, true);

    for (const vf of fastMoveSet) {
      const fMove = findMoveByName(vf);
      if (!fMove) {
        continue;
      }
      const fMoveType = getMoveType(data.pokemon, vf);
      const fMoveCopy = Combat.create({ ...fMove, moveType: fMoveType });
      queryMoveCounter(data, fMoveCopy, chargedMoveSet, baseOptions, atkBattle, defBattle, staBattle);
    }
  };

  const queryMoveCounter = (
    data: QueryMovesCounterPokemon,
    fMoveCopy: ICombat,
    cMove: string[],
    baseOptions: OptionOtherDPS,
    atkBattle: number,
    defBattle: number,
    staBattle: number
  ) => {
    for (const vc of cMove) {
      const mc = findMoveByName(vc);
      if (!mc) {
        continue;
      }
      const cMoveType = getMoveType(data.pokemon, vc);
      if (isEqual(cMoveType, MoveType.Dynamax)) {
        continue;
      }

      const pokemonType = moveTypeToFormType(cMoveType);
      const mcCopy = Combat.create({ ...mc, moveType: cMoveType });

      const dpsOff = calculateAvgDPS(
        fMoveCopy,
        mcCopy,
        atkBattle,
        defBattle,
        staBattle,
        data.pokemon.types,
        pokemonType,
        baseOptions
      );

      data.dataList.push(
        new PokemonQueryCounter({
          pokemonId: data.pokemon.num,
          pokemonName: data.pokemon.name,
          pokemonForm: data.pokemon.form,
          releasedGO: data.pokemon.releasedGO,
          dps: dpsOff,
          fMove: fMoveCopy,
          cMove: mcCopy,
        })
      );
    }
  };

  const queryTopMove = useCallback(
    (move: ICombat | undefined) => {
      const dataPri: IPokemonTopMove[] = [];
      if (move) {
        getFilteredPokemons().forEach((pokemon) => {
          if (pokemon) {
            let name = move.name;
            if (move.isMultipleWithType) {
              name = move.name.replace(`_${move.type}`, '');
            }
            const moveType = getMoveType(pokemon, name);
            if (!isEqual(moveType, MoveType.Unavailable)) {
              const stats = calculateStatsByTag(pokemon, pokemon.baseStats, pokemon.slug);
              const statsAtkBattle = calculateStatsBattle(stats.atk, maxIv(), defaultPokemonLevel());
              const statsDefBattle = calculateStatsBattle(stats.def, maxIv(), defaultPokemonLevel());
              const statsStaBattle = calculateStatsBattle(stats.sta, maxIv(), defaultPokemonLevel());
              const dps = calculateAvgDPS(move, move, statsAtkBattle, statsDefBattle, statsStaBattle, pokemon.types);
              const tdo = calculateTDO(statsDefBattle, statsStaBattle, dps);

              dataPri.push(
                new PokemonTopMove({
                  num: pokemon.num,
                  form: pokemon.form,
                  name: splitAndCapitalize(pokemon.name, '-', ' '),
                  baseSpecies: pokemon.baseSpecies,
                  sprite: pokemon.sprite,
                  releasedGO: pokemon.releasedGO,
                  moveType,
                  dps,
                  tdo,
                })
              );
            }
          }
        });
      }
      return dataPri;
    },
    [getFilteredPokemons]
  );

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
    counterPokemon,
    queryTopMove,
    queryStatesEvoChain,
  };
};
export default useCalculate;
