export enum ItemLureType {
  Magnetic = 'ITEM_TROY_DISK_MAGNETIC',
  Mossy = 'ITEM_TROY_DISK_MOSSY',
  Glacial = 'ITEM_TROY_DISK_GLACIAL',
  Rainy = 'ITEM_TROY_DISK_RAINY',
  Sparkly = 'ITEM_TROY_DISK_SPARKLY',
}

export enum ItemLureRequireType {
  Magnetic = 'magnetic',
  Mossy = 'moss',
  Glacial = 'glacial',
  Rainy = 'rainy',
  Sparkly = 'sparkly',
}

export enum ItemEvolutionType {
  SunStone = 'ITEM_SUN_STONE',
  KingsRock = 'ITEM_KINGS_ROCK',
  MetalCoat = 'ITEM_METAL_COAT',
  Gen4Stone = 'ITEM_GEN4_EVOLUTION_STONE',
  DragonScale = 'ITEM_DRAGON_SCALE',
  Upgrade = 'ITEM_UP_GRADE',
  Gen5Stone = 'ITEM_GEN5_EVOLUTION_STONE',
  OtherStone = 'ITEM_OTHER_EVOLUTION_STONE_A',
  Beans = 'ITEM_BEANS',
}

export enum ItemEvolutionRequireType {
  SunStone = 'Sun_Stone',
  KingsRock = "King's_Rock",
  MetalCoat = 'Metal_Coat',
  Gen4Stone = 'Sinnoh_Stone',
  DragonScale = 'Dragon_Scale',
  Upgrade = 'Up-Grade',
  Gen5Stone = 'Unova_Stone',
  OtherStone = 'Other_Stone_A',
  Beans = 'Beans',
}

export enum ConditionType {
  Throw = 'WITH_THROW_TYPE',
  Pokemon = 'WITH_POKEMON_TYPE',
  WinRaid = 'WITH_WIN_RAID_STATUS',
  PokemonBattle = 'WITH_OPPONENT_POKEMON_BATTLE_STATUS',
}

export enum QuestType {
  BuddyEarn = 'QUEST_BUDDY_EARN_AFFECTION_POINTS',
  BuddyFeed = 'QUEST_BUDDY_FEED',
  BuddyWalk = 'QUEST_BUDDY_EVOLUTION_WALK',
  UseIncense = 'QUEST_USE_INCENSE',
}

export enum LeagueConditionType {
  CaughtTime = 'POKEMON_CAUGHT_TIMESTAMP',
  UniquePokemon = 'WITH_UNIQUE_POKEMON',
  PokemonType = 'WITH_POKEMON_TYPE',
  PokemonLevelRange = 'POKEMON_LEVEL_RANGE',
  PokemonLimitCP = 'WITH_POKEMON_CP_LIMIT',
  WhiteList = 'POKEMON_WHITELIST',
  BanList = 'POKEMON_BANLIST',
}
