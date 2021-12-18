import { TextsWithLanguageConfig } from '@src/GlobalStateProvider';

export default interface PSDKEntity {
  klass: string;
  id: number;
  dbSymbol: string;
  name: () => string;
  projectText?: TextsWithLanguageConfig;
}
