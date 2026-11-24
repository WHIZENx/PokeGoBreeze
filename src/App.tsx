import { getApiErrorMessage } from './services/api-error';
import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { matchRoutes, Route, Routes, useLocation, useNavigationType, type Location } from 'react-router-dom';

import './App.scss';

import Spinner from './components/Spinner/Spinner';
import { useLocalStorage } from 'usehooks-ts';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { getDesignThemes } from './utils/models/overrides/themes.model';
import { TypeTheme } from './enums/type.enum';
import { LocalStorageConfig } from './store/constants/local-storage';
import { debounce } from 'lodash';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { clearLocalStorageExcept } from './utils/configs/local-storage.config';
import { getStyleList } from './utils/utils';
import { defaultOptions, OptionsContext } from './contexts/options.context';
import useOptionsObserver from './utils/hooks/useOptionsObserver';
import { loadDataDelay } from './utils/helpers/options-context.helpers';
import useTimestamp from './composables/useTimestamp';
import useSpinner from './composables/useSpinner';
import useDevice from './composables/useDevice';
import ResponsiveAppBar from './components/Commons/Navbars/ResponsiveAppBar';
import { SnackbarProvider } from './contexts/snackbar.context';
import { createProgressHelpers, finishStartupProgress } from './utils/helpers/progress-helpers';
import { useDispatch } from 'react-redux';
import useDataStore from './composables/useDataStore';
import { getProcessedDataSectionsForRoute } from './utils/configs/processed-data-routes.config';
import type { ProcessedDataSection } from './services/processed-data.service';
import { flushPendingNavigationScroll } from './components/Link/LinkToTop';
import { prepareRouteDetails, resolvePokemonRouteId, type RouteDetails } from './services/detail-route.service';
import { appRoutes, type RenderPage } from './app-routes';

const ColorModeContext = createContext({
  toggleColorMode: () => true,
});

function RouteReady({ location, resetScroll }: { location: Location; resetScroll: boolean }) {
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    if (resetScroll) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    flushPendingNavigationScroll();
    const { hideProgress, completeProgress } = createProgressHelpers(dispatch);
    if (finishStartupProgress()) {
      hideProgress();
    } else {
      completeProgress();
    }
  }, [dispatch, location, resetScroll]);
  return null;
}

function App() {
  const { loadTimestamp, timestampGameMaster } = useTimestamp();
  const { startProgress } = useSpinner();
  const { setDevice } = useDevice();
  const navigationType = useNavigationType();
  const location = useLocation();
  const { pathname } = location;
  const { loadProcessedSections, pokemonsData } = useDataStore();

  const colorMode = useContext(ColorModeContext);

  const [, setStateTimestamp] = useLocalStorage(LocalStorageConfig.Timestamp, 0);
  const [, setStateVersion] = useLocalStorage(LocalStorageConfig.Version, '');
  const [isBootstrapLoaded, setIsBootstrapLoaded] = useState(false);
  const [loadedRouteDataKey, setLoadedRouteDataKey] = useState<string | null>(null);
  const [displayRoute, setDisplayRoute] = useState<{
    location: Location;
    path: string;
    render: RenderPage;
    details: RouteDetails;
    resetScroll: boolean;
  }>();
  const routeDataRequestRef = useRef(0);
  const dispatch = useDispatch();
  const { errorProgress } = createProgressHelpers(dispatch);

  const [currentVersion, setCurrentVersion] = useState<string>();
  const styleSheet = useRef(getStyleList());
  const routeDataKey = useMemo(() => getProcessedDataSectionsForRoute(pathname).join('|'), [pathname]);
  const previousPath = displayRoute?.location.pathname;

  useOptionsObserver();

  useLayoutEffect(() => {
    document.getElementById('seo-content')?.remove();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      clearLocalStorageExcept();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    }, 400);
  }, []);

  useEffect(() => {
    if (timestampGameMaster) {
      setStateTimestamp(timestampGameMaster);
    }
  }, [timestampGameMaster]);

  // Run once on mount. [isLoaded] would abort the signal on every re-render caused by setIsLoaded(true).
  useEffect(() => {
    const controller = new AbortController();
    const currentVersion = process.env.REACT_APP_VERSION;
    setCurrentVersion(currentVersion);
    startProgress();
    setStateVersion(currentVersion || '');
    loadData(controller.signal)
      .then((loaded) => {
        if (!controller.signal.aborted && loaded) {
          setIsBootstrapLoaded(true);
        }
      })
      .catch((e: unknown) => {
        if ((e as DOMException)?.name !== 'AbortError') {
          errorProgress({ message: getApiErrorMessage(e, 'Unable to load the app data.'), isError: true });
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (isBootstrapLoaded && previousPath !== undefined && pathname !== previousPath) {
      startProgress();
    }
  }, [isBootstrapLoaded, pathname, previousPath]);

  useEffect(() => {
    if (!isBootstrapLoaded) {
      return;
    }
    const requestId = ++routeDataRequestRef.current;
    const routeDataSections = routeDataKey.split('|').filter(Boolean) as ProcessedDataSection[];
    if (routeDataSections.length === 0) {
      setLoadedRouteDataKey(routeDataKey);
      return;
    }
    loadProcessedSections(routeDataSections)
      .then(() => {
        if (requestId === routeDataRequestRef.current) {
          setLoadedRouteDataKey(routeDataKey);
        }
      })
      .catch((e: unknown) => {
        if (requestId === routeDataRequestRef.current) {
          errorProgress({ message: getApiErrorMessage(e, 'Unable to load the data for this page.'), isError: true });
        }
      });
  }, [isBootstrapLoaded, routeDataKey]);

  useEffect(() => {
    if (!isBootstrapLoaded || displayRoute?.location === location) {
      return;
    }
    const route = matchRoutes(appRoutes, pathname)?.at(-1)?.route;
    if (!route) {
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    const page = route.load();
    if (loadedRouteDataKey !== routeDataKey) {
      // Start downloading the page while its shared sections are still loading.
      void page.catch(() => {});
      return;
    }
    Promise.all([
      page,
      prepareRouteDetails(location, previousPath, (key) => resolvePokemonRouteId(key, pokemonsData), signal),
    ])
      .then(([render, details]) => {
        if (!signal.aborted) {
          setDisplayRoute({ location, path: route.path, render, details, resetScroll: navigationType === 'POP' });
        }
      })
      .catch((error: unknown) => {
        if (!signal.aborted) {
          controller.abort();
          errorProgress({ isError: true, message: getApiErrorMessage(error, 'Unable to open this page. Try again.') });
        }
      });
    return () => controller.abort();
  }, [
    displayRoute?.location,
    isBootstrapLoaded,
    loadedRouteDataKey,
    location,
    navigationType,
    pathname,
    pokemonsData,
    previousPath,
    routeDataKey,
  ]);

  useEffect(() => {
    setDevice();
  }, []);

  const loadData = (signal: AbortSignal, delay = loadDataDelay()) => {
    return new Promise<boolean>((resolve, reject) => {
      const resolveHandler = async () => {
        resolve(await loadTimestamp());
      };

      const debouncedResolve = debounce(resolveHandler, delay);

      if (signal instanceof AbortSignal) {
        const abortHandler = () => {
          debouncedResolve.cancel();
          reject(new DOMException('Aborted', 'AbortError'));
        };

        signal.addEventListener('abort', abortHandler, { once: true });

        const originalCancel = debouncedResolve.cancel;
        debouncedResolve.cancel = () => {
          signal.removeEventListener('abort', abortHandler);
          originalCancel.call(debouncedResolve);
        };
      }

      debouncedResolve();
    });
  };

  return (
    <Box className="app-theme-root tw-min-h-full" sx={{ backgroundColor: 'background.default' }}>
      <ResponsiveAppBar toggleColorMode={colorMode.toggleColorMode} version={currentVersion} />
      {displayRoute && (
        <>
          <Routes location={displayRoute.location}>
            <Route
              path={displayRoute.path}
              element={displayRoute.render({
                location: displayRoute.location,
                styleSheet: styleSheet.current,
                details: displayRoute.details,
              })}
            />
          </Routes>
          <RouteReady location={displayRoute.location} resetScroll={displayRoute.resetScroll} />
        </>
      )}
      <Spinner />
    </Box>
  );
}

export default function Main() {
  const { key: locationKey } = useLocation();
  const [mode, setMode] = useLocalStorage(LocalStorageConfig.Theme, TypeTheme.Light);
  const modeRef = useRef(mode);
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        const nextMode = modeRef.current === TypeTheme.Light ? TypeTheme.Dark : TypeTheme.Light;
        modeRef.current = nextMode;

        const applyTheme = () => flushSync(() => setMode(nextMode));
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const documentWithTransition = document as Document & {
          startViewTransition?: (update: () => void) => {
            ready: Promise<void>;
            finished: Promise<void>;
          };
        };

        if (!documentWithTransition.startViewTransition || prefersReducedMotion) {
          applyTheme();
          return true;
        }

        document.documentElement.classList.add('theme-view-transition');
        const transition = documentWithTransition.startViewTransition(applyTheme);
        const finishThemeTransition = () => document.documentElement.classList.remove('theme-view-transition');
        transition.ready.then(finishThemeTransition, finishThemeTransition);
        transition.finished.then(finishThemeTransition, finishThemeTransition);
        return true;
      },
    }),
    [setMode]
  );

  const theme = useMemo(() => createTheme(getDesignThemes(mode)), [mode]);

  useLayoutEffect(() => {
    modeRef.current = mode;
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', theme.palette.background.default);
  }, [mode, theme.palette.background.default]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary resetKey={locationKey}>
          <OptionsContext.Provider value={defaultOptions}>
            <SnackbarProvider>
              <App />
            </SnackbarProvider>
          </OptionsContext.Provider>
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
