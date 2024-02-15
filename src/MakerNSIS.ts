import { MakerBase, MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import { buildForge, PackagerOptions } from 'app-builder-lib';

export default class MakerNSIS extends MakerBase<PackagerOptions> {
  name = 'nsis';
  defaultPlatforms: ForgePlatform[] = ['win32'];

  isSupportedOnCurrentPlatform(): boolean {
    return process.platform === 'win32';
  }

  async make(options: MakerOptions): Promise<string[]> {
    const packagerOptions: PackagerOptions = {
      config: {
        win: {
          icon: options.forgeConfig.packagerConfig.icon,
        },
      },
      ...this.config,
    };

    return buildForge(options, {
      win: [`nsis:${options.targetArch}`],
      ...packagerOptions,
    });
  }
}

export { MakerNSIS };
