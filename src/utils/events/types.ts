export type RMXPEventPageCondition = {
  isSwitch1: boolean;
  isSwitch2: boolean;
  isVariable: boolean;
  isSelfSwitch: boolean;
  switch1Id: number;
  switch2Id: number;
  variableId: number;
  variableValue: number;
  selfSwitch: string;
};

export type RMXPEventPageGraphic = {
  tileId: number;
  characterName: string;
  characterHue: number;
  direction: number;
  pattern: number;
  opacity: number;
  blendType: number;
};

export type RMXPMoveCommand = {
  code: number;
  parameters: unknown[]; // Array containing the Move command arguments. The contents vary for each command.
};

export type RMXPMoveRoute = {
  isRepeat: boolean;
  isSkippable: boolean;
  list: RMXPMoveCommand[];
};

export type RMXPEventCommand = {
  code: number;
  indent: number;
  parameters: unknown[]; // Array containing the Event command arguments. The contents vary for each command.
};

export type RMXPEventPage = {
  condition: RMXPEventPageCondition;
  graphic: RMXPEventPageGraphic;
  moveType: number;
  moveSpeed: number;
  moveFrequency: number;
  moveRoute: RMXPMoveRoute;
  isWalkAnime: boolean;
  isStepAnime: boolean;
  isDirectionFix: boolean;
  isThrough: boolean;
  isAlwaysOnTop: boolean;
  trigger: number;
  list: RMXPEventCommand[];
};

export type RMXPEvent = {
  id: number;
  name: string;
  x: number;
  y: number;
  pages: RMXPEventPage[];
};
