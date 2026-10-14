import Bug from './types/POKEMON_TYPE_BUG.png?no-inline';
import Dark from './types/POKEMON_TYPE_DARK.png?no-inline';
import Dragon from './types/POKEMON_TYPE_DRAGON.png?no-inline';
import Electric from './types/POKEMON_TYPE_ELECTRIC.png?no-inline';
import Fairy from './types/POKEMON_TYPE_FAIRY.png?no-inline';
import Fighting from './types/POKEMON_TYPE_FIGHTING.png?no-inline';
import Fire from './types/POKEMON_TYPE_FIRE.png?no-inline';
import Flying from './types/POKEMON_TYPE_FLYING.png?no-inline';
import Ghost from './types/POKEMON_TYPE_GHOST.png?no-inline';
import Grass from './types/POKEMON_TYPE_GRASS.png?no-inline';
import Ground from './types/POKEMON_TYPE_GROUND.png?no-inline';
import Ice from './types/POKEMON_TYPE_ICE.png?no-inline';
import Normal from './types/POKEMON_TYPE_NORMAL.png?no-inline';
import Poison from './types/POKEMON_TYPE_POISON.png?no-inline';
import Psychic from './types/POKEMON_TYPE_PSYCHIC.png?no-inline';
import Rock from './types/POKEMON_TYPE_ROCK.png?no-inline';
import Steel from './types/POKEMON_TYPE_STEEL.png?no-inline';
import Water from './types/POKEMON_TYPE_WATER.png?no-inline';
import HqBug from './generated/move-type-hq/Bug.png?no-inline';
import HqDark from './generated/move-type-hq/Dark.png?no-inline';
import HqDragon from './generated/move-type-hq/Dragon.png?no-inline';
import HqElectric from './generated/move-type-hq/Electric.png?no-inline';
import HqFairy from './generated/move-type-hq/Fairy.png?no-inline';
import HqFighting from './generated/move-type-hq/Fighting.png?no-inline';
import HqFire from './generated/move-type-hq/Fire.png?no-inline';
import HqFlying from './generated/move-type-hq/Flying.png?no-inline';
import HqGhost from './generated/move-type-hq/Ghost.png?no-inline';
import HqGrass from './generated/move-type-hq/Grass.png?no-inline';
import HqGround from './generated/move-type-hq/Ground.png?no-inline';
import HqIce from './generated/move-type-hq/Ice.png?no-inline';
import HqNormal from './generated/move-type-hq/Normal.png?no-inline';
import HqPoison from './generated/move-type-hq/Poison.png?no-inline';
import HqPsychic from './generated/move-type-hq/Psychic.png?no-inline';
import HqRock from './generated/move-type-hq/Rock.png?no-inline';
import HqSteel from './generated/move-type-hq/Steel.png?no-inline';
import HqWater from './generated/move-type-hq/Water.png?no-inline';
import MaskBug from './generated/move-type-mask/bug.png?no-inline';
import MaskDark from './generated/move-type-mask/dark.png?no-inline';
import MaskDragon from './generated/move-type-mask/dragon.png?no-inline';
import MaskElectric from './generated/move-type-mask/electric.png?no-inline';
import MaskFairy from './generated/move-type-mask/fairy.png?no-inline';
import MaskFighting from './generated/move-type-mask/fighting.png?no-inline';
import MaskFire from './generated/move-type-mask/fire.png?no-inline';
import MaskFlying from './generated/move-type-mask/flying.png?no-inline';
import MaskGhost from './generated/move-type-mask/ghost.png?no-inline';
import MaskGrass from './generated/move-type-mask/grass.png?no-inline';
import MaskGround from './generated/move-type-mask/ground.png?no-inline';
import MaskIce from './generated/move-type-mask/ice.png?no-inline';
import MaskNormal from './generated/move-type-mask/normal.png?no-inline';
import MaskPoison from './generated/move-type-mask/poison.png?no-inline';
import MaskPsychic from './generated/move-type-mask/psychic.png?no-inline';
import MaskRock from './generated/move-type-mask/rock.png?no-inline';
import MaskSteel from './generated/move-type-mask/steel.png?no-inline';
import MaskWater from './generated/move-type-mask/water.png?no-inline';
import UnknownPokemon from './error.png?no-inline';
import BuddyCrown from './generated/pokemon-go-ui/buddyCrown.png?no-inline';
import ChargedMove from './generated/pokemon-go-ui/chargedMove.png?no-inline';
import FastMove from './generated/pokemon-go-ui/fastMove.png?no-inline';
import GenderFemale from './generated/pokemon-go-ui/genderFemale.png?no-inline';
import GenderMale from './generated/pokemon-go-ui/genderMale.png?no-inline';
import Purified from './generated/pokemon-go-ui/purified.png?no-inline';
import Shadow from './generated/pokemon-go-ui/shadow.png?no-inline';
import Shiny from './generated/pokemon-go-ui/shiny.png?no-inline';
import Stardust from './generated/pokemon-go-ui/stardust.png?no-inline';

const typeIcons: Record<string, string> = {
  bug: Bug,
  dark: Dark,
  dragon: Dragon,
  electric: Electric,
  fairy: Fairy,
  fighting: Fighting,
  fire: Fire,
  flying: Flying,
  ghost: Ghost,
  grass: Grass,
  ground: Ground,
  ice: Ice,
  normal: Normal,
  poison: Poison,
  psychic: Psychic,
  rock: Rock,
  steel: Steel,
  water: Water,
};

const hqTypeIcons: Record<string, string> = {
  bug: HqBug,
  dark: HqDark,
  dragon: HqDragon,
  electric: HqElectric,
  fairy: HqFairy,
  fighting: HqFighting,
  fire: HqFire,
  flying: HqFlying,
  ghost: HqGhost,
  grass: HqGrass,
  ground: HqGround,
  ice: HqIce,
  normal: HqNormal,
  poison: HqPoison,
  psychic: HqPsychic,
  rock: HqRock,
  steel: HqSteel,
  water: HqWater,
};

const typeMaskIcons: Record<string, string> = {
  bug: MaskBug,
  dark: MaskDark,
  dragon: MaskDragon,
  electric: MaskElectric,
  fairy: MaskFairy,
  fighting: MaskFighting,
  fire: MaskFire,
  flying: MaskFlying,
  ghost: MaskGhost,
  grass: MaskGrass,
  ground: MaskGround,
  ice: MaskIce,
  normal: MaskNormal,
  poison: MaskPoison,
  psychic: MaskPsychic,
  rock: MaskRock,
  steel: MaskSteel,
  water: MaskWater,
};

const itemIcons: Record<string, string> = {
  Item_1201: FastMove,
  Item_1202: ChargedMove,
  stardust_painted: Stardust,
};

const genderIcons: Record<string, string> = {
  female: GenderFemale,
  male: GenderMale,
};

export const LocalPokemonGoUi = {
  buddyCrown: BuddyCrown,
  placeholder: UnknownPokemon,
  purified: Purified,
  shadow: Shadow,
  shiny: Shiny,
};
export const getLocalTypeIcon = (type?: string | null) => typeIcons[type?.trim().toLowerCase() ?? ''];
export const getLocalHqTypeIcon = (type?: string | null) => hqTypeIcons[type?.trim().toLowerCase() ?? ''];
export const getLocalTypeMaskIcon = (type?: string | null) => typeMaskIcons[type?.trim().toLowerCase() ?? ''];
export const getLocalItemIcon = (item?: string | null) => itemIcons[item ?? ''];
export const getLocalGenderIcon = (gender?: string | null) => genderIcons[gender?.trim().toLowerCase() ?? ''];
