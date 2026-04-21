import { getValueOrDefault, isEqual, toNumber } from '../../utils/extension';
import { formNormal } from '../../utils/helpers/options-context.helpers';
import { EvolutionChain, EvolutionInfo, IEvolutionInfo } from '../models/evolution-chain.model';
import { EvolutionChainData, PokemonDataGM } from '../models/options.model';
import { IPokemonData } from '../models/pokemon.model';

const mappingPokemonEvoInfo = (pokemonData: EvolutionChainData[] | undefined, pokemon: IPokemonData[]) => {
  const result: IEvolutionInfo[] = [];
  pokemonData?.forEach((item) => {
    const form = getValueOrDefault(
      String,
      item.headerMessage?.replace('_pokedex_header', '').toUpperCase(),
      formNormal()
    );
    item.evolutionInfos.forEach((info) => {
      const id = toNumber(pokemon.find((poke) => isEqual(poke.pokemonId, info.pokemon))?.num);
      result.push(
        EvolutionInfo.create({
          id,
          form,
          pokemonId: info.pokemon,
        })
      );
    });
  });
  return result;
};

export const optionEvolutionChain = (data: PokemonDataGM[], pokemon: IPokemonData[]) => {
  return data
    .filter((item) => /^EVOLUTION_V\d{4}_*/g.test(item.templateId))
    .map((item) => {
      const id = toNumber(getValueOrDefault(Array, item.templateId.match(/\d{4}/g))[0]);
      return EvolutionChain.create({
        id,
        pokemonId: item.data.evolutionChainDisplaySettings.pokemon,
        evolutionInfos: mappingPokemonEvoInfo(item.data.evolutionChainDisplaySettings.evolutionChains, pokemon),
      });
    });
};
