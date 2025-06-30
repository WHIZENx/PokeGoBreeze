import { useSelector } from 'react-redux';
import { StoreState } from '../store/models/state.model';
import { FormType } from '../utils/enums/compute.enum';
import { EqualMode, IncludeMode } from '../utils/enums/string.enum';
import { formNormal, formGmax, formMega } from '../utils/helpers/options-context.helpers';
import { isEqual, isInclude, isNotEmpty } from '../utils/extension';

/**
 * Custom hook to access and update the assets state from Redux store
 * This replaces direct usage of useSelector((state: StoreState) => state.store.data.assets)
 *
 * @returns The assets state and update methods
 */
export const useAssets = () => {
  const assetsData = useSelector((state: StoreState) => state.store.data.assets);

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
    const pokemonAssets = assetsData.find((asset) => asset.id === id);
    if (!pokemonAssets) {
      return;
    }
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
    findAssetForm,
    queryAssetForm,
  };
};

export default useAssets;
