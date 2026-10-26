import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import './FormSelect.scss';
import APIService from '../../services/api.service';
import type { PokemonBundleVariety, PokemonGoFormCatalogEntry } from '../../core/models/API/pokemon-bundle.model';
import Tools from './Tools';

import {
  convertPokemonImageName,
  convertSexName,
  getItemSpritePath,
  getPreferredPokemonFormSprite,
  getPokemonType,
  getValidPokemonImgPath,
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
  IPokemonFormDetail,
  PokemonSprite,
} from '../../core/models/API/form.model';
import { IPokemonDetailInfo, PokemonDetail, PokemonDetailInfo } from '../../core/models/API/info.model';
import { IFormSelectComponent } from '../models/component.model';
import { PokemonType, TypeRaid } from '../../enums/type.enum';
import { SearchingActions } from '../../store/actions';
import { getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber } from '../../utils/extension';
import LoadGroup from '../Sprites/Loading/LoadingGroup';
import { ItemName } from '../../pages/News/enums/item-type.enum';
import useSearch from '../../composables/useSearch';
import usePokemon from '../../composables/usePokemon';
import ButtonGroupForm from '../Commons/Buttons/ButtonGroupForm';
import { useSnackbar } from '../../contexts/snackbar.context';
import { usePreloadedImage } from '../../utils/hooks/usePreloadedImage';
import { deduplicatePokemonFormSelections, pokemonGoFormIdentityKey } from '../../utils/pokemon-form-identity';

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
  const isBattleModifierForm = isSpecialFormType(currentForm?.form.pokemonType);

  const axiosSource = useRef(APIService.getCancelToken());
  const { showSnackbar } = useSnackbar();

  const fetchMap = useCallback(
    (specie: IPokemonSpecie, varieties: PokemonBundleVariety[], pokemonGoForms: PokemonGoFormCatalogEntry[] = []) => {
      setFormList([]);
      setPokeData([]);
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
    (id: number) => {
      APIService.cancel(axiosSource.current);
      axiosSource.current = APIService.reNewCancelToken();
      const cancelToken = axiosSource.current.token;

      APIService.getPokemonBundle(id, { cancelToken })
        .then((res) => {
          if (res.data.data) {
            const result = PokemonSpecie.create(res.data.data.species);
            fetchMap(result, res.data.data.varieties, res.data.data.pokemonGo?.forms);
          }
        })
        .catch((error: unknown) => {
          if (APIService.isCancel(error)) {
            return;
          }
          const status = (error as { response?: { status?: number } }).response?.status;
          showSnackbar(
            status === 404
              ? `Pokémon ID or name: ${id} not found!`
              : `Unable to display Pokémon data for ID: ${id}. Please try again.`,
            'error'
          );
        });
    },
    [fetchMap]
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
      queryPokemon(id);
    }
    return () => {
      APIService.cancel(axiosSource.current);
    };
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
      const details = getPokemonDetails(id, formName, currentForm.form.pokemonType, currentForm.form.isDefault);
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

  const currentPokemonId = dataStorePokemon?.current?.id;
  const isSelectedImageReady = Boolean(currentPokemonId && currentForm?.defaultId === currentPokemonId);
  const selectedHybridImage = APIService.getPokeFullSprite(
    currentPokemonId,
    convertPokemonImageName(currentForm?.form.formName)
  );
  const selectedImageCandidates = isSelectedImageReady
    ? [
        getPreferredPokemonFormSprite(currentForm?.form.sprites),
        APIService.getPokeOfficialArtwork(currentPokemonId),
        selectedHybridImage,
        APIService.getPokeFullAsset(currentPokemonId),
      ]
    : [];
  const { displayedUrl: selectedImage, isLoading: isSelectedImageLoading } = usePreloadedImage(
    selectedImageCandidates,
    APIService.getPokeSprite()
  );
  const showSelectedImageSkeleton = !isSelectedImageReady || isSelectedImageLoading;

  return (
    <Fragment>
      <div className="tw-inline-block tw-w-16 tw-h-16">
        {dataStorePokemon?.prev && (
          <div className="tw-cursor-pointer" onClick={() => props.onSetPrev?.()}>
            <div>
              <img
                height={64}
                alt="Image Pokemon"
                src={APIService.getPokeFullSprite(dataStorePokemon.prev.id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, dataStorePokemon.prev?.id);
                }}
              />
            </div>
            <span>
              <b>
                <span className="text-navigator">{'<'}</span> <span>#{dataStorePokemon.prev.id}</span>
              </b>
            </span>
          </div>
        )}
      </div>
      <span
        aria-busy={showSelectedImageSkeleton}
        className="tw-relative tw-inline-flex tw-h-[216px] tw-w-[216px] tw-shrink-0 tw-align-middle tw-items-center tw-justify-center"
      >
        {showSelectedImageSkeleton && (
          <Skeleton
            variant="rounded"
            animation="wave"
            className="!tw-absolute tw-inset-2 !tw-h-auto !tw-w-auto"
            data-testid="selected-pokemon-image-skeleton"
          />
        )}
        <img
          className={`tw-h-[200px] tw-w-[200px] tw-object-contain tw-p-2 tw-transition-opacity ${
            showSelectedImageSkeleton ? 'tw-opacity-0' : 'tw-opacity-100'
          }`}
          alt="Image Pokemon"
          src={selectedImage}
        />
      </span>
      <div className="tw-inline-block tw-w-16 tw-h-16">
        {dataStorePokemon?.next && (
          <div className="tw-cursor-pointer" onClick={() => props.onSetNext?.()}>
            <div>
              <img
                height={64}
                alt="Image Pokemon"
                src={APIService.getPokeFullSprite(dataStorePokemon.next.id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, dataStorePokemon.next?.id);
                }}
              />
            </div>
            <span>
              <b>
                <span>#{dataStorePokemon.next.id}</span> <span className="text-navigator">{'>'}</span>
              </b>
            </span>
          </div>
        )}
      </div>
      <div className="tw-mt-2 tw-h-16">{currentForm?.defaultId && <TypeInfo arr={currentForm.form.types} />}</div>
      <h4>
        <b>
          {dataStorePokemon?.current?.id && <>{`#${dataStorePokemon.current.id} `}</>}
          {currentForm ? splitAndCapitalize(convertSexName(currentForm.form.name), '-', ' ') : props.name}
        </b>
      </h4>
      <ButtonGroupForm
        className="tw-mx-auto tw-my-1"
        width={350}
        height={180}
        isLoaded={toNumber(currentForm?.defaultId) > 0 && isNotEmpty(pokeData) && isNotEmpty(formList)}
        forms={formList}
        id={currentForm?.form.id}
        defaultId={currentForm?.defaultId}
        changeForm={changeForm}
        loading={<LoadGroup isShow isVertical isHideAttr size={40} />}
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
