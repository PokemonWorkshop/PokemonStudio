export type SelectCustomProps = {
  label?: string;
  options: SelectOption[];
  onChange: (selected: SelectOption) => void;
  noOptionsText?: string;
  defaultValue?: SelectOption;
};

export type SelectOption = {
  value: string;
  label: string;
};
