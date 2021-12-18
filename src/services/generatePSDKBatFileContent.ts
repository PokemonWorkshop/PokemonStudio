import { getPSDKBinariesPath } from './getPSDKVersion';

export const generatePSDKBatFileContent = () => `@@ECHO OFF
CHCP 65001
set PSDK_BINARY_PATH=${getPSDKBinariesPath()}\\
"%PSDK_BINARY_PATH%ruby.exe" --disable=gems,rubyopt,did_you_mean Game.rb %*
`;
