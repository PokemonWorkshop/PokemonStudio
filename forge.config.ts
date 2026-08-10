import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerAppImage } from '@reforged/maker-appimage';
import { MakerNSIS } from './src/MakerNSIS';

const config: ForgeConfig = {
  packagerConfig: {
    icon: './assets/icon',
    executableName: process.platform !== 'linux' ? undefined : 'pokemon-studio',
    extraResource: ['psdk-binaries', 'app-update.yml', 'placeholder.svg'],
    name: process.platform === 'darwin' ? 'Pokemon Studio' : undefined,
  },
  rebuildConfig: {},
  makers: [
    new MakerNSIS({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({ options: { icon: './assets/icon.png' } }),
    new MakerDeb({ options: { icon: './assets/icon.png' } }),
    new MakerAppImage({ options: { icon: './assets/icon.png' } }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'PokemonWorkshop',
          name: 'PokemonStudio',
        },
        draft: true,
      },
    },
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main/index.ts',
          config: 'config/vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'config/vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'config/vite.renderer.config.mts',
        },
      ],
    }),
  ],
};

export default config;
