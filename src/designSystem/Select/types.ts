export type SelectOption<Value extends string> = {
  value: Value;
  label: string;
  tooltip?: string;
};

export type RenderOptionRef<Value extends string, ChooseValue extends string> = {
  show: (value: Value | ChooseValue | undefined, options: Readonly<SelectOption<Value>[]>) => void;
  hide: () => void;
  refine: (options: Readonly<SelectOption<Value>[]>) => void;
  highlightNext: () => void;
  highlightPrevious: () => void;
  pickHighlighted: () => void;
};
