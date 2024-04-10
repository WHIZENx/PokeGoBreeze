import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Stats from '../Info/Stats/Stats';
import { calculateRaidStat } from '../../util/Calculate';

import { Form } from 'react-bootstrap';
import { FORM_MEGA, FORM_NORMAL, RAID_BOSS_TIER } from '../../util/Constants';

import atk_logo from '../../assets/attack.png';
import def_logo from '../../assets/defense.png';
import hp_logo from '../../assets/hp.png';
import sta_logo from '../../assets/stamina.png';

import { convertStatsEffort, filterFormName } from '../../util/Utils';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { PokemonFormModify } from '../../core/models/API/form.model';
import { PokemonInfo } from '../../core/models/API/info.model';
import { StatsAtk, StatsDef, StatsModel, StatsPokemon, StatsProd, StatsSta } from '../../core/models/stats.model';

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
  raid: boolean;
  tier: number;
  // eslint-disable-next-line no-unused-vars
  setTier: (tier: number) => void;
  hide: boolean | undefined;
}) => {
  const pokemonData = useSelector((state: StoreState) => state.store.data?.pokemon ?? []);
  const [currDataPoke, setCurrDataPoke]: [StatsPokemon | undefined, React.Dispatch<React.SetStateAction<StatsPokemon | undefined>>] =
    useState();
  const [currTier, setCurrTier] = useState(props.tier);

  const [statATK, setStatATK]: [StatsAtk | undefined, React.Dispatch<React.SetStateAction<StatsAtk | undefined>>] = useState();
  const [statDEF, setStatDEF]: [StatsDef | undefined, React.Dispatch<React.SetStateAction<StatsDef | undefined>>] = useState();
  const [statSTA, setStatSTA]: [StatsSta | undefined, React.Dispatch<React.SetStateAction<StatsSta | undefined>>] = useState();
  const [statProd, setStatProd]: [StatsProd | undefined, React.Dispatch<React.SetStateAction<StatsProd | undefined>>] = useState();

  const filterFormList = useCallback(
    (stats: { id: number; form: string }[], id: number): any => {
      const filterId = stats.filter((item) => item.id === id);
      const formLength = props.formList?.filter(
        (forms) => !forms.some((modifyForm) => modifyForm.form.form_name === 'shadow' || modifyForm.form.form_name === 'purified')
      ).length;
      const filterForm = stats.find(
        (item) => item.id === id && filterFormName(props.currForm?.form.form_name ?? '', item.form.toLowerCase().replace('-sea', ''))
      );
      if (filterId.length === 1 && formLength === 1 && !filterForm) {
        return filterId.at(0);
      } else if (filterId.length === formLength && !filterForm) {
        return stats.find((item) => item.id === id && item.form?.toUpperCase() === FORM_NORMAL);
      } else {
        return filterForm;
      }
    },
    [props.currForm, props.formList]
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
  }, [props.currForm, props.id, props.setTier, props.tier]);

  useEffect(() => {
    if (props.currForm && props.dataPoke) {
      const formATK = filterFormList(props.stats.attack.ranking, props.id ?? 0);
      const formDEF = filterFormList(props.stats.defense.ranking, props.id ?? 0);
      const formSTA = filterFormList(props.stats.stamina.ranking, props.id ?? 0);
      const formProd = filterFormList(props.stats.statProd.ranking, props.id ?? 0);

      setStatATK(props.raid && props.tier && !props.hide ? { attack: calculateRaidStat(formATK?.attack, props.tier) } : formATK);
      setStatDEF(props.raid && props.tier && !props.hide ? { defense: calculateRaidStat(formDEF?.defense, props.tier) } : formDEF);
      setStatSTA(props.raid && props.tier && !props.hide ? { stamina: RAID_BOSS_TIER[props.tier]?.sta } : formSTA);
      setStatProd(props.raid && props.tier && !props.hide ? null : formProd);
      setCurrDataPoke(convertStatsEffort(props.dataPoke.find((item) => item.id === props.id)?.stats));

      if (props.onSetStats && formATK && formDEF && formSTA) {
        props.onSetStats('atk', props.raid && props.tier && !props.hide ? calculateRaidStat(formATK.attack, props.tier) : formATK.attack);
        props.onSetStats('def', props.raid && props.tier && !props.hide ? calculateRaidStat(formDEF.defense, props.tier) : formDEF.defense);
        props.onSetStats('sta', props.raid && props.tier && !props.hide ? RAID_BOSS_TIER[props.tier].sta : formSTA.stamina);
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
    props.raid,
    props.tier,
    props.hide,
  ]);

  return (
    <Fragment>
      {props.raid ? (
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
                <td className="text-center">{statATK ? statATK.attack : 0}</td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={def_logo} />
                  DEF
                </td>
                <td className="text-center">{statDEF ? statDEF.defense : 0}</td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={sta_logo} />
                  STA
                </td>
                <td className="text-center">{statSTA ? Math.floor(statSTA.stamina / RAID_BOSS_TIER[props.tier].CPm) : 0}</td>
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
        <Stats statATK={statATK} statDEF={statDEF} statSTA={statSTA} statProd={statProd} pokemonStats={props.stats} stats={currDataPoke} />
      )}
    </Fragment>
  );
};

export default Tools;
