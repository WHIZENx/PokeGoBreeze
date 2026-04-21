import { DynamicObj } from '../../utils/extension';
import { splitAndCamelCase } from '../../utils/utils';
import { PokemonConfig } from '../constants/type';
import { PokemonDataGM } from '../models/options.model';
import { ITypeEffectiveModel, TypeEffectiveModel } from '../models/type-effective.model';
import { IWeatherBoost } from '../models/weather-boost.model';

export const optionPokemonTypes = (data: PokemonDataGM[]) => {
  const types = new TypeEffectiveModel() as unknown as DynamicObj<DynamicObj<number>>;
  const typeSet = Object.keys(types);
  data
    .filter((item) => /^POKEMON_TYPE*/g.test(item.templateId))
    .forEach((item) => {
      const rootType = item.templateId.replace(`${PokemonConfig.Type}_`, '');
      const typesRoot = types[splitAndCamelCase(rootType, '_', '')];
      typeSet.forEach((type, index) => {
        typesRoot[splitAndCamelCase(type, '_', '')] = item.data.typeEffective.attackScalar[index];
      });
    });
  return types as unknown as ITypeEffectiveModel;
};

export const optionPokemonWeather = (data: PokemonDataGM[]) => {
  const weather = new Object() as DynamicObj<string[]>;
  data
    .filter((item) => /^WEATHER_AFFINITY*/g.test(item.templateId) && item.data.weatherAffinities)
    .forEach((item) => {
      const rootType = item.data.weatherAffinities.weatherCondition;
      weather[splitAndCamelCase(rootType, '_', '')] = item.data.weatherAffinities.pokemonType.map((type) =>
        splitAndCamelCase(type.replace(`${PokemonConfig.Type}_`, ''), '_', '')
      );
    });
  return weather as unknown as IWeatherBoost;
};
