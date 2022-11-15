import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Info from '../Info';

import TableMove from '../../Table/Move/MoveTable';
import Stats from '../Stats/Stats';

import './Form.css';
import APIService from '../../../services/API.service';
import Evolution from '../Evolution/Evolution';
import Gender from '../Gender';
import Mega from '../Mega/Mega';
import { capitalize, reversedCapitalize, splitAndCapitalize } from '../../../util/Utils';
import { regionList } from '../../../util/Constants';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/Calculate';
import Counter from '../../Table/Counter/Counter';
import { useParams, useSearchParams } from 'react-router-dom';
import Raid from '../../Raid/Raid';
import { useDispatch } from 'react-redux';
import { hideSpinner } from '../../../store/actions/spinner.action';

const Form = ({
  onChangeForm,
  setOnChangeForm,
  onSetReForm,
  setVersion,
  region,
  setRegion,
  setWH,
  formName,
  setFormName,
  id_default,
  pokeData,
  formList,
  ratio,
  stats,
  species,
  onSetIDPoke,
  paramForm,
}: any) => {
  const dispatch = useDispatch();

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const findFirst = useCallback(() => {
    return formList.map((item: any[]) => {
      return item.find((item: { form: { is_default: any } }) => item.form.is_default);
    })[0];
  }, [formList]);

  const findDefaultForm = useCallback(() => {
    return formList
      .map((item: any[]) => {
        return item.find((item: { form: { is_default: any } }) => item.form.is_default);
      })
      .find((item: { id: any }) => item && item.id === id_default);
  }, [formList, id_default]);

  const findForm = useCallback(() => {
    if (id_default === 555 && paramForm === 'galar') {
      paramForm += '-standard';
    }
    return formList
      .map((form: any[]) => {
        let curFrom = form.find(
          (item: { form: { form_name: any; name: string }; default_name: string }) =>
            item.form.form_name === paramForm || item.form.name === item.default_name + '-' + paramForm
        );
        curFrom = curFrom ?? form.find((item: { form: { is_default: any } }) => item.form.is_default);
        if (paramForm && curFrom.form.form_name !== paramForm.toLowerCase()) {
          const changeForm = form.find((item: { form: { form_name: any } }) => item.form.form_name === paramForm.toLowerCase());
          if (changeForm) {
            curFrom = changeForm;
          }
        }
        return curFrom;
      })
      .find((item: { form: { form_name: any; name: string }; default_name: string; id: any }) => {
        return paramForm
          ? item.form.form_name === paramForm || item.form.name === item.default_name + '-' + paramForm
          : item.id === id_default;
      });
  }, [formList, id_default, paramForm]);

  const [currForm, setCurrForm]: any = useState(null);
  const defaultStats = { atk: 0, def: 0, hp: 0, spa: 0, spd: 0, spe: 0 };
  const [dataPoke, setDataPoke] = useState({
    stats: { atk: 0, def: 0, hp: 0, spa: 0, spd: 0, spe: 0 },
    species: { url: '' },
    types: [],
  });
  const [pokeID, setPokeID] = useState(null);
  const [statATK, setStatATK]: any = useState(null);
  const [statDEF, setStatDEF]: any = useState(null);
  const [statSTA, setStatSTA]: any = useState(null);

  const filterFormName = useCallback((form: string, formStats: string) => {
    form = form === '' || form === 'standard' ? 'Normal' : form.includes('mega') ? form.toLowerCase() : capitalize(form);
    formStats = formStats.includes('Mega') ? formStats.toLowerCase() : formStats.replaceAll('_', '-');
    formStats = formStats === 'Hero' ? 'Normal' : formStats;
    return form.toLowerCase().includes(formStats.toLowerCase());
  }, []);

  const filterFormList = useCallback(
    (formName: string, stats: any[], id: any, formLength: number) => {
      const filterId = stats.filter((item: { id: any }) => item.id === id);
      const firstFilter = stats.find(
        (item: { id: any; form: string }) => item.id === id && formName.toLowerCase() === item.form.toLowerCase()
      );
      if (firstFilter) {
        return firstFilter;
      }
      const filterForm = stats.find((item: { id: any; form: any }) => item.id === id && filterFormName(formName, item.form));
      if (filterId.length === 1 && formLength === 1 && !filterForm) {
        return filterId[0];
      } else if (filterId.length === formLength && !filterForm) {
        return stats.find((item: { id: any; form: string }) => item && item.id === id && item.form === 'Normal');
      } else {
        return filterForm;
      }
    },
    [filterFormName]
  );

  useEffect(() => {
    if (!region && formName) {
      let findForm = formList
        .map((item: any[]) => item.find((item: { form: { name: string } }) => item.form.name === reversedCapitalize(formName, '-', ' ')))
        .find((item: any) => item);
      if (!findForm) {
        findForm = formList
          .map((item: any[]) =>
            item.find(
              (item: { form: { form_name: string } }) =>
                item.form.form_name === 'normal' || item.form.form_name === 'standard' || item.form.form_name === 'incarnate'
            )
          )
          .find((item: any) => item);
      }
      const region = Object.values(regionList).find((item: any) => findForm?.form.form_name.includes(item.toLowerCase()));
      if (findForm?.form.form_name !== '' && region) {
        setRegion(region);
      } else {
        setRegion(regionList[parseInt(species.generation.url.split('/')[6])]);
      }
    }
  }, [formList, region, setRegion, species.generation.url, formName]);

  useEffect(() => {
    if ((currForm || currForm === undefined) && pokeID) {
      dispatch(hideSpinner());
    }
  }, [pokeID, dispatch]);

  useEffect(() => {
    if (currForm && currForm.form && pokeID) {
      setStatATK(filterFormList(currForm.form.form_name, stats.attack.ranking, id_default, formList.length));
      setStatDEF(filterFormList(currForm.form.form_name, stats.defense.ranking, id_default, formList.length));
      setStatSTA(filterFormList(currForm.form.form_name, stats.stamina.ranking, id_default, formList.length));
      setPokeID(findDefaultForm() ? currForm.form.id : findFirst().form.id);
    }
  }, [
    currForm,
    pokeID,
    filterFormList,
    findDefaultForm,
    findFirst,
    id_default,
    stats.attack.ranking,
    stats.defense.ranking,
    stats.stamina.ranking,
    formList.length,
  ]);

  useEffect(() => {
    if (!onChangeForm || (!currForm && id_default && pokeData && formList.length > 0 && pokeData.length > 0)) {
      const currentForm = findForm() ?? findFirst();
      setCurrForm(currentForm);
      setPokeID(findFirst() ? findFirst().form.id : id_default);
      const data = pokeData.find((item: { id: any }) => item.id === id_default);
      setDataPoke(data);
    }
  }, [currForm, findForm, findFirst, setPokeID, id_default, formList.length, onChangeForm, pokeData]);

  const changeForm = (name: any, form: string) => {
    if (setOnChangeForm) {
      setOnChangeForm(true);
    }
    if (params.id) {
      searchParams.set('form', form);
      setSearchParams(searchParams);
      onSetReForm(true);
    }
    const findData = pokeData.find((item: { name: any }) => name === item.name);
    const findForm = formList
      .map((item: any[]) => item.find((item: { form: { name: any } }) => item.form.name === name))
      .find((item: any) => item);
    setCurrForm(findForm);
    const region = Object.values(regionList).find((item: any) => findForm.form.form_name.includes(item.toLowerCase()));
    if (findForm.form.form_name !== '' && region) {
      setRegion(region);
    } else {
      setRegion(regionList[parseInt(species.generation.url.split('/')[6])]);
    }
    setFormName(splitAndCapitalize(findForm.form.name, '-', ' '));
    if (findData && findForm) {
      const oriForm = findData;
      oriForm.types = findForm.form.types;
      setDataPoke(oriForm);
      setWH((prevWH: any) => ({ ...prevWH, weight: oriForm.weight, height: oriForm.height }));
    } else if (findForm) {
      const oriForm = pokeData[0];
      oriForm.types = findForm.form.types;
      setDataPoke(oriForm);
      setWH((prevWH: any) => ({ ...prevWH, weight: oriForm.weight, height: oriForm.height }));
    } else if (findData) {
      setDataPoke(findData);
      setWH((prevWH: any) => ({ ...prevWH, weight: findData.weight, height: findData.height }));
    } else {
      setDataPoke(pokeData[0]);
      setWH((prevWH: any) => ({
        ...prevWH,
        weight: pokeData[0].weight,
        height: pokeData[0].height,
      }));
    }
    setVersion(findForm.form.version_group.name);
  };

  return (
    <Fragment>
      <div className="form-container">
        <div className="scroll-form">
          {formList.map((value: any[], index: React.Key | number) => (
            <Fragment key={index}>
              {value.map(
                (
                  value: {
                    form: { id: null; name: string; form_name: string };
                    default_name: string;
                  },
                  index: React.Key | number
                ) => (
                  <button
                    key={index}
                    className={
                      'btn btn-form ' +
                      ((currForm && pokeID === currForm.form.id && value.form.id === currForm.form.id) ||
                      (currForm && pokeID !== currForm.form.id && value.form.id === currForm.form.id)
                        ? 'form-selected'
                        : '')
                    }
                    onClick={() => changeForm(value.form.name, value.form.form_name)}
                  >
                    <div className="d-flex w-100 justify-content-center">
                      <div style={{ width: 64 }}>
                        <img
                          className="pokemon-sprite-medium"
                          onError={(e: any) => {
                            e.onerror = null;
                            APIService.getFetchUrl(e.target.currentSrc)
                              .then(() => {
                                e.target.src = APIService.getPokeIconSprite(value.default_name);
                              })
                              .catch(() => {
                                e.target.src = APIService.getPokeIconSprite('unknown-pokemon');
                              });
                          }}
                          alt="img-icon-form"
                          src={
                            value.form.name.includes('-totem') ||
                            value.form.name.includes('-hisui') ||
                            value.form.name.includes('power-construct') ||
                            value.form.name.includes('own-tempo') ||
                            value.form.name.includes('-meteor') ||
                            value.form.name === 'mewtwo-armor' ||
                            value.form.name === 'arceus-unknown' ||
                            value.form.name === 'dialga-origin' ||
                            value.form.name === 'palkia-origin' ||
                            value.form.name === 'basculin-white-striped' ||
                            value.form.name === 'greninja-battle-bond' ||
                            value.form.name === 'urshifu-rapid-strike' ||
                            (pokeID && pokeID >= 899)
                              ? APIService.getPokeIconSprite('unknown-pokemon')
                              : APIService.getPokeIconSprite(value.form.name)
                          }
                        />
                      </div>
                    </div>
                    <p>{value.form.form_name === '' ? 'Normal' : splitAndCapitalize(value.form.form_name, '-', ' ')}</p>
                    {value.form.id === pokeID && (
                      <b>
                        <small>(Default)</small>
                      </b>
                    )}
                    {!value.form.id && <small className="text-danger">* Only in GO</small>}
                  </button>
                )
              )}
            </Fragment>
          ))}
        </div>
      </div>
      {ratio.M !== 0 || ratio.F !== 0 ? (
        <div className="d-flex flex-wrap" style={{ columnGap: 50, rowGap: 15 }}>
          {ratio.M !== 0 && (
            <Gender
              ratio={ratio}
              sex="Male"
              default_m={currForm && currForm.form.sprites.front_default}
              shiny_m={currForm && currForm.form.sprites.front_shiny}
              default_f={currForm && currForm.form.sprites.front_female}
              shiny_f={currForm && currForm.form.sprites.front_shiny_female}
            />
          )}
          {ratio.F !== 0 && (
            <Gender
              ratio={ratio}
              sex="Female"
              default_m={currForm && currForm.form.sprites.front_default}
              shiny_m={currForm && currForm.form.sprites.front_shiny}
              default_f={currForm && currForm.form.sprites.front_female}
              shiny_f={currForm && currForm.form.sprites.front_shiny_female}
            />
          )}
        </div>
      ) : (
        <Gender
          sex="Genderless"
          default_m={currForm && (currForm.form.sprites ? currForm.form.sprites.front_default : APIService.getPokeSprite(0))}
          shiny_m={currForm && (currForm.form.sprites ? currForm.form.sprites.front_shiny : APIService.getPokeSprite(0))}
          default_f={currForm && (currForm.form.sprites ? currForm.form.sprites.front_female : APIService.getPokeSprite(0))}
          shiny_f={currForm && (currForm.form.sprites ? currForm.form.sprites.front_shiny_female : APIService.getPokeSprite(0))}
        />
      )}
      <Stats statATK={statATK} statDEF={statDEF} statSTA={statSTA} pokemonStats={stats} stats={dataPoke} />
      <hr className="w-100" />
      <div className="row w-100" style={{ margin: 0 }}>
        <div className="col-md-5" style={{ padding: 0, overflow: 'auto' }}>
          <Info data={dataPoke} currForm={currForm} />
          <h5 className="element-top">
            <li>Raid</li>
          </h5>
          <Raid
            currForm={currForm}
            id={id_default}
            statATK={statATK ? statATK.attack : calBaseATK(dataPoke ? dataPoke.stats : defaultStats, true)}
            statDEF={statDEF ? statDEF.defense : calBaseDEF(dataPoke ? dataPoke.stats : defaultStats, true)}
          />
        </div>
        <div className="col-md-7" style={{ padding: 0 }}>
          <TableMove
            data={dataPoke}
            form={currForm && currForm.form}
            statATK={statATK ? statATK.attack : calBaseATK(dataPoke ? dataPoke.stats : defaultStats, true)}
            statDEF={statDEF ? statDEF.defense : calBaseDEF(dataPoke ? dataPoke.stats : defaultStats, true)}
            statSTA={statSTA ? statSTA.stamina : calBaseSTA(dataPoke ? dataPoke.stats : defaultStats, true)}
          />
          <Counter
            changeForm={changeForm}
            def={statDEF ? statDEF.defense : calBaseDEF(dataPoke ? dataPoke.stats : defaultStats, true)}
            form={currForm && currForm.form}
          />
        </div>
      </div>
      <hr className="w-100" />
      {formList
        .filter((item: { form: { form_name: string | string[] } }[]) => item[0].form.form_name.includes('mega'))
        .map((item: { form: any }[]) => item[0].form).length > 0 &&
      currForm &&
      !currForm.form.form_name.includes('gmax') ? (
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xl" style={{ padding: 0 }}>
            <Evolution
              gen={parseInt(species.generation.url.split('/')[6])}
              onSetIDPoke={onSetIDPoke}
              evolution_url={species.evolution_chain ? species.evolution_chain.url : []}
              id={id_default}
              forme={currForm && currForm.form}
              formDefault={currForm && pokeID === currForm.form.id}
              eqForm={formList.length === 1 && species.pokedex_numbers.length > 1}
            />
          </div>
          <div className="col-xl" style={{ padding: 0 }}>
            <Mega formList={formList} id={id_default} />
          </div>
        </div>
      ) : (
        <Evolution
          gen={parseInt(species.generation.url.split('/')[6])}
          onSetIDPoke={onSetIDPoke}
          evolution_url={species.evolution_chain ? species.evolution_chain.url : []}
          id={id_default}
          forme={currForm && currForm.form}
          formDefault={currForm && pokeID === currForm.form.id}
          region={regionList[parseInt(species.generation.url.split('/')[6])]}
        />
      )}
    </Fragment>
  );
};

export default Form;
