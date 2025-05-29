# Pokémon Studio

Pokémon Studio is a standalone software allowing people to create their monster taming game by:

- editing game data (creatures, items...),
- editing game settings,
- editing and translating game texts,
- updating [Pokémon SDK](https://gitlab.com/pokemonsdk/pokemonsdk) (game engine & starter kit),
- managing maps and map links from Tiled (coming with 2.0 version),
- manage events (coming with 3.0 version).

[![Weblate translation status](https://hosted.weblate.org/widget/pokemon-studio/svg-badge.svg)](https://hosted.weblate.org/engage/pokemon-studio/?utm_source=widget)

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

1. Download the [Pokémon SDK binary archive](https://github.com/PokemonWorkshop/PokemonSDKBinaries/releases) (Windows, Linux & MacOS M1+).

2. Extract the content of the archive to the psdk-binaries folder.

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

## Translating

You can translate Pokémon Studio application texts by using the convinient web-interface on the [Pokémon Studio Weblate](https://hosted.weblate.org/engage/pokemon-studio/). There you can add new languages to the App and improve existing translations. For the technically more experienced, you can send a merge request.

Here are some Weblate statistics.

[![Translation status](https://hosted.weblate.org/widget/pokemon-studio/287x66-white.png)](https://hosted.weblate.org/engage/pokemon-studio/?utm_source=widget)

[![Translation status](https://hosted.weblate.org/widget/pokemon-studio/multi-auto.svg)](https://hosted.weblate.org/engage/pokemon-studio/?utm_source=widget)

Before doing anything, please communicate on the [Pokémon Workshop discord](https://discord.gg/0noB0gBDd91B8pMk) server so you're not wasting time on things that are already done.

### Add a new locale to Studio

In the `package.json` file, add a new line `"xx": true` at the end of the `languages` object. `xx` is the code name of the language (i.e. `en` for English, for `assets/i18n/en.json`).

You can set a locale to `false` if you don't want to be loaded at runtime.
If a locale is not listed in the `languages` object, the json file will be deleted so make sure to just set it to `false` if you want to keep it.
