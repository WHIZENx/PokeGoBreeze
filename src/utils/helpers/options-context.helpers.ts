import { defaultOptions } from '../../contexts/options.context';
import { IOptions } from '../../core/models/options.model';
import { ThrowType } from '../../enums/type.enum';
import { IConfig } from '../../core/models/options.model';
import { getValuesObj } from '../utils';
import { WeatherBoost } from '../../core/models/weather-boost.model';
import { isNotEmpty } from '../extension';
import { TypeModel } from '../../core/models/type.model';
import { TypeEffectiveModel } from '../../core/models/type-effective.model';

if (!process.env.REACT_APP_CONFIG) {
  throw new Error('Missing config environment variable');
}

const config = JSON.parse(process.env.REACT_APP_CONFIG) as IConfig;

// This variable will store the latest options from the context
let currentOptions = defaultOptions;
currentOptions.config = config;

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

// Type settings
export const getTypes = () =>
  isNotEmpty(currentOptions.types) ? currentOptions.types : (getValuesObj(new TypeModel(), 1) as unknown as string[]);

// Weather types
export const getWeatherTypes = () =>
  isNotEmpty(currentOptions.weatherTypes)
    ? currentOptions.weatherTypes
    : (getValuesObj(new WeatherBoost(), 1) as unknown as string[]);

// Type effective
export const getTypeEffective = () => currentOptions.typeEffective || new TypeEffectiveModel();

// Weather boost
export const getWeatherBoost = () => currentOptions.weatherBoost || new WeatherBoost();

// Config
export const getConfig = () => currentOptions.config;
export const battleDelay = () => currentOptions.config.battleDelay;
export const lightThemeBg = () => currentOptions.config.lightThemeBg;
export const darkThemeBg = () => currentOptions.config.darkThemeBg;
export const persistKey = () => currentOptions.config.persistKey;
export const persistTimeout = () => currentOptions.config.persistTimeout;
export const loadDataDelay = () => currentOptions.config.loadDataDelay;
export const counterDelay = () => currentOptions.config.counterDelay;
export const statsDelay = () => currentOptions.config.statsDelay;
export const keyEnter = () => currentOptions.config.keyEnter;
export const keyLeft = () => currentOptions.config.keyLeft;
export const keyUp = () => currentOptions.config.keyUp;
export const keyRight = () => currentOptions.config.keyRight;
export const keyDown = () => currentOptions.config.keyDown;
export const syncMsg = () => currentOptions.config.syncMsg;
export const pathAssetPokeGo = () => currentOptions.config.pathAssetPokeGo;
export const defaultSpriteName = () => currentOptions.config.defaultSpriteName;
export const transitionTime = () => currentOptions.config.transitionTime;
export const formNormal = () => currentOptions.config.formNormal;
export const formSpecial = () => currentOptions.config.formSpecial;
export const formShadow = () => currentOptions.config.formShadow;
export const formPurified = () => currentOptions.config.formPurified;
export const formMega = () => currentOptions.config.formMega;
export const formGmax = () => currentOptions.config.formGmax;
export const formPrimal = () => currentOptions.config.formPrimal;
export const formAlola = () => currentOptions.config.formAlola;
export const formHisui = () => currentOptions.config.formHisui;
export const formGalar = () => currentOptions.config.formGalar;
export const formGalarian = () => currentOptions.config.formGalarian;
export const formHisuian = () => currentOptions.config.formHisuian;
export const formAlolan = () => currentOptions.config.formAlolan;
export const formHero = () => currentOptions.config.formHero;
export const formStandard = () => currentOptions.config.formStandard;
export const formIncarnate = () => currentOptions.config.formIncarnate;
export const formArmor = () => currentOptions.config.formArmor;
export const formMegaX = () => currentOptions.config.formMegaX;
export const formMegaY = () => currentOptions.config.formMegaY;
export const classLegendary = () => currentOptions.config.classLegendary;
export const classMythic = () => currentOptions.config.classMythic;
export const classUltraBeast = () => currentOptions.config.classUltraBeast;
export const defaultSheetPage = () => currentOptions.config.defaultSheetPage;
export const defaultSheetRow = () => currentOptions.config.defaultSheetRow;
export const defaultPokemonDefObj = () => currentOptions.config.defaultPokemonDefObj;
export const defaultPokemonShadow = () => currentOptions.config.defaultPokemonShadow;
export const defaultTrainerFriend = () => currentOptions.config.defaultTrainerFriend;
export const defaultWeatherBoosts = () => currentOptions.config.defaultWeatherBoosts;
export const defaultPokemonFriendLevel = () => currentOptions.config.defaultPokemonFriendLevel;
export const defaultPokemonLevel = () => currentOptions.config.defaultPokemonLevel;
export const defaultEnergyPerHpLost = () => currentOptions.config.defaultEnergyPerHpLost;
export const defaultDamageMultiply = () => currentOptions.config.defaultDamageMultiply;
export const defaultDamageConst = () => currentOptions.config.defaultDamageConst;
export const defaultEnemyAtkDelay = () => currentOptions.config.defaultEnemyAtkDelay;
export const defaultTrainerMultiply = () => currentOptions.config.defaultTrainerMultiply;
export const defaultMegaMultiply = () => currentOptions.config.defaultMegaMultiply;
export const curveIncChance = () => currentOptions.config.curveIncChance;
export const platinumIncChance = () => currentOptions.config.platinumIncChance;
export const goldIncChance = () => currentOptions.config.goldIncChance;
export const silverIncChance = () => currentOptions.config.silverIncChance;
export const bronzeIncChance = () => currentOptions.config.bronzeIncChance;
export const pokeBallIncChance = () => currentOptions.config.pokeBallIncChance;
export const greatBallIncChance = () => currentOptions.config.greatBallIncChance;
export const ultraBallIncChance = () => currentOptions.config.ultraBallIncChance;
export const razzBerryIncChance = () => currentOptions.config.razzBerryIncChance;
export const silverPinapsIncChance = () => currentOptions.config.silverPinapsIncChance;
export const goldRazzBerryIncChance = () => currentOptions.config.goldRazzBerryIncChance;
export const normalThrowIncChance = () => currentOptions.config.normalThrowIncChance;
export const niceThrowIncChance = () => currentOptions.config.niceThrowIncChance;
export const greatThrowIncChance = () => currentOptions.config.greatThrowIncChance;
export const excellentThrowIncChance = () => currentOptions.config.excellentThrowIncChance;
export const minCp = () => currentOptions.config.minCp;
export const cpDiffRatio = () => currentOptions.config.cpDiffRatio;
export const minLevel = () => currentOptions.config.minLevel;
export const maxLevel = () => currentOptions.config.maxLevel;
export const stepLevel = () => currentOptions.config.stepLevel;
export const minIv = () => currentOptions.config.minIv;
export const maxIv = () => currentOptions.config.maxIv;
export const defaultSize = () => currentOptions.config.defaultSize;
export const defaultPlusSize = () => currentOptions.config.defaultPlusSize;
export const defaultAmount = () => currentOptions.config.defaultAmount;
export const defaultBlock = () => currentOptions.config.defaultBlock;
