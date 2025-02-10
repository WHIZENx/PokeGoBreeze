import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { Location, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import './Pokemon.scss';

import {
  Form,
  IFormSoundCry,
  FormSoundCry,
  PokemonForm,
  IPokemonFormModify,
  PokemonFormModify,
  PokemonFormDetail,
  IPokemonFormDetail,
} from '../../core/models/API/form.model';
import { IPokemonDetail, PokemonDetail, PokemonInfo } from '../../core/models/API/info.model';
import { Species } from '../../core/models/API/species.model';
import {
  OptionsPokemon,
  IPokemonGenderRatio,
  IPokemonData,
  PokemonModel,
  WeightHeight,
  PokemonProgress,
} from '../../core/models/pokemon.model';
import APIService from '../../services/API.service';
import { RouterState, StoreState, SpinnerState } from '../../store/models/state.model';
import { PokemonTypeCost } from '../../core/models/evolution.model';
import {
  checkPokemonIncludeShadowForm,
  convertPokemonAPIDataName,
  convertPokemonImageName,
  generatePokemonGoForms,
  generatePokemonGoShadowForms,
  getPokemonById,
  getPokemonDetails,
  getValidPokemonImgPath,
  splitAndCapitalize,
} from '../../util/utils';
import PokemonAssetComponent from '../../components/Info/Assets/PokemonModel';
import Candy from '../../components/Sprites/Candy/Candy';
import PokemonTable from '../../components/Table/Pokemon/PokemonTable';
import AlertReleased from './components/AlertReleased';
import SearchBar from './components/SearchBar';
import SearchBarMain from './components/SearchBarMain';
import { KEY_LEFT, KEY_RIGHT, regionList, Params, FORM_STANDARD, FORM_GMAX } from '../../util/constants';
import { useTheme } from '@mui/material';
import Error from '../Error/Error';
import { Action } from 'history';
import FormComponent from '../../components/Info/Form/Form';
import { AxiosError } from 'axios';
import { IPokemonPage } from '../models/page.model';
import { ThemeModify } from '../../util/models/overrides/themes.model';
import { combineClasses, getValueOrDefault, isEqual, isInclude, isNotEmpty, isUndefined, toNumber } from '../../util/extension';
import { LocationState } from '../../core/models/router.model';
import { EqualMode, IncludeMode } from '../../util/enums/string.enum';
import { VariantType } from '../../enums/type.enum';

interface ITypeCost {
  purified: PokemonTypeCost;
  thirdMove: PokemonTypeCost;
}

class TypeCost implements ITypeCost {
  purified = new PokemonTypeCost();
  thirdMove = new PokemonTypeCost();

  constructor({ ...props }: ITypeCost) {
    Object.assign(this, props);
  }
}

const Pokemon = (props: IPokemonPage) => {
  const theme = useTheme<ThemeModify>();
  const router = useSelector((state: RouterState) => state.router);
  const icon = useSelector((state: StoreState) => state.store.icon);
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const pokemonData = useSelector((state: StoreState) => state.store.data.pokemon);

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation() as unknown as Location<LocationState>;
  const [searchParams, setSearchParams] = useSearchParams();

  const [pokeData, setPokeData] = useState<IPokemonDetail[]>([]);
  const [currentData, setCurrentData] = useState<IPokemonDetail>();
  const [formList, setFormList] = useState<IPokemonFormModify[][]>();

  const [data, setData] = useState<Species>();
  const [dataStorePokemon, setDataStorePokemon] = useState<OptionsPokemon>();
  const [pokeRatio, setPokeRatio] = useState<IPokemonGenderRatio>();

  const [version, setVersion] = useState('');
  const [region, setRegion] = useState('');
  const [generation, setGeneration] = useState('');
  const [WH, setWH] = useState(new WeightHeight());
  const [formName, setFormName] = useState<string>();
  const [originForm, setOriginForm] = useState<string>();
  const [originSoundCry, setOriginSoundCry] = useState<IFormSoundCry[]>([]);
  const [released, setReleased] = useState(true);
  const [isFound, setIsFound] = useState(true);
  const [currentForm, setCurrentForm] = useState<IPokemonFormModify>();
  const [pokemonDetails, setPokemonDetails] = useState<IPokemonData>();

  const [costModifier, setCostModifier] = useState<ITypeCost>();
  const [urlEvolutionChain, setUrlEvolutionChain] = useState<string>();

  const [progress, setProgress] = useState(new PokemonProgress());

  const axiosSource = useRef(APIService.getCancelToken());
  const { enqueueSnackbar } = useSnackbar();

  const getPokemonIdByParam = () => {
    let id = toNumber(params.id ? params.id.toLowerCase() : props.id);
    if (id === 0 && params.id && isNotEmpty(params.id) && isNotEmpty(pokemonData)) {
      const pokemon = pokemonData.find((p) => isEqual(p.pokemonId, params.id, EqualMode.IgnoreCaseSensitive));
      if (pokemon) {
        id = pokemon.num;
      }
    }
    return id;
  };

  const convertPokemonForm = (formName: string | undefined | null, formType: string) => {
    if (!isInclude(formName, formType, IncludeMode.IncludeIgnoreCaseSensitive)) {
      return;
    }
    const [form] = getValueOrDefault(String, formName?.replaceAll('_', '-').toUpperCase()).split(`-${formType.toUpperCase()}`);
    const result = convertPokemonAPIDataName(form).replace(`_${FORM_STANDARD}`, '').replace(FORM_STANDARD, '').replaceAll('_', '-');
    return `${result}${result ? '-' : ''}${formType.toUpperCase()}`;
  };

  const fetchMap = useCallback(
    async (data: Species) => {
      const dataPokeList: IPokemonDetail[] = [];
      const dataFormList: IPokemonFormDetail[][] = [];
      const soundCries: IFormSoundCry[] = [];
      const cancelToken = axiosSource.current.token;
      await Promise.all(
        data.varieties.map(async (value) => {
          const pokeInfo = (await APIService.getFetchUrl<PokemonInfo>(value.pokemon.url, { cancelToken })).data;
          const pokeForm = await Promise.all(
            pokeInfo.forms.map(async (item) => {
              const form = (await APIService.getFetchUrl<PokemonForm>(item.url, { cancelToken })).data;
              return PokemonFormDetail.setDetails(form);
            })
          );
          const pokeDetail = PokemonDetail.setDetails({
            ...pokeInfo,
            isIncludeShadow: checkPokemonIncludeShadowForm(pokemonData, pokeInfo.name),
          });
          soundCries.push(new FormSoundCry(pokeDetail));
          dataPokeList.push(pokeDetail);
          dataFormList.push(pokeForm);
        })
      ).catch(() => {
        return;
      });

      if (!isNotEmpty(dataPokeList) || !isNotEmpty(dataFormList)) {
        return;
      }
      setUrlEvolutionChain(data.evolution_chain?.url);

      const pokemon = pokemonData.find((item) => item.num === data.id);
      setPokeRatio(pokemon?.genderRatio);
      setCostModifier(
        new TypeCost({
          purified: PokemonTypeCost.create({
            candy: pokemon?.purified?.candy,
            stardust: pokemon?.purified?.stardust,
          }),
          thirdMove: PokemonTypeCost.create({
            candy: pokemon?.thirdMove?.candy,
            stardust: pokemon?.thirdMove?.stardust,
          }),
        })
      );

      let formListResult = dataFormList
        .map((item) =>
          item
            .map((item) =>
              PokemonFormModify.setForm(
                data.id,
                data.name,
                data.varieties.find((v) => isInclude(item.pokemon.name, v.pokemon.name))?.pokemon.name,
                Form.setValue(item, data.name)
              )
            )
            .sort((a, b) => toNumber(a.form.id) - toNumber(b.form.id))
        )
        .sort((a, b) => toNumber(a[0]?.form.id) - toNumber(b[0]?.form.id));

      const indexPokemonGO = generatePokemonGoForms(pokemonData, dataFormList, formListResult, data.id, data.name);

      if (pokemon?.hasShadowForm && pokemon.purified?.candy && pokemon.purified.stardust) {
        generatePokemonGoShadowForms(dataPokeList, formListResult, data.id, data.name, indexPokemonGO);
      }

      setOriginSoundCry(soundCries);
      setPokeData(dataPokeList);

      if (
        formListResult.flatMap((item) => item).filter((item) => isEqual(item.form.formName, FORM_GMAX, EqualMode.IgnoreCaseSensitive))
          .length > 1
      ) {
        formListResult = formListResult.map((item) =>
          item.map((p) =>
            isEqual(p.form.formName, FORM_GMAX, EqualMode.IgnoreCaseSensitive)
              ? PokemonFormModify.create({
                  ...p,
                  form: Form.create({ ...p.form, formName: `${p.name.replace(`${p.defaultName}-`, '')}-${p.form.formName}` }),
                })
              : p
          )
        );
      }

      setFormList(formListResult);

      // Set Default Form
      let currentForm: IPokemonFormModify | undefined = new PokemonFormModify();
      let formParams = getValueOrDefault(String, searchParams.get(Params.Form)).toUpperCase().replaceAll('_', '-').toLowerCase();
      const formTypeParams = getValueOrDefault(String, searchParams.get(Params.FormType)).toLowerCase();
      formParams += isNotEmpty(formParams) && isNotEmpty(formTypeParams) ? `-${formTypeParams}` : formTypeParams;
      const defaultForm = formListResult.flatMap((item) => item).filter((item) => item.form.isDefault);
      if (isNotEmpty(formParams)) {
        const defaultFormSearch = formListResult
          .flatMap((form) => form)
          .find((item) => {
            const result = formTypeParams
              ? convertPokemonForm(item.form.formName, formTypeParams)
              : convertPokemonAPIDataName(item.form.formName)
                  .replace(`_${FORM_STANDARD}`, '')
                  .replace(FORM_STANDARD, '')
                  .replaceAll('_', '-');
            return isEqual(result, formParams, EqualMode.IgnoreCaseSensitive);
          });
        if (defaultFormSearch) {
          currentForm = defaultFormSearch;
        } else {
          currentForm = defaultForm.find((item) => item.form.id === data.id);
          searchParams.delete(Params.Form);
          setSearchParams(searchParams);
        }
      } else if (router.action === Action.Pop && props.searching) {
        currentForm = defaultForm.find((item) => isEqual(item.form.formName, props.searching?.form));
      } else {
        currentForm = defaultForm.find((item) => item.form.id === data.id);
      }
      if (!currentForm) {
        currentForm = formListResult.flatMap((item) => item).find((item) => item.form.id === data.id);
      }
      let defaultData = dataPokeList.find((value) => isEqual(value.name, currentForm?.form.name));
      if (!defaultData) {
        defaultData = dataPokeList.find((value) => isEqual(value.name, currentForm?.name));
      }
      setWH(
        WeightHeight.create({
          weight: toNumber(defaultData?.weight),
          height: toNumber(defaultData?.height),
        })
      );
      setCurrentData(defaultData);
      setCurrentForm(currentForm ?? defaultForm.at(0));
      setData(data);

      setProgress((p) => PokemonProgress.create({ ...p, isLoadedForms: true }));
    },
    [pokemonData, searchParams]
  );

  const queryPokemon = useCallback(
    (id: number) => {
      axiosSource.current = APIService.reNewCancelToken();
      const cancelToken = axiosSource.current.token;

      APIService.getPokeSpices(id, { cancelToken })
        .then((res) => {
          if (res.data) {
            fetchMap(res.data);
          }
        })
        .catch((e: AxiosError) => {
          if (APIService.isCancel(e)) {
            return;
          }
          enqueueSnackbar(`Pokémon ID or name: ${id} Not found!`, { variant: VariantType.Error });
          if (params.id) {
            document.title = `#${params.id} - Not Found`;
            setIsFound(false);
          } else {
            navigate('/error', { replace: true, state: { url: location.pathname, id } });
          }
        });
    },
    [enqueueSnackbar, fetchMap]
  );

  const clearData = (isForceClear = false) => {
    setOriginForm(undefined);
    setReleased(true);
    setFormName(undefined);
    setWH(new WeightHeight());
    setVersion('');
    setRegion('');
    setGeneration('');
    setPokeRatio(undefined);
    if (isForceClear) {
      setProgress((p) => PokemonProgress.create({ ...p, isLoadedForms: false }));
      setFormList([]);
      setPokeData([]);
      setCurrentForm(undefined);
      setCurrentData(undefined);
      setCostModifier(undefined);
    }
  };

  useEffect(() => {
    if (isNotEmpty(pokemonData)) {
      let id = toNumber(params.id ? params.id.toLowerCase() : props.id);
      if (id === 0 && params.id && isNotEmpty(params.id) && isNotEmpty(pokemonData)) {
        id = getPokemonIdByParam();
        if (id === 0) {
          enqueueSnackbar(`Pokémon ID or name: ${params.id} Not found!`, { variant: VariantType.Error });
          document.title = `#${id} - Not Found`;
          setIsFound(false);
          return;
        }
      }
      const dataId = toNumber(data?.id);
      if (id > 0 && dataId !== id) {
        clearData(true);
        queryPokemon(id);
      }
      return () => {
        if (dataId > 0) {
          APIService.cancel(axiosSource.current);
        }
      };
    }
  }, [params.id, props.id, pokemonData, data?.id, queryPokemon]);

  useEffect(() => {
    if (!data) {
      const id = getPokemonIdByParam();
      setDataStorePokemon({
        current: new PokemonModel(id),
      });
      setCostModifier(undefined);
    }
  }, [data]);

  useEffect(() => {
    const id = getPokemonIdByParam();
    if (id > 0 && isNotEmpty(pokemonData)) {
      const keyDownHandler = (event: KeyboardEvent) => {
        if (!spinner.isLoading) {
          const currentPokemon = getPokemonById(pokemonData, id);
          if (currentPokemon) {
            const prev = getPokemonById(pokemonData, currentPokemon.id - 1);
            const next = getPokemonById(pokemonData, currentPokemon.id + 1);
            if (prev && event.keyCode === KEY_LEFT) {
              event.preventDefault();
              params.id ? navigate(`/pokemon/${prev.id}`, { replace: true }) : props.onDecId?.();
            } else if (next && event.keyCode === KEY_RIGHT) {
              event.preventDefault();
              params.id ? navigate(`/pokemon/${next.id}`, { replace: true }) : props.onIncId?.();
            }
          }
        }
      };
      document.addEventListener('keyup', keyDownHandler);
      return () => {
        document.removeEventListener('keyup', keyDownHandler);
      };
    }
  }, [params.id, props.id, spinner.isLoading, pokemonData]);

  const checkReleased = (id: number, form: string | undefined, defaultForm: IPokemonFormModify) => {
    if (!form) {
      if (defaultForm) {
        form = defaultForm.form.formName || defaultForm.defaultName;
      } else {
        return false;
      }
    }

    const details = getPokemonDetails(pokemonData, id, form, defaultForm.form.isDefault);
    setPokemonDetails(details);
    return getValueOrDefault(Boolean, details?.releasedGO);
  };

  useEffect(() => {
    const id = toNumber(data?.id);
    if (currentForm && id > 0) {
      const released = checkReleased(id, formName, currentForm);
      setReleased(released);

      const formParams = searchParams.get(Params.Form)?.replaceAll('_', '-');
      setVersion(getValueOrDefault(String, currentForm.form.version));
      const gen = data?.generation.url?.split('/').at(6);
      setGeneration(getValueOrDefault(String, gen));
      if (!params.id) {
        setRegion(regionList[toNumber(gen)]);
      } else {
        const currentRegion = Object.values(regionList).find((item) =>
          isInclude(currentForm.form.formName, item, IncludeMode.IncludeIgnoreCaseSensitive)
        );
        if (isNotEmpty(currentForm.form.formName) && currentRegion) {
          setRegion(!region || !isEqual(region, currentRegion) ? currentRegion : region);
        } else {
          setRegion(regionList[toNumber(gen)]);
        }
      }
      const nameInfo =
        router.action === Action.Pop && props.searching
          ? props.searching.fullName
          : currentForm.form.isDefault
          ? currentForm.form.name
          : formParams || toNumber(currentForm.form.id) < 0
          ? currentForm.form.name
          : data?.name;
      setFormName(nameInfo?.replace(/-f$/, '-female').replace(/-m$/, '-male'));
      const originForm = splitAndCapitalize(
        router.action === Action.Pop && props.searching ? props.searching.form : currentForm.form.formName,
        '-',
        '-'
      );
      setOriginForm(originForm);
      if (params.id) {
        document.title = `#${data?.id} - ${splitAndCapitalize(nameInfo, '-', ' ')}`;
      }
    } else {
      clearData();
    }
  }, [data?.id, props.id, params.id, formName, currentForm]);

  useEffect(() => {
    const id = getPokemonIdByParam();
    if (isNotEmpty(pokeData) && isNotEmpty(formList) && id > 0 && id === toNumber(data?.id)) {
      let form = getValueOrDefault(String, searchParams.get(Params.Form));
      const formType = getValueOrDefault(String, searchParams.get(Params.FormType));
      form += isNotEmpty(form) && isNotEmpty(formType) ? `-${formType}` : formType;
      const currentForm = formList
        ?.flatMap((item) => item)
        .find((item) => {
          const result = formType
            ? convertPokemonForm(item.form.formName, formType)
            : convertPokemonAPIDataName(item.form.formName)
                .replace(`_${FORM_STANDARD}`, '')
                .replace(FORM_STANDARD, '')
                .replaceAll('_', '-');
          return isEqual(result, form, EqualMode.IgnoreCaseSensitive);
        });
      let pokemonCurrentData = pokeData.find((item) => isEqual(currentForm?.form.name, item.name));
      if (!pokemonCurrentData) {
        pokemonCurrentData = pokeData.find((item) => item.isDefault);
      }
      if (currentForm && pokemonCurrentData) {
        setCurrentForm(currentForm);
        setCurrentData(pokemonCurrentData);
        const originForm = splitAndCapitalize(currentForm?.form.formName, '-', '-');
        setOriginForm(originForm);

        const weight = pokemonCurrentData.weight;
        const height = pokemonCurrentData.height;
        setWH(WeightHeight.create({ weight, height }));
      }
    }
  }, [pokeData, formList, data?.id, props.id, params.id, searchParams]);

  useEffect(() => {
    const id = getPokemonIdByParam();
    if (id > 0 && isNotEmpty(pokemonData)) {
      const currentPokemon = getPokemonById(pokemonData, id);
      if (currentPokemon) {
        setDataStorePokemon({
          prev: getPokemonById(pokemonData, currentPokemon.id - 1),
          current: getPokemonById(pokemonData, currentPokemon.id),
          next: getPokemonById(pokemonData, currentPokemon.id + 1),
        });
      }
    }
  }, [pokemonData, params.id, props.id]);

  const reload = (element: JSX.Element, color = '#f5f5f5') => {
    if (progress.isLoadedForms) {
      return element;
    }
    return (
      <div className="ph-item w-75" style={{ padding: 0, margin: 0, height: 24 }}>
        <div className="ph-picture ph-col-3 w-100 h-100" style={{ padding: 0, margin: 0, background: color }} />
      </div>
    );
  };

  return (
    <Fragment>
      {!isFound ? (
        <Error />
      ) : (
        <Fragment>
          <div className="w-100 row prev-next-block sticky-top">
            {params.id ? (
              <SearchBarMain data={dataStorePokemon} />
            ) : (
              <SearchBar data={dataStorePokemon} router={router} onDecId={props.onDecId} onIncId={props.onIncId} />
            )}
          </div>
          <div
            style={{ color: theme.palette.text.primary }}
            className={combineClasses('element-bottom position-relative poke-container', props.isSearch ? '' : 'container')}
          >
            <div className="w-100 text-center d-inline-block align-middle" style={{ marginTop: 15, marginBottom: 15 }}>
              <AlertReleased isReleased={released} formName={formName} icon={icon} />
              <div className="d-inline-block img-desc">
                <img
                  className="pokemon-main-sprite"
                  style={{ verticalAlign: 'baseline' }}
                  alt="img-full-pokemon"
                  src={APIService.getPokeFullSprite(
                    dataStorePokemon?.current?.id,
                    convertPokemonImageName(
                      currentForm && originForm && currentForm.defaultId === currentForm.form.id
                        ? ''
                        : originForm || searchParams.get(Params.Form)?.replaceAll('_', '-')
                    )
                  )}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, dataStorePokemon?.current?.id);
                  }}
                />
              </div>
              <div className="d-inline-block">
                <PokemonTable
                  id={dataStorePokemon?.current?.id}
                  gen={generation}
                  formName={formName}
                  region={region}
                  version={version}
                  weight={WH.weight}
                  height={WH.height}
                  isLoadedForms={progress.isLoadedForms}
                />
              </div>
              <div className="d-inline-block" style={{ padding: 0 }}>
                <table className="table-info table-main">
                  <thead />
                  <tbody>
                    <tr className="text-center">
                      <td className="table-sub-header">Unlock third move</td>
                      <td className="table-sub-header">Costs</td>
                    </tr>
                    <tr className="info-costs">
                      <td>
                        <img alt="img-cost-info" width={100} src={APIService.getItemSprite('Item_1202')} />
                      </td>
                      <td style={{ padding: 0 }}>
                        <div className="d-flex align-items-center row-extra td-costs">
                          <Candy id={dataStorePokemon?.current?.id} style={{ marginRight: 5 }} />
                          {reload(
                            <span>{!isUndefined(costModifier?.thirdMove.candy) ? `x${costModifier?.thirdMove.candy}` : 'Unavailable'}</span>
                          )}
                        </div>
                        <div className="row-extra d-flex">
                          <div className="d-inline-flex justify-content-center" style={{ width: 20, marginRight: 5 }}>
                            <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                          </div>
                          {reload(
                            <span>
                              {!isUndefined(costModifier?.thirdMove.stardust) ? `x${costModifier?.thirdMove.stardust}` : 'Unavailable'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr className="text-center">
                      <td className="table-sub-header">Purified</td>
                      <td className="table-sub-header">Costs</td>
                    </tr>
                    <tr className="info-costs">
                      <td>
                        <img alt="img-cost-info" width={60} height={60} src={APIService.getPokePurified()} />
                      </td>
                      <td style={{ padding: 0 }}>
                        <div className="d-flex align-items-center row-extra td-costs">
                          <Candy id={dataStorePokemon?.current?.id} style={{ marginRight: 5 }} />
                          {reload(
                            <span>{!isUndefined(costModifier?.purified.candy) ? `x${costModifier?.purified.candy}` : 'Unavailable'}</span>
                          )}
                        </div>
                        <div className="row-extra d-flex">
                          <div className="d-inline-flex justify-content-center" style={{ width: 20, marginRight: 5 }}>
                            <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                          </div>
                          {reload(
                            <span>
                              {!isUndefined(costModifier?.purified.stardust) ? `x${costModifier?.purified.stardust}` : 'Unavailable'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <FormComponent
              pokemonRouter={router}
              form={currentForm}
              setForm={setCurrentForm}
              setOriginForm={setOriginForm}
              setWH={setWH}
              data={currentData}
              setData={setCurrentData}
              formList={formList}
              pokeData={pokeData}
              ratio={pokeRatio}
              setId={props.setId}
              pokemonDetail={pokemonDetails}
              defaultId={dataStorePokemon?.current?.id}
              region={region}
              urlEvolutionChain={urlEvolutionChain}
              setProgress={setProgress}
              isLoadedForms={progress.isLoadedForms}
            />
            <PokemonAssetComponent
              id={dataStorePokemon?.current?.id}
              name={dataStorePokemon?.current?.name}
              originSoundCry={originSoundCry}
              isLoadedForms={progress.isLoadedForms}
            />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Pokemon;
