import React, { Fragment, useEffect, useState } from 'react';
import { RootStateOrAny, useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { splitAndCapitalize } from '../../../util/Utils';

import '../Mega/Mega.scss';

const Primal = (props: { formList: any; id: number }) => {
  const evoData = useSelector((state: RootStateOrAny) => state.store.data.evolution);
  const [arrEvoList, setArrEvoList] = useState([]);

  useEffect(() => {
    setArrEvoList(
      props.formList
        .filter((item: { form: { form_name: string | string[] } }[]) => item[0].form.form_name.includes('primal'))
        .map((item: { form: any }[]) => item[0].form)
    );
  }, [props.formList]);

  const getQuestEvo = (name: string) => {
    name = name
      .split('-')
      .map((text: string) => text.toUpperCase())
      .join('_');
    try {
      return evoData
        .find((item: { temp_evo: any[] }) => item.temp_evo.find((value: { tempEvolutionName: any }) => value.tempEvolutionName === name))
        .temp_evo.find((item: { tempEvolutionName: any }) => item.tempEvolutionName === name);
    } catch (error) {
      return {
        firstTempEvolution: 'Unavailable',
        tempEvolution: 'Unavailable',
      };
    }
  };

  return (
    <Fragment>
      <h4 className="title-evo">
        <b>Primal Evolution</b>
      </h4>
      <div className="mega-container scroll-evolution">
        <ul className="ul-evo d-flex justify-content-center" style={{ gap: 15 }}>
          {arrEvoList.map((value: any, evo) => (
            <li key={evo} className="img-form-gender-group li-evo" style={{ width: 'fit-content', height: 'fit-content' }}>
              <img
                id="img-pokemon"
                height="96"
                alt="img-pokemon"
                src={APIService.getPokeGifSprite(value.name)}
                onError={(e: any) => {
                  e.onerror = null;
                  e.target.src = `${value.sprites.front_default}`;
                }}
              />
              <div id="id-pokemon" style={{ color: 'black' }}>
                <b>#{props.id}</b>
              </div>
              <div>
                <b className="link-title">{splitAndCapitalize(value.name, '-', ' ')}</b>
              </div>
              <span className="caption">
                First primal evolution: <img alt="img-primal" width={25} height={25} src={APIService.getIconSprite('ic_mega')} />
                <b>x{getQuestEvo(value.name).firstTempEvolution}</b>
              </span>
              <span className="caption">
                Primal evolution: <img alt="img-primal" width={25} height={25} src={APIService.getIconSprite('ic_mega')} />
                <b>x{getQuestEvo(value.name).tempEvolution}</b>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default Primal;
