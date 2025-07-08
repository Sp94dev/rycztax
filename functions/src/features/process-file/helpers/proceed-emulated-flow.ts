import { getStorage } from 'firebase-admin/storage';
import * as functions from 'firebase-functions';
import { ObjectMetadata } from 'firebase-functions/v1/storage';

export const proveedEmulatorFlow = async (
  object: ObjectMetadata,
  filePath: string,
) => {
  functions.logger.log(
    'EMULATOR DETECTED: Using mock data instead of calling Document AI.',
  );

  const newFileName = 'mocked-file-name.wtf';

  const destinationPath = filePath
    .replace('uploads/', 'proceeds/')
    .replace(/[^/]*$/, newFileName);

  try {
    await getStorage()
      .bucket(object.bucket)
      .file(filePath)
      .move(destinationPath);
    functions.logger.log(
      `MOCK: File moved successfully within emulator storage.`,
    );
  } catch (moveError) {
    functions.logger.error(
      `MOCK ERROR: Failed to move file within emulator storage: ${moveError}`,
    );
  }
};
