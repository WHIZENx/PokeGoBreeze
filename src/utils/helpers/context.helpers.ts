import { defaultOptions } from '../../contexts/options.context';
import { IOptions } from '../../core/models/options.model';
import { ThrowType } from '../../enums/type.enum';
import { IConfig } from '../../core/models/options.model';

if (!process.env.REACT_APP_CONFIG) {
  throw new Error('Missing config environment variable');
}

const config = JSON.parse(process.env.REACT_APP_CONFIG) as IConfig;

// This variable will store the latest options from the context
let currentOptions = defaultOptions;

// Function to update the current options (called from a React component)
export const updateCurrentOptions = (newOptions: IOptions) => {
  newOptions.config = config;
  currentOptions = newOptions;
};

// Function to get the current options (can be called from any file)
export const getOptions = () => currentOptions;

// Battle options
export const getBattleOptions = () => currentOptions.battleOptions;
export const battleStab = () => currentOptions.battleOptions.stab;
export const enemyAttackInterval = () => currentOptions.battleOptions.enemyAttackInterval;
export const dodgeDamageReductionPercent = () => currentOptions.battleOptions.dodgeDamageReductionPercent;
export const battleShadowBonus = () => currentOptions.battleOptions.shadowBonus;
export const battleShadowBonusAtk = () => currentOptions.battleOptions.shadowBonus.atk;
export const battleShadowBonusDef = () => currentOptions.battleOptions.shadowBonus.def;
export const battlePurifiedBonus = () => currentOptions.battleOptions.purifiedBonus;
export const battlePurifiedBonusAtk = () => currentOptions.battleOptions.purifiedBonus.atk;
export const battlePurifiedBonusDef = () => currentOptions.battleOptions.purifiedBonus.def;
export const battleMaxEnergy = () => currentOptions.battleOptions.maxEnergy;

// Combat options
export const getCombatOptions = () => currentOptions.combatOptions;
export const combatStab = () => currentOptions.combatOptions.stab;
export const combatShadowBonus = () => currentOptions.combatOptions.shadowBonus;
export const combatShadowBonusAtk = () => currentOptions.combatOptions.shadowBonus.atk;
export const combatShadowBonusDef = () => currentOptions.combatOptions.shadowBonus.def;
export const combatPurifiedBonus = () => currentOptions.combatOptions.purifiedBonus;
export const combatPurifiedBonusAtk = () => currentOptions.combatOptions.purifiedBonus.atk;
export const combatPurifiedBonusDef = () => currentOptions.combatOptions.purifiedBonus.def;
export const combatMaxEnergy = () => currentOptions.combatOptions.maxEnergy;

// Throw charge options
export const getThrowCharge = () => currentOptions.throwCharge;
export const throwNormal = () => currentOptions.throwCharge.normal;
export const throwNice = () => currentOptions.throwCharge.nice;
export const throwGreat = () => currentOptions.throwCharge.great;
export const throwExcellent = () => currentOptions.throwCharge.excellent;
export const getMultiplyThrownByType = (type: ThrowType | undefined) => {
  switch (type) {
    case ThrowType.Nice:
      return throwNice();
    case ThrowType.Great:
      return throwGreat();
    case ThrowType.Excellent:
      return throwExcellent();
    default:
      return throwNormal();
  }
};

// Player settings
export const getPlayerSetting = () => currentOptions.playerSetting;
export const levelUps = () => currentOptions.playerSetting.levelUps;
export const cpMultipliers = () => currentOptions.playerSetting.cpMultipliers;
export const maxEncounterPlayerLevel = () => currentOptions.playerSetting.maxEncounterPlayerLevel;
export const maxQuestEncounterPlayerLevel = () => currentOptions.playerSetting.maxQuestEncounterPlayerLevel;

// Friendship settings
export const getBuddyFriendship = () => currentOptions.buddyFriendship;

// Trainer settings
export const getTrainerFriendship = () => currentOptions.trainerFriendship;
export const getMultiplyFriendship = (level = 1) => currentOptions.trainerFriendship[level.toString()]?.atkBonus || 1;

// Config
export const getConfig = () => currentOptions.config || config;
export const battleDelay = () => currentOptions.config?.battleDelay || config.battleDelay;
export const lightThemeBg = () => currentOptions.config?.lightThemeBg || config.lightThemeBg;
export const darkThemeBg = () => currentOptions.config?.darkThemeBg || config.darkThemeBg;
export const persistKey = () => currentOptions.config?.persistKey || config.persistKey;
export const persistTimeout = () => currentOptions.config?.persistTimeout || config.persistTimeout;
export const loadDataDelay = () => currentOptions.config?.loadDataDelay || config.loadDataDelay;
export const counterDelay = () => currentOptions.config?.counterDelay || config.counterDelay;
export const statsDelay = () => currentOptions.config?.statsDelay || config.statsDelay;
export const keyEnter = () => currentOptions.config?.keyEnter || config.keyEnter;
export const keyLeft = () => currentOptions.config?.keyLeft || config.keyLeft;
export const keyUp = () => currentOptions.config?.keyUp || config.keyUp;
export const keyRight = () => currentOptions.config?.keyRight || config.keyRight;
export const keyDown = () => currentOptions.config?.keyDown || config.keyDown;
export const syncMsg = () => currentOptions.config?.syncMsg || config.syncMsg;
export const pathAssetPokeGo = () => currentOptions.config?.pathAssetPokeGo || config.pathAssetPokeGo;
export const defaultSpriteName = () => currentOptions.config?.defaultSpriteName || config.defaultSpriteName;
export const transitionTime = () => currentOptions.config?.transitionTime || config.transitionTime;
export const formNormal = () => currentOptions.config?.formNormal || config.formNormal;
export const formSpecial = () => currentOptions.config?.formSpecial || config.formSpecial;
export const formShadow = () => currentOptions.config?.formShadow || config.formShadow;
export const formPurified = () => currentOptions.config?.formPurified || config.formPurified;
export const formMega = () => currentOptions.config?.formMega || config.formMega;
export const formGmax = () => currentOptions.config?.formGmax || config.formGmax;
export const formPrimal = () => currentOptions.config?.formPrimal || config.formPrimal;
export const formAlola = () => currentOptions.config?.formAlola || config.formAlola;
export const formHisui = () => currentOptions.config?.formHisui || config.formHisui;
export const formGalar = () => currentOptions.config?.formGalar || config.formGalar;
export const formGalarian = () => currentOptions.config?.formGalarian || config.formGalarian;
export const formHisuian = () => currentOptions.config?.formHisuian || config.formHisuian;
export const formAlolan = () => currentOptions.config?.formAlolan || config.formAlolan;
export const formHero = () => currentOptions.config?.formHero || config.formHero;
export const formStandard = () => currentOptions.config?.formStandard || config.formStandard;
export const formIncarnate = () => currentOptions.config?.formIncarnate || config.formIncarnate;
export const formArmor = () => currentOptions.config?.formArmor || config.formArmor;
export const formMegaX = () => currentOptions.config?.formMegaX || config.formMegaX;
export const formMegaY = () => currentOptions.config?.formMegaY || config.formMegaY;
export const classLegendary = () => currentOptions.config?.classLegendary || config.classLegendary;
export const classMythic = () => currentOptions.config?.classMythic || config.classMythic;
export const classUltraBeast = () => currentOptions.config?.classUltraBeast || config.classUltraBeast;
export const defaultSheetPage = () => currentOptions.config?.defaultSheetPage || config.defaultSheetPage;
export const defaultSheetRow = () => currentOptions.config?.defaultSheetRow || config.defaultSheetRow;
export const defaultPokemonDefObj = () => currentOptions.config?.defaultPokemonDefObj || config.defaultPokemonDefObj;
export const defaultPokemonShadow = () => currentOptions.config?.defaultPokemonShadow || config.defaultPokemonShadow;
export const defaultTrainerFriend = () => currentOptions.config?.defaultTrainerFriend || config.defaultTrainerFriend;
export const defaultWeatherBoosts = () => currentOptions.config?.defaultWeatherBoosts || config.defaultWeatherBoosts;
export const defaultPokemonFriendLevel = () =>
  currentOptions.config?.defaultPokemonFriendLevel || config.defaultPokemonFriendLevel;
export const defaultPokemonLevel = () => currentOptions.config?.defaultPokemonLevel || config.defaultPokemonLevel;
export const defaultEnergyPerHpLost = () =>
  currentOptions.config?.defaultEnergyPerHpLost || config.defaultEnergyPerHpLost;
export const defaultDamageMultiply = () => currentOptions.config?.defaultDamageMultiply || config.defaultDamageMultiply;
export const defaultDamageConst = () => currentOptions.config?.defaultDamageConst || config.defaultDamageConst;
export const defaultEnemyAtkDelay = () => currentOptions.config?.defaultEnemyAtkDelay || config.defaultEnemyAtkDelay;
export const defaultTrainerMultiply = () =>
  currentOptions.config?.defaultTrainerMultiply || config.defaultTrainerMultiply;
export const defaultMegaMultiply = () => currentOptions.config?.defaultMegaMultiply || config.defaultMegaMultiply;
export const curveIncChance = () => currentOptions.config?.curveIncChance || config.curveIncChance;
export const platinumIncChance = () => currentOptions.config?.platinumIncChance || config.platinumIncChance;
export const goldIncChance = () => currentOptions.config?.goldIncChance || config.goldIncChance;
export const silverIncChance = () => currentOptions.config?.silverIncChance || config.silverIncChance;
export const bronzeIncChance = () => currentOptions.config?.bronzeIncChance || config.bronzeIncChance;
export const pokeBallIncChance = () => currentOptions.config?.pokeBallIncChance || config.pokeBallIncChance;
export const greatBallIncChance = () => currentOptions.config?.greatBallIncChance || config.greatBallIncChance;
export const ultraBallIncChance = () => currentOptions.config?.ultraBallIncChance || config.ultraBallIncChance;
export const razzBerryIncChance = () => currentOptions.config?.razzBerryIncChance || config.razzBerryIncChance;
export const silverPinapsIncChance = () => currentOptions.config?.silverPinapsIncChance || config.silverPinapsIncChance;
export const goldRazzBerryIncChance = () =>
  currentOptions.config?.goldRazzBerryIncChance || config.goldRazzBerryIncChance;
export const normalThrowIncChance = () => currentOptions.config?.normalThrowIncChance || config.normalThrowIncChance;
export const niceThrowIncChance = () => currentOptions.config?.niceThrowIncChance || config.niceThrowIncChance;
export const greatThrowIncChance = () => currentOptions.config?.greatThrowIncChance || config.greatThrowIncChance;
export const excellentThrowIncChance = () =>
  currentOptions.config?.excellentThrowIncChance || config.excellentThrowIncChance;
export const minCp = () => currentOptions.config?.minCp || config.minCp;
export const cpDiffRatio = () => currentOptions.config?.cpDiffRatio || config.cpDiffRatio;
export const minLevel = () => currentOptions.config?.minLevel || config.minLevel;
export const maxLevel = () => currentOptions.config?.maxLevel || config.maxLevel;
export const minIv = () => currentOptions.config?.minIv || config.minIv;
export const maxIv = () => currentOptions.config?.maxIv || config.maxIv;
export const defaultSize = () => currentOptions.config?.defaultSize || config.defaultSize;
export const defaultPlusSize = () => currentOptions.config?.defaultPlusSize || config.defaultPlusSize;
export const defaultAmount = () => currentOptions.config?.defaultAmount || config.defaultAmount;
export const defaultBlock = () => currentOptions.config?.defaultBlock || config.defaultBlock;
