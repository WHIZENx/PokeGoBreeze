import React, { Fragment, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

import { raidEgg } from '../../utils/compute';
import { RAID_BOSS_TIER } from '../../utils/constants';
import { calculateRaidCP, calculateRaidStat } from '../../utils/calculate';

import ATK_LOGO from '../../assets/attack.png';
import DEF_LOGO from '../../assets/defense.png';
import STA_LOGO from '../../assets/stamina.png';

import { getKeyWithData, isSpecialMegaFormType } from '../../utils/utils';
import { IRaidComponent, ITableRow } from '../models/component.model';
import { toNumber } from '../../utils/extension';
import { PokemonClass, PokemonType } from '../../enums/type.enum';
import usePokemon from '../../composables/usePokemon';
import Table from '../Table/Table';

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
    if (tier > 5 && props.currForm && !isSpecialMegaFormType(props.currForm.form?.pokemonType)) {
      setTier(5);
    } else if (
      tier === 5 &&
      props.currForm &&
      isSpecialMegaFormType(props.currForm.form?.pokemonType) &&
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
    props.currForm,
    props.id,
    props.setTierBoss,
    props.setStatBossATK,
    props.setStatBossDEF,
    props.setStatBossHP,
    props.statATK,
    props.statDEF,
    props.setTimeAllow,
  ]);

  const reload = (element: JSX.Element, color = 'var(--loading-custom-bg)') => {
    if (props.isLoadedForms) {
      return element;
    }
    return (
      <div className="ph-item w-75 p-0 m-auto h-4">
        <div className="ph-picture ph-col-3 w-100 h-100 m-0 p-0" style={{ background: color }} />
      </div>
    );
  };

  const rows: ITableRow[] = [
    {
      value: 'Stats',
      isSubTitle: true,
      colSpan: 2,
    },
    {
      value: (
        <>
          <img className="me-2" alt="Image Logo" width={20} height={20} src={ATK_LOGO} /> ATK
        </>
      ),
      subRows: [
        {
          value: reload(<>{props.currForm ? calculateRaidStat(props.statATK, tier) : ''}</>),
          className: 'text-center theme-text-primary',
        },
      ],
    },
    {
      value: (
        <>
          <img className="me-2" alt="Image Logo" width={20} height={20} src={DEF_LOGO} /> DEF
        </>
      ),
      subRows: [
        {
          value: reload(<>{props.currForm ? calculateRaidStat(props.statDEF, tier) : ''}</>),
          className: 'text-center theme-text-primary',
        },
      ],
    },
    {
      value: (
        <>
          <img className="me-2" alt="Image Logo" width={20} height={20} src={STA_LOGO} /> HP
        </>
      ),
      subRows: [
        {
          value: reload(<>{props.currForm ? Math.floor(RAID_BOSS_TIER[tier].sta / RAID_BOSS_TIER[tier].CPm) : ''}</>),
          className: 'text-center theme-text-primary',
        },
      ],
    },
  ];

  return (
    <Fragment>
      <div className="d-flex justify-content-center">
        <Form.Select
          className="w-50"
          onChange={(e) => {
            setTier(toNumber(e.target.value));
            if (props.clearData) {
              props.clearData(false);
            }
          }}
          value={tier}
        >
          <optgroup label="Normal Tiers">
            <option value={1}>Tier 1</option>
            <option value={3}>Tier 3</option>
            {(props.currForm?.form?.pokemonType !== PokemonType.Mega || pokemonClass === PokemonClass.None) && (
              <option value={5}>Tier 5</option>
            )}
          </optgroup>
          <optgroup label="Legacy Tiers">
            <option value={2}>Tier 2</option>
            {(props.currForm?.form?.pokemonType !== PokemonType.Mega || pokemonClass !== PokemonClass.None) && (
              <option value={4}>Tier 4</option>
            )}
          </optgroup>
          {props.currForm && isSpecialMegaFormType(props.currForm.form?.pokemonType) && (
            <Fragment>
              {pokemonClass !== PokemonClass.None ? (
                <optgroup
                  label={`Legendary ${
                    props.currForm.form.pokemonType === PokemonType.Primal
                      ? getKeyWithData(PokemonType, PokemonType.Primal)
                      : getKeyWithData(PokemonType, PokemonType.Mega)
                  } Tier 6`}
                >
                  <option value={6}>
                    {`Tier ${
                      props.currForm.form.pokemonType === PokemonType.Primal
                        ? getKeyWithData(PokemonType, PokemonType.Primal)
                        : getKeyWithData(PokemonType, PokemonType.Mega)
                    }`}
                  </option>
                </optgroup>
              ) : (
                <optgroup label="Mega Tier 4">
                  <option value={4}>Tier Mega</option>
                </optgroup>
              )}
            </Fragment>
          )}
        </Form.Select>
      </div>
      <div className="row w-100 mt-2 m-0">
        <div className="col-4 text-center d-inline-block">
          <h1>CP</h1>
          <hr className="w-100" />
          <h5>{calculateRaidCP(toNumber(props.statATK), toNumber(props.statDEF), tier)}</h5>
        </div>
        <div className="col-4 text-center d-inline-block">
          <h1>HP</h1>
          <hr className="w-100" />
          <h5>{RAID_BOSS_TIER[tier].sta}</h5>
        </div>
        <div className="col-4 text-center d-inline-block">
          <h1>LEVEL</h1>
          <hr className="w-100" />
          <h5>{RAID_BOSS_TIER[tier].level}</h5>
        </div>
      </div>
      <div className="row mt-2 container m-0">
        <div className="col d-flex justify-content-center align-items-center mb-3">
          <img
            className={tier === 2 ? 'img-type-icon' : ''}
            alt="Image Raid Egg"
            src={raidEgg(tier, props.currForm?.form?.pokemonType, pokemonClass)}
          />
        </div>
        <div className="col d-flex justify-content-center mb-3">
          <Table tableClass="table-raid" rows={rows} />
        </div>
      </div>
    </Fragment>
  );
};

export default Raid;
