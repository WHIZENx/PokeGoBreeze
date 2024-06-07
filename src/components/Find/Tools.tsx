import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Stats from '../Info/Stats/Stats';
import { calculateRaidStat } from '../../util/Calculate';

import { Form } from 'react-bootstrap';
import { FORM_MEGA, RAID_BOSS_TIER } from '../../util/Constants';

import atk_logo from '../../assets/attack.png';
import def_logo from '../../assets/defense.png';
import hp_logo from '../../assets/hp.png';
import sta_logo from '../../assets/stamina.png';

import { convertStatsEffort, getFormFromForms } from '../../util/Utils';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { PokemonFormModify } from '../../core/models/API/form.model';
import { PokemonInfo } from '../../core/models/API/info.model';
import { StatsModel, StatsPokemon, StatsRankingPokemonGO } from '../../core/models/stats.model';

const Tools = (props: {
  id: number | undefined;
  currForm: PokemonFormModify | undefined;
  formList: PokemonFormModify[][];
  dataPoke: PokemonInfo[];
  stats: StatsModel;
  // eslint-disable-next-line no-unused-vars
  setForm: ((form: PokemonFormModify | undefined) => void) | undefined;
  // eslint-disable-next-line no-unused-vars
  onSetStats: ((type: string, value: number) => void) | undefined;
  // eslint-disable-next-line no-unused-vars
  onClearStats: ((reset?: boolean) => void) | undefined;
  isRaid: boolean;
  tier: number;
  // eslint-disable-next-line no-unused-vars
  setTier: (tier: number) => void;
  hide: boolean | undefined;
}) => {
  const pokemonData = useSelector((state: StoreState) => state.store.data?.pokemon ?? []);
  const [currDataPoke, setCurrDataPoke]: [StatsPokemon | undefined, React.Dispatch<React.SetStateAction<StatsPokemon | undefined>>] =
    useState();
  const [currTier, setCurrTier] = useState(props.tier);

  const [statsPokemon, setStatsPokemon]: [
    StatsRankingPokemonGO | undefined,
    React.Dispatch<React.SetStateAction<StatsRankingPokemonGO | undefined>>
  ] = useState();

  const filterFormList = useCallback(
    (stats: { id: number; form: string }[]): any => getFormFromForms(stats, props.id, props.currForm?.form.form_name),
    [props.id, props.currForm?.form.form_name]
  );

  useEffect(() => {
    if (parseInt(props.tier.toString()) > 5 && !props.currForm?.form.form_name?.toUpperCase().includes(FORM_MEGA)) {
      setCurrTier(5);
      if (props.setTier) {
        props.setTier(5);
      }
    } else if (
      parseInt(props.tier.toString()) === 5 &&
      props.currForm?.form.form_name?.toUpperCase().includes(FORM_MEGA) &&
      pokemonData.find((item) => item.num === props.id)?.pokemonClass
    ) {
      setCurrTier(6);
      if (props.setTier) {
        props.setTier(6);
      }
    }
  }, [props.currForm?.form.form_name, props.id, props.setTier, props.tier]);

  useEffect(() => {
    const formATK = filterFormList(props.stats.attack.ranking);
    const formDEF = filterFormList(props.stats.defense.ranking);
    const formSTA = filterFormList(props.stats.stamina.ranking);
    const formProd = filterFormList(props.stats.statProd.ranking);

    setStatsPokemon({
      atk: props.isRaid && props.tier && !props.hide ? { attack: calculateRaidStat(formATK?.attack ?? 0, props.tier) } : formATK,
      def: props.isRaid && props.tier && !props.hide ? { defense: calculateRaidStat(formDEF?.defense ?? 0, props.tier) } : formDEF,
      sta: props.isRaid && props.tier && !props.hide ? { stamina: RAID_BOSS_TIER[props.tier]?.sta } : formSTA,
      prod: props.isRaid && props.tier && !props.hide ? 0 : formProd,
    });
    if (props.currForm && props.dataPoke) {
      setCurrDataPoke(convertStatsEffort(props.dataPoke.find((item) => item.id === props.id)?.stats));

      if (props.onSetStats && formATK && formDEF && formSTA) {
        props.onSetStats('atk', props.isRaid && props.tier && !props.hide ? calculateRaidStat(formATK.attack, props.tier) : formATK.attack);
        props.onSetStats(
          'def',
          props.isRaid && props.tier && !props.hide ? calculateRaidStat(formDEF.defense, props.tier) : formDEF.defense
        );
        props.onSetStats('sta', props.isRaid && props.tier && !props.hide ? RAID_BOSS_TIER[props.tier].sta : formSTA.stamina);
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
    props.stats.attack.ranking,
    props.stats.defense.ranking,
    props.stats.stamina.ranking,
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
              setCurrTier(parseInt(e.target.value));
              if (props.setTier) {
                props.setTier(parseInt(e.target.value));
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
              {!props.currForm?.form.form_name?.toUpperCase().includes(FORM_MEGA) && <option value={5}>Tier 5</option>}
            </optgroup>
            <optgroup label="Legacy Tiers">
              <option value={2}>Tier 2</option>
              <option value={4}>Tier 4</option>
            </optgroup>
            {props.currForm?.form.form_name?.toUpperCase().includes(FORM_MEGA) && (
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
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={atk_logo} />
                  ATK
                </td>
                <td className="text-center">{statsPokemon?.atk?.attack ?? 0}</td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={def_logo} />
                  DEF
                </td>
                <td className="text-center">{statsPokemon?.def?.defense ?? 0}</td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={sta_logo} />
                  STA
                </td>
                <td className="text-center">
                  {statsPokemon?.sta ? Math.floor(statsPokemon?.sta?.stamina / RAID_BOSS_TIER[props.tier].CPm) : 0}
                </td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={hp_logo} />
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
        />
      )}
    </Fragment>
  );
};

export default Tools;
