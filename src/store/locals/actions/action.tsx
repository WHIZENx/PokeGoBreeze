import { showSpinner } from '../../actions/spinner.action';

export const loadData = (type: string, dispatch: any, dispatchLocal: any, writeError: any, data: any, timestamp: any) => {
  if (writeError) {
    return dispatch(
      showSpinner({
        error: true,
        msg: `Cannot write to localStorage: ${writeError.message}`,
      })
    );
  }

  dispatchLocal({ type, payload: { data, timestamp } });
};

export const resetData = (type: string) => ({
  type,
});
