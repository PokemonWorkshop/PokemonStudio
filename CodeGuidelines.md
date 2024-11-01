# Code Guidelines

This document explains the structure of Pokémon Studio and few software decisions that might affect your development practice while improving Pokémon Studio.

## Glossary

|             Term | Definition                                                                                                                                                                                                                                       |
| ---------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     Main Process | Pokémon Studio is built with [Electron](https://www.electronjs.org), the main process is responsive of accessing the files, folder and other components of the operating system. For web developer it's the strict equivalent of the "back-end". |
| Renderer Process | The renderer process is the Browser window the user is interacting with. For web developer it's the equivalent of the "front-end".                                                                                                               |
|             PSDK | Short for Pokémon SDK, game engine emulating the Pokémon games from Pokémon's 2D era.                                                                                                                                                            |
|          service | Piece of code responsive of helping the renderer process to perform a task that can only be done in the main process (eg. reading project configuration files).                                                                                  |
|              CTA | Call To Action, primary button performing the action the user might want to do (eg. creating a new entity)                                                                                                                                       |

## Folder Structure

### Repository structure

The repository structure is the first level of the folder structure, it's about what the main folder are about:

|          Folder | Description                                                                                                               |
| --------------: | :------------------------------------------------------------------------------------------------------------------------ |
|        `assets` | Folder containing all the mandatory assets for Pokémon Studio to work: Fonts, i18n translation files & icons for the app. |
|        `config` | Folder containing the webpack configuration so the main & renderer processes can be built properly.                       |
| `psdk-binaries` | Folder containing the runnable PSDK version so user don't have to download PSDK for each of their projects.               |
|           `src` | Folder containing the source code of Pokémon Studio.                                                                      |

The root of the repository contains several configuration files (like `.prettierrc`), you often won't have to deal with them (putting aside `package.json` when adding new dependencies).

### Src folder structure

The `src` folder contains several folder which all have their specific goals. This table explain each of the folders inside of `src`.

|         Folder | Description                                                                                                                        |
| -------------: | :--------------------------------------------------------------------------------------------------------------------------------- |
|       `@types` | Folder containing the generic type definition for i18n and styles.                                                                 |
| `backendTasks` | Folder containing the source code of each of the services.                                                                         |
|         `main` | Folder defining the main process (how to access each services, all the menu entries, default window size etc...)                   |
|   `migrations` | Folder defining all the data migration Pokémon Studio should perform when loading a project from older versions of Pokémon Studio. |
|       `models` | Folder defining the types & validation of all the entities a Pokémon Studio project might use (abilities, creatures etc...)        |
|     `services` | Legacy code that was not migrated to `backendTasks` yet.                                                                           |
|        `utils` | Folder containing various function & global hooks Pokémon Studio needs to work.                                                    |
|        `views` | Folder containing all the React Code allowing the user to interact with Pokémon Studio.                                            |

The `src` folder also contains very important files.
| File | Description
|-----:|:------
| `App.tsx` | File defining all the global routes & each react roots the app needs to work.
| `AppTheme.ts` | File defining all the colors, fonts, size & breakpoints from the Figma Design system.
| `GlobalStateProvider.tsx` | File defining the structure and global hook of the app Global State (a lot of things must become deprecated as global state is causing a lot of issues).
| `preload.ts` | File describing the API which helps the React code to communicate with all the services defined by the main process.

### Views folder structure

This folder contains all the front-end code of Pokémon Studio. It is divided in two main folders:

- `pages`: for all of the screens (organized by route)
- `components`: for all the components used by screens (organized by component type)

The `components` folder structure is quite complex and might be reworked in the future. To know how to use that folder, look at what the screens are doing. You can control click on a component to get into the component code. You can use mimicry to add new screens and their components.

## Libraries

In order to build Pokémon Studio we use several libraries, here's the list of the most important ones.

|                                                                           Library | Description                                                                                                               |
| --------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------ |
|                                        [React](https://react.dev/reference/react) | Popular front-end development framework, we use it to abstract all the interactions between the user and the app.         |
|                [react-router-dom](https://reactrouter.com/en/main/start/tutorial) | Library allowing us to defined the routes for all the the app screens & navigate between the screens.                     |
|                                        [react-i18next](https://react.i18next.com) | Library allowing us to dynamically render the app in all the available languages.                                         |
|                                [styled-components](https://styled-components.com) | Library allowing us to define the components styles in the same file as the definition of the component.                  |
|                          [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) | Library allowing us to nicely drag & drop stuff                                                                           |
|                                     [react-tracked](https://react-tracked.js.org) | Library we use to define & interact with the global state of the app                                                      |
| [react-virtualized](http://bvaughn.github.io/react-virtualized/#/components/List) | Library we use to create very big lists with scroll-ability                                                               |
|                                               [@xyflow/react](https://xyflow.com) | Library allowing us to create visually linked nodes (see MapLink screen).                                                 |
|                                                            [zod](https://zod.dev) | Library allowing us to define the validation schema of each of the entity and their type thanks to schema type inference. |

You might see more libraries in package.json. If they're not listed here that's probably because they are anecdotic or will be deprecated (eg. `react-select`).

## Concepts in the app

### Translation

Translation is working thanks to [react-i18next](https://react.i18next.com). We define all the translations by unit of meaning in `assets/i18n/{localeCode}/{unitOfMeaning}.json`.

As long as `assets/i18n/{localeCode}/index.js` and `src\@types\react-i18n.d.ts` are up-to-date, you should be able to access the translation helper using the hook `useTranslation`. See components or pages to know how it is being used.

### Styling

When we can, we abstract some components with `styled-components`. For example `<DatabasePageStyle>` defines the global structure of a Database screen.

The best we can do in regard of styling is converting all the design system into their own react component (TODO: write story book), this way we avoid styling duplication (copy-paste).

### DataBlocks

The DataBlocks are components resulting from the design system. DataBlocks shows data about a category of the current entity to the user.
Currently they're abstracted in a way that you can't just feed data into them but they're doing a pretty good job in being consistent interaction wise (cursor, hover effect, click handling).

Check the `src\views\components\database\pokemon\pokemonDataBlock` folder to have somewhat good examples of data block.

### Editors

The editors are dialogs showing from right part of the screen. They allow the user to define the data for the current entity (saved when closing) or new entities (saved when clicking on CTA).

The whole flow relies on the code of `src\views\components\editor\EditorOverlayV2.tsx`.
In short you need:

- a `dialogsRef` so editor can communicate their close actions and data blocks can open their corresponding editor.
- an `EditorOverlay` so the editor can be rendered properly based on data from the entity screen.

To see some examples, you can have a look at `src\views\components\database\pokemon\editors\PokemonEditorOverlay.tsx` which defines the editor overlay of the creature entity and `src\views\pages\database\Pokemon.page.tsx` which creates the `dialogsRef` all the DataBlock needs to open the expected editors.

### BackendTasks

The backend tasks is a concept allowing React and Electron to be friend. The service model of Electron supports Promises but unfortunately for us **JS do not support promise cancellation**. To counter that we had to go back to the callback times with the concept of BackEndTasks.

Basically, the BackEndTask consist of 3 channels:

- success channel (you get what you wanted)
- failure channel (you get your error feedback)
- progress channel (you get some info about progress of the task)

This mode of operation allows one big thing: if the app moves away from a task that isn't done, there will be no memory leak because the channels will all get removed from electron listeners!

#### Example of backend task

There's two main kind of backend tasks: progressing and instant tasks.

- Example of progressing backend task: [readProjectTexts](src/backendTasks/readProjectTexts.ts)
- Example of instant task: [fileExists](src/backendTasks/fileExists.ts)

Thanks to the `defineBackendServiceFunction` all we have to do is focus on the logic:

- If there is an error, throw one (string is sent because class instances cannot travel through ipc).
- If the result is computed, we normally return it.
- If there's any progress report to report, we call the sendProgress function with the extra event & channels parameters.

#### How to expose the backend task

To make the backend task available to the App you need to perform two task:

1. Call the return function from `defineBackendServiceFunction` in [main](src/main/index.ts)
2. Define the type and expose the backend task in [preload](src/preload.ts)

There is plenty of examples, you should follow those who use `defineBackendTask` and `BackendTaskWithGenericError` or `BackendTaskWithGenericErrorAndNoProgress`.

Note: You need to define both exposure to main world and backend task type.
Note: To avoid issues, you should use `import type` when you need information like Input type or Output type from where the backend task function is implemented.

### Page responsibility

In prior version of Pokémon Studio, the screens did a lot of things which lead to a lot of code duplication and readability issue. To improve that we created an epic about page responsibility. You can find the information about that in: [EPIC_Cleanup_responsibility_of_Studio.md](EPIC_Cleanup_responsibility_of_Studio.md).

To get a concrete example of what page responsibility is, look at `src\views\pages\database\Pokemon.page.tsx` then look at `src\views\pages\database\Trainer.page.tsx`. If you notice that the trainer screen looks like shit compared to the pokemon page code wise, you got the general idea behind page responsibility. Page only handle what they're supposed to handle: making up a `dialogsRef`, use a `ControlBar` and only display the data of the current entity.
