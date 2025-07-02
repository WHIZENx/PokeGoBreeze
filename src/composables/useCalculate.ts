import { IPokemonDetail } from '../core/models/API/info.model';
import { Combat, ICombat } from '../core/models/combat.model';
import { MoveType, PokemonType, TypeMove } from '../enums/type.enum';
import { OptionOtherDPS, Delay } from '../store/models/options.model';
import { calculateStatsBattle, calculateAvgDPS } from '../utils/calculate';
import {
  defaultEnemyAtkDelay,
  defaultPokemonDefObj,
  maxIv,
  defaultPokemonLevel,
} from '../utils/helpers/options-context.helpers';
import { QueryMovesCounterPokemon, QueryMovesPokemon } from '../utils/models/calculate.model';
import {
  PokemonQueryMove,
  EDPS,
  PokemonQueryRankMove,
  IPokemonQueryCounter,
  PokemonQueryCounter,
} from '../utils/models/pokemon-top-move.model';
import { getMoveType, moveTypeToFormType, getAllMoves, checkMoveSetAvailable } from '../utils/utils';
import useDataStore from './useDataStore';
import { CounterModel } from '../components/Table/Counter/models/counter.model';
import { isEqual, isInclude, toNumber } from '../utils/extension';
import usePokemon from './usePokemon';
import useCombats from './useCombats';

export const useCalculate = () => {
  const { combatsData } = useDataStore();
  const { getFilteredPokemons } = usePokemon();
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

  return {
    rankMove,
    counterPokemon,
  };
};
export default useCalculate;
