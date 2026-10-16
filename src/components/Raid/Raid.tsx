import React, { Fragment, useEffect, useState } from 'react';

import { raidEgg } from '../../utils/compute';
import { RAID_BOSS_TIER } from '../../utils/constants';
import { calculateRaidBattleStat, calculateRaidCP } from '../../utils/calculate';

import { isSpecialMegaFormType } from '../../utils/utils';
import { IRaidComponent } from '../models/component.model';
import { toNumber } from '../../utils/extension';
import { PokemonClass } from '../../enums/type.enum';
import usePokemon from '../../composables/usePokemon';
import StatsTable from '../Commons/Tables/Stats/StatsTable';
import SelectTierMui from '../Commons/Selects/SelectTierMui';
import { normalizeRaidSelection } from '../../utils/raid-tier';
import useDataStore from '../../composables/useDataStore';

const Raid = (props: IRaidComponent) => {
  const { findPokemonById } = usePokemon();
  const { optionsData } = useDataStore();
  const [tier, setTier] = useState(1);
  const [raidLevel, setRaidLevel] = useState<string>();
  const [pokemonClass, setPokemonClass] = useState(PokemonClass.None);

  useEffect(() => {
    const pokemonClass = findPokemonById(props.id)?.pokemonClass;
    setPokemonClass(pokemonClass ?? PokemonClass.None);
  }, [props.id, findPokemonById]);

  useEffect(() => {
    const enhancedRaidLevels = new Set(optionsData?.raid.entryCosts.map((entry) => entry.raidLevel) ?? []);
    const selection = normalizeRaidSelection(tier, raidLevel, props.pokemonType, pokemonClass, enhancedRaidLevels);
    if (!selection?.tier || !selection.value) {
      return;
    }
    if (selection.tier !== tier || selection.value !== raidLevel) {
      setTier(selection.tier);
      setRaidLevel(selection.value);
      return;
    }
    if (props.setTierBoss) {
      props.setTierBoss(tier);
    }
    props.setRaidLevelBoss?.(raidLevel);
    if (props.setStatBossATK && props.setStatBossDEF && props.setStatBossHP) {
      props.setStatBossATK(calculateRaidBattleStat(props.statATK, tier));
      props.setStatBossDEF(calculateRaidBattleStat(props.statDEF, tier));
      props.setStatBossHP(RAID_BOSS_TIER[tier].sta);
    }
    if (props.setTimeAllow) {
      props.setTimeAllow(tier === 4 && !isSpecialMegaFormType(props.pokemonType) ? 180 : RAID_BOSS_TIER[tier].timer);
    }
  }, [
    tier,
    raidLevel,
    pokemonClass,
    props.pokemonType,
    props.id,
    props.setTierBoss,
    props.setRaidLevelBoss,
    props.setStatBossATK,
    props.setStatBossDEF,
    props.setStatBossHP,
    props.statATK,
    props.statDEF,
    props.setTimeAllow,
    optionsData?.raid.entryCosts,
  ]);

  return (
    <Fragment>
      <div className="tw-flex tw-justify-center tw-w-full">
        <SelectTierMui
          boxClassName="tw-w-1/2"
          tier={tier}
          raidLevel={raidLevel}
          setTier={setTier}
          setRaidLevel={setRaidLevel}
          clearData={props.clearData}
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
