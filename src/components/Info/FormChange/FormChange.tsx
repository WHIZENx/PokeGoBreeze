import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { useTheme } from '@mui/material';
import { splitAndCapitalize } from '../../../util/Utils';
import Xarrow from 'react-xarrows';
import Candy from '../../Sprites/Candy/Candy';
import { StoreState } from '../../../store/models/state.model';
import { IPokemonModelComponent, PokemonModelComponent } from '../Assets/models/pokemon-model.model';
import { IFromChangeComponent } from '../../models/component.model';

const FromChange = (props: IFromChangeComponent) => {
  const theme = useTheme();
  const assets = useSelector((state: StoreState) => state.store.data?.assets ?? []);

  const [pokeAssets, setPokeAssets]: [IPokemonModelComponent[], React.Dispatch<React.SetStateAction<IPokemonModelComponent[]>>] = useState(
    [] as IPokemonModelComponent[]
  );

  const getImageList = (id: number) => {
    const model = assets.find((item) => item.id === id);
    return model
      ? [...new Set(model.image.map((item) => item.form))].map((value) => new PokemonModelComponent(value ?? '', model.image))
      : [];
  };

  useEffect(() => {
    if (props.details?.num && assets.length > 0) {
      setPokeAssets(getImageList(props.details.num));
    }
  }, [assets.length, props.details?.num]);

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
                    pokeAssets?.find((pokemon) => pokemon.form === props.details?.forme)?.image?.at(0)?.default ?? ''
                  )}
                />
              </div>
              <span className="caption" style={{ color: (theme.palette as any).customText.caption }}>
                {splitAndCapitalize(props.details?.name.replaceAll('-', '_'), '_', ' ')}
              </span>
            </div>
          </div>
          <div className="d-flex flex-column align-items-center justify-content-center w-50" style={{ rowGap: 15 }}>
            {props.details?.formChange?.map((value, key) => (
              <Fragment key={key}>
                {value.availableForm.map((name, index) => (
                  <div key={index} className="d-flex flex-column align-items-center justify-content-center" id={`form-${key}-${index}`}>
                    <div style={{ width: 96 }}>
                      <img
                        className="pokemon-sprite-large"
                        alt="pokemon-model"
                        src={APIService.getPokemonModel(
                          pokeAssets
                            ?.find(
                              (pokemon) =>
                                pokemon.form === name.replace('_COMPLETE_', '_').replace(`${props.defaultName?.toUpperCase()}_`, '')
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
          {props.details?.formChange?.map((value, key) => (
            <Fragment key={key}>
              {value.availableForm.map((_, index) => (
                <Xarrow
                  labels={{
                    end: (
                      <div className="position-absolute" style={{ left: -50 }}>
                        {value.candyCost && (
                          <span
                            className="d-flex align-items-center caption"
                            style={{ color: (theme.palette as any).customText.caption, width: 'max-content' }}
                          >
                            <Candy id={props.details?.num} />
                            <span style={{ marginLeft: 2 }}> {`x${value.candyCost}`}</span>
                          </span>
                        )}
                        {value.stardustCost && (
                          <span
                            className="d-flex align-items-center caption"
                            style={{ color: (theme.palette as any).customText.caption, width: 'max-content', marginTop: 5 }}
                          >
                            <div className="d-inline-flex justify-content-center" style={{ width: 20 }}>
                              <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                            </div>
                            <span style={{ marginLeft: 2 }}>{`x${value.stardustCost}`}</span>
                          </span>
                        )}
                        <span
                          className="d-flex flex-column caption"
                          style={{ color: (theme.palette as any).customText.caption, width: 'max-content', marginTop: 5 }}
                        >
                          {value.item && (
                            <>
                              <span>Required Item</span>
                              <span>{`Cost count: ${value.itemCostCount}`}</span>
                            </>
                          )}
                        </span>
                      </div>
                    ),
                  }}
                  key={index}
                  strokeWidth={2}
                  path="grid"
                  start="form-origin"
                  end={`form-${key}-${index}`}
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
