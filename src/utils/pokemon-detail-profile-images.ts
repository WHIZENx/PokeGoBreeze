import type { PokemonGoFormCatalogEntry } from '../core/models/API/pokemon-bundle.model';
import { PokemonSprite } from '../core/models/API/form.model';
import type { SpriteInfo } from '../core/models/API/info.model';
import APIService from '../services/api.service';
import {
  buildPokemonDetailProfilePresentation,
  type PokemonDetailCanonicalForm,
  type PokemonDetailSelection,
} from './pokemon-detail-presentation';
import { convertPokemonImageName, getPreferredPokemonFormSprite } from './utils';

interface PokemonDetailProfileCanonicalForm extends PokemonDetailCanonicalForm {
  sprites?: SpriteInfo;
}

interface PokemonDetailProfileImagePresentationInput<T extends PokemonDetailProfileCanonicalForm> {
  canonicalForms?: readonly T[];
  pokemonGoForms?: readonly PokemonGoFormCatalogEntry[];
  selection: PokemonDetailSelection;
}

/**
 * Builds the complete ordered profile-image chain. Keeping URL construction
 * here prevents individual consumers from changing the Details priority.
 */
export const buildPokemonDetailProfileImagePresentation = <T extends PokemonDetailProfileCanonicalForm>({
  canonicalForms,
  pokemonGoForms,
  selection,
}: PokemonDetailProfileImagePresentationInput<T>) =>
  buildPokemonDetailProfilePresentation({
    canonicalForms,
    pokemonGoForms,
    selection,
    getCanonicalImage: (form) => getPreferredPokemonFormSprite(PokemonSprite.setDetails(form.sprites)),
    getPokemonGoImage: (form) => (form.asset?.default ? APIService.getPokemonModel(form.asset.default) : undefined),
    officialImage: APIService.getPokeOfficialArtwork(selection.num),
    hybridImage: APIService.getPokeFullSprite(selection.num, convertPokemonImageName(String(selection.form))),
    fullAssetImage: APIService.getPokeFullAsset(selection.num),
  });
