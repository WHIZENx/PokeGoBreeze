import React, { useEffect, useState } from 'react';
import { OverAllStatsComponent } from '../models/component.model';
import { HexagonStats, IStatsBase } from '../../../core/models/stats.model';
import { toNumber, combineClasses, isEqual } from '../../../util/extension';
import Stats from '../../../components/Info/Stats/Stats';
import Hexagon from '../../../components/Sprites/Hexagon/Hexagon';
import { BattleLeagueCPType } from '../../../util/enums/compute.enum';
import CandyXL from '../../../components/Sprites/Candy/CandyXL';
import IVBar from '../../../components/Sprites/IVBar/IVBar';
import { MAX_LEVEL, MAX_IV } from '../../../util/constants';
import { IPokemonAllStats, PokemonAllStats } from '../models/over-all-stats.model';
import { calculateStatsTopRank } from '../../../util/calculate';
import { BattleBaseStats } from '../../../util/models/calculate.model';
import { getKeyWithData } from '../../../util/utils';
import { ScoreType } from '../../../util/enums/constants.enum';
import { EqualMode } from '../../../util/enums/string.enum';

const OverAllStats = (props: OverAllStatsComponent) => {
  const [pokemonAllStats, setPokemonAllStats] = useState<IPokemonAllStats>();

  const setPokemonStats = (stats: IStatsBase | undefined, id: number | undefined) => {
    const maxCP = toNumber(props.cp);
    id = toNumber(id);
    let prevCurrentStats = new BattleBaseStats();
    if (maxCP === BattleLeagueCPType.InsMaster) {
      prevCurrentStats = calculateStatsTopRank(stats, id, maxCP, MAX_LEVEL - 1);
    }
    const currentStats = calculateStatsTopRank(stats, id, maxCP);
    const level = toNumber(currentStats?.level);

    return PokemonAllStats.create({ prevCurrentStats, currentStats, maxCP, level, id });
  };

  useEffect(() => {
    const id = toNumber(props.data?.id);
    if (id > 0 && pokemonAllStats && pokemonAllStats.id !== id) {
      setPokemonAllStats(undefined);
    }
  }, [pokemonAllStats, props.data?.id]);

  useEffect(() => {
    const id = toNumber(props.data?.id);
    if (id > 0 && !pokemonAllStats && props.data?.stats) {
      setPokemonAllStats(setPokemonStats(props.data.stats, id));
    }
  }, [pokemonAllStats, props.data?.stats, props.data?.id]);

  const renderTopStats = (data: IPokemonAllStats | undefined) => {
    return (
      <ul className="element-top">
        <li className="element-top">
          {'CP: '}
          <b>
            {data?.maxCP === BattleLeagueCPType.InsMaster
              ? `${data.prevCurrentStats.CP}-${data.currentStats.CP}`
              : `${toNumber(data?.currentStats.CP)}`}
          </b>
        </li>
        <li className={toNumber(data?.level) <= 40 ? 'element-top' : ''}>
          Level: <b>{data?.maxCP === BattleLeagueCPType.InsMaster ? `${MAX_LEVEL - 1}-${MAX_LEVEL}` : `${toNumber(data?.level)}`} </b>
          {(toNumber(data?.level) > 40 || data?.maxCP === BattleLeagueCPType.InsMaster) && (
            <b>
              (
              <CandyXL id={data?.id} style={{ filter: 'drop-shadow(1px 1px 1px black)' }} />
              XL Candy required)
            </b>
          )}
        </li>
        <li className="element-top">
          <IVBar
            title="Attack"
            iv={data?.maxCP === BattleLeagueCPType.InsMaster ? MAX_IV : toNumber(data?.currentStats.IV?.atk)}
            style={{ maxWidth: 500 }}
          />
          <IVBar
            title="Defense"
            iv={data?.maxCP === BattleLeagueCPType.InsMaster ? MAX_IV : toNumber(data?.currentStats.IV?.def)}
            style={{ maxWidth: 500 }}
          />
          <IVBar
            title="HP"
            iv={data?.maxCP === BattleLeagueCPType.InsMaster ? MAX_IV : toNumber(data?.currentStats.IV?.sta)}
            style={{ maxWidth: 500 }}
          />
        </li>
      </ul>
    );
  };

  return (
    <div className="row w-100" style={{ margin: 0 }}>
      {isEqual(props.type, getKeyWithData(ScoreType, ScoreType.Overall), EqualMode.IgnoreCaseSensitive) && (
        <div className="col-lg-4 d-flex justify-content-center" style={{ padding: 10 }}>
          <div>
            <h5>
              <b>Overall Performance</b>
            </h5>
            <Hexagon
              animation={0}
              borderSize={320}
              size={180}
              stats={HexagonStats.create({
                lead: toNumber(props.data?.data?.scores?.at(0)),
                atk: toNumber(props.data?.data?.scores?.at(4)),
                cons: toNumber(props.data?.data?.scores?.at(5)),
                closer: toNumber(props.data?.data?.scores?.at(1)),
                charger: toNumber(props.data?.data?.scores?.at(3)),
                switching: toNumber(props.data?.data?.scores?.at(2)),
              })}
            />
          </div>
        </div>
      )}
      <div
        className={combineClasses(
          isEqual(props.type, getKeyWithData(ScoreType, ScoreType.Overall), EqualMode.IgnoreCaseSensitive) ? 'col-lg-8' : '',
          'container status-ranking'
        )}
      >
        <div>
          <h5>
            <b>Overall Stats</b>
          </h5>
          <Stats
            statATK={props.data?.atk}
            statDEF={props.data?.def}
            statSTA={props.data?.sta}
            statProd={props.data?.prod}
            pokemonStats={props.statsRanking}
            id={props.data?.pokemon?.num}
            form={props.data?.pokemon?.forme}
            isDisabled={!props.data}
          />
        </div>
        <div>
          <h5>
            <b>Top Rank League</b>
          </h5>
          {renderTopStats(pokemonAllStats)}
        </div>
      </div>
    </div>
  );
};

export default OverAllStats;
