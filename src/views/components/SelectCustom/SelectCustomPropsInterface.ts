export type SelectCustomProps = {
  options: SelectOption[];
  onChange: SelectChangeEvent;
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

export type SelectChangeEvent = (selected: SelectOption) => void;
