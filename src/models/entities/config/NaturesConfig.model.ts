import PSDKConfig from '@modelEntities/PSDKConfig';
import { AnyT, jsonMember, jsonObject, TypedJSON } from 'typedjson';

/**
 * This class represents the natures config.
 */
@jsonObject
export default class NaturesConfigModel implements PSDKConfig {
  static klass = 'Configs::Natures';

  /**
   * The class of the natures config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The font config
   */
  @jsonMember(AnyT)
  data!: number[][];

  /**
   * dbSymbol to nature id mapper
   */
  @jsonMember(AnyT)
  db_symbol_to_id!: Record<string, number>;

  /**
   * Clone the object
   */
  clone = (): NaturesConfigModel => {
    const newObject = new TypedJSON(NaturesConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as NaturesConfigModel;
  };
}
