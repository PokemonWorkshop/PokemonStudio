import { isMarshalUserObject, MarshalObject, MarshalUserObject } from 'ts-marshal';

export type ColorObject = MarshalUserObject & {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

export const isColorObject = (object: unknown): object is ColorObject =>
  isMarshalUserObject(object) && 'red' in object && 'green' in object && 'blue' in object && 'alpha' in object;

const convertColorObject = (object: MarshalUserObject | ColorObject): ColorObject => {
  if ('alpha' in object) return object;
  if (object.__load.length != 32) throw new Error('Invalid Color Size');

  return {
    __class: Symbol.for('Color'),
    red: object.__load.readDoubleLE(0),
    green: object.__load.readDoubleLE(8),
    blue: object.__load.readDoubleLE(16),
    alpha: object.__load.readDoubleLE(24),
    get __load() {
      const buffer = Buffer.allocUnsafe(32);
      buffer.writeDoubleLE(this.red, 0);
      buffer.writeDoubleLE(this.green, 8);
      buffer.writeDoubleLE(this.blue, 16);
      buffer.writeDoubleLE(this.alpha, 24);
      return buffer;
    },
  };
};

export type ToneObject = MarshalUserObject & {
  red: number;
  green: number;
  blue: number;
  gray: number;
};

const convertToneObject = (object: MarshalUserObject | ToneObject): ToneObject => {
  if ('gray' in object) return object;
  if (object.__load.length != 32) throw new Error('Invalid Tone Size');

  return {
    __class: Symbol.for('Tone'),
    red: object.__load.readDoubleLE(0),
    green: object.__load.readDoubleLE(8),
    blue: object.__load.readDoubleLE(16),
    gray: object.__load.readDoubleLE(24),
    get __load() {
      const buffer = Buffer.allocUnsafe(32);
      buffer.writeDoubleLE(this.red, 0);
      buffer.writeDoubleLE(this.green, 8);
      buffer.writeDoubleLE(this.blue, 16);
      buffer.writeDoubleLE(this.gray, 24);
      return buffer;
    },
  };
};

export const isToneObject = (object: unknown): object is ToneObject =>
  isMarshalUserObject(object) && 'red' in object && 'green' in object && 'blue' in object && 'gray' in object;

export type RectObject = MarshalUserObject & {
  x: number;
  y: number;
  width: number;
  height: number;
};

const convertRectObject = (object: MarshalUserObject | RectObject): RectObject => {
  if ('width' in object) return object;
  if (object.__load.length != 16) throw new Error('Invalid Rect Size');

  return {
    __class: Symbol.for('Rect'),
    x: object.__load.readInt32LE(0),
    y: object.__load.readInt32LE(4),
    width: object.__load.readInt32LE(8),
    height: object.__load.readInt32LE(12),
    get __load() {
      const buffer = Buffer.allocUnsafe(16);
      buffer.writeInt32LE(this.x, 0);
      buffer.writeInt32LE(this.y, 4);
      buffer.writeInt32LE(this.width, 8);
      buffer.writeInt32LE(this.height, 12);
      return buffer;
    },
  };
};

export const isRectObject = (object: unknown): object is RectObject =>
  isMarshalUserObject(object) && 'width' in object && 'height' in object && 'x' in object && 'y' in object;

export type TableObject = MarshalUserObject & {
  dim: number;
  xSize: number;
  ySize: number;
  zSize: number;
  __data: Buffer;
  getCell: (x: number, y?: number, z?: number) => number | null;
  setCell: (value: number, x: number, y?: number, z?: number) => void;
  forEach: (callback: (value: number, x: number, y: number, z: number) => void) => void;
};

const convertTableObject = (object: MarshalUserObject | TableObject): TableObject => {
  if ('xSize' in object) return object;
  if (object.__load.length < 20 || object.__load.readUInt32LE(16) * 2 + 20 != object.__load.length) throw new Error('Invalid Table Size');

  return {
    __class: Symbol.for('Table'),
    dim: Math.min(3, Math.max(1, object.__load.readInt32LE(0))),
    xSize: object.__load.readInt32LE(4),
    ySize: object.__load.readInt32LE(8),
    zSize: object.__load.readInt32LE(12),
    __data: object.__load.slice(20, object.__load.length),
    get __load() {
      const buffer = Buffer.allocUnsafe(20 + this.__data.length);
      console.log('called', this.dim);
      buffer.writeInt32LE(this.dim, 0);
      buffer.writeInt32LE(this.xSize, 4);
      buffer.writeInt32LE(this.ySize, 8);
      buffer.writeInt32LE(this.zSize, 12);
      buffer.writeUInt32LE(this.__data.length, 16);
      this.__data.copy(buffer, 20);
      return buffer;
    },
    getCell(x, y = 0, z = 0) {
      if (x < 0 || y < 0 || z < 0) return null;
      if (x >= this.xSize || y >= this.ySize || z >= this.zSize) return null;

      return this.__data.readInt16LE(x + y * this.ySize + z * this.zSize * this.ySize);
    },
    setCell(value, x, y = 0, z = 0) {
      if (x < 0 || y < 0 || z < 0) return;
      if (x >= this.xSize || y >= this.ySize || z >= this.zSize) return;

      this.__data.writeInt16LE(value, x + y * this.xSize + z * this.xSize * this.ySize);
    },
    forEach(callback) {
      const { xSize, ySize } = this;
      const zDivider = xSize * ySize;
      this.__data.forEach((value, index) => callback(value, index % xSize, index / xSize, index / zDivider));
    },
  };
};

export const isTableObject = (object: unknown): object is TableObject =>
  isMarshalUserObject(object) &&
  'xSize' in object &&
  'ySize' in object &&
  'zSize' in object &&
  'dim' in object &&
  '__data' in object &&
  'getCell' in object &&
  'setCell' in object;

const RGSSConversionMap = {
  [Symbol.for('Color')]: convertColorObject,
  [Symbol.for('Tone')]: convertToneObject,
  [Symbol.for('Rect')]: convertRectObject,
  [Symbol.for('Table')]: convertTableObject,
};

export const mapRGSSObject = (object: MarshalObject) => {
  if (isMarshalUserObject(object)) {
    const converter = RGSSConversionMap[object.__class];
    if (converter) return converter(object);
  }
  return object;
};
