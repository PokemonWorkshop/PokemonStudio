import fs from 'fs';
import path from 'path';

/**
 * Delete the psdk.dat file
 * @param projectPath The project path
 */
export const deletePSDKDatFile = (projectPath: string) => {
  const psdkDatFilePath = path.join(projectPath, 'Data', 'Studio', 'psdk.dat');
  if (fs.existsSync(psdkDatFilePath)) fs.unlinkSync(psdkDatFilePath);
};
