import { ReduxRouterState } from '@lagunovsky/redux-react-router';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { PokemonFormModify } from '../../../core/models/API/form.model';
import { PokemonInfo } from '../../../core/models/API/info.model';
import { PokemonGenderRatio, PokemonDataModel } from '../../../core/models/pokemon.model';
import { StatsRankingPokemonGO } from '../../../core/models/stats.model';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { FORM_GMAX, FORM_MEGA, FORM_NORMAL, FORM_PRIMAL } from '../../../util/Constants';
import {
  capitalize,
  convertPokemonAPIDataName,
  convertStatsEffort,
  formIconAssets,
  getFormFromForms,
  splitAndCapitalize,
} from '../../../util/Utils';
import APIService from '../../../services/API.service';

import './Form.scss';
import Gender from '../Gender';
import Stats from '../Stats/Stats';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/Calculate';
import Raid from '../../Raid/Raid';
import Counter from '../../Table/Counter/Counter';
import TableMove from '../../Table/Move/MoveTable';
import Info from '../Info';
import Evolution from '../Evolution/Evolution';
import FromChange from '../FormChange/FormChange';
import Mega from '../Mega/Mega';
import Primal from '../Primal/Primal';
import { StatsState } from '../../../store/models/state.model';

const Form = (props: {
  pokemonRouter: ReduxRouterState;
  form: PokemonFormModify | undefined;
  setForm: React.Dispatch<React.SetStateAction<PokemonFormModify | undefined>>;
  setOriginForm: React.Dispatch<React.SetStateAction<string | undefined>>;
  data: PokemonInfo | undefined;
  setData: React.Dispatch<React.SetStateAction<PokemonInfo | undefined>>;
  setWH: React.Dispatch<
    React.SetStateAction<{
      weight: number;
      height: number;
    }>
  >;
  pokeData: PokemonInfo[];
  formList: PokemonFormModify[][] | undefined;
  ratio: PokemonGenderRatio | undefined;
  // eslint-disable-next-line no-unused-vars
  setId?: (id: number) => void;
  pokemonDetail: PokemonDataModel | undefined;
  defaultId: number;
  region: string;
  setProgress: React.Dispatch<
    React.SetStateAction<{
      isLoadedForms: boolean;
    }>
  >;
  isLoadedForms: boolean;
}) => {
  const stats = useSelector((state: StatsState) => state.stats);

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [statsPokemon, setStatsPokemon]: [
    StatsRankingPokemonGO | undefined,
    React.Dispatch<React.SetStateAction<StatsRankingPokemonGO | undefined>>
  ] = useState();

  const filterFormList = useCallback(
    (stats: { id: number; form: string }[]): any => getFormFromForms(stats, props.defaultId, props.form?.form.form_name),
    [props.defaultId, props.form?.form.form_name]
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
    const currentData = props.pokeData.find((item) => name === item.name);
    const currentForm = props.formList?.map((item) => item.find((item) => item.form.name === name)).find((item) => item);
    props.setData(currentData);
    props.setForm(currentForm);
    const originForm = splitAndCapitalize(currentForm?.form.form_name, '-', '-');
    props.setOriginForm(originForm);

    if (currentData) {
      props.setWH((prevWH) => ({ ...prevWH, weight: currentData.weight, height: currentData.height }));
    } else if (currentForm) {
      const oriForm = props.pokeData.at(0);
      props.setWH((prevWH) => ({ ...prevWH, weight: oriForm?.weight ?? 0, height: oriForm?.height ?? 0 }));
    } else {
      props.setWH((prevWH) => ({
        ...prevWH,
        weight: props.pokeData.at(0)?.weight ?? 0,
        height: props.pokeData.at(0)?.height ?? 0,
      }));
    }
  };

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
                      className={
                        'btn btn-form ' +
                        ((props.defaultId === props.form?.form.id && value.form.id === props.form.form.id) ||
                        (props.defaultId !== props.form?.form.id && value.form.id === props.form?.form.id)
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
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = APIService.getPokeIconSprite('unknown-pokemon');
                              APIService.getFetchUrl(e.currentTarget.currentSrc)
                                .then(() => {
                                  e.currentTarget.src = APIService.getPokeIconSprite(value.default_name);
                                })
                                .catch(() => false);
                            }}
                            alt="img-icon-form"
                            src={formIconAssets(value, props.defaultId)}
                          />
                        </div>
                      </div>
                      <p>{!value.form.form_name ? capitalize(FORM_NORMAL) : splitAndCapitalize(value.form.form_name, '-', ' ')}</p>
                      {(value.form.id ?? 0) > 0 && value.form.id === props.defaultId && (
                        <b>
                          <small>(Default)</small>
                        </b>
                      )}
                      {(value.form.id ?? 0) <= 0 && <small className="text-danger">* Only in GO</small>}
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
              sex="Male"
              default_m={props.form?.form.sprites?.front_default}
              shiny_m={props.form?.form.sprites?.front_shiny}
              default_f={props.form?.form.sprites?.front_female}
              shiny_f={props.form?.form.sprites?.front_shiny_female}
            />
          )}
          {props.ratio?.F !== 0 && (
            <Gender
              ratio={props.ratio}
              sex="Female"
              default_m={props.form?.form.sprites?.front_default}
              shiny_m={props.form?.form.sprites?.front_shiny}
              default_f={props.form?.form.sprites?.front_female}
              shiny_f={props.form?.form.sprites?.front_shiny_female}
            />
          )}
        </div>
      ) : (
        <Gender
          sex="Genderless"
          default_m={props.form?.form.sprites?.front_default}
          shiny_m={props.form?.form.sprites?.front_shiny}
          default_f={props.form?.form.sprites?.front_female}
          shiny_f={props.form?.form.sprites?.front_shiny_female}
        />
      )}
      <Stats
        isShadow={props.form?.form.is_shadow}
        statATK={statsPokemon?.atk}
        statDEF={statsPokemon?.def}
        statSTA={statsPokemon?.sta}
        statProd={statsPokemon?.prod}
        pokemonStats={stats}
        stats={convertStatsEffort(props.data?.stats)}
        id={props.defaultId}
        form={convertPokemonAPIDataName(props.form?.form.form_name)}
      />
      <hr className="w-100" />
      <div className="row w-100" style={{ margin: 0 }}>
        <div className="col-md-5" style={{ padding: 0, overflow: 'auto' }}>
          <Info currForm={props.form} />
          {!props.form?.form.is_shadow && !props.form?.form.is_purified && (
            <Fragment>
              <h5>
                <li>Raid</li>
              </h5>
              <Raid
                currForm={props.form}
                id={props.defaultId}
                statATK={statsPokemon?.atk?.attack ?? calBaseATK(props.data?.stats, true)}
                statDEF={statsPokemon?.def?.defense ?? calBaseDEF(props.data?.stats, true)}
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
              types: props.form?.form.types ?? [],
            }}
            form={props.form?.form}
            statATK={statsPokemon?.atk?.attack ?? calBaseATK(props.data?.stats, true)}
            statDEF={statsPokemon?.def?.defense ?? calBaseDEF(props.data?.stats, true)}
            statSTA={statsPokemon?.sta?.stamina ?? calBaseSTA(props.data?.stats, true)}
          />
          <Counter def={statsPokemon?.def?.defense ?? 0} types={props.form?.form.types ?? []} isShadow={props.form?.form.is_shadow} />
        </div>
      </div>
      <hr className="w-100" />
      {!props.form?.form.form_name?.toUpperCase().includes(FORM_GMAX) ? (
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xl" style={{ padding: 0 }}>
            <Evolution
              setId={props.setId}
              id={props.defaultId}
              forme={props.form?.form}
              formDefault={props.defaultId === props.form?.form.id}
              region={props.region}
              pokemonRouter={props.pokemonRouter}
              purified={props.form?.form.is_purified}
              shadow={props.form?.form.is_shadow}
              setProgress={props.setProgress}
              isLoadedForms={props.isLoadedForms}
            />
          </div>
          {props.formList?.some((item) => item.some((pokemon) => pokemon.form.form_name?.toUpperCase().includes(FORM_MEGA))) && (
            <div className="col-xl" style={{ padding: 0 }}>
              <Mega formList={props.formList ?? []} id={props.defaultId} />
            </div>
          )}
          {props.formList?.some((item) => item.some((pokemon) => pokemon.form.form_name?.toUpperCase().includes(FORM_PRIMAL))) && (
            <div className="col-xl" style={{ padding: 0 }}>
              <Primal formList={props.formList ?? []} id={props.defaultId} />
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
          purified={props.form?.form.is_purified}
          shadow={props.form?.form.is_shadow}
          setProgress={props.setProgress}
          isLoadedForms={props.isLoadedForms}
        />
      )}
      {(props.pokemonDetail?.formChange?.length ?? 0) > 0 && (
        <FromChange details={props.pokemonDetail} defaultName={props.form?.default_name} />
      )}
    </Fragment>
  );
};

export default Form;
