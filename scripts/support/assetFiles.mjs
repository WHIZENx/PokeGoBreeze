import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const webRoot = fileURLToPath(new URL('../../', import.meta.url));
export const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

export const pngDimensions = (buffer, label) => {
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error(`${label} is not a PNG file.`);
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};
