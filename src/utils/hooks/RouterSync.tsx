import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import useRouter from '../../composables/useRouter';

const RouterSync = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const { locationChange } = useRouter();

  useEffect(() => {
    locationChange({
      location,
      action: navType,
    });
  }, [location, navType, locationChange]);

  return null;
};

export default RouterSync;
