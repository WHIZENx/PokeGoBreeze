import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import TypeEffectiveSelect from '../../components/Effective/TypeEffectiveSelect';
import Stats from '../../components/Info/Stats/Stats';
import Hexagon from '../../components/Sprites/Hexagon/Hexagon';
import IVbar from '../../components/Sprites/IVBar/IVBar';
import TypeInfo from '../../components/Sprites/Type/Type';
import APIService from '../../services/API.service';
import { calculateCP, calStatsProd } from '../../util/Calculate';
import { computeBgType, findAssetForm } from '../../util/Compute';
import { convertNameRankingToForm, convertNameRankingToOri, splitAndCapitalize } from '../../util/Utils';

import CircleIcon from '@mui/icons-material/Circle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import StairsIcon from '@mui/icons-material/Stairs';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BoltIcon from '@mui/icons-material/Bolt';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import SpokeIcon from '@mui/icons-material/Spoke';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import PersonIcon from '@mui/icons-material/Person';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { OverlayTrigger } from 'react-bootstrap';
import PopoverConfig from '../../components/Popover/PopoverConfig';
import CandyXL from '../../components/Sprites/Candy/CandyXL';
import { StatsModel, StatsPokemon } from '../../core/models/stats.model';
import { Asset } from '../../core/models/asset.model';
import { PokemonDataModel } from '../../core/models/pokemon.model';
import { Combat, CombatPokemon } from '../../core/models/combat.model';
import { MAX_IV, MAX_LEVEL } from '../../util/Constants';
import { PokemonRankingMove, RankingsPVP } from '../../core/models/pvp.model';
import { PokemonBattleRanking } from './models/battle.model';

export const Keys = (
  assets: Asset[],
  pokemonData: PokemonDataModel[],
  data: RankingsPVP | undefined,
  cp: string | undefined,
  type: string | undefined
) => {
  const renderItemList = (
    data: {
      opponent: string;
      rating: number;
    },
    bgtype: number
  ) => {
    const name = convertNameRankingToOri(data?.opponent, convertNameRankingToForm(data?.opponent));
    const pokemon = pokemonData.find((pokemon) => pokemon.slug === name);
    const id = pokemon?.num;
    const form = findAssetForm(assets, pokemon?.num, pokemon?.name);

    return (
      <Link
        to={`/pvp/${cp}/${type}/${data?.opponent.replaceAll('_', '-')}`}
        className="list-item-ranking"
        style={{ backgroundImage: computeBgType(pokemon?.types, data?.opponent.includes('_shadow')) }}
      >
        <div className="container d-flex align-items-center" style={{ columnGap: 10 }}>
          <div className="d-flex justify-content-center">
            <span className="d-inline-block position-relative filter-shadow" style={{ width: 50 }}>
              {data?.opponent.includes('_shadow') && (
                <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
              )}
              <img
                alt="img-league"
                className="pokemon-sprite-accordion"
                src={form ? APIService.getPokemonModel(form) : APIService.getPokeFullSprite(id)}
              />
            </span>
          </div>
          <div>
            <b className="text-white text-shadow">
              #{id} {splitAndCapitalize(name, '-', ' ')}
            </b>
            <TypeInfo shadow={true} hideText={true} height={20} arr={pokemon?.types} />
          </div>
        </div>
        <div style={{ marginRight: 15 }}>
          <span
            className="ranking-score score-ic text-white text-shadow filter-shadow"
            style={{ backgroundColor: bgtype === 0 ? 'lightgreen' : 'lightcoral' }}
          >
            {data?.rating}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="row" style={{ margin: 0 }}>
      <div className="col-lg-6 element-top" style={{ padding: 0 }}>
        <div className="title-item-ranking">
          <h4 className="text-white text-shadow">Best Matchups</h4>
          <div style={{ marginRight: 15 }}>
            <span className="ranking-score score-ic">Rating</span>
          </div>
        </div>
        {data?.matchups
          .sort((a, b) => b.rating - a.rating)
          .map((matchup, index) => (
            <Fragment key={index}>{renderItemList(matchup, 0)}</Fragment>
          ))}
      </div>
      <div className="col-lg-6 element-top" style={{ padding: 0 }}>
        <div className="title-item-ranking">
          <h4 className="text-white text-shadow">Best Counters</h4>
          <div style={{ marginRight: 15 }}>
            <span className="ranking-score score-ic">Rating</span>
          </div>
        </div>
        {data?.counters
          .sort((a, b) => a.rating - b.rating)
          .map((counter, index) => (
            <Fragment key={index}>{renderItemList(counter, 1)}</Fragment>
          ))}
      </div>
    </div>
  );
};

export const OverAllStats = (data: PokemonBattleRanking | undefined, statsRanking: StatsModel, cp: number | string) => {
  const calculateStatsTopRank = (stats: StatsPokemon | undefined) => {
    const maxCP = parseInt(cp.toString());

    if (maxCP === 10000) {
      const cp = calculateCP((stats?.atk ?? 0) + MAX_IV, (stats?.def ?? 0) + MAX_IV, (stats?.sta ?? 0) + MAX_IV, MAX_LEVEL - 1);
      const buddyCP = calculateCP((stats?.atk ?? 0) + MAX_IV, (stats?.def ?? 0) + MAX_IV, (stats?.sta ?? 0) + MAX_IV, MAX_LEVEL);
      const result: any = {};
      result[MAX_LEVEL - 1] = { cp: isNaN(cp) ? 0 : cp };
      result[MAX_LEVEL] = { cp: isNaN(buddyCP) ? 0 : buddyCP };
      return result;
    } else {
      let minCP = maxCP === 500 ? 0 : maxCP === 1500 ? 500 : maxCP === 2500 ? 1500 : 2500;
      let maxPokeCP = calculateCP((stats?.atk ?? 0) + MAX_IV, (stats?.def ?? 0) + MAX_IV, (stats?.sta ?? 0) + MAX_IV, MAX_LEVEL);
      if (isNaN(maxPokeCP)) {
        maxPokeCP = 0;
      }

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
      const allStats = calStatsProd(stats?.atk ?? 0, stats?.def ?? 0, stats?.sta ?? 0, minCP, maxCP);
      return allStats[allStats.length - 1];
    }
  };

  const renderTopStats = (stats: StatsPokemon | undefined, id: number) => {
    const maxCP = parseInt(cp.toString());
    const currStats = calculateStatsTopRank(stats);
    return (
      <ul className="element-top">
        <li className="element-top">
          CP: <b>{maxCP === 10000 ? `${currStats[MAX_LEVEL - 1]?.cp}-${currStats[MAX_LEVEL]?.cp}` : `${currStats?.CP ?? 0}`}</b>
        </li>
        <li className={currStats?.level <= 40 ? 'element-top' : ''}>
          Level: <b>{maxCP === 10000 ? `${MAX_LEVEL - 1}-${MAX_LEVEL}` : `${currStats?.level ?? 0}`} </b>
          {(currStats?.level > 40 || maxCP === 10000) && (
            <b>
              (
              <CandyXL id={id} style={{ filter: 'drop-shadow(1px 1px 1px black)' }} />
              XL Candy required)
            </b>
          )}
        </li>
        <li className="element-top">
          <IVbar title="Attack" iv={maxCP === 10000 ? MAX_IV : currStats?.IV.atk ?? 0} style={{ maxWidth: 500 }} />
          <IVbar title="Defense" iv={maxCP === 10000 ? MAX_IV : currStats?.IV.def ?? 0} style={{ maxWidth: 500 }} />
          <IVbar title="HP" iv={maxCP === 10000 ? MAX_IV : currStats?.IV.sta ?? 0} style={{ maxWidth: 500 }} />
        </li>
      </ul>
    );
  };

  return (
    <div className="row w-100" style={{ margin: 0 }}>
      {data?.scores && (
        <div className="col-lg-4 d-flex justify-content-center" style={{ padding: 10 }}>
          <div>
            <h5>
              <b>Overall Performance</b>
            </h5>
            <Hexagon
              animation={0}
              borderSize={320}
              size={180}
              stats={{
                lead: data?.scores.at(0) ?? 0,
                atk: data?.scores[4],
                cons: data?.scores[5],
                closer: data?.scores[1],
                charger: data?.scores[3],
                switching: data?.scores[2],
              }}
            />
          </div>
        </div>
      )}
      <div className={(data?.scores ? 'col-lg-8 ' : '') + 'container status-ranking'}>
        <div>
          <h5>
            <b>Overall Stats</b>
          </h5>
          <Stats statATK={data?.atk} statDEF={data?.def} statSTA={data?.sta} statProd={data?.prod} pokemonStats={statsRanking} />
        </div>
        <div>
          <h5>
            <b>Top Rank League</b>
          </h5>
          {renderTopStats(data?.stats, data?.id ?? 0)}
        </div>
      </div>
    </div>
  );
};

export const TypeEffective = (types: string[]) => {
  return (
    <div className="row text-white">
      <div className="col-lg-4" style={{ marginBottom: 15 }}>
        <div className="h-100">
          <h6 className="d-flex justify-content-center weakness-bg-text">
            <b>Weakness</b>
          </h6>
          <hr className="w-100" />
          {<TypeEffectiveSelect effect={0} types={types} />}
        </div>
        <hr className="w-100" style={{ margin: 0 }} />
      </div>
      <div className="col-lg-4" style={{ marginBottom: 15 }}>
        <div className="h-100">
          <h6 className="d-flex justify-content-center neutral-bg-text">
            <b>Neutral</b>
          </h6>
          <hr className="w-100" />
          {<TypeEffectiveSelect effect={1} types={types} />}
        </div>
        <hr className="w-100" style={{ margin: 0 }} />
      </div>
      <div className="col-lg-4" style={{ marginBottom: 15 }}>
        <div className="h-100">
          <h6 className="d-flex justify-content-center resistance-bg-text">
            <b>Resistance</b>
          </h6>
          <hr className="w-100" />
          {<TypeEffectiveSelect effect={2} types={types} />}
        </div>
        <hr className="w-100" style={{ margin: 0 }} />
      </div>
    </div>
  );
};

export const MoveSet = (
  moves:
    | {
        chargedMoves: PokemonRankingMove[];
        fastMoves: PokemonRankingMove[];
      }
    | undefined,
  combatList: CombatPokemon | undefined,
  combatData: Combat[]
) => {
  const findArchetype = (archetype: string | string[]) => {
    return [
      'General',
      'Nuke',
      'Spam/Bait',
      'High Energy',
      'Low Quality',
      'Debuff',
      'Boost',
      'Fast Charge',
      'Heavy Damage',
      'Multipurpose',
      'Self-Debuff',
    ].map((value, index) => (
      <Fragment key={index}>
        {archetype.includes(value) && !(archetype.includes('Self-Debuff') && value === 'Debuff') && (
          <div className="filter-shadow" title={value} key={index}>
            {value === 'General' && <CircleIcon />}
            {value === 'Nuke' && <RocketLaunchIcon sx={{ color: 'gray' }} />}
            {value === 'Spam/Bait' && <BakeryDiningIcon sx={{ color: 'pink' }} />}
            {value === 'High Energy' && <EnergySavingsLeafIcon sx={{ color: 'orange' }} />}
            {value === 'Low Quality' && <StairsIcon sx={{ color: 'lightgray' }} />}
            {value === 'Debuff' && <ArrowDownwardIcon sx={{ color: 'lightcoral' }} />}
            {value === 'Boost' && <ArrowUpwardIcon sx={{ color: 'lightgreen' }} />}
            {value === 'Fast Charge' && <BoltIcon sx={{ color: '#f8d030' }} />}
            {value === 'Heavy Damage' && <BrokenImageIcon sx={{ color: 'brown' }} />}
            {value === 'Multipurpose' && <SpokeIcon sx={{ color: 'lightskyblue' }} />}
            {value === 'Self-Debuff' && (
              <div className="position-relative">
                <PersonIcon sx={{ color: 'black' }} />
                <KeyboardDoubleArrowDownIcon fontSize="small" className="position-absolute" sx={{ color: 'red', left: '50%', bottom: 0 }} />
              </div>
            )}
          </div>
        )}
      </Fragment>
    ));
  };

  const findMove = (name: string, uses: number) => {
    const oldName = name;
    if (name.includes('HIDDEN_POWER')) {
      name = 'HIDDEN_POWER';
    }
    let move = combatData.find((move) => move.name === name);
    if (move && oldName.includes('HIDDEN_POWER')) {
      move = { ...move, type: oldName.split('_').at(2) ?? '' };
    }

    let elite = false;
    let special = false;
    if (combatList?.eliteQuickMoves.includes(name)) {
      elite = true;
    }
    if (combatList?.eliteCinematicMoves.includes(name)) {
      elite = true;
    }
    if (combatList?.specialMoves.includes(name)) {
      special = true;
    }

    return (
      <Link
        to={`/move/${move?.id}`}
        className={
          move?.type?.toLowerCase() + ' filter-shadow-hover text-white type-rank-item d-flex align-items-center justify-content-between'
        }
      >
        <div className="d-flex" style={{ columnGap: 10 }}>
          <img className="filter-shadow" width={24} height={24} alt="img-pokemon" src={APIService.getTypeSprite(move?.type ?? '')} />
          <span className="filter-shadow">
            {splitAndCapitalize(oldName, '_', ' ')} {(elite || special) && <b className="filter-shadow">*</b>}
          </span>
        </div>
        <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
          {move?.archetype && findArchetype(move?.archetype)}
          <span className="ranking-score score-ic filter-shadow">{uses}</span>
        </div>
      </Link>
    );
  };

  const moveOverlay = () => {
    return (
      <OverlayTrigger
        placement="auto"
        overlay={
          <PopoverConfig id="popover-info-evo">
            <span className="info-evo">
              <span className="d-block caption">
                - <CircleIcon className="filter-shadow" sx={{ color: 'white' }} /> General
              </span>
              <span className="d-block caption">
                - <RocketLaunchIcon className="filter-shadow" sx={{ color: 'gray' }} /> Nuke
              </span>
              <span className="d-block caption">
                - <BakeryDiningIcon className="filter-shadow" sx={{ color: 'pink' }} /> Spam/Bait
              </span>
              <span className="d-block caption">
                - <EnergySavingsLeafIcon className="filter-shadow" sx={{ color: 'orange' }} /> High Energy
              </span>
              <span className="d-block caption">
                - <StairsIcon className="filter-shadow" sx={{ color: 'lightgray' }} /> Low Quality
              </span>
              <span className="d-block caption">
                - <ArrowDownwardIcon className="filter-shadow" sx={{ color: 'lightcoral' }} /> Debuff
              </span>
              <span className="d-block caption">
                - <ArrowUpwardIcon className="filter-shadow" sx={{ color: 'lightgreen' }} /> Boost
              </span>
              <span className="d-block caption">
                - <BoltIcon className="filter-shadow" sx={{ color: '#f8d030' }} /> Fast Charge
              </span>
              <span className="d-block caption">
                - <BrokenImageIcon className="filter-shadow" sx={{ color: 'brown' }} /> Heavy Damage
              </span>
              <span className="d-block caption">
                - <SpokeIcon className="filter-shadow" sx={{ color: 'lightskyblue' }} /> Multipurpose
              </span>
              <span className="d-block caption">
                -{' '}
                <span className="position-relative filter-shadow" style={{ marginRight: 5 }}>
                  <PersonIcon sx={{ color: 'black' }} />
                  <KeyboardDoubleArrowDownIcon
                    fontSize="small"
                    className="position-absolute"
                    sx={{ color: 'red', left: '50%', bottom: 0 }}
                  />
                </span>{' '}
                Self-Debuff
              </span>
            </span>
          </PopoverConfig>
        }
      >
        <span className="tooltips-info">
          <InfoOutlinedIcon color="primary" />
        </span>
      </OverlayTrigger>
    );
  };

  return (
    <div className="row" style={{ margin: 0 }}>
      <div className="col-xl-6" style={{ padding: 0, backgroundColor: 'lightgray' }}>
        <div className="moves-title">Fast Moves{moveOverlay()}</div>
        <div className="type-rank-list">
          {moves?.fastMoves
            .map((move) => {
              if (!move.uses) {
                move.uses = 0;
              }
              return move;
            })
            .sort((a, b) => (b.uses ?? 0) - (a.uses ?? 0))
            .map((value, index) => (
              <Fragment key={index}>{findMove(value.moveId, value.uses ?? 0)}</Fragment>
            ))}
        </div>
      </div>
      <div className="col-xl-6" style={{ padding: 0, backgroundColor: 'lightgray' }}>
        <div className="moves-title">Charged Moves{moveOverlay()}</div>
        <div className="type-rank-list">
          {moves?.chargedMoves
            .map((move) => {
              if (move.moveId === 'FUTURE_SIGHT') {
                move.moveId = 'FUTURESIGHT';
              }
              if (move.moveId === 'TECHNO_BLAST_DOUSE') {
                move.moveId = 'TECHNO_BLAST_WATER';
              }
              if (!move.uses) {
                move.uses = 0;
              }
              return move;
            })
            .sort((a, b) => (b.uses ?? 0) - (a.uses ?? 0))
            .map((value, index) => (
              <Fragment key={index}>{findMove(value.moveId, value.uses ?? 0)}</Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};
