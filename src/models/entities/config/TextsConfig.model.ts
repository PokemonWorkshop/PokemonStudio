import PSDKConfig from '@modelEntities/PSDKConfig';
import { AnyT, jsonMember, jsonObject, TypedJSON } from 'typedjson';

type TtfFile = {
  id: number;
  name: string;
  size: number;
  lineHeight: number;
};

type AltSize = Omit<TtfFile, 'size'>;

/**
 * Information about font (loading the fonts, sizes etc.)
 */
type FontConfig = {
  /**
   * If the default font uses special chars as "0123456789" for Pokemon HP number
   */
  isSupportsPokemonNumber: boolean;

  /**
   * List of ttf files the game has to load
   */
  ttfFiles: TtfFile[];

  /**
   * List of alternative sizing (to prevent loading font for that size, sizeid: should be used in add text to use the said size)
   */
  altSizes: AltSize[];
};

/**
 * Information about message
 */
type MessageConfig = {
  /**
   * Force the windowskin regardless of the options
   */
  windowskin?: string;

  /**
   * Force the name window to have a specific windowskin
   */
  nameWindowskin?: string;

  /**
   * Number of lines shown by the message
   */
  lineCount: number;

  /**
   * Number of pixel between the first pixel of the windowskin
   */
  borderSpacing: number;

  /**
   * ID of the font used by the Window
   */
  defaultFont: number;

  /**
   * ID of the default color
   */
  defaultColor: number;

  /**
   * Change the color mapping : Mapping from \c[key] to value (x position) in _colors.png
   */
  colorMapping: Record<number, number>;
};

/**
 * Information about choice
 */
type ChoiceConfig = Omit<MessageConfig, 'nameWindowskin' | 'lineCount'>;

/**
 * This class represents the texts config.
 */
@jsonObject
export default class TextsConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::Texts';

  /**
   * The class of the texts config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The font config
   */
  @jsonMember(AnyT)
  fonts!: FontConfig;

  /**
   * The message config
   */
  @jsonMember(AnyT)
  messages!: Record<string, MessageConfig>;

  /**
   * The choice config
   */
  @jsonMember(AnyT)
  choices!: Record<string, ChoiceConfig>;

  /**
   * Clone the object
   */
  clone = (): TextsConfigModel => {
    const newObject = new TypedJSON(TextsConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as TextsConfigModel;
  };
}
