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
import { useCallback } from 'react';
import { IEvolution } from '../core/models/evolution.model';
import { IPokemonData, PokemonData } from '../core/models/pokemon.model';
import { BattleLeagueCPType } from '../utils/enums/compute.enum';
import { EqualMode, IncludeMode } from '../utils/enums/string.enum';

export const useCalculate = () => {
  const { combatsData } = useDataStore();
  const { getFilteredPokemons, getFindPokemon } = usePokemon();
  const { findMoveByName } = useCombats();

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

    return PokemonQueryRankMove.create({
      data: data.dataList,
      maxOff: Math.max(...data.dataList.map((item) => item.eDPS.offensive)),
      maxDef: Math.max(...data.dataList.map((item) => item.eDPS.defensive)),
    });
  };

  const setQueryMove = (data: QueryMovesPokemon, fastMoveSet: string[], chargedMoveSet: string[]) => {
    fastMoveSet.forEach((vf) => {
      const fMove = combatsData.find((item) => isEqual(item.name, vf));
      if (!fMove) {
        return;
      }
      const quickMoveType = getMoveType(data.pokemon, vf);
      queryMove(data, fMove, chargedMoveSet, quickMoveType);
    });
  };

  const queryMove = (data: QueryMovesPokemon, mf: ICombat, cMove: string[], fMoveType: MoveType) => {
    cMove.forEach((vc) => {
      const mc = combatsData.find((item) => isEqual(item.name, vc));

      if (mc) {
        const cMoveType = getMoveType(data.pokemon, vc);
        if (!isEqual(cMoveType, MoveType.Dynamax)) {
          mf.moveType = fMoveType;
          mc.moveType = cMoveType;

          const options = OptionOtherDPS.create({
            delay: Delay.create({
              fTime: defaultEnemyAtkDelay(),
              cTime: defaultEnemyAtkDelay(),
            }),
            pokemonDefObj: defaultPokemonDefObj(),
            ivAtk: maxIv(),
            ivDef: maxIv(),
            ivHp: maxIv(),
            pokemonLevel: defaultPokemonLevel(),
          });

          const statsAtkBattle = calculateStatsBattle(data.atk, options.ivAtk, options.pokemonLevel, true);
          const statsDefBattle = calculateStatsBattle(data.def, options.ivDef, options.pokemonLevel, true);
          const statsStaBattle = calculateStatsBattle(data.sta, options.ivHp, options.pokemonLevel, true);

          const pokemonType = moveTypeToFormType(cMoveType);

          const offensive = calculateAvgDPS(
            mf,
            mc,
            statsAtkBattle,
            statsDefBattle,
            statsStaBattle,
            data.types,
            pokemonType
          );
          const defensive = calculateAvgDPS(
            mf,
            mc,
            statsAtkBattle,
            statsDefBattle,
            statsStaBattle,
            data.types,
            pokemonType,
            options
          );

          data.dataList.push(
            new PokemonQueryMove({ fMove: mf, cMove: mc, eDPS: EDPS.create({ offensive, defensive }) })
          );
        }
      }
    });
  };

  const counterPokemon = (def: number, types: string[] | undefined) => {
    const dataList: IPokemonQueryCounter[] = [];
    getFilteredPokemons().forEach((pokemon) => {
      if (
        checkMoveSetAvailable(pokemon) &&
        !isInclude(pokemon.fullName, '_FEMALE') &&
        !isEqual(pokemon.pokemonType, PokemonType.GMax)
      ) {
        const data = new QueryMovesCounterPokemon(pokemon, def, types, dataList);
        const fastMoveSet = getAllMoves(pokemon, TypeMove.Fast);
        const chargedMoveSet = getAllMoves(pokemon, TypeMove.Charge);
        setQueryMoveCounter(data, fastMoveSet, chargedMoveSet);
      }
    });
    return dataList
      .sort((a, b) => b.dps - a.dps)
      .map((item) => new CounterModel({ ...item, ratio: (item.dps * 100) / toNumber(dataList.at(0)?.dps, 1) }));
  };

  const setQueryMoveCounter = (data: QueryMovesCounterPokemon, fastMoveSet: string[], chargedMoveSet: string[]) => {
    fastMoveSet.forEach((vf) => {
      const fMove = findMoveByName(vf);
      if (!fMove) {
        return;
      }
      const fMoveType = getMoveType(data.pokemon, vf);
      queryMoveCounter(data, fMove, chargedMoveSet, fMoveType);
    });
  };

  const queryMoveCounter = (data: QueryMovesCounterPokemon, mf: ICombat, cMove: string[], fMoveType: MoveType) => {
    cMove.forEach((vc) => {
      const mc = findMoveByName(vc);

      if (mc) {
        const cMoveType = getMoveType(data.pokemon, vc);
        if (!isEqual(cMoveType, MoveType.Dynamax)) {
          const options = OptionOtherDPS.create({
            objTypes: data.types,
            pokemonDefObj: calculateStatsBattle(data.def, maxIv(), defaultPokemonLevel(), true),
            ivAtk: maxIv(),
            ivDef: maxIv(),
            ivHp: maxIv(),
            pokemonLevel: defaultPokemonLevel(),
          });

          const pokemonType = moveTypeToFormType(cMoveType);

          const dpsOff = calculateAvgDPS(
            mf,
            mc,
            calculateStatsBattle(data.pokemon.statsGO.atk, options.ivAtk, options.pokemonLevel, true),
            calculateStatsBattle(data.pokemon.statsGO.def, options.ivDef, options.pokemonLevel, true),
            calculateStatsBattle(data.pokemon.statsGO.sta, options.ivHp, options.pokemonLevel, true),
            data.pokemon.types,
            pokemonType,
            options
          );

          data.dataList.push(
            new PokemonQueryCounter({
              pokemonId: data.pokemon.num,
              pokemonName: data.pokemon.name,
              pokemonForm: data.pokemon.form,
              releasedGO: data.pokemon.releasedGO,
              dps: dpsOff,
              fMove: Combat.create({ ...mf, moveType: fMoveType }),
              cMove: Combat.create({ ...mc, moveType: cMoveType }),
            })
          );
        }
      }
    });
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
