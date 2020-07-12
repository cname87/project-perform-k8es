/**
 * Utility to upload .env-e2e to GCP Local Storage.
 *
 * When GCP triggers a build from github it needs to copy the .env files from a GCP Local Storage bucket (as these are not committed to git) which means that the files on the GCP Local Storage environment must be in sync with those on the local development environment.
 *
 * Usage:
 *
 * The utility is run from an npm script:
 * "npm run ts-node syncGCPStorage.js.
 *
 * This utility is configured with:
 * - Path to gcpStorageKey.json for GOOGLE_APPLICATION_CREDENTIALS environment variable.
 * - Cloud Storage bucket name.
 * - Paths to files to be uploaded.
 * - Paths on Cloud Storage.
 *
 * This utility just loads up the frontend secret files only.
 *
 * NOTE: The structure of the Cloud Storage bucket (set by the paths on Cloud Storage below) must match the directory structure of the application. When the files are downloaded during Cloud Build they are copied recursively and saved loud Storage file structure.  (Note that git does not save empty directores so some directories must also be created).  This is guaranteed by setting up a directory on the Cloud Storage bucket that matches the name of the rootpath (i.e. the directory containing package.json) and configuring a deltaPath to each uploaded file from the root path and then constructing the local and Cloud Storage filepaths from that delta path.
 *
 * NOTE: The utility includes an integrated test - it reads the uploaded time from Cloud Storage before and after the upload and passes if the difference between before and after is not negative.
 */

import path from 'path';
import fs from 'fs';
import findup from 'find-up';
import { Storage } from '@google-cloud/storage';

console.log('Uploading secret files with GCP Local Storage');
const storage = new Storage();

/* Find directory (upwards) containing package.json */
export const rootPath = path.dirname(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  findup.sync('package.json', { cwd: __dirname })!,
);

/* The root directory to store the files on the gsutil bucket */
const rootDir = 'frontend/';

/* Set the path to the GCP Storage credentials here (as well as in the .env files as this may be called when no .env file is loaded) */
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
  rootPath,
  '..',
  'certs',
  'gcpStorage',
  'gcpStorageKey.json',
);

/* Name of the bucket on GCP Local Storage */
export const bucketName = 'project-perform-gcp-environment-files';

/* Define a set of upload jobs */

const envFrontendE2e = {
  filesToUpload: ['.env-e2e-dev', '.env-e2e-production', '.env-e2e-staging'],
  /* Path relative to rootpath - directory containing package.json */
  deltaPath: 'e2e/',
};
export const uploadJobs = [envFrontendE2e];

/* Upload a file to gcp */
const uploadFile = async (srcFilename: string, destFilename: string) => {
  const options = {
    destination: destFilename,
  };
  try {
    console.log(`Uploading ${srcFilename} to ${destFilename}.`);
    await storage.bucket(bucketName).upload(srcFilename, options);
  } catch (err) {
    console.error(
      `Error uploading ${srcFilename} to gs://${bucketName}/${destFilename}.`,
    );
    throw err;
  }
};

enum FirstRead {
  TRUE = 1,
  FALSE,
}
/* Get metadata on a file from the Cloud Storage */
const getUploadedTime = async (
  bucket = bucketName,
  filename: string,
  firstRead: FirstRead,
) => {
  try {
    const [metadata] = await storage
      .bucket(bucket)
      .file(filename)
      .getMetadata();
    /* return # of ms */
    return Date.parse(metadata.updated);
  } catch (err) {
    if (firstRead === FirstRead.TRUE) {
      /* If the file is not there before you upload the file then return an uploaded time of 0ms */
      return 0;
    }
    /* If an error is thrown on the attempt to get the upload metadata after you have uploaded the file then throw an error */
    console.error(
      `Error getting metadata on ${filename} from gs://${bucketName}.`,
    );
    throw err;
  }
};

/* Set up exact GCP and local filepaths and call upload for each file */
export const setFilePathsAndCallUpload = async (
  filesToUpload: string[],
  deltaPath: string,
) => {
  for (const file of filesToUpload) {
    /* Construct the storage path from the deltaPath */
    const gsFilePath = rootDir + deltaPath + file;
    /* Construct the local path from the deltaPath */
    const localFilePath = path.resolve(rootPath, deltaPath, file);
    if (fs.existsSync(localFilePath)) {
      const before = await getUploadedTime(
        bucketName,
        gsFilePath,
        FirstRead.TRUE,
      );
      await uploadFile(localFilePath, gsFilePath);
      const after = await getUploadedTime(
        bucketName,
        gsFilePath,
        FirstRead.FALSE,
      );
      /* Test uploaded time before Vs after */
      if (before - after < 0) {
        console.log('Upload test passed');
      } else {
        console.error('Unknown error uploading a file');
        throw new Error('Unknown error uploading a file');
      }
    } else {
      console.error('No local file exists => error');
      throw new Error('No local file exists: ' + localFilePath);
    }
  }
};

const runUploads = async () => {
  /* run the set of uploads */
  for (const job of uploadJobs) {
    await setFilePathsAndCallUpload(job.filesToUpload, job.deltaPath);
  }
};

runUploads();
