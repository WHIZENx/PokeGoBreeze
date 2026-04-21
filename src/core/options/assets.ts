import { Asset, CryPath, ImageModel } from '../models/asset.model';
import { PokemonType } from '../../enums/type.enum';
import { GenderType } from '../enums/asset.enum';
import { IPokemonData } from '../models/pokemon.model';
import { APITree } from '../../services/models/api.model';
import { isEqual, isInclude, isIncludeList, isNotEmpty, toNumber, UniqValueInArray } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import {
  formGmax,
  formMega,
  formMegaX,
  formMegaY,
  formNormal,
  formSpecial,
  pathAssetPokeGo,
  unownId,
} from '../../utils/helpers/options-context.helpers';
import { convertAndReplaceNameGO } from './_shared';

const processAssetData = (data: APITree, extension: string) =>
  data.tree
    .filter((item) => !isEqual(item.path, pathAssetPokeGo()))
    .map((item) => item.path.replace(extension, '').replace(pathAssetPokeGo(), ''));

export const optionPokeImg = (data: APITree) => processAssetData(data, '.png');
export const optionPokeSound = (data: APITree) => processAssetData(data, '.wav');

// Form Unown encodes its letter in the form string, so we skip the standard conversion.
const applyFormConversion = (form: string, id: number, name: string) =>
  id !== unownId() ? convertAndReplaceNameGO(form, name) : form;

const paddedId3 = (id: number) => id.toString().padStart(3, '0');
const paddedId4 = (id: number) => id.toString().padStart(4, '0');

const resolvePrimaryIconForm = (raw: string | undefined): string => {
  if (!raw) {
    return formNormal();
  }
  if (isInclude(raw, 'GIGANTAMAX', IncludeMode.IncludeIgnoreCaseSensitive)) {
    return formGmax();
  }
  if (isEqual(raw, 'icon') || isEqual(raw, 'g2')) {
    return formNormal();
  }
  return raw.replace('_NOEVOLVE', '').replace(/[a-z]/g, '');
};

const resolveGender = (current: string, formSet: string[]): GenderType => {
  const base = current.replace('.icon', '');
  if (!isInclude(current, '.g2.') && isIncludeList(formSet, `${base}.g2.icon`)) {
    return GenderType.Male;
  }
  if (isInclude(current, '.g2.')) {
    return GenderType.Female;
  }
  return GenderType.GenderLess;
};

const collectPrimaryIcons = (result: Asset, imgs: string[]) => {
  const formSet = imgs.filter((img) => isInclude(img, `/pm${result.id}.`) && !isInclude(img, 'cry'));
  let count = 0;
  while (formSet.length > count) {
    const [, rawForm] = formSet[count].split('.');
    let form = resolvePrimaryIconForm(rawForm);
    const gender = resolveGender(formSet[count], formSet);
    const isShiny = isIncludeList(formSet, `${formSet[count].replace('.icon', '')}.s.icon`);
    form = applyFormConversion(form, result.id, result.name);
    result.image.push(
      new ImageModel({
        gender,
        pokemonId: result.id,
        form,
        default: formSet[count],
        shiny: isShiny ? formSet[count + 1] : undefined,
      })
    );
    count += Number(isShiny) + 1;
  }
};

const collectMegaIcons = (result: Asset, imgs: string[]) => {
  const pad = paddedId3(result.id);
  const formSet = imgs.filter(
    (img) =>
      !isInclude(img, '/') && (isInclude(img, `pokemon_icon_${pad}_51`) || isInclude(img, `pokemon_icon_${pad}_52`))
  );
  if (
    isIncludeList(
      result.image.map((i) => i.pokemonType),
      PokemonType.Mega
    )
  ) {
    return;
  }
  for (let index = 0; index < formSet.length; index += 2) {
    const form = formSet.length === 2 ? formMega() : isInclude(formSet[index], '_51') ? formMegaX() : formMegaY();
    result.image.push(
      new ImageModel({
        gender: GenderType.GenderLess,
        pokemonId: result.id,
        form,
        default: formSet[index],
        shiny: formSet[index + 1],
      })
    );
  }
};

const collectSuffixFormIcons = (result: Asset, imgs: string[], formList: (string | undefined)[]) => {
  const formSet = imgs.filter(
    (img) => !isInclude(img, '/') && isInclude(img, `pokemon_icon_pm${paddedId4(result.id)}`)
  );
  for (let index = 0; index < formSet.length; index += 2) {
    const subForm = formSet[index].replace('_shiny', '').split('_');
    const rawForm = subForm[subForm.length - 1].toUpperCase();
    const form = applyFormConversion(rawForm, result.id, result.name);
    if (!isIncludeList(formList, form)) {
      formList.push(form);
      result.image.push(
        new ImageModel({
          gender: GenderType.GenderLess,
          pokemonId: result.id,
          form,
          default: formSet[index],
          shiny: formSet[index + 1],
        })
      );
    }
  }
};

const collectFallbackNormalIcons = (result: Asset, imgs: string[], formList: (string | undefined)[]) => {
  if (isNotEmpty(result.image)) {
    return;
  }

  const formSet = imgs.filter((img) => !isInclude(img, '/') && isInclude(img, `pokemon_icon_${paddedId3(result.id)}`));
  for (let index = 0; index < formSet.length; index += 2) {
    const form = applyFormConversion(formNormal(), result.id, result.name);
    if (!isIncludeList(formList, form)) {
      formList.push(form);
      result.image.push(
        new ImageModel({
          gender: GenderType.GenderLess,
          pokemonId: result.id,
          form,
          default: formSet[index],
          shiny: formSet[index + 1],
        })
      );
    }
  }
};

const collectPrimaryCries = (result: Asset, sounds: string[]) => {
  const soundForm = sounds.filter((sound) => isInclude(sound, `/pm${result.id}.`) && isInclude(sound, 'cry'));
  result.sound.cry = soundForm.map((sound) => {
    const [, rawForm] = sound.split('.');
    const form = isEqual(rawForm, 'cry') ? formNormal() : rawForm.replace(/[a-z]/g, '');
    return new CryPath({ form, path: sound });
  });
};

const collectMegaCries = (result: Asset, sounds: string[]) => {
  const pad = paddedId3(result.id);
  const soundForm = sounds.filter(
    (sound) => !isInclude(sound, '/') && (isInclude(sound, `pv${pad}_51`) || isInclude(sound, `pv${pad}_52`))
  );
  if (
    isIncludeList(
      result.sound.cry.map((i) => i.pokemonType),
      PokemonType.Mega
    )
  ) {
    return;
  }
  soundForm.forEach((sound) => {
    result.sound.cry.push(
      new CryPath({
        form: soundForm.length !== 2 ? formMega() : isInclude(sound, '_51') ? formMegaX() : formMegaY(),
        path: sound,
      })
    );
  });
};

const collectFallbackCries = (result: Asset, sounds: string[]) => {
  const soundForm = sounds.filter((sound) => !isInclude(sound, '/') && isInclude(sound, `pv${paddedId3(result.id)}`));
  if (isNotEmpty(result.sound.cry)) {
    return;
  }
  soundForm.forEach((sound) => {
    result.sound.cry.push(
      new CryPath({
        form: isInclude(sound, '_31') ? formSpecial() : formNormal(),
        path: sound,
      })
    );
  });
};

export const optionAssets = (pokemon: IPokemonData[], imgs: string[], sounds: string[]) => {
  const family = UniqValueInArray(pokemon.map((item) => item.pokemonId));
  return family.map((item) => {
    const result = new Asset();
    result.id = toNumber(pokemon.find((poke) => isEqual(poke.pokemonId, item))?.num);
    result.name = item.toString();

    collectPrimaryIcons(result, imgs);
    collectMegaIcons(result, imgs);

    const formList = result.image.map((img) => img.form?.replaceAll('_', ''));
    collectSuffixFormIcons(result, imgs, formList);
    collectFallbackNormalIcons(result, imgs, formList);

    collectPrimaryCries(result, sounds);
    collectMegaCries(result, sounds);
    collectFallbackCries(result, sounds);

    return result;
  });
};
