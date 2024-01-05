import React, { Fragment, useCallback, useEffect, useState } from 'react';
import APIService from '../../../services/API.service';

import { convertName, splitAndCapitalize } from '../../../util/Utils';
import CloseIcon from '@mui/icons-material/Close';
import CardMoveSmall from '../../../components/Card/CardMoveSmall';
import { calculateCP, calculateStatsByTag, calStatsProd } from '../../../util/Calculate';
import CardPokemon from '../../../components/Card/CardPokemon';
import { useSelector } from 'react-redux';
import { Checkbox } from '@mui/material';
import { StoreState } from '../../../store/models/state.model';
import { PokemonDataModel } from '../../../core/models/pokemon.model';
import { MAX_IV, MAX_LEVEL } from '../../../util/Constants';
import { CombatPokemon } from '../../../core/models/combat.model';
import { SelectMoveModel } from '../../../components/Input/models/select-move.model';

const SelectPoke = ({ data, league, pokemonBattle, setPokemonBattle, clearData }: any) => {
  const combat = useSelector((state: StoreState) => state.store?.data?.combat ?? []);
  const pokemonCombat = useSelector((state: StoreState) => state.store?.data?.pokemonCombat ?? []);
  const [show, setShow] = useState(false);
  const [showFMove, setShowFMove] = useState(false);
  const [showCMovePri, setShowCMovePri] = useState(false);
  const [showCMoveSec, setShowCMoveSec] = useState(false);

  const [search, setSearch] = useState('');

  const [pokemon, setPokemon]: any = useState(null);
  const [fMove, setFMove]: [SelectMoveModel | undefined, any] = useState();
  const [cMovePri, setCMovePri]: [SelectMoveModel | undefined, any] = useState();
  const [cMoveSec, setCMoveSec]: [SelectMoveModel | undefined, any] = useState();

  const [pokemonIcon, setPokemonIcon] = useState('');
  const [score, setScore] = useState(0);

  const selectPokemon = (value: { pokemon: PokemonDataModel | undefined; score: number; moveset?: string[]; speciesId: string }) => {
    clearData();
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
    setCMoveSec(cMoveSec);

    const stats = calculateStatsByTag(value.pokemon, value.pokemon?.baseStats, value.pokemon?.slug);
    let minCP = league === 500 ? 0 : league === 1500 ? 500 : league === 2500 ? 1500 : 2500;
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
    const allStats = calStatsProd(stats.atk, stats.def, stats?.sta ?? 0, minCP, league);

    const pokemonCombatResult = pokemonCombat.filter(
      (item) =>
        item.id === value.pokemon?.num &&
        item.baseSpecies === (value.pokemon?.baseSpecies ? convertName(value.pokemon?.baseSpecies) : convertName(value.pokemon?.name))
    );

    const result = pokemonCombatResult.find((item) => item.name === convertName(value.pokemon?.name));
    let combatPoke: CombatPokemon | undefined;
    if (!result && pokemonCombatResult.length > 0) {
      combatPoke = pokemonCombatResult.at(0);
    } else {
      combatPoke = result;
    }

    setScore(value.score);
    setPokemonBattle({
      ...pokemonBattle,
      pokemonData: {
        ...value,
        allStats,
        combatPoke,
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
      shadow: value.speciesId.includes('_shadow'),
    });
  };

  const selectFMove = (value: { sound: string }) => {
    clearData();
    setFMove(value);
    setPokemonBattle({
      ...pokemonBattle,
      fMove: value,
      audio: { ...pokemonBattle.audio, fMove: new Audio(APIService.getSoundMove(value.sound)) },
    });
    setShowFMove(false);
  };

  const selectCMovePri = (value: { sound: string }) => {
    clearData();
    setCMovePri(value);
    setPokemonBattle({
      ...pokemonBattle,
      cMovePri: value,
      audio: { ...pokemonBattle.audio, cMovePri: new Audio(APIService.getSoundMove(value.sound)) },
    });
    setShowCMovePri(false);
  };

  const selectCMoveSec = (value: { sound: string }) => {
    clearData();
    setCMoveSec(value);
    setPokemonBattle({
      ...pokemonBattle,
      cMoveSec: value,
      audio: { ...pokemonBattle.audio, cMoveSec: new Audio(APIService.getSoundMove(value.sound)) },
    });
    setShowCMoveSec(false);
  };

  const removePokemon = useCallback(() => {
    clearData();
    setPokemonIcon('');
    setPokemon(null);
    setSearch('');
    setFMove(null);
    setCMovePri(null);
    setCMoveSec(null);
    setScore(0);
  }, [clearData]);

  const removeChargeMoveSec = () => {
    clearData(true);
    setCMoveSec('');
    setTimeout(() => {
      setShowCMoveSec(false);
    }, 0);
  };

  useEffect(() => {
    if (pokemon && !pokemonBattle.pokemonData) {
      removePokemon();
    }
  }, [pokemon, pokemonBattle.pokemonData, removePokemon]);

  return (
    <Fragment>
      <h5>Pokémon</h5>
      <div className="border-box-battle position-relative">
        {(score || pokemonIcon || pokemon) && (
          <span className="pokemon-select-right">
            {pokemon.speciesId.includes('_shadow') && (
              <span style={{ marginRight: 5 }} className="type-icon-small ic shadow-ic">
                Shadow
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
          onInput={(e: any) => setSearch(e.target.value)}
          placeholder="Enter Name"
          style={{
            background: pokemonIcon ? `url(${pokemonIcon}) left no-repeat` : '',
            paddingLeft: pokemonIcon ? 56 : '',
          }}
          value={search}
        />
      </div>
      {data && (
        <div className="result-pokemon" style={{ display: show ? 'block' : 'none' }}>
          {data
            .filter((pokemon: { pokemon: { name: string } }) =>
              splitAndCapitalize(pokemon.pokemon.name, '-', ' ').toLowerCase().includes(search.toLowerCase())
            )
            .map((value: { pokemon: PokemonDataModel; score: number; speciesId: string }, index: React.Key) => (
              <div className="card-pokemon-select" key={index} onMouseDown={() => selectPokemon(value)}>
                <CardPokemon value={value.pokemon} score={value.score} isShadow={value.speciesId.includes('_shadow')} />
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
          <CardMoveSmall value={fMove} show={pokemon ? true : false} select={data && data.length > 1} />
          {showFMove && data && pokemon && (
            <div className="result-move-select">
              <div>
                {data
                  .find((value: { speciesId: string }) => value.speciesId === pokemon.speciesId)
                  .moves.fastMoves.map((value: { moveId: string }) => {
                    let move = value.moveId;
                    if (move.includes('HIDDEN_POWER')) {
                      move = 'HIDDEN_POWER';
                    }
                    let fmove: any = combat.find((item: { name: string }) => item.name === move);
                    if (value.moveId.includes('HIDDEN_POWER')) {
                      fmove = { ...fmove, type: value.moveId.split('_').at(2) };
                    }
                    return fmove;
                  })
                  .filter((value: { name: string }) => value.name !== fMove?.name)
                  .map((value: any, index: React.Key) => (
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
          checked={!pokemonBattle.disableCMovePri}
          onChange={(_, check) => {
            clearData();
            setPokemonBattle({ ...pokemonBattle, disableCMovePri: !check });
          }}
        />
        <div
          className={
            'position-relative d-flex align-items-center form-control ' + (pokemon ? 'card-select-enabled' : 'card-select-disabled')
          }
          style={{ padding: 0, borderRadius: 0 }}
        >
          <div
            className={'card-move-input ' + (pokemonBattle.disableCMovePri ? 'cursor-not-allowed' : 'cursor-pointer')}
            tabIndex={0}
            onClick={() => {
              if (!pokemonBattle.disableCMovePri) {
                setShowCMovePri(true);
              }
            }}
            onBlur={() => {
              if (!pokemonBattle.disableCMovePri) {
                setShowCMovePri(false);
              }
            }}
          >
            <CardMoveSmall
              value={cMovePri}
              show={pokemon ? true : false}
              disable={pokemonBattle.disableCMovePri}
              select={data && data.length > 1}
            />
            {showCMovePri && data && pokemon && (
              <div className="result-move-select">
                <div>
                  {data
                    .find((value: { speciesId: number }) => value.speciesId === pokemon.speciesId)
                    .moves.chargedMoves.map((value: { moveId: string }) => {
                      let move = value.moveId;
                      if (move === 'FUTURE_SIGHT') {
                        move = 'FUTURESIGHT';
                      }
                      if (move === 'TECHNO_BLAST_DOUSE') {
                        move = 'TECHNO_BLAST_WATER';
                      }
                      return combat.find((item) => item.name === move);
                    })
                    .filter((value: { name: string }) => value.name !== cMovePri?.name && value.name !== cMoveSec?.name)
                    .map((value: any, index: React.Key) => (
                      <div
                        className={'card-move ' + (pokemonBattle.disableCMovePri ? 'cursor-not-allowed' : 'cursor-pointer')}
                        key={index}
                        onMouseDown={() => {
                          if (!pokemonBattle.disableCMovePri) {
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
          checked={!pokemonBattle.disableCMoveSec}
          onChange={(_, check) => {
            clearData();
            setPokemonBattle({ ...pokemonBattle, disableCMoveSec: !check });
          }}
        />
        <div
          className={
            'position-relative d-flex align-items-center form-control ' + (pokemon ? 'card-select-enabled' : 'card-select-disabled')
          }
          style={{ padding: 0, borderRadius: 0 }}
        >
          <div
            className={'card-move-input ' + (pokemonBattle.disableCMoveSec ? 'cursor-not-allowed' : 'cursor-pointer')}
            tabIndex={0}
            onClick={() => {
              if (!pokemonBattle.disableCMoveSec) {
                setShowCMoveSec(true);
              }
            }}
            onBlur={() => {
              if (!pokemonBattle.disableCMoveSec) {
                setShowCMoveSec(false);
              }
            }}
          >
            <CardMoveSmall
              value={cMoveSec}
              empty={!cMoveSec ? true : false}
              show={pokemon ? true : false}
              clearData={pokemonBattle.disableCMovePri ? undefined : removeChargeMoveSec}
              disable={pokemonBattle.disableCMoveSec}
              select={data && data.length > 1}
            />
            {showCMoveSec && data && pokemon && (
              <div className="result-move-select">
                <div>
                  {data
                    .find((value: { speciesId: number }) => value.speciesId === pokemon.speciesId)
                    .moves.chargedMoves.map((value: { moveId: string }) => {
                      let move = value.moveId;
                      if (move === 'FUTURE_SIGHT') {
                        move = 'FUTURESIGHT';
                      }
                      if (move === 'TECHNO_BLAST_DOUSE') {
                        move = 'TECHNO_BLAST_WATER';
                      }
                      return combat.find((item) => item.name === move);
                    })
                    .filter((value: { name: string }) => (!cMoveSec || value.name !== cMoveSec?.name) && value.name !== cMovePri?.name)
                    .map((value: any, index: React.Key) => (
                      <div
                        className="card-move"
                        key={index}
                        onMouseDown={() => {
                          if (!pokemonBattle.disableCMoveSec) {
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
