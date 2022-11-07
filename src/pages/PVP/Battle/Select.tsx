import React, { Fragment, useCallback, useEffect, useState } from 'react';
import APIService from '../../../services/API.service';

import { splitAndCapitalize } from '../../../util/Utils';
import CloseIcon from '@mui/icons-material/Close';
import CardMoveSmall from '../../../components/Card/CardMoveSmall';
import { calculateStatsByTag, calStatsProd } from '../../../util/Calculate';
import CardPokemon from '../../../components/Card/CardPokemon';
import { RootStateOrAny, useSelector } from 'react-redux';
import { Checkbox } from '@mui/material';

const SelectPoke = ({ data, league, pokemonBattle, setPokemonBattle, clearData }: any) => {
  const combat = useSelector((state: RootStateOrAny) => state.store.data.combat);
  const [show, setShow] = useState(false);
  const [showFMove, setShowFMove] = useState(false);
  const [showCMovePri, setShowCMovePri] = useState(false);
  const [showCMoveSec, setShowCMoveSec] = useState(false);

  const [search, setSearch] = useState('');

  const [pokemon, setPokemon]: any = useState(null);
  const [fMove, setFMove]: any = useState(null);
  const [cMovePri, setCMovePri]: any = useState(null);
  const [cMoveSec, setCMoveSec]: any = useState(null);

  const [pokemonIcon, setPokemonIcon]: any = useState(null);
  const [score, setScore]: any = useState(null);

  const selectPokemon = (value: any) => {
    clearData();
    let [fMove, cMovePri, cMoveSec] = value.moveset;
    setSearch(splitAndCapitalize(value.pokemon.name, '-', ' '));
    setPokemonIcon(APIService.getPokeIconSprite(value.pokemon.sprite));
    setPokemon(value);

    if (fMove.includes('HIDDEN_POWER')) {
      fMove = 'HIDDEN_POWER';
    }

    let fmove = combat.find((item: { name: any }) => item.name === fMove);
    if (value.moveset[0].includes('HIDDEN_POWER')) {
      fmove = { ...fmove, type: value.moveset[0].split('_')[2] };
    }
    setFMove(fmove);

    if (cMovePri === 'FUTURE_SIGHT') {
      cMovePri = 'FUTURESIGHT';
    }
    if (cMovePri === 'TECHNO_BLAST_DOUSE') {
      cMovePri = 'TECHNO_BLAST_WATER';
    }
    cMovePri = combat.find((item: { name: any }) => item.name === cMovePri);
    setCMovePri(cMovePri);

    if (cMoveSec === 'FUTURE_SIGHT') {
      cMoveSec = 'FUTURESIGHT';
    }
    if (cMoveSec === 'TECHNO_BLAST_DOUSE') {
      cMoveSec = 'TECHNO_BLAST_WATER';
    }
    cMoveSec = combat.find((item: { name: any }) => item.name === cMoveSec);
    setCMoveSec(cMoveSec);

    const stats = calculateStatsByTag(value.pokemon.baseStats, value.pokemon.slug);
    const minCP = league === 500 ? 0 : league === 1500 ? 500 : league === 2500 ? 1500 : 2500;
    const allStats = calStatsProd(stats.atk, stats.def, stats.sta, minCP, league);

    setScore(value.score);
    setPokemonBattle({
      ...pokemonBattle,
      pokemonData: {
        ...value,
        allStats,
        currentStats: allStats[allStats.length - 1],
        bestStats: allStats[allStats.length - 1],
      },
      fMove: fmove,
      cMovePri,
      cMoveSec,
      audio: {
        fMove: new Audio(APIService.getSoundMove(fmove.sound)),
        cMovePri: new Audio(APIService.getSoundMove(cMovePri.sound)),
        cMoveSec: new Audio(APIService.getSoundMove(cMoveSec.sound)),
      },
    });
  };

  const selectFMove = (value: any) => {
    clearData();
    setFMove(value);
    setPokemonBattle({
      ...pokemonBattle,
      fMove: value,
      audio: { ...pokemonBattle.audio, fMove: new Audio(APIService.getSoundMove(value.sound)) },
    });
    setShowFMove(false);
  };

  const selectCMovePri = (value: any) => {
    clearData();
    setCMovePri(value);
    setPokemonBattle({
      ...pokemonBattle,
      cMovePri: value,
      audio: { ...pokemonBattle.audio, cMovePri: new Audio(APIService.getSoundMove(value.sound)) },
    });
    setShowCMovePri(false);
  };

  const selectCMoveSec = (value: any) => {
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
    setPokemonIcon(null);
    setPokemon(null);
    setSearch('');
    setFMove(null);
    setCMovePri(null);
    setCMoveSec(null);
    setScore(null);
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
        {(score || pokemonIcon) && (
          <span className="pokemon-select-right">
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
            .map((value: { pokemon: { sprite: string; name: string }; score: number }, index: React.Key) => (
              <div className="card-pokemon-select" key={index} onMouseDown={() => selectPokemon(value)}>
                <CardPokemon value={value.pokemon} score={value.score} />
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
                  .find((value: { speciesId: any }) => value.speciesId === pokemon.speciesId)
                  .moves.fastMoves.map((value: { moveId: string }) => {
                    let move = value.moveId;
                    if (move.includes('HIDDEN_POWER')) {
                      move = 'HIDDEN_POWER';
                    }
                    let fmove = combat.find((item: { name: any }) => item.name === move);
                    if (value.moveId.includes('HIDDEN_POWER')) {
                      fmove = { ...fmove, type: value.moveId.split('_')[2] };
                    }
                    return fmove;
                  })
                  .filter((value: { name: any }) => value.name !== fMove.name)
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
          onChange={(event, check) => {
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
                    .find((value: { speciesId: any }) => value.speciesId === pokemon.speciesId)
                    .moves.chargedMoves.map((value: { moveId: any }) => {
                      let move = value.moveId;
                      if (move === 'FUTURE_SIGHT') {
                        move = 'FUTURESIGHT';
                      }
                      if (move === 'TECHNO_BLAST_DOUSE') {
                        move = 'TECHNO_BLAST_WATER';
                      }
                      return combat.find((item: { name: any }) => item.name === move);
                    })
                    .filter((value: { name: any }) => value.name !== cMovePri.name && value.name !== cMoveSec.name)
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
          onChange={(event, check) => {
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
              empty={cMoveSec === ''}
              show={pokemon ? true : false}
              clearData={pokemonBattle.disableCMovePri ? false : removeChargeMoveSec}
              disable={pokemonBattle.disableCMoveSec}
              select={data && data.length > 1}
            />
            {showCMoveSec && data && pokemon && (
              <div className="result-move-select">
                <div>
                  {data
                    .find((value: { speciesId: any }) => value.speciesId === pokemon.speciesId)
                    .moves.chargedMoves.map((value: { moveId: any }) => {
                      let move = value.moveId;
                      if (move === 'FUTURE_SIGHT') {
                        move = 'FUTURESIGHT';
                      }
                      if (move === 'TECHNO_BLAST_DOUSE') {
                        move = 'TECHNO_BLAST_WATER';
                      }
                      return combat.find((item: { name: any }) => item.name === move);
                    })
                    .filter((value: { name: any }) => (cMoveSec === '' || value.name !== cMoveSec.name) && value.name !== cMovePri.name)
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
