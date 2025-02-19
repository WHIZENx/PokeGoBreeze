import { createClient } from 'redis';

const redis = createClient({ url: process.env.REACT_APP_REDIS_URL }).connect();

export const getRedisItem = async (key: string) => {
  return (await redis).get(key);
};

export const setRedisItem = async (key: string, value: string) => {
  (await redis).set(key, value);
};
