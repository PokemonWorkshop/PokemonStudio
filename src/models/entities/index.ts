import { Serializable, TypedJSON } from 'typedjson';
import PSDKEntity from './PSDKEntity';

import AllPPHealItemModel from './item/AllPPHealItem.model';
import BallItemModel from './item/BallItem.model';
import ConstantHealItemModel from './item/ConstantHealItem.model';
import EVBoostItemModel from './item/EVBoostItem.model';
import EventItemModel from './item/EventItem.model';
import FleeingItemModel from './item/FleeingItem.model';
import HealingItemModel from './item/HealingItem.model';
import ItemModel from './item/Item.model';
import LevelIncreaseItemModel from './item/LevelIncreaseItem.model';
import PPHealItemModel from './item/PPHealItem.model';
import PPIncreaseItemModel from './item/PPIncreaseItem.model';
import RateHealItemModel from './item/RateHealItem.model';
import RepelItemModel from './item/RepelItem.model';
import StatBoostItemModel from './item/StatBoostItem.model';
import StatusHealItemModel from './item/StatusHealItem.model';
import StatusRateHealItemModel from './item/StatusRateHealItem.model';
import StoneItemModel from './item/StoneItem.model';
import TechItemModel from './item/TechItem.model';

import MoveModel from './move/Move.model';

import PokemonModel from './pokemon/Pokemon.model';

import QuestModel from './quest/Quest.model';

import TrainerModel from './trainer/Trainer.model';

import TypeModel from './type/Type.model';

import ZoneModel from './zone/Zone.model';
import StatusConstantHealItemModel from './item/StatusConstantHealItem.model';
import AbilityModel from './ability/Ability.model';
import GroupModel from './group/Group.model';
import PSDKConfig from './PSDKConfig';
import CreditsConfigModel from './config/CreditsConfig.model';
import DisplayConfigModel from './config/DisplayConfig.model';
import GraphicConfigModel from './config/GraphicConfig.model';
import InfosConfigModel from './config/InfosConfig.model';
import LanguageConfigModel from './config/LanguageConfig.model';
import SaveConfigModel from './config/SaveConfig.model';
import SceneTitleConfigModel from './config/SceneTitleConfig.model';
import SettingsConfigModel from './config/SettingsConfig.model';
import TextsConfigModel from './config/TextsConfig.model';
import DevicesConfigModel from './config/DevicesConfig.model';
import NaturesConfigModel from './config/NaturesConfig.model';
import DexModel from './dex/Dex.model';
import GameOptionsConfigModel from './config/GameOptionsConfig.model';
import MapLinkModel from './maplinks/MapLink.model';

export const entitiesMap: {
  [klass: string]: Serializable<PSDKEntity>;
} = Object.assign(
  {},
  ...[
    AllPPHealItemModel,
    BallItemModel,
    ConstantHealItemModel,
    StatusConstantHealItemModel,
    EVBoostItemModel,
    EventItemModel,
    FleeingItemModel,
    HealingItemModel,
    ItemModel,
    LevelIncreaseItemModel,
    PPHealItemModel,
    PPIncreaseItemModel,
    RateHealItemModel,
    RepelItemModel,
    StatBoostItemModel,
    StatusHealItemModel,
    StatusRateHealItemModel,
    StoneItemModel,
    TechItemModel,
    MoveModel,
    PokemonModel,
    QuestModel,
    TrainerModel,
    TypeModel,
    ZoneModel,
    AbilityModel,
    GroupModel,
    DexModel,
    MapLinkModel,
  ].map((m) => ({ [m.klass]: m }))
);

export const entitiesSerializer: {
  [klass: string]: TypedJSON<PSDKEntity>;
} = Object.fromEntries(Object.entries(entitiesMap).map(([k, v]) => [k, new TypedJSON(v)]));

export const entitiesMapConfig: {
  [klass: string]: Serializable<PSDKConfig>;
} = Object.assign(
  {},
  ...[
    CreditsConfigModel,
    DevicesConfigModel,
    DisplayConfigModel,
    GraphicConfigModel,
    InfosConfigModel,
    LanguageConfigModel,
    SaveConfigModel,
    SceneTitleConfigModel,
    SettingsConfigModel,
    TextsConfigModel,
    GameOptionsConfigModel,
    NaturesConfigModel,
  ].map((m) => ({ [m.klass]: m }))
);

export const entitiesConfigSerializer: {
  [klass: string]: TypedJSON<PSDKConfig>;
} = Object.fromEntries(Object.entries(entitiesMapConfig).map(([k, v]) => [k, new TypedJSON(v)]));
