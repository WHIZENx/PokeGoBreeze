import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { splitAndCapitalize } from '../../../util/utils';

import './Mega.scss';
import { StoreState } from '../../../store/models/state.model';
import { FORM_MEGA } from '../../../util/constants';
import { Form, IForm } from '../../../core/models/API/form.model';
import { IFormSpecialComponent } from '../../models/component.model';
import { getValueOrDefault, isUndefined } from '../../../util/extension';
import { TempEvo } from '../../../core/models/evolution.model';

const Mega = (props: IFormSpecialComponent) => {
  const evoData = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.pokemon));
  const [arrEvoList, setArrEvoList] = useState<IForm[]>([]);

  useEffect(() => {
    const result = props.formList
      .filter((item) => item.at(0)?.form.formName?.toUpperCase().includes(FORM_MEGA))
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

    const pokemon = evoData.find((item) => item.tempEvo?.find((value) => value.tempEvolutionName === name));
    if (pokemon) {
      return pokemon.tempEvo?.find((item) => item.tempEvolutionName === name);
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
                <b>{getQuestEvo(value.name) ? `x${getQuestEvo(value.name)?.firstTempEvolution}` : 'Unavailable'}</b>
              </span>
              <span className="caption">
                Mega evolution: <img alt="img-mega" width={25} height={25} src={APIService.getIconSprite('ic_mega')} />
                <b>{getQuestEvo(value.name) ? `x${getQuestEvo(value.name)?.tempEvolution}` : 'Unavailable'}</b>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default Mega;
