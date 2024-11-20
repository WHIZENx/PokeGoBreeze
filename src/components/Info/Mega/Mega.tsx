import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { capitalize, splitAndCapitalize } from '../../../util/utils';

import './Mega.scss';
import { StoreState } from '../../../store/models/state.model';
import { Form, IForm } from '../../../core/models/API/form.model';
import { IFormSpecialComponent } from '../../models/component.model';
import { isEqual, isUndefined } from '../../../util/extension';
import { TempEvo } from '../../../core/models/evolution.model';
import { PokemonType } from '../../../enums/type.enum';

const Mega = (props: IFormSpecialComponent) => {
  const evoData = useSelector((state: StoreState) => state.store.data.pokemon);
  const combat = useSelector((state: StoreState) => state.store.data.combat);
  const [arrEvoList, setArrEvoList] = useState<IForm[]>([]);

  useEffect(() => {
    const result = props.formList
      .filter((item) => item[0]?.form.pokemonType === PokemonType.Mega)
      .map((item) => {
        const form = item.at(0);
        if (!form) {
          return new Form();
        }
        return form.form;
      })
      .filter((item) => !isUndefined(item.id));
    setArrEvoList(result);
  }, [props.formList]);

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
      <h4 className="title-evo">
        <b>Mega Evolution</b>
      </h4>
      <div className="mega-container scroll-evolution">
        <ul className="ul-evo d-flex justify-content-center" style={{ gap: 15 }}>
          {arrEvoList.map((value, evo) => (
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
                First mega evolution: <img alt="img-mega" width={25} height={25} src={APIService.getIconSprite('ic_mega')} />
                <b>{getQuestEvo(value.name).firstTempEvolution}</b>
              </span>
              <span className="caption">
                Mega evolution: <img alt="img-mega" width={25} height={25} src={APIService.getIconSprite('ic_mega')} />
                <b>{getQuestEvo(value.name).tempEvolution}</b>
              </span>
              {getQuestEvo(value.name)?.requireMove && (
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
    </Fragment>
  );
};

export default Mega;
