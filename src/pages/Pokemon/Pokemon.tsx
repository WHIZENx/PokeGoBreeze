// @refresh reset
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Location, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import './Pokemon.scss';
import '../../components/Info/PokemonDetailLayout.scss';

import {
  Form,
  PokemonForm,
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
import AlertReleased from './components/AlertReleased';
import SearchBar from './components/SearchBar';
import SearchBarMain from './components/SearchBarMain';
import { Params, versionList } from '../../utils/constants';
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
  toNumber,
} from '../../utils/extension';
import { LocationState } from '../../core/models/router.model';
import { EqualMode, IncludeMode } from '../../utils/enums/string.enum';
import { PokemonType } from '../../enums/type.enum';
import {
  deduplicatePokemonFormSelections,
  findPokemonDetailBodyByForm,
  hasPokemonGoBattleModifierCatalog,
  normalizePokemonFormIdentity,
  pokemonGoFormIdentityKey,
} from '../../utils/pokemon-form-identity';
import { useNavigateToTop } from '../../components/Link/LinkToTop';
import { SearchingActions } from '../../store/actions';
import { useTitle } from '../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../utils/models/hook.model';
import { formStandard } from '../../utils/helpers/options-context.helpers';
import useIcon from '../../composables/useIcon';
import useRouter from '../../composables/useRouter';
import usePokemon from '../../composables/usePokemon';
import useSearch from '../../composables/useSearch';
import { isImagePreloaded, usePreloadedImage } from '../../utils/hooks/usePreloadedImage';
import { useSnackbar } from '../../contexts/snackbar.context';
import PokemonDetailHero from '../../components/Info/PokemonDetailHero';
import { getPokemonClassificationLabels } from '../../components/Info/ClassificationBadge';
import { buildPokemonDetailHeroTable } from '../../utils/pokemon-detail-hero';
import StableHeightSection from '../../components/Layout/StableHeightSection';
import {
  applyPokemonGoFormIdentity,
  findCanonicalSpeciesDefaultForm,
  getSpeciesGenderRatio,
  hydrateCanonicalPokemonDetail,
  isDuplicatePokemonGoNormalForm,
} from '../../utils/pokemon-detail-form';
import { buildPokemonDetailProfileImagePresentation } from '../../utils/pokemon-detail-profile-images';

interface ITypeCost {
  purified: PokemonTypeCost;
  thirdMove: PokemonTypeCost;
}

interface ReleasedAlertSnapshot {
  formName: string | undefined;
  pokemonType: PokemonType | undefined;
  releasedGO: boolean;
}

const pokemonNavigationRequestDelayMs = 100;

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
  const { routerAction } = useRouter();
  const dispatch = useDispatch();
  const { iconData } = useIcon();
  const {
    getFilteredPokemons,
    getFindPokemon,
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
  const latestSearchParamsRef = useRef(searchParams);
  latestSearchParamsRef.current = searchParams;

  const [pokeData, setPokeData] = useState<IPokemonDetailInfo[]>([]);
  const [formList, setFormList] = useState<IPokemonFormModify[][]>([]);

  const [data, setData] = useState<IPokemonSpecie>();
  const [dataStorePokemon, setDataStorePokemon] = useState<OptionsPokemon>();
  const navigationIdRef = useRef(0);
  const pokemonRequestIdRef = useRef(0);

  const [formName, setFormName] = useState<string>();
  const [originSoundCry, setOriginSoundCry] = useState<IFormSoundCry[]>([]);
  const [isFound, setIsFound] = useState(true);

  const [costModifier, setCostModifier] = useState<ITypeCost>();
  const [evolutionChain, setEvolutionChain] = useState<PokemonInfoEvo>();
  const [pokemonGoAsset, setPokemonGoAsset] = useState<IAsset>();
  const [pokemonGoFusionOptions, setPokemonGoFusionOptions] = useState<PokemonFusionOption[]>([]);
  const [pokemonGoEvolutionChains, setPokemonGoEvolutionChains] = useState<IEvolutionChain[]>([]);
  const [pokemonGoForms, setPokemonGoForms] = useState<PokemonGoFormCatalogEntry[]>([]);
  const [moveRankings, setMoveRankings] = useState<PokemonMoveRanking[]>([]);
  const [canonicalFormBundle, setCanonicalFormBundle] = useState<{ id: number; forms: PokemonForm[] }>();
  const [releasedAlert, setReleasedAlert] = useState<ReleasedAlertSnapshot>();

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

  const navigatePokemon = useCallback(
    (direction: -1 | 1, replace = false) => {
      const currentId = navigationIdRef.current || getPokemonIdByParam();
      const navigation = getPokemonNavigation(currentId);
      const target = direction < 0 ? navigation.prev : navigation.next;
      if (!target) {
        return;
      }

      navigationIdRef.current = target.id;
      setDataStorePokemon(getPokemonNavigation(target.id));
      if (params.id) {
        navigate(`/pokemon/${target.id}`, { replace });
      } else if (direction < 0) {
        props.onDecId?.();
      } else {
        props.onIncId?.();
      }
    },
    [getPokemonIdByParam, getPokemonNavigation, navigate, params.id, props.onDecId, props.onIncId]
  );

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

  const resolvePokemonSelection = useCallback(
    (id: number, form: Partial<IPokemonFormModify> | undefined, genderRate?: number) => {
      if (!form) {
        return undefined;
      }
      const selectedFormName = [form.pokemonGoForm, form.form?.formName, form.form?.name, form.defaultName].find(
        (value) => isNotEmpty(value)
      );
      const details = getPokemonDetails(id, selectedFormName, form.form?.pokemonType, Boolean(form.pokemonGoForm));
      hydrateCanonicalPokemonDetail(details, id, form);
      if (!form.pokemonGoForm) {
        const speciesGenderRatio = getSpeciesGenderRatio(genderRate);
        if (speciesGenderRatio) {
          details.genderRatio = speciesGenderRatio;
        }
      }
      details.pokemonType = form.form?.pokemonType ?? PokemonType.Normal;
      return {
        details,
        pokemon: PokemonDetail.setData(details),
      };
    },
    [getPokemonDetails]
  );

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
      setCanonicalFormBundle({ id: specie.id, forms: varieties.flatMap(({ forms }) => forms) });
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
      setPokemonGoForms(bundledPokemonGoForms);
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

      // The API catalog expands each exact Game Master form into its own
      // Shadow/Purified variants. Only synthesize the old generic variants
      // when an older API response does not provide that authoritative catalog.
      if (isShadow && !hasPokemonGoBattleModifierCatalog(bundledPokemonGoForms)) {
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
        const baseFormSprites = new Map<string, IPokemonSprite | undefined>();
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
          if (![PokemonType.Shadow, PokemonType.Purified].includes(selectedPokemonType)) {
            const identity = normalizePokemonFormIdentity(
              specie.id,
              item.form.formName || pokemon?.form || item.form.name
            );
            const existingSprites = baseFormSprites.get(identity);
            if (!existingSprites || getPreferredPokemonFormSprite(item.form.sprites)) {
              baseFormSprites.set(identity, item.form.sprites);
            }
          }
        });
        const canonicalDefaultForm = findCanonicalSpeciesDefaultForm(formListResult.flat(), specie.id);
        const canonicalNormalIdentity = normalizePokemonFormIdentity(specie.id, 'NORMAL');
        const hasCanonicalNormalAlias = formListResult
          .flat()
          .some(
            (item) =>
              item !== canonicalDefaultForm &&
              normalizePokemonFormIdentity(specie.id, item.form.formName) === canonicalNormalIdentity
          );

        bundledPokemonGoForms.forEach((pokemon, index) => {
          const key = pokemonGoFormIdentityKey(pokemon);
          const modifier =
            pokemon.pokemonType === PokemonType.Shadow
              ? 'SHADOW'
              : pokemon.pokemonType === PokemonType.Purified
                ? 'PURIFIED'
                : undefined;
          const baseIdentity = normalizePokemonFormIdentity(
            specie.id,
            modifier
              ? String(pokemon.form ?? '').replace(new RegExp(`_${modifier}$|^${modifier}$`), '') || 'NORMAL'
              : pokemon.form
          );
          const inheritedSprites = modifier ? baseFormSprites.get(baseIdentity) : undefined;
          if (
            isDuplicatePokemonGoNormalForm(
              canonicalDefaultForm,
              specie.id,
              pokemon,
              PokemonType.Normal,
              hasCanonicalNormalAlias
            )
          ) {
            selectedKeys.add(key);
            const canonicalAliasIdentities = new Set(
              (pokemon.canonicalAliases ?? [])
                .map((form) => normalizePokemonFormIdentity(specie.id, form))
                .filter(Boolean)
            );
            const aliasedCanonicalForms = canonicalAliasIdentities.size
              ? formListResult
                  .flat()
                  .filter(
                    (item) =>
                      ![PokemonType.Shadow, PokemonType.Purified].includes(item.form.pokemonType ?? PokemonType.None) &&
                      canonicalAliasIdentities.has(normalizePokemonFormIdentity(specie.id, item.form.formName))
                  )
              : canonicalDefaultForm
                ? [canonicalDefaultForm]
                : [];
            aliasedCanonicalForms.forEach((canonicalForm) => {
              applyPokemonGoFormIdentity(canonicalForm, pokemon);
              if (pokemon.asset) {
                canonicalForm.form.sprites = withPokemonGoAssetSprites(canonicalForm.form.sprites, pokemon.asset);
              }
            });
            return;
          }
          if (selectedKeys.has(key)) {
            const selectedForm = selectedForms.get(key);
            if (selectedForm) {
              applyPokemonGoFormIdentity(selectedForm, pokemon);
              if (pokemon.asset) {
                selectedForm.form.sprites = withPokemonGoAssetSprites(
                  inheritedSprites ?? selectedForm.form.sprites,
                  pokemon.asset
                );
              }
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
              withPokemonGoAssetSprites(inheritedSprites, pokemon.asset),
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
      let currentForm: IPokemonFormModify | undefined;
      const requestedSearchParams = latestSearchParamsRef.current;
      let formParams = getValueOrDefault(String, requestedSearchParams.get(Params.Form))
        .toUpperCase()
        .replaceAll('_', '-')
        .toLowerCase();
      const formTypeParams = requestedSearchParams.get(Params.FormType)?.toLowerCase();
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
          setSearchParams(
            (currentSearchParams) => {
              const nextSearchParams = new URLSearchParams(currentSearchParams);
              nextSearchParams.delete(Params.Form);
              nextSearchParams.delete(Params.FormType);
              return nextSearchParams;
            },
            { replace: true }
          );
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
      // Embedded Search and routed Details both publish one hydrated snapshot.
      // Do not expose a temporary PokéAPI body before the generated GO row.
      const initialSelection = !params.id
        ? resolvePokemonSelection(specie.id, currentForm, specie.genderRate)
        : undefined;
      if (!params.id && currentForm && initialSelection) {
        dispatch(
          SearchingActions.SetMainPokemonSelection.create({
            form: currentForm,
            pokemon: initialSelection.pokemon,
          })
        );
        setReleasedAlert({
          formName: convertSexName(currentForm.form.name),
          pokemonType: currentForm.form.pokemonType,
          releasedGO: initialSelection.details.releasedGO,
        });
      } else if (!params.id) {
        currentForm ??= defaultForm.at(0);
        if (currentForm) {
          dispatch(SearchingActions.SetMainPokemonForm.create(currentForm));
        }
      }
      setData(specie);

      setProgress((p) => PokemonProgress.create({ ...p, isLoadedForms: true }));
    },
    [getFindPokemon, retrieveMoves, dispatch, resolvePokemonSelection]
  );

  const queryPokemon = useCallback(
    (id: number) => {
      const requestId = ++pokemonRequestIdRef.current;
      const isDetailsRoute = Boolean(params.id);
      const requestedPathname = location.pathname;
      APIService.cancel(axiosSource.current);
      setIsFound(true);

      let requestSource: ReturnType<typeof APIService.reNewCancelToken> | undefined;
      const requestTimer = window.setTimeout(() => {
        if (requestId !== pokemonRequestIdRef.current) {
          return;
        }

        requestSource = APIService.reNewCancelToken();
        axiosSource.current = requestSource;

        APIService.getPokemonBundle(id, { cancelToken: requestSource.token })
          .then((res) => {
            if (requestId !== pokemonRequestIdRef.current || !res.data.data) {
              return;
            }
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
          })
          .catch((error: unknown) => {
            if (APIService.isCancel(error) || requestId !== pokemonRequestIdRef.current) {
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
            if (notFound && isDetailsRoute) {
              setIsFound(false);
            } else if (notFound) {
              navigateToTop('/error', {
                replace: true,
                state: { url: requestedPathname, id },
              });
            }
          });
      }, pokemonNavigationRequestDelayMs);

      return () => {
        window.clearTimeout(requestTimer);
        if (pokemonRequestIdRef.current === requestId) {
          pokemonRequestIdRef.current += 1;
        }
        if (requestSource) {
          APIService.cancel(requestSource);
        }
      };
    },
    [fetchMap, location.pathname, navigateToTop, params.id, showSnackbar]
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

    setFormName(undefined);
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
      if (id > 0) {
        setIsFound(true);
        if (dataId !== id) {
          clearData(true);
          return queryPokemon(id);
        }
      }
    }
  }, [params.id, props.searchOption?.id, getFilteredPokemons, data?.id, queryPokemon]);

  useEffect(() => {
    if (!data) {
      const id = getPokemonIdByParam();
      const navigation = getPokemonNavigation(id);
      navigationIdRef.current = id;
      setDataStorePokemon(navigation.current ? navigation : { current: new PokemonModel(id) });
      setCostModifier(undefined);
    }
  }, [data, getPokemonIdByParam, getPokemonNavigation]);

  useEffect(() => {
    const id = getPokemonIdByParam();
    if (id > 0 && isNotEmpty(getFilteredPokemons())) {
      const keyDownHandler = (event: KeyboardEvent) => {
        const isLeft = event.key === 'ArrowLeft';
        const isRight = event.key === 'ArrowRight';
        if (!isLeft && !isRight) {
          return;
        }
        event.preventDefault();
        navigatePokemon(isLeft ? -1 : 1, true);
      };
      document.addEventListener('keyup', keyDownHandler);
      return () => {
        document.removeEventListener('keyup', keyDownHandler);
      };
    }
  }, [params.id, props.searchOption?.id, getFilteredPokemons, navigatePokemon]);

  const checkReleased = (id: number, form: Partial<IPokemonFormModify> | undefined, releasedAlertFormName?: string) => {
    const selection = resolvePokemonSelection(id, form, data?.genderRate);
    if (!form || !selection) {
      return false;
    }
    dispatch(
      SearchingActions.SetMainPokemonSelection.create({
        form,
        pokemon: selection.pokemon,
      })
    );
    setReleasedAlert({
      formName: releasedAlertFormName,
      pokemonType: form.form?.pokemonType,
      releasedGO: selection.details.releasedGO,
    });
    return selection.details.releasedGO;
  };

  useEffect(() => {
    const id = toNumber(data?.id);
    if (searchingMainForm && searchingMainForm.defaultId === id && id > 0 && data) {
      const formParams = searchParams.get(Params.Form)?.replaceAll('_', '-');
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
      // Form changes are published by the route effect or the embedded
      // selection callback. This observer only derives presentation state.
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
      if (!currentForm && !isNotEmpty(form) && !isNotEmpty(formType)) {
        currentForm = findCanonicalSpeciesDefaultForm(flatForms, id);
      }
      let pokemonCurrentData =
        pokeData.find((item) => isEqual(currentForm?.form.name, item.name)) ??
        findPokemonDetailBodyByForm(pokeData, id, data?.name, currentForm?.form.formName);
      if (!pokemonCurrentData) {
        pokemonCurrentData = pokeData.find((item) => item.isDefault);
        if (!currentForm && pokemonCurrentData) {
          currentForm = flatForms.find((item) =>
            isEqual(item.form.name, pokemonCurrentData?.name, EqualMode.IgnoreCaseSensitive)
          );
        }
      }
      if (currentForm && pokemonCurrentData) {
        setFormName(convertSexName(currentForm.form.name));
        // checkReleased resolves the selected form against the Game Master and
        // dispatches the form/details pair atomically. Dispatching the raw
        // PokéAPI body first briefly made move rankings look unavailable.
        checkReleased(id, currentForm, convertSexName(currentForm.form.name));
      }
    }
  }, [pokeData, formList, data?.id, props.searchOption?.id, params.id, searchParams]);

  useEffect(() => {
    const id = getPokemonIdByParam();
    if (id > 0 && isNotEmpty(getFilteredPokemons())) {
      navigationIdRef.current = id;
      const navigation = getPokemonNavigation(id);
      if (navigation.current) {
        setDataStorePokemon(navigation);
      }
    }
  }, [getFilteredPokemons, getPokemonIdByParam, getPokemonNavigation, params.id, props.searchOption?.id]);

  const currentPokemonId = dataStorePokemon?.current?.id;
  const isMainImageReady = Boolean(
    currentPokemonId && searchingMainForm?.form && searchingMainForm.defaultId === currentPokemonId
  );
  const isMainProfileReady = Boolean(
    isMainImageReady && canonicalFormBundle && canonicalFormBundle.id === currentPokemonId
  );
  const requestedMainImageForm = searchParams.get(Params.Form)?.trim();
  const hasRequestedMainImageForm = Boolean(
    requestedMainImageForm && !isEqual(requestedMainImageForm, 'normal', EqualMode.IgnoreCaseSensitive)
  );
  const isRequestedMainImageFormPending = hasRequestedMainImageForm && !isMainImageReady;
  const officialMainImage = currentPokemonId ? APIService.getPokeOfficialArtwork(currentPokemonId) : undefined;
  const mainProfile = isMainProfileReady
    ? buildPokemonDetailProfileImagePresentation({
        canonicalForms:
          canonicalFormBundle && canonicalFormBundle.id === currentPokemonId ? canonicalFormBundle.forms : undefined,
        pokemonGoForms,
        selection: {
          num: currentPokemonId ?? 0,
          form:
            searchingMainForm?.pokemonGoForm ??
            searchingMainDetails?.form ??
            searchingMainForm?.form?.formName ??
            'NORMAL',
          fullName: searchingMainDetails?.fullName,
          pokemonType: searchingMainForm?.form?.pokemonType,
        },
      })
    : undefined;
  const preferredMainImage = mainProfile?.preferredImage;
  const isCanonicalDefaultMainForm = Boolean(isMainImageReady && searchingMainForm?.form?.id === currentPokemonId);
  const cacheableOfficialMainImage =
    (!isMainImageReady && !hasRequestedMainImageForm) || isCanonicalDefaultMainForm ? officialMainImage : undefined;
  const mainImageCandidates =
    currentPokemonId && !isRequestedMainImageFormPending ? (mainProfile?.imageCandidates ?? []) : [];
  const { displayedUrl: mainImage, isLoading: isMainImageLoading } = usePreloadedImage(
    mainImageCandidates,
    APIService.getPokeSprite(),
    [preferredMainImage, cacheableOfficialMainImage, mainProfile?.hybridImage],
    true
  );
  const cachedMainNavigationImage =
    !isMainProfileReady && !hasRequestedMainImageForm && isImagePreloaded(officialMainImage)
      ? officialMainImage
      : undefined;
  const displayedMainImage = cachedMainNavigationImage ?? mainImage;
  const showMainImageSkeleton = cachedMainNavigationImage
    ? false
    : !currentPokemonId || !isMainProfileReady || isRequestedMainImageFormPending || isMainImageLoading;
  const profileModifier =
    isMainImageReady && searchingMainForm?.form?.pokemonType === PokemonType.Shadow
      ? 'shadow'
      : isMainImageReady && searchingMainForm?.form?.pokemonType === PokemonType.Purified
        ? 'purified'
        : '';

  const classificationLabels = getPokemonClassificationLabels({
    isReady: progress.isLoadedForms && isMainImageReady,
    pokemonClass: searchingMainDetails?.pokemonClass,
    pokemonType: searchingMainForm?.form?.pokemonType,
    isBaby: data?.isBaby,
    isLegendary: data?.isLegendary,
    isMythical: data?.isMythical,
  });

  return (
    <Error isError={!isFound} isShowTitle={!isFound}>
      <div className="tw-w-full row prev-next-block tw-sticky tw-top-14">
        {params.id ? (
          <SearchBarMain data={dataStorePokemon} onNavigate={navigatePokemon} />
        ) : (
          <SearchBar data={dataStorePokemon} onDecId={() => navigatePokemon(-1)} onIncId={() => navigatePokemon(1)} />
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
        <PokemonDetailHero
          notice={
            <AlertReleased
              formName={releasedAlert?.formName}
              pokemonType={releasedAlert?.pokemonType}
              icon={iconData}
              releasedGO={releasedAlert?.releasedGO}
            />
          }
          imageSrc={displayedMainImage}
          isImageLoading={showMainImageSkeleton}
          imageTestId="pokemon-profile-image"
          profileModifier={profileModifier}
          classificationLabels={classificationLabels}
          table={buildPokemonDetailHeroTable(
            searchingMainDetails
              ? {
                  num: searchingMainDetails.id || dataStorePokemon?.current?.id,
                  fullName: searchingMainDetails.fullName || formName,
                  pokemonType: searchingMainDetails.pokemonType,
                  gen: searchingMainDetails.gen,
                  region: searchingMainDetails.region,
                  version: searchingMainDetails.version,
                  weightKg: searchingMainDetails.weightKg,
                  heightM: searchingMainDetails.heightM,
                }
              : undefined,
            progress.isLoadedForms
          )}
        />
        <FormComponent
          formList={formList}
          pokeData={pokeData}
          genderRate={data?.genderRate}
          setSearchOption={props.setSearchOption}
          onSelectForm={
            props.isSearch
              ? (value) => {
                  const id = toNumber(data?.id);
                  if (!id || value.defaultId !== id) {
                    return;
                  }
                  checkReleased(id, value, convertSexName(value.form.name));
                  props.setSearchOption?.({
                    id,
                    form: value.form.formName,
                    pokemonType: value.form.pokemonType,
                  });
                }
              : undefined
          }
          defaultId={dataStorePokemon?.current?.id}
          evolutionChain={evolutionChain}
          pokemonGoAsset={pokemonGoAsset}
          pokemonGoFusionOptions={pokemonGoFusionOptions}
          pokemonGoEvolutionChains={pokemonGoEvolutionChains}
          pokemonGoForms={pokemonGoForms}
          moveRankings={moveRankings}
          trainingCosts={costModifier}
          isLoadedForms={progress.isLoadedForms}
        />
        <section className="pokemon-detail-section tw-mt-4">
          <StableHeightSection
            animateHeight
            isLoading={!progress.isLoadedForms}
            minHeight={240}
            testId="pokemon-assets-stable"
          >
            <PokemonAssetComponent
              asset={pokemonGoAsset}
              originSoundCry={originSoundCry}
              isLoadedForms={progress.isLoadedForms}
            />
          </StableHeightSection>
        </section>
      </div>
    </Error>
  );
};

export default Pokemon;
