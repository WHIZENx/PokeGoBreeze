// Some React component
import { useEffect } from 'react';
import { updateCurrentOptions } from '../helpers/options-context.helpers';
import { defaultOptions } from '../../contexts/options.context';
import useDataStore from '../../composables/useDataStore';

const useOptionsObserver = () => {
  const { optionsData } = useDataStore();

  useEffect(() => {
    updateCurrentOptions(optionsData || defaultOptions);
  }, [optionsData]);

  return null;
};

export default useOptionsObserver;
