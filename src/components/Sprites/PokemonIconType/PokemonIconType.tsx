import React from 'react';
import { IPokemonIconTypeComponent } from '../../models/component.model';
import { PokemonType } from '../../../enums/type.enum';
import APIService from '../../../services/API.service';
import { combineClasses } from '../../../util/extension';

const PokemonIconType = (props: IPokemonIconTypeComponent) => {
  const getIconType = (src: string, className: string, alt: string) => (
    <img
      className={combineClasses(className, props.className)}
      alt={alt}
      style={props.style}
      height={props.size}
      src={src}
    />
  );

  return (
    <>
      {props.pokemonType === PokemonType.Shadow && getIconType(APIService.getPokeShadow(), 'shadow-icon', 'img-shadow')}
      {props.pokemonType === PokemonType.Purified &&
        getIconType(APIService.getPokePurified(), 'purified-icon', 'img-purified')}
      {props.children}
    </>
  );
};

export default PokemonIconType;
