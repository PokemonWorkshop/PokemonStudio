import { SelectOption } from '../../../SelectCustom/SelectCustomPropsInterface';
import { PokemonWithForm } from '../PokemonDataPropsInterface';

export type PokemonControlBarProps = {
  onPokemonChange: (selected: SelectOption) => void;
  onFormChange: (selected: SelectOption) => void;
  onClickNewPokemon?: () => void;
  onClickNewForm?: () => void;
  currentPokemonWithForm: PokemonWithForm;
};
