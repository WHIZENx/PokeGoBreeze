import React, { useEffect, useState } from 'react';
import { OverAllStatsComponent } from '../models/component.model';
import { toNumber, combineClasses, isEqual, getValueOrDefault } from '../../../utils/extension';
import Stats from '../../../components/Info/Stats/Stats';
import Hexagon from '../../../components/Sprites/Hexagon/Hexagon';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import CandyXL from '../../../components/Sprites/Candy/CandyXL';
import IVBar from '../../../components/Sprites/IVBar/IVBar';
import { IPokemonAllStats, PokemonAllStats } from '../models/over-all-stats.model';
import { BattleBaseStats } from '../../../utils/models/calculate.model';
import { getKeyWithData } from '../../../utils/utils';
import { ScoreType } from '../../../utils/enums/constants.enum';
import { EqualMode } from '../../../utils/enums/string.enum';
import { AnimationType } from '../../../components/Sprites/Hexagon/enums/hexagon.enum';
import { IStatsPokemonGO } from '../../../core/models/stats.model';
import { maxLevel, maxIv, maxPokemonLevel } from '../../../utils/helpers/options-context.helpers';
import StatsCalculationService from '../../../services/stats-calculation.service';
import APIService from '../../../services/api.service';

const OverAllStats = (props: OverAllStatsComponent) => {
  const [pokemonAllStats, setPokemonAllStats] = useState<IPokemonAllStats>();
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const setPokemonStats = async (stats: IStatsPokemonGO | undefined, id: number | undefined, signal: AbortSignal) => {
    const maxCP = toNumber(props.cp);
    id = toNumber(id);
    let prevCurrentStats = new BattleBaseStats();
    if (maxCP > BattleLeagueCPType.Ultra) {
      prevCurrentStats = await StatsCalculationService.getTopRank(stats, id, maxCP, maxPokemonLevel(), signal);
    }
    const currentStats = await StatsCalculationService.getTopRank(stats, id, maxCP, maxLevel(), signal);
    const level = toNumber(currentStats?.level);

    return PokemonAllStats.create({ prevCurrentStats, currentStats, maxCP, level, id });
  };

  useEffect(() => {
    const id = toNumber(props.data?.id);
    if (id > 0 && props.data?.stats) {
      const controller = new AbortController();
      setIsStatsLoading(true);
      setPokemonStats(props.data.stats, id, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) {
            setPokemonAllStats(result);
          }
        })
        .catch((error) => {
          if (APIService.isCancel(error)) {
            return;
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsStatsLoading(false);
          }
        });
      return () => controller.abort();
    }
  }, [props.data?.stats, props.data?.id, props.cp]);

  const renderTopStats = (data: IPokemonAllStats | undefined) => (
    <ul className="tw-mt-2">
      <li className="tw-mt-2">
        {'CP: '}
        <b>
          {toNumber(data?.maxCP) > BattleLeagueCPType.Ultra
            ? `${data?.prevCurrentStats.CP}-${data?.currentStats.CP}`
            : `${toNumber(data?.currentStats.CP)}`}
        </b>
      </li>
      <li className={toNumber(data?.level) <= 40 ? 'tw-mt-2' : ''}>
        Level:{' '}
        <b>
          {toNumber(data?.maxCP) > BattleLeagueCPType.Ultra
            ? `${maxPokemonLevel()}-${maxLevel()}`
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
      <li className="tw-mt-2">
        <IVBar
          title="Attack"
          iv={toNumber(data?.maxCP) > BattleLeagueCPType.Ultra ? maxIv() : toNumber(data?.currentStats.IV?.atkIV)}
          className="tw-max-w-stats"
        />
        <IVBar
          title="Defense"
          iv={toNumber(data?.maxCP) > BattleLeagueCPType.Ultra ? maxIv() : toNumber(data?.currentStats.IV?.defIV)}
          className="tw-max-w-stats"
        />
        <IVBar
          title="HP"
          iv={toNumber(data?.maxCP) > BattleLeagueCPType.Ultra ? maxIv() : toNumber(data?.currentStats.IV?.staIV)}
          className="tw-max-w-stats"
        />
      </li>
    </ul>
  );

  return (
    <div className="row tw-w-full !tw-m-0">
      {isEqual(
        getValueOrDefault(String, props.type, getKeyWithData(ScoreType, ScoreType.Overall)),
        getKeyWithData(ScoreType, ScoreType.Overall),
        EqualMode.IgnoreCaseSensitive
      ) && (
        <div className="lg:tw-w-1/3 tw-flex tw-justify-center tw-p-2">
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
            ? 'lg:tw-w-2/3'
            : '',
          'tw-container status-ranking'
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
          <div className={isStatsLoading && pokemonAllStats ? 'tw-opacity-60 tw-animate-pulse' : ''}>
            {renderTopStats(pokemonAllStats)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverAllStats;
