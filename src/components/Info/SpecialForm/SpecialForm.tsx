import React, { Fragment, useEffect, useMemo, useState } from 'react';
import APIService from '../../../services/api.service';
import { getKeyWithData, replaceTempMovePvpName, splitAndCapitalize } from '../../../utils/utils';
import './SpecialForm.scss';
import { Form, IForm } from '../../../core/models/API/form.model';
import { IFormSpecialComponent } from '../../models/component.model';
import { isEqual, isNotEmpty, isUndefined } from '../../../utils/extension';
import { TempEvo } from '../../../core/models/evolution.model';
import { PokemonType } from '../../../enums/type.enum';
import { LinkToTop } from '../../Link/LinkToTop';
import IconType from '../../Sprites/Icon/Type/Type';
import useCombats from '../../../composables/useCombats';
import usePokemon from '../../../composables/usePokemon';
import useAssets from '../../../composables/useAssets';
import { sortAnimationSources } from '../../../utils/pokemon-animation-assets';
import { useImageSourceSequence } from '../../../utils/hooks/useImageSourceSequence';

interface SpecialFormPokemonImageProps {
  id: number;
  form: IForm;
}

const SpecialFormPokemonImage = ({ id, form }: SpecialFormPokemonImageProps) => {
  const { findAnimationForm, findExactAssetForm } = useAssets();
  const formName = form.formName ?? form.name;
  const pokemonType = form.pokemonType ?? PokemonType.Mega;
  const animation = findAnimationForm(id, formName, pokemonType);
  const staticAsset = findExactAssetForm(id, formName);
  const imageSources = useMemo(() => {
    const sources = sortAnimationSources(animation?.sources ?? []).map((source) => source.url);
    if (staticAsset) {
      sources.push(APIService.getPokemonSqModel(staticAsset));
    }
    return [...new Set(sources)];
  }, [animation, staticAsset]);
  const { source: activeSource, advanceSource } = useImageSourceSequence([...imageSources, APIService.getPokeSprite()]);
  return (
    <img
      key={`${id}-${formName}-${activeSource}`}
      className="tw-h-24 tw-w-24 tw-flex-none tw-object-contain"
      data-testid="mega-evolution-pokemon-image"
      height="96"
      width="96"
      alt={splitAndCapitalize(form.name, '-', ' ')}
      src={activeSource}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={advanceSource}
    />
  );
};

const SpecialForm = (props: IFormSpecialComponent) => {
  const { getFindPokemon } = usePokemon();
  const { findMoveByName } = useCombats();

  const [pokemonType, setPokemonType] = useState(PokemonType.None);
  const [arrEvoList, setArrEvoList] = useState<IForm[]>();

  useEffect(() => {
    if (props.formList.some((item) => item.some((pokemon) => pokemon.form.pokemonType === PokemonType.Mega))) {
      setPokemonType(PokemonType.Mega);
    } else if (props.formList.some((item) => item.some((pokemon) => pokemon.form.pokemonType === PokemonType.Primal))) {
      setPokemonType(PokemonType.Primal);
    } else {
      setPokemonType(PokemonType.None);
    }
  }, [props.formList]);

  useEffect(() => {
    if (isNotEmpty(props.formList) && pokemonType !== PokemonType.None) {
      const result = props.formList
        .filter((item) => item[0]?.form.pokemonType === pokemonType)
        .map((item) => {
          const form = item.at(0);
          if (!form) {
            return new Form();
          }
          return form.form;
        })
        .filter((item) => !isUndefined(item.id));
      setArrEvoList(result);
    } else {
      setArrEvoList([]);
    }
  }, [pokemonType, props.formList]);

  const getQuestEvo = (name: string) => {
    name = splitAndCapitalize(name, '-', '_').toUpperCase();
    const pokemonEvo = getFindPokemon((item) =>
      item.tempEvo?.some((value) => isEqual(value.tempEvolutionName, name))
    )?.tempEvo?.find((item) => isEqual(item.tempEvolutionName, name));
    return TempEvo.create({
      ...pokemonEvo,
      firstTempEvolution:
        pokemonEvo?.firstTempEvolution !== undefined ? `x${pokemonEvo.firstTempEvolution}` : 'Not in snapshot',
      tempEvolution: pokemonEvo?.tempEvolution !== undefined ? `x${pokemonEvo.tempEvolution}` : 'Not in snapshot',
    });
  };

  const renderMoveLink = (name: string, fallbackType?: string) => {
    const normalizedName = name.trim().replaceAll(' ', '_').toUpperCase();
    const move = findMoveByName(normalizedName) ?? findMoveByName(replaceTempMovePvpName(normalizedName));
    const content = (
      <>
        <IconType
          width={25}
          height={25}
          alt={`${move?.type ?? fallbackType ?? 'Move'} type`}
          type={move?.type ?? fallbackType}
        />
        <b>{splitAndCapitalize(name, '_', ' ')}</b>
      </>
    );
    return move ? (
      <LinkToTop to={`/move/${move.id}`} className="tw-inline-flex tw-items-center tw-gap-1">
        {content}
      </LinkToTop>
    ) : (
      <span className="tw-inline-flex tw-items-center tw-gap-1">{content}</span>
    );
  };

  const renderEnergyIcon = () => (
    <img
      alt={`${getKeyWithData(PokemonType, pokemonType)} energy`}
      width={25}
      height={25}
      src={
        pokemonType === PokemonType.Mega
          ? APIService.getIconSprite('ic_mega')
          : APIService.getIconMegaPrimalSprite(
              props.id === 382 ? 'pokemon_details_primal_alpha_energy' : 'pokemon_details_primal_omega_energy'
            )
      }
    />
  );

  return (
    <Fragment>
      {isNotEmpty(arrEvoList) && (
        <div className={props.className} style={props.style} data-testid="mega-evolution-section">
          <h4 className="title-evo">
            <b>{pokemonType === PokemonType.Primal ? 'Primal Reversion' : 'Mega Evolution'}</b>
          </h4>
          <div className="form-special-container scroll-evolution" data-testid="mega-evolution-scroll">
            <ul className="ul-evo tw-flex tw-w-max tw-min-w-full tw-items-start tw-justify-center tw-gap-3 tw-pb-2">
              {arrEvoList?.map((value, evo) => {
                const quest = getQuestEvo(value.name);
                return (
                  <li
                    key={evo}
                    data-testid="mega-evolution-card"
                    data-mega-level-count={quest.megaLevels?.length ?? 0}
                    className="li-evo !tw-mr-0 tw-flex tw-w-[calc(100vw-3rem)] tw-max-w-[22rem] tw-flex-none tw-flex-col tw-gap-3 tw-rounded tw-border tw-border-solid tw-border-gray-500 tw-bg-table-primary tw-p-3 tw-text-start"
                  >
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <SpecialFormPokemonImage id={props.id ?? 0} form={value} />
                      <div className="tw-min-w-0">
                        <b className="tw-block tw-text-sm">#{props.id}</b>
                        <b className="link-title tw-block tw-text-lg tw-leading-tight">
                          {splitAndCapitalize(value.name, '-', ' ')}
                        </b>
                        {quest.energyVariant && (
                          <span className="caption tw-mt-1 tw-block">Mega Energy {quest.energyVariant}</span>
                        )}
                      </div>
                    </div>

                    <div className="tw-grid tw-grid-cols-2 tw-gap-2">
                      <div className="tw-rounded tw-bg-custom-default tw-p-2">
                        <span className="caption tw-block">Initial energy</span>
                        <span className="tw-flex tw-items-center tw-gap-1">
                          {renderEnergyIcon()}
                          <b>{quest.firstTempEvolution}</b>
                        </span>
                      </div>
                      <div className="tw-rounded tw-bg-custom-default tw-p-2">
                        <span className="caption tw-block">Repeat energy</span>
                        <span className="tw-flex tw-items-center tw-gap-1">
                          {renderEnergyIcon()}
                          <b>{quest.tempEvolution}</b>
                        </span>
                      </div>
                    </div>

                    {quest.superMax && (
                      <section className="tw-rounded tw-border tw-border-solid tw-border-gray-500 tw-p-2">
                        <div>
                          <b className="tw-block">Super Max</b>
                          <span className="caption tw-block">Requires Max Level</span>
                        </div>
                        <div className="tw-mt-2 tw-grid tw-grid-cols-1 tw-gap-2 sm:tw-grid-cols-2">
                          {quest.superMax.unlockEnergy !== undefined && (
                            <div className="tw-rounded tw-bg-custom-default tw-p-2">
                              <span className="caption tw-block">Unlock energy</span>
                              <b className="tw-block">x{quest.superMax.unlockEnergy}</b>
                            </div>
                          )}
                          {quest.superMax.restHours !== undefined && (
                            <div className="tw-rounded tw-bg-custom-default tw-p-2">
                              <span className="caption tw-block">Rest time</span>
                              <b className="tw-block">{quest.superMax.restHours}h</b>
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {quest.additionalMove && (
                      <div className="tw-flex tw-items-center tw-justify-between tw-gap-2">
                        <span className="caption">Mega attack</span>
                        {renderMoveLink(quest.additionalMove.name ?? '', quest.additionalMove.type)}
                      </div>
                    )}
                    {quest.requireMove && (
                      <div className="tw-flex tw-items-center tw-justify-between tw-gap-2">
                        <span className="caption">Required move</span>
                        {renderMoveLink(quest.requireMove)}
                      </div>
                    )}

                    {Boolean(quest.megaLevels?.length) && (
                      <details
                        data-testid="mega-level-benefits"
                        className="tw-rounded tw-border tw-border-solid tw-border-gray-500 tw-p-2"
                      >
                        <summary className="tw-cursor-pointer tw-font-bold">
                          Mega Level Benefits ({quest.megaLevels?.length})
                        </summary>
                        <div className="tw-mt-2 tw-flex tw-flex-col tw-gap-2">
                          {quest.megaLevels?.map((megaLevel) => (
                            <div
                              className="tw-rounded tw-bg-custom-default tw-p-2"
                              key={megaLevel.level}
                              data-testid="mega-level-row"
                            >
                              <div className="tw-flex tw-items-center tw-justify-between tw-gap-2">
                                <b>{['', 'Base', 'High', 'Max'][megaLevel.level] ?? `Level ${megaLevel.level}`}</b>
                                <span className="caption">{megaLevel.cooldownHours / 24}d cooldown</span>
                              </div>
                              <div className="caption tw-mt-1">
                                {`Bypass ${megaLevel.bypassEnergy} energy · Candy +${megaLevel.sameTypeExtraCatchCandy}`}
                                {megaLevel.sameTypeExtraCatchXp !== undefined
                                  ? ` · XP +${megaLevel.sameTypeExtraCatchXp}`
                                  : ''}
                                {megaLevel.sameTypeExtraCatchCandyXlChance !== undefined
                                  ? ` · XL +${megaLevel.sameTypeExtraCatchCandyXlChance * 100}%`
                                  : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default SpecialForm;
