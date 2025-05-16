import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { generateParamForm, getValidPokemonImgPath, splitAndCapitalize } from '../../../util/utils';
import Xarrow from 'react-xarrows';
import Candy from '../../Sprites/Candy/Candy';
import { StoreState } from '../../../store/models/state.model';
import { IPokemonModelComponent, PokemonModelComponent } from '../Assets/models/pokemon-model.model';
import { IFromChangeComponent } from '../../models/component.model';
import { getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber, UniqValueInArray } from '../../../util/extension';
import { LinkToTop } from '../../../util/hooks/LinkToTop';
import { IncludeMode } from '../../../util/enums/string.enum';
import { FORM_NORMAL } from '../../../util/constants';
import { IPokemonDetail } from '../../../core/models/API/info.model';

const FromChange = (props: IFromChangeComponent) => {
  const assets = useSelector((state: StoreState) => state.store.data.assets);

  const [pokeAssets, setPokeAssets] = useState<IPokemonModelComponent[]>([]);
  const [dataSrc, setDataSrc] = useState<string>();

  const [pokemon, setPokemon] = useState<Partial<IPokemonDetail>>();

  const getImageList = (id: number | undefined) => {
    const model = assets.find((item) => item.id === id);
    const result = UniqValueInArray(model?.image.map((item) => item.form)).map(
      (value) => new PokemonModelComponent(value, model?.image)
    );
    return result;
  };

  useEffect(() => {
    if (props.currentId && props.pokemonData && props.currentId !== props.pokemonData.id) {
      setPokeAssets([]);
      setDataSrc(undefined);
      setPokemon(undefined);
      return;
    }
    if (toNumber(props.currentId) > 0 && isNotEmpty(assets)) {
      setPokeAssets(getImageList(props.currentId));
    }
  }, [assets, props.currentId, props.pokemonData]);

  useEffect(() => {
    if (isNotEmpty(pokeAssets) && props.pokemonData?.fullName) {
      const defaultForm = getValueOrDefault(String, props.pokemonData.form?.replaceAll('-', '_'), FORM_NORMAL);
      setDataSrc(
        pokeAssets
          .find((pokemon) => isInclude(pokemon.form, defaultForm, IncludeMode.IncludeIgnoreCaseSensitive))
          ?.image?.at(0)?.default
      );
      setPokemon(props.pokemonData);
    }
  }, [pokeAssets, props.pokemonData]);

  const findPokeAsset = (name: string) =>
    pokeAssets
      ?.find((pokemon) =>
        isEqual(
          pokemon.form,
          name.replace('_COMPLETE_', '_').replace(`${props.pokemonData?.pokemonId?.toUpperCase()}_`, '')
        )
      )
      ?.image.at(0)?.default;

  return (
    <Fragment>
      {props.currentId &&
        props.pokemonData &&
        props.currentId === props.pokemonData.id &&
        pokemon &&
        pokemon.formChange && (
          <>
            <h4 className="title-evo">
              <b>Form Change</b>
            </h4>
            {isNotEmpty(pokeAssets) && (
              <div className="element-top d-flex">
                <div className="d-flex flex-column align-items-center justify-content-center w-50">
                  <div className="d-flex flex-column align-items-center justify-content-center" id="form-origin">
                    <div style={{ width: 96 }}>
                      <img
                        className="pokemon-sprite-large"
                        alt="pokemon-model"
                        src={APIService.getPokemonModel(dataSrc, props.pokemonData.id)}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getValidPokemonImgPath(
                            e.currentTarget.src,
                            props.pokemonData?.id,
                            dataSrc
                          );
                        }}
                      />
                    </div>
                    <span className="theme-caption">
                      {splitAndCapitalize(props.pokemonData.fullName?.replaceAll('-', '_'), '_', ' ')}
                    </span>
                  </div>
                </div>
                <div
                  className="d-flex flex-column align-items-center justify-content-center w-50"
                  style={{ rowGap: 15 }}
                >
                  {pokemon.formChange.map((value, key) => (
                    <Fragment key={key}>
                      {value.availableForm.map((name, index) => (
                        <div
                          key={index}
                          className="d-flex flex-column align-items-center justify-content-center"
                          id={`form-${key}-${index}`}
                        >
                          <div style={{ width: 96 }}>
                            <img
                              className="pokemon-sprite-large"
                              alt="pokemon-model"
                              src={APIService.getPokemonModel(findPokeAsset(name), pokemon.id)}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getValidPokemonImgPath(
                                  e.currentTarget.src,
                                  pokemon.id,
                                  findPokeAsset(name)
                                );
                              }}
                            />
                          </div>
                          <span className="theme-caption">
                            {splitAndCapitalize(name.replace(`_${FORM_NORMAL}`, ''), '_', ' ')}
                          </span>
                        </div>
                      ))}
                    </Fragment>
                  ))}
                </div>
                {pokemon.formChange.map((value, key) => (
                  <Fragment key={key}>
                    {value.availableForm.map((_, index) => (
                      <Xarrow
                        labels={{
                          end: (
                            <div className="position-absolute" style={{ left: '-5rem' }}>
                              {value.candyCost && (
                                <span
                                  className="d-flex align-items-center theme-caption"
                                  style={{ width: 'max-content' }}
                                >
                                  <Candy
                                    id={value.componentPokemonSettings ? value.componentPokemonSettings.id : pokemon.id}
                                  />
                                  <LinkToTop
                                    style={{ marginLeft: 2 }}
                                    to={`/pokemon/${value.componentPokemonSettings?.id}${generateParamForm(
                                      pokemon.form
                                    )}`}
                                  >
                                    {splitAndCapitalize(value.componentPokemonSettings?.pokedexId, '_', ' ')}
                                  </LinkToTop>
                                  <span style={{ marginLeft: 2 }}>{`x${value.candyCost}`}</span>
                                </span>
                              )}
                              {value.stardustCost && (
                                <span
                                  className="d-flex align-items-center theme-caption"
                                  style={{
                                    width: 'max-content',
                                    marginTop: 5,
                                  }}
                                >
                                  <div className="d-inline-flex justify-content-center" style={{ width: 20 }}>
                                    <img
                                      alt="img-stardust"
                                      height={20}
                                      src={APIService.getItemSprite('stardust_painted')}
                                    />
                                  </div>
                                  <span style={{ marginLeft: 2 }}>{`x${value.stardustCost}`}</span>
                                </span>
                              )}
                              <span
                                className="d-flex flex-column theme-caption"
                                style={{ width: 'max-content', marginTop: 5 }}
                              >
                                {value.item && (
                                  <>
                                    <span>Required Item</span>
                                    <span>{splitAndCapitalize(value.item, '_', ' ')}</span>
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
          </>
        )}
    </Fragment>
  );
};

export default FromChange;
