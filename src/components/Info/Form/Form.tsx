import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { IStatsAtk, IStatsDef, IStatsProd, StatsRankingPokemonGO, IStatsSta } from '../../../core/models/stats.model';
import { useDispatch } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { Params } from '../../../utils/constants';
import {
  getDataWithKey,
  getFormFromForms,
  getPokemonFormWithNoneSpecialForm,
  isSpecialFormType,
} from '../../../utils/utils';

import './Form.scss';
import Gender from '../Gender';
import Stats from '../Stats/Stats';
import Raid from '../../Raid/Raid';
import Counter from '../../Commons/Tables/Counter/Counter';
import TableMove from '../../Commons/Tables/Move/MoveTable';
import Info from '../Info';
import Evolution from '../Evolution/Evolution';
import FromChange from '../FormChange/FormChange';
import { IFormInfoComponent } from '../../models/component.model';
import { PokemonType, TypeSex } from '../../../enums/type.enum';
import { getValueOrDefault, isEqual, isInclude, isNotEmpty } from '../../../utils/extension';
import { IncludeMode } from '../../../utils/enums/string.enum';
import SpecialForm from '../SpecialForm/SpecialForm';
import { SearchingActions } from '../../../store/actions';
import { PokemonGenderRatio } from '../../../core/models/pokemon.model';
import { PokemonDetail } from '../../../core/models/API/info.model';
import { formNormal } from '../../../utils/helpers/options-context.helpers';
import useRouter from '../../../composables/useRouter';
import useStats from '../../../composables/useStats';
import { Action } from 'history';
import { useSearch } from '../../../composables/useSearch';
import ButtonGroupForm from '../../Commons/Buttons/ButtonGroupForm';
import { IPokemonFormModify } from '../../../core/models/API/form.model';

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

  const changeForm = (value: IPokemonFormModify) => {
    const isSelected = value.form.id === searchingMainForm?.form?.id;
    const name = value.form.name;
    const form = value.form.formName;
    const pokemonType = value.form.pokemonType || PokemonType.None;
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
        <ButtonGroupForm
          className="tw-my-3"
          isFullWidth
          isLoaded={props.isLoadedForms}
          forms={props.formList}
          id={searchingMainForm?.form?.id}
          defaultId={props.defaultId}
          changeForm={changeForm}
          loading={
            <div className="ph-item !tw-flex-nowrap tw-gap-x-2 tw-w-full">
              {[...Array(Math.ceil(window.innerWidth / 150) + 1).keys()].map((_, index) => (
                <div key={index} className="ph-col-3 !tw-p-0 tw-my-1">
                  <div className="ph-row">
                    <div className="ph-picture ph-col-3 !tw-m-0" style={{ height: 146, width: 90 }} />
                  </div>
                </div>
              ))}
            </div>
          }
        />
      </div>
      {genderRatio.M !== 0 || genderRatio.F !== 0 ? (
        <div className="tw-flex tw-flex-wrap tw-gap-y-3 tw-gap-x-[50px]">
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
      <hr className="tw-w-full" />
      <div className="row tw-w-full !tw-m-0">
        <div className="md:tw-w-5/12 !tw-p-0 tw-overflow-auto">
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
        <div className="md:tw-w-7/12 !tw-p-0">
          <TableMove pokemonData={searchingMainDetails} />
          <Counter pokemonData={searchingMainDetails} />
        </div>
      </div>
      <hr className="tw-w-full" />
      {searchingMainDetails?.pokemonType !== PokemonType.GMax &&
      !isSpecialFormType(searchingMainDetails?.pokemonType) ? (
        <div className="row tw-w-full !tw-m-0 !tw-p-0">
          <div className="xl:tw-flex-1 tw-h-full tw-relative">{renderEvolution()}</div>
          <SpecialForm
            className="xl:tw-flex-1 tw-h-full tw-relative !tw-p-0"
            formList={props.formList}
            id={props.defaultId}
          />
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
