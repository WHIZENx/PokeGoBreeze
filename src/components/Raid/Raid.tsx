import React, { Fragment, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

import { raidEgg } from '../../util/compute';
import { FORM_MEGA, FORM_PRIMAL, RAID_BOSS_TIER, TYPE_ULTRA_BEAST } from '../../util/constants';
import { calculateRaidCP, calculateRaidStat } from '../../util/calculate';

import ATK_LOGO from '../../assets/attack.png';
import DEF_LOGO from '../../assets/defense.png';
import STA_LOGO from '../../assets/stamina.png';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material';
import { StoreState } from '../../store/models/state.model';
import { capitalize } from '../../util/utils';
import { IRaidComponent } from '../models/component.model';
import { ThemeModify } from '../../util/models/overrides/themes.model';
import { getValueOrDefault, isEqual, isInclude, isNullOrEmpty, toNumber } from '../../util/extension';
import { EqualMode, IncludeMode } from '../../util/enums/string.enum';

const Raid = (props: IRaidComponent) => {
  const theme = useTheme<ThemeModify>();
  const pokemonData = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.pokemon));
  const [tier, setTier] = useState(1);
  const [pokemonClass, setPokemonClass] = useState<string | null>();

  useEffect(() => {
    setPokemonClass(pokemonData.find((item) => item.num === props.id)?.pokemonClass);
  }, [props.id]);

  useEffect(() => {
    const pokemonClass = pokemonData.find((item) => item.num === props.id)?.pokemonClass;
    if (
      tier > 5 &&
      props.currForm &&
      !isInclude(props.currForm.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) &&
      !isEqual(props.currForm.form.formName, FORM_PRIMAL, EqualMode.IgnoreCaseSensitive)
    ) {
      setTier(5);
    } else if (
      tier === 5 &&
      props.currForm &&
      (isInclude(props.currForm.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) ||
        isEqual(props.currForm.form.formName, FORM_PRIMAL, EqualMode.IgnoreCaseSensitive)) &&
      pokemonClass
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

  const reload = (element: JSX.Element, color = '#f5f5f5') => {
    if (props.isLoadedForms) {
      return element;
    }
    return (
      <div className="ph-item w-75" style={{ padding: 0, margin: 'auto', height: 24 }}>
        <div className="ph-picture ph-col-3 w-100 h-100" style={{ padding: 0, margin: 0, background: color }} />
      </div>
    );
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-center">
        <Form.Select
          className="w-50"
          onChange={(e) => {
            setTier(toNumber(e.target.value));
            if (props.clearData) {
              props.clearData();
            }
          }}
          value={tier}
        >
          <optgroup label="Normal Tiers">
            <option value={1}>Tier 1</option>
            <option value={3}>Tier 3</option>
            {(!isInclude(props.currForm?.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) || !pokemonClass) && (
              <option value={5}>Tier 5</option>
            )}
          </optgroup>
          <optgroup label="Legacy Tiers">
            <option value={2}>Tier 2</option>
            {(!isInclude(props.currForm?.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) || pokemonClass) && (
              <option value={4}>Tier 4</option>
            )}
          </optgroup>
          {props.currForm &&
            (isInclude(props.currForm.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) ||
              isEqual(props.currForm.form.formName, FORM_PRIMAL, EqualMode.IgnoreCaseSensitive)) && (
              <Fragment>
                {pokemonClass ? (
                  <optgroup
                    label={`Legendary ${
                      isEqual(props.currForm.form.formName, FORM_PRIMAL, EqualMode.IgnoreCaseSensitive)
                        ? capitalize(FORM_PRIMAL)
                        : capitalize(FORM_MEGA)
                    } Tier 6'`}
                  >
                    <option value={6}>
                      {`Tier ${
                        isEqual(props.currForm.form.formName, FORM_PRIMAL, EqualMode.IgnoreCaseSensitive)
                          ? capitalize(FORM_PRIMAL)
                          : capitalize(FORM_MEGA)
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
      <div className="row w-100 element-top" style={{ margin: 0 }}>
        <div className="col-4 text-center d-inline-block">
          <h1>CP</h1>
          <hr className="w-100" />
          <h5>{calculateRaidCP(props.statATK, props.statDEF, tier)}</h5>
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
      <div className="row element-top container" style={{ margin: 0 }}>
        <div className="col d-flex justify-content-center align-items-center" style={{ marginBottom: 15 }}>
          <img
            className={tier === 2 ? 'img-type-icon' : ''}
            alt="img-raid-egg"
            src={raidEgg(
              tier,
              !pokemonClass &&
                getValueOrDefault(Boolean, isInclude(props.currForm?.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive)),
              !isNullOrEmpty(pokemonClass) && isEqual(props.currForm?.form.formName, FORM_PRIMAL, EqualMode.IgnoreCaseSensitive),
              isEqual(
                pokemonData.find((pokemon) => pokemon.num === props.id)?.pokemonClass,
                TYPE_ULTRA_BEAST,
                EqualMode.IgnoreCaseSensitive
              )
            )}
          />
        </div>
        <div className="col d-flex justify-content-center" style={{ marginBottom: 15 }}>
          <table className="table-info">
            <thead />
            <tbody>
              <tr className="text-center">
                <td className="table-sub-header" colSpan={2}>
                  Stats
                </td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={ATK_LOGO} />
                  ATK
                </td>
                <td className="text-center" style={{ color: theme.palette.text.primary }}>
                  {reload(<>{props.currForm ? calculateRaidStat(props.statATK, tier) : ''}</>)}
                </td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={DEF_LOGO} />
                  DEF
                </td>
                <td className="text-center" style={{ color: theme.palette.text.primary }}>
                  {reload(<>{props.currForm ? calculateRaidStat(props.statDEF, tier) : ''}</>)}
                </td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={STA_LOGO} />
                  STA
                </td>
                <td className="text-center" style={{ color: theme.palette.text.primary }}>
                  {reload(<>{props.currForm ? Math.floor(RAID_BOSS_TIER[tier].sta / RAID_BOSS_TIER[tier].CPm) : ''}</>)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Fragment>
  );
};

export default Raid;
