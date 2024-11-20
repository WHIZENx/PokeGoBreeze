import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { capitalize, getKeyEnum, splitAndCapitalize } from '../../../util/utils';

import './SpecialForm.scss';
import { StoreState } from '../../../store/models/state.model';
import { Form, IForm } from '../../../core/models/API/form.model';
import { IFormSpecialComponent } from '../../models/component.model';
import { isEqual, isNotEmpty, isUndefined } from '../../../util/extension';
import { TempEvo } from '../../../core/models/evolution.model';
import { PokemonType } from '../../../enums/type.enum';

const SpecialForm = (props: IFormSpecialComponent) => {
  const evoData = useSelector((state: StoreState) => state.store.data.pokemon);
  const combat = useSelector((state: StoreState) => state.store.data.combat);

  const [pokemonType, setPokemonType] = useState(PokemonType.None);
  const [arrEvoList, setArrEvoList] = useState<IForm[]>();

  useEffect(() => {
    if (props.formList?.some((item) => item.some((pokemon) => pokemon.form.pokemonType === PokemonType.Mega))) {
      setPokemonType(PokemonType.Mega);
    } else if (props.formList?.some((item) => item.some((pokemon) => pokemon.form.pokemonType === PokemonType.Primal))) {
      setPokemonType(PokemonType.Primal);
    }
  }, [props.formList]);

  useEffect(() => {
    if (isNotEmpty(props.formList) && pokemonType !== PokemonType.None) {
      const result = props.formList
        ?.filter((item) => item[0]?.form.pokemonType === pokemonType)
        .map((item) => {
          const form = item.at(0);
          if (!form) {
            return new Form();
          }
          return form.form;
        })
        .filter((item) => !isUndefined(item.id));
      setArrEvoList(result);
    }
  }, [pokemonType, props.formList]);

  const getQuestEvo = (name: string) => {
    name = name
      .split('-')
      .map((text) => text.toUpperCase())
      .join('_');
    const pokemonEvo = evoData
      .find((item) => item.tempEvo?.find((value) => isEqual(value.tempEvolutionName, name)))
      ?.tempEvo?.find((item) => isEqual(item.tempEvolutionName, name));
    return TempEvo.create({
      ...pokemonEvo,
      firstTempEvolution: pokemonEvo?.firstTempEvolution ? `x${pokemonEvo.firstTempEvolution}` : 'Unavailable',
      tempEvolution: pokemonEvo?.tempEvolution ? `x${pokemonEvo.tempEvolution}` : 'Unavailable',
    });
  };

  const getCombatMove = (moveName: string | undefined) => {
    const move = combat.find((item) => isEqual(item.name, moveName));
    return move;
  };

  return (
    <Fragment>
      {isNotEmpty(arrEvoList) && (
        <div className={props.className} style={props.style}>
          <h4 className="title-evo">
            <b>{getKeyEnum(PokemonType, pokemonType)} Evolution</b>
          </h4>
          <div className="form-special-container scroll-evolution">
            <ul className="ul-evo d-flex justify-content-center" style={{ gap: 15 }}>
              {arrEvoList?.map((value, evo) => (
                <li key={evo} className="img-form-gender-group li-evo" style={{ width: 'fit-content', height: 'fit-content' }}>
                  <img
                    id="img-pokemon"
                    height="96"
                    alt="img-pokemon"
                    src={APIService.getPokeGifSprite(value.name)}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `${value.sprites?.frontDefault}`;
                    }}
                  />
                  <div id="id-pokemon" style={{ color: 'black' }}>
                    <b>#{props.id}</b>
                  </div>
                  <div>
                    <b className="link-title">{splitAndCapitalize(value.name, '-', ' ')}</b>
                  </div>
                  <span className="caption">
                    {`First ${getKeyEnum(PokemonType, pokemonType)?.toLowerCase()} evolution: `}
                    <img
                      alt={`img-${getKeyEnum(PokemonType, pokemonType)?.toLowerCase()}`}
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
                    <b>{getQuestEvo(value.name).firstTempEvolution}</b>
                  </span>
                  <span className="caption">
                    {`${getKeyEnum(PokemonType, pokemonType)} evolution: `}
                    <img
                      alt="img-primal"
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
                    <b>{getQuestEvo(value.name).tempEvolution}</b>
                  </span>
                  {getQuestEvo(value.name).requireMove && (
                    <span className="caption">
                      {`Require move: `}
                      <img
                        style={{ marginRight: 5 }}
                        width={25}
                        height={25}
                        alt="img-pokemon"
                        src={APIService.getTypeSprite(capitalize(getCombatMove(getQuestEvo(value.name).requireMove)?.type))}
                      />
                      <b>{splitAndCapitalize(getQuestEvo(value.name).requireMove, '_', ' ')}</b>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default SpecialForm;
