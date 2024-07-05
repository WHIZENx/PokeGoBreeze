import { createClient } from '@vercel/edge-config';

const edge = createClient(process.env.REACT_APP_EDGE_CONFIG, {
  cache: 'force-cache',
});

export const getEdgeItem = async (key: string) => {
  return await edge.get(key);
};

export const getAllEdgeItem = async () => {
  return await edge.getAll();
};
