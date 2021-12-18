import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';

export type SelectDataProps = {
  dbSymbol: string;
  onChange: (selected: SelectOption) => void;
  noLabel?: true;
  rejected?: string[];
  breakpoint?: string;
  noneValue?: true;
  noneValueIsError?: boolean;
  overwriteNoneValue?: string;
};
