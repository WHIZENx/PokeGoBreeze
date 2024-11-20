import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Stats from '../Info/Stats/Stats';
import { calculateRaidStat } from '../../util/calculate';

import { Form } from 'react-bootstrap';
import { RAID_BOSS_TIER } from '../../util/constants';

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
import { PokemonClass, PokemonType, TypeAction } from '../../enums/type.enum';
import { isNotEmpty, toNumber } from '../../util/extension';

const Tools = (props: IToolsComponent) => {
  const pokemonData = useSelector((state: StoreState) => state.store.data.pokemon);
  const [currDataPoke, setCurrDataPoke] = useState<IStatsPokemon>();
  const [currTier, setCurrTier] = useState(props.tier);
  const [pokemonClass, setPokemonClass] = useState(PokemonClass.None);

  const [statsPokemon, setStatsPokemon] = useState<StatsRankingPokemonGO>();

  const filterFormList = useCallback(
    (stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[] | undefined) =>
      getFormFromForms(stats, props.id, props.currForm?.form.formName),
    [props.id, props.currForm?.form.formName]
  );

  useEffect(() => {
    const pokemonClass = pokemonData.find((item) => item.num === props.id)?.pokemonClass;
    if (pokemonClass) {
      setPokemonClass(pokemonClass);
    }
  }, [props.id]);

  useEffect(() => {
    if (props.tier > 5 && props.currForm?.form.pokemonType !== PokemonType.Mega) {
      setCurrTier(5);
      if (props.setTier) {
        props.setTier(5);
      }
    } else if (props.tier === 5 && props.currForm?.form.pokemonType === PokemonType.Mega && pokemonClass !== PokemonClass.None) {
      setCurrTier(6);
      if (props.setTier) {
        props.setTier(6);
      }
    }
  }, [props.currForm?.form.formName, props.id, props.setTier, props.tier, pokemonClass]);

  useEffect(() => {
    const formATK = filterFormList(props.stats?.attack.ranking) as IStatsAtk | undefined;
    const formDEF = filterFormList(props.stats?.defense.ranking) as IStatsDef | undefined;
    const formSTA = filterFormList(props.stats?.stamina.ranking) as IStatsSta;
    const formProd = filterFormList(props.stats?.statProd.ranking) as IStatsProd;

    setStatsPokemon({
      atk:
        props.isRaid && props.tier > 0 && !props.isHide && formATK
          ? StatsAtk.create({ ...formATK, attack: calculateRaidStat(formATK.attack, props.tier) })
          : formATK,
      def:
        props.isRaid && props.tier > 0 && !props.isHide && formDEF
          ? StatsDef.create({ ...formDEF, defense: calculateRaidStat(formDEF.defense, props.tier) })
          : formDEF,
      sta:
        props.isRaid && props.tier > 0 && !props.isHide
          ? StatsSta.create({ ...formSTA, stamina: RAID_BOSS_TIER[props.tier]?.sta })
          : formSTA,
      prod: props.isRaid && props.tier && !props.isHide ? undefined : formProd,
    });
    if (props.currForm && isNotEmpty(props.dataPoke)) {
      setCurrDataPoke(convertStatsEffort(props.dataPoke.find((item) => item.id === props.id)?.stats));

      if (props.onSetStats && formATK && formDEF && formSTA) {
        props.onSetStats(
          TypeAction.Atk,
          props.isRaid && props.tier && !props.isHide ? calculateRaidStat(formATK.attack, props.tier) : formATK.attack
        );
        props.onSetStats(
          TypeAction.Def,
          props.isRaid && props.tier && !props.isHide ? calculateRaidStat(formDEF.defense, props.tier) : formDEF.defense
        );
        props.onSetStats(TypeAction.Sta, props.isRaid && props.tier && !props.isHide ? RAID_BOSS_TIER[props.tier].sta : formSTA.stamina);
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
    props.isHide,
  ]);

  return (
    <Fragment>
      {props.isRaid ? (
        <div className="element-top" style={{ marginBottom: 15 }}>
          <Form.Select
            className="w-100"
            onChange={(e) => {
              const tier = toNumber(e.target.value);
              setCurrTier(tier);
              if (props.setTier) {
                props.setTier(tier);
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
              {props.currForm?.form.pokemonType !== PokemonType.Mega && <option value={5}>Tier 5</option>}
            </optgroup>
            <optgroup label="Legacy Tiers">
              <option value={2}>Tier 2</option>
              <option value={4}>Tier 4</option>
            </optgroup>
            {props.currForm?.form.pokemonType === PokemonType.Mega && (
              <Fragment>
                {pokemonClass !== PokemonClass.None ? (
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
                <td className="text-center">{toNumber(statsPokemon?.atk?.attack)}</td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={DEF_LOGO} />
                  DEF
                </td>
                <td className="text-center">{toNumber(statsPokemon?.def?.defense)}</td>
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
