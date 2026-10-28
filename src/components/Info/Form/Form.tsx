import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import Gender, { GenderSkeleton, getGenderSpriteCandidates } from '../Gender';
import Stats from '../Stats/Stats';
import Raid from '../../Raid/Raid';
import Counter from '../../Commons/Tables/Counter/Counter';
import TableMove from '../../Commons/Tables/Move/MoveTable';
import Info from '../Info';
import Evolution from '../Evolution/Evolution';
import FromChange from '../FormChange/FormChange';
import { IFormInfoComponent } from '../../models/component.model';
import { PokemonType, TypeSex } from '../../../enums/type.enum';
import { combineClasses, getValueOrDefault, isEqual, isInclude, isNotEmpty } from '../../../utils/extension';
import { EqualMode, IncludeMode } from '../../../utils/enums/string.enum';
import SpecialForm from '../SpecialForm/SpecialForm';
import { SearchingActions } from '../../../store/actions';
import { PokemonDetail } from '../../../core/models/API/info.model';
import { formNormal } from '../../../utils/helpers/options-context.helpers';
import useRouter from '../../../composables/useRouter';
import useStats from '../../../composables/useStats';
import { Action } from 'history';
import { useSearch } from '../../../composables/useSearch';
import ButtonGroupForm from '../../Commons/Buttons/ButtonGroupForm';
import { IPokemonFormModify, IPokemonSprite } from '../../../core/models/API/form.model';
import { Skeleton } from '@mui/material';
import Fusion from '../FormChange/Fusion';
import { PokemonMoves } from '../../../core/models/API/pokemon-bundle.model';
import { IPokemonQueryRankMove } from '../../../utils/models/pokemon-top-move.model';
import { IPokemonGenderRatio } from '../../../core/models/pokemon.model';
import { preloadFirstAvailableImage } from '../../../utils/hooks/usePreloadedImage';

const unavailablePokemonMoves: PokemonMoves = {
  fastMoves: [],
  chargedMoves: [],
  eliteFastMoves: [],
  eliteChargedMoves: [],
  purifiedMoves: [],
  shadowMoves: [],
  specialMoves: [],
  exclusiveMoves: [],
  dynamaxMoves: [],
};
const unavailableBestMoves: IPokemonQueryRankMove = { data: [] };

const hasSpriteImage = (sprite: IPokemonSprite | undefined) =>
  Object.values(sprite ?? {}).some((value) => typeof value === 'string' && Boolean(value.trim()));

const normalizePokemonType = (pokemonType: PokemonType | undefined) =>
  pokemonType === undefined || pokemonType === PokemonType.None ? PokemonType.Normal : pokemonType;

interface GenderDisplaySnapshot {
  pokemonId: number;
  formId?: number;
  ratio?: IPokemonGenderRatio;
  primarySprite?: IPokemonSprite;
  fallbackSprite?: IPokemonSprite;
  pokemonType?: PokemonType;
}

const FormComponent = (props: IFormInfoComponent) => {
  const dispatch = useDispatch();
  const { routerAction } = useRouter();
  const { statsData } = useStats();
  const { searchingMainDetails, searchingMainForm } = useSearch();

  const selectedPokemonType = searchingMainForm?.form?.pokemonType;
  const displaySpriteSources = useMemo(() => {
    const selectedSprites = searchingMainForm?.form?.sprites;
    if (!isSpecialFormType(selectedPokemonType)) {
      return { primary: selectedSprites };
    }

    const selectedBaseForm = getPokemonFormWithNoneSpecialForm(searchingMainForm?.form?.formName, selectedPokemonType);
    const baseForms = props.formList
      .flatMap((forms) => forms)
      .filter((item) => !isSpecialFormType(item.form.pokemonType) && hasSpriteImage(item.form.sprites));
    const matchingBaseForm = baseForms.find((item) =>
      isEqual(
        getPokemonFormWithNoneSpecialForm(item.form.formName, item.form.pokemonType),
        selectedBaseForm,
        EqualMode.IgnoreCaseSensitive
      )
    );
    const pokeApiBaseForms = baseForms.filter((item) => (item.form.id ?? 0) > 0);
    const matchingVariety = pokeApiBaseForms.find((item) => isEqual(item.name, searchingMainForm?.name));
    const defaultForm = pokeApiBaseForms.find((item) => item.defaultId === props.defaultId && item.form.isDefault);
    const pokeApiSprites = matchingBaseForm?.form.sprites ?? matchingVariety?.form.sprites ?? defaultForm?.form.sprites;

    return {
      primary: pokeApiSprites ?? selectedSprites,
      fallback: pokeApiSprites ? selectedSprites : undefined,
    };
  }, [props.defaultId, props.formList, searchingMainForm, selectedPokemonType]);

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isCurrentPokemonLoaded = Boolean(
    props.isLoadedForms &&
      props.defaultId &&
      (!params.id || Number(params.id) === props.defaultId) &&
      searchingMainForm?.defaultId === props.defaultId &&
      props.formList.some((forms) => forms.some((form) => form.defaultId === props.defaultId))
  );

  const [statsPokemon, setStatsPokemon] = useState<StatsRankingPokemonGO>();
  const currentGenderRatio =
    searchingMainForm?.defaultId === props.defaultId ? searchingMainDetails?.genderRatio : undefined;
  const lastLoadedGender = useRef<GenderDisplaySnapshot>();

  useEffect(() => {
    if (isCurrentPokemonLoaded && props.defaultId) {
      lastLoadedGender.current = {
        pokemonId: props.defaultId,
        formId: searchingMainForm?.form?.id,
        ratio: currentGenderRatio,
        primarySprite: displaySpriteSources.primary,
        fallbackSprite: displaySpriteSources.fallback,
        pokemonType: selectedPokemonType,
      };
    }
  }, [
    currentGenderRatio,
    displaySpriteSources.fallback,
    displaySpriteSources.primary,
    isCurrentPokemonLoaded,
    props.defaultId,
    searchingMainForm?.form?.id,
    selectedPokemonType,
  ]);

  const [searchGenderDisplay, setSearchGenderDisplay] = useState<GenderDisplaySnapshot>();

  useEffect(() => {
    if (params.id || !isCurrentPokemonLoaded || !props.defaultId) {
      return;
    }

    const nextGenderDisplay: GenderDisplaySnapshot = {
      pokemonId: props.defaultId,
      formId: searchingMainForm?.form?.id,
      ratio: currentGenderRatio,
      primarySprite: displaySpriteSources.primary,
      fallbackSprite: displaySpriteSources.fallback,
      pokemonType: selectedPokemonType,
    };
    const sexes: TypeSex[] = currentGenderRatio
      ? [...(currentGenderRatio.M !== 0 ? [TypeSex.Male] : []), ...(currentGenderRatio.F !== 0 ? [TypeSex.Female] : [])]
      : [];
    if (!sexes.length) {
      sexes.push(TypeSex.Genderless);
    }
    const candidateGroups = sexes.flatMap((sex) => {
      const candidates = getGenderSpriteCandidates(
        nextGenderDisplay.primarySprite,
        nextGenderDisplay.fallbackSprite,
        sex
      );
      return [candidates.default, candidates.shiny];
    });
    let active = true;
    Promise.all(candidateGroups.map(preloadFirstAvailableImage)).then(() => {
      if (active) {
        setSearchGenderDisplay(nextGenderDisplay);
      }
    });
    return () => {
      active = false;
    };
  }, [
    currentGenderRatio,
    displaySpriteSources.fallback,
    displaySpriteSources.primary,
    isCurrentPokemonLoaded,
    params.id,
    props.defaultId,
    searchingMainForm?.form?.id,
    selectedPokemonType,
  ]);

  const lastGender = lastLoadedGender.current;
  const retainedGender =
    lastGender && lastGender.pokemonId === props.defaultId && (!params.id || Number(params.id) === lastGender.pokemonId)
      ? lastGender
      : undefined;
  const directGenderDisplay: GenderDisplaySnapshot | undefined = isCurrentPokemonLoaded
    ? {
        pokemonId: props.defaultId ?? 0,
        formId: searchingMainForm?.form?.id,
        ratio: currentGenderRatio,
        primarySprite: displaySpriteSources.primary,
        fallbackSprite: displaySpriteSources.fallback,
        pokemonType: selectedPokemonType,
      }
    : retainedGender;
  const genderDisplay = params.id
    ? directGenderDisplay
    : searchGenderDisplay?.pokemonId === props.defaultId
      ? searchGenderDisplay
      : undefined;
  const genderRatio = genderDisplay?.ratio;
  const genderSkeletonCount = genderRatio ? (genderRatio.M !== 0 && genderRatio.F !== 0 ? 2 : 1) : 1;
  const genderTrackClass = 'tw-flex tw-flex-nowrap tw-gap-x-12.5 tw-overflow-x-auto';
  const genderDisplayClass = combineClasses(
    genderTrackClass,
    'tw-transition-opacity tw-duration-200',
    isCurrentPokemonLoaded ? 'tw-opacity-100' : 'tw-opacity-60'
  );
  const [moveTabValue, setMoveTabValue] = useState(0);
  const selectedMoveForm = getPokemonFormWithNoneSpecialForm(
    searchingMainForm?.form?.formName,
    searchingMainForm?.form?.pokemonType
  );
  const moveRanking = props.moveRankings.find(
    (item) =>
      normalizePokemonType(item.pokemonType) === normalizePokemonType(searchingMainDetails?.pokemonType) &&
      ((item.fullName &&
        (isEqual(item.fullName, searchingMainDetails?.fullName) ||
          isEqual(item.fullName, searchingMainForm?.form?.name))) ||
        isEqual(item.form, searchingMainDetails?.form) ||
        isEqual(item.form, selectedMoveForm))
  );

  const filterFormList = useCallback(
    (stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[]) =>
      getFormFromForms(stats, props.defaultId, searchingMainForm?.form?.formName, searchingMainForm?.form?.pokemonType),
    [props.defaultId, searchingMainForm?.form?.formName, searchingMainForm?.form?.pokemonType]
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
    currentData ??= props.pokeData.find((p) => p.isDefault);
    if (currentForm && currentData) {
      const pokemonDetails = PokemonDetail.setDetails(currentData);
      pokemonDetails.pokemonType = currentForm.form.pokemonType;
      dispatch(
        SearchingActions.SetMainPokemonSelection.create({
          form: currentForm,
          pokemon: pokemonDetails,
        })
      );
    }
  };

  useEffect(() => {
    if (routerAction === Action.Pop) {
      const formType = searchParams.get(Params.FormType);
      const pokemonType = getDataWithKey<PokemonType>(PokemonType, formType, EqualMode.IgnoreCaseSensitive);
      const form = getValueOrDefault(
        String,
        searchParams.get(Params.Form)?.toUpperCase().replaceAll('_', '-'),
        formNormal()
      );

      if (pokemonType !== undefined && isSpecialFormType(pokemonType)) {
        const requestedForm = getPokemonFormWithNoneSpecialForm(form, pokemonType);
        const currentForm = props.formList
          .flatMap((item) => item)
          .find(
            (item) =>
              item.form.pokemonType === pokemonType &&
              isEqual(
                getPokemonFormWithNoneSpecialForm(item.form.formName, item.form.pokemonType),
                requestedForm,
                EqualMode.IgnoreCaseSensitive
              )
          );
        if (currentForm) {
          findFormData(currentForm.form.name);
        }
        return;
      }

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
    const pokemonType = value.form.pokemonType ?? PokemonType.None;
    if (isSelected) {
      return;
    }
    if (params.id) {
      const pokemonForm = getPokemonFormWithNoneSpecialForm(form, pokemonType)?.toLowerCase().replaceAll('_', '-');
      if (pokemonForm && !isEqual(pokemonForm, formNormal(), EqualMode.IgnoreCaseSensitive)) {
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
      isLoadedForms={isCurrentPokemonLoaded}
      evolutionChain={props.evolutionChain}
      pokemonGoEvolutionChains={props.pokemonGoEvolutionChains}
    />
  );

  return (
    <Fragment>
      <div className="form-container tw-h-[185px]" data-testid="form-varieties-content">
        <h4 className="info-title">
          <b>Form varieties</b>
        </h4>
        <ButtonGroupForm
          className="tw-my-3 tw-min-h-selection-button"
          isFullWidth
          isLoaded={isCurrentPokemonLoaded}
          forms={props.formList}
          id={searchingMainForm?.form?.id}
          defaultId={props.defaultId}
          changeForm={changeForm}
          loading={
            <div className="slide-container !tw-p-0">
              <div className="slide-col !tw-flex !tw-flex-nowrap !tw-m-0 !tw-p-0 tw-gap-x-2">
                {[...Array(Math.ceil(window.innerWidth / 150) + 1).keys()].map((index) => (
                  <Skeleton
                    key={index}
                    data-skeleton-surface="page"
                    variant="rectangular"
                    animation="wave"
                    height={142}
                    width={90}
                  />
                ))}
              </div>
            </div>
          }
        />
      </div>
      <div
        className="tw-h-[190px]"
        data-testid="gender-ratio-content"
        data-gender-form-id={genderDisplay?.formId ?? ''}
        aria-busy={!isCurrentPokemonLoaded}
      >
        {!genderDisplay ? (
          <div className={genderTrackClass} aria-label="Loading gender ratio">
            {Array.from({ length: genderSkeletonCount }, (_, index) => (
              <GenderSkeleton key={index} />
            ))}
          </div>
        ) : genderRatio && (genderRatio.M !== 0 || genderRatio.F !== 0) ? (
          <div
            className={genderDisplayClass}
            aria-label={!isCurrentPokemonLoaded ? 'Updating gender ratio' : undefined}
          >
            {genderRatio.M !== 0 && (
              <Gender
                ratio={genderRatio}
                sex={TypeSex.Male}
                sprite={genderDisplay.primarySprite}
                fallbackSprite={genderDisplay.fallbackSprite}
                pokemonType={genderDisplay.pokemonType}
              />
            )}
            {genderRatio.F !== 0 && (
              <Gender
                ratio={genderRatio}
                sex={TypeSex.Female}
                sprite={genderDisplay.primarySprite}
                fallbackSprite={genderDisplay.fallbackSprite}
                pokemonType={genderDisplay.pokemonType}
              />
            )}
          </div>
        ) : (
          <div
            className={genderDisplayClass}
            aria-label={!isCurrentPokemonLoaded ? 'Updating gender ratio' : undefined}
          >
            <Gender
              sex={TypeSex.Genderless}
              sprite={genderDisplay.primarySprite}
              fallbackSprite={genderDisplay.fallbackSprite}
              pokemonType={genderDisplay.pokemonType}
            />
          </div>
        )}
      </div>
      <Stats
        pokemonType={searchingMainForm?.form?.pokemonType}
        statATK={statsPokemon?.atk}
        statDEF={statsPokemon?.def}
        statSTA={statsPokemon?.sta}
        statProd={statsPokemon?.prod}
        id={props.defaultId}
        form={searchingMainDetails?.form}
        isDisabled={!statsData}
        isLoading={!isCurrentPokemonLoaded}
      />
      <hr className="tw-w-full" />
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-12 tw-w-full">
        <div className="md:tw-col-span-5 tw-min-w-0 tw-overflow-auto">
          <Info isLoading={!isCurrentPokemonLoaded} />
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
                isLoadedForms={isCurrentPokemonLoaded}
              />
            </Fragment>
          )}
        </div>
        <div className="md:tw-col-span-7 tw-min-w-0">
          <TableMove
            moveData={moveRanking?.moves ?? (isCurrentPokemonLoaded ? unavailablePokemonMoves : undefined)}
            rankMoveData={moveRanking?.bestMoves ?? (isCurrentPokemonLoaded ? unavailableBestMoves : undefined)}
            pokemonType={searchingMainDetails?.pokemonType}
            isLoading={!isCurrentPokemonLoaded}
            tabValue={moveTabValue}
            onTabChange={setMoveTabValue}
          />
          <Counter
            pokemonData={searchingMainDetails}
            pokemonType={selectedPokemonType}
            isLoading={!isCurrentPokemonLoaded}
          />
        </div>
      </div>
      <hr className="tw-w-full" />
      {searchingMainDetails?.pokemonType !== PokemonType.GMax &&
      !isSpecialFormType(searchingMainDetails?.pokemonType) ? (
        <div className="tw-w-full">
          <div className="tw-w-full tw-relative" data-testid="evolution-section">
            {renderEvolution()}
          </div>
          {isCurrentPokemonLoaded && (
            <SpecialForm
              className="tw-mt-8 tw-w-full tw-relative !tw-p-0"
              formList={props.formList}
              id={props.defaultId}
            />
          )}
        </div>
      ) : (
        renderEvolution()
      )}
      {isNotEmpty(searchingMainDetails?.formChange) && (
        <FromChange currentId={props.defaultId} pokemonData={searchingMainDetails} />
      )}
      {isCurrentPokemonLoaded && props.defaultId && Boolean(props.pokemonGoFusionOptions?.length) && (
        <Fusion
          options={props.pokemonGoFusionOptions ?? []}
          componentId={props.defaultId}
          componentName={searchingMainDetails?.pokemonId ?? ''}
        />
      )}
    </Fragment>
  );
};

export default FormComponent;
