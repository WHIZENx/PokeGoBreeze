import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
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
import { IPokemonDetailInfo, PokemonDetail, PokemonDetailInfo, PokemonInfo } from '../../core/models/API/info.model';
import {
  IPokemonSpecie,
  OptionsPokemon,
  PokemonModel,
  PokemonProgress,
  PokemonSpecie,
} from '../../core/models/pokemon.model';
import APIService from '../../services/api.service';
import { RouterState, StoreState, SpinnerState, SearchingState } from '../../store/models/state.model';
import { PokemonTypeCost } from '../../core/models/evolution.model';
import {
  checkPokemonIncludeShadowForm,
  convertPokemonImageName,
  convertSexName,
  generatePokemonGoForms,
  generatePokemonGoShadowForms,
  getDmgMultiplyBonus,
  getKeyWithData,
  getPokemonById,
  getPokemonDetails,
  getPokemonFormWithNoneSpecialForm,
  getPokemonType,
  getValidPokemonImgPath,
  isSpecialFormType,
  splitAndCapitalize,
} from '../../utils/utils';
import PokemonAssetComponent from '../../components/Info/Assets/PokemonModel';
import Candy from '../../components/Sprites/Candy/Candy';
import PokemonTable from '../../components/Table/Pokemon/PokemonTable';
import AlertReleased from './components/AlertReleased';
import SearchBar from './components/SearchBar';
import SearchBarMain from './components/SearchBarMain';
import { regionList, Params } from '../../utils/constants';
import Error from '../Error/Error';
import { Action } from 'history';
import FormComponent from '../../components/Info/Form/Form';
import { AxiosError } from 'axios';
import { IPokemonPage } from '../models/page.model';
import {
  combineClasses,
  getValueOrDefault,
  isEqual,
  isInclude,
  isNotEmpty,
  isNullOrUndefined,
  isUndefined,
  toNumber,
} from '../../utils/extension';
import { LocationState } from '../../core/models/router.model';
import { EqualMode, IncludeMode } from '../../utils/enums/string.enum';
import { PokemonType, TypeAction, VariantType } from '../../enums/type.enum';
import { useNavigateToTop } from '../../utils/hooks/LinkToTop';
import { SearchingActions } from '../../store/actions';
import { StatsPokemonGO } from '../../core/models/stats.model';
import { useTitle } from '../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../utils/models/hook.model';
import { formStandard, keyLeft, keyRight } from '../../utils/helpers/context.helpers';

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
  const dispatch = useDispatch();
  const router = useSelector((state: RouterState) => state.router);
  const icon = useSelector((state: StoreState) => state.store.icon);
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const pokemonData = useSelector((state: StoreState) => state.store.data.pokemons || []);

  const currentSearchingForm = useSelector((state: SearchingState) => state.searching.mainSearching?.form);
  const pokemonDetails = useSelector((state: SearchingState) => state.searching.mainSearching?.pokemon);

  const params = useParams();
  const navigate = useNavigate();
  const navigateToTop = useNavigateToTop();
  const location = useLocation() as unknown as Location<LocationState>;
  const [searchParams, setSearchParams] = useSearchParams();

  const [pokeData, setPokeData] = useState<IPokemonDetailInfo[]>([]);
  const [formList, setFormList] = useState<IPokemonFormModify[][]>([]);

  const [data, setData] = useState<IPokemonSpecie>();
  const [dataStorePokemon, setDataStorePokemon] = useState<OptionsPokemon>();

  const [version, setVersion] = useState('');
  const [region, setRegion] = useState('');
  const [generation, setGeneration] = useState('');
  const [formName, setFormName] = useState<string>();
  const [originForm, setOriginForm] = useState<string>();
  const [originSoundCry, setOriginSoundCry] = useState<IFormSoundCry[]>([]);
  const [isFound, setIsFound] = useState(true);

  const [costModifier, setCostModifier] = useState<ITypeCost>();
  const [urlEvolutionChain, setUrlEvolutionChain] = useState<string>();

  const [progress, setProgress] = useState(new PokemonProgress());

  const axiosSource = useRef(APIService.getCancelToken());
  const { enqueueSnackbar } = useSnackbar();

  const getPokemonIdByParam = () => {
    let id = toNumber(params.id ? params.id.toLowerCase() : props.searchOption?.id);
    if (id === 0 && params.id && isNotEmpty(params.id) && isNotEmpty(pokemonData)) {
      const pokemon = pokemonData.find((p) =>
        isEqual(p.pokemonId?.replaceAll('_', '-'), params.id, EqualMode.IgnoreCaseSensitive)
      );
      id = toNumber(pokemon?.num);
    }
    return id;
  };

  const convertPokemonForm = (
    formName: string | undefined,
    formType: string | undefined,
    pokemonType = PokemonType.None
  ) => {
    let form = formName;
    if (formType) {
      formType = getValueOrDefault(String, formType);
      if (!isInclude(formName, formType, IncludeMode.IncludeIgnoreCaseSensitive)) {
        return;
      }
      [form] = getValueOrDefault(String, formName?.replaceAll('_', '-').toUpperCase()).split(
        `-${formType.toUpperCase()}`
      );
    }
    const result = getPokemonFormWithNoneSpecialForm(form, pokemonType)
      ?.replace(`_${formStandard()}`, '')
      .replace(formStandard(), '')
      .replaceAll('_', '-');
    return formType ? `${result}${result ? '-' : ''}${formType.toUpperCase()}` : result;
  };

  const fetchMap = useCallback(
    async (specie: IPokemonSpecie) => {
      const dataPokeList: IPokemonDetailInfo[] = [];
      const dataFormList: IPokemonFormDetail[][] = [];
      const soundCries: IFormSoundCry[] = [];
      const cancelToken = axiosSource.current.token;
      await Promise.all(
        specie.varieties.map(async (value) => {
          const pokeInfo = (await APIService.getFetchUrl<PokemonInfo>(value.path, { cancelToken })).data;
          const pokeForm = await Promise.all(
            pokeInfo.forms.map(async (item) => {
              const form = (await APIService.getFetchUrl<PokemonForm>(item.url, { cancelToken })).data;
              return PokemonFormDetail.setDetails(form);
            })
          );
          pokeInfo.isIncludeShadow = checkPokemonIncludeShadowForm(pokemonData, pokeInfo.name);
          const pokeDetail = PokemonDetailInfo.setDetails(pokeInfo);
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
      setUrlEvolutionChain(specie.evolutionChainPath);

      const pokemon = pokemonData.find((item) => item.num === specie.id);
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

      const isShadow = Boolean(
        pokemon?.hasShadowForm && toNumber(pokemon.purified?.candy) >= 0 && toNumber(pokemon.purified?.stardust) >= 0
      );
      let formListResult = dataFormList
        .map((item) =>
          item
            .map((item) => {
              item.pokemonType = getPokemonType(item.formName, item.pokemonType === PokemonType.Mega, isShadow);
              return PokemonFormModify.setForm(
                specie.id,
                specie.name,
                specie.varieties.find((v) => isInclude(item.pokemon.name, v.name))?.name,
                Form.setValue(item, specie.name)
              );
            })
            .sort((a, b) => toNumber(a.form.id) - toNumber(b.form.id))
        )
        .sort((a, b) => toNumber(a[0]?.form.id) - toNumber(b[0]?.form.id));

      const indexPokemonGO = generatePokemonGoForms(pokemonData, dataFormList, formListResult, specie.id, specie.name);

      if (isShadow) {
        generatePokemonGoShadowForms(dataPokeList, formListResult, specie.id, specie.name, indexPokemonGO);
      }

      setOriginSoundCry(soundCries);
      setPokeData(dataPokeList);

      if (
        formListResult.flatMap((item) => item).filter((item) => item.form.pokemonType === PokemonType.GMax).length > 1
      ) {
        formListResult = formListResult.map((item) =>
          item.map((p) =>
            p.form.pokemonType === PokemonType.GMax
              ? PokemonFormModify.create({
                  ...p,
                  form: Form.create(
                    { ...p.form, formName: `${p.name.replace(`${p.defaultName}-`, '')}-${p.form.formName}` },
                    true,
                    isShadow
                  ),
                })
              : p
          )
        );
      }

      setFormList(formListResult);

      // Set Default Form
      let currentForm: IPokemonFormModify | undefined = new PokemonFormModify();
      let formParams = getValueOrDefault(String, searchParams.get(Params.Form))
        .toUpperCase()
        .replaceAll('_', '-')
        .toLowerCase();
      const formTypeParams = searchParams.get(Params.FormType)?.toLowerCase();
      if (!isNullOrUndefined(formTypeParams)) {
        formParams += isNotEmpty(formParams) && isNotEmpty(formTypeParams) ? `-${formTypeParams}` : formTypeParams;
      }
      const defaultForm = formListResult.flatMap((item) => item).filter((item) => item.form.isDefault);
      if (router.action === Action.Pop && props.searching && !params.id) {
        currentForm = formListResult
          .flatMap((form) => form)
          .find((item) =>
            isEqual(item.form.formName, props.searching?.form?.form?.formName, EqualMode.IgnoreCaseSensitive)
          );
      } else if (isNotEmpty(formParams)) {
        const defaultFormSearch = formListResult
          .flatMap((form) => form)
          .find((item) => {
            const result = convertPokemonForm(item.form.formName, formTypeParams, item.form.pokemonType);
            return isEqual(result, formParams, EqualMode.IgnoreCaseSensitive);
          });
        if (defaultFormSearch) {
          currentForm = defaultFormSearch;
        } else {
          currentForm = defaultForm.find((item) => item.form.id === specie.id);
          searchParams.delete(Params.Form);
          setSearchParams(searchParams);
        }
      } else if (props.isSearch && props.searchOption) {
        currentForm = formListResult
          .flatMap((form) => form)
          .find(
            (item) =>
              item.defaultId === specie.id &&
              (isEqual(
                item.form.formName
                  ?.toUpperCase()
                  .replace(/^STANDARD$/, '')
                  .replace(`-${formStandard()}`, ''),
                props.searchOption?.form,
                EqualMode.IgnoreCaseSensitive
              ) ||
                item.form.pokemonType === props.searchOption?.pokemonType)
          );
      } else {
        currentForm = defaultForm.find((item) => item.defaultId === specie.id);
      }
      currentForm ??= formListResult.flatMap((item) => item).find((item) => item.defaultId === specie.id);
      let defaultData = dataPokeList.find((value) => isEqual(value.name, currentForm?.form.name));
      defaultData ??= dataPokeList.find((value) => isEqual(value.name, currentForm?.name));
      if (defaultData) {
        const pokemonDetails = PokemonDetail.setDetails(defaultData);
        dispatch(SearchingActions.SetMainPokemonDetails.create(pokemonDetails));
      }
      currentForm ??= defaultForm.at(0);
      if (currentForm) {
        dispatch(SearchingActions.SetMainPokemonForm.create(currentForm));
      }
      setData(specie);

      setProgress((p) => PokemonProgress.create({ ...p, isLoadedForms: true }));
    },
    [pokemonData, searchParams, dispatch]
  );

  const queryPokemon = useCallback(
    (id: number) => {
      axiosSource.current = APIService.reNewCancelToken();
      const cancelToken = axiosSource.current.token;

      APIService.getPokeSpices(id, { cancelToken })
        .then(async (res) => {
          if (res.data) {
            const result = PokemonSpecie.create(res.data);
            await fetchMap(result);
          }
        })
        .catch((e: AxiosError) => {
          if (APIService.isCancel(e)) {
            return;
          }
          enqueueSnackbar(`Pokémon ID or name: ${id} Not found!`, { variant: VariantType.Error });
          if (params.id) {
            setIsFound(false);
          } else {
            navigateToTop('/error', {
              replace: true,
              state: { url: location.pathname, id },
            });
          }
        });
    },
    [enqueueSnackbar, fetchMap]
  );

  const clearData = (isForceClear = false) => {
    setOriginForm(undefined);
    setFormName(undefined);
    setVersion('');
    setRegion('');
    setGeneration('');
    dispatch(SearchingActions.ResetMainPokemon.create());
    dispatch(SearchingActions.ResetPokemonMainSearch.create());
    if (isForceClear) {
      setProgress((p) => PokemonProgress.create({ ...p, isLoadedForms: false }));
      setFormList([]);
      setPokeData([]);
      setCostModifier(undefined);
    }
  };

  const [titleProps, setTitleProps] = useState<TitleSEOProps>({
    title: 'PokéGO Breeze - Pokémon',
    description:
      'Comprehensive Pokémon database with detailed stats, forms, evolution chains, move costs, and shadow/purified information for Pokémon GO players',
    keywords: [
      'pokemon',
      'Pokémon',
      'PokéGO Breeze',
      'pokemon stats',
      'pokemon forms',
      'shadow pokemon',
      'purified pokemon',
      'third move cost',
      'evolution chain',
      'pokemon go database',
      'pokemon details',
      'pokemon types',
    ],
  });

  useTitle(titleProps);

  useEffect(() => {
    if (isNotEmpty(pokemonData)) {
      let id = toNumber(params.id ? params.id.toLowerCase() : props.searchOption?.id);
      if (id <= 0 && params.id && isNotEmpty(params.id) && isNotEmpty(pokemonData)) {
        id = getPokemonIdByParam();
        if (id <= 0) {
          enqueueSnackbar(`Pokémon ID or name: ${params.id} Not found!`, { variant: VariantType.Error });
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
  }, [params.id, props.searchOption?.id, pokemonData, data?.id, queryPokemon]);

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
            if (prev && event.keyCode === keyLeft()) {
              event.preventDefault();
              params.id ? navigate(`/pokemon/${prev.id}`, { replace: true }) : props.onDecId?.();
            } else if (next && event.keyCode === keyRight()) {
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
  }, [params.id, props.searchOption?.id, spinner.isLoading, pokemonData]);

  const checkReleased = (id: number, form: Partial<IPokemonFormModify> | undefined) => {
    if (!form) {
      return false;
    }
    const formName = getValueOrDefault(String, form.form?.name, form.form?.formName, form.defaultName);
    const details = getPokemonDetails(pokemonData, id, formName, form.form?.pokemonType, form.form?.isDefault);
    details.pokemonType = form.form?.pokemonType || PokemonType.Normal;
    if (isSpecialFormType(details.pokemonType)) {
      const atk = details.statsGO.atk * getDmgMultiplyBonus(details.pokemonType, TypeAction.Atk);
      const def = details.statsGO.def * getDmgMultiplyBonus(details.pokemonType, TypeAction.Def);
      const sta = details.statsGO.sta;
      details.statsGO = StatsPokemonGO.create(atk, def, sta);
    }
    const pokemonDetails = PokemonDetail.setData(details);
    dispatch(SearchingActions.SetMainPokemonDetails.create(pokemonDetails));
    return details.releasedGO;
  };

  useEffect(() => {
    const id = toNumber(data?.id);
    if (currentSearchingForm && id > 0 && data) {
      const formParams = searchParams.get(Params.Form)?.replaceAll('_', '-');
      setVersion(getValueOrDefault(String, currentSearchingForm.form?.version));
      setGeneration(getValueOrDefault(String, data.generation.toString()));
      if (!params.id) {
        setRegion(regionList[data.generation]);
      } else {
        const currentRegion = Object.values(regionList).find((item) =>
          isInclude(currentSearchingForm.form?.formName, item, IncludeMode.IncludeIgnoreCaseSensitive)
        );
        if (isNotEmpty(currentSearchingForm.form?.formName) && currentRegion) {
          setRegion(!region || !isEqual(region, currentRegion) ? currentRegion : region);
        } else {
          setRegion(regionList[data.generation]);
        }
      }
      const nameInfo =
        router.action === Action.Pop && props.searching && !params.id
          ? props.searching.form?.form?.name
          : currentSearchingForm.form?.isDefault
          ? currentSearchingForm.form.name
          : formParams || toNumber(currentSearchingForm.form?.id) < 0
          ? currentSearchingForm.form?.name
          : data.name;
      setFormName(convertSexName(nameInfo));
      const originForm = splitAndCapitalize(
        router.action === Action.Pop && props.searching && !params.id
          ? props.searching.form?.form?.formName
          : currentSearchingForm.form?.formName,
        '-',
        '-'
      );
      setOriginForm(originForm);
      if (params.id) {
        setTitleProps({
          title: `#${data.id} - ${splitAndCapitalize(nameInfo, '-', ' ')}`,
          description: `Pokémon - #${data.id} ${splitAndCapitalize(nameInfo, '-', ' ')}`,
          keywords: [
            'pokemon',
            'Pokémon',
            'PokéGO Breeze',
            'Pokémon ID',
            'Pokémon name',
            'Pokémon form',
            `#${data.id}`,
            splitAndCapitalize(nameInfo, '-', ' '),
          ],
          image: APIService.getPokeFullSprite(
            dataStorePokemon?.current?.id,
            convertPokemonImageName(
              currentSearchingForm && originForm && currentSearchingForm.defaultId === currentSearchingForm.form?.id
                ? ''
                : originForm || searchParams.get(Params.Form)?.replaceAll('_', '-')
            )
          ),
        });
      }
      checkReleased(id, currentSearchingForm);
    } else {
      clearData();
    }
  }, [data, props.searchOption?.id, params.id, currentSearchingForm]);

  useEffect(() => {
    const id = getPokemonIdByParam();
    if (isNotEmpty(pokeData) && isNotEmpty(formList) && id > 0 && id === toNumber(data?.id)) {
      let form = getValueOrDefault(String, searchParams.get(Params.Form));
      let formType = getValueOrDefault(String, searchParams.get(Params.FormType));
      if (props.searchOption && props.isSearch) {
        form = getValueOrDefault(String, props.searchOption.form);
        const pokemonType = getKeyWithData(PokemonType, props.searchOption.pokemonType);
        if (props.searchOption.pokemonType !== PokemonType.Normal && pokemonType) {
          formType = pokemonType;
        }
      } else if (router.action === Action.Pop && props.searching && !params.id) {
        form = getValueOrDefault(String, props.searching?.form?.form?.formName);
      } else if (!isNullOrUndefined(formType)) {
        form += isNotEmpty(form) && isNotEmpty(formType) ? `-${formType}` : formType;
      }
      let currentForm = formList
        .flatMap((item) => item)
        .find((item) => {
          const result = convertPokemonForm(item.form.formName, formType, item.form.pokemonType);
          return isEqual(result, form, EqualMode.IgnoreCaseSensitive);
        });
      let pokemonCurrentData = pokeData.find((item) => isEqual(currentForm?.form.name, item.name));
      if (!pokemonCurrentData) {
        pokemonCurrentData = pokeData.find((item) => item.isDefault);
        if (!currentForm && pokemonCurrentData) {
          currentForm = formList
            .flatMap((item) => item)
            .find((item) => isEqual(item.form.name, pokemonCurrentData?.name, EqualMode.IgnoreCaseSensitive));
        }
      }
      if (currentForm && pokemonCurrentData) {
        const pokemonDetails = PokemonDetail.setDetails(pokemonCurrentData);
        dispatch(SearchingActions.SetMainPokemonDetails.create(pokemonDetails));
        dispatch(SearchingActions.SetMainPokemonForm.create(currentForm));
        const originForm = splitAndCapitalize(currentForm.form.formName, '-', '-');
        setOriginForm(originForm);
        setFormName(convertSexName(currentForm.form.name));
        checkReleased(id, currentForm);
      }
    }
  }, [pokeData, formList, data?.id, props.searchOption?.id, params.id, searchParams]);

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
  }, [pokemonData, params.id, props.searchOption?.id]);

  const reload = (element: JSX.Element, color = 'var(--loading-custom-bg)') => {
    if (progress.isLoadedForms) {
      return element;
    }
    return (
      <div className="ph-item w-75 m-0 p-0 h-4">
        <div className="ph-picture ph-col-3 w-100 h-100 m-0 p-0" style={{ background: color }} />
      </div>
    );
  };

  return (
    <Error isError={!isFound}>
      <div className="w-100 row prev-next-block sticky-top">
        {params.id ? (
          <SearchBarMain data={dataStorePokemon} />
        ) : (
          <SearchBar data={dataStorePokemon} onDecId={props.onDecId} onIncId={props.onIncId} />
        )}
      </div>
      <div
        className={combineClasses(
          'pb-3 position-relative poke-container theme-text-primary',
          props.isSearch ? '' : 'container'
        )}
      >
        <div className="w-100 text-center d-inline-block align-middle my-3">
          <AlertReleased formName={formName} pokemonType={currentSearchingForm?.form?.pokemonType} icon={icon} />
          <div className="d-inline-block img-desc">
            <img
              className="pokemon-main-sprite v-align-baseline"
              alt="Image Pokemon"
              src={APIService.getPokeFullSprite(
                dataStorePokemon?.current?.id,
                convertPokemonImageName(
                  currentSearchingForm && originForm && currentSearchingForm.defaultId === currentSearchingForm.form?.id
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
              weight={pokemonDetails?.weight}
              height={pokemonDetails?.height}
              isLoadedForms={progress.isLoadedForms}
            />
          </div>
          <div className="d-inline-block p-0">
            <table className="table-info table-main">
              <thead />
              <tbody>
                <tr className="text-center">
                  <td className="table-sub-header">Unlock third move</td>
                  <td className="table-sub-header">Costs</td>
                </tr>
                <tr className="info-costs">
                  <td>
                    <img alt="Image Cost Info" width={100} src={APIService.getItemSprite('Item_1202')} />
                  </td>
                  <td className="p-0">
                    <div className="d-flex align-items-center row-extra td-costs">
                      <Candy id={dataStorePokemon?.current?.id} className="me-1" />
                      {reload(
                        <span>
                          {!isUndefined(costModifier?.thirdMove.candy)
                            ? `x${costModifier?.thirdMove.candy}`
                            : 'Unavailable'}
                        </span>
                      )}
                    </div>
                    <div className="row-extra d-flex">
                      <div className="d-inline-flex justify-content-center me-1" style={{ width: 20 }}>
                        <img alt="Image Stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                      </div>
                      {reload(
                        <span>
                          {!isUndefined(costModifier?.thirdMove.stardust)
                            ? `x${costModifier?.thirdMove.stardust}`
                            : 'Unavailable'}
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
                    <img alt="Image Cost Info" width={60} height={60} src={APIService.getPokePurified()} />
                  </td>
                  <td className="p-0">
                    <div className="d-flex align-items-center row-extra td-costs">
                      <Candy id={dataStorePokemon?.current?.id} className="me-1" />
                      {reload(
                        <span>
                          {!isUndefined(costModifier?.purified.candy)
                            ? `x${costModifier?.purified.candy}`
                            : 'Unavailable'}
                        </span>
                      )}
                    </div>
                    <div className="row-extra d-flex">
                      <div className="d-inline-flex justify-content-center me-1" style={{ width: 20 }}>
                        <img alt="Image Stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                      </div>
                      {reload(
                        <span>
                          {!isUndefined(costModifier?.purified.stardust)
                            ? `x${costModifier?.purified.stardust}`
                            : 'Unavailable'}
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
          formList={formList}
          pokeData={pokeData}
          setSearchOption={props.setSearchOption}
          defaultId={dataStorePokemon?.current?.id}
          urlEvolutionChain={urlEvolutionChain}
          isLoadedForms={progress.isLoadedForms}
        />
        <PokemonAssetComponent originSoundCry={originSoundCry} isLoadedForms={progress.isLoadedForms} />
      </div>
    </Error>
  );
};

export default Pokemon;
