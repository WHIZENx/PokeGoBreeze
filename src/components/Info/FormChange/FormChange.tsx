import React, { useId } from 'react';
import Xarrow from 'react-xarrows';
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
    <section>
      <h4 className="title-evo">
        <b>Form Change</b>
      </h4>
      {pokemon.id === 676 && <p className="caption">Trims vary by region and event.</p>}
      {pokemon.id === 718 && <p className="caption">Cell costs depend on unlocked forms.</p>}
      <div className="tw-mt-2 tw-flex">
        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-1/2">
          <div id={`${arrowId}-origin`}>
            {renderPokemon(pokemon.fullName ?? `${pokemon.pokemonId}_${pokemon.form}`, pokemon.form ?? 'NORMAL')}
          </div>
        </div>
        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-1/2 tw-gap-3">
          {pokemon.formChange.map((change, index) => {
            const partner = change.componentPokemonSettings;
            const fusion = partner?.formChangeType === 'FUSE';
            const separate = partner?.formChangeType === 'UNFUSE';
            const hasCost =
              Number(change.candyCost) > 0 || Number(change.stardustCost) > 0 || Number(change.itemCostCount) > 0;
            return change.availableForm.map((target) => (
              <div key={`${index}-${target}`} className="tw-flex tw-flex-col tw-items-center tw-justify-center">
                <div id={`${arrowId}-${index}-${target}`}>{renderPokemon(target)}</div>
                <Xarrow strokeWidth={2} path="grid" start={`${arrowId}-origin`} end={`${arrowId}-${index}-${target}`} />
                <div className="caption tw-flex tw-max-w-full tw-flex-col tw-items-center tw-gap-1 tw-text-center">
                  {(fusion || separate || partner) && (
                    <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-x-2 tw-gap-y-1">
                      {(fusion || separate) && <span>{fusion ? 'Fusion' : 'Separate'}</span>}
                      {partner && (
                        <span>
                          {separate ? 'Returns: ' : 'Partner: '}
                          <LinkToTop to={`/pokemon/${partner.id}`}>{humanize(partner.pokedexId)}</LinkToTop>
                        </span>
                      )}
                    </div>
                  )}
                  <div className="tw-flex tw-flex-col tw-items-center tw-gap-1">
                    {Number(change.candyCost) > 0 && (
                      <div className="tw-flex tw-items-center tw-gap-1">
                        <Candy id={pokemon.id} size={20} />
                        <span>
                          {humanize(pokemon.pokemonId ?? '')} Candy: <b>x{change.candyCost}</b>
                        </span>
                      </div>
                    )}
                    {partner && Number(partner.componentCandyCost) > 0 && (
                      <div className="tw-flex tw-items-center tw-gap-1">
                        <Candy id={partner.id} size={20} />
                        <span>
                          {humanize(partner.familyId.replace('FAMILY_', ''))} Candy:{' '}
                          <b>x{partner.componentCandyCost}</b>
                        </span>
                      </div>
                    )}
                    {Number(change.stardustCost) > 0 && (
                      <span className="tw-flex tw-items-center tw-gap-1">
                        <img alt="Stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                        Stardust: <b>x{change.stardustCost}</b>
                      </span>
                    )}
                    {change.item && (
                      <span>
                        {resourceNames[change.item] ?? humanize(change.item)}:{' '}
                        <b>{change.itemCostCount !== undefined ? `x${change.itemCostCount}` : 'Unknown'}</b>
                      </span>
                    )}
                  </div>
                  {separate && <span className="caption">Separation: Free · Re-fusion costs apply</span>}
                  {!separate && !hasCost && <span>Cost: Not listed</span>}
                  {change.requiredBreadMoves?.length ? <span className="caption">Previously unlocked form</span> : null}
                  {[888, 889].includes(pokemon.id ?? 0) && hasCost && (
                    <span className="caption">First unlock · Repeat changes: No Energy</span>
                  )}
                  {change.requiredCinematicMoves?.map((requirement, key) => (
                    <div
                      key={key}
                      className="caption tw-mt-1 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-1.5"
                    >
                      <span>Require move:</span>
                      {requirement.requiredMoves.map((move) => (
                        <div className="tw-inline-block" key={move}>
                          {renderMove(move)}{' '}
                        </div>
                      ))}
                    </div>
                  ))}
                  {change.moveReassignment?.cinematicMoves?.map((move, key) => (
                    <div
                      key={key}
                      className="caption tw-mt-1 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-1.5"
                    >
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
                  {fusion && <span className="caption tw-mt-1">Duration: Until separated</span>}
                </div>
              </div>
            ));
          })}
        </div>
      </div>
    </section>
  );
};

export default FromChange;
