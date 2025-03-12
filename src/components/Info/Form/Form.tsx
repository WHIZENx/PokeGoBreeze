import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { IStatsAtk, IStatsDef, IStatsProd, StatsRankingPokemonGO, IStatsSta } from '../../../core/models/stats.model';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { FORM_NORMAL, Params } from '../../../util/constants';
import {
  capitalize,
  convertStatsEffort,
  formIconAssets,
  getDataWithKey,
  getFormFromForms,
  getPokemonFormWithNoneSpecialForm,
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
import { StatsState } from '../../../store/models/state.model';
import { IFormInfoComponent } from '../../models/component.model';
import { Action } from 'history';
import { PokemonType, TypeSex } from '../../../enums/type.enum';
import { combineClasses, getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber } from '../../../util/extension';
import { WeightHeight } from '../../../core/models/pokemon.model';
import { IncludeMode } from '../../../util/enums/string.enum';
import SpecialForm from '../SpecialForm/SpecialForm';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';

const FormComponent = (props: IFormInfoComponent) => {
  const stats = useSelector((state: StatsState) => state.stats);

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [statsPokemon, setStatsPokemon] = useState<StatsRankingPokemonGO>();

  const filterFormList = useCallback(
    (stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[]) =>
      getFormFromForms(stats, props.defaultId, props.form?.form.formName, props.form?.form.pokemonType),
    [props.defaultId, props.form?.form.formName]
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
    const currentData = props.pokeData.find((item) => isEqual(name, item.name));
    const currentForm = props.formList?.flatMap((item) => item).find((item) => isEqual(item.form.name, name));
    props.setData(currentData);
    props.setForm(currentForm);
    const originForm = splitAndCapitalize(currentForm?.form.formName, '-', '-');
    props.setOriginForm(originForm);

    if (!isNotEmpty(props.pokeData)) {
      return;
    }

    let weight = 0;
    let height = 0;
    if (currentData) {
      weight = currentData.weight;
      height = currentData.height;
    } else {
      const defaultPokemon = props.pokeData.find((p) => p.isDefault);
      weight = toNumber(defaultPokemon?.weight);
      height = toNumber(defaultPokemon?.height);
    }
    props.setWH(WeightHeight.create({ weight, height }));
  };

  useEffect(() => {
    if (props.pokemonRouter.action === Action.Pop) {
      const form = getValueOrDefault(String, searchParams.get(Params.Form)?.toUpperCase().replaceAll('_', '-'), FORM_NORMAL);
      const currentData = props.pokeData.find(
        (i) => isInclude(i.name, form, IncludeMode.IncludeIgnoreCaseSensitive) || (isEqual(form, FORM_NORMAL) && i.isDefault)
      );

      if (currentData) {
        findFormData(currentData.name);
      }
    }
  }, [props.pokemonRouter]);

  const changeForm = (name: string, form: string | null | undefined, pokemonType = PokemonType.None) => {
    if (params.id) {
      form = getPokemonFormWithNoneSpecialForm(form, pokemonType)?.toLowerCase().replaceAll('_', '-');
      if (form) {
        searchParams.set(Params.Form, form);
      } else {
        searchParams.delete(Params.Form);
      }
      const isSpecialForm = pokemonType === PokemonType.Shadow || pokemonType === PokemonType.Purified;
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
                      className={combineClasses('btn btn-form', value.form.id === props.form?.form.id ? 'form-selected' : '')}
                      onClick={() => changeForm(value.form.name, value.form.formName, value.form.pokemonType)}
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
      {props.ratio?.M !== 0 || props.ratio?.F !== 0 ? (
        <div className="d-flex flex-wrap" style={{ columnGap: 50, rowGap: 15 }}>
          {props.ratio?.M !== 0 && <Gender ratio={props.ratio} sex={TypeSex.Male} sprit={props.form?.form.sprites} />}
          {props.ratio?.F !== 0 && <Gender ratio={props.ratio} sex={TypeSex.Female} sprit={props.form?.form.sprites} />}
        </div>
      ) : (
        <Gender sex={TypeSex.Genderless} />
      )}
      <Stats
        pokemonType={props.form?.form.pokemonType}
        statATK={statsPokemon?.atk}
        statDEF={statsPokemon?.def}
        statSTA={statsPokemon?.sta}
        statProd={statsPokemon?.prod}
        pokemonStats={stats}
        stats={convertStatsEffort(props.data?.stats)}
        id={props.defaultId}
        form={getPokemonFormWithNoneSpecialForm(props.form?.form.formName, props.form?.form.pokemonType)?.replaceAll('-', '_')}
        isDisabled={!stats}
      />
      <hr className="w-100" />
      <div className="row w-100" style={{ margin: 0 }}>
        <div className="col-md-5" style={{ padding: 0, overflow: 'auto' }}>
          <Info currForm={props.form} />
          {props.form?.form.pokemonType !== PokemonType.Shadow && props.form?.form.pokemonType !== PokemonType.Purified && (
            <Fragment>
              <h5>
                <li>Raid</li>
              </h5>
              <Raid
                currForm={props.form}
                id={props.defaultId}
                statATK={toNumber(statsPokemon?.atk?.attack, calBaseATK(convertAllStats(props.data?.stats), true))}
                statDEF={toNumber(statsPokemon?.def?.defense, calBaseDEF(convertAllStats(props.data?.stats), true))}
                isLoadedForms={props.isLoadedForms}
              />
            </Fragment>
          )}
        </div>
        <div className="col-md-7" style={{ padding: 0 }}>
          <TableMove
            data={{
              stats: convertStatsEffort(props.data?.stats),
              num: toNumber(props.defaultId),
              types: props.form?.form.types,
            }}
            form={props.form?.form}
            statATK={toNumber(statsPokemon?.atk?.attack, calBaseATK(convertAllStats(props.data?.stats), true))}
            statDEF={toNumber(statsPokemon?.def?.defense, calBaseDEF(convertAllStats(props.data?.stats), true))}
            statSTA={toNumber(statsPokemon?.sta?.stamina, calBaseSTA(convertAllStats(props.data?.stats), true))}
          />
          <Counter def={statsPokemon?.def?.defense} types={props.form?.form.types} pokemonType={props.form?.form.pokemonType} />
        </div>
      </div>
      <hr className="w-100" />
      {props.form?.form.pokemonType !== PokemonType.GMax ? (
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xl h-100 position-relative" style={{ padding: 0 }}>
            <Evolution
              setId={props.setId}
              id={props.defaultId}
              forme={props.form?.form}
              isFormDefault={props.defaultId === props.form?.form.id}
              region={props.region}
              pokemonRouter={props.pokemonRouter}
              pokemonType={props.form?.form.pokemonType}
              isLoadedForms={props.isLoadedForms}
              urlEvolutionChain={props.urlEvolutionChain}
            />
          </div>
          <SpecialForm className="col-xl h-100 position-relative" style={{ padding: 0 }} formList={props.formList} id={props.defaultId} />
        </div>
      ) : (
        <Evolution
          setId={props.setId}
          id={props.defaultId}
          forme={props.form?.form}
          isFormDefault={props.defaultId === props.form?.form.id}
          region={props.region}
          pokemonRouter={props.pokemonRouter}
          pokemonType={props.form?.form.pokemonType}
          isLoadedForms={props.isLoadedForms}
          urlEvolutionChain={props.urlEvolutionChain}
        />
      )}
      {isNotEmpty(props.pokemonDetail?.formChange) && <FromChange currentId={props.defaultId} form={props.form} />}
    </Fragment>
  );
};

export default FormComponent;
