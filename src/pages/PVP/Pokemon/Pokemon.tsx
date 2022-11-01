import pokemonData from '../../../data/pokemon.json';

import '../PVP.css';
import React, { Fragment, useEffect, useRef, useState } from 'react';

import { capitalize, convertName, convertNameRankingToOri, splitAndCapitalize } from '../../../util/Utils';
import { Link, useParams } from 'react-router-dom';
import APIService from '../../../services/API.service';
import TypeInfo from '../../../components/Sprites/Type/Type';
import { calculateCP, calculateStatsByTag, calStatsProd } from '../../../util/Calculate';
import { computeBgType, findAssetForm } from '../../../util/Compute';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';

import Error from '../../Error/Error';
import { Keys, MoveSet, OverAllStats, TypeEffective } from '../Model';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../../store/actions/spinner.action';

const PokemonPVP = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: RootStateOrAny) => state.store.data);
  const params: any = useParams();

  const [rankingPoke, setRankingPoke]: any = useState(null);
  const storeStats = useRef(null);
  const statsRanking = useSelector((state: RootStateOrAny) => state.stats);
  const [found, setFound] = useState(true);

  useEffect(() => {
    const axios = APIService;
    const cancelToken = axios.getAxios().CancelToken;
    const source = cancelToken.source();
    const fetchPokemon = async () => {
      dispatch(showSpinner());
      try {
        const cp = parseInt(params.cp);
        const paramName = params.pokemon.replaceAll('-', '_').toLowerCase();
        const data = (
          await axios.getFetchUrl(axios.getRankingFile(paramName.includes('_mega') ? 'mega' : 'all', cp, params.type), {
            cancelToken: source.token,
          })
        ).data.find((pokemon: { speciesId: any }) => pokemon.speciesId === paramName);

        const name = convertNameRankingToOri(data.speciesId, data.speciesName);
        const pokemon: any = Object.values(pokemonData).find((pokemon) => pokemon.slug === name);
        const id = pokemon.num;
        const form = findAssetForm(dataStore.assets, pokemon.num, pokemon.name);
        document.title = `#${id} ${splitAndCapitalize(name, '-', ' ')} - ${
          cp === 500 ? 'Little Cup' : cp === 1500 ? 'Great League' : cp === 2500 ? 'Ultra League' : 'Master League'
        } (${capitalize(params.type)})`;

        const stats = calculateStatsByTag(pokemon.baseStats, pokemon.slug);

        let fmoveData = data.moveset[0],
          cMoveDataPri = data.moveset[1],
          cMoveDataSec = data.moveset[2];
        if (fmoveData.includes('HIDDEN_POWER')) {
          fmoveData = 'HIDDEN_POWER';
        }
        if (cMoveDataPri === 'FUTURE_SIGHT') {
          cMoveDataPri = 'FUTURESIGHT';
        }
        if (cMoveDataSec === 'FUTURE_SIGHT') {
          cMoveDataSec = 'FUTURESIGHT';
        }
        if (cMoveDataPri === 'TECHNO_BLAST_DOUSE') {
          cMoveDataPri = 'TECHNO_BLAST_WATER';
        }
        if (cMoveDataSec === 'TECHNO_BLAST_DOUSE') {
          cMoveDataSec = 'TECHNO_BLAST_WATER';
        }

        let fmove = dataStore.combat.find((item: { name: any }) => item.name === fmoveData);
        const cmovePri = dataStore.combat.find((item: { name: any }) => item.name === cMoveDataPri);
        let cmoveSec;
        if (cMoveDataSec) {
          cmoveSec = dataStore.combat.find((item: { name: any }) => item.name === cMoveDataSec);
        }

        if (data.moveset[0].includes('HIDDEN_POWER')) {
          fmove = { ...fmove, type: data.moveset[0].split('_')[2] };
        }

        let combatPoke = dataStore.pokemonCombat.filter(
          (item: { id: number; baseSpecies: string }) =>
            item.id === pokemon.num &&
            item.baseSpecies === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
        );
        const result = combatPoke.find((item: { name: string }) => item.name === convertName(pokemon.name));
        if (!result) {
          combatPoke = combatPoke[0];
        } else {
          combatPoke = result;
        }

        const maxCP = parseInt(params.cp);

        let bestStats: any = storeStats.current;
        if (!bestStats) {
          if (maxCP === 10000) {
            const cp = calculateCP(stats.atk + 15, stats.def + 15, stats.sta + 15, 50);
            const buddyCP = calculateCP(stats.atk + 15, stats.def + 15, stats.sta + 15, 51);
            bestStats = {
              '50': { cp },
              '51': { cp: buddyCP },
            };
          } else {
            const minCP = maxCP === 500 ? 0 : maxCP === 1500 ? 500 : maxCP === 2500 ? 1500 : 2500;
            const allStats = calStatsProd(stats.atk, stats.def, stats.sta, minCP, maxCP);
            bestStats = allStats[allStats.length - 1];
          }
        }

        setRankingPoke({
          data,
          id,
          name,
          pokemon,
          form,
          stats,
          atk: statsRanking.attack.ranking.find((i: { attack: number }) => i.attack === stats.atk),
          def: statsRanking.defense.ranking.find((i: { defense: number }) => i.defense === stats.def),
          sta: statsRanking.stamina.ranking.find((i: { stamina: number }) => i.stamina === stats.sta),
          scores: data.scores,
          combatPoke,
          fmove,
          cmovePri,
          cmoveSec,
          bestStats,
          shadow: data.speciesName.includes('(Shadow)'),
          purified: combatPoke.purifiedMoves.includes(cmovePri) || (cMoveDataSec && combatPoke.purifiedMoves.includes(cMoveDataSec)),
        });
      } catch (e: any) {
        source.cancel();
        setFound(false);
      }
      dispatch(hideSpinner());
    };
    fetchPokemon();
  }, [dispatch, params.cp, params.type, params.pokemon, dataStore]);

  const renderLeague = () => {
    const cp = parseInt(params.cp);
    const league = dataStore.pvp.rankings.find((item: { id: string; cp: number[] }) => item.id === 'all' && item.cp.includes(cp));
    return (
      <Fragment>
        {league && (
          <div className="d-flex flex-wrap align-items-center filter-shadow text-shadow text-white" style={{ columnGap: 10 }}>
            <img
              alt="img-league"
              width={64}
              height={64}
              src={
                !league.logo
                  ? cp === 500
                    ? APIService.getPokeOtherLeague('GBL_littlecup')
                    : cp === 1500
                    ? APIService.getPokeLeague('great_league')
                    : cp === 2500
                    ? APIService.getPokeLeague('ultra_league')
                    : APIService.getPokeLeague('master_league')
                  : APIService.getAssetPokeGo(league.logo)
              }
            />
            <h2>
              <b>
                {league.name === 'All'
                  ? cp === 500
                    ? 'Little Cup'
                    : cp === 1500
                    ? 'Great league'
                    : cp === 2500
                    ? 'Ultra league'
                    : 'Master league'
                  : league.name}
              </b>
            </h2>
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <Fragment>
      {!found ? (
        <Error />
      ) : (
        <Fragment>
          {rankingPoke && (
            <Fragment>
              <div
                style={{
                  backgroundImage: computeBgType(rankingPoke.pokemon.types, rankingPoke.shadow, rankingPoke.purified, 0.8),
                  paddingTop: 15,
                  paddingBottom: 15,
                }}
              >
                <div className="pokemon-ranking-body container pvp-container">
                  {renderLeague()}
                  <hr />
                  <div className="ranking-link-group" style={{ paddingTop: 10 }}>
                    <Link
                      className={'btn btn-primary' + (params.type.toLowerCase() === 'overall' ? ' active' : '')}
                      to={`/pvp/${params.cp}/overall/${params.pokemon}`}
                    >
                      Overall
                    </Link>
                    <Link
                      className={'btn btn-primary' + (params.type.toLowerCase() === 'leads' ? ' active' : '')}
                      to={`/pvp/${params.cp}/leads/${params.pokemon}`}
                    >
                      Leads
                    </Link>
                    <Link
                      className={'btn btn-primary' + (params.type.toLowerCase() === 'closers' ? ' active' : '')}
                      to={`/pvp/${params.cp}/closers/${params.pokemon}`}
                    >
                      Closers
                    </Link>
                    <Link
                      className={'btn btn-primary' + (params.type.toLowerCase() === 'switches' ? ' active' : '')}
                      to={`/pvp/${params.cp}/switches/${params.pokemon}`}
                    >
                      Switches
                    </Link>
                    <Link
                      className={'btn btn-primary' + (params.type.toLowerCase() === 'chargers' ? ' active' : '')}
                      to={`/pvp/${params.cp}/chargers/${params.pokemon}`}
                    >
                      Chargers
                    </Link>
                    <Link
                      className={'btn btn-primary' + (params.type.toLowerCase() === 'attackers' ? ' active' : '')}
                      to={`/pvp/${params.cp}/attackers/${params.pokemon}`}
                    >
                      Attackers
                    </Link>
                    <Link
                      className={'btn btn-primary' + (params.type.toLowerCase() === 'consistency' ? ' active' : '')}
                      to={`/pvp/${params.cp}/consistency/${params.pokemon}`}
                    >
                      Consistency
                    </Link>
                  </div>
                  <div className="w-100 ranking-info element-top">
                    <div className="d-flex flex-wrap align-items-center justify-content-center" style={{ gap: '2rem' }}>
                      <div className="position-relative filter-shadow" style={{ width: 128 }}>
                        {rankingPoke.shadow && (
                          <img height={64} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
                        )}
                        {rankingPoke.purified && (
                          <img height={64} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()} />
                        )}
                        <img
                          alt="img-league"
                          className="pokemon-sprite-raid"
                          src={
                            rankingPoke.form ? APIService.getPokemonModel(rankingPoke.form) : APIService.getPokeFullSprite(rankingPoke.id)
                          }
                        />
                      </div>
                      <div>
                        <div className="d-flex flex-wrap align-items-center" style={{ gap: 15 }}>
                          <h3 className="text-white text-shadow">
                            <b>
                              #{rankingPoke.id} {splitAndCapitalize(rankingPoke.name, '-', ' ')}
                            </b>
                          </h3>
                          <TypeInfo shadow={true} block={true} color={'white'} arr={rankingPoke.pokemon.types} />
                        </div>
                        <h6 className="text-white text-shadow" style={{ textDecoration: 'underline' }}>
                          Recommend Moveset in PVP
                        </h6>
                        <div className="d-flex flex-wrap element-top" style={{ columnGap: 10 }}>
                          <TypeBadge
                            grow={true}
                            find={true}
                            title="Fast Move"
                            color={'white'}
                            move={rankingPoke.fmove}
                            elite={rankingPoke.combatPoke.eliteQuickMoves.includes(rankingPoke.fmove.name)}
                          />
                          <TypeBadge
                            grow={true}
                            find={true}
                            title="Primary Charged Move"
                            color={'white'}
                            move={rankingPoke.cmovePri}
                            elite={rankingPoke.combatPoke.eliteCinematicMoves.includes(rankingPoke.cmovePri.name)}
                            shadow={rankingPoke.combatPoke.shadowMoves.includes(rankingPoke.cmovePri.name)}
                            purified={rankingPoke.combatPoke.purifiedMoves.includes(rankingPoke.cmovePri.name)}
                          />
                          {rankingPoke.cmoveSec && (
                            <TypeBadge
                              grow={true}
                              find={true}
                              title="Secondary Charged Move"
                              color={'white'}
                              move={rankingPoke.cmoveSec}
                              elite={rankingPoke.combatPoke.eliteCinematicMoves.includes(rankingPoke.cmoveSec.name)}
                              shadow={rankingPoke.combatPoke.shadowMoves.includes(rankingPoke.cmoveSec.name)}
                              purified={rankingPoke.combatPoke.purifiedMoves.includes(rankingPoke.cmoveSec.name)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <hr />
                    {Keys(dataStore.assets, Object.values(pokemonData), rankingPoke.data, params.cp, params.type)}
                  </div>
                  <div className="container">
                    <hr />
                  </div>
                  <div className="stats-container">{OverAllStats(rankingPoke, dataStore.candy, statsRanking, params.cp)}</div>
                  <div className="container">
                    <hr />
                    {TypeEffective(rankingPoke.pokemon.types)}
                  </div>
                  <div className="container">{MoveSet(rankingPoke.data.moves, rankingPoke.combatPoke, dataStore.combat)}</div>
                </div>
              </div>
            </Fragment>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default PokemonPVP;
