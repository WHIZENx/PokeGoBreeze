import useDataStore from './useDataStore';
import { FormType } from '../utils/enums/compute.enum';
import { EqualMode, IncludeMode } from '../utils/enums/string.enum';
import { formNormal, formGmax, formMega } from '../utils/helpers/options-context.helpers';
import { isEqual, isInclude, isNotEmpty } from '../utils/extension';
import { useCallback } from 'react';
import { convertPokemonAPIDataFormName } from '../utils/utils';
import { GenderType } from '../core/enums/asset.enum';
import { IImage } from '../core/models/asset.model';

const genderRank = (gender: GenderType | undefined) =>
  gender === GenderType.Male ? 0 : gender === GenderType.GenderLess ? 1 : 2;

const selectAssetForm = (images: IImage[], formName: string) => {
  const candidates = images.filter((image) => isEqual(formName, image.form, EqualMode.IgnoreCaseSensitive));
  const selected = candidates
    .filter((image) => image.default.endsWith('.icon') && !image.default.endsWith('.s.icon'))
    .sort((left, right) => genderRank(left.gender) - genderRank(right.gender))[0];
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

  const getAssetNameById = (
    id: number | undefined,
    name: string | undefined | null,
    formName: string | undefined | null,
    formType = FormType.Default
  ) => {
    const formAsset = convertPokemonAPIDataFormName(formName, name);
    return findAssetForm(id, formAsset, formType);
  };

  const findAssetForm = (id: number | undefined, formName = formNormal(), formType = FormType.Default) => {
    if (isEqual(formName, formGmax(), EqualMode.IgnoreCaseSensitive)) {
      return;
    }
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
  };

  const queryAssetForm = (id: number | undefined, formName = formNormal()) => {
    const pokemonAssets = findAssetsById(id);
    if (!pokemonAssets) {
      return;
    }
    formName = formName.replaceAll('-', '_');
    const asset = selectAssetForm(pokemonAssets.image, formName);
    if (asset) {
      return asset;
    } else if (
      isNotEmpty(pokemonAssets.image) &&
      !isInclude(formName, formMega(), IncludeMode.IncludeIgnoreCaseSensitive)
    ) {
      const formOrigin = selectAssetForm(pokemonAssets.image, formNormal());
      if (!formOrigin) {
        return pokemonAssets.image[0];
      }
      return formOrigin;
    }
    return;
  };

  return {
    findAssetsById,
    findAssetForm,
    queryAssetForm,
    getAssetNameById,
  };
};

export default useAssets;
