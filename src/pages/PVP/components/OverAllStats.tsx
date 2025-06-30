import React, { useEffect, useState } from 'react';
import { OverAllStatsComponent } from '../models/component.model';
import { toNumber, combineClasses, isEqual, getValueOrDefault } from '../../../utils/extension';
import Stats from '../../../components/Info/Stats/Stats';
import Hexagon from '../../../components/Sprites/Hexagon/Hexagon';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import CandyXL from '../../../components/Sprites/Candy/CandyXL';
import IVBar from '../../../components/Sprites/IVBar/IVBar';
import { IPokemonAllStats, PokemonAllStats } from '../models/over-all-stats.model';
import { calculateStatsTopRank } from '../../../utils/calculate';
import { BattleBaseStats } from '../../../utils/models/calculate.model';
import { getKeyWithData } from '../../../utils/utils';
import { ScoreType } from '../../../utils/enums/constants.enum';
import { EqualMode } from '../../../utils/enums/string.enum';
import { AnimationType } from '../../../components/Sprites/Hexagon/enums/hexagon.enum';
import { IStatsPokemonGO } from '../../../core/models/stats.model';
import { maxLevel, maxIv } from '../../../utils/helpers/options-context.helpers';

const OverAllStats = (props: OverAllStatsComponent) => {
  const [pokemonAllStats, setPokemonAllStats] = useState<IPokemonAllStats>();

  const setPokemonStats = (stats: IStatsPokemonGO | undefined, id: number | undefined) => {
    const maxCP = toNumber(props.cp);
    id = toNumber(id);
    let prevCurrentStats = new BattleBaseStats();
    if (maxCP > BattleLeagueCPType.Ultra) {
      prevCurrentStats = calculateStatsTopRank(stats, id, maxCP, maxLevel() - 1);
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

  const renderTopStats = (data: IPokemonAllStats | undefined) => (
    <ul className="mt-2">
      <li className="mt-2">
        {'CP: '}
        <b>
          {toNumber(data?.maxCP) > BattleLeagueCPType.Ultra
            ? `${data?.prevCurrentStats.CP}-${data?.currentStats.CP}`
            : `${toNumber(data?.currentStats.CP)}`}
        </b>
      </li>
      <li className={toNumber(data?.level) <= 40 ? 'mt-2' : ''}>
        Level:{' '}
        <b>
          {toNumber(data?.maxCP) > BattleLeagueCPType.Ultra
            ? `${maxLevel() - 1}-${maxLevel()}`
            : `${toNumber(data?.level)}`}{' '}
        </b>
        {(toNumber(data?.level) > 40 || toNumber(data?.maxCP) > BattleLeagueCPType.Ultra) && (
          <b>
            (
            <CandyXL className="filter-shadow" id={data?.id} />
            XL Candy required)
          </b>
        )}
      </li>
      <li className="mt-2">
        <IVBar
          title="Attack"
          iv={toNumber(data?.maxCP) > BattleLeagueCPType.Ultra ? maxIv() : toNumber(data?.currentStats.IV?.atkIV)}
          style={{ maxWidth: 500 }}
        />
        <IVBar
          title="Defense"
          iv={toNumber(data?.maxCP) > BattleLeagueCPType.Ultra ? maxIv() : toNumber(data?.currentStats.IV?.defIV)}
          style={{ maxWidth: 500 }}
        />
        <IVBar
          title="HP"
          iv={toNumber(data?.maxCP) > BattleLeagueCPType.Ultra ? maxIv() : toNumber(data?.currentStats.IV?.staIV)}
          style={{ maxWidth: 500 }}
        />
      </li>
    </ul>
  );

  return (
    <div className="row w-100 m-0">
      {isEqual(
        getValueOrDefault(String, props.type, getKeyWithData(ScoreType, ScoreType.Overall)),
        getKeyWithData(ScoreType, ScoreType.Overall),
        EqualMode.IgnoreCaseSensitive
      ) && (
        <div className="col-lg-4 d-flex justify-content-center p-2">
          <div>
            <h5>
              <b>Overall Performance</b>
            </h5>
            <Hexagon
              name={props.data?.name}
              animation={AnimationType.On}
              borderSize={320}
              size={180}
              stats={props.data?.data?.scorePVP}
            />
          </div>
        </div>
      )}
      <div
        className={combineClasses(
          isEqual(
            getValueOrDefault(String, props.type, getKeyWithData(ScoreType, ScoreType.Overall)),
            getKeyWithData(ScoreType, ScoreType.Overall),
            EqualMode.IgnoreCaseSensitive
          )
            ? 'col-lg-8'
            : '',
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
            id={props.data?.pokemon?.num}
            form={props.data?.pokemon?.form}
            isDisabled={!props.data}
            pokemonType={props.data?.pokemonType}
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
