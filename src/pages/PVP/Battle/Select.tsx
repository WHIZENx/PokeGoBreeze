import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import APIService from '../../../services/api.service';

import { getKeyWithData, getMoveType, replaceTempMovePvpName, splitAndCapitalize } from '../../../utils/utils';
import { calculateStatsByTag } from '../../../utils/calculate';
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
import StatsCalculationService from '../../../services/stats-calculation.service';
import { useSnackbar } from '../../../contexts/snackbar.context';
import PokemonTableIcon from '../../../components/Sprites/PokemonTableIcon/PokemonTableIcon';
import { includeGameMasterSpecialMoves } from '../pvp-move-options';
import ButtonMui from '../../../components/Commons/Buttons/ButtonMui';
import CasinoIcon from '@mui/icons-material/Casino';

const createMoveAudio = (sound: string | undefined) => {
  const audio = new Audio(APIService.getSoundMove(sound));
  audio.preload = 'none';
  return audio;
};

const SelectPoke = (props: ISelectPokeComponent) => {
  const { findMoveByName } = useCombats();
  const { showSpinner, hideSpinner } = useSpinner();
  const { showSnackbar } = useSnackbar();
  const topRankController = useRef<AbortController>();

  const [pokemon, setPokemon] = useState<IBattlePokemonData>();
  const [fMove, setFMove] = useState<ICombat>();
  const [cMovePri, setCMovePri] = useState<ICombat>();
  const [cMoveSec, setCMoveSec] = useState<ICombat>();

  const [score, setScore] = useState(0);

  const rankingMoves = (moves = pokemon?.moves.fastMoves, specialMoves?: string[]) =>
    includeGameMasterSpecialMoves(moves, specialMoves)
      .map((value) => {
        const move = findMoveByName(replaceTempMovePvpName(value.moveId));
        return move ? Combat.create({ ...move, moveType: getMoveType(pokemon?.pokemon, move.name) }) : new Combat();
      })
      .filter((value) => value.id > 0);

  useEffect(() => {
    topRankController.current?.abort();
    setPokemon(undefined);
    setFMove(undefined);
    setCMovePri(undefined);
    setCMoveSec(undefined);
    setScore(0);
  }, [props.data]);

  const selectPokemon = async (value: IBattlePokemonData) => {
    if (!isNotEmpty(value.moveset) || !value.pokemon) {
      hideSpinner();
      return;
    }
    let [fMove, cMovePri, cMoveSec] = getValueOrDefault(Array, value.moveset);

    fMove = replaceTempMovePvpName(fMove);
    const fMoveCombat = findMoveByName(fMove);
    cMovePri = replaceTempMovePvpName(cMovePri);

    const cMovePriCombat = findMoveByName(cMovePri);
    cMoveSec = replaceTempMovePvpName(cMoveSec);

    const cMoveSecCombat = findMoveByName(cMoveSec);
    const disableCMovePri = !cMovePriCombat;
    const disableCMoveSec = !cMoveSecCombat;

    const stats = calculateStatsByTag(value.pokemon, value.pokemon.baseStats, value.pokemon.slug);
    topRankController.current?.abort();
    const controller = new AbortController();
    topRankController.current = controller;
    try {
      const bestStats = await StatsCalculationService.getTopRank(
        stats,
        value.pokemon.num,
        props.league,
        undefined,
        controller.signal
      );

      if (topRankController.current !== controller) {
        return;
      }

      props.clearData(false);
      setPokemon(value);
      setFMove(fMoveCombat);
      setCMovePri(cMovePriCombat);
      setCMoveSec(cMoveSecCombat);
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
            disableCMovePri,
            disableCMoveSec,
            stats,
          }),
          fMove: fMoveCombat,
          cMovePri: cMovePriCombat,
          cMoveSec: cMoveSecCombat,
          disableCMovePri,
          disableCMoveSec,
          chargeSlot: cMovePriCombat ? ChargeType.Primary : cMoveSecCombat ? ChargeType.Secondary : ChargeType.None,
          audio: {
            fMove: createMoveAudio(fMoveCombat?.sound),
            cMovePri: createMoveAudio(cMovePriCombat?.sound),
            cMoveSec: createMoveAudio(cMoveSecCombat?.sound),
          },
          pokemonType: value.pokemonType,
        })
      );
    } catch (error) {
      if (!APIService.isCancel(error)) {
        showSnackbar('Unable to load the server-calculated PvP rank.', 'error');
      }
    } finally {
      if (topRankController.current === controller) {
        hideSpinner();
      }
    }
  };

  const selectRandomPokemon = () => {
    const validPokemon = props.data.filter((value) => isNotEmpty(value.moveset) && value.pokemon);
    const availablePokemon = validPokemon.length > 1 ? validPokemon.filter((value) => value !== pokemon) : validPokemon;
    if (!isNotEmpty(availablePokemon)) {
      showSnackbar('No Pokémon available to randomize.', 'error');
      return;
    }
    const value = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
    showSpinner();
    void selectPokemon(value);
  };

  const selectFMove = (value: ICombat | undefined) => {
    props.clearData(false);
    setFMove(value);
    props.setPokemonBattle(
      PokemonBattle.create({
        ...props.pokemonBattle,
        fMove: value,
        audio: {
          ...props.pokemonBattle.audio,
          fMove: createMoveAudio(value?.sound),
        },
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
        audio: {
          ...props.pokemonBattle.audio,
          cMovePri: createMoveAudio(value?.sound),
        },
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
        audio: {
          ...props.pokemonBattle.audio,
          cMoveSec: createMoveAudio(value?.sound),
        },
      })
    );
  };

  const removePokemon = useCallback(() => {
    topRankController.current?.abort();
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
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-2">
        <h5>Pokémon</h5>
        <ButtonMui
          className="!tw-min-w-0 !tw-px-2 !tw-py-0.5"
          size="small"
          variant="outlined"
          startIcon={<CasinoIcon fontSize="small" />}
          label="Random"
          disabled={!isNotEmpty(props.data)}
          onClick={selectRandomPokemon}
        />
      </div>
      <SelectCardPokemon
        key={props.league}
        pokemonList={props.data}
        value={pokemon ? splitAndCapitalize(pokemon.name?.replaceAll('_', '-'), '-', ' ') : ''}
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
        selectedPokemonIcon={pokemon?.pokemon && <PokemonTableIcon {...pokemon.pokemon} size={40} />}
        renderSelectedPokemonIcon={(value) => value.pokemon && <PokemonTableIcon {...value.pokemon} size={40} />}
        customIconStart={
          (score > 0 || pokemon) && (
            <>
              {pokemon?.pokemonType === PokemonType.Shadow && (
                <span
                  className={combineClasses(
                    'type-icon-small ic tw-mr-1 !tw-flex tw-items-center tw-h-3',
                    `${getKeyWithData(PokemonType, PokemonType.Shadow)?.toLowerCase()}-ic`
                  )}
                >
                  {getKeyWithData(PokemonType, PokemonType.Shadow)}
                </span>
              )}
              {score > 0 && (
                <span className="type-icon-small ic elite-ic tw-mr-1 !tw-flex tw-items-center tw-h-3">{score}</span>
              )}
            </>
          )
        }
        cardElement={(pokemon) => (
          <CardPokemon value={pokemon.pokemon} score={pokemon.score} pokemonType={pokemon.pokemonType} />
        )}
        onRemove={() => removePokemon()}
      />
      <h5 className="tw-mt-3">Fast Moves</h5>
      <SelectCardMove
        key={`fast-${props.league}`}
        isHideEmpty
        pokemon={new SelectMovePokemonModel(pokemon?.id, pokemon?.form, pokemon?.pokemonType)}
        move={fMove}
        setMovePokemon={(value) => selectFMove(value)}
        moves={rankingMoves(pokemon?.moves.fastMoves)}
      />
      <h5 className="tw-mt-3">Charged Moves Primary</h5>
      <div className="tw-flex tw-items-center tw-gap-x-2">
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
          key={`pri-${props.league}`}
          isHideEmpty
          className="tw-w-move-select"
          pokemon={new SelectMovePokemonModel(pokemon?.id, pokemon?.form, pokemon?.pokemonType)}
          move={cMovePri}
          setMovePokemon={(value) => selectCMovePri(value)}
          isDisable={props.pokemonBattle.disableCMovePri}
          moves={rankingMoves(pokemon?.moves.chargedMoves, pokemon?.pokemon.specialMoves).filter(
            (value) => !isEqual(value.name, cMoveSec?.name)
          )}
        />
      </div>
      <h5 className="tw-mt-3">Charged Moves Secondary</h5>
      <div className="tw-flex tw-items-center tw-gap-x-2">
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
          key={`sec-${props.league}`}
          isHideEmpty
          className="tw-w-move-select"
          pokemon={new SelectMovePokemonModel(pokemon?.id, pokemon?.form, pokemon?.pokemonType)}
          move={cMoveSec}
          setMovePokemon={(value) => selectCMoveSec(value)}
          isDisable={props.pokemonBattle.disableCMoveSec}
          clearData={props.pokemonBattle.disableCMovePri ? undefined : removeChargeMoveSec}
          moves={rankingMoves(pokemon?.moves.chargedMoves, pokemon?.pokemon.specialMoves).filter(
            (value) => !isEqual(value.name, cMovePri?.name)
          )}
        />
      </div>
    </Fragment>
  );
};

export default SelectPoke;
