import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useSelector, RootStateOrAny } from 'react-redux';
import APIService from '../../../services/API.service';
import { useTheme } from '@mui/material';
import { splitAndCapitalize } from '../../../util/Utils';
import Xarrow from 'react-xarrows';
import Candy from '../../Sprites/Candy/Candy';

const FromChange = ({ details, defaultName }: any) => {
  const theme = useTheme();
  const data = useSelector((state: RootStateOrAny) => state.store.data);

  const [pokeAssets, setPokeAssets]: any = useState([]);

  const getImageList = useCallback(
    (id: any) => {
      const model = data.assets.find((item: { id: any }) => item.id === id);
      return model
        ? Array.from(new Set(model.image.map((item: { form: any }) => item.form))).map((value) => {
            return {
              form: value,
              image: model.image.filter((item: { form: any }) => value === item.form),
            };
          })
        : [];
    },
    [data.assets]
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
                    pokeAssets.find((pokemon: { form: string }) => pokemon.form === details.form)?.image[0].default
                  )}
                />
              </div>
              <span className="caption" style={{ color: (theme.palette as any).customText.caption }}>
                {splitAndCapitalize(details.name, '_', ' ')}
              </span>
            </div>
          </div>
          <div className="d-flex flex-column align-items-center justify-content-center w-50" style={{ rowGap: 15 }}>
            {details.formChange.map((value: any, index: React.Key) => (
              <Fragment key={index}>
                {value.availableForm.map((name: string, index: React.Key) => (
                  <div key={index} className="d-flex flex-column align-items-center justify-content-center" id={`form-${index}`}>
                    <div style={{ width: 96 }}>
                      <img
                        className="pokemon-sprite-large"
                        alt="pokemon-model"
                        src={APIService.getPokemonModel(
                          pokeAssets.find((pokemon: { form: string }) => pokemon.form === name.replace(`${defaultName.toUpperCase()}_`, ''))
                            ?.image[0].default
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
          {details.formChange.map((value: any, index: React.Key) => (
            <Fragment key={index}>
              {value.availableForm.map((_: any, index: React.Key) => (
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
