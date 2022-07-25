import { ProjectData, TextsWithLanguageConfig } from '@src/GlobalStateProvider';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { getText, setText } from '@utils/ReadingProjectText';
import { AnyT, jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';
import Encounter from '../Encounter';
import PSDKEntity from '../PSDKEntity';

export const AiCategories = ['basic', 'regular', 'medium', 'hard', 'lieutenant', 'gym_leader', 'champion'] as const;
export const VsTypeCategories = [1, 2] as const;

/**
 * This interface represents an item in the trainer bag
 */
export interface BagEntry {
  /**
   * The dbSymbol of the item
   */
  dbSymbol: string;
  /**
   * The amount of the item owned by the trainer
   */
  amount: number;
}

/**
 * This class represents a trainer.
 */
@jsonObject({
  onDeserialized: 'onDeserialized',
})
export default class TrainerModel implements PSDKEntity {
  static klass = 'TrainerBattleSetup';

  /**
   * The class of the trainer.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the trainer.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the trainer.
   */
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * The battle type 1v1, 2v2, 3v3…
   */
  @jsonMember(Number)
  vsType!: number;

  /**
   * If the trainers are a couple
   */
  @jsonMember(Boolean)
  isCouple!: boolean;

  /**
   * The value that is multiplied to the last pokemon level to get the money the trainer gives.
   */
  @jsonMember(Number)
  baseMoney!: number;

  /**
   * The name of the battler in Graphics/Battlers.
   */
  @jsonArrayMember(String)
  battlers!: string[];

  /**
   * The list of item of bag of the trainer.
   */
  @jsonArrayMember(AnyT)
  bagEntries!: BagEntry[];

  /**
   * The group of battle.
   */
  @jsonMember(Number)
  battleId!: number;

  /**
   * ID of AI of the trainer.
   */
  @jsonMember(Number)
  ai!: number;

  /**
   * The party of the trainer.
   */
  @jsonArrayMember(AnyT)
  party!: Encounter[];

  /**
   * Text of the project
   */
  public projectText?: TextsWithLanguageConfig;

  /**
   * Get the trainer class name
   * @return The trainer class name
   */
  trainerClassName = () => {
    if (!this.projectText) return `trainer class name of ${this.dbSymbol}`;
    return getText(this.projectText, 29, this.id);
  };

  /**
   * Set the trainer class name
   */
  setTrainerClassName = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 29, this.id, name);
  };

  /**
   * Get the fullname of the trainer (class name + trainer name)
   * @return The fullname of the trainer
   */
  name = () => {
    return `${this.trainerClassName()} ${this.trainerName()}`;
  };

  /**
   * Get the name of the trainer
   * @return The name of the trainer
   */
  trainerName = () => {
    if (!this.projectText) return `trainer name of ${this.dbSymbol}`;
    return getText(this.projectText, 62, this.id);
  };

  /**
   * Set the name of the trainer
   */
  setTrainerName = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 62, this.id, name);
  };

  /**
   * Get the victory sentence of the trainer
   * @return The victory sentence of the trainer
   */
  victorySentence = () => {
    if (!this.projectText) return `victory sentence of ${this.dbSymbol}`;
    return getText(this.projectText, 47, this.id);
  };

  /**
   * Set the victory sentence of the trainer
   */
  setVictorySentence = (sentence: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 47, this.id, sentence);
  };

  /**
   * Get the defeat sentence of the trainer
   * @return The defeat sentence of the trainer
   */
  defeatSentence = () => {
    if (!this.projectText) return `defeat sentence of ${this.dbSymbol}`;
    return getText(this.projectText, 48, this.id);
  };

  /**
   * Set the defeat sentence of the trainer
   */
  setDefeatSentence = (sentence: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 48, this.id, sentence);
  };

  /**
   * The money given by the trainer
   */
  money = () => {
    if (this.party.length === 0 || isNaN(this.baseMoney)) return 0;

    return this.baseMoney * (this.party[this.party.length - 1].levelSetup.level as number);
  };

  /**
   * Get the sprite url
   */
  sprite = (projectPath: string) => `${projectPath}/graphics/battlers/${this.battlers[0]}.png`;

  /**
   * Get the sprite big url
   */
  spriteBig = (projectPath: string) => `${projectPath}/graphics/battlers/${this.battlers[0]}_big.png`;

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    klass: TrainerModel.klass,
    id: 0,
    dbSymbol: 'trainer_0',
    vsType: 1,
    isCouple: false,
    baseMoney: 0,
    ai: 0,
    battlers: [],
    party: [],
    bagEntries: [],
    battleId: 0,
  });

  /**
   * Clone the object
   */
  clone = (): TrainerModel => {
    const newObject = new TypedJSON(TrainerModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as TrainerModel;
  };

  /**
   * Call when the object is deserialized
   */
  onDeserialized = (): void => {
    this.ai ||= 1;
  };

  /**
   * Create a new trainer with default values
   * @param allTrainers The project data containing the trainers
   * @returns The new trainer
   */
  static createTrainer = (allTrainers: ProjectData['trainers']): TrainerModel => {
    const newTrainer = new TrainerModel();
    Object.assign(newTrainer, TrainerModel.defaultValues());
    newTrainer.id =
      Object.entries(allTrainers)
        .map(([, trainerData]) => trainerData)
        .sort((a, b) => b.id - a.id)[0].id + 1;
    newTrainer.dbSymbol = `trainer_${newTrainer.id}`;
    return newTrainer;
  };

  /**
   * Update the trainer name of the party of Pokémon
   */
  updatePartyTrainerName = () => {
    this.party.forEach((encounter) => {
      encounter.expandPokemonSetup.forEach((expandPokemonSetup) => {
        if (expandPokemonSetup.type === 'originalTrainerName') expandPokemonSetup.value = this.trainerName();
      });
    });
  };

  /**
   * Create a bag entry
   * @returns The new bag entry
   */
  static createBagEntry = (): BagEntry => {
    return { dbSymbol: '__undef__', amount: 1 };
  };

  /**
   * Delete duplicate items and update the amount
   */
  reduceBagEntries = () => {
    const bagEntries: BagEntry[] = [];
    this.bagEntries.forEach((bagEntry) => {
      const result = bagEntries.find((be) => be.dbSymbol === bagEntry.dbSymbol);
      if (result) result.amount += bagEntry.amount;
      else bagEntries.push(bagEntry);
    });
    this.bagEntries = bagEntries;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues = () => {
    this.baseMoney = cleanNaNValue(this.baseMoney);
    this.bagEntries.forEach((bagEntry) => {
      bagEntry.amount = cleanNaNValue(bagEntry.amount, 1);
    });
    this.battleId = cleanNaNValue(this.battleId);
  };
}
