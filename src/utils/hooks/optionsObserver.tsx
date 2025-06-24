// Some React component
import { useEffect } from 'react';
import { updateCurrentOptions } from '../helpers/context.helpers';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { defaultOptions } from '../../contexts/options.context';

const optionsObserver = () => {
  const options = useSelector((state: StoreState) => state.store.data.options);

  useEffect(() => {
    updateCurrentOptions(options || defaultOptions);
  }, [options]);

  return null;
};

export default optionsObserver;
