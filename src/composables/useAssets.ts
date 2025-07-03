import useDataStore from './useDataStore';
import { FormType } from '../utils/enums/compute.enum';
import { EqualMode, IncludeMode } from '../utils/enums/string.enum';
import { formNormal, formGmax, formMega } from '../utils/helpers/options-context.helpers';
import { isEqual, isInclude, isNotEmpty } from '../utils/extension';
import { useCallback } from 'react';
import { convertPokemonAPIDataFormName } from '../utils/utils';

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
    formName: string | undefined | null
  ) => {
    const formAsset = convertPokemonAPIDataFormName(formName, name);
    return findAssetForm(id, formAsset);
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
    const asset = pokemonAssets.image.find((img) => isEqual(formName, img.form, EqualMode.IgnoreCaseSensitive));
    if (asset) {
      return asset;
    } else if (
      isNotEmpty(pokemonAssets.image) &&
      !isInclude(formName, formMega(), IncludeMode.IncludeIgnoreCaseSensitive)
    ) {
      const formOrigin = pokemonAssets.image.find((img) => img.form === formNormal());
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
