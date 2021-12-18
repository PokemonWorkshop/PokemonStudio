import PSDKEntity from '@modelEntities/PSDKEntity';
import { TextsWithLanguageConfig } from '@src/GlobalStateProvider';
import { getText } from '@utils/ReadingProjectText';
import { AnyT, jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';

type DexText = {
  csvFileId: number;
  csvTextIndex: number;
};

type DexCreature = {
  dbSymbol: string;
  form: number;
};

/**
 * This class represents the model of the dex.
 */
@jsonObject
export default class DexModel implements PSDKEntity {
  static klass = 'Dex';

  /**
   * The class of the dex.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the dex.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the dex.
   */
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * The text localisation of the dex.
   */
  @jsonMember(AnyT)
  csv!: DexText;

  /**
   * The start id of the dex.
   */
  @jsonMember(Number)
  startId!: number;

  /**
   * The creatures of the dex.
   */
  @jsonArrayMember(AnyT)
  creatures!: DexCreature[];

  /**
   * Text of the project.
   */
  projectText?: TextsWithLanguageConfig;

  /**
   * Get the name of the dex
   * @returns The name of the dex
   */
  name = () => {
    if (!this.projectText) return `name of ${this.dbSymbol}`;
    return getText(this.projectText, this.csv.csvFileId, this.csv.csvTextIndex);
  };

  /**
   * Get the id of the creature
   * @param dbSymbol The db_symbol of the creature
   * @param form The form of the creature
   * @returns The id of the creature
   */
  getId = (dbSymbol: string, form: number) => {
    const index = this.creatures.findIndex((dexCreature) => dexCreature.dbSymbol === dbSymbol && dexCreature.form === form);
    if (index === -1) return 0;

    return index + this.startId;
  };

  /**
   * Change the id of the creature
   * @param dbSymbol The db_symbol of the creature
   * @param form The form of the creature
   * @param newId The new id of the creature
   */
  changeId = (dbSymbol: string, form: number, newId: number) => {
    const index = this.creatures.findIndex((dexCreature) => dexCreature.dbSymbol === dbSymbol && dexCreature.form === form);
    if (index !== -1) this.creatures.splice(index, 1);
    if (newId === 0) return;

    if (newId > this.creatures.length) {
      this.creatures = this.creatures.concat(Array.from({ length: newId - this.creatures.length }).map(() => ({ dbSymbol: '__undef__', form: 0 })));
    }
    this.creatures.splice(newId - this.startId, 0, { dbSymbol, form });
    while (this.creatures.length > 0 && this.creatures[this.creatures.length - 1].dbSymbol === '__undef__') this.creatures.pop();
  };

  /**
   * Add a creature in the dex
   * @param dbSymbol The dbSymbol of the creature
   * @param form The form of the creature
   */
  addCreature = (dbSymbol: string, form: number) => {
    this.creatures.push({ dbSymbol, form });
  };

  /**
   * Delete a creature of the dex
   * @param dbSymbol The dbSymbol of the creature
   * @param form The form of the creature
   */
  deleteCreature = (dbSymbol: string, form: number) => {
    const index = this.creatures.findIndex((dexCreature) => dexCreature.dbSymbol === dbSymbol && dexCreature.form === form);
    this.creatures.splice(index, 1);
  };

  /**
   * Clone the object
   */
  clone = (): DexModel => {
    const newObject = new TypedJSON(DexModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as DexModel;
  };
}
