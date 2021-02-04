import { Serializable } from 'typedjson';
import PSDKEntity from '../../models/entities/PSDKEntity';
import '../matchers';

export {};
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toKeepIntegrity(model: Serializable<PSDKEntity>): R;
    }
  }
}
