/**
 * Utility to upload .env and other files to GCP Local Storage.
 *
 * When GCP triggers a build from github it needs to copy the .env files from a GCP Local Storage bucket (as these are not committed to git) which means that the files on the GCP Local Storage environment must be in sync with those on the local development environment.
 *
 * Usage:
 *
 * The utility is run from an npm script:
 * "npm run ts-node syncGCPStorage.js.
 *
 * This utility has the following configuration:
 * - Path to gcpStorageKey.json for GOOGLE_APPLICATION_CREDENTIALS environment variable.
 * - Cloud Storage bucket name.
 * - Paths to files to be uploaded.
 * - Paths on Cloud Storage.
 *
 * This utility loads up the backend secret files and also the application level certs and Helm chart secrets.  (Note that the application level files are stored in ../ under then backend directory).
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

/* Find directory (upwards) containing package.json */
export const rootPath = path.dirname(
  findup.sync('package.json', { cwd: __dirname })!,
);

/* Set the path to the GCP Storage credentials here (as well as in the .env files as this may be called when no .env file is loaded) */
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
  rootPath,
  '..',
  'certs',
  'gcpStorage',
  'gcpStorageKey.json',
);

/* The client library will look for credentials in the environment variable GOOGLE_APPLICATION_CREDENTIALS */
const storage = new Storage();

/* The root directory to store the files on the gsutil bucket */
const rootDir = 'backend/';

/* Name of the bucket on GCP Local Storage */
export const bucketName = 'project-perform-gcp-environment-files';

/* Define a set of upload jobs */

const envBackend = {
  filesToUpload: ['.envDevelopment', '.envStaging'],
  /* Path relative to directory containing package.json */
  deltaPath: '',
};
const dbCerts = {
  filesToUpload: ['mongoKeyAndCert.pem', 'rootCA.crt'],
  /* Path relative to directory containing package.json */
  deltaPath: 'certs/database/',
};
const gcpStorageKey = {
  filesToUpload: ['gcpStorageKey.json'],
  /* Path relative to directory containing package.json */
  deltaPath: '../certs/gcpStorage/',
};
const secrets = {
  filesToUpload: ['backend-secret.yaml'],
  /* Path relative to directory containing package.json */
  deltaPath: '../pp-chart/templates/',
};
export const uploadJobs = [envBackend, dbCerts, gcpStorageKey, secrets];

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
): Promise<void> => {
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
      throw new Error('No local file exists');
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
