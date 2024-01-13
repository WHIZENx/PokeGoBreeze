import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { splitAndCapitalize } from '../../../util/Utils';

import '../Mega/Mega.scss';
import { StoreState } from '../../../store/models/state.model';
import { FORM_PRIMAL } from '../../../util/Constants';
import { FormModel, PokemonFormModify } from '../../../core/models/API/form.model';

const Primal = (props: { formList: PokemonFormModify[][]; id: number }) => {
  const evoData = useSelector((state: StoreState) => state.store.data?.evolution ?? []);
  const [arrEvoList, setArrEvoList]: [
    (FormModel | undefined)[] | undefined,
    React.Dispatch<React.SetStateAction<(FormModel | undefined)[]>>
  ] = useState([] as (FormModel | undefined)[]);

  useEffect(() => {
    setArrEvoList(
      props.formList.filter((item) => item.at(0)?.form.form_name?.toUpperCase().includes(FORM_PRIMAL)).map((item) => item.at(0)?.form)
    );
  }, [props.formList]);

  const getQuestEvo = (name: string) => {
    name = name
      .split('-')
      .map((text: string) => text.toUpperCase())
      .join('_');
    try {
      return evoData
        ?.find((item) => item.temp_evo.find((value) => value.tempEvolutionName === name))
        ?.temp_evo.find((item) => item.tempEvolutionName === name);
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
          {arrEvoList.map((value, evo) => (
            <li key={evo} className="img-form-gender-group li-evo" style={{ width: 'fit-content', height: 'fit-content' }}>
              <img
                id="img-pokemon"
                height="96"
                alt="img-pokemon"
                src={APIService.getPokeGifSprite(value?.name ?? '')}
                onError={(e: any) => {
                  e.onerror = null;
                  e.target.src = `${value?.sprites?.front_default}`;
                }}
              />
              <div id="id-pokemon" style={{ color: 'black' }}>
                <b>#{props.id}</b>
              </div>
              <div>
                <b className="link-title">{splitAndCapitalize(value?.name, '-', ' ')}</b>
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
                <b>x{getQuestEvo(value?.name ?? '')?.firstTempEvolution}</b>
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
                <b>x{getQuestEvo(value?.name ?? '')?.tempEvolution}</b>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default Primal;
