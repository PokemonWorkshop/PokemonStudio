# Project state

This module aim to separate the whole project state into its own concern so we avoid spreading a ton of project state logic inside the front-end. Each project state action should be declared as a function bound to window.stateApi, those function will be either query or mutations.

## Currently exported functions

All the functions are available through `window.stateApi`. They are currently defined as "Backend Tasks" but it would be better to turn them into promises.

- `load({ projectPath: string, mainLanguage: string }, s, e, p)`: Load all the entities and the main texts from the provided path in the mainLanguage.
- `save({}, s, e, p)`: Save all the modified entities and the modified CSV files. This action clears the history (CTRL+Z).
- `getEntity({ type: string, dbSymbol: string}, s, e)`: Gets an entity based on its type and its dbSymbol.
- `setEntity({ type: string, dbSymbol: string, entity: unknown }, s, e)`: Set an entity to a new value, push current value in previous of history and clears next values of history.
- `getTextKeys({}, s, e)`: Give the list of text handlers and entity lists as `{ handlers: string[], lists: string[] }`.
- `getEntityList({ key: string }, s, e)`: Get the list of entity as `SelectOption[]` where value is dbSymbol and label is name in main language. The key argument is expected to be one of `lists` value from `getTextKeys`.
- `getText({ key: string, index: number, language?: string }, s, e)`: Get a single text entry based on `key` and `index`. `key` is expected to be one of the `handlers` value from `getTextKeys`, `index` is usually `textId` or `id` of entity.
- `getTextColumn({ key: string, language: string }, s, e)`: Get a whole column of text based on `key`.
- `setText({ key: string, index: number, text: string, entityHint?: { entityType: string, propertyInEntity: string }, language?: string }, s, e)`: Set the `text` value in the handler `key` at `index`. If `entityHint` is provided, the corresponding entity list will be updated. Example for entityHint: `{ entityType: 'creature', propertyInEntity: 'name' }`.
- `dataToSaveState({}, s, e)`: Returns a `{ hasDataToSave: boolean }` object that states if there's data to save.
- `getEntityText({ type: string, dbSymbol: string }, s, e)`: Get all the texts of a single entity.
- `undoSetEntity({ type: string, dbSymbol: string }, s, e)`: Undo the last `setEntity` for an entity based on its type and its dbSymbol.
- `redoSetEntity({ type: string, dbSymbol: string }, s, e)`: Redo the last undone `setEntity` for an entity based on its type and its dbSymbol.

Note: The Project state is currently not handling `project.studio` file.

## How those functions should be integrated

Ideally, most of them should be integrated with the help of `react-query`. The idea is that `react-query` implements a caching mechanism allowing two things:

- Stability of data loading, using a query will output the same result everywhere as `react-query` implement strong synchronization mechanism
- Ability to transparently re-load queries after mutations: you can ask the client to reload the entityList when editing the text of an entity leaving this issue to the front-end instead of the project state management.

Example uses:

```ts
const useDexData = (dbSymbol: string) =>
  useQuery({
    queryKey: ['entity:dex', dbSymbol],
    queryFn: () => new Promise((r, rej) => window.stateApi.getEntity({ type: 'dex', dbSymbol }, r, rej)),
  });

const useSetDexData = () =>
  useMutation({
    mutationFn: ({ dbSymbol, entity }: { dbSymbol: string; entity: StudioDex }) =>
      new Promise((r, rej) => window.stateApi.setEntity({ type: 'dex', dbSymbol, entity }, r, rej)),
    onSuccess: (_, { dbSymbol }) => queryClient.invalidateQueries({ queryKey: ['entity:dex', dbSymbol] }),
  });

const useDexList = () =>
  useQuery({
    queryKey: ['list:dex'],
    queryFn: () => new Promise((r, rej) => window.stateApi.getEntityList({ key: 'dex:name' }, r, rej)),
  });

const useEntityTextUpdate = () =>
  useMutation({
    mutationFn: ({ key, index, text, entityHint }: SetTextInProjectStateInput) =>
      new Promise((r, rej) => window.stateApi.setText({ key, index, text, entityHint }, r, rej)),
    onSuccess: (_, { entityHint }) => {
      if (entityHint) {
        queryClient.invalidateQueries({ queryKey: [`list:${entityHint.entityType}`] });
      }
    },
  });
```

Note: those has not been tested or implemented, they might need tweaking, especially for `useEntityTextUpdate` that might fail to properly debounce mutation due to the lack of key.

### Additional notes

As you can see, the Dex requires few functions related to creatures. For instance, knowing if all the creatures has been added to the dex, adding all the creatures to the dex (with some logic). The "add all creature to the dex" must be part of the project state as it only should know what's good to do. The Dex UI itself should only show attributes about the dex at let you modify dex attributes, it should not implement any sort of business logic (eg. adding Pichu before Pikachu).

## How to declare a new entity type

Entity types are defined in `loadDefinitions.ts` using the method: `registerEntity(entityType, pathGlob, schema)`.

Arguments:

- `entityType`: Actual `type` value for `getEntity`, tells to which kind of entity all the files matching `pathGlob` will are storing.
- `pathGlob`: Path to a single entity file (no `*`) or to many entities `*.json`.
- `schema`: Zod schema to use to validate all the entities stored in the files matching `pathGlob`.

Note: `pathGlob` is not an actual glob. It can only list all the files from a folder or take a single file.

Examples:

```ts
registerEntity('ability', 'Data/Studio/abilities/*.json', ABILITY_VALIDATOR);
registerEntity('config', 'Data/configs/credits_config.json', CREDIT_CONFIG_VALIDATOR);
registerEntity('config', 'Data/configs/devices_config.json', DEVICES_CONFIG_VALIDATOR);
```

## How to declare entity texts

Entity texts are defined in using the method: `registerEntityText(entityType, description)`.

Arguments:

- `entityType`: Actual `type` value for `getEntity`, tells to which entity the text description is tied to.
- `description`: Description of the text of the entity. Gives many information such as how it's extracted from entity, ID of the file etc... (See examples below for more info)

### Define the text with a simple file id that also defines an entity list

Method to use: `fileIdDescriptorWithList(propertyInEntity, discriminator, fileId, isSystemFile = false, refinement)`

Arguments:

- `propertyInEntity`: Property in the `getEntityText` that receives the string. Also constructs the key of the text for `getTextKeys` (key=`${entityType}:${propertyInEntity}`).
- `discriminator`: Property to use in the entity to get the index of the text in the CSV file.
- `fileId`: ID of the CSV file.
- `isSystemFile`: If false, reads the CSV file from Dialogs, if true, reads it from Studio.
- `refinement`: Optional function to refine the texts of the entity list.

Examples:

```ts
registerEntityText('ability', fileIdDescriptorWithList('name', 'textId', ABILITY_NAME_TEXT_ID));
registerEntityText(
  'config',
  fileIdDescriptorWithList('text_info[x].name', 'textId', TEXT_INFO_NAME_TEXT_ID, true, (list) =>
    ((list.find(([key]) => key === 'text_info')?.[1] ?? []) as StudioTextInfo[]).map((v, i) => [`${i}`, v])
  )
);
```

### Define the text with a simple file id

Method to use: `fileIdDescriptor(propertyInEntity, discriminator, fileId, isSystemFile = false)`

Arguments:

- `propertyInEntity`: Property in the `getEntityText` that receives the string. Also constructs the key of the text for `getTextKeys` (key=`${entityType}:${propertyInEntity}`).
- `discriminator`: Property to use in the entity to get the index of the text in the CSV file.
- `fileId`: ID of the CSV file.
- `isSystemFile`: If false, reads the CSV file from Dialogs, if true, reads it from Studio.

Example:

```ts
registerEntityText('ability', fileIdDescriptor('description', 'textId', ABILITY_DESCRIPTION_TEXT_ID));
```

### Define the text with a CSVAccess

Please don't. (It's messed up).

## How to get the list of all the texts files

Get the select options of text info:

```ts
window.stateApi.getEntityList({ key: 'config:text_info[x].name' }, s, e);
```

Get the list of text info:

```ts
window.stateApi.getEntity({ type: 'config', dbSymbol: 'text_info' }, s, e);
```
