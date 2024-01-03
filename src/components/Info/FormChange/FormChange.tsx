import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { useTheme } from '@mui/material';
import { splitAndCapitalize } from '../../../util/Utils';
import Xarrow from 'react-xarrows';
import Candy from '../../Sprites/Candy/Candy';
import { StoreState } from '../../../store/models/state.model';
import { PokemonModelComponent } from '../Assets/models/pokemon-model.model';

const FromChange = ({ details, defaultName }: any) => {
  const theme = useTheme();
  const data = useSelector((state: StoreState) => state.store.data);

  const [pokeAssets, setPokeAssets]: [PokemonModelComponent[], any] = useState([]);

  const getImageList = useCallback(
    (id: number) => {
      const model = data?.assets?.find((item) => item.id === id);
      return model
        ? [...new Set(model.image.map((item) => item.form))].map((value) => new PokemonModelComponent(value ?? '', model.image))
        : [];
    },
    [data?.assets]
  );

  useEffect(() => {
    if (details) {
      setPokeAssets(getImageList(details.id));
    }
  }, [getImageList, details]);

  return (
    <Fragment>
      <h4 className="title-evo">
        <b>Form Change</b>
      </h4>
      {pokeAssets && (
        <div className="element-top d-flex">
          <div className="d-flex flex-column align-items-center justify-content-center w-50">
            <div className="d-flex flex-column align-items-center justify-content-center" id="form-origin">
              <div style={{ width: 96 }}>
                <img
                  className="pokemon-sprite-large"
                  alt="pokemon-model"
                  src={APIService.getPokemonModel(
                    pokeAssets?.find((pokemon) => pokemon.form === details.form)?.image?.at(0)?.default ?? ''
                  )}
                />
              </div>
              <span className="caption" style={{ color: (theme.palette as any).customText.caption }}>
                {splitAndCapitalize(details.name, '_', ' ')}
              </span>
            </div>
          </div>
          <div className="d-flex flex-column align-items-center justify-content-center w-50" style={{ rowGap: 15 }}>
            {details.formChange.map((value: { availableForm: string[] }, index: React.Key) => (
              <Fragment key={index}>
                {value.availableForm.map((name: string, index: React.Key) => (
                  <div key={index} className="d-flex flex-column align-items-center justify-content-center" id={`form-${index}`}>
                    <div style={{ width: 96 }}>
                      <img
                        className="pokemon-sprite-large"
                        alt="pokemon-model"
                        src={APIService.getPokemonModel(
                          pokeAssets
                            ?.find(
                              (pokemon) => pokemon.form === name.replace('_COMPLETE', '').replace(`${defaultName?.toUpperCase()}_`, '')
                            )
                            ?.image.at(0)?.default ?? ''
                        )}
                      />
                    </div>
                    <span className="caption" style={{ color: (theme.palette as any).customText.caption }}>
                      {splitAndCapitalize(name, '_', ' ')}
                    </span>
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
          {details.formChange.map((value: { availableForm: string[]; candyCost: string; stardustCost: string }, index: React.Key) => (
            <Fragment key={index}>
              {value.availableForm.map((_: string, index: React.Key) => (
                <Xarrow
                  labels={{
                    end: (
                      <div className="position-absolute" style={{ left: -50 }}>
                        <span
                          className="d-flex align-items-center caption"
                          style={{ color: (theme.palette as any).customText.caption, width: 'max-content' }}
                        >
                          <Candy id={details.id} />
                          <span style={{ marginLeft: 2 }}> {`x${value.candyCost}`}</span>
                        </span>
                        <span
                          className="d-flex align-items-center caption"
                          style={{ color: (theme.palette as any).customText.caption, width: 'max-content', marginTop: 5 }}
                        >
                          <div className="d-inline-flex justify-content-center" style={{ width: 20 }}>
                            <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                          </div>
                          <span style={{ marginLeft: 2 }}>{`x${value.stardustCost}`}</span>
                        </span>
                      </div>
                    ),
                  }}
                  key={index}
                  strokeWidth={2}
                  path="grid"
                  start="form-origin"
                  end={`form-${index}`}
                />
              ))}
            </Fragment>
          ))}
        </div>
      )}
    </Fragment>
  );
};

export default FromChange;
