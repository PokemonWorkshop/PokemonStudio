import { ValueType } from "./useRenderOptions";

export type MultiSelectOption<Value extends ValueType> = {
  value: Value;
  label: string;
  tooltip?: string;
};

export type RenderOptionRef<Value extends ValueType, ChooseValue extends Value> = {
  show: (value: Value[] | ChooseValue[], options: Readonly<MultiSelectOption<Value>[]>) => void;
  hide: () => void;
  refine: (options: Readonly<MultiSelectOption<Value>[]>) => void;
  highlightNext: () => void;
  highlightPrevious: () => void;
  pickHighlighted: () => void;
};
