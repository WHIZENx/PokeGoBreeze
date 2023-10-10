import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Info from '../Info';

import TableMove from '../../Table/Move/MoveTable';
import Stats from '../Stats/Stats';

import './Form.scss';
import APIService from '../../../services/API.service';
import Evolution from '../Evolution/Evolution';
import Gender from '../Gender';
import Mega from '../Mega/Mega';
import { capitalize, splitAndCapitalize } from '../../../util/Utils';
import { FORM_GMAX, FORM_HERO, FORM_MEGA, FORM_NORMAL, FORM_STANDARD, regionList } from '../../../util/Constants';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/Calculate';
import Counter from '../../Table/Counter/Counter';
import { useParams, useSearchParams } from 'react-router-dom';
import Raid from '../../Raid/Raid';

const Form = ({
  onSetPrev,
  onSetNext,
  onSetReForm,
  setVersion,
  setRegion,
  setWH,
  setFormName,
  idDefault,
  pokeData,
  formList,
  ratio,
  stats,
  species,
  onSetIDPoke,
  paramForm,
}: any) => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const findFirst = useCallback(() => {
    return formList
      .map((item: { form: { is_default: boolean } }[]) => {
        return item.find((item) => item.form.is_default);
      })
      .at(0);
  }, [formList]);

  const findDefaultForm = useCallback(() => {
    return formList
      .map((item: { form: { is_default: boolean } }[]) => {
        return item.find((item) => item.form.is_default);
      })
      .find((item: { id: number }) => item.id === idDefault);
  }, [formList, idDefault]);

  const findForm = () => {
    let form = paramForm;
    if (idDefault === 555 && form === 'galar') {
      form += '-standard';
    }
    return formList
      .map((f: { form: { form_name: string; name: string; is_default: boolean }; default_name: string }[]) => {
        const curFrom = f.find((item) => form && (item.form.form_name === form || item.form.name === item.default_name + '-' + form));
        return curFrom ?? f.find((item) => item.form.is_default);
      })
      .find((item: { form: { form_name: string; name: string }; default_name: string; id: number }) =>
        form ? item.form.form_name === form || item.form.name === item.default_name + '-' + form : item.id === idDefault
      );
  };

  const [currForm, setCurrForm] = useState(findForm());
  const [dataPoke, setDataPoke] = useState(pokeData.find((item: { id: number }) => item.id === idDefault));
  const pokeID = useRef(null);

  const [statATK, setStatATK]: any = useState(null);
  const [statDEF, setStatDEF]: any = useState(null);
  const [statSTA, setStatSTA]: any = useState(null);

  const filterFormName = useCallback((form: string, formStats: string) => {
    form =
      form === '' || form?.toUpperCase() === FORM_STANDARD
        ? 'Normal'
        : form?.toUpperCase().includes(FORM_MEGA)
        ? form.toLowerCase()
        : capitalize(form);
    formStats = formStats.toUpperCase().includes(FORM_MEGA) ? formStats.toLowerCase() : formStats.replaceAll('_', '-');
    formStats = formStats.toUpperCase() === FORM_HERO ? 'Normal' : formStats;
    return form.toLowerCase().includes(formStats.toLowerCase());
  }, []);

  const filterFormList = useCallback(
    (stats: any[], id: number) => {
      const filterId = stats.filter((item: { id: number }) => item.id === id);
      const firstFilter = stats.find(
        (item: { id: number; form: string }) => item.id === id && currForm.form.form_name.toLowerCase() === item.form.toLowerCase()
      );
      if (firstFilter) {
        return firstFilter;
      }
      const filterForm = stats.find(
        (item: { id: number; form: string }) => item.id === id && filterFormName(currForm.form.form_name, item.form)
      );
      if (filterId.length === 1 && formList.length === 1 && !filterForm) {
        return filterId.at(0);
      } else if (filterId.length === formList.length && !filterForm) {
        return stats.find((item: { id: number; form: string }) => item.id === id && item.form?.toUpperCase() === FORM_NORMAL);
      } else {
        return filterForm;
      }
    },
    [currForm, formList, filterFormName]
  );

  useEffect(() => {
    if (!currForm) {
      setCurrForm(findFirst());
      pokeID.current = findFirst().form.id;
    } else {
      setStatATK(filterFormList(stats.attack.ranking, idDefault));
      setStatDEF(filterFormList(stats.defense.ranking, idDefault));
      setStatSTA(filterFormList(stats.stamina.ranking, idDefault));
      if (!pokeID.current) {
        pokeID.current = findDefaultForm() ? currForm.form.id : findFirst().form.id;
      }
    }
    if (currForm && dataPoke && onSetPrev && onSetNext) {
      onSetPrev(true);
      onSetNext(true);
    }
  }, [
    filterFormList,
    currForm,
    dataPoke,
    findFirst,
    findDefaultForm,
    idDefault,
    onSetNext,
    onSetPrev,
    stats.attack.ranking,
    stats.defense.ranking,
    stats.stamina.ranking,
  ]);

  const changeForm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const [name, form] = e.currentTarget.value.split('=');
    if (params.id) {
      searchParams.set('form', form);
      setSearchParams(searchParams);
      onSetReForm(true);
    }
    const findData = pokeData.find((item: { name: string }) => name === item.name);
    const findForm = formList
      .map((item: { form: { name: string } }[]) => item.find((item) => item.form.name === name))
      .find((item: any) => item);
    setCurrForm(findForm);
    const region = Object.values(regionList).find((item: any) => findForm.form.form_name.includes(item.toLowerCase()));
    if (findForm.form.form_name !== '' && region) {
      setRegion(region);
    } else {
      setRegion(regionList[parseInt(species.generation.url.split('/').at(6))]);
    }
    setFormName(splitAndCapitalize(findForm.form.name, '-', ' '));
    if (findData && findForm) {
      const oriForm = findData;
      oriForm.types = findForm.form.types;
      setDataPoke(oriForm);
      setWH((prevWH: any) => ({ ...prevWH, weight: oriForm.weight, height: oriForm.height }));
    } else if (findForm) {
      const oriForm = pokeData.at(0);
      oriForm.types = findForm.form.types;
      setDataPoke(oriForm);
      setWH((prevWH: any) => ({ ...prevWH, weight: oriForm.weight, height: oriForm.height }));
    } else if (findData) {
      setDataPoke(findData);
      setWH((prevWH: any) => ({ ...prevWH, weight: findData.weight, height: findData.height }));
    } else {
      setDataPoke(pokeData.at(0));
      setWH((prevWH: any) => ({
        ...prevWH,
        weight: pokeData.at(0).weight,
        height: pokeData.at(0).height,
      }));
    }
    setVersion(findForm.form.version_group.name);
  };

  return (
    <Fragment>
      <div className="form-container">
        <div className="scroll-form">
          {currForm && pokeID.current && (
            <Fragment>
              {formList.map((value: any[], index: React.Key) => (
                <Fragment key={index}>
                  {value.map(
                    (
                      value: {
                        form: { name: string; form_name: string; id: null };
                        default_name: string;
                      },
                      index: React.Key
                    ) => (
                      <button
                        value={value.form.name + '=' + value.form.form_name}
                        key={index}
                        className={'btn btn-form' + (value.form.id === currForm.form.id ? ' form-selected' : '')}
                        onClick={(e) => changeForm(e)}
                      >
                        <img
                          width={64}
                          height={64}
                          onError={(e: any) => {
                            e.onerror = null;
                            e.target.src = APIService.getPokeIconSprite(value.default_name);
                          }}
                          alt="img-icon-form"
                          src={APIService.getPokeIconSprite(value.form.name)}
                        />
                        <p>{value.form.form_name === '' ? 'Normal' : splitAndCapitalize(value.form.form_name, '-', ' ')}</p>
                        {value.form.id === pokeID.current && (
                          <b>
                            <small className=""> (Default)</small>
                          </b>
                        )}
                      </button>
                    )
                  )}
                </Fragment>
              ))}
            </Fragment>
          )}
        </div>
        {dataPoke && currForm && (
          <Fragment>
            {ratio.M !== 0 || ratio.F !== 0 ? (
              <Fragment>
                {ratio.M !== 0 && (
                  <Fragment>
                    <Gender
                      ratio={ratio}
                      sex="Male"
                      default_m={currForm.form.sprites.front_default}
                      shiny_m={currForm.form.sprites.front_shiny}
                      default_f={currForm.form.sprites.front_female}
                      shiny_f={currForm.form.sprites.front_shiny_female}
                    />
                  </Fragment>
                )}
                {ratio.M !== 0 && ratio.F !== 0 && <hr />}
                {ratio.F !== 0 && (
                  <Fragment>
                    <Gender
                      ratio={ratio}
                      sex="Female"
                      default_m={currForm.form.sprites.front_default}
                      shiny_m={currForm.form.sprites.front_shiny}
                      default_f={currForm.form.sprites.front_female}
                      shiny_f={currForm.form.sprites.front_shiny_female}
                    />
                  </Fragment>
                )}
              </Fragment>
            ) : (
              <Gender
                sex="Genderless"
                default_m={currForm.form.sprites.front_default}
                shiny_m={currForm.form.sprites.front_shiny}
                default_f={currForm.form.sprites.front_female}
                shiny_f={currForm.form.sprites.front_shiny_female}
              />
            )}
            <Stats statATK={statATK} statDEF={statDEF} statSTA={statSTA} pokemonStats={stats} stats={dataPoke} />
            <hr className="w-100" />
            <div className="row w-100" style={{ margin: 0 }}>
              <div className="col-md-5" style={{ padding: 0 }}>
                <Info data={dataPoke} currForm={currForm} />
                <Raid
                  currForm={currForm}
                  id={idDefault}
                  statATK={statATK ? statATK.attack : calBaseATK(dataPoke.stats, true)}
                  statDEF={statDEF ? statDEF.defense : calBaseDEF(dataPoke.stats, true)}
                />
              </div>
              <div className="col-md-7" style={{ padding: 0 }}>
                <TableMove
                  data={dataPoke}
                  form={currForm.form}
                  statATK={statATK ? statATK.attack : calBaseATK(dataPoke.stats, true)}
                  statDEF={statDEF ? statDEF.defense : calBaseDEF(dataPoke.stats, true)}
                  statSTA={statSTA ? statSTA.stamina : calBaseSTA(dataPoke.stats, true)}
                />
                <Counter def={statDEF ? statDEF.defense : calBaseDEF(dataPoke.stats, true)} form={currForm.form} />
              </div>
            </div>
          </Fragment>
        )}
      </div>
      {dataPoke && currForm && (
        <Fragment>
          <hr className="w-100" />
          {formList
            .filter((item: { form: { form_name: string } }[]) => item.at(0)?.form.form_name?.toUpperCase().includes(FORM_MEGA))
            .map((item: { form: string }[]) => item.at(0)?.form).length > 0 &&
          !currForm.form.form_name?.toUpperCase().includes(FORM_GMAX) ? (
            <div className="row w-100" style={{ margin: 0 }}>
              <div className="col-xl" style={{ padding: 0 }}>
                <Evolution
                  onSetPrev={onSetPrev}
                  onSetNext={onSetNext}
                  onSetIDPoke={onSetIDPoke}
                  evolution_url={species.evolution_chain.url}
                  id={idDefault}
                  form={currForm.form}
                  formDefault={pokeID.current === currForm.form.id}
                  eqForm={formList.length === 1 && species.pokedex_numbers.length > 1}
                />
              </div>
              <div className="col-xl" style={{ padding: 0 }}>
                <Mega formList={formList} id={idDefault} />
              </div>
            </div>
          ) : (
            <Evolution
              onSetPrev={onSetPrev}
              onSetNext={onSetNext}
              onSetIDPoke={onSetIDPoke}
              evolution_url={species.evolution_chain.url}
              id={idDefault}
              form={currForm.form}
              formDefault={pokeID.current === currForm.form.id}
              region={regionList[parseInt(species.generation.url.split('/').at(6))]}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default Form;
