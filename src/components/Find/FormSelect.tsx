import { getApiErrorMessage } from '../../services/api-error';
import React, { Fragment, useCallback, useEffect, useState, type ReactNode } from 'react';
import './FormSelect.scss';
import '../Info/PokemonDetailLayout.scss';
import APIService from '../../services/api.service';
import type { PokemonBundleVariety, PokemonGoFormCatalogEntry } from '../../core/models/API/pokemon-bundle.model';
import Tools from './Tools';

import {
  convertSexName,
  getItemSpritePath,
  getPokemonType,
  isSpecialFormType,
  splitAndCapitalize,
  TypeRadioGroup,
} from '../../utils/utils';
import TypeInfo from '../Sprites/Type/Type';
import { FormControlLabel, Radio, Skeleton } from '@mui/material';
import { useDispatch } from 'react-redux';
import { IPokemonName, IPokemonSpecie, PokemonSpecie } from '../../core/models/pokemon.model';
import {
  Form,
  IPokemonFormModify,
  PokemonFormModify,
  PokemonFormModifyModel,
  PokemonFormDetail,
  PokemonForm,
  IPokemonFormDetail,
  PokemonSprite,
} from '../../core/models/API/form.model';
import { IPokemonDetailInfo, PokemonDetail, PokemonDetailInfo } from '../../core/models/API/info.model';
import { IFormSelectComponent } from '../models/component.model';
import { PokemonType, TypeRaid } from '../../enums/type.enum';
import { SearchingActions } from '../../store/actions';
import { combineClasses, getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber } from '../../utils/extension';
import { ItemName } from '../../pages/News/enums/item-type.enum';
import useSearch from '../../composables/useSearch';
import usePokemon from '../../composables/usePokemon';
import ButtonGroupForm, { FormOptionSkeletonRow } from '../Commons/Buttons/ButtonGroupForm';
import { IButtonGroupFormComponent } from '../Commons/models/component.model';
import { useSnackbar } from '../../contexts/snackbar.context';
import {
  isImagePreloaded,
  markImageAsPreloaded,
  preloadFirstAvailableImage,
  usePreloadedImage,
} from '../../utils/hooks/usePreloadedImage';
import { deduplicatePokemonFormSelections, pokemonGoFormIdentityKey } from '../../utils/pokemon-form-identity';
import { isCanonicalSpeciesDefaultForm } from '../../utils/pokemon-detail-form';
import { buildPokemonDetailProfileImagePresentation } from '../../utils/pokemon-detail-profile-images';

interface PokemonSelectorDetailsProps {
  previous?: ReactNode;
  next?: ReactNode;
  profile?: ReactNode;
  types?: ReactNode;
  name?: ReactNode;
  profileModifier?: string;
  isProfileLoading?: boolean;
  profileSkeletonTestId?: string;
  forms?: Pick<IButtonGroupFormComponent, 'isLoaded' | 'forms' | 'id' | 'defaultId' | 'changeForm'>;
}

export const PokemonSelectorDetails = ({
  previous,
  next,
  profile,
  types,
  name,
  profileModifier = '',
  isProfileLoading = true,
  profileSkeletonTestId = 'tool-pokemon-profile-skeleton',
  forms,
}: PokemonSelectorDetailsProps) => (
  <div className="tw-mx-auto tw-w-form tw-max-w-full">
    <div className="tw-flex tw-items-start tw-justify-center">
      <div className="tw-h-16 tw-w-16 tw-min-w-0">{previous}</div>
      <span
        aria-busy={isProfileLoading}
        className={combineClasses(
          'tw-inline-flex tw-h-pokemon-profile tw-w-pokemon-profile tw-shrink-0 tw-items-center tw-justify-center pokemon-profile-aura',
          profileModifier ? `pokemon-profile-aura--${profileModifier}` : ''
        )}
        data-profile-modifier={profileModifier}
      >
        {profile ?? (
          <Skeleton
            variant="rounded"
            animation="wave"
            className="!tw-h-form-preview !tw-w-form-preview"
            data-skeleton-surface="pokemon-image"
            data-testid={profileSkeletonTestId}
          />
        )}
      </span>
      <div className="tw-h-16 tw-w-16 tw-min-w-0">{next}</div>
    </div>
    <div className="tw-mt-2 tw-h-16">
      {types ?? (
        <div className="tw-mt-2" aria-hidden="true">
          <div className="type-list tw-inline-flex tw-flex-wrap tw-items-center">
            {[0, 1].map((index) => (
              <div key={index}>
                <Skeleton variant="circular" animation="wave" className="!tw-h-9 !tw-w-9" />
                <span className="caption">
                  <Skeleton variant="text" animation="wave" className="tw-mx-auto !tw-w-9" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    <h4>
      <b>{name ?? <Skeleton variant="text" animation="wave" className="tw-mx-auto !tw-w-40" />}</b>
    </h4>
    <ButtonGroupForm
      className="tw-my-1 tw-w-full"
      height={180}
      isLoaded={forms?.isLoaded ?? false}
      forms={forms?.forms ?? []}
      id={forms?.id}
      defaultId={forms?.defaultId}
      changeForm={(form) => forms?.changeForm(form)}
      loading={<FormOptionSkeletonRow />}
    />
  </div>
);

const pokemonGoAssetSprites = (asset: PokemonGoFormCatalogEntry['asset']) => {
  const sprites = new PokemonSprite();
  if (!asset) {
    return sprites;
  }
  const defaultSprite = APIService.getPokemonModel(asset.default);
  const shinySprite = asset.shiny ? APIService.getPokemonModel(asset.shiny) : '';
  sprites.frontDefault = defaultSprite;
  sprites.frontHome = defaultSprite;
  sprites.frontArtwork = defaultSprite;
  sprites.frontShiny = shinySprite;
  return sprites;
};

interface OptionsPokemon {
  prev: IPokemonName | undefined;
  current: IPokemonName | undefined;
  next: IPokemonName | undefined;
}

const FormSelect = (props: IFormSelectComponent) => {
  const dispatch = useDispatch();
  const { searchingToolData, searchingToolCurrentData, searchingToolObjectData } = useSearch();
  const { generatePokemonGoForms, getPokemonDetails, getPokemonNavigation, findPokemonById, retrieveMoves } =
    usePokemon();

  const [pokeData, setPokeData] = useState<IPokemonDetailInfo[]>([]);
  const [formList, setFormList] = useState<IPokemonFormModify[][]>([]);

  const [typePoke, setTypePoke] = useState(props.isRaid ? TypeRaid.Boss : TypeRaid.Pokemon);
  const [isRaid, setIsRaid] = useState(props.isRaid);
  const [tier, setTier] = useState(toNumber(props.tier, 1));

  const [data, setData] = useState<IPokemonSpecie>();
  const [dataStorePokemon, setDataStorePokemon] = useState<OptionsPokemon>();

  const [currentForm, setCurrentForm] = useState<IPokemonFormModify>();
  const [profileBundle, setProfileBundle] = useState<{
    id: number;
    canonicalForms: PokemonForm[];
    pokemonGoForms: PokemonGoFormCatalogEntry[];
  }>();
  const isBattleModifierForm = isSpecialFormType(currentForm?.form.pokemonType);

  const { showSnackbar } = useSnackbar();

  const fetchMap = useCallback(
    (specie: IPokemonSpecie, varieties: PokemonBundleVariety[], pokemonGoForms: PokemonGoFormCatalogEntry[] = []) => {
      setFormList([]);
      setPokeData([]);
      setProfileBundle({
        id: specie.id,
        canonicalForms: varieties.flatMap(({ forms }) => forms),
        pokemonGoForms,
      });
      const dataPokeList: IPokemonDetailInfo[] = [];
      const dataFormList: IPokemonFormDetail[][] = [];
      varieties.forEach(({ pokemon: pokeInfo, forms }) => {
        const pokeForm = forms.map((form) => PokemonFormDetail.setDetails(form));
        const pokeDetail = PokemonDetailInfo.setDetails(pokeInfo);
        dataPokeList.push(pokeDetail);
        dataFormList.push(pokeForm);
      });

      const pokemon = findPokemonById(specie.id);
      const isShadow = Boolean(
        pokemon?.hasShadowForm && toNumber(pokemon.purified?.candy) >= 0 && toNumber(pokemon.purified?.stardust) >= 0
      );
      const formListResult: IPokemonFormModify[][] = dataFormList
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

      generatePokemonGoForms(dataFormList, formListResult, specie.id, specie.name);

      if (props.includePokemonGoBattleModifiers) {
        const selectedKeys = new Set(
          formListResult.flatMap((forms) =>
            forms.map((item) =>
              pokemonGoFormIdentityKey({
                num: specie.id,
                form: item.form.formName ?? item.form.name,
                pokemonType: item.form.pokemonType,
              })
            )
          )
        );
        pokemonGoForms
          .filter((pokemon) => isSpecialFormType(pokemon.pokemonType))
          .forEach((pokemon, index) => {
            const key = pokemonGoFormIdentityKey(pokemon);
            if (selectedKeys.has(key)) {
              return;
            }
            selectedKeys.add(key);
            formListResult.push([
              new PokemonFormModifyModel(
                specie.id,
                specie.name,
                pokemon.name?.replaceAll('_', '-').toLowerCase(),
                String(pokemon.form ?? '')
                  .replaceAll('_', '-')
                  .toLowerCase(),
                pokemon.fullName?.replaceAll('_', '-').toLowerCase(),
                'pokemon-go',
                pokemon.types ?? [],
                pokemonGoAssetSprites(pokemon.asset),
                -200_000 - index,
                pokemon.pokemonType ?? PokemonType.Normal,
                false
              ),
            ]);
          });
      }

      const selectableFormList = deduplicatePokemonFormSelections(formListResult)
        .map((forms) =>
          forms.filter((form) => {
            const pokemonType = form.form.pokemonType ?? PokemonType.None;
            if (props.excludedPokemonTypes?.includes(pokemonType)) {
              return false;
            }
            if (!props.pokemonFilter) {
              return true;
            }
            const pokemon = retrieveMoves(specie.id, form.form.formName ?? form.form.name ?? form.name, pokemonType);
            return !!pokemon && props.pokemonFilter(pokemon);
          })
        )
        .filter(isNotEmpty);

      setPokeData(dataPokeList);
      setFormList(selectableFormList);

      const flatForms = selectableFormList.flatMap((value) => value);
      const defaultForm = flatForms.filter((item) => item.form.isDefault);
      let currentForm = defaultForm.find((item) => item.form.id === specie.id);
      if (searchingToolData) {
        const targetFormName = props.isObjective
          ? searchingToolObjectData?.form?.form?.formName
          : searchingToolCurrentData?.form?.form?.formName;
        const defaultFormSearch = flatForms.find((item) => isEqual(item.form.formName, targetFormName));
        currentForm = defaultFormSearch ?? defaultForm.find((item) => item.form.id === specie.id);
      }
      if (!currentForm) {
        currentForm = flatForms.find((item) => item.form.id === specie.id);
      }
      if (!currentForm && isNotEmpty(defaultForm)) {
        currentForm = defaultForm.at(0);
      }
      if (currentForm) {
        setCurrentForm(currentForm);
      }
      if (props.setForm) {
        props.setForm(currentForm);
      }

      setData(specie);
    },
    [
      searchingToolData,
      props.excludedPokemonTypes,
      props.includePokemonGoBattleModifiers,
      props.pokemonFilter,
      retrieveMoves,
    ]
  );

  const queryPokemon = useCallback(
    (id: number, signal: AbortSignal) => {
      APIService.getPokemonBundle(id, { signal })
        .then((res) => {
          if (!signal.aborted && res.data.data) {
            const result = PokemonSpecie.create(res.data.data.species);
            fetchMap(result, res.data.data.varieties, res.data.data.pokemonGo?.forms);
          }
        })
        .catch((error: unknown) => {
          if (!signal.aborted && !APIService.isCancel(error)) {
            showSnackbar(getApiErrorMessage(error, 'Unable to load this Pokémon.'), 'error');
          }
        });
    },
    [fetchMap, showSnackbar]
  );

  useEffect(() => {
    if (props.setName) {
      props.setName(
        currentForm ? splitAndCapitalize(currentForm.form.name, '-', ' ') : getValueOrDefault(String, props.name)
      );
    }
  }, [props.setName, props.name, currentForm]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (id > 0 && toNumber(data?.id) !== id) {
      clearData();
      const controller = new AbortController();
      queryPokemon(id, controller.signal);
      return () => controller.abort();
    }
  }, [props.id, data?.id, queryPokemon]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (
      currentForm &&
      toNumber(data?.id) > 0 &&
      id > 0 &&
      (searchingToolObjectData?.pokemon?.id !== id ||
        !isEqual(searchingToolObjectData?.form?.form?.formName, currentForm.form.formName))
    ) {
      const formName = getValueOrDefault(
        String,
        currentForm.form.name,
        currentForm.form.formName,
        currentForm.defaultName
      );
      const details = getPokemonDetails(
        id,
        formName,
        currentForm.form.pokemonType,
        isCanonicalSpeciesDefaultForm(currentForm, id)
      );
      details.pokemonType = currentForm.form.pokemonType ?? PokemonType.Normal;
      const pokemonDetails = PokemonDetail.setData(details);
      if (props.isObjective) {
        dispatch(SearchingActions.SetToolObjectPokemonDetails.create(pokemonDetails));
        dispatch(SearchingActions.SetToolObjectPokemonForm.create(currentForm));
      } else {
        dispatch(SearchingActions.SetToolPokemonDetails.create(pokemonDetails));
        dispatch(SearchingActions.SetToolPokemonForm.create(currentForm));
      }
    }
  }, [currentForm, props.isObjective, dispatch, getPokemonDetails]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (id > 0) {
      const navigation = getPokemonNavigation(id);
      if (navigation.current) {
        setDataStorePokemon(navigation);
      }
    }
  }, [getPokemonNavigation, props.id]);

  useEffect(() => {
    [dataStorePokemon?.prev?.id, dataStorePokemon?.next?.id].forEach((id) => {
      if (id) {
        void preloadFirstAvailableImage([APIService.getPokeOfficialArtwork(id)]);
      }
    });
  }, [dataStorePokemon?.next?.id, dataStorePokemon?.prev?.id]);

  const clearData = () => {
    setCurrentForm(undefined);
    setFormList([]);
    setPokeData([]);
    if (props.onClearStats) {
      props.onClearStats();
    }
    if (props.setForm) {
      props.setForm(undefined);
    }
  };

  const changeForm = (value: IPokemonFormModify) => {
    if (value.form.id === currentForm?.form.id) {
      return;
    }
    setCurrentForm(value);
    dispatch(
      props.isObjective
        ? SearchingActions.SetToolObjectPokemonForm.create(value)
        : SearchingActions.SetToolPokemonForm.create(value)
    );
    props.onClearStats?.();
    props.setName?.(splitAndCapitalize(value.form.name, '-', ' '));
    props.setForm?.(value);
  };

  const onSetTier = (tier: number) => {
    if (props.setTier) {
      props.setTier(tier);
    }
    setTier(tier);
  };

  const onHandleType = useCallback(
    (v: TypeRaid) => {
      setTypePoke(v);
      setIsRaid(v !== TypeRaid.Pokemon);
      if (props.setRaid) {
        props.setRaid(v !== TypeRaid.Pokemon);
      }
      if (props.onClearStats) {
        props.onClearStats(true);
      }
    },
    [props.setRaid, props.onClearStats]
  );

  useEffect(() => {
    if (!isBattleModifierForm || !isRaid) {
      return;
    }
    setTypePoke(TypeRaid.Pokemon);
    setIsRaid(false);
    props.setRaid?.(false);
    props.onClearStats?.(true);
  }, [isBattleModifierForm, isRaid, props.setRaid, props.onClearStats]);

  const requestedPokemonId = toNumber(props.id);
  const requestedOfficialImage = requestedPokemonId ? APIService.getPokeOfficialArtwork(requestedPokemonId) : undefined;
  const currentPokemonId = dataStorePokemon?.current?.id;
  const isSelectedNavigationCurrent = Boolean(requestedPokemonId > 0 && currentPokemonId === requestedPokemonId);
  const isSelectedImageReady = Boolean(isSelectedNavigationCurrent && currentForm?.defaultId === currentPokemonId);
  const isSelectedProfileReady = Boolean(
    isSelectedImageReady && profileBundle && profileBundle.id === currentPokemonId
  );
  const selectedOfficialImage = currentPokemonId ? APIService.getPokeOfficialArtwork(currentPokemonId) : undefined;
  const selectedProfile = isSelectedProfileReady
    ? buildPokemonDetailProfileImagePresentation({
        canonicalForms:
          profileBundle && profileBundle.id === currentPokemonId ? profileBundle.canonicalForms : undefined,
        pokemonGoForms:
          profileBundle && profileBundle.id === currentPokemonId ? profileBundle.pokemonGoForms : undefined,
        selection: {
          num: currentPokemonId ?? 0,
          form: currentForm?.pokemonGoForm || currentForm?.form.formName || 'NORMAL',
          fullName: currentForm?.form.name,
          pokemonType: currentForm?.form.pokemonType,
        },
      })
    : undefined;
  const selectedPreferredImage = selectedProfile?.preferredImage;
  const cacheableSelectedOfficialImage =
    !isSelectedImageReady || currentForm?.form.id === currentPokemonId ? selectedOfficialImage : undefined;
  const selectedImageCandidates = currentPokemonId ? (selectedProfile?.imageCandidates ?? []) : [];
  const { displayedUrl: selectedImage, isLoading: isSelectedImageLoading } = usePreloadedImage(
    selectedImageCandidates,
    APIService.getPokeSprite(),
    [selectedPreferredImage, cacheableSelectedOfficialImage, selectedProfile?.hybridImage],
    true
  );
  const cachedNavigationImage =
    !isSelectedProfileReady && isImagePreloaded(requestedOfficialImage) ? requestedOfficialImage : undefined;
  const displayedSelectedImage = cachedNavigationImage ?? selectedImage;
  const showSelectedImageSkeleton = cachedNavigationImage
    ? false
    : !isSelectedNavigationCurrent || !isSelectedProfileReady || isSelectedImageLoading;
  const profileModifier =
    isSelectedProfileReady && currentForm?.form.pokemonType === PokemonType.Shadow
      ? 'shadow'
      : isSelectedProfileReady && currentForm?.form.pokemonType === PokemonType.Purified
        ? 'purified'
        : '';

  return (
    <Fragment>
      <PokemonSelectorDetails
        previous={
          dataStorePokemon?.prev && (
            <div className="tw-cursor-pointer" onClick={() => props.onSetPrev?.()}>
              <div>
                <img
                  height={64}
                  alt="Image Pokemon"
                  src={APIService.getPokeOfficialArtwork(dataStorePokemon.prev.id)}
                  onLoad={(event) => markImageAsPreloaded(event.currentTarget.currentSrc || event.currentTarget.src)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = APIService.getPokeFullSprite(dataStorePokemon.prev?.id);
                  }}
                />
              </div>
              <span>
                <b>
                  <span className="text-navigator">{'<'}</span> <span>#{dataStorePokemon.prev.id}</span>
                </b>
              </span>
            </div>
          )
        }
        next={
          dataStorePokemon?.next && (
            <div className="tw-cursor-pointer" onClick={() => props.onSetNext?.()}>
              <div>
                <img
                  height={64}
                  alt="Image Pokemon"
                  src={APIService.getPokeOfficialArtwork(dataStorePokemon.next.id)}
                  onLoad={(event) => markImageAsPreloaded(event.currentTarget.currentSrc || event.currentTarget.src)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = APIService.getPokeFullSprite(dataStorePokemon.next?.id);
                  }}
                />
              </div>
              <span>
                <b>
                  <span>#{dataStorePokemon.next.id}</span> <span className="text-navigator">{'>'}</span>
                </b>
              </span>
            </div>
          )
        }
        profile={
          showSelectedImageSkeleton ? undefined : (
            <img
              className="tw-h-form-preview tw-w-form-preview tw-object-contain tw-p-2"
              alt="Image Pokemon"
              src={displayedSelectedImage}
            />
          )
        }
        profileModifier={profileModifier}
        isProfileLoading={showSelectedImageSkeleton}
        profileSkeletonTestId="selected-pokemon-image-skeleton"
        types={currentForm?.defaultId ? <TypeInfo arr={currentForm.form.types} /> : undefined}
        name={
          currentForm || props.name || dataStorePokemon?.current?.id ? (
            <>
              {dataStorePokemon?.current?.id && <>{`#${dataStorePokemon.current.id} `}</>}
              {currentForm ? splitAndCapitalize(convertSexName(currentForm.form.name), '-', ' ') : props.name}
            </>
          ) : undefined
        }
        forms={{
          isLoaded: toNumber(currentForm?.defaultId) > 0 && isNotEmpty(pokeData) && isNotEmpty(formList),
          forms: formList,
          id: currentForm?.form.id,
          defaultId: currentForm?.defaultId,
          changeForm,
        }}
      />
      {!props.isHide && (
        <div className="tw-flex tw-justify-center tw-text-center">
          <TypeRadioGroup
            row
            aria-labelledby="row-types-group-label"
            name="row-types-group"
            value={typePoke}
            onChange={(e) => onHandleType(toNumber(e.target.value))}
          >
            <FormControlLabel
              value={TypeRaid.Pokemon}
              control={<Radio />}
              label={
                <div className="tw-flex tw-items-center tw-gap-2">
                  <img height={32} alt="Pokémon Image" src={getItemSpritePath(ItemName.PokeBall)} />
                  <span>Pokémon Stats</span>
                </div>
              }
            />
            <FormControlLabel
              value={TypeRaid.Boss}
              disabled={isBattleModifierForm}
              control={<Radio />}
              label={
                <div className="tw-flex tw-items-center tw-gap-2">
                  <img
                    className="img-type-icon"
                    height={32}
                    alt="img-boss"
                    src={APIService.getRaidSprite('ic_raid_small')}
                  />{' '}
                  <span>Boss Stats</span>
                </div>
              }
            />
          </TypeRadioGroup>
        </div>
      )}
      <div className="row">
        <div className="sm:tw-w-1/2" />
        <div className="sm:tw-w-1/2" />
      </div>
      <Tools
        isHide={props.isHide}
        isRaid={isRaid}
        tier={tier}
        setTier={onSetTier}
        id={dataStorePokemon?.current?.id}
        dataPoke={pokeData}
        onSetStats={props.onHandleSetStats}
        onClearStats={props.onClearStats}
        isObjective={props.isObjective}
      />
    </Fragment>
  );
};

export default FormSelect;
