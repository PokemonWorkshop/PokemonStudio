# Pokémon Studio

Pokémon Studio is a standalone software allowing people to create their monster taming game by:

- editing game data (creatures, items...),
- editing game settings,
- editing and translating game texts,
- updating [Pokémon SDK](https://gitlab.com/pokemonsdk/pokemonsdk) (game engine & starter kit),
- managing maps and map links from Tiled (coming with 2.0 version),
- manage events (coming with 3.0 version).

## Useful links

- License: [English](LICENSE.md) - [Français](LICENSE-FR.md)
- [GitHub project](https://github.com/users/PokemonWorkshop/projects/1)
- [Pokémon Studio Wiki](https://github.com/PokemonWorkshop/PokemonStudio/wiki)
- [Pokémon Studio Figma](https://www.figma.com/file/xglOHHLb96zfPMTXd3v8i9/Pok%C3%A9mon-Studio)

## Important notice

If you plan on using, modifying or doing anything related to Pokémon Studio. You must read and comply to the [license](LICENSE.md).

## Development setup

### Prerequisites

You'll need to **install NodeJS** first: https://nodejs.org/en/download

We recommend using [NVM](https://github.com/nvm-sh/nvm) (MacOS/Linux) or [Volta](https://volta.sh/) (Windows) to manage easely your NodeJS version.
We use the version **20** of NodeJS.

### Cloning and installation

Next, clone the repo via git and install dependencies:

```bash
git clone git@github.com:PokemonWorkshop/PokemonStudio.git
cd PokemonStudio
git submodule update --init --recursive
npm i
```

### Get the PSDK binaries

The PSDK binaries are important, they let Studio start PSDK projects and perform operations over them.

To install them follow those steps:

1. Download the binary archive from

- https://download.psdk.pokemonworkshop.com/binaries/

2. Extract the content of the archive to the root of this project

### Adding the essential development extensions

To make sure your files gets formatted properly, install the following extension: `esbenp.prettier-vscode`.

If the documents do not get formatted while saving (eg. " turning into ' in ts files) make sure you did enable format on save and that prettier is the Typescript/JS formatter.

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

This opens the Pokémon Studio App, if you can open/create and edit a project you're all set. Your next step is taking a look to [CodeGuidelines.md](CodeGuidelines.md) to understand the project structure and what are the recommendations.

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## Texts and translations

Before doing anything, please communicate on the [Pokémon Workshop discord](https://discord.gg/0noB0gBDd91B8pMk) server so you're not wasting time on things that are already done.

To start with the translations, you can run the script: `assets\i18n\json2csv.rb`  
This script will create a `translations.csv` file, you can replace `your_language` with the language code of your language (eg. ko for Korean).

Once you're done with the translations, the script `assets/i18n/csv2json.rb` will convert `translations.csv` to the respective i18n json files. The script ask you about location and locale of the translations.

In each language directory the `index.js` file is used to group all the .json files in a single export, don't forget to build it when adding a new language (this might as simple as copying it from another translation folder).

> [!NOTE]
> We're planning on using [Weblate](https://weblate.org/) to make sure Pokémon Studio localization will be way easier to do.

### Add a new locale to Studio

This section assumes you did what was mentioned above.

In the `src\i18n.ts` file, add a new line `import translationXX from '../assets/i18n/xx';` around the 8th one where:

- `XX` if the capitalized code name of the language (`EN` for English),
- `xx` the same code name but in lower case (`en` for English).

In the same file, add a new line `xx: translationXX`, around the 28th. Same logic for XX & xx.
