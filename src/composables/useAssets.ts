import useDataStore from './useDataStore';
import { FormType } from '../utils/enums/compute.enum';
import { IncludeMode } from '../utils/enums/string.enum';
import { formNormal, formMega } from '../utils/helpers/options-context.helpers';
import { isInclude, isNotEmpty } from '../utils/extension';
import { useCallback } from 'react';
import { convertPokemonAPIDataFormName } from '../utils/utils';
import { GenderType } from '../core/enums/asset.enum';
import { IImage } from '../core/models/asset.model';
import { PokemonType } from '../enums/type.enum';
import { selectAnimationForm } from '../utils/pokemon-animation-assets';

const genderRank = (gender: GenderType | undefined) =>
  gender === GenderType.Male ? 0 : gender === GenderType.GenderLess ? 1 : 2;

const costumeRank = (path: string) => (path.includes('.c') ? 1 : 0);

export const selectAssetForm = (images: IImage[], formName: string, assetName?: string) => {
  const normalizedForm = formName.replaceAll('-', '_').toUpperCase();
  const acceptedForms = new Set([normalizedForm]);
  if (assetName?.toUpperCase() === 'UNOWN' && !normalizedForm.startsWith('UNOWN_')) {
    acceptedForms.add(`UNOWN_${normalizedForm}`);
  }
  if (assetName?.toUpperCase() === 'SPINDA' && normalizedForm === 'NORMAL') {
    acceptedForms.add('00');
  }
  const candidates = images.filter((image) => acceptedForms.has(String(image.form ?? '').toUpperCase()));
  const selected = candidates
    .filter((image) => image.default.endsWith('.icon') && !image.default.endsWith('.s.icon'))
    .sort(
      (left, right) =>
        costumeRank(left.default) - costumeRank(right.default) || genderRank(left.gender) - genderRank(right.gender)
    )[0];
  if (!selected) {
    return;
  }
  const shiny = selected.shiny?.endsWith('.s.icon')
    ? selected.shiny
    : (candidates.find((image) => image.gender === selected.gender && image.default.endsWith('.s.icon'))?.default ??
      candidates.find((image) => image.default.endsWith('.s.icon'))?.default);
  return { ...selected, shiny };
};

export const useAssets = () => {
  const { assetsData } = useDataStore();

  const findAssetsById = useCallback(
    (id: number | undefined) => {
      return assetsData.find((asset) => asset.id === id);
    },
    [assetsData]
  );

  const queryAssetForm = useCallback(
    (id: number | undefined, formName = formNormal()) => {
      const pokemonAssets = findAssetsById(id);
      if (!pokemonAssets) {
        return;
      }
      formName = formName.replaceAll('-', '_');
      const asset = selectAssetForm(pokemonAssets.image, formName, pokemonAssets.name);
      if (asset) {
        return asset;
      } else if (
        isNotEmpty(pokemonAssets.image) &&
        !isInclude(formName, formMega(), IncludeMode.IncludeIgnoreCaseSensitive)
      ) {
        const formOrigin = selectAssetForm(pokemonAssets.image, formNormal(), pokemonAssets.name);
        if (!formOrigin) {
          return;
        }
        return formOrigin;
      }
      return;
    },
    [findAssetsById]
  );

  const queryExactAssetForm = useCallback(
    (id: number | undefined, formName = formNormal()) => {
      const pokemonAssets = findAssetsById(id);
      if (!pokemonAssets) {
        return;
      }
      return selectAssetForm(pokemonAssets.image, formName.replaceAll('-', '_'), pokemonAssets.name);
    },
    [findAssetsById]
  );

  const findAssetForm = useCallback(
    (id: number | undefined, formName = formNormal(), formType = FormType.Default) => {
      const form = queryAssetForm(id, formName);
      if (form) {
        switch (formType) {
          case FormType.Shiny:
            return form.shiny;
          case FormType.Default:
          default:
            return form.default;
        }
      }
      return;
    },
    [queryAssetForm]
  );

  const findExactAssetForm = useCallback(
    (id: number | undefined, formName = formNormal(), formType = FormType.Default) => {
      const form = queryExactAssetForm(id, formName);
      if (!form) {
        return;
      }
      return formType === FormType.Shiny ? form.shiny : form.default;
    },
    [queryExactAssetForm]
  );

  const findAnimationForm = useCallback(
    (id: number | undefined, formName = formNormal(), pokemonType = PokemonType.Normal) => {
      const pokemonAssets = findAssetsById(id);
      if (!pokemonAssets?.animation) {
        return;
      }
      return selectAnimationForm(pokemonAssets.animation, formName, pokemonType);
    },
    [findAssetsById]
  );

  const getAssetNameById = useCallback(
    (
      id: number | undefined,
      name: string | undefined | null,
      formName: string | undefined | null,
      formType = FormType.Default
    ) => {
      const formAsset = convertPokemonAPIDataFormName(formName, name);
      return findAssetForm(id, formAsset, formType);
    },
    [findAssetForm]
  );

  return {
    findAssetsById,
    findAssetForm,
    findExactAssetForm,
    findAnimationForm,
    queryAssetForm,
    getAssetNameById,
  };
};

export default useAssets;
