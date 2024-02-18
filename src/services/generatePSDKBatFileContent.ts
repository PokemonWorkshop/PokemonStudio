import { getPSDKBinariesPath } from './getPSDKVersion';

export const generatePSDKBatFileContent = () => `@@ECHO OFF
CHCP 65001
set PSDK_BINARY_PATH=${getPSDKBinariesPath()}\\
"%PSDK_BINARY_PATH%ruby.exe" --disable=gems,rubyopt,did_you_mean Game.rb %*
`;

export const generateGameMacFileContent = (projectPath: string) => `#!/bin/bash
cd "${getPSDKBinariesPath()}/ruby-dist"
source ./setup.sh
cd "${projectPath}"
PSDK_BINARY_PATH="${getPSDKBinariesPath()}/" ruby Game.rb "$@"
`;

export const generateGameLinuxFileContent = (projectPath: string) => `#!/bin/bash
cd "${getPSDKBinariesPath()}/ruby-dist"
source ./setup.sh
cd "${projectPath}"
PSDK_BINARY_PATH="${getPSDKBinariesPath()}/" ruby --disable=gems,rubyopt,did_you_mean Game.rb "$@"
`;
