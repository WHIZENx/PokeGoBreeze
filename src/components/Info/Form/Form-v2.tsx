import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Info from '../Info';

import TableMove from '../../Table/Move/MoveTable';
import Stats from '../Stats/Stats';

import './Form.scss';
import APIService from '../../../services/API.service';
import Evolution from '../Evolution/Evolution';
import Gender from '../Gender';
import Mega from '../Mega/Mega';
import { capitalize, convertFormNameImg, reversedCapitalize, splitAndCapitalize } from '../../../util/Utils';
import {
  FORM_GMAX,
  FORM_HERO,
  FORM_INCARNATE,
  FORM_MEGA,
  FORM_NORMAL,
  FORM_PRIMAL,
  FORM_STANDARD,
  regionList,
} from '../../../util/Constants';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/Calculate';
import Counter from '../../Table/Counter/Counter';
import { useParams, useSearchParams } from 'react-router-dom';
import Raid from '../../Raid/Raid';
import { useDispatch } from 'react-redux';
import { hideSpinner } from '../../../store/actions/spinner.action';
import { setSearchMainPage } from '../../../store/actions/searching.action';
import Primal from '../Primal/Primal';
import FromChange from '../FormChange/FormChange';
import { StatsModel } from '../../../core/models/stats.model';
import { PokemonFormModify } from '../../../core/models/API/form.model';

const Form = ({
  pokemonRouter,
  onChangeForm,
  setOnChangeForm,
  onSetReForm,
  setVersion,
  region,
  setRegion,
  setWH,
  formName,
  setFormName,
  setForm,
  setReleased,
  checkReleased,
  idDefault,
  pokeData,
  formList,
  ratio,
  stats,
  species,
  onSetIDPoke,
  paramForm,
  pokemonDetail,
}: any) => {
  const dispatch = useDispatch();

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
      .map((item: PokemonFormModify[]) => {
        return item.find((item) => item.form.is_default);
      })
      .find((item: PokemonFormModify) => item?.id === idDefault);
  }, [formList, idDefault]);

  const findForm = useCallback(() => {
    if (idDefault === 555 && paramForm === 'galar') {
      paramForm += '-standard';
    }
    return formList
      .map((form: PokemonFormModify[]) => {
        let curFrom = form.find((item) => item.form.form_name === paramForm || item.form.name === item.default_name + '-' + paramForm);
        curFrom = curFrom ?? form.find((item) => item.form.is_default) ?? form.find((item) => !item.form.is_default);
        if (paramForm && curFrom?.form.form_name !== paramForm.toLowerCase()) {
          const changeForm = form.find((item) => item.form.form_name === paramForm.toLowerCase());
          if (changeForm) {
            curFrom = changeForm;
          }
        }
        return curFrom;
      })
      .find((item: PokemonFormModify) => {
        return paramForm
          ? item.form.form_name === paramForm || item.form.name === item.default_name + '-' + paramForm
          : item.id === idDefault;
      });
  }, [formList, idDefault, paramForm]);

  const [currForm, setCurrForm]: any = useState(null);
  const defaultStats = { atk: 0, def: 0, hp: 0, spa: 0, spd: 0, spe: 0 };
  const [dataPoke, setDataPoke] = useState({
    stats: { atk: 0, def: 0, hp: 0, spa: 0, spd: 0, spe: 0 },
    species: { url: '' },
    types: [],
  });
  const [pokeID, setPokeID]: any = useState(null);
  const [statATK, setStatATK]: any = useState(null);
  const [statDEF, setStatDEF]: any = useState(null);
  const [statSTA, setStatSTA]: any = useState(null);
  const [statProd, setStatProd]: any = useState(null);

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
    (formName: string, stats: { id: number; form: string }[], id: number, formLength: number) => {
      const firstFilter = stats.find((item) => item.id === id && formName.toLowerCase() === item.form.toLowerCase());
      if (firstFilter) {
        return firstFilter;
      }
      const filterId = stats.filter((item) => item.id === id);
      const filterForm = stats.find((item) => item.id === id && filterFormName(formName, item.form));
      if (filterId.length === 1 && formLength === 1 && !filterForm) {
        return filterId.at(0);
      } else if (filterId.length === formLength && !filterForm) {
        return stats.find((item) => item && item.id === id && item.form?.toUpperCase() === FORM_NORMAL);
      } else {
        return filterForm;
      }
    },
    [filterFormName]
  );

  const findFormData = (name: string) => {
    const findData = pokeData.find((item: { name: string }) => name === item.name);
    const findForm: PokemonFormModify = formList
      .map((item: PokemonFormModify[]) => item.find((item) => item.form.name === name))
      .find((item: PokemonFormModify) => item);
    setCurrForm(findForm);
    const region = Object.values(regionList).find((item: any) => findForm.form.form_name.includes(item.toLowerCase()));
    if (findForm.form.form_name !== '' && region) {
      setRegion(region);
    } else {
      setRegion(regionList[parseInt(species.generation.url.split('/').at(6))]);
    }
    const nameInfo = splitAndCapitalize(findForm.form.name, '-', ' ');
    setFormName(nameInfo);
    setReleased(checkReleased(pokeID, nameInfo, findForm?.form?.is_default));
    setForm(splitAndCapitalize(convertFormNameImg(pokeID, findForm.form.form_name), '-', '-'));
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

  useEffect(() => {
    if (!region && formName) {
      let findForm = formList
        .map((item: PokemonFormModify[]) => item.find((item) => item.form.name === reversedCapitalize(formName, '-', ' ')))
        .find((item: PokemonFormModify) => item);
      if (!findForm) {
        findForm = formList
          .map((item: PokemonFormModify[]) =>
            item.find(
              (item) =>
                item.form.form_name?.toUpperCase() === FORM_NORMAL ||
                item.form.form_name?.toUpperCase() === FORM_STANDARD ||
                item.form.form_name?.toUpperCase() === FORM_INCARNATE
            )
          )
          .find((item: PokemonFormModify) => item);
      }
      const region = Object.values(regionList).find((item: any) => findForm?.form.form_name.includes(item.toLowerCase()));
      if (findForm?.form.form_name !== '' && region) {
        setRegion(region);
      } else {
        setRegion(regionList[parseInt(species.generation.url.split('/').at(6))]);
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
      setStatATK(filterFormList(currForm.form.form_name, stats.attack.ranking, idDefault, formList.length));
      setStatDEF(filterFormList(currForm.form.form_name, stats.defense.ranking, idDefault, formList.length));
      setStatSTA(filterFormList(currForm.form.form_name, stats.stamina.ranking, idDefault, formList.length));
      setStatProd(filterFormList(currForm.form.form_name, stats.statProd.ranking, idDefault, formList.length));
      setPokeID(findDefaultForm() ? currForm.form.id : findFirst().form.id);
    }
  }, [
    currForm,
    pokeID,
    filterFormList,
    findDefaultForm,
    findFirst,
    idDefault,
    stats.attack.ranking,
    stats.defense.ranking,
    stats.stamina.ranking,
    formList.length,
  ]);

  useEffect(() => {
    if (!onChangeForm || (!currForm && idDefault && pokeData && formList.length > 0 && pokeData.length > 0)) {
      const currentForm = findForm() ?? findFirst();
      setCurrForm(currentForm);
      setPokeID(findFirst() ? findFirst().form.id : idDefault);
      if (!dataPoke || dataPoke?.types.length === 0 || pokeID !== parseInt(dataPoke.species.url.split('/').at(6) ?? '')) {
        let data;
        if (paramForm) {
          data = pokeData.find(
            (item: { name: string; species: { name: string } }) =>
              paramForm?.toLowerCase() === item.name.replace(`${item.species.name}-`, '')
          );
        }
        if (!data) {
          data = pokeData.find((item: { id: number }) => item.id === idDefault);
        }
        setDataPoke(data);
      }
    }
  }, [currForm, findForm, findFirst, idDefault, formList.length, onChangeForm, pokeData]);

  useEffect(() => {
    if (currForm && !params.id) {
      dispatch(
        setSearchMainPage({
          id: pokeID,
          name: currForm.default_name,
          form: currForm.form.form_name,
          fullName: currForm.form.name,
          timestamp: new Date(),
        })
      );
    }
  }, [currForm]);

  const changeForm = (name: string, form: string) => {
    if (params.id) {
      searchParams.set('form', form);
      setSearchParams(searchParams);
      onSetReForm(true);
    }
    if (setOnChangeForm) {
      setOnChangeForm(true);
    }
    findFormData(name);
  };

  return (
    <Fragment>
      <div className="form-container">
        <h4 className="info-title">
          <b>Form varieties</b>
        </h4>
        <div className="scroll-form">
          {formList.map((value: PokemonFormModify[], index: React.Key | number) => (
            <Fragment key={index}>
              {value.map((value, index: React.Key | number) => (
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
                    <div className="position-relative" style={{ width: 64 }}>
                      {value.form.is_shadow && (
                        <img height={24} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
                      )}
                      {value.form.is_purified && (
                        <img height={24} alt="img-purified" className="purified-icon" src={APIService.getPokePurified()} />
                      )}
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
                          value.form.name === 'mothim-sandy' ||
                          value.form.name === 'mothim-trash' ||
                          value.form.name === 'basculin-white-striped' ||
                          value.form.name === 'greninja-battle-bond' ||
                          value.form.name === 'urshifu-rapid-strike' ||
                          (pokeID && pokeID >= 899)
                            ? APIService.getPokeIconSprite('unknown-pokemon')
                            : value.form.name.includes('-shadow') || value.form.name.includes('-purified')
                            ? APIService.getPokeIconSprite(value.name)
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
                  {(value.form.id ?? 0) <= 0 && <small className="text-danger">* Only in GO</small>}
                </button>
              ))}
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
              default_m={currForm?.form.sprites?.front_default}
              shiny_m={currForm?.form.sprites?.front_shiny}
              default_f={currForm?.form.sprites?.front_female}
              shiny_f={currForm?.form.sprites?.front_shiny_female}
            />
          )}
          {ratio.F !== 0 && (
            <Gender
              ratio={ratio}
              sex="Female"
              default_m={currForm?.form.sprites?.front_default}
              shiny_m={currForm?.form.sprites?.front_shiny}
              default_f={currForm?.form.sprites?.front_female}
              shiny_f={currForm?.form.sprites?.front_shiny_female}
            />
          )}
        </div>
      ) : (
        <Gender
          sex="Genderless"
          default_m={currForm?.form.sprites?.front_default}
          shiny_m={currForm?.form.sprites?.front_shiny}
          default_f={currForm?.form.sprites?.front_female}
          shiny_f={currForm?.form.sprites?.front_shiny_female}
        />
      )}
      <Stats
        isShadow={currForm?.form.is_shadow}
        statATK={statATK}
        statDEF={statDEF}
        statSTA={statSTA}
        statProd={statProd}
        pokemonStats={stats}
        stats={dataPoke as unknown as { stats: StatsModel }}
      />
      <hr className="w-100" />
      <div className="row w-100" style={{ margin: 0 }}>
        <div className="col-md-5" style={{ padding: 0, overflow: 'auto' }}>
          <Info data={dataPoke} currForm={currForm} />
          {!currForm?.form.is_shadow && !currForm?.form.is_purified && (
            <Fragment>
              <h5>
                <li>Raid</li>
              </h5>
              <Raid
                currForm={currForm}
                id={idDefault}
                statATK={statATK ? statATK.attack : calBaseATK(dataPoke ? dataPoke.stats : defaultStats, true)}
                statDEF={statDEF ? statDEF.defense : calBaseDEF(dataPoke ? dataPoke.stats : defaultStats, true)}
              />
            </Fragment>
          )}
        </div>
        <div className="col-md-7" style={{ padding: 0 }}>
          <TableMove
            data={dataPoke}
            form={currForm?.form}
            statATK={statATK ? statATK.attack : calBaseATK(dataPoke ? dataPoke.stats : defaultStats, true)}
            statDEF={statDEF ? statDEF.defense : calBaseDEF(dataPoke ? dataPoke.stats : defaultStats, true)}
            statSTA={statSTA ? statSTA.stamina : calBaseSTA(dataPoke ? dataPoke.stats : defaultStats, true)}
          />
          <Counter
            currForm={currForm}
            pokeID={pokeID}
            def={statDEF ? statDEF.defense : calBaseDEF(dataPoke ? dataPoke.stats : defaultStats, true)}
            form={currForm?.form}
            isShadow={currForm?.form.is_shadow}
          />
        </div>
      </div>
      <hr className="w-100" />
      {formList
        .filter((item: { form: { form_name: string } }[]) => item.at(0)?.form.form_name?.toUpperCase().includes(FORM_MEGA))
        .map((item: { form: string }[]) => item.at(0)?.form).length > 0 &&
      currForm &&
      !currForm.form.form_name?.toUpperCase().includes(FORM_GMAX) ? (
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xl" style={{ padding: 0 }}>
            <Evolution
              gen={parseInt(species.generation.url.split('/').at(6))}
              onSetIDPoke={onSetIDPoke}
              evolution_url={species.evolution_chain ? species.evolution_chain.url : []}
              id={idDefault}
              forme={currForm && currForm.form}
              formDefault={currForm && pokeID === currForm.form.id}
              pokemonRouter={pokemonRouter}
              purified={currForm?.form.is_purified}
            />
          </div>
          <div className="col-xl" style={{ padding: 0 }}>
            <Mega formList={formList} id={idDefault} />
          </div>
        </div>
      ) : formList
          .filter((item: PokemonFormModify[]) => item.at(0)?.form.form_name?.toUpperCase().includes(FORM_PRIMAL))
          .map((item: { form: string }[]) => item.at(0)?.form).length > 0 &&
        currForm &&
        !currForm.form.form_name?.toUpperCase().includes(FORM_GMAX) ? (
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xl" style={{ padding: 0 }}>
            <Evolution
              gen={parseInt(species.generation.url.split('/').at(6))}
              onSetIDPoke={onSetIDPoke}
              evolution_url={species.evolution_chain ? species.evolution_chain.url : []}
              id={idDefault}
              forme={currForm && currForm.form}
              formDefault={currForm && pokeID === currForm.form.id}
              pokemonRouter={pokemonRouter}
              purified={currForm?.form.is_purified}
            />
          </div>
          <div className="col-xl" style={{ padding: 0 }}>
            <Primal formList={formList} id={idDefault} />
          </div>
        </div>
      ) : (
        <Evolution
          gen={parseInt(species.generation.url.split('/').at(6))}
          onSetIDPoke={onSetIDPoke}
          evolution_url={species.evolution_chain ? species.evolution_chain.url : []}
          id={idDefault}
          forme={currForm && currForm.form}
          formDefault={currForm && pokeID === currForm.form.id}
          region={regionList[parseInt(species.generation.url.split('/').at(6))]}
          pokemonRouter={pokemonRouter}
          purified={currForm?.form.is_purified}
        />
      )}
      {pokemonDetail?.formChange && <FromChange details={pokemonDetail} defaultName={currForm && currForm.default_name} />}
    </Fragment>
  );
};

export default Form;
