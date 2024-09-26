import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { IStatsAtk, IStatsDef, IStatsProd, StatsRankingPokemonGO, IStatsSta } from '../../../core/models/stats.model';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { FORM_GMAX, FORM_MEGA, FORM_NORMAL, FORM_PRIMAL } from '../../../util/constants';
import {
  capitalize,
  convertPokemonAPIDataName,
  convertStatsEffort,
  formIconAssets,
  getFormFromForms,
  splitAndCapitalize,
} from '../../../util/utils';
import APIService from '../../../services/API.service';

import './Form.scss';
import Gender from '../Gender';
import Stats from '../Stats/Stats';
import { calBaseATK, calBaseDEF, calBaseSTA, convertAllStats } from '../../../util/calculate';
import Raid from '../../Raid/Raid';
import Counter from '../../Table/Counter/Counter';
import TableMove from '../../Table/Move/MoveTable';
import Info from '../Info';
import Evolution from '../Evolution/Evolution';
import FromChange from '../FormChange/FormChange';
import Mega from '../Mega/Mega';
import Primal from '../Primal/Primal';
import { StatsState } from '../../../store/models/state.model';
import { IFormInfoComponent } from '../../models/component.model';
import { Action } from 'history';
import { TypeSex } from '../../../enums/type.enum';
import { combineClasses, getValueOrDefault, isEqual, isInclude, isNotEmpty } from '../../../util/extension';
import { WeightHeight } from '../../../core/models/pokemon.model';
import { IncludeMode } from '../../../util/enums/string.enum';

const FormComponent = (props: IFormInfoComponent) => {
  const stats = useSelector((state: StatsState) => state.stats);

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [statsPokemon, setStatsPokemon] = useState<StatsRankingPokemonGO>();

  const filterFormList = useCallback(
    (stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[]) => getFormFromForms(stats, props.defaultId, props.form?.form.formName),
    [props.defaultId, props.form?.form.formName]
  );

  useEffect(() => {
    if (stats) {
      setStatsPokemon({
        atk: filterFormList(stats.attack.ranking) as IStatsAtk,
        def: filterFormList(stats.defense.ranking) as IStatsDef,
        sta: filterFormList(stats.stamina.ranking) as IStatsSta,
        prod: filterFormList(stats.statProd.ranking) as IStatsProd,
      });
    }
  }, [filterFormList, stats]);

  const findFormData = (name: string) => {
    const currentData = props.pokeData.find((item) => isEqual(name, item.name));
    const currentForm = props.formList?.flatMap((item) => item).find((item) => isEqual(item.form.name, name));
    props.setData(currentData);
    props.setForm(currentForm);
    const originForm = splitAndCapitalize(currentForm?.form.formName, '-', '-');
    props.setOriginForm(originForm);

    let weight = getValueOrDefault(Number, props.pokeData.at(0)?.weight),
      height = getValueOrDefault(Number, props.pokeData.at(0)?.height);
    if (currentData) {
      weight = currentData.weight;
      height = currentData.height;
    } else if (currentForm) {
      const oriForm = props.pokeData.at(0);
      if (oriForm) {
        weight = oriForm.weight;
        height = oriForm.height;
      }
    }
    props.setWH((prevWH) => WeightHeight.create({ ...prevWH, weight, height }));
  };

  useEffect(() => {
    if (props.pokemonRouter.action === Action.Pop) {
      const form = searchParams.get('form')?.toUpperCase() || FORM_NORMAL;
      const currentData = props.pokeData.find(
        (i) =>
          isInclude(i.name, form.replaceAll('_', '-'), IncludeMode.IncludeIgnoreCaseSensitive) ||
          (isEqual(form, FORM_NORMAL) && i.isDefault)
      );

      if (currentData) {
        findFormData(currentData.name);
      }
    }
  }, [props.pokemonRouter]);

  const changeForm = (name: string, form: string) => {
    if (params.id) {
      form = convertPokemonAPIDataName(form).toLowerCase().replaceAll('_', '-');
      searchParams.set('form', form);
      setSearchParams(searchParams);
    }
    findFormData(name);
  };

  return (
    <Fragment>
      <div className="form-container">
        <h4 className="info-title">
          <b>Form varieties</b>
        </h4>
        <div className="scroll-form" style={{ width: props.isLoadedForms ? '100%' : '' }}>
          {props.isLoadedForms ? (
            <Fragment>
              {props.formList?.map((value, index) => (
                <Fragment key={index}>
                  {value.map((value, index) => (
                    <button
                      key={index}
                      className={combineClasses(
                        'btn btn-form',
                        (props.defaultId === props.form?.form.id && value.form.id === props.form.form.id) ||
                          (props.defaultId !== props.form?.form.id && value.form.id === props.form?.form.id)
                          ? 'form-selected'
                          : ''
                      )}
                      onClick={() => changeForm(value.form.name, value.form.formName)}
                    >
                      <div className="d-flex w-100 justify-content-center">
                        <div className="position-relative" style={{ width: 64 }}>
                          {value.form.isShadow && (
                            <img height={24} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
                          )}
                          {value.form.isPurified && (
                            <img height={24} alt="img-purified" className="purified-icon" src={APIService.getPokePurified()} />
                          )}
                          <img
                            className="pokemon-sprite-medium"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = APIService.getPokeIconSprite('unknown-pokemon');
                            }}
                            alt="img-icon-form"
                            src={formIconAssets(value, props.defaultId)}
                          />
                        </div>
                      </div>
                      <p>{!value.form.formName ? capitalize(FORM_NORMAL) : splitAndCapitalize(value.form.formName, '-', ' ')}</p>
                      {getValueOrDefault(Number, value.form.id) > 0 && value.form.id === props.defaultId && (
                        <b>
                          <small>(Default)</small>
                        </b>
                      )}
                      {getValueOrDefault(Number, value.form.id) <= 0 && <small className="text-danger">* Only in GO</small>}
                    </button>
                  ))}
                </Fragment>
              ))}
            </Fragment>
          ) : (
            <div className="ph-item flex-nowrap" style={{ width: '100%', columnGap: 10 }}>
              {[...Array(Math.ceil(window.innerWidth / 150) + 1).keys()].map((_, index) => (
                <div key={index} className="ph-col-3" style={{ padding: 0, margin: '2px 0' }}>
                  <div className="ph-row">
                    <div className="ph-picture ph-col-3" style={{ height: 142, width: 90 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {props.ratio?.M !== 0 || props.ratio?.F !== 0 ? (
        <div className="d-flex flex-wrap" style={{ columnGap: 50, rowGap: 15 }}>
          {props.ratio?.M !== 0 && (
            <Gender
              ratio={props.ratio}
              sex={capitalize(TypeSex.MALE)}
              defaultM={props.form?.form.sprites?.frontDefault}
              shinyM={props.form?.form.sprites?.frontShiny}
              defaultF={props.form?.form.sprites?.frontFemale}
              shinyF={props.form?.form.sprites?.frontShinyFemale}
            />
          )}
          {props.ratio?.F !== 0 && (
            <Gender
              ratio={props.ratio}
              sex={capitalize(TypeSex.FEMALE)}
              defaultM={props.form?.form.sprites?.frontDefault}
              shinyM={props.form?.form.sprites?.frontShiny}
              defaultF={props.form?.form.sprites?.frontFemale}
              shinyF={props.form?.form.sprites?.frontShinyFemale}
            />
          )}
        </div>
      ) : (
        <Gender
          sex={capitalize(TypeSex.GENDERLESS)}
          defaultM={props.form?.form.sprites?.frontDefault}
          shinyM={props.form?.form.sprites?.frontShiny}
          defaultF={props.form?.form.sprites?.frontFemale}
          shinyF={props.form?.form.sprites?.frontShinyFemale}
        />
      )}
      <Stats
        isShadow={props.form?.form.isShadow}
        statATK={statsPokemon?.atk}
        statDEF={statsPokemon?.def}
        statSTA={statsPokemon?.sta}
        statProd={statsPokemon?.prod}
        pokemonStats={stats}
        stats={convertStatsEffort(props.data?.stats)}
        id={props.defaultId}
        form={convertPokemonAPIDataName(props.form?.form.formName)}
      />
      <hr className="w-100" />
      <div className="row w-100" style={{ margin: 0 }}>
        <div className="col-md-5" style={{ padding: 0, overflow: 'auto' }}>
          <Info currForm={props.form} />
          {!props.form?.form.isShadow && !props.form?.form.isPurified && (
            <Fragment>
              <h5>
                <li>Raid</li>
              </h5>
              <Raid
                currForm={props.form}
                id={props.defaultId}
                statATK={statsPokemon?.atk?.attack ?? calBaseATK(convertAllStats(props.data?.stats), true)}
                statDEF={statsPokemon?.def?.defense ?? calBaseDEF(convertAllStats(props.data?.stats), true)}
                isLoadedForms={props.isLoadedForms}
              />
            </Fragment>
          )}
        </div>
        <div className="col-md-7" style={{ padding: 0 }}>
          <TableMove
            data={{
              stats: convertStatsEffort(props.data?.stats),
              num: props.defaultId,
              types: getValueOrDefault(Array, props.form?.form.types),
            }}
            form={props.form?.form}
            statATK={statsPokemon?.atk?.attack ?? calBaseATK(convertAllStats(props.data?.stats), true)}
            statDEF={statsPokemon?.def?.defense ?? calBaseDEF(convertAllStats(props.data?.stats), true)}
            statSTA={statsPokemon?.sta?.stamina ?? calBaseSTA(convertAllStats(props.data?.stats), true)}
          />
          <Counter
            def={getValueOrDefault(Number, statsPokemon?.def?.defense)}
            types={getValueOrDefault(Array, props.form?.form.types)}
            isShadow={props.form?.form.isShadow}
          />
        </div>
      </div>
      <hr className="w-100" />
      {!isInclude(props.form?.form.formName, FORM_GMAX, IncludeMode.IncludeIgnoreCaseSensitive) ? (
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xl" style={{ padding: 0 }}>
            <Evolution
              setId={props.setId}
              id={props.defaultId}
              forme={props.form?.form}
              formDefault={props.defaultId === props.form?.form.id}
              region={props.region}
              pokemonRouter={props.pokemonRouter}
              purified={props.form?.form.isPurified}
              shadow={props.form?.form.isShadow}
              setProgress={props.setProgress}
              isLoadedForms={props.isLoadedForms}
            />
          </div>
          {props.formList?.some((item) =>
            item.some((pokemon) => isInclude(pokemon.form.formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive))
          ) && (
            <div className="col-xl" style={{ padding: 0 }}>
              <Mega formList={getValueOrDefault(Array, props.formList)} id={props.defaultId} />
            </div>
          )}
          {props.formList?.some((item) =>
            item.some((pokemon) => isInclude(pokemon.form.formName, FORM_PRIMAL, IncludeMode.IncludeIgnoreCaseSensitive))
          ) && (
            <div className="col-xl" style={{ padding: 0 }}>
              <Primal formList={getValueOrDefault(Array, props.formList)} id={props.defaultId} />
            </div>
          )}
        </div>
      ) : (
        <Evolution
          setId={props.setId}
          id={props.defaultId}
          forme={props.form?.form}
          formDefault={props.defaultId === props.form?.form.id}
          region={props.region}
          pokemonRouter={props.pokemonRouter}
          purified={props.form?.form.isPurified}
          shadow={props.form?.form.isShadow}
          setProgress={props.setProgress}
          isLoadedForms={props.isLoadedForms}
        />
      )}
      {isNotEmpty(props.pokemonDetail?.formChange) && <FromChange details={props.pokemonDetail} defaultName={props.form?.defaultName} />}
    </Fragment>
  );
};

export default FormComponent;
