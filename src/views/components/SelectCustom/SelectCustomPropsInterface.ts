export type SelectCustomProps = {
  options: SelectOption[];
  onChange: (selected: SelectOption) => void;
  noOptionsText?: string;
  defaultValue?: SelectOption;
  value?: SelectOption;
  error?: boolean;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectElementType = {
  height: string;
  error: boolean;
};
