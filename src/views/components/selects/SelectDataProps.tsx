import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';

export type SelectDataProps = {
  dbSymbol: string;
  onChange: SelectChangeEvent;
  noLabel?: true;
  rejected?: string[];
  breakpoint?: string;
  noneValue?: true;
  noneValueIsError?: boolean;
  overwriteNoneValue?: string;
};
