const ITEM_SPRITE_MAP: Partial<Record<string, string>> = {
  ITEM_FREE_RAID_TICKET: 'Item_1401',
  ITEM_RARE_CANDY: 'Item_1301',
  ITEM_XL_RARE_CANDY: 'RareXLCandy_PSD',
  ITEM_POKE_BALL: 'pokeball_sprite',
  ITEM_GREAT_BALL: 'greatball_sprite',
  ITEM_ULTRA_BALL: 'ultraball_sprite',
  ITEM_MASTER_BALL: 'masterball_sprite',
  ITEM_RAZZ_BERRY: 'Item_0701',
  ITEM_NANAB_BERRY: 'Item_0703',
  ITEM_PINAP_BERRY: 'Item_0705',
  ITEM_GOLDEN_PINAP_BERRY: 'Item_0707',
  ITEM_LUCKY_EGG: 'luckyegg',
  ITEM_LEADER_MAP: 'Item_Leader_MapCompass',
  ITEM_MOVE_REROLL_OTHER_SPECIAL_ATTACK_A: 'Item_Meteorite',
  ITEM_MP: 'mp_pack',
};

const ITEM_INCLUDE_SPRITES: [string, string][] = [
  ['ITEM_PAID_RAID_TICKET', 'Item_1402'],
  ['ITEM_STAR_PIECE', 'starpiece'],
  ['ITEM_POFFIN', 'Item_0704'],
  ['ITEM_MOVE_REROLL_ELITE_FAST_ATTACK', 'Item_1203'],
  ['ITEM_MOVE_REROLL_ELITE_SPECIAL_ATTACK', 'Item_1204'],
  ['ITEM_INCUBATOR_BASIC', 'EggIncubatorIAP_Empty'],
  ['ITEM_INCUBATOR_SUPER', 'EggIncubatorSuper_Empty'],
  ['ITEM_INCENSE_ORDINARY', 'Incense_0'],
  ['ITEM_POTION', 'Item_0101'],
  ['ITEM_SUPER_POTION', 'Item_0102'],
  ['ITEM_HYPER_POTION', 'Item_0103'],
  ['ITEM_MAX_POTION', 'Item_0104'],
  ['ITEM_REVIVE', 'Item_0201'],
  ['ITEM_MAX_REVIVE', 'Item_0202'],
];

export const getItemSpriteAssetName = (itemName: string | null | undefined) => {
  if (!itemName) {
    return undefined;
  }
  return ITEM_SPRITE_MAP[itemName] ?? ITEM_INCLUDE_SPRITES.find(([key]) => itemName.includes(key))?.[1];
};
