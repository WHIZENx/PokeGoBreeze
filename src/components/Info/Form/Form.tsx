import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { IStatsAtk, IStatsDef, IStatsProd, StatsRankingPokemonGO, IStatsSta } from '../../../core/models/stats.model';
import { useDispatch } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { Params } from '../../../utils/constants';
import {
  capitalize,
  formIconAssets,
  getDataWithKey,
  getFormFromForms,
  getPokemonFormWithNoneSpecialForm,
  isSpecialFormType,
  splitAndCapitalize,
} from '../../../utils/utils';
import APIService from '../../../services/api.service';

import './Form.scss';
import Gender from '../Gender';
import Stats from '../Stats/Stats';
import Raid from '../../Raid/Raid';
import Counter from '../../Table/Counter/Counter';
import TableMove from '../../Table/Move/MoveTable';
import Info from '../Info';
import Evolution from '../Evolution/Evolution';
import FromChange from '../FormChange/FormChange';
import { IFormInfoComponent } from '../../models/component.model';
import { PokemonType, TypeSex } from '../../../enums/type.enum';
import { combineClasses, getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber } from '../../../utils/extension';
import { IncludeMode } from '../../../utils/enums/string.enum';
import SpecialForm from '../SpecialForm/SpecialForm';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
import { SearchingActions } from '../../../store/actions';
import { PokemonGenderRatio } from '../../../core/models/pokemon.model';
import { PokemonDetail } from '../../../core/models/API/info.model';
import { formNormal } from '../../../utils/helpers/options-context.helpers';
import useRouter from '../../../composables/useRouter';
import useStats from '../../../composables/useStats';
import { Action } from 'history';
import { useSearch } from '../../../composables/useSearch';

const FormComponent = (props: IFormInfoComponent) => {
  const dispatch = useDispatch();
  const { routerAction } = useRouter();
  const { statsData } = useStats();
  const { searchingMainDetails, searchingMainForm } = useSearch();

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [statsPokemon, setStatsPokemon] = useState<StatsRankingPokemonGO>();
  const [genderRatio, setGenderRatio] = useState(new PokemonGenderRatio());

  useEffect(() => {
    if (searchingMainDetails?.fullName && searchingMainDetails.genderRatio) {
      setGenderRatio(searchingMainDetails.genderRatio);
    }
  }, [searchingMainDetails]);

  const filterFormList = useCallback(
    (stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[]) =>
      getFormFromForms(stats, props.defaultId, searchingMainForm?.form?.formName, searchingMainForm?.form?.pokemonType),
    [props.defaultId, searchingMainForm?.form?.formName]
  );

  useEffect(() => {
    if (
      statsData?.attack?.ranking &&
      statsData?.defense?.ranking &&
      statsData?.stamina?.ranking &&
      statsData?.statProd?.ranking
    ) {
      setStatsPokemon({
        atk: filterFormList(statsData.attack.ranking),
        def: filterFormList(statsData.defense.ranking),
        sta: filterFormList(statsData.stamina.ranking),
        prod: filterFormList(statsData.statProd.ranking),
      });
    }
  }, [filterFormList, statsData]);

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
    if (routerAction === Action.Pop) {
      const form = getValueOrDefault(
        String,
        searchParams.get(Params.Form)?.toUpperCase().replaceAll('_', '-'),
        formNormal()
      );
      const currentData = props.pokeData.find(
        (i) =>
          isInclude(i.name, form, IncludeMode.IncludeIgnoreCaseSensitive) ||
          (isEqual(form, formNormal()) && i.isDefault)
      );

      if (currentData) {
        findFormData(currentData.name);
      }
    }
  }, [routerAction]);

  const changeForm = (isSelected: boolean, name: string, form: string | undefined, pokemonType = PokemonType.None) => {
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
      pokemonData={searchingMainDetails}
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
        <div className={combineClasses('scroll-form', props.isLoadedForms ? 'w-100' : '')}>
          {props.isLoadedForms ? (
            <Fragment>
              {props.formList.map((value, index) => (
                <Fragment key={index}>
                  {value.map((value, index) => (
                    <button
                      key={index}
                      className={combineClasses(
                        'btn btn-form',
                        value.form.id === searchingMainForm?.form?.id ? 'form-selected' : ''
                      )}
                      onClick={() =>
                        changeForm(
                          value.form.id === searchingMainForm?.form?.id,
                          value.form.name,
                          value.form.formName,
                          value.form.pokemonType
                        )
                      }
                    >
                      <div className="d-flex w-100 justify-content-center">
                        <div className="position-relative w-9">
                          <PokemonIconType pokemonType={value.form.pokemonType} size={24}>
                            <img
                              className="pokemon-sprite-medium"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = APIService.getPokeIconSprite();
                              }}
                              alt="Image Icon Form"
                              src={formIconAssets(value)}
                            />
                          </PokemonIconType>
                        </div>
                      </div>
                      <p>
                        {!value.form.formName
                          ? capitalize(formNormal())
                          : splitAndCapitalize(value.form.formName, '-', ' ')}
                      </p>
                      <div className="d-flex flex-column">
                        {toNumber(value.form.id) > 0 && value.form.id === props.defaultId && (
                          <b>
                            <small>(Default)</small>
                          </b>
                        )}
                        {toNumber(value.form.id) <= 0 && <small className="text-danger">* Only in GO</small>}
                      </div>
                    </button>
                  ))}
                </Fragment>
              ))}
            </Fragment>
          ) : (
            <div className="ph-item flex-nowrap column-gap-2 w-100">
              {[...Array(Math.ceil(window.innerWidth / 150) + 1).keys()].map((_, index) => (
                <div key={index} className="ph-col-3 p-0 my-1">
                  <div className="ph-row">
                    <div className="ph-picture ph-col-3 m-0" style={{ height: 146, width: 90 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {genderRatio.M !== 0 || genderRatio.F !== 0 ? (
        <div className="d-flex flex-wrap row-gap-3" style={{ columnGap: 50 }}>
          {genderRatio.M !== 0 && (
            <Gender ratio={genderRatio} sex={TypeSex.Male} sprit={searchingMainForm?.form?.sprites} />
          )}
          {genderRatio.F !== 0 && (
            <Gender ratio={genderRatio} sex={TypeSex.Female} sprit={searchingMainForm?.form?.sprites} />
          )}
        </div>
      ) : (
        <Gender sex={TypeSex.Genderless} />
      )}
      <Stats
        pokemonType={searchingMainForm?.form?.pokemonType}
        statATK={statsPokemon?.atk}
        statDEF={statsPokemon?.def}
        statSTA={statsPokemon?.sta}
        statProd={statsPokemon?.prod}
        id={props.defaultId}
        form={searchingMainDetails?.form}
        isDisabled={!statsData}
      />
      <hr className="w-100" />
      <div className="row w-100 m-0">
        <div className="col-md-5 p-0 overflow-auto">
          <Info />
          {!isSpecialFormType(searchingMainForm?.form?.pokemonType) && (
            <Fragment>
              <h5>
                <li>Raid</li>
              </h5>
              <Raid
                pokemonType={searchingMainForm?.form?.pokemonType}
                id={props.defaultId}
                statATK={searchingMainDetails?.statsGO?.atk}
                statDEF={searchingMainDetails?.statsGO?.def}
                isLoadedForms={props.isLoadedForms}
              />
            </Fragment>
          )}
        </div>
        <div className="col-md-7 p-0">
          <TableMove pokemonData={searchingMainDetails} />
          <Counter pokemonData={searchingMainDetails} />
        </div>
      </div>
      <hr className="w-100" />
      {searchingMainDetails?.pokemonType !== PokemonType.GMax &&
      !isSpecialFormType(searchingMainDetails?.pokemonType) ? (
        <div className="row w-100 m-0 p-0">
          <div className="col-xl h-100 position-relative">{renderEvolution()}</div>
          <SpecialForm className="col-xl h-100 position-relative p-0" formList={props.formList} id={props.defaultId} />
        </div>
      ) : (
        renderEvolution()
      )}
      {isNotEmpty(searchingMainDetails?.formChange) && (
        <FromChange currentId={props.defaultId} pokemonData={searchingMainDetails} />
      )}
    </Fragment>
  );
};

export default FormComponent;
