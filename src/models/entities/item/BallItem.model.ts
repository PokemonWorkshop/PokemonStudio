import { cleanNaNValue } from '@utils/cleanNaNValue';
import { AnyT, jsonMember, jsonObject, TypedJSON } from 'typedjson';
import ItemModel, { ItemCategory, ItemEditors } from './Item.model';

/**
 * This interface represents the color of the ball
 */
export interface Color {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

/**
 * This class represents an item that allows to catch Pokemon in battle.
 */
@jsonObject
export default class BallItemModel extends ItemModel {
  static klass = 'BallItem';

  public category: ItemCategory = 'ball';

  public lockedEditors: ItemEditors[] = ['exploration', 'battle', 'progress', 'heal', 'berries', 'cooking'];

  /**
   * The image of the ball.
   */
  @jsonMember(String)
  spriteFilename!: string;

  /**
   * The rate of the ball in worse conditions.
   */
  @jsonMember(Number)
  catchRate!: number;

  /**
   * The color of the ball (red, green, blue, alpha).
   */
  @jsonMember(AnyT)
  color!: Color;

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    ...ItemModel.defaultValues(),
    klass: BallItemModel.klass,
    spriteFilename: 'ball_1',
    catchRate: 1,
    color: { red: 255, green: 0, blue: 0, alpha: 255 },
  });

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues() {
    super.cleaningNaNValues();
    this.catchRate = cleanNaNValue(this.catchRate);
  }

  /**
   * Clone the object
   */
  clone = (): BallItemModel => {
    const newObject = new TypedJSON(BallItemModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as BallItemModel;
  };
}
