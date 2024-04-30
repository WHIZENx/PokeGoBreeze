import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Info from '../Info';

import TableMove from '../../Table/Move/MoveTable';
import Stats from '../Stats/Stats';

import './Form.scss';
import APIService from '../../../services/API.service';
import Evolution from '../Evolution/Evolution';
import Gender from '../Gender';
import Mega from '../Mega/Mega';
import {
  capitalize,
  convertFormNameImg,
  convertStatsEffort,
  filterFormName,
  reversedCapitalize,
  splitAndCapitalize,
} from '../../../util/Utils';
import {
  FORM_GMAX,
  FORM_INCARNATE,
  FORM_MEGA,
  FORM_NORMAL,
  FORM_PRIMAL,
  FORM_PURIFIED,
  FORM_SHADOW,
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
import { StatsAtk, StatsDef, StatsModel, StatsPokemon, StatsProd, StatsSta } from '../../../core/models/stats.model';
import { PokemonDataForm, PokemonFormModify } from '../../../core/models/API/form.model';
import { ReduxRouterState } from '@lagunovsky/redux-react-router';
import { PokemonInfo } from '../../../core/models/API/info.model';
import { Species } from '../../../core/models/API/species.model';
import { PokemonDataModel, PokemonGenderRatio } from '../../../core/models/pokemon.model';

const Form = (props: {
  pokemonRouter: ReduxRouterState;
  onChangeForm: boolean;
  setOnChangeForm: React.Dispatch<React.SetStateAction<boolean>>;
  onSetReForm: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line no-unused-vars
  setVersion: (version: string) => void;
  region: string;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
  setWH: React.Dispatch<
    React.SetStateAction<{
      weight: number;
      height: number;
    }>
  >;
  formName: string | undefined;
  setFormName: React.Dispatch<React.SetStateAction<string | undefined>>;
  setForm: React.Dispatch<React.SetStateAction<string | undefined>>;
  idDefault: number | undefined;
  pokeData: PokemonInfo[];
  formList: PokemonFormModify[][] | undefined;
  ratio: PokemonGenderRatio | undefined;
  stats: StatsModel;
  species: Species | undefined;
  // eslint-disable-next-line no-unused-vars
  onSetIDPoke?: (id: number) => void;
  paramForm: string | undefined | null;
  pokemonDetail: PokemonDataModel | undefined;
}) => {
  const dispatch = useDispatch();

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const findFirst = useCallback(() => {
    return props.formList
      ?.map((item) => {
        return item.find((item) => item.form.is_default);
      })
      .at(0);
  }, [props.formList]);

  const findForm = useCallback(() => {
    if (props.idDefault === 555 && props.paramForm === 'galar') {
      props.paramForm += `-${FORM_STANDARD.toLowerCase()}`;
    }
    return props.formList
      ?.map((form) => {
        let curFrom = form.find(
          (item) => item.form.form_name === props.paramForm || item.form.name === item.default_name + '-' + props.paramForm
        );
        curFrom = curFrom ?? form.find((item) => item.form.is_default) ?? form.find((item) => !item.form.is_default);
        if (props.paramForm && curFrom?.form.form_name !== props.paramForm.toLowerCase()) {
          const changeForm = form.find((item) => item.form.form_name === props.paramForm?.toLowerCase());
          if (changeForm) {
            curFrom = changeForm;
          }
        }
        return curFrom;
      })
      .find((item) => {
        return props.paramForm
          ? item?.form.form_name === props.paramForm || item?.form.name === item?.default_name + '-' + props.paramForm
          : item?.id === props.idDefault;
      });
  }, [props.formList, props.idDefault, props.paramForm]);

  const [currForm, setCurrForm]: [PokemonFormModify | undefined, React.Dispatch<React.SetStateAction<PokemonFormModify | undefined>>] =
    useState();
  const defaultStats = new StatsPokemon();
  const [dataPoke, setDataPoke]: [PokemonDataForm, React.Dispatch<React.SetStateAction<PokemonDataForm>>] = useState({
    stats: defaultStats,
    types: [] as string[],
  });
  const [pokeID, setPokeID] = useState(0);
  const [statATK, setStatATK]: [StatsAtk | undefined, React.Dispatch<React.SetStateAction<StatsAtk | undefined>>] = useState();
  const [statDEF, setStatDEF]: [StatsDef | undefined, React.Dispatch<React.SetStateAction<StatsDef | undefined>>] = useState();
  const [statSTA, setStatSTA]: [StatsSta | undefined, React.Dispatch<React.SetStateAction<StatsSta | undefined>>] = useState();
  const [statProd, setStatProd]: [StatsProd | undefined, React.Dispatch<React.SetStateAction<StatsProd | undefined>>] = useState();

  const filterFormList = useCallback(
    (stats: { id: number; form: string }[]): any => {
      const id = props.idDefault;
      const formLength = props.formList?.filter(
        (forms) =>
          !forms.some(
            (modifyForm) =>
              modifyForm.form.form_name.toUpperCase() === FORM_SHADOW || modifyForm.form.form_name.toUpperCase() === FORM_PURIFIED
          )
      ).length;
      const filterId = stats?.filter((item) => item.id === id);
      const filterForm = stats.find(
        (item) =>
          item.id === id &&
          filterFormName(
            currForm?.form.form_name?.replace(/10$/g, `complete-ten-percent`).replace(/50$/g, `complete-fifty-percent`) ?? '',
            item.form.toLowerCase().replace('-sea', '').replace('-wings', '').replace('-mane', '')
          )
      );
      if (filterId.length === 1 && formLength === 1 && !filterForm) {
        return filterId.at(0);
      } else if (filterId.length === formLength && !filterForm) {
        return stats.find((item) => item.id === id && item.form?.toUpperCase() === FORM_NORMAL);
      } else {
        return filterForm;
      }
    },
    [props.idDefault, props.formList, currForm?.form]
  );

  const findFormData = (name: string) => {
    const findData = props.pokeData.find((item) => name === item.name);
    const findForm = props.formList?.map((item) => item.find((item) => item.form.name === name)).find((item) => item);
    if (!params.id) {
      setCurrForm(findForm);
    }
    const region = Object.values(regionList).find((item) => findForm?.form.form_name.includes(item.toLowerCase()));
    if (findForm?.form.form_name !== '' && region) {
      props.setRegion(!props.region || props.region !== region ? region : props.region);
    } else {
      props.setRegion(regionList[parseInt(props.species?.generation.url.split('/').at(6) ?? '0')]);
    }
    const nameInfo = splitAndCapitalize(findForm?.form.name, '-', ' ');
    props.setFormName(nameInfo);
    props.setForm(splitAndCapitalize(convertFormNameImg(pokeID, findForm?.form.form_name ?? ''), '-', '-'));
    if (findData && findForm) {
      const oriForm = findData;
      setDataPoke({
        stats: convertStatsEffort(oriForm.stats),
        types: findForm.form.types,
        url: oriForm.species.url,
      });
      props.setWH((prevWH) => ({ ...prevWH, weight: oriForm.weight, height: oriForm.height }));
    } else if (findForm) {
      const oriForm = props.pokeData.at(0);
      setDataPoke({
        stats: convertStatsEffort(oriForm?.stats),
        types: findForm.form.types,
        url: oriForm?.species.url,
      });
      props.setWH((prevWH) => ({ ...prevWH, weight: oriForm?.weight ?? 0, height: oriForm?.height ?? 0 }));
    } else if (findData) {
      setDataPoke({
        stats: convertStatsEffort(findData.stats),
        types: findData.types.map((item) => item.type.name),
        url: findData.species.url,
      });
      props.setWH((prevWH) => ({ ...prevWH, weight: findData.weight, height: findData.height }));
    } else {
      const oriForm = props.pokeData.at(0);
      setDataPoke({
        stats: convertStatsEffort(oriForm?.stats),
        types: oriForm?.types.map((item) => item.type.name) ?? [],
        url: oriForm?.species.url,
      });
      props.setWH((prevWH) => ({
        ...prevWH,
        weight: props.pokeData.at(0)?.weight ?? 0,
        height: props.pokeData.at(0)?.height ?? 0,
      }));
    }
    props.setVersion(findForm?.form.version_group.name ?? '');
  };

  useEffect(() => {
    if (!props.region && props.formName && props.formList && props.formList.length > 0) {
      let findForm = props.formList
        .map((item) => item.find((item) => item.form.name === reversedCapitalize(props.formName ?? '', '-', ' ')))
        .find((item) => item);
      if (!findForm) {
        findForm = props.formList
          ?.map((item) =>
            item.find(
              (item) =>
                item.form.form_name?.toUpperCase() === FORM_NORMAL ||
                item.form.form_name?.toUpperCase() === FORM_STANDARD ||
                item.form.form_name?.toUpperCase() === FORM_INCARNATE
            )
          )
          .find((item) => item);
      }
      const region = Object.values(regionList).find((item) => findForm?.form.form_name.includes(item.toLowerCase()));
      if (findForm?.form.form_name !== '' && region) {
        props.setRegion(!props.region || props.region !== region ? region : props.region);
      } else {
        props.setRegion(regionList[parseInt(props.species?.generation.url.split('/').at(6) ?? '0')]);
      }
    }
  }, [props.formList, props.region, props.setRegion, props.species?.generation.url, props.formName]);

  useEffect(() => {
    if (currForm && pokeID && statATK && statDEF && statSTA && statProd && dataPoke) {
      dispatch(hideSpinner());
    }
  }, [currForm, pokeID, statATK, statDEF, statSTA, statProd, dataPoke, dispatch]);

  useEffect(() => {
    if (props.stats) {
      setStatATK(filterFormList(props.stats.attack.ranking));
      setStatDEF(filterFormList(props.stats.defense.ranking));
      setStatSTA(filterFormList(props.stats.stamina.ranking));
      setStatProd(filterFormList(props.stats.statProd.ranking));
    }
  }, [filterFormList, props.stats]);

  useEffect(() => {
    if (
      (!props.onChangeForm && currForm) ||
      (!currForm && props.idDefault && props.pokeData && props.formList && props.formList.length > 0 && props.pokeData.length > 0)
    ) {
      const form = findForm();
      const formFirst = findFirst();
      setCurrForm(form ?? formFirst);
      setPokeID(formFirst ? formFirst.form.id ?? 0 : props.idDefault ?? 0);
      if (!dataPoke || dataPoke?.types.length === 0 || pokeID !== parseInt(dataPoke.url?.split('/').at(6) ?? '')) {
        let data;
        if (props.paramForm) {
          data = props.pokeData.find((item) => props.paramForm?.toLowerCase() === item.name.replace(`${item.species.name}-`, ''));
        }
        if (!data) {
          data = props.pokeData.find((item) => item.id === props.idDefault);
        }
        if (data) {
          setDataPoke({
            stats: convertStatsEffort(data.stats),
            types: data.types.map((item) => item.type.name),
            url: data.species.url,
          });
        }
      }
    }
  }, [currForm, findForm, findFirst, props.idDefault, props.formList, props.onChangeForm, props.pokeData]);

  useEffect(() => {
    if (currForm && pokeID && !params.id) {
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
  }, [currForm, pokeID]);

  const changeForm = (name: string, form: string) => {
    if (params.id) {
      searchParams.set('form', form);
      setSearchParams(searchParams);
      props.onSetReForm(true);
    } else {
      findFormData(name);
    }
    if (props.setOnChangeForm) {
      props.setOnChangeForm(true);
    }
  };

  const formAssets = (value: PokemonFormModify) => {
    return value.form.name.includes('-totem') ||
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
      : value.form.name.includes(`-${FORM_SHADOW.toLowerCase()}`) || value.form.name.includes(`-${FORM_PURIFIED.toLowerCase()}`)
      ? APIService.getPokeIconSprite(value.name)
      : APIService.getPokeIconSprite(value.form.name);
  };

  return (
    <Fragment>
      <div className="form-container">
        <h4 className="info-title">
          <b>Form varieties</b>
        </h4>
        <div className="scroll-form">
          {props.formList?.map((value, index) => (
            <Fragment key={index}>
              {value.map((value, index) => (
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
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          APIService.getFetchUrl(e.currentTarget.currentSrc)
                            .then(() => {
                              e.currentTarget.src = APIService.getPokeIconSprite(value.default_name);
                            })
                            .catch(() => {
                              e.currentTarget.src = APIService.getPokeIconSprite('unknown-pokemon');
                            });
                        }}
                        alt="img-icon-form"
                        src={formAssets(value)}
                      />
                    </div>
                  </div>
                  <p>{value.form.form_name === '' ? capitalize(FORM_NORMAL) : splitAndCapitalize(value.form.form_name, '-', ' ')}</p>
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
      {props.ratio?.M !== 0 || props.ratio?.F !== 0 ? (
        <div className="d-flex flex-wrap" style={{ columnGap: 50, rowGap: 15 }}>
          {props.ratio?.M !== 0 && (
            <Gender
              ratio={props.ratio}
              sex="Male"
              default_m={currForm?.form.sprites?.front_default}
              shiny_m={currForm?.form.sprites?.front_shiny}
              default_f={currForm?.form.sprites?.front_female}
              shiny_f={currForm?.form.sprites?.front_shiny_female}
            />
          )}
          {props.ratio?.F !== 0 && (
            <Gender
              ratio={props.ratio}
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
        pokemonStats={props.stats}
        stats={dataPoke.stats}
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
                id={props.idDefault}
                statATK={statATK?.attack ?? calBaseATK(dataPoke ? dataPoke.stats : defaultStats, true)}
                statDEF={statDEF?.defense ?? calBaseDEF(dataPoke ? dataPoke.stats : defaultStats, true)}
              />
            </Fragment>
          )}
        </div>
        <div className="col-md-7" style={{ padding: 0 }}>
          <TableMove
            data={dataPoke}
            form={currForm?.form}
            statATK={statATK?.attack ?? calBaseATK(dataPoke ? dataPoke.stats : defaultStats, true)}
            statDEF={statDEF?.defense ?? calBaseDEF(dataPoke ? dataPoke.stats : defaultStats, true)}
            statSTA={statSTA?.stamina ?? calBaseSTA(dataPoke ? dataPoke.stats : defaultStats, true)}
          />
          <Counter def={statDEF?.defense ?? 0} types={currForm?.form.types ?? []} isShadow={currForm?.form.is_shadow} />
        </div>
      </div>
      <hr className="w-100" />
      {(props.formList?.filter((item) => item.at(0)?.form.form_name?.toUpperCase().includes(FORM_MEGA)).map((item) => item.at(0)?.form)
        ?.length ?? 0) > 0 &&
      currForm &&
      !currForm.form.form_name?.toUpperCase().includes(FORM_GMAX) ? (
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xl" style={{ padding: 0 }}>
            <Evolution
              onSetIDPoke={props.onSetIDPoke}
              id={props.idDefault}
              forme={currForm?.form}
              formDefault={pokeID === currForm?.form.id}
              region={regionList[parseInt(props.species?.generation.url.split('/').at(6) ?? '0')]}
              pokemonRouter={props.pokemonRouter}
              purified={currForm?.form.is_purified}
            />
          </div>
          <div className="col-xl" style={{ padding: 0 }}>
            <Mega formList={props.formList ?? []} id={props.idDefault ?? 0} />
          </div>
        </div>
      ) : (props.formList?.filter((item) => item.at(0)?.form.form_name?.toUpperCase().includes(FORM_PRIMAL)).map((item) => item.at(0)?.form)
          ?.length ?? 0) > 0 &&
        currForm &&
        !currForm.form.form_name?.toUpperCase().includes(FORM_GMAX) ? (
        <div className="row w-100" style={{ margin: 0 }}>
          <div className="col-xl" style={{ padding: 0 }}>
            <Evolution
              onSetIDPoke={props.onSetIDPoke}
              id={props.idDefault}
              forme={currForm?.form}
              formDefault={pokeID === currForm?.form.id}
              region={regionList[parseInt(props.species?.generation.url.split('/').at(6) ?? '0')]}
              pokemonRouter={props.pokemonRouter}
              purified={currForm?.form.is_purified}
            />
          </div>
          <div className="col-xl" style={{ padding: 0 }}>
            <Primal formList={props.formList ?? []} id={props.idDefault ?? 0} />
          </div>
        </div>
      ) : (
        <Evolution
          onSetIDPoke={props.onSetIDPoke}
          id={props.idDefault}
          forme={currForm?.form}
          formDefault={pokeID === currForm?.form.id}
          region={regionList[parseInt(props.species?.generation.url.split('/').at(6) ?? '0')]}
          pokemonRouter={props.pokemonRouter}
          purified={currForm?.form.is_purified}
        />
      )}
      {(props.pokemonDetail?.formChange?.length ?? 0) > 0 && (
        <FromChange details={props.pokemonDetail} defaultName={currForm?.default_name} />
      )}
    </Fragment>
  );
};

export default Form;
