import { Serializable, TypedJSON } from 'typedjson';
import { diff, diffString } from 'json-diff';
import PSDKEntity from '../models/entities/PSDKEntity';

expect.extend({
  toKeepIntegrity(this: jest.MatcherContext, received: any, model: Serializable<PSDKEntity>): jest.CustomMatcherResult {
    const serializer = new TypedJSON(model);
    // eslint-disable-next-line jest/no-standalone-expect
    const pass = diff(serializer.toPlainJson(serializer.parse(received)!), received) === undefined;
    const message = () =>
      `Expected object ${JSON.stringify(received)} does ${this.isNot ? '' : 'not'} keep integrity. Diff: ${diffString(
        serializer.toPlainJson(serializer.parse(received)!),
        received
      )}`;
    return {
      pass,
      message,
    };
  },
});
