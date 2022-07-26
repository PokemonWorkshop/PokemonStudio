import { ProjectData, TextsWithLanguageConfig } from '@src/GlobalStateProvider';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { getDialogMessage, getText, setText } from '@utils/ReadingProjectText';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { entitiesSerializer } from '..';
import PSDKEntity from '../PSDKEntity';

export const ItemCategories = ['ball', 'heal', 'repel', 'fleeing', 'event', 'stone', 'tech', 'generic'] as const;
export type ItemCategory = typeof ItemCategories[number];
export type ItemEditors = 'generic' | 'parameters' | 'exploration' | 'battle' | 'tech' | 'progress' | 'heal' | 'catch' | 'berries' | 'cooking';

// Mapping between pocket id and pocket name id
export const pocketMapping = [0, 4, 1, 5, 3, 8, 0];

/**
 * This class represents an item.
 */
@jsonObject
export default class ItemModel implements PSDKEntity {
  static klass = 'Item';

  public category: ItemCategory = 'generic';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'heal', 'catch', 'berries', 'cooking'];

  /**
   * The class of the item.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the item.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the item.
   */
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * Name of the item icon in Graphics/Icons/.
   */
  @jsonMember(String)
  icon!: string;

  /**
   * Price of the item.
   */
  @jsonMember(Number)
  price!: number;

  /**
   * Socket id of the item.
   */
  @jsonMember(Number)
  socket!: number;

  /**
   * Sort position in the bag, the lesser the position is, the topper it item is shown.
   */
  @jsonMember(Number)
  position!: number;

  /**
   * If the item can be used in Battle.
   */
  @jsonMember(Boolean)
  isBattleUsable!: boolean;

  /**
   * If the item can be used in Map.
   */
  @jsonMember(Boolean)
  isMapUsable!: boolean;

  /**
   * If the item has limited uses (can be thrown).
   */
  @jsonMember(Boolean)
  isLimited!: boolean;

  /**
   * If the item can be held by a Pokemon.
   */
  @jsonMember(Boolean)
  isHoldable!: boolean;

  /**
   * Power of the item when thrown to an other pokemon.
   */
  @jsonMember(Number)
  flingPower!: number;

  /**
   * Text of the project
   */
  public projectText?: TextsWithLanguageConfig;

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    klass: ItemModel.klass,
    id: 0,
    dbSymbol: 'new_item',
    icon: '001',
    price: 0,
    socket: 1,
    position: 0,
    isBattleUsable: false,
    isMapUsable: false,
    isLimited: false,
    isHoldable: false,
    flingPower: 30,
  });

  /**
   * Get the description of the item
   * @returns The description of the item
   */
  descr = () => {
    if (!this.projectText) return `description of ${this.dbSymbol}`;
    return getText(this.projectText, 13, this.id);
  };

  /**
   * Set the description of the item
   */
  setDescr = (descr: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 13, this.id, descr);
  };

  /**
   * Get the name of the item
   * @returns The name of the item
   */
  name = () => {
    if (!this.projectText) return `name of ${this.dbSymbol}`;
    return getText(this.projectText, 12, this.id);
  };

  /**
   * Set the name of the item
   */
  setName = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 12, this.id, name);
  };

  /**
   * Get the plural name of the item
   * @returns The plural name of the item
   */
  pluralName = () => {
    if (!this.projectText) return `plural name of ${this.dbSymbol}`;
    return getDialogMessage(this.projectText, 9001, this.id);
  };

  /**
   * Get the pocket name
   */
  pocketName = () => {
    if (!this.projectText) return '???';
    return getText(this.projectText, 15, pocketMapping[this.socket] ?? this.socket) || '???';
  };

  /**
   * Get the icone URL
   */
  iconUrl = (projectPath: string) => `${projectPath}/graphics/icons/${this.icon}.png`;

  /**
   * Clone the object
   */
  clone = (): ItemModel => {
    const newObject = new TypedJSON(ItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as ItemModel;
  };

  /**
   * Get the common ancestor values
   */
  public getCommonAncestorValues(commonAncestorKlass: string) {
    const commonAncestorValues = { ...JSON.parse(entitiesSerializer[commonAncestorKlass].stringify(this)) };
    delete commonAncestorValues.__type;
    return commonAncestorValues;
  }

  /**
   * Mutate the object into another object klass
   */
  mutateTo = (classPrototype: typeof ItemModel, commonAncestorKlass: string) => {
    const mutatedValues = { ...classPrototype.defaultValues(), ...this.getCommonAncestorValues(commonAncestorKlass), klass: classPrototype.klass };
    const newObject = entitiesSerializer[classPrototype.klass].parse(mutatedValues);
    if (!newObject) throw new Error(`Could not mutate object from ${this.klass} to ${classPrototype.klass}`);

    newObject.projectText = this.projectText;
    return newObject as ItemModel;
  };

  /**
   * Create a new item with default values
   * @param allMoves The project data containing the items
   * @returns The new item
   */
  static createItem = (allItems: ProjectData['items']): ItemModel => {
    const newItem = new ItemModel();
    Object.assign(newItem, ItemModel.defaultValues());
    newItem.id = findFirstAvailableId(allItems, 1);
    newItem.dbSymbol = '';
    newItem.icon = '';
    return newItem;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues() {
    this.price = cleanNaNValue(this.price);
    this.position = cleanNaNValue(this.position);
    this.flingPower = cleanNaNValue(this.flingPower);
  }
}
