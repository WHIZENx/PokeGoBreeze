import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Stats from '../Info/Stats/Stats';
import { calculateRaidStat } from '../../util/calculate';

import { Form } from 'react-bootstrap';
import { FORM_MEGA, RAID_BOSS_TIER } from '../../util/constants';

import ATK_LOGO from '../../assets/attack.png';
import DEF_LOGO from '../../assets/defense.png';
import HP_LOGO from '../../assets/hp.png';
import STA_LOGO from '../../assets/stamina.png';

import { convertPokemonAPIDataName, convertStatsEffort, getFormFromForms } from '../../util/utils';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import {
  IStatsAtk,
  IStatsDef,
  IStatsPokemon,
  IStatsProd,
  StatsRankingPokemonGO,
  IStatsSta,
  StatsAtk,
  StatsDef,
  StatsSta,
} from '../../core/models/stats.model';
import { IToolsComponent } from '../models/component.model';
import { TypeAction } from '../../enums/type.enum';
import { getValueOrDefault, isInclude, isNotEmpty, toNumber } from '../../util/extension';
import { IncludeMode } from '../../util/enums/string.enum';

const Tools = (props: IToolsComponent) => {
  const pokemonData = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.pokemon));
  const [currDataPoke, setCurrDataPoke] = useState<IStatsPokemon>();
  const [currTier, setCurrTier] = useState(props.tier);

  const [statsPokemon, setStatsPokemon] = useState<StatsRankingPokemonGO>();

  const filterFormList = useCallback(
    (stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[] | undefined) =>
      getFormFromForms(stats, props.id, props.currForm?.form.formName),
    [props.id, props.currForm?.form.formName]
  );

  useEffect(() => {
    if (props.tier > 5 && !isInclude(props.currForm?.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive)) {
      setCurrTier(5);
      if (props.setTier) {
        props.setTier(5);
      }
    } else if (
      props.tier === 5 &&
      isInclude(props.currForm?.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) &&
      pokemonData.find((item) => item.num === props.id)?.pokemonClass
    ) {
      setCurrTier(6);
      if (props.setTier) {
        props.setTier(6);
      }
    }
  }, [props.currForm?.form.formName, props.id, props.setTier, props.tier]);

  useEffect(() => {
    const formATK = filterFormList(props.stats?.attack.ranking) as IStatsAtk | undefined;
    const formDEF = filterFormList(props.stats?.defense.ranking) as IStatsDef | undefined;
    const formSTA = filterFormList(props.stats?.stamina.ranking) as IStatsSta;
    const formProd = filterFormList(props.stats?.statProd.ranking) as IStatsProd;

    setStatsPokemon({
      atk:
        props.isRaid && props.tier && !props.hide && formATK
          ? StatsAtk.create({ ...formATK, attack: calculateRaidStat(formATK.attack, props.tier) })
          : formATK,
      def:
        props.isRaid && props.tier && !props.hide && formDEF
          ? StatsDef.create({ ...formDEF, defense: calculateRaidStat(formDEF.defense, props.tier) })
          : formDEF,
      sta: props.isRaid && props.tier && !props.hide ? StatsSta.create({ ...formSTA, stamina: RAID_BOSS_TIER[props.tier]?.sta }) : formSTA,
      prod: props.isRaid && props.tier && !props.hide ? undefined : formProd,
    });
    if (props.currForm && isNotEmpty(props.dataPoke)) {
      setCurrDataPoke(convertStatsEffort(props.dataPoke.find((item) => item.id === props.id)?.stats));

      if (props.onSetStats && formATK && formDEF && formSTA) {
        props.onSetStats(
          TypeAction.ATK,
          props.isRaid && props.tier && !props.hide ? calculateRaidStat(formATK.attack, props.tier) : formATK.attack
        );
        props.onSetStats(
          TypeAction.DEF,
          props.isRaid && props.tier && !props.hide ? calculateRaidStat(formDEF.defense, props.tier) : formDEF.defense
        );
        props.onSetStats(TypeAction.STA, props.isRaid && props.tier && !props.hide ? RAID_BOSS_TIER[props.tier].sta : formSTA.stamina);
        if (props.setForm) {
          props.setForm(props.currForm);
        }
      }
    }
  }, [
    filterFormList,
    props.currForm,
    props.dataPoke,
    props.id,
    props.setForm,
    props.stats?.attack.ranking,
    props.stats?.defense.ranking,
    props.stats?.stamina.ranking,
    props.isRaid,
    props.tier,
    props.hide,
  ]);

  return (
    <Fragment>
      {props.isRaid ? (
        <div className="element-top" style={{ marginBottom: 15 }}>
          <Form.Select
            className="w-100"
            onChange={(e) => {
              setCurrTier(toNumber(e.target.value));
              if (props.setTier) {
                props.setTier(toNumber(e.target.value));
              }
              if (props.onClearStats) {
                props.onClearStats(true);
              }
            }}
            value={currTier}
          >
            <optgroup label="Normal Tiers">
              <option value={1}>Tier 1</option>
              <option value={3}>Tier 3</option>
              {!isInclude(props.currForm?.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) && (
                <option value={5}>Tier 5</option>
              )}
            </optgroup>
            <optgroup label="Legacy Tiers">
              <option value={2}>Tier 2</option>
              <option value={4}>Tier 4</option>
            </optgroup>
            {isInclude(props.currForm?.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) && (
              <Fragment>
                {pokemonData.find((item) => item.num === props.id)?.pokemonClass ? (
                  <optgroup label="Legendary Mega Tiers">
                    <option value={6}>Tier Mega</option>
                  </optgroup>
                ) : (
                  <optgroup label="Mega Tiers">
                    <option value={5}>Tier Mega</option>
                  </optgroup>
                )}
              </Fragment>
            )}
          </Form.Select>
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
                <td className="text-center">{getValueOrDefault(Number, statsPokemon?.atk?.attack)}</td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={DEF_LOGO} />
                  DEF
                </td>
                <td className="text-center">{getValueOrDefault(Number, statsPokemon?.def?.defense)}</td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={STA_LOGO} />
                  STA
                </td>
                <td className="text-center">
                  {statsPokemon?.sta ? Math.floor(statsPokemon.sta.stamina / RAID_BOSS_TIER[props.tier].CPm) : 0}
                </td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={HP_LOGO} />
                  HP
                </td>
                <td className="text-center">{RAID_BOSS_TIER[props.tier].sta}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <Stats
          statATK={statsPokemon?.atk}
          statDEF={statsPokemon?.def}
          statSTA={statsPokemon?.sta}
          statProd={statsPokemon?.prod}
          pokemonStats={props.stats}
          stats={currDataPoke}
          id={props.id}
          form={convertPokemonAPIDataName(props.currForm?.form.formName)}
        />
      )}
    </Fragment>
  );
};

export default Tools;
