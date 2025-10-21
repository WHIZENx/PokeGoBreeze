import React, { Fragment, useEffect, useState } from 'react';

import { raidEgg } from '../../utils/compute';
import { RAID_BOSS_TIER } from '../../utils/constants';
import { calculateRaidCP, calculateRaidStat } from '../../utils/calculate';

import { isSpecialMegaFormType } from '../../utils/utils';
import { IRaidComponent } from '../models/component.model';
import { toNumber } from '../../utils/extension';
import { PokemonClass } from '../../enums/type.enum';
import usePokemon from '../../composables/usePokemon';
import StatsTable from '../Commons/Tables/Stats/StatsTable';
import SelectTierMui from '../Commons/Selects/SelectTierMui';

const Raid = (props: IRaidComponent) => {
  const { findPokemonById } = usePokemon();
  const [tier, setTier] = useState(1);
  const [pokemonClass, setPokemonClass] = useState(PokemonClass.None);

  useEffect(() => {
    const pokemonClass = findPokemonById(props.id)?.pokemonClass;
    if (pokemonClass) {
      setPokemonClass(pokemonClass);
    }
  }, [props.id, findPokemonById]);

  useEffect(() => {
    if (tier > 5 && props.pokemonType && !isSpecialMegaFormType(props.pokemonType)) {
      setTier(5);
    } else if (
      tier === 5 &&
      props.pokemonType &&
      isSpecialMegaFormType(props.pokemonType) &&
      pokemonClass !== PokemonClass.None
    ) {
      setTier(6);
    }
    if (props.setTierBoss) {
      props.setTierBoss(tier);
    }
    if (props.setStatBossATK && props.setStatBossDEF && props.setStatBossHP) {
      props.setStatBossATK(calculateRaidStat(props.statATK, tier));
      props.setStatBossDEF(calculateRaidStat(props.statDEF, tier));
      props.setStatBossHP(RAID_BOSS_TIER[tier].sta);
    }
    if (props.setTimeAllow) {
      props.setTimeAllow(RAID_BOSS_TIER[tier].timer);
    }
  }, [
    tier,
    pokemonClass,
    props.pokemonType,
    props.id,
    props.setTierBoss,
    props.setStatBossATK,
    props.setStatBossDEF,
    props.setStatBossHP,
    props.statATK,
    props.statDEF,
    props.setTimeAllow,
  ]);

  return (
    <Fragment>
      <div className="tw-flex tw-justify-center tw-w-full">
        <SelectTierMui
          boxClassName="tw-w-1/2"
          tier={tier}
          setTier={setTier}
          clearData={() => props.clearData?.(false)}
          pokemonType={props.pokemonType}
          pokemonClass={pokemonClass}
        />
      </div>
      <div className="row tw-w-full !tw-mt-2 !tw-m-0">
        <div className="!tw-w-1/3 tw-flex-none tw-text-center tw-inline-block">
          <h1>CP</h1>
          <hr className="tw-w-full" />
          <h5>{calculateRaidCP(toNumber(props.statATK), toNumber(props.statDEF), tier)}</h5>
        </div>
        <div className="!tw-w-1/3 tw-flex-none tw-text-center tw-inline-block">
          <h1>HP</h1>
          <hr className="tw-w-full" />
          <h5>{RAID_BOSS_TIER[tier].sta}</h5>
        </div>
        <div className="!tw-w-1/3 tw-flex-none tw-text-center tw-inline-block">
          <h1>LEVEL</h1>
          <hr className="tw-w-full" />
          <h5>{RAID_BOSS_TIER[tier].level}</h5>
        </div>
      </div>
      <div className="row !tw-mt-2 tw-container !tw-m-0">
        <div className="tw-flex-1 tw-flex tw-justify-center tw-items-center tw-mb-3">
          <img
            className={tier === 2 ? 'img-type-icon' : ''}
            alt="Image Raid Egg"
            src={raidEgg(tier, props.pokemonType, pokemonClass)}
          />
        </div>
        <div className="col tw-flex tw-justify-center tw-mb-3">
          <StatsTable
            isLoadedForms={props.isLoadedForms}
            tier={tier}
            pokemonType={props.pokemonType}
            statATK={props.statATK}
            statDEF={props.statDEF}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default Raid;
