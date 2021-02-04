import { AnyT, jsonMember, jsonObject } from 'typedjson';
import ItemModel from './Item.model';

/**
 * This interface represents the color of the ball
 */
interface Color {
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
}
