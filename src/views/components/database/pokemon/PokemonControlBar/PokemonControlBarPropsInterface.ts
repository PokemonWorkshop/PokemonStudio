import { SelectChangeEvent } from '../../../SelectCustom/SelectCustomPropsInterface';
import { PokemonWithForm } from '../PokemonDataPropsInterface';

export type PokemonControlBarProps = {
  onPokemonChange: SelectChangeEvent;
  onFormChange: SelectChangeEvent;
  onClickNewPokemon?: () => void;
  onClickNewForm?: () => void;
  currentPokemonWithForm: PokemonWithForm;
};
