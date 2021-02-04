import { jsonMember, jsonObject } from 'typedjson';
import PSDKEntity from './PSDKEntity';

@jsonObject
export default class ExampleModel implements PSDKEntity {
  static klass = 'Example';

  @jsonMember(String)
  klass!: string;

  @jsonMember(String)
  dbSymbol!: string | null;

  @jsonMember(Number)
  id!: number;

  @jsonMember(Number)
  foo!: number;
}
