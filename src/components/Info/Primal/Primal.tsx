import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { splitAndCapitalize } from '../../../util/utils';

import '../Mega/Mega.scss';
import { StoreState } from '../../../store/models/state.model';
import { FORM_PRIMAL } from '../../../util/constants';
import { Form, IForm } from '../../../core/models/API/form.model';
import { IFormSpecialComponent } from '../../models/component.model';
import { getValueOrDefault, isEqual, isUndefined } from '../../../util/extension';
import { TempEvo } from '../../../core/models/evolution.model';

const Primal = (props: IFormSpecialComponent) => {
  const evoData = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.pokemon));
  const [arrEvoList, setArrEvoList] = useState<IForm[]>([]);

  useEffect(() => {
    const result = props.formList
      .filter((item) => item.at(0)?.form.formName?.toUpperCase().includes(FORM_PRIMAL))
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
    const pokemon = evoData.find((item) => item.tempEvo?.find((value) => isEqual(value.tempEvolutionName, name)));
    if (pokemon) {
      return pokemon.tempEvo?.find((item) => isEqual(item.tempEvolutionName, name));
    } else {
      return TempEvo.create({
        firstTempEvolution: 'Unavailable',
        tempEvolution: 'Unavailable',
      });
    }
  };

  return (
    <Fragment>
      <h4 className="title-evo">
        <b>Primal Evolution</b>
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
                First primal evolution:{' '}
                <img
                  alt="img-primal"
                  width={25}
                  height={25}
                  src={APIService.getIconMegaPrimalSprite(
                    props.id === 382 ? 'pokemon_details_primal_alpha_energy' : 'pokemon_details_primal_omega_energy'
                  )}
                />
                <b>x{getQuestEvo(value.name)?.firstTempEvolution}</b>
              </span>
              <span className="caption">
                Primal evolution:{' '}
                <img
                  alt="img-primal"
                  width={25}
                  height={25}
                  src={APIService.getIconMegaPrimalSprite(
                    props.id === 382 ? 'pokemon_details_primal_alpha_energy' : 'pokemon_details_primal_omega_energy'
                  )}
                />
                <b>x{getQuestEvo(value.name)?.tempEvolution}</b>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default Primal;
