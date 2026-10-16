import React, { useId } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Xarrow, { Xwrapper } from 'react-xarrows';
import APIService from '../../../services/api.service';
import { convertModelSpritName, splitAndCapitalize } from '../../../utils/utils';
import { IFromChangeComponent } from '../../models/component.model';
import useCombats from '../../../composables/useCombats';
import Candy from '../../Sprites/Candy/Candy';
import IconType from '../../Sprites/Icon/Type/Type';
import { LinkToTop } from '../../Link/LinkToTop';
import { Params } from '../../../utils/constants';
import EvolutionPokemonDisplay from '../Evolution/EvolutionPokemonDisplay';

const resourceNames: Record<string, string> = {
  FUSION_RESOURCE_BLACK_KYUREM: 'Volt Fusion Energy',
  FUSION_RESOURCE_WHITE_KYUREM: 'Blaze Fusion Energy',
  FUSION_RESOURCE_DUSKMANE_NECROZMA: 'Solar Fusion Energy',
  FUSION_RESOURCE_DAWNWINGS_NECROZMA: 'Lunar Fusion Energy',
  ITEM_RESOURCE_CROWNED_ZACIAN: 'Crowned Sword Energy',
  ITEM_RESOURCE_CROWNED_ZAMAZENTA: 'Crowned Shield Energy',
  ITEM_BEANS: 'Zygarde Cells',
};
const humanize = (value: string) => splitAndCapitalize(value, '_', ' ');

const FromChange = (props: IFromChangeComponent) => {
  const { findMoveByName } = useCombats();
  const isMobileLayout = useMediaQuery('(max-width:639px)');
  const arrowId = useId().replaceAll(':', '');
  const pokemon = props.pokemonData;
  if (!pokemon?.id || props.currentId !== pokemon.id || !pokemon.formChange?.length) {
    return null;
  }
  const pokemonId = pokemon.id;

  const displayName = (fullName: string) => {
    if (pokemon.id === 718) {
      if (fullName.endsWith('TEN_PERCENT')) {
        return 'Zygarde 10% Forme';
      }
      if (fullName.endsWith('FIFTY_PERCENT')) {
        return 'Zygarde 50% Forme';
      }
      if (fullName.endsWith('COMPLETE')) {
        return 'Zygarde Complete Forme';
      }
    }
    return humanize(fullName.replace(/_NORMAL$/, ''));
  };
  const renderPokemon = (fullName: string, selectedForm?: string) => {
    const form =
      selectedForm?.replaceAll('-', '_').toUpperCase() ||
      (fullName.toUpperCase() === pokemon.pokemonId?.toUpperCase()
        ? pokemon.form?.replaceAll('-', '_').toUpperCase() || 'NORMAL'
        : fullName.toUpperCase().replace(`${pokemon.pokemonId?.toUpperCase()}_`, ''));
    const normalizedFullName = fullName.replaceAll('-', '_').toUpperCase();
    const sprite = convertModelSpritName(
      form !== 'NORMAL' && !normalizedFullName.endsWith(`_${form}`)
        ? `${pokemon.pokemonId}_${form}`
        : normalizedFullName
    );
    const to = `/pokemon/${pokemonId}${
      form === 'NORMAL' ? '' : `?${Params.Form}=${form.toLowerCase().replaceAll('_', '-')}`
    }`;
    return (
      <LinkToTop to={to}>
        <span className="tw-flex tw-flex-col tw-items-center tw-justify-center">
          <EvolutionPokemonDisplay
            id={pokemonId}
            name={displayName(fullName)}
            sprite={sprite}
            pokemonType={pokemon.pokemonType}
          />
        </span>
      </LinkToTop>
    );
  };
  const renderMove = (name: string) => {
    const move = findMoveByName(name);
    return move ? (
      <span className="tw-inline-flex tw-items-center tw-gap-1">
        <IconType width={25} height={25} alt={`${move.type} type`} type={move.type} className="tw-shrink-0" />
        <LinkToTop to={`/move/${move.id}`}>
          <b>{humanize(name)}</b>
        </LinkToTop>
      </span>
    ) : (
      humanize(name)
    );
  };

  return (
    <section data-testid="form-change-section" data-form-change-path="grid">
      <h4 className="title-evo">
        <b>Form Change</b>
      </h4>
      {pokemon.id === 676 && <p className="caption">Trims vary by region and event.</p>}
      {pokemon.id === 718 && <p className="caption">Cell costs depend on unlocked forms.</p>}
      <Xwrapper>
        <div className="tw-mt-2 tw-flex tw-w-full tw-min-w-0 tw-flex-col tw-gap-8 sm:tw-flex-row sm:tw-gap-4">
          <div className="tw-flex tw-w-full tw-min-w-0 tw-flex-col tw-items-center tw-justify-start sm:tw-w-1/2">
            <div id={`${arrowId}-origin`} className="tw-min-w-0 tw-text-center" data-testid="form-change-origin">
              {renderPokemon(pokemon.fullName ?? `${pokemon.pokemonId}_${pokemon.form}`, pokemon.form ?? 'NORMAL')}
            </div>
          </div>
          <div className="tw-flex tw-w-full tw-min-w-0 tw-flex-col tw-items-center tw-justify-start tw-gap-8 sm:tw-w-1/2 sm:tw-gap-3">
            {pokemon.formChange.map((change, index) => {
              const partner = change.componentPokemonSettings;
              const fusion = partner?.formChangeType === 'FUSE';
              const separate = partner?.formChangeType === 'UNFUSE';
              const hasCost =
                Number(change.candyCost) > 0 ||
                Number(change.stardustCost) > 0 ||
                Number(change.itemCostCount) > 0 ||
                Boolean(change.item);
              const hasAdditionalDetails =
                separate ||
                !hasCost ||
                Boolean(change.requiredBreadMoves?.length) ||
                ([888, 889].includes(pokemon.id ?? 0) && hasCost) ||
                Boolean(change.requiredCinematicMoves?.length) ||
                Boolean(change.moveReassignment?.cinematicMoves?.length) ||
                fusion;
              return change.availableForm.map((target) => (
                <div
                  key={`${index}-${target}`}
                  className="tw-flex tw-w-full tw-min-w-0 tw-flex-col tw-items-center tw-justify-center"
                >
                  <div
                    id={`${arrowId}-${index}-${target}`}
                    className="tw-min-w-0 tw-text-center"
                    data-testid="form-change-target"
                  >
                    {renderPokemon(target)}
                  </div>
                  <Xarrow
                    strokeWidth={2}
                    path="grid"
                    startAnchor={isMobileLayout ? 'bottom' : 'right'}
                    endAnchor={isMobileLayout ? 'top' : 'left'}
                    start={`${arrowId}-origin`}
                    end={`${arrowId}-${index}-${target}`}
                  />
                  <div
                    className="tw-mt-4 tw-flex tw-w-full tw-max-w-md tw-flex-col tw-gap-3 tw-rounded tw-border tw-border-solid tw-border-gray-500 tw-bg-table-primary tw-p-3 tw-text-start"
                    data-testid="form-change-detail"
                  >
                    {(fusion || separate || partner) && (
                      <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-x-3 tw-gap-y-1">
                        {(fusion || separate) && <b>{fusion ? 'Fusion' : 'Separate'}</b>}
                        {partner && (
                          <span className="caption">
                            {separate ? 'Returns: ' : 'Partner: '}
                            <LinkToTop to={`/pokemon/${partner.id}`}>{humanize(partner.pokedexId)}</LinkToTop>
                          </span>
                        )}
                      </div>
                    )}
                    {hasCost && (
                      <div className="tw-grid tw-grid-cols-1 tw-gap-2 min-[420px]:tw-grid-cols-2">
                        {Number(change.candyCost) > 0 && (
                          <div className="tw-flex tw-min-w-0 tw-items-center tw-gap-2 tw-rounded tw-bg-custom-default tw-p-2">
                            <Candy id={pokemon.id} size={20} />
                            <span className="tw-min-w-0">
                              <span className="caption tw-block tw-truncate">
                                {humanize(pokemon.pokemonId ?? '')} Candy
                              </span>
                              <b>x{change.candyCost}</b>
                            </span>
                          </div>
                        )}
                        {partner && Number(partner.componentCandyCost) > 0 && (
                          <div className="tw-flex tw-min-w-0 tw-items-center tw-gap-2 tw-rounded tw-bg-custom-default tw-p-2">
                            <Candy id={partner.id} size={20} />
                            <span className="tw-min-w-0">
                              <span className="caption tw-block tw-truncate">
                                {humanize(partner.familyId.replace('FAMILY_', ''))} Candy
                              </span>
                              <b>x{partner.componentCandyCost}</b>
                            </span>
                          </div>
                        )}
                        {Number(change.stardustCost) > 0 && (
                          <span className="tw-flex tw-items-center tw-gap-2 tw-rounded tw-bg-custom-default tw-p-2">
                            <img alt="Stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                            <span>
                              <span className="caption tw-block">Stardust</span>
                              <b>x{change.stardustCost}</b>
                            </span>
                          </span>
                        )}
                        {change.item && (
                          <span className="tw-flex tw-min-w-0 tw-items-center tw-rounded tw-bg-custom-default tw-p-2">
                            <span className="tw-min-w-0">
                              <span className="caption tw-block tw-truncate">
                                {resourceNames[change.item] ?? humanize(change.item)}
                              </span>
                              <b>{change.itemCostCount !== undefined ? `x${change.itemCostCount}` : 'Unknown'}</b>
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                    {hasAdditionalDetails && (
                      <div className="caption tw-flex tw-flex-col tw-gap-2 tw-border-0 tw-border-t tw-border-solid tw-border-gray-500 tw-pt-3">
                        {separate && <span>Separation: Free · Re-fusion costs apply</span>}
                        {!separate && !hasCost && <span>Cost: Not listed</span>}
                        {change.requiredBreadMoves?.length ? <span>Previously unlocked form</span> : null}
                        {[888, 889].includes(pokemon.id ?? 0) && hasCost && (
                          <span>First unlock · Repeat changes: No Energy</span>
                        )}
                        {change.requiredCinematicMoves?.map((requirement, key) => (
                          <div key={key} className="tw-flex tw-flex-wrap tw-items-center tw-gap-1.5">
                            <span>Require move:</span>
                            {requirement.requiredMoves.map((move) => (
                              <div className="tw-inline-block" key={move}>
                                {renderMove(move)}{' '}
                              </div>
                            ))}
                          </div>
                        ))}
                        {change.moveReassignment?.cinematicMoves?.map((move, key) => (
                          <div key={key} className="tw-flex tw-flex-wrap tw-items-center tw-gap-1.5">
                            <span>Move:</span>
                            {move.existingMoves?.length
                              ? move.existingMoves.map((existing) => (
                                  <div className="tw-inline-block" key={existing}>
                                    {renderMove(existing)}{' '}
                                  </div>
                                ))
                              : 'Granted'}
                            <span aria-label="changes into">→</span>
                            {move.replacementMoves?.map((replacement) => (
                              <div className="tw-inline-block" key={replacement}>
                                {renderMove(replacement)}{' '}
                              </div>
                            ))}
                          </div>
                        ))}
                        {fusion && <span>Duration: Until separated</span>}
                      </div>
                    )}
                  </div>
                </div>
              ));
            })}
          </div>
        </div>
      </Xwrapper>
    </section>
  );
};

export default FromChange;
