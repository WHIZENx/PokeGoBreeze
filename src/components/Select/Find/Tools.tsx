import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Stats from '../../Info/Stats/Stats';
import { calculateRaidStat } from '../../../util/Calculate';

import { Form } from 'react-bootstrap';
import { RAID_BOSS_TIER } from '../../../util/Constants';

import atk_logo from '../../../assets/attack.png';
import def_logo from '../../../assets/defense.png';
import hp_logo from '../../../assets/hp.png';
import sta_logo from '../../../assets/stamina.png';

import { capitalize } from '../../../util/Utils';
import { useSelector, RootStateOrAny } from 'react-redux';

const Tools = ({ id, currForm, formList, dataPoke, stats, setForm, onSetStats, onClearStats, raid, tier, setTier, hide }: any) => {
  const pokemonData = useSelector((state: RootStateOrAny) => state.store.data.pokemonData);
  const [currDataPoke, setCurrDataPoke]: any = useState(null);
  const [currTier, setCurrTier] = useState(tier);

  const [statATK, setStatATK]: any = useState(null);
  const [statDEF, setStatDEF]: any = useState(null);
  const [statSTA, setStatSTA]: any = useState(null);
  const [statProd, setStatProd]: any = useState(null);

  const filterFormName = useCallback((form: string, formStats: string) => {
    form = form === '' ? 'Normal' : form.includes('mega') ? form.toLowerCase() : capitalize(form);
    formStats = formStats.includes('Mega') ? formStats.toLowerCase() : formStats.replaceAll('_', '-');
    formStats = formStats === 'Hero' ? 'Normal' : formStats;
    return form.toLowerCase().includes(formStats.toLowerCase());
  }, []);

  const filterFormList = useCallback(
    (stats: any[], id: any) => {
      const filterId = stats.filter((item: { id: any }) => item.id === id);
      const filterForm = stats.find(
        (item: { id: any; form: string }) => item.id === id && item.form !== 'a' && filterFormName(currForm.form.form_name, item.form)
      );
      if (filterId.length === 1 && formList.length === 1 && !filterForm) {
        return filterId[0];
      } else if (filterId.length === formList.length && !filterForm) {
        return stats.find((item: { id: any; form: string }) => item.id === id && item.form === 'Normal');
      } else {
        return filterForm;
      }
    },
    [currForm, filterFormName, formList.length]
  );

  useEffect(() => {
    if (parseInt(tier) > 5 && currForm && !currForm.form.form_name.includes('mega')) {
      setCurrTier(5);
      if (setTier) {
        setTier(5);
      }
    } else if (
      parseInt(tier) === 5 &&
      currForm &&
      currForm.form.form_name.includes('mega') &&
      (Object.values(pokemonData).find((item: any) => item.num === id) as any)?.pokemonClass
    ) {
      setCurrTier(6);
      if (setTier) {
        setTier(6);
      }
    }
  }, [currForm, id, setTier, tier]);

  useEffect(() => {
    if (currForm && dataPoke) {
      const formATK = filterFormList(stats.attack.ranking, id);
      const formDEF = filterFormList(stats.defense.ranking, id);
      const formSTA = filterFormList(stats.stamina.ranking, id);
      const formProd = filterFormList(stats.statProd.ranking, id);

      setStatATK(raid && tier && !hide ? { attack: calculateRaidStat(formATK.attack, tier) } : formATK);
      setStatDEF(raid && tier && !hide ? { defense: calculateRaidStat(formDEF.defense, tier) } : formDEF);
      setStatSTA(raid && tier && !hide ? { stamina: RAID_BOSS_TIER[tier].sta } : formSTA);
      setStatProd(raid && tier && !hide ? null : formProd);
      setCurrDataPoke(dataPoke.find((item: { id: any }) => item.id === id));

      if (formATK && formDEF && formSTA) {
        onSetStats('atk', raid && tier && !hide ? calculateRaidStat(formATK.attack, tier) : formATK.attack);
        onSetStats('def', raid && tier && !hide ? calculateRaidStat(formDEF.defense, tier) : formDEF.defense);
        onSetStats('sta', raid && tier && !hide ? RAID_BOSS_TIER[tier].sta : formSTA.stamina);
        if (setForm) {
          setForm(currForm);
        }
      }
    }
  }, [
    filterFormList,
    currForm,
    dataPoke,
    id,
    setForm,
    stats.attack.ranking,
    stats.defense.ranking,
    stats.stamina.ranking,
    raid,
    tier,
    hide,
  ]);

  return (
    <Fragment>
      {raid ? (
        <div className="element-top" style={{ marginBottom: 15 }}>
          <Form.Select
            className="w-100"
            onChange={(e) => {
              setCurrTier(e.target.value);
              if (setTier) {
                setTier(e.target.value);
              }
              if (onClearStats) {
                onClearStats(true);
              }
            }}
            value={currTier}
          >
            <optgroup label="Normal Tiers">
              <option value={1}>Tier 1</option>
              <option value={3}>Tier 3</option>
              {currForm && !currForm.form.form_name.includes('mega') && <option value={5}>Tier 5</option>}
            </optgroup>
            <optgroup label="Legacy Tiers">
              <option value={2}>Tier 2</option>
              <option value={4}>Tier 4</option>
            </optgroup>
            {currForm && currForm.form.form_name.includes('mega') && (
              <Fragment>
                {(Object.values(pokemonData).find((item: any) => item.num === id) as any)?.pokemonClass ? (
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
                <td className="text-center">{statSTA ? Math.floor(statSTA.stamina / RAID_BOSS_TIER[tier].CPm) : 0}</td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={hp_logo} />
                  HP
                </td>
                <td className="text-center">{RAID_BOSS_TIER[tier].sta}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <Stats statATK={statATK} statDEF={statDEF} statSTA={statSTA} statProd={statProd} pokemonStats={stats} stats={currDataPoke} />
      )}
    </Fragment>
  );
};

export default Tools;
