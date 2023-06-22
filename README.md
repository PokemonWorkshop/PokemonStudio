# Description

Pokémon Studio will be a standalone software allowing people to create their Pokémon fangame by editing data configuration & manage events.
Load and save a project, update PokémonSDK (the Starter Kit), import maps from Tiled software to add events. Seems like it's time to leave aside RPG Maker XP and Ruby Host for a more modern and suitable tool!

## Useful links

- ClickUp folder: https://app.clickup.com/2606574/v/b/f/13144081?pr=4643354
- Specifications: https://app.clickup.com/2606574/v/e/2fhfe-1436
- Tree Structure: https://app.diagrams.net/#G1CqnzNqmpbQ-S41zNSOGdTY8fpMyNxGpY
- Google Drive folder: https://drive.google.com/drive/folders/1uPbjHuuNgQFMVyUmQmDFhjUu2af0lA7L?usp=sharing
- Pokémon Studio Figma: https://www.figma.com/file/xglOHHLb96zfPMTXd3v8i9/Pok%C3%A9mon-Studio

- Repo GitLab (Angular) Deprecated: https://gitlab.com/pokemonsdk/psdk-editor

## Get the PSDK binaries (windows)

1. Download the binary archive from https://www.mediafire.com/file/4lzb21b5tqte8ya/psdk-binaries.7z/file
2. Extract the content of the archive to the root of this project

The PSDK binaries are important, they let Studio start PSDK projects and perform operations over them.

## How to start developping

### Prerequires

You'll need to **install NodeJS** first: https://nodejs.org/en/download

We recommend using [NVM](https://github.com/nvm-sh/nvm) (MacOS/Linux) or [Volta](https://volta.sh/) (Windows) to manage easely your NodeJS version.
We use the version **18** of NodeJS.

### Installation

Next, clone the repo via git and install dependencies:

```bash
git clone git@gitlab.com:pokemonsdk/pokemon-studio.git.pokemon-studio
cd pokemon-studio
git submodule update --init --recursive
npm i
```

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

## Editor Configuration (not required)

If you would like to manually install the plugins you can use the code executable. If you have code in your PATH, you can run the following command:

```bash
code --install-extension dbaeumer.vscode-eslint
```

## Folders Hierarchy

- Views
  - Pages : The different app screens
  - Components : Small components shared in all the software
- Controllers
- Services : Electron services responsible to write and read files
- Models
  - Entities: Models corresponding to PSDK json files
  - Items : Models used by controllers and views
- Utils
- Assets
  - icons
    - \*.svg
  - i18n
    - \*.json

## GlobalState

The global state of the application is managed using the [react-tracked](https://react-tracked.js.org/) library to prevent re-renders is one of performance issues in React.

Here is an example of how to read and modify the global state :

```js
import { useGlobalState } from './GlobalStateProvider';

const Counter = () => {
  const [state, setState] = useGlobalState();
  const increment = () => {
    setState((prev) => ({
      ...prev,
      count: prev.count + 1,
    }));
  };
  return (
    <div>
      <span>Count: {state.count}</span>
      <button type="button" onClick={increment}>
        +1
      </button>
    </div>
  );
};
```

## Create Data components

Data components are components whose purpose is to display the data of a PSDK project. The data of a PSDK project will be loaded into the GlobalStateProvider in the form of :

```
projectData/
├─ items/
│  ├─ 0/
│  │  ├─ Item0
│  ├─ 1/
│  │  ├─ Item1
│  ├─ ...
├─ pokemons/
│  ├─ 0/
│  │  ├─ Pokemon0
...
```

If you want to create the component for a data `foo` for example, you must :

- Create the model `src/models/entities/foo.ts`, a type representing the data you wish to use (item, move, etc.).
- Create the functional component `src/views/components/database/foo.tsx` which has the property of a dbSymbol (In PSDK the data is organized by dbSymbol) and retrieves an object from the `GlobalStateProvider` using its dbSymbol.

There is an example of a data component in the source code.

To modify an object with a rather simple syntax in an immutable way (necessary to update the GlobalStateProvider with `setState`) the use of the library [immutability-helper](https://github.com/kolodny/immutability-helper) is strongly recommended.

## Electron Services

For the creation of a service, check `src/backendTasks/chooseFile.ts` example which implements a service that retrieves the chosen file. Each added service should be registered in `src/main/index.ts` (to activate the listeners).

The service must be added to the `window.api` (in the `preload.ts` file) to be able to call the service from the front end.

In the `Window` interface :

```typescript
  chooseFile: BackendTaskWithGenericErrorAndNoProgress<{ name: string; extensions: string[] }, { path: string; dirName: string }>;
  cleanupChooseFile: () => void;
```

In the `contextBridge.exposeInMainWorld` :

```typescript
    chooseFile: (taskPayload, onSuccess, onFailure) => {
    // Register success event
    ipcRenderer.once(`choose-file/success`, (_, payload) => {
      ipcRenderer.removeAllListeners(`choose-file/failure`);
      onSuccess(payload);
    });
    // Register failure event
    ipcRenderer.once(`choose-file/failure`, (_, error) => {
      ipcRenderer.removeAllListeners(`choose-file/success`);
      onFailure(error);
    });
    // Call service
    ipcRenderer.send('choose-file', taskPayload);
  },
  cleanupChooseFile: () => {
    ipcRenderer.removeAllListeners(`choose-file/success`);
    ipcRenderer.removeAllListeners(`choose-file/failure`);
  }
```

The request of a service is done by calling the following code :

```typescript
window.api.chooseFile(
  { name: 'Pokémon Studio Project', extensions: ['studio'] },
  ({ path }) => {
    // success
  },
  () => {
    // failure
  }
);
```

### Example

There are examples of `chooseFile` being used in hooks `useChooseFile`, `useProjectLoad` and `useProjectNew`.

## Unit Tests

Jest is the library used to test, every new implementations will need to be tested by Unit tests.
Doc : [Follow the link](https://jestjs.io/docs/en/tutorial-react).

## React best practices

In that project, we choosed to use these rules :

- Use **Functional Component** instead of Class Component
- Use **Hook**
- Create Unit tests

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## Texts and translations

The texts and translations of PSDK Studio can be found at the following address: https://drive.google.com/drive/u/0/folders/1nCnmTwk-7J1crFVQdlJ_29sOgpfV19Z5.

To import them in i18n format, you must first export from google sheets in csv format.

Then the script `assets/i18n/csv2translations.py` will do the job by placing the json files in the right place (each language is represented by a directory). The script simply takes as argument the .csv file to be converted.

In each language directory the `index.js` file is used to group all the .json files in a single export.

### How to use i18n

```js
import { useTranslation } from 'react-i18next';
...
const MyHook = () => {
  const { t } = useTranslation(['namespace1', 'namespace2']); // You must choose the namespaces to be used in the Hook here
  return <p>{t('namespace1:key')}</p>
};
```

Where `namespace` is the file where the text is defined and `key` is the key to the text to be translated.

For example, to get the translation of "New project" found in `homepage.json` you will have to use `'homepage:new_project'`.
