import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Location, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import './Pokemon.scss';

import {
  Form,
  IFormSoundCry,
  FormSoundCry,
  IPokemonFormModify,
  PokemonFormModify,
  PokemonFormModifyModel,
  PokemonFormDetail,
  IPokemonFormDetail,
  IPokemonSprite,
  PokemonSprite,
} from '../../core/models/API/form.model';
import { IPokemonDetailInfo, PokemonDetail, PokemonDetailInfo, PokemonInfoEvo } from '../../core/models/API/info.model';
import {
  IPokemonSpecie,
  OptionsPokemon,
  PokemonModel,
  PokemonProgress,
  PokemonSpecie,
} from '../../core/models/pokemon.model';
import APIService from '../../services/api.service';
import type {
  PokemonBundleVariety,
  PokemonFusionOption,
  PokemonGoFormCatalogEntry,
  PokemonMoveRanking,
} from '../../core/models/API/pokemon-bundle.model';
import type { IAsset } from '../../core/models/asset.model';
import type { IEvolutionChain } from '../../core/models/evolution-chain.model';
import { PokemonTypeCost } from '../../core/models/evolution.model';
import {
  convertPokemonImageName,
  convertSexName,
  generatePokemonGoShadowForms,
  getKeyWithData,
  getPokemonFormWithNoneSpecialForm,
  getPreferredPokemonFormSprite,
  getPokemonType,
  splitAndCapitalize,
} from '../../utils/utils';
import PokemonAssetComponent from '../../components/Info/Assets/PokemonModel';
import Candy from '../../components/Sprites/Candy/Candy';
import PokemonTable from '../../components/Commons/Tables/Pokemon/PokemonTable';
import AlertReleased from './components/AlertReleased';
import SearchBar from './components/SearchBar';
import SearchBarMain from './components/SearchBarMain';
import { regionList, Params, versionList } from '../../utils/constants';
import Error from '../Error/Error';
import { Action } from 'history';
import FormComponent from '../../components/Info/Form/Form';
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
import { PokemonType } from '../../enums/type.enum';
import { deduplicatePokemonFormSelections, pokemonGoFormIdentityKey } from '../../utils/pokemon-form-identity';
import { useNavigateToTop } from '../../components/Link/LinkToTop';
import { SearchingActions } from '../../store/actions';
import { useTitle } from '../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../utils/models/hook.model';
import { formStandard } from '../../utils/helpers/options-context.helpers';
import useIcon from '../../composables/useIcon';
import useSpinner from '../../composables/useSpinner';
import useRouter from '../../composables/useRouter';
import usePokemon from '../../composables/usePokemon';
import useSearch from '../../composables/useSearch';
import { usePreloadedImage } from '../../utils/hooks/usePreloadedImage';
import { useSnackbar } from '../../contexts/snackbar.context';
import { Skeleton } from '@mui/material';

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

const withPokemonGoAssetSprites = (sprites: IPokemonSprite | undefined, asset: PokemonGoFormCatalogEntry['asset']) => {
  const result = Object.assign(new PokemonSprite(), sprites);
  if (!asset) {
    return result;
  }
  const defaultSprite = APIService.getPokemonModel(asset.default);
  const shinySprite = asset.shiny ? APIService.getPokemonModel(asset.shiny) : '';
  result.frontDefault ||= defaultSprite;
  result.frontHome ||= defaultSprite;
  result.frontArtwork ||= defaultSprite;
  result.frontShiny ||= shinySprite;
  return result;
};

const Pokemon = (props: IPokemonPage) => {
  const { spinnerIsLoading } = useSpinner();
  const { routerAction } = useRouter();
  const dispatch = useDispatch();
  const { iconData } = useIcon();
  const {
    getFilteredPokemons,
    getFindPokemon,
    getPokemonById,
    checkPokemonIncludeShadowForm,
    generatePokemonGoForms,
    getPokemonDetails,
    getPokemonNavigation,
    retrieveMoves,
  } = usePokemon();
  const { searchingMainData, searchingMainForm, searchingMainDetails } = useSearch();

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
  const [evolutionChain, setEvolutionChain] = useState<PokemonInfoEvo>();
  const [pokemonGoAsset, setPokemonGoAsset] = useState<IAsset>();
  const [pokemonGoFusionOptions, setPokemonGoFusionOptions] = useState<PokemonFusionOption[]>([]);
  const [pokemonGoEvolutionChains, setPokemonGoEvolutionChains] = useState<IEvolutionChain[]>([]);
  const [moveRankings, setMoveRankings] = useState<PokemonMoveRanking[]>([]);

  const [progress, setProgress] = useState(new PokemonProgress());

  const axiosSource = useRef(APIService.getCancelToken());
  const { showSnackbar } = useSnackbar();

  const getPokemonIdByParam = useCallback(() => {
    let id = toNumber(params.id ? params.id.toLowerCase() : props.searchOption?.id);
    if (id === 0 && params.id && isNotEmpty(params.id) && isNotEmpty(getFilteredPokemons())) {
      const pokemon = getFindPokemon((p) =>
        isEqual(p.pokemonId?.toString().replaceAll('_', '-'), params.id, EqualMode.IgnoreCaseSensitive)
      );
      id = toNumber(pokemon?.num);
    }
    return id;
  }, [params.id, props.searchOption?.id, getFilteredPokemons, getFindPokemon]);

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
      const normalizedName = getValueOrDefault(String, formName?.replaceAll('_', '-').toUpperCase());
      const normalizedType = formType.toUpperCase();
      if (normalizedName === normalizedType) {
        return normalizedType;
      }
      [form] = normalizedName.split(`-${normalizedType}`);
    }
    const normalizedForm = getPokemonFormWithNoneSpecialForm(form, pokemonType);
    const result = (
      isEqual(normalizedForm, formStandard(), EqualMode.IgnoreCaseSensitive)
        ? normalizedForm
        : normalizedForm?.replace(`_${formStandard()}`, '')
    )?.replaceAll('_', '-');
    return formType ? `${result}${result ? '-' : ''}${formType.toUpperCase()}` : result;
  };

  const fetchMap = useCallback(
    (
      specie: IPokemonSpecie,
      varieties: PokemonBundleVariety[],
      bundledEvolutionChain: PokemonInfoEvo | null,
      bundledMoveRankings: PokemonMoveRanking[] = [],
      bundledPokemonGoForms: PokemonGoFormCatalogEntry[] = [],
      bundledPokemonGoAsset?: IAsset | null,
      bundledPokemonGoEvolutionChains: IEvolutionChain[] = [],
      bundledFusionOptions: PokemonFusionOption[] = []
    ) => {
      const dataPokeList: IPokemonDetailInfo[] = [];
      const dataFormList: IPokemonFormDetail[][] = [];
      const soundCries: IFormSoundCry[] = [];
      varieties.forEach(({ pokemon: pokeInfo, forms }) => {
        const pokeForm = forms.map((form) => PokemonFormDetail.setDetails(form));
        pokeInfo.isIncludeShadow = checkPokemonIncludeShadowForm(pokeInfo.name);
        const pokeDetail = PokemonDetailInfo.setDetails(pokeInfo);
        soundCries.push(new FormSoundCry(pokeDetail));
        dataPokeList.push(pokeDetail);
        dataFormList.push(pokeForm);
      });

      if (!isNotEmpty(dataPokeList) || !isNotEmpty(dataFormList)) {
        return;
      }
      setEvolutionChain(bundledEvolutionChain ?? undefined);
      setPokemonGoAsset(bundledPokemonGoAsset ?? undefined);
      setPokemonGoFusionOptions(bundledFusionOptions);
      setPokemonGoEvolutionChains(bundledPokemonGoEvolutionChains);
      setMoveRankings(bundledMoveRankings);

      const pokemon = getFindPokemon((item) => item.num === specie.id);
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
      let formListResult: IPokemonFormModify[][] = dataFormList
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

      const indexPokemonGO = generatePokemonGoForms(dataFormList, formListResult, specie.id, specie.name);

      if (isShadow) {
        generatePokemonGoShadowForms(dataPokeList, formListResult, specie.id, specie.name, indexPokemonGO);
      }

      setOriginSoundCry(soundCries);
      setPokeData(dataPokeList);

      const duplicateFormKeys = new Map<string, number>();
      formListResult.flat().forEach((item) => {
        const key = `${item.form.pokemonType}:${item.form.formName ?? ''}`;
        duplicateFormKeys.set(key, (duplicateFormKeys.get(key) ?? 0) + 1);
      });
      formListResult = formListResult.map((items) =>
        items.map((item) => {
          const key = `${item.form.pokemonType}:${item.form.formName ?? ''}`;
          if ((duplicateFormKeys.get(key) ?? 0) <= 1) {
            return item;
          }
          const distinctFormName = item.form.name.replace(`${specie.name}-`, '');
          return PokemonFormModify.create({
            ...item,
            form: Form.create({ ...item.form, formName: distinctFormName }, true, isShadow),
          });
        })
      );

      formListResult = deduplicatePokemonFormSelections(formListResult);

      if (bundledPokemonGoForms.length) {
        const selectedKeys = new Set<string>();
        const selectedForms = new Map<string, IPokemonFormModify>();
        formListResult.flat().forEach((item) => {
          const selectedPokemonType = item.form.pokemonType ?? PokemonType.None;
          const pokemon = retrieveMoves(
            specie.id,
            item.form.formName ?? item.form.name ?? item.name,
            selectedPokemonType
          );
          const pokemonType = [PokemonType.Shadow, PokemonType.Purified].includes(selectedPokemonType)
            ? selectedPokemonType
            : (pokemon?.pokemonType ??
              (item.form.isDefault && selectedPokemonType === PokemonType.None
                ? PokemonType.Normal
                : selectedPokemonType));
          const key = pokemonGoFormIdentityKey({
            num: specie.id,
            form: item.form.formName || pokemon?.form,
            pokemonType,
          });
          selectedKeys.add(key);
          selectedForms.set(key, item);
        });

        bundledPokemonGoForms.forEach((pokemon, index) => {
          const key = pokemonGoFormIdentityKey(pokemon);
          if (selectedKeys.has(key)) {
            const selectedForm = selectedForms.get(key);
            if (selectedForm && pokemon.asset) {
              selectedForm.form.sprites = withPokemonGoAssetSprites(selectedForm.form.sprites, pokemon.asset);
            }
            return;
          }
          selectedKeys.add(key);
          const formName = String(pokemon.form ?? '')
            .replaceAll('_', '-')
            .toLowerCase();
          formListResult.push([
            new PokemonFormModifyModel(
              specie.id,
              specie.name,
              pokemon.name?.replaceAll('_', '-').toLowerCase(),
              formName,
              pokemon.fullName?.replaceAll('_', '-').toLowerCase(),
              versionList[0].replace(' ', '-'),
              pokemon.types ?? [],
              withPokemonGoAssetSprites(undefined, pokemon.asset),
              -100_000 - index,
              pokemon.pokemonType ?? PokemonType.Normal,
              false
            ),
          ]);
        });
      }

      setFormList(formListResult);

      // Set Default Form
      const flatForms = formListResult.flatMap((item) => item);
      let currentForm: IPokemonFormModify | undefined = new PokemonFormModify();
      let formParams = getValueOrDefault(String, searchParams.get(Params.Form))
        .toUpperCase()
        .replaceAll('_', '-')
        .toLowerCase();
      const formTypeParams = searchParams.get(Params.FormType)?.toLowerCase();
      if (!isNullOrUndefined(formTypeParams)) {
        formParams += isNotEmpty(formParams) && isNotEmpty(formTypeParams) ? `-${formTypeParams}` : formTypeParams;
      }
      const defaultForm = flatForms.filter((item) => item.form.isDefault);
      if (routerAction === Action.Pop && searchingMainData && !params.id) {
        currentForm = flatForms.find((item) =>
          isEqual(item.form.formName, searchingMainForm?.form?.formName, EqualMode.IgnoreCaseSensitive)
        );
      } else if (isNotEmpty(formParams)) {
        const defaultFormSearch = flatForms.find((item) => {
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
        currentForm = flatForms.find(
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
      currentForm ??= flatForms.find((item) => item.defaultId === specie.id);
      let defaultData = dataPokeList.find((value) => isEqual(value.name, currentForm?.form.name));
      defaultData ??= dataPokeList.find((value) => isEqual(value.name, currentForm?.name));
      if (defaultData && currentForm) {
        const pokemonDetails = PokemonDetail.setDetails(defaultData);
        pokemonDetails.pokemonType = currentForm.form.pokemonType;
        dispatch(
          SearchingActions.SetMainPokemonSelection.create({
            form: currentForm,
            pokemon: pokemonDetails,
          })
        );
      } else {
        currentForm ??= defaultForm.at(0);
        if (currentForm) {
          dispatch(SearchingActions.SetMainPokemonForm.create(currentForm));
        }
      }
      setData(specie);

      setProgress((p) => PokemonProgress.create({ ...p, isLoadedForms: true }));
    },
    [getFindPokemon, retrieveMoves, searchParams, dispatch]
  );

  const queryPokemon = useCallback(
    (id: number) => {
      APIService.cancel(axiosSource.current);
      axiosSource.current = APIService.reNewCancelToken();
      const cancelToken = axiosSource.current.token;

      APIService.getPokemonBundle(id, { cancelToken })
        .then((res) => {
          if (res.data.data) {
            const result = PokemonSpecie.create(res.data.data.species);
            fetchMap(
              result,
              res.data.data.varieties,
              res.data.data.evolutionChain,
              res.data.data.moveRankings ?? [],
              res.data.data.pokemonGo?.forms ?? [],
              res.data.data.pokemonGo?.asset,
              res.data.data.pokemonGo?.evolutionChains,
              res.data.data.pokemonGo?.fusionOptions
            );
          }
        })
        .catch((error: unknown) => {
          if (APIService.isCancel(error)) {
            return;
          }
          const status = (error as { response?: { status?: number } }).response?.status;
          const notFound = status === 404;
          showSnackbar(
            notFound
              ? `Pokémon ID or name: ${id} not found!`
              : `Unable to display Pokémon data for ID: ${id}. Please try again.`,
            'error'
          );
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
    [fetchMap]
  );

  const clearData = (isForceClear = false) => {
    if (isForceClear) {
      setProgress((p) => PokemonProgress.create({ ...p, isLoadedForms: false }));
    }

    // Keep the last complete snapshot visible while a different Pokémon is
    // being fetched. The successful bundle response replaces all dependent
    // fields together in fetchMap.
    if (data) {
      return;
    }

    setOriginForm(undefined);
    setFormName(undefined);
    setVersion('');
    setRegion('');
    setGeneration('');
    dispatch(SearchingActions.ResetMainPokemon.create());
    dispatch(SearchingActions.ResetPokemonMainSearch.create());
    if (isForceClear) {
      setFormList([]);
      setPokeData([]);
      setCostModifier(undefined);
      setMoveRankings([]);
      setPokemonGoAsset(undefined);
      setPokemonGoFusionOptions([]);
      setPokemonGoEvolutionChains([]);
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
    const pokemons = getFilteredPokemons();
    if (isNotEmpty(pokemons)) {
      let id = toNumber(params.id ? params.id.toLowerCase() : props.searchOption?.id);
      if (id <= 0 && params.id && isNotEmpty(params.id) && isNotEmpty(pokemons)) {
        id = getPokemonIdByParam();
        if (id <= 0) {
          showSnackbar(`Pokémon ID or name: ${params.id} not found!`, 'error');
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
        APIService.cancel(axiosSource.current);
      };
    }
  }, [params.id, props.searchOption?.id, getFilteredPokemons, data?.id, queryPokemon]);

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
    if (id > 0 && isNotEmpty(getFilteredPokemons())) {
      const keyDownHandler = (event: KeyboardEvent) => {
        if (spinnerIsLoading) {
          return;
        }
        const isLeft = event.key === 'ArrowLeft';
        const isRight = event.key === 'ArrowRight';
        if (!isLeft && !isRight) {
          return;
        }
        const currentPokemon = getPokemonById(id);
        if (!currentPokemon) {
          return;
        }
        const navigation = getPokemonNavigation(currentPokemon.id);
        if (isLeft) {
          const prev = navigation.prev;
          if (prev) {
            event.preventDefault();
            params.id ? navigate(`/pokemon/${prev.id}`, { replace: true }) : props.onDecId?.();
          }
        } else {
          const next = navigation.next;
          if (next) {
            event.preventDefault();
            params.id ? navigate(`/pokemon/${next.id}`, { replace: true }) : props.onIncId?.();
          }
        }
      };
      document.addEventListener('keyup', keyDownHandler);
      return () => {
        document.removeEventListener('keyup', keyDownHandler);
      };
    }
  }, [params.id, props.searchOption?.id, spinnerIsLoading, getFilteredPokemons, getPokemonById, getPokemonNavigation]);

  const checkReleased = (id: number, form: Partial<IPokemonFormModify> | undefined) => {
    if (!form) {
      return false;
    }
    // The canonical form name (for example ALOLA_TOTEM, ICE, MALE, or HERO)
    // is the most precise key for the Pokémon GO Game Master row. The PokeAPI
    // Pokémon name can be broader (for example marowak-alola) and previously
    // caused distinct forms to resolve to the first matching GO form.
    const formName = [form.form?.formName, form.form?.name, form.defaultName].find((value) => isNotEmpty(value));
    const details = getPokemonDetails(id, formName, form.form?.pokemonType, form.form?.isDefault);
    details.pokemonType = form.form?.pokemonType ?? PokemonType.Normal;
    const pokemonDetails = PokemonDetail.setData(details);
    const normalizeBodyName = (value: string | undefined) => value?.replaceAll('_', '-').toLowerCase();
    const normalizedFullName = normalizeBodyName(details.fullName);
    const normalizedFormName = normalizeBodyName(form.form?.formName);
    const canonicalFormName =
      data?.name && normalizedFormName ? `${normalizeBodyName(data.name)}-${normalizedFormName}` : undefined;
    const canonicalBodyNames = new Set([normalizedFullName, canonicalFormName]);
    const formBody =
      pokeData.find((item) => canonicalBodyNames.has(normalizeBodyName(item.name))) ??
      pokeData.find((item) => isEqual(item.name, form.form?.name, EqualMode.IgnoreCaseSensitive)) ??
      pokeData.find((item) => isEqual(item.name, form.name, EqualMode.IgnoreCaseSensitive));
    const fallbackBody = formBody ?? pokeData.find((item) => item.isDefault);
    if (fallbackBody) {
      // PokeAPI body measurements use decimetres/hectograms, which is the
      // representation expected by PokemonTable. Keep those form-specific
      // values while enriching the same snapshot with Pokémon GO mechanics.
      pokemonDetails.height = fallbackBody.height;
      pokemonDetails.weight = fallbackBody.weight;
      pokemonDetails.name = fallbackBody.name;
    } else {
      // Generated Game Master values are metres/kilograms. Normalize them only
      // when no canonical form detail exists (for example a GO-only costume).
      pokemonDetails.height = toNumber(details.heightM) * 10;
      pokemonDetails.weight = toNumber(details.weightKg) * 10;
    }
    dispatch(
      SearchingActions.SetMainPokemonSelection.create({
        form,
        pokemon: pokemonDetails,
      })
    );
    return details.releasedGO;
  };

  useEffect(() => {
    const id = toNumber(data?.id);
    if (searchingMainForm && id > 0 && data) {
      const formParams = searchParams.get(Params.Form)?.replaceAll('_', '-');
      setVersion(getValueOrDefault(String, searchingMainForm.form?.version));
      setGeneration(getValueOrDefault(String, data.generation.toString()));
      if (!params.id) {
        setRegion(regionList[data.generation]);
      } else if (isNotEmpty(searchingMainForm.form?.formName)) {
        const currentRegion = Object.values(regionList).find((item) =>
          isInclude(searchingMainForm.form?.formName, item, IncludeMode.IncludeIgnoreCaseSensitive)
        );
        setRegion(
          currentRegion && (!region || !isEqual(region, currentRegion))
            ? currentRegion
            : currentRegion
              ? region
              : regionList[data.generation]
        );
      } else {
        setRegion(regionList[data.generation]);
      }
      const nameInfo =
        routerAction === Action.Pop && searchingMainData && !params.id
          ? searchingMainForm?.form?.name
          : searchingMainForm.form?.isDefault
            ? searchingMainForm.form.name
            : formParams || toNumber(searchingMainForm.form?.id) < 0
              ? searchingMainForm.form?.name
              : data.name;
      setFormName(convertSexName(nameInfo));
      const originForm = splitAndCapitalize(searchingMainForm.form?.formName, '-', '-');
      setOriginForm(originForm);
      if (params.id) {
        const pokemonName = splitAndCapitalize(nameInfo, '-', ' ');
        setTitleProps({
          title: `${pokemonName} (#${data.id}) - Stats, Moves & PVP | PokéGO Breeze`,
          description: `Complete Pokémon GO stats, movesets, and PVP analysis for ${pokemonName} (#${data.id}). View IV ranges, evolution chain, shadow/purified forms, and battle league rankings.`,
          keywords: [
            'Pokémon GO',
            pokemonName,
            `#${data.id}`,
            `${pokemonName} stats`,
            `${pokemonName} moves`,
            `${pokemonName} PVP`,
            'PokéGO Breeze',
          ],
          image: APIService.getPokeFullSprite(
            dataStorePokemon?.current?.id,
            convertPokemonImageName(
              searchingMainForm && originForm && searchingMainForm.defaultId === searchingMainForm.form?.id
                ? ''
                : originForm || searchParams.get(Params.Form)?.replaceAll('_', '-')
            )
          ),
        });
      }
      checkReleased(id, searchingMainForm);
    } else {
      clearData();
    }
  }, [data, props.searchOption?.id, params.id, searchingMainForm]);

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
      } else if (routerAction === Action.Pop && searchingMainData && !params.id) {
        form = getValueOrDefault(String, searchingMainForm?.form?.formName);
      } else if (!isNullOrUndefined(formType)) {
        if (!isEqual(form, formType, EqualMode.IgnoreCaseSensitive)) {
          form += isNotEmpty(form) && isNotEmpty(formType) ? `-${formType}` : formType;
        }
      }
      const flatForms = formList.flatMap((item) => item);
      let currentForm = flatForms.find((item) => {
        if (formType && isEqual(form, formType, EqualMode.IgnoreCaseSensitive)) {
          return isEqual(getKeyWithData(PokemonType, item.form.pokemonType), formType, EqualMode.IgnoreCaseSensitive);
        }
        const result = convertPokemonForm(item.form.formName, formType, item.form.pokemonType);
        return isEqual(result, form, EqualMode.IgnoreCaseSensitive);
      });
      let pokemonCurrentData = pokeData.find((item) => isEqual(currentForm?.form.name, item.name));
      if (!pokemonCurrentData) {
        pokemonCurrentData = pokeData.find((item) => item.isDefault);
        if (!currentForm && pokemonCurrentData) {
          currentForm = flatForms.find((item) =>
            isEqual(item.form.name, pokemonCurrentData?.name, EqualMode.IgnoreCaseSensitive)
          );
        }
      }
      if (currentForm && pokemonCurrentData) {
        const pokemonDetails = PokemonDetail.setDetails(pokemonCurrentData);
        pokemonDetails.pokemonType = currentForm.form.pokemonType;
        dispatch(
          SearchingActions.SetMainPokemonSelection.create({
            form: currentForm,
            pokemon: pokemonDetails,
          })
        );
        const originForm = splitAndCapitalize(currentForm.form.formName, '-', '-');
        setOriginForm(originForm);
        setFormName(convertSexName(currentForm.form.name));
        checkReleased(id, currentForm);
      }
    }
  }, [pokeData, formList, data?.id, props.searchOption?.id, params.id, searchParams]);

  useEffect(() => {
    const id = getPokemonIdByParam();
    if (id > 0 && isNotEmpty(getFilteredPokemons())) {
      const displayedId = toNumber(data?.id);
      if (displayedId > 0 && displayedId !== id && !progress.isLoadedForms) {
        return;
      }
      const navigation = getPokemonNavigation(displayedId || id);
      if (navigation.current) {
        setDataStorePokemon(navigation);
      }
    }
  }, [getFilteredPokemons, getPokemonNavigation, params.id, props.searchOption?.id, data?.id, progress.isLoadedForms]);

  const reload = (element: JSX.Element, color = 'var(--loading-custom-bg)') => {
    if (progress.isLoadedForms) {
      return element;
    }
    return (
      <div className="slide-container !tw-w-3/4 !tw-m-0 !tw-p-0 !tw-h-6 tw-opacity-50" style={{ background: color }}>
        <Skeleton variant="rectangular" animation="wave" className="!tw-w-full !tw-h-full !tw-m-0 !tw-p-0" />
      </div>
    );
  };

  const hybridImage = APIService.getPokeFullSprite(
    dataStorePokemon?.current?.id,
    convertPokemonImageName(
      searchingMainForm && originForm && searchingMainForm.defaultId === searchingMainForm.form?.id
        ? ''
        : originForm || searchParams.get(Params.Form)?.replaceAll('_', '-')
    )
  );
  const mainImageCandidates = [
    hybridImage,
    getPreferredPokemonFormSprite(searchingMainForm?.form?.sprites),
    APIService.getPokeFullAsset(dataStorePokemon?.current?.id),
  ];
  const { displayedUrl: mainImage, isLoading: isMainImageLoading } = usePreloadedImage(
    mainImageCandidates,
    APIService.getPokeSprite()
  );
  const profileModifier =
    searchingMainForm?.form?.pokemonType === PokemonType.Shadow
      ? 'shadow'
      : searchingMainForm?.form?.pokemonType === PokemonType.Purified
        ? 'purified'
        : '';

  return (
    <Error isError={!isFound} isShowTitle={!isFound}>
      <div className="tw-w-full row prev-next-block tw-sticky tw-top-14">
        {params.id ? (
          <SearchBarMain data={dataStorePokemon} />
        ) : (
          <SearchBar data={dataStorePokemon} onDecId={props.onDecId} onIncId={props.onIncId} />
        )}
      </div>
      <div
        data-testid="pokemon-details-page"
        data-pokemon-id={data?.id ?? ''}
        data-selected-name={searchingMainForm?.form?.name ?? ''}
        data-selected-form={searchingMainForm?.form?.formName ?? ''}
        data-selected-pokemon-type={searchingMainForm?.form?.pokemonType ?? ''}
        data-detail-full-name={searchingMainDetails?.fullName ?? ''}
        data-detail-form={searchingMainDetails?.form ?? ''}
        data-detail-body-name={searchingMainDetails?.name ?? ''}
        data-body-form-names={pokeData.map((item) => item.name).join(',')}
        data-detail-pokemon-type={searchingMainDetails?.pokemonType ?? ''}
        data-detail-types={searchingMainDetails?.types?.join(',') ?? ''}
        aria-busy={!progress.isLoadedForms}
        className={combineClasses(
          'tw-pb-3 tw-relative poke-container tw-text-default',
          props.isSearch ? '' : 'tw-container'
        )}
      >
        <div className="tw-w-full tw-text-center tw-inline-block tw-align-middle tw-my-3">
          <AlertReleased formName={formName} pokemonType={searchingMainForm?.form?.pokemonType} icon={iconData} />
          <div
            className={combineClasses(
              'tw-relative tw-isolate tw-inline-block tw-overflow-visible img-desc pokemon-profile-aura',
              profileModifier ? `pokemon-profile-aura--${profileModifier}` : ''
            )}
            aria-busy={isMainImageLoading}
            data-testid="pokemon-profile-image"
            data-profile-modifier={profileModifier}
          >
            <img className="pokemon-main-sprite !tw-align-baseline" alt="Image Pokemon" src={mainImage} />
          </div>
          <div className="tw-inline-block tw-align-bottom">
            <PokemonTable
              className="pokemon-detail-table"
              id={dataStorePokemon?.current?.id}
              gen={generation}
              formName={formName}
              region={region}
              version={version}
              weight={searchingMainDetails?.weight}
              height={searchingMainDetails?.height}
              isLoadedForms={progress.isLoadedForms}
            />
          </div>
          <div className="tw-inline-block !tw-p-0 tw-align-bottom">
            <table className="table-info table-main">
              <thead />
              <tbody>
                <tr className="tw-text-center">
                  <td className="table-sub-header">Unlock third move</td>
                  <td className="table-sub-header">Costs</td>
                </tr>
                <tr className="info-costs">
                  <td>
                    <img alt="Image Cost Info" width={100} src={APIService.getItemSprite('Item_1202')} />
                  </td>
                  <td className="!tw-p-0">
                    <div className="tw-flex tw-items-center row-extra td-costs">
                      <Candy id={dataStorePokemon?.current?.id} className="tw-mr-1" />
                      {reload(
                        <span>
                          {!isUndefined(costModifier?.thirdMove.candy)
                            ? `x${costModifier?.thirdMove.candy}`
                            : 'Unavailable'}
                        </span>
                      )}
                    </div>
                    <div className="row-extra tw-flex">
                      <div className="tw-inline-flex tw-justify-center tw-mr-1 tw-w-5">
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
                <tr className="tw-text-center">
                  <td className="table-sub-header">Purified</td>
                  <td className="table-sub-header">Costs</td>
                </tr>
                <tr className="info-costs">
                  <td>
                    <img alt="Image Cost Info" width={60} height={60} src={APIService.getPokePurified()} />
                  </td>
                  <td className="!tw-p-0">
                    <div className="tw-flex tw-items-center row-extra td-costs">
                      <Candy id={dataStorePokemon?.current?.id} className="tw-mr-1" />
                      {reload(
                        <span>
                          {!isUndefined(costModifier?.purified.candy)
                            ? `x${costModifier?.purified.candy}`
                            : 'Unavailable'}
                        </span>
                      )}
                    </div>
                    <div className="row-extra tw-flex">
                      <div className="tw-inline-flex tw-justify-center tw-mr-1 tw-w-5">
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
          evolutionChain={evolutionChain}
          pokemonGoAsset={pokemonGoAsset}
          pokemonGoFusionOptions={pokemonGoFusionOptions}
          pokemonGoEvolutionChains={pokemonGoEvolutionChains}
          moveRankings={moveRankings}
          isLoadedForms={progress.isLoadedForms}
        />
        <PokemonAssetComponent
          asset={pokemonGoAsset}
          originSoundCry={originSoundCry}
          isLoadedForms={progress.isLoadedForms}
        />
      </div>
    </Error>
  );
};

export default Pokemon;
