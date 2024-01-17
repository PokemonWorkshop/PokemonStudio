import fs from 'fs';
import crypto from 'crypto';
import { Sha1 } from '@modelEntities/sha1';

export const calculateFileSha1 = async (filePath: string): Promise<Sha1> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      const sha1 = hash.digest('hex');
      resolve(sha1 as Sha1);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
};

export const compareSha1 = (currentSha1: Sha1, newSha1: Sha1) => {
  return currentSha1.toLowerCase() === newSha1.toLowerCase();
};
