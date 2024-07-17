import React, { Fragment, useCallback, useEffect, useState } from 'react';
import APIService from '../../../services/API.service';

import { capitalize, splitAndCapitalize } from '../../../util/Utils';
import CloseIcon from '@mui/icons-material/Close';
import CardMoveSmall from '../../../components/Card/CardMoveSmall';
import { calculateCP, calculateStatsByTag, calStatsProd } from '../../../util/Calculate';
import CardPokemon from '../../../components/Card/CardPokemon';
import { useSelector } from 'react-redux';
import { Checkbox } from '@mui/material';
import { StoreState } from '../../../store/models/state.model';
import { FORM_SHADOW, MAX_IV, MAX_LEVEL } from '../../../util/Constants';
import { ICombat } from '../../../core/models/combat.model';
import { BattlePokemonData } from '../../../core/models/pvp.model';
import { IPokemonBattle } from '../models/battle.model';

const SelectPoke = (props: {
  data: BattlePokemonData[];
  league: number;
  pokemonBattle: IPokemonBattle;
  setPokemonBattle: React.Dispatch<React.SetStateAction<IPokemonBattle>>;
  // eslint-disable-next-line no-unused-vars
  clearData: (removeMove: boolean) => void;
}) => {
  const combat = useSelector((state: StoreState) => state.store?.data?.combat ?? []);
  const [show, setShow] = useState(false);
  const [showFMove, setShowFMove] = useState(false);
  const [showCMovePri, setShowCMovePri] = useState(false);
  const [showCMoveSec, setShowCMoveSec] = useState(false);

  const [search, setSearch] = useState('');

  const [pokemon, setPokemon]: [BattlePokemonData | undefined, React.Dispatch<React.SetStateAction<BattlePokemonData | undefined>>] =
    useState();
  const [fMove, setFMove]: [ICombat | undefined, React.Dispatch<React.SetStateAction<ICombat | undefined>>] = useState();
  const [cMovePri, setCMovePri]: [ICombat | undefined, React.Dispatch<React.SetStateAction<ICombat | undefined>>] = useState();
  const [cMoveSec, setCMoveSec]: [ICombat | undefined, React.Dispatch<React.SetStateAction<ICombat | undefined>>] = useState();

  const [pokemonIcon, setPokemonIcon] = useState('');
  const [score, setScore] = useState(0);

  const selectPokemon = (value: BattlePokemonData) => {
    props.clearData(false);
    let [fMove, cMovePri, cMoveSec] = value.moveset ?? [];
    setSearch(splitAndCapitalize(value.pokemon?.name, '-', ' '));
    setPokemonIcon(APIService.getPokeIconSprite(value.pokemon?.sprite ?? ''));
    setPokemon(value);

    if (fMove.includes('HIDDEN_POWER')) {
      fMove = 'HIDDEN_POWER';
    }

    const fMoveCombat = combat.find((item) => item.name === fMove);
    if (fMoveCombat && value.moveset?.at(0)?.includes('HIDDEN_POWER')) {
      fMoveCombat.type = value.moveset?.at(0)?.split('_').at(2) ?? '';
    }
    setFMove(fMoveCombat);

    if (cMovePri === 'FUTURE_SIGHT') {
      cMovePri = 'FUTURESIGHT';
    }
    if (cMovePri === 'TECHNO_BLAST_DOUSE') {
      cMovePri = 'TECHNO_BLAST_WATER';
    }
    const cMovePriCombat = combat.find((item) => item.name === cMovePri);
    setCMovePri(cMovePriCombat);

    if (cMoveSec === 'FUTURE_SIGHT') {
      cMoveSec = 'FUTURESIGHT';
    }
    if (cMoveSec === 'TECHNO_BLAST_DOUSE') {
      cMoveSec = 'TECHNO_BLAST_WATER';
    }
    const cMoveSecCombat = combat.find((item) => item.name === cMoveSec);
    setCMoveSec(cMoveSecCombat);

    const stats = calculateStatsByTag(value.pokemon, value.pokemon?.baseStats, value.pokemon?.slug);
    let minCP = props.league === 500 ? 0 : props.league === 1500 ? 500 : props.league === 2500 ? 1500 : 2500;
    const maxPokeCP = calculateCP(stats.atk + MAX_IV, stats.def + MAX_IV, (stats?.sta ?? 0) + MAX_IV, MAX_LEVEL);

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
    const allStats = calStatsProd(stats.atk, stats.def, stats?.sta ?? 0, minCP, props.league);

    if (allStats && value && value.pokemon) {
      setScore(value.score);
      props.setPokemonBattle({
        ...props.pokemonBattle,
        pokemonData: {
          ...value,
          form: value.form ?? '',
          shadow: value.shadow ?? false,
          hp: value.stats.hp ?? 0,
          fmove: fMoveCombat ?? null,
          cmove: cMovePriCombat ?? null,
          cmoveSec: cMoveSecCombat ?? null,
          energy: 0,
          block: 0,
          turn: 0,
          allStats,
          currentStats: allStats[allStats.length - 1],
          bestStats: allStats[allStats.length - 1],
        },
        fMove: fMoveCombat,
        cMovePri: cMovePriCombat,
        cMoveSec: cMoveSecCombat,
        audio: {
          fMove: new Audio(APIService.getSoundMove(fMoveCombat?.sound ?? '')),
          cMovePri: new Audio(APIService.getSoundMove(cMovePriCombat?.sound ?? '')),
          cMoveSec: new Audio(APIService.getSoundMove(cMoveSecCombat?.sound ?? '')),
        },
        shadow: value.speciesId.toUpperCase().includes(`_${FORM_SHADOW}`),
      });
    }
  };

  const selectFMove = (value: ICombat | undefined) => {
    props.clearData(false);
    setFMove(value);
    props.setPokemonBattle({
      ...props.pokemonBattle,
      fMove: value,
      audio: { ...props.pokemonBattle.audio, fMove: new Audio(APIService.getSoundMove(value?.sound ?? '')) },
    });
    setShowFMove(false);
  };

  const selectCMovePri = (value: ICombat | undefined) => {
    props.clearData(false);
    setCMovePri(value);
    props.setPokemonBattle({
      ...props.pokemonBattle,
      cMovePri: value,
      audio: { ...props.pokemonBattle.audio, cMovePri: new Audio(APIService.getSoundMove(value?.sound ?? '')) },
    });
    setShowCMovePri(false);
  };

  const selectCMoveSec = (value: ICombat | undefined) => {
    props.clearData(false);
    setCMoveSec(value);
    props.setPokemonBattle({
      ...props.pokemonBattle,
      cMoveSec: value,
      audio: { ...props.pokemonBattle.audio, cMoveSec: new Audio(APIService.getSoundMove(value?.sound ?? '')) },
    });
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
    props.clearData(true);
    setCMoveSec(undefined);
    setTimeout(() => {
      setShowCMoveSec(false);
    }, 0);
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
        {(score || pokemonIcon || pokemon) && (
          <span className="pokemon-select-right">
            {pokemon?.speciesId.includes('_shadow') && (
              <span style={{ marginRight: 5 }} className="type-icon-small ic shadow-ic">
                {capitalize(FORM_SHADOW)}
              </span>
            )}
            {score && (
              <span style={{ marginRight: 5 }} className="type-icon-small ic elite-ic">
                {score}
              </span>
            )}
            {pokemonIcon && (
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
      {props.data && (
        <div className="result-pokemon" style={{ display: show ? 'block' : 'none', maxHeight: 274 }}>
          {props.data
            .filter((pokemon) => splitAndCapitalize(pokemon.pokemon.name, '-', ' ').toLowerCase().includes(search.toLowerCase()))
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
        className={'position-relative d-flex align-items-center form-control ' + (pokemon ? 'card-select-enabled' : 'card-select-disabled')}
        style={{ padding: 0, borderRadius: 0 }}
      >
        <div className="card-move-input" tabIndex={0} onClick={() => setShowFMove(true)} onBlur={() => setShowFMove(false)}>
          <CardMoveSmall value={fMove} show={pokemon ? true : false} select={props.data && props.data.length > 1} />
          {showFMove && props.data && pokemon && (
            <div className="result-move-select">
              <div>
                {props.data
                  .find((value) => value.speciesId === pokemon.speciesId)
                  ?.moves.fastMoves.map((value) => {
                    let move = value.moveId;
                    if (move.includes('HIDDEN_POWER')) {
                      move = 'HIDDEN_POWER';
                    }
                    let fmove = combat.find((item) => item.name === move);
                    if (fmove && value.moveId.includes('HIDDEN_POWER')) {
                      fmove = { ...fmove, type: value.moveId.split('_').at(2) ?? '' };
                    }
                    return fmove;
                  })
                  .filter((value) => value?.name !== fMove?.name)
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
            props.setPokemonBattle({ ...props.pokemonBattle, disableCMovePri: !check });
          }}
        />
        <div
          className={
            'position-relative d-flex align-items-center form-control ' + (pokemon ? 'card-select-enabled' : 'card-select-disabled')
          }
          style={{ padding: 0, borderRadius: 0 }}
        >
          <div
            className={'card-move-input ' + (props.pokemonBattle.disableCMovePri ? 'cursor-not-allowed' : 'cursor-pointer')}
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
              select={props.data && props.data.length > 1}
            />
            {showCMovePri && props.data && pokemon && (
              <div className="result-move-select">
                <div>
                  {props.data
                    .find((value) => value.speciesId === pokemon.speciesId)
                    ?.moves.chargedMoves.map((value) => {
                      let move = value.moveId;
                      if (move === 'FUTURE_SIGHT') {
                        move = 'FUTURESIGHT';
                      }
                      if (move === 'TECHNO_BLAST_DOUSE') {
                        move = 'TECHNO_BLAST_WATER';
                      }
                      return combat.find((item) => item.name === move);
                    })
                    .filter((value) => value?.name !== cMovePri?.name && value?.name !== cMoveSec?.name)
                    .map((value, index) => (
                      <div
                        className={'card-move ' + (props.pokemonBattle.disableCMovePri ? 'cursor-not-allowed' : 'cursor-pointer')}
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
            props.setPokemonBattle({ ...props.pokemonBattle, disableCMoveSec: !check });
          }}
        />
        <div
          className={
            'position-relative d-flex align-items-center form-control ' + (pokemon ? 'card-select-enabled' : 'card-select-disabled')
          }
          style={{ padding: 0, borderRadius: 0 }}
        >
          <div
            className={'card-move-input ' + (props.pokemonBattle.disableCMoveSec ? 'cursor-not-allowed' : 'cursor-pointer')}
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
              select={props.data && props.data.length > 1}
            />
            {showCMoveSec && props.data && pokemon && (
              <div className="result-move-select">
                <div>
                  {props.data
                    .find((value) => value.speciesId === pokemon.speciesId)
                    ?.moves.chargedMoves.map((value) => {
                      let move = value.moveId;
                      if (move === 'FUTURE_SIGHT') {
                        move = 'FUTURESIGHT';
                      }
                      if (move === 'TECHNO_BLAST_DOUSE') {
                        move = 'TECHNO_BLAST_WATER';
                      }
                      return combat.find((item) => item.name === move);
                    })
                    .filter((value) => (!cMoveSec || value?.name !== cMoveSec?.name) && value?.name !== cMovePri?.name)
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
