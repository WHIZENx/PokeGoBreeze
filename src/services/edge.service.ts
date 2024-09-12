import { createClient } from '@vercel/edge-config';

const edge = createClient(process.env.REACT_APP_EDGE_CONFIG, {
  cache: 'force-cache',
});

export const getEdgeItem = async <T>(key: string) => {
  return await edge.get<T>(key);
};

export const getAllEdgeItem = async () => {
  return await edge.getAll();
};
