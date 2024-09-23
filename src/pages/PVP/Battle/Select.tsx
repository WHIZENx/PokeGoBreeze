import React, { Fragment, useCallback, useEffect, useState } from 'react';
import APIService from '../../../services/API.service';

import { capitalize, replaceTempMovePvpName, splitAndCapitalize } from '../../../util/utils';
import CloseIcon from '@mui/icons-material/Close';
import CardMoveSmall from '../../../components/Card/CardMoveSmall';
import { calculateCP, calculateStatsByTag, calStatsProd } from '../../../util/calculate';
import CardPokemon from '../../../components/Card/CardPokemon';
import { useSelector } from 'react-redux';
import { Checkbox } from '@mui/material';
import { StoreState } from '../../../store/models/state.model';
import { FORM_SHADOW, MAX_IV, MAX_LEVEL } from '../../../util/constants';
import { Combat, ICombat } from '../../../core/models/combat.model';
import { IBattlePokemonData } from '../../../core/models/pvp.model';
import { ISelectPokeComponent } from '../../models/page.model';
import { ChargeType, PokemonBattle, PokemonBattleData } from '../models/battle.model';
import { combineClasses, getValueOrDefault, isEmpty, isEqual, isNotEmpty } from '../../../util/extension';

const SelectPoke = (props: ISelectPokeComponent) => {
  const combat = useSelector((state: StoreState) => getValueOrDefault(Array, state.store?.data?.combat));
  const [show, setShow] = useState(false);
  const [showFMove, setShowFMove] = useState(false);
  const [showCMovePri, setShowCMovePri] = useState(false);
  const [showCMoveSec, setShowCMoveSec] = useState(false);

  const [search, setSearch] = useState('');

  const [pokemon, setPokemon] = useState<IBattlePokemonData>();
  const [fMove, setFMove] = useState<ICombat>();
  const [cMovePri, setCMovePri] = useState<ICombat>();
  const [cMoveSec, setCMoveSec] = useState<ICombat>();

  const [pokemonIcon, setPokemonIcon] = useState('');
  const [score, setScore] = useState(0);

  const selectPokemon = (value: IBattlePokemonData) => {
    props.clearData(false);
    let [fMove, cMovePri, cMoveSec] = getValueOrDefault(Array, value.moveset);
    setSearch(splitAndCapitalize(value.pokemon.name, '-', ' '));
    setPokemonIcon(APIService.getPokeIconSprite(getValueOrDefault(String, value.pokemon.sprite)));
    setPokemon(value);

    if (fMove.includes('HIDDEN_POWER')) {
      fMove = 'HIDDEN_POWER';
    }

    const fMoveCombat = combat.find((item) => isEqual(item.name, fMove));
    if (fMoveCombat && value.moveset.at(0)?.includes('HIDDEN_POWER')) {
      fMoveCombat.type = getValueOrDefault(String, value.moveset.at(0)?.split('_').at(2));
    }
    setFMove(fMoveCombat);
    cMovePri = replaceTempMovePvpName(cMovePri);

    const cMovePriCombat = combat.find((item) => isEqual(item.name, cMovePri));
    setCMovePri(cMovePriCombat);
    cMoveSec = replaceTempMovePvpName(cMoveSec);

    const cMoveSecCombat = combat.find((item) => isEqual(item.name, cMoveSec));
    setCMoveSec(cMoveSecCombat);

    const stats = calculateStatsByTag(value.pokemon, value.pokemon.baseStats, value.pokemon.slug);
    let minCP = props.league === 500 ? 0 : props.league === 1500 ? 500 : props.league === 2500 ? 1500 : 2500;
    const maxPokeCP = calculateCP(stats.atk + MAX_IV, stats.def + MAX_IV, getValueOrDefault(Number, stats.sta) + MAX_IV, MAX_LEVEL);

    if (maxPokeCP < minCP) {
      if (maxPokeCP <= 500) {
        minCP = 0;
      } else if (maxPokeCP <= 1500) {
        minCP = 500;
      } else if (maxPokeCP <= 2500) {
        minCP = 1500;
      } else {
        minCP = 2500;
      }
    }
    const allStats = calStatsProd(stats.atk, stats.def, getValueOrDefault(Number, stats.sta), minCP, props.league);

    if (allStats && value && value.pokemon) {
      setScore(value.score);
      props.setPokemonBattle(
        PokemonBattle.create({
          ...props.pokemonBattle,
          pokemonData: PokemonBattleData.create({
            ...value,
            form: getValueOrDefault(String, value.form),
            shadow: getValueOrDefault(Boolean, value.shadow),
            hp: getValueOrDefault(Number, value.stats.hp),
            fMove: fMoveCombat,
            cMove: cMovePriCombat,
            cMoveSec: cMoveSecCombat,
            energy: 0,
            block: 0,
            turn: 0,
            allStats,
            currentStats: allStats[allStats.length - 1],
            bestStats: allStats[allStats.length - 1],
            disableCMovePri: false,
            disableCMoveSec: false,
          }),
          fMove: fMoveCombat,
          cMovePri: cMovePriCombat,
          cMoveSec: cMoveSecCombat,
          audio: {
            fMove: new Audio(APIService.getSoundMove(getValueOrDefault(String, fMoveCombat?.sound))),
            cMovePri: new Audio(APIService.getSoundMove(getValueOrDefault(String, cMovePriCombat?.sound))),
            cMoveSec: new Audio(APIService.getSoundMove(getValueOrDefault(String, cMoveSecCombat?.sound))),
          },
          shadow: value.speciesId.toUpperCase().includes(`_${FORM_SHADOW}`),
        })
      );
    }
  };

  const selectFMove = (value: ICombat | undefined) => {
    props.clearData(false);
    setFMove(value);
    props.setPokemonBattle(
      PokemonBattle.create({
        ...props.pokemonBattle,
        fMove: value,
        audio: { ...props.pokemonBattle.audio, fMove: new Audio(APIService.getSoundMove(getValueOrDefault(String, value?.sound))) },
      })
    );
    setShowFMove(false);
  };

  const selectCMovePri = (value: ICombat | undefined) => {
    props.clearData(false);
    setCMovePri(value);
    props.setPokemonBattle(
      PokemonBattle.create({
        ...props.pokemonBattle,
        cMovePri: value,
        audio: { ...props.pokemonBattle.audio, cMovePri: new Audio(APIService.getSoundMove(getValueOrDefault(String, value?.sound))) },
      })
    );
    setShowCMovePri(false);
  };

  const selectCMoveSec = (value: ICombat | undefined) => {
    props.clearData(false);
    setCMoveSec(value);
    props.setPokemonBattle(
      PokemonBattle.create({
        ...props.pokemonBattle,
        cMoveSec: value,
        audio: { ...props.pokemonBattle.audio, cMoveSec: new Audio(APIService.getSoundMove(getValueOrDefault(String, value?.sound))) },
      })
    );
    setShowCMoveSec(false);
  };

  const removePokemon = useCallback(() => {
    props.clearData(false);
    setPokemonIcon('');
    setPokemon(undefined);
    setSearch('');
    setFMove(undefined);
    setCMovePri(undefined);
    setCMoveSec(undefined);
    setScore(0);
  }, [props.clearData]);

  const removeChargeMoveSec = () => {
    setTimeout(() => setShowCMoveSec(false));
    props.clearData(true);
    setCMoveSec(undefined);
  };

  useEffect(() => {
    if (pokemon && !props.pokemonBattle.pokemonData) {
      removePokemon();
    }
  }, [pokemon, props.pokemonBattle.pokemonData, removePokemon]);

  return (
    <Fragment>
      <h5>Pokémon</h5>
      <div className="border-box-battle position-relative">
        {(score > 0 || !isEmpty(pokemonIcon) || pokemon) && (
          <span className="pokemon-select-right">
            {pokemon?.speciesId.includes('_shadow') && (
              <span style={{ marginRight: 5 }} className="type-icon-small ic shadow-ic">
                {capitalize(FORM_SHADOW)}
              </span>
            )}
            {score > 0 && (
              <span style={{ marginRight: 5 }} className="type-icon-small ic elite-ic">
                {score}
              </span>
            )}
            {!isEmpty(pokemonIcon) && (
              <span onClick={() => removePokemon()} className="remove-pokemon-select">
                <CloseIcon sx={{ color: 'red' }} />
              </span>
            )}
          </span>
        )}
        <input
          className="input-pokemon-select form-control shadow-none"
          onClick={() => setShow(true)}
          onBlur={() => setShow(false)}
          type="text"
          onInput={(e) => setSearch(e.currentTarget.value)}
          placeholder="Enter Name"
          style={{
            background: pokemonIcon ? `url(${pokemonIcon}) left no-repeat` : '',
            paddingLeft: pokemonIcon ? 56 : '',
          }}
          value={search}
        />
      </div>
      {isNotEmpty(props.data) && (
        <div className="result-pokemon" style={{ display: show ? 'block' : 'none', maxHeight: 274 }}>
          {props.data
            .filter((pokemon) => pokemon && splitAndCapitalize(pokemon.pokemon.name, '-', ' ').toLowerCase().includes(search.toLowerCase()))
            .map((value, index) => (
              <div className="card-pokemon-select" key={index} onMouseDown={() => selectPokemon(value)}>
                <CardPokemon
                  value={value.pokemon}
                  score={value.score}
                  isShadow={value.speciesId.toUpperCase().includes(`_${FORM_SHADOW}`)}
                />
              </div>
            ))}
        </div>
      )}
      <h5>Fast Moves</h5>
      <div
        className={combineClasses(
          'position-relative d-flex align-items-center form-control',
          pokemon ? 'card-select-enabled' : 'card-select-disabled'
        )}
        style={{ padding: 0, borderRadius: 0 }}
      >
        <div className="card-move-input" tabIndex={0} onClick={() => setShowFMove(true)} onBlur={() => setShowFMove(false)}>
          <CardMoveSmall value={fMove} show={pokemon ? true : false} select={isNotEmpty(props.data) && props.data.length > 1} />
          {showFMove && isNotEmpty(props.data) && pokemon && (
            <div className="result-move-select">
              <div>
                {props.data
                  .find((value) => isEqual(value.speciesId, pokemon.speciesId))
                  ?.moves.fastMoves.map((value) => {
                    let move = value.moveId;
                    if (move.includes('HIDDEN_POWER')) {
                      move = 'HIDDEN_POWER';
                    }
                    let fMove = combat.find((item) => isEqual(item.name, move));
                    if (fMove && value.moveId.includes('HIDDEN_POWER')) {
                      fMove = Combat.create({ ...fMove, type: getValueOrDefault(String, value.moveId.split('_').at(2)) });
                    }
                    return fMove;
                  })
                  .filter((value) => value && value.name !== fMove?.name)
                  .map((value, index) => (
                    <div className="card-move" key={index} onMouseDown={() => selectFMove(value)}>
                      <CardMoveSmall value={value} />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <h5>Charged Moves Primary</h5>
      <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
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
        <div
          className={combineClasses(
            'position-relative d-flex align-items-center form-control',
            pokemon ? 'card-select-enabled' : 'card-select-disabled'
          )}
          style={{ padding: 0, borderRadius: 0 }}
        >
          <div
            className={combineClasses(
              'card-move-input',
              !pokemon ? '' : props.pokemonBattle.disableCMovePri ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
            tabIndex={0}
            onClick={() => {
              if (!props.pokemonBattle.disableCMovePri) {
                setShowCMovePri(true);
              }
            }}
            onBlur={() => {
              if (!props.pokemonBattle.disableCMovePri) {
                setShowCMovePri(false);
              }
            }}
          >
            <CardMoveSmall
              value={cMovePri}
              show={pokemon ? true : false}
              disable={props.pokemonBattle.disableCMovePri}
              select={isNotEmpty(props.data) && props.data.length > 1}
            />
            {showCMovePri && isNotEmpty(props.data) && pokemon && (
              <div className="result-move-select">
                <div>
                  {props.data
                    .find((value) => isEqual(value.speciesId, pokemon.speciesId))
                    ?.moves.chargedMoves.map((value) => {
                      const move = replaceTempMovePvpName(value.moveId);
                      return combat.find((item) => isEqual(item.name, move));
                    })
                    .filter((value) => value && value.name !== cMovePri?.name && value.name !== cMoveSec?.name)
                    .map((value, index) => (
                      <div
                        className={combineClasses(
                          'card-move',
                          props.pokemonBattle.disableCMovePri ? 'cursor-not-allowed' : 'cursor-pointer'
                        )}
                        key={index}
                        onMouseDown={() => {
                          if (!props.pokemonBattle.disableCMovePri) {
                            selectCMovePri(value);
                          }
                        }}
                      >
                        <CardMoveSmall value={value} />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <h5>Charged Moves Secondary</h5>
      <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
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
        <div
          className={combineClasses(
            'position-relative d-flex align-items-center form-control',
            pokemon ? 'card-select-enabled' : 'card-select-disabled'
          )}
          style={{ padding: 0, borderRadius: 0 }}
        >
          <div
            className={combineClasses(
              'card-move-input',
              !pokemon ? '' : props.pokemonBattle.disableCMoveSec ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
            tabIndex={0}
            onClick={() => {
              if (!props.pokemonBattle.disableCMoveSec) {
                setShowCMoveSec(true);
              }
            }}
            onBlur={() => {
              if (!props.pokemonBattle.disableCMoveSec) {
                setShowCMoveSec(false);
              }
            }}
          >
            <CardMoveSmall
              value={cMoveSec}
              empty={!cMoveSec ? true : false}
              show={pokemon ? true : false}
              clearData={props.pokemonBattle.disableCMovePri ? undefined : removeChargeMoveSec}
              disable={props.pokemonBattle.disableCMoveSec}
              select={isNotEmpty(props.data) && props.data.length > 1}
            />
            {showCMoveSec && isNotEmpty(props.data) && pokemon && (
              <div className="result-move-select">
                <div>
                  {props.data
                    .find((value) => isEqual(value.speciesId, pokemon.speciesId))
                    ?.moves.chargedMoves.map((value) => {
                      const move = replaceTempMovePvpName(value.moveId);
                      return combat.find((item) => isEqual(item.name, move));
                    })
                    .filter((value) => value && (!cMoveSec || value.name !== cMoveSec.name) && value.name !== cMovePri?.name)
                    .map((value, index) => (
                      <div
                        className="card-move"
                        key={index}
                        onMouseDown={() => {
                          if (!props.pokemonBattle.disableCMoveSec) {
                            selectCMoveSec(value);
                          }
                        }}
                      >
                        <CardMoveSmall value={value} />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SelectPoke;
