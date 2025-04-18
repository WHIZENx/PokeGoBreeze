import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { IStatsAtk, IStatsDef, IStatsProd, StatsRankingPokemonGO, IStatsSta } from '../../../core/models/stats.model';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { FORM_NORMAL, Params } from '../../../util/constants';
import {
  capitalize,
  formIconAssets,
  getDataWithKey,
  getFormFromForms,
  getPokemonFormWithNoneSpecialForm,
  isSpecialFormType,
  splitAndCapitalize,
} from '../../../util/utils';
import APIService from '../../../services/API.service';

import './Form.scss';
import Gender from '../Gender';
import Stats from '../Stats/Stats';
import Raid from '../../Raid/Raid';
import Counter from '../../Table/Counter/Counter';
import TableMove from '../../Table/Move/MoveTable';
import Info from '../Info';
import Evolution from '../Evolution/Evolution';
import FromChange from '../FormChange/FormChange';
import { RouterState, SearchingState, StatsState } from '../../../store/models/state.model';
import { IFormInfoComponent } from '../../models/component.model';
import { Action } from 'history';
import { PokemonType, TypeSex } from '../../../enums/type.enum';
import { combineClasses, getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber } from '../../../util/extension';
import { IncludeMode } from '../../../util/enums/string.enum';
import SpecialForm from '../SpecialForm/SpecialForm';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
import { SearchingActions } from '../../../store/actions';
import { PokemonGenderRatio } from '../../../core/models/pokemon.model';
import { PokemonDetail } from '../../../core/models/API/info.model';

const FormComponent = (props: IFormInfoComponent) => {
  const dispatch = useDispatch();
  const router = useSelector((state: RouterState) => state.router);
  const stats = useSelector((state: StatsState) => state.stats);
  const pokemonData = useSelector((state: SearchingState) => state.searching.mainSearching?.pokemon);
  const form = useSelector((state: SearchingState) => state.searching.mainSearching?.form);

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [statsPokemon, setStatsPokemon] = useState<StatsRankingPokemonGO>();
  const [genderRatio, setGenderRatio] = useState(new PokemonGenderRatio());

  useEffect(() => {
    if (pokemonData?.fullName && pokemonData.genderRatio) {
      setGenderRatio(pokemonData.genderRatio);
    }
  }, [pokemonData]);

  const filterFormList = useCallback(
    (stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[]) =>
      getFormFromForms(stats, props.defaultId, form?.form?.formName, form?.form?.pokemonType),
    [props.defaultId, form?.form?.formName]
  );

  useEffect(() => {
    if (stats) {
      setStatsPokemon({
        atk: filterFormList(stats.attack.ranking),
        def: filterFormList(stats.defense.ranking),
        sta: filterFormList(stats.stamina.ranking),
        prod: filterFormList(stats.statProd.ranking),
      });
    }
  }, [filterFormList, stats]);

  const findFormData = (name: string) => {
    let currentData = props.pokeData.find((item) => isEqual(name, item.name));
    const currentForm = props.formList.flatMap((item) => item).find((item) => isEqual(item.form.name, name));
    if (currentForm) {
      dispatch(SearchingActions.SetMainPokemonForm.create(currentForm));
    }
    currentData ??= props.pokeData.find((p) => p.isDefault);
    if (currentData) {
      const pokemonDetails = PokemonDetail.setDetails(currentData);
      dispatch(SearchingActions.SetMainPokemonDetails.create(pokemonDetails));
    }
  };

  useEffect(() => {
    if (router.action === Action.Pop) {
      const form = getValueOrDefault(String, searchParams.get(Params.Form)?.toUpperCase().replaceAll('_', '-'), FORM_NORMAL);
      const currentData = props.pokeData.find(
        (i) => isInclude(i.name, form, IncludeMode.IncludeIgnoreCaseSensitive) || (isEqual(form, FORM_NORMAL) && i.isDefault)
      );

      if (currentData) {
        findFormData(currentData.name);
      }
    }
  }, [router]);

  const changeForm = (isSelected: boolean, name: string, form: string | null | undefined, pokemonType = PokemonType.None) => {
    if (isSelected) {
      return;
    }
    if (params.id) {
      const pokemonForm = getPokemonFormWithNoneSpecialForm(form, pokemonType)?.toLowerCase().replaceAll('_', '-');
      if (pokemonForm) {
        searchParams.set(Params.Form, pokemonForm);
      } else {
        searchParams.delete(Params.Form);
      }
      const isSpecialForm = isSpecialFormType(pokemonType);
      if (isSpecialForm) {
        const formType = getDataWithKey<string>(PokemonType, pokemonType)?.toLowerCase();
        searchParams.set(Params.FormType, getValueOrDefault(String, formType));
      } else {
        searchParams.delete(Params.FormType);
      }
      setSearchParams(searchParams);
    } else {
      findFormData(name);
    }
  };

  const renderEvolution = () => (
    <Evolution
      pokemonData={pokemonData}
      id={props.defaultId}
      setSearchOption={props.setSearchOption}
      isLoadedForms={props.isLoadedForms}
      urlEvolutionChain={props.urlEvolutionChain}
    />
  );

  return (
    <Fragment>
      <div className="form-container">
        <h4 className="info-title">
          <b>Form varieties</b>
        </h4>
        <div className="scroll-form" style={{ width: props.isLoadedForms ? '100%' : '' }}>
          {props.isLoadedForms ? (
            <Fragment>
              {props.formList.map((value, index) => (
                <Fragment key={index}>
                  {value.map((value, index) => (
                    <button
                      key={index}
                      className={combineClasses('btn btn-form', value.form.id === form?.form?.id ? 'form-selected' : '')}
                      onClick={() =>
                        changeForm(value.form.id === form?.form?.id, value.form.name, value.form.formName, value.form.pokemonType)
                      }
                    >
                      <div className="d-flex w-100 justify-content-center">
                        <div className="position-relative" style={{ width: 64 }}>
                          <PokemonIconType pokemonType={value.form.pokemonType} size={24}>
                            <img
                              className="pokemon-sprite-medium"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = APIService.getPokeIconSprite();
                              }}
                              alt="img-icon-form"
                              src={formIconAssets(value)}
                            />
                          </PokemonIconType>
                        </div>
                      </div>
                      <p>{!value.form.formName ? capitalize(FORM_NORMAL) : splitAndCapitalize(value.form.formName, '-', ' ')}</p>
                      {toNumber(value.form.id) > 0 && value.form.id === props.defaultId && (
                        <b>
                          <small>(Default)</small>
                        </b>
                      )}
                      {toNumber(value.form.id) <= 0 && <small className="text-danger">* Only in GO</small>}
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
      {genderRatio.M !== 0 || genderRatio.F !== 0 ? (
        <div className="d-flex flex-wrap" style={{ columnGap: 50, rowGap: 15 }}>
          {genderRatio.M !== 0 && <Gender ratio={genderRatio} sex={TypeSex.Male} sprit={form?.form?.sprites} />}
          {genderRatio.F !== 0 && <Gender ratio={genderRatio} sex={TypeSex.Female} sprit={form?.form?.sprites} />}
        </div>
      ) : (
        <Gender sex={TypeSex.Genderless} />
      )}
      <Stats
        pokemonType={form?.form?.pokemonType}
        statATK={statsPokemon?.atk}
        statDEF={statsPokemon?.def}
        statSTA={statsPokemon?.sta}
        statProd={statsPokemon?.prod}
        pokemonStats={stats}
        id={props.defaultId}
        form={pokemonData?.forme}
        isDisabled={!stats}
      />
      <hr className="w-100" />
      <div className="row w-100" style={{ margin: 0 }}>
        <div className="col-md-5" style={{ padding: 0, overflow: 'auto' }}>
          <Info />
          {!isSpecialFormType(form?.form?.pokemonType) && (
            <Fragment>
              <h5>
                <li>Raid</li>
              </h5>
              <Raid
                currForm={form}
                id={props.defaultId}
                statATK={pokemonData?.statsGO?.atk}
                statDEF={pokemonData?.statsGO?.def}
                isLoadedForms={props.isLoadedForms}
              />
            </Fragment>
          )}
        </div>
        <div className="col-md-7" style={{ padding: 0 }}>
          <TableMove pokemonData={pokemonData} />
          <Counter pokemonData={pokemonData} />
        </div>
      </div>
      <hr className="w-100" />
      {pokemonData?.pokemonType !== PokemonType.GMax && !isSpecialFormType(pokemonData?.pokemonType) ? (
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xl h-100 position-relative" style={{ padding: 0 }}>
            {renderEvolution()}
          </div>
          <SpecialForm className="col-xl h-100 position-relative" style={{ padding: 0 }} formList={props.formList} id={props.defaultId} />
        </div>
      ) : (
        renderEvolution()
      )}
      {isNotEmpty(pokemonData?.formChange) && <FromChange currentId={props.defaultId} pokemonData={pokemonData} />}
    </Fragment>
  );
};

export default FormComponent;
