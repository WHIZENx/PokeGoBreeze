import React, { Fragment, useCallback, useEffect, useState } from 'react';
import APIService from '../../../services/api.service';

import { getKeyWithData, getPokemonType, replaceTempMovePvpName, splitAndCapitalize } from '../../../utils/utils';
import { calculateStatsByTag, calculateStatsTopRank } from '../../../utils/calculate';
import CardPokemon from '../../../components/Card/CardPokemon';
import { Checkbox } from '@mui/material';
import { Combat, ICombat } from '../../../core/models/combat.model';
import { IBattlePokemonData } from '../../../core/models/pvp.model';
import { ISelectPokeComponent } from '../../models/page.model';
import { ChargeType, PokemonBattle, PokemonBattleData } from '../models/battle.model';
import { combineClasses, getValueOrDefault, isEqual, isNotEmpty, toNumber } from '../../../utils/extension';
import { PokemonType } from '../../../enums/type.enum';
import useSpinner from '../../../composables/useSpinner';
import useCombats from '../../../composables/useCombats';
import SelectCardPokemon from '../../../components/Commons/Selects/SelectCardPokemon';
import { SelectMovePokemonModel } from '../../../components/Commons/Inputs/models/select-move.model';
import SelectCardMove from '../../../components/Commons/Selects/SelectCardMove';

const SelectPoke = (props: ISelectPokeComponent) => {
  const { findMoveByName } = useCombats();
  const { showSpinner, hideSpinner } = useSpinner();

  const [pokemon, setPokemon] = useState<IBattlePokemonData>();
  const [fMove, setFMove] = useState<ICombat>();
  const [cMovePri, setCMovePri] = useState<ICombat>();
  const [cMoveSec, setCMoveSec] = useState<ICombat>();

  const [score, setScore] = useState(0);

  useEffect(() => {
    setPokemon(props.data.find((value) => isEqual(value.speciesId, pokemon?.speciesId)));
  }, [props.data]);

  const selectPokemon = (value: IBattlePokemonData) => {
    if (!isNotEmpty(value.moveset) || !value.pokemon) {
      return;
    }
    props.clearData(false);
    const [fMove] = getValueOrDefault(Array, value.moveset);
    let [, cMovePri, cMoveSec] = getValueOrDefault(Array, value.moveset);
    setPokemon(value);

    const fMoveCombat = findMoveByName(fMove);
    setFMove(fMoveCombat);
    cMovePri = replaceTempMovePvpName(cMovePri);

    const cMovePriCombat = findMoveByName(cMovePri);
    setCMovePri(cMovePriCombat);
    cMoveSec = replaceTempMovePvpName(cMoveSec);

    const cMoveSecCombat = findMoveByName(cMoveSec);
    setCMoveSec(cMoveSecCombat);

    const stats = calculateStatsByTag(value.pokemon, value.pokemon.baseStats, value.pokemon.slug);
    const bestStats = calculateStatsTopRank(stats, value.pokemon.num, props.league);

    setScore(value.score);
    props.setPokemonBattle(
      PokemonBattle.create({
        ...props.pokemonBattle,
        pokemonData: PokemonBattleData.create({
          ...value,
          form: value.form,
          pokemonType: value.pokemonType,
          hp: toNumber(value.stats.hp),
          fMove: fMoveCombat,
          cMove: cMovePriCombat,
          cMoveSec: cMoveSecCombat,
          energy: 0,
          block: 0,
          turn: 0,
          currentStats: bestStats,
          bestStats,
          disableCMovePri: false,
          disableCMoveSec: false,
          stats,
        }),
        fMove: fMoveCombat,
        cMovePri: cMovePriCombat,
        cMoveSec: cMoveSecCombat,
        audio: {
          fMove: new Audio(APIService.getSoundMove(fMoveCombat?.sound)),
          cMovePri: new Audio(APIService.getSoundMove(cMovePriCombat?.sound)),
          cMoveSec: new Audio(APIService.getSoundMove(cMoveSecCombat?.sound)),
        },
        pokemonType: getPokemonType(value.speciesId),
      })
    );
    hideSpinner();
  };

  const selectFMove = (value: ICombat | undefined) => {
    props.clearData(false);
    setFMove(value);
    props.setPokemonBattle(
      PokemonBattle.create({
        ...props.pokemonBattle,
        fMove: value,
        audio: { ...props.pokemonBattle.audio, fMove: new Audio(APIService.getSoundMove(value?.sound)) },
      })
    );
  };

  const selectCMovePri = (value: ICombat | undefined) => {
    props.clearData(false);
    setCMovePri(value);
    props.setPokemonBattle(
      PokemonBattle.create({
        ...props.pokemonBattle,
        cMovePri: value,
        audio: { ...props.pokemonBattle.audio, cMovePri: new Audio(APIService.getSoundMove(value?.sound)) },
      })
    );
  };

  const selectCMoveSec = (value: ICombat | undefined) => {
    props.clearData(false);
    setCMoveSec(value);
    props.setPokemonBattle(
      PokemonBattle.create({
        ...props.pokemonBattle,
        cMoveSec: value,
        audio: { ...props.pokemonBattle.audio, cMoveSec: new Audio(APIService.getSoundMove(value?.sound)) },
      })
    );
  };

  const removePokemon = useCallback(() => {
    props.clearData(false);
    setPokemon(undefined);
    setFMove(undefined);
    setCMovePri(undefined);
    setCMoveSec(undefined);
    setScore(0);
  }, [props.clearData]);

  const removeChargeMoveSec = useCallback(() => {
    props.clearData(true);
    setCMoveSec(undefined);
  }, [props.clearData]);

  useEffect(() => {
    if (pokemon && !props.pokemonBattle.pokemonData) {
      removePokemon();
    }
  }, [pokemon, props.pokemonBattle.pokemonData, removePokemon]);

  return (
    <Fragment>
      <h5>Pokémon</h5>
      <SelectCardPokemon
        pokemonList={props.data}
        onSelect={(pokemon) => splitAndCapitalize(pokemon.name?.replaceAll('_', '-'), '-', ' ')}
        onFilter={(pokemon) => ({ name: pokemon.name, id: pokemon.id })}
        onIsSelectedPokemon={(result) => result === pokemon}
        onSetPokemon={(value) => {
          showSpinner();
          setTimeout(() => selectPokemon(value), 200);
        }}
        isFit
        placeholder="Enter Name"
        isShowPokemonIcon
        onSprite={(pokemon) => pokemon?.pokemon?.sprite}
        customIconStart={
          (score > 0 || pokemon) && (
            <>
              {isEqual(getPokemonType(pokemon?.speciesId), PokemonType.Shadow) && (
                <span
                  className={combineClasses(
                    'type-icon-small ic me-1 d-flex align-items-center h-3',
                    `${getKeyWithData(PokemonType, PokemonType.Shadow)?.toLowerCase()}-ic`
                  )}
                >
                  {getKeyWithData(PokemonType, PokemonType.Shadow)}
                </span>
              )}
              {score > 0 && (
                <span className="type-icon-small ic elite-ic me-1 d-flex align-items-center h-3">{score}</span>
              )}
            </>
          )
        }
        cardElement={(pokemon) => (
          <CardPokemon value={pokemon.pokemon} score={pokemon.score} pokemonType={getPokemonType(pokemon.speciesId)} />
        )}
        onRemove={() => removePokemon()}
      />
      <h5>Fast Moves</h5>
      <SelectCardMove
        isHideEmpty
        pokemon={new SelectMovePokemonModel(pokemon?.id, pokemon?.form, pokemon?.pokemonType)}
        move={fMove}
        setMovePokemon={(value) => selectFMove(value)}
        moves={pokemon?.moves.fastMoves
          .map((value) => findMoveByName(replaceTempMovePvpName(value.moveId)) || new Combat())
          .filter((value) => value.id > 0)}
      />
      <h5>Charged Moves Primary</h5>
      <div className="d-flex align-items-center column-gap-2">
        <Checkbox
          checked={!props.pokemonBattle.disableCMovePri}
          onChange={(_, check) => {
            props.clearData(false);
            props.setPokemonBattle(
              PokemonBattle.create({
                ...props.pokemonBattle,
                disableCMovePri: !check,
                chargeSlot:
                  check === false
                    ? props.pokemonBattle.disableCMoveSec
                      ? ChargeType.None
                      : ChargeType.Secondary
                    : props.pokemonBattle.chargeSlot,
              })
            );
          }}
        />
        <SelectCardMove
          isHideEmpty
          style={{ width: 'calc(100% - 50px)' }}
          pokemon={new SelectMovePokemonModel(pokemon?.id, pokemon?.form, pokemon?.pokemonType)}
          move={cMovePri}
          setMovePokemon={(value) => selectCMovePri(value)}
          isDisable={props.pokemonBattle.disableCMovePri}
          moves={pokemon?.moves.chargedMoves
            .map((value) => findMoveByName(replaceTempMovePvpName(value.moveId)) || new Combat())
            .filter((value) => value.id > 0 && !isEqual(value.name, cMoveSec?.name))}
        />
      </div>
      <h5>Charged Moves Secondary</h5>
      <div className="d-flex align-items-center column-gap-2">
        <Checkbox
          checked={!props.pokemonBattle.disableCMoveSec}
          onChange={(_, check) => {
            props.clearData(false);
            props.setPokemonBattle(
              PokemonBattle.create({
                ...props.pokemonBattle,
                disableCMoveSec: !check,
                chargeSlot:
                  check === false
                    ? props.pokemonBattle.disableCMovePri
                      ? ChargeType.None
                      : ChargeType.Primary
                    : props.pokemonBattle.chargeSlot,
              })
            );
          }}
        />
        <SelectCardMove
          isHideEmpty
          style={{ width: 'calc(100% - 50px)' }}
          pokemon={new SelectMovePokemonModel(pokemon?.id, pokemon?.form, pokemon?.pokemonType)}
          move={cMoveSec}
          setMovePokemon={(value) => selectCMoveSec(value)}
          isDisable={props.pokemonBattle.disableCMoveSec}
          clearData={props.pokemonBattle.disableCMovePri ? undefined : removeChargeMoveSec}
          moves={pokemon?.moves.chargedMoves
            .map((value) => findMoveByName(replaceTempMovePvpName(value.moveId)) || new Combat())
            .filter((value) => value.id > 0 && !isEqual(value.name, cMovePri?.name))}
        />
      </div>
    </Fragment>
  );
};

export default SelectPoke;
