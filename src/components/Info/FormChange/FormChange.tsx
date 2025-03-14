import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { useTheme } from '@mui/material';
import { generateParamForm, getPokemonDetails, getValidPokemonImgPath, splitAndCapitalize } from '../../../util/utils';
import Xarrow from 'react-xarrows';
import Candy from '../../Sprites/Candy/Candy';
import { StoreState } from '../../../store/models/state.model';
import { IPokemonModelComponent, PokemonModelComponent } from '../Assets/models/pokemon-model.model';
import { IFromChangeComponent } from '../../models/component.model';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber, UniqValueInArray } from '../../../util/extension';
import { LinkToTop } from '../../../util/hooks/LinkToTop';
import { IncludeMode } from '../../../util/enums/string.enum';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { FORM_NORMAL } from '../../../util/constants';

const FromChange = (props: IFromChangeComponent) => {
  const theme = useTheme<ThemeModify>();
  const pokemonData = useSelector((state: StoreState) => state.store.data.pokemons);
  const assets = useSelector((state: StoreState) => state.store.data.assets);

  const [pokeAssets, setPokeAssets] = useState<IPokemonModelComponent[]>([]);
  const [dataSrc, setDataSrc] = useState<string>();

  const [pokemon, setPokemon] = useState<IPokemonData>();

  const getImageList = (id: number | undefined) => {
    const model = assets.find((item) => item.id === id);
    const result = UniqValueInArray(model?.image.map((item) => item.form)).map((value) => new PokemonModelComponent(value, model?.image));
    return result;
  };

  useEffect(() => {
    if (props.currentId && props.form && props.currentId !== props.form.defaultId) {
      setPokeAssets([]);
      setDataSrc(undefined);
      setPokemon(undefined);
      return;
    }
    if (toNumber(props.currentId) > 0 && isNotEmpty(assets)) {
      setPokeAssets(getImageList(props.currentId));
    }
  }, [assets, props.currentId, props.form?.defaultId]);

  useEffect(() => {
    if (isNotEmpty(pokeAssets) && isNotEmpty(pokemonData) && props.form) {
      const formName = getValueOrDefault(String, props.form.form.name, props.form.form.formName, props.form.defaultName);
      const defaultForm = getValueOrDefault(String, props.form?.form.formName?.replaceAll('-', '_'), FORM_NORMAL);
      setDataSrc(
        pokeAssets.find((pokemon) => isInclude(pokemon.form, defaultForm, IncludeMode.IncludeIgnoreCaseSensitive))?.image?.at(0)?.default
      );

      const details = getPokemonDetails(
        pokemonData,
        props.form.defaultId,
        formName,
        props.form.form.pokemonType,
        props.form.form.isDefault
      );
      setPokemon(details);
    }
  }, [pokeAssets, pokemonData, props.form]);

  const findPokeAsset = (name: string) =>
    pokeAssets
      ?.find((pokemon) => isEqual(pokemon.form, name.replace('_COMPLETE_', '_').replace(`${props.form?.defaultName.toUpperCase()}_`, '')))
      ?.image.at(0)?.default;

  return (
    <Fragment>
      {props.currentId && props.form && props.currentId === props.form.defaultId && pokemon && pokemon.formChange && (
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
                      src={APIService.getPokemonModel(dataSrc, props.form?.defaultId)}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, props.form?.defaultId, dataSrc);
                      }}
                    />
                  </div>
                  <span className="caption" style={{ color: theme.palette.customText.caption }}>
                    {splitAndCapitalize(props.form?.form.name?.replaceAll('-', '_'), '_', ' ')}
                  </span>
                </div>
              </div>
              <div className="d-flex flex-column align-items-center justify-content-center w-50" style={{ rowGap: 15 }}>
                {pokemon.formChange.map((value, key) => (
                  <Fragment key={key}>
                    {value.availableForm.map((name, index) => (
                      <div key={index} className="d-flex flex-column align-items-center justify-content-center" id={`form-${key}-${index}`}>
                        <div style={{ width: 96 }}>
                          <img
                            className="pokemon-sprite-large"
                            alt="pokemon-model"
                            src={APIService.getPokemonModel(findPokeAsset(name), pokemon.num)}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, pokemon.num, findPokeAsset(name));
                            }}
                          />
                        </div>
                        <span className="caption" style={{ color: theme.palette.customText.caption }}>
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
                                className="d-flex align-items-center caption"
                                style={{ color: theme.palette.customText.caption, width: 'max-content' }}
                              >
                                <Candy id={value.componentPokemonSettings ? value.componentPokemonSettings.id : pokemon.num} />
                                <LinkToTop
                                  style={{ marginLeft: 2 }}
                                  to={`/pokemon/${value.componentPokemonSettings?.id}${generateParamForm(pokemon.forme)}`}
                                >
                                  {splitAndCapitalize(value.componentPokemonSettings?.pokedexId, '_', ' ')}
                                </LinkToTop>
                                <span style={{ marginLeft: 2 }}>{`x${value.candyCost}`}</span>
                              </span>
                            )}
                            {value.stardustCost && (
                              <span
                                className="d-flex align-items-center caption"
                                style={{ color: theme.palette.customText.caption, width: 'max-content', marginTop: 5 }}
                              >
                                <div className="d-inline-flex justify-content-center" style={{ width: 20 }}>
                                  <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                                </div>
                                <span style={{ marginLeft: 2 }}>{`x${value.stardustCost}`}</span>
                              </span>
                            )}
                            <span
                              className="d-flex flex-column caption"
                              style={{ color: theme.palette.customText.caption, width: 'max-content', marginTop: 5 }}
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
