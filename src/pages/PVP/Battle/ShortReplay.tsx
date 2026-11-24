import React, { useEffect, useState } from 'react';
import { Alert, LinearProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../services/api-error';
import APIService from '../../../services/api.service';
import Battle from './Battle';

const ShortReplay = () => {
  const { id } = useParams();
  const [seed, setSeed] = useState<string>();
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!id || !/^[A-Za-z0-9_-]{10}$/.test(id)) {
      setMessage('This replay link is invalid.');
      return;
    }
    const request = new AbortController();
    APIService.getReplayLink(id, request.signal)
      .then(({ data }) => {
        if (!request.signal.aborted) {
          setSeed(data.data.seed);
        }
      })
      .catch((error: unknown) => {
        if (!request.signal.aborted) {
          setMessage(getApiErrorMessage(error, 'Unable to load this replay.'));
        }
      });
    return () => request.abort();
  }, [id]);

  if (message) {
    return (
      <Alert severity="error" className="tw-container tw-mt-4">
        {message}
      </Alert>
    );
  }
  if (!seed) {
    return <LinearProgress aria-label="Loading replay" />;
  }
  return <Battle replayMode replaySeed={seed} />;
};

export default ShortReplay;
