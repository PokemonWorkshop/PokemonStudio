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

## Get JSON Files from PSDK

1. Have a PSDK project or make sure `psdk-lite` has been pulled using `git submodule update --init --recursive`
2. Import the PSDK project (unless you have pulled `psdk-lite`)

## Install

- **If you have installation or compilation issues with this project, please see [debugging guide](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/400)**

First, clone the repo via git and install dependencies:

```bash
git clone git@gitlab.com:pokemonsdk/pokemon-studio.git.pokemon-studio
npm install yarn -g
cd pokemon-studio
git submodule update --init --recursive
yarn
```

## Starting Development

Start the app in the `dev` environment:

```bash
yarn start
```

## Editor Configuration (not required) [from ERB docs](https://electron-react-boilerplate.js.org/docs/editor-configuration)

If you would like to manually install the plugins you can use the code executable. If you have code in your PATH, you can run the following command:

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension dzannotti.vscode-babel-coloring
code --install-extension EditorConfig.EditorConfig
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

- Create the model `src/models/entities/foo.model.ts`, a class that takes a data dictionary as a constructor parameter and assigns the data fields to itself.
- Create the functional component `src/views/components/data/foo.model.tsx` which has the property of an ID (In PSDK the data is organized by ID) and retrieves an object from the `GlobalStateProvider` using its ID

There is an example of a data component in the source code.

To modify an object with a rather simple syntax in an immutable way (necessary to update the GlobalStateProvider with `setState`) the use of the library [immutability-helper](https://github.com/kolodny/immutability-helper) is strongly recommended.

## Electron Services

For the creation of a service, check `src/services/time.info.channel.service.ts` example which implements a service that retrieves the current date. Each added service should be added to the `ipcChannels` array in `src/main.dev.ts` (to activate the listeners).

The request of a service is done by calling the following code :

```typescript
const ipc = new IpcService();
ipc.send<TypeOfTheResponse>('name-of-the-channel'); // asynchronous call
```

### Example

Here is an example of how to use the service that gives the current date, a button that updates the view with the current date :

```typescript
  const [state, setState] = useGlobalState();
  const update = () => {
    ipc
      .send<{ date: string }>('time-info')
      .then(({ date }) =>
        setState((prev) => ({
          ...prev,
          date: date,
        }))
      )
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <span>Date: {state.date}</span>
      <button type="button" onClick={update}>
        Update
      </button>
    </div>
  );
};
```

## Unit Tests

Jest is the library used to test, every new implementations will need to be tested by Unit tests.
Doc : [Follow the link](https://jestjs.io/docs/en/tutorial-react).

## React best practices

In that project, we choosed to use these rules :

- Use **Functional Component** instead of Class Component
- Use **Hook**
- Create Unit tests

## Build an App [from ERB docs](https://electron-react-boilerplate.js.org/docs/building)

Building a production version of your app will optimize the JS, CSS, and SASS of your application.

To create a production build, run yarn build:

```bash
yarn build
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```

## Packaging for Multiple platforms

First refer to [Multi Platform Build](https://www.electron.build/multi-platform-build) for dependencies

Then :

```bash
yarn package-all
```

To package apps with options:

```bash
yarn package --[option]
# Example: yarn package --mac
```

## Adding Assets [from ERB docs](https://electron-react-boilerplate.js.org/docs/adding-assets)

Out of the box, ERB supports the following assets:

**Asset Supported Extensions**
Images : .jpg, .png, .jpg
Fonts : .svg, .ttf, .eot

**Use in code :**

```js
import catImage from './cat.jpg';

const CatComponent = () => {
  return <img src={catImage} />;
};
```

## Adding Dependencies

**How to add modules to the project**
You will need to add other modules to this boilerplate, depending on the requirements of your project. For example, you may want to add node-postgres to communicate with PostgreSQL database, or material-ui to reuse React UI components.

### Module Structure

This boilerplate uses a two package.json structure. This means you will have two package.json files :

**./package.json** in the root of your project
**./app/package.json** inside app folder

**Rule of thumb is:** all modules go into ./package.json except for native modules, or modules with native dependencies or peer dependencies. Native modules, or packages with native dependencies should go into ./app/package.json.

1. If the module is native to a platform (like node-postgres), it should be listed under dependencies in ./app/package.json
2. If a module is imported by another module, include it in dependencies in ./package.json. See this ESLint rule. Examples of such modules are material-ui, redux-form, and moment.
3. Otherwise, modules used for building, testing, and debugging should be included in devDependencies in ./package.json.

## Styling

### CSS modules

This boilerplate is configured to use css-modules out of the box.

All .css file extensions will use css-modules unless it has .global.css.

If you need global styles, stylesheets with .global.css will not go through the css-modules loader. e.g. app.global.css

If you want to import global css libraries (like bootstrap), you can just write the following code in .global.css:

```css
@import '~bootstrap/dist/css/bootstrap.css';
```

### How to import CSS file from node_modules

Say, you want to import css file from font-awesome module. Use following syntax

```css
@import '~font-awesome/css/font-awesome.css';
```

Note the tilde ~ placed before module name.

Similar syntax is used for SCSS too.

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
