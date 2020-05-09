# A version of the application is needed with puppeteer to allow unit and e2e tests be run.
# This builds an image that contains node and puppeteer and also copies in all files from the source context, and exposes a port so incoming requests can be received.
# Note: The source context when run from the cloud build environment will be the project directory as created in earlier cloud build steps.

# Use the prebuilt image with node that also supports puppeteer.
# This is pre-built and stored in the project GCP registry - see the backend utils directory for how it is built.
FROM 'gcr.io/project-perform/node-with-puppeteer'

# Leave the image workdir as the base directory.
WORKDIR /

# This copies all the files from the project to the image.
COPY . .

# Expose 8080 port to allow access to a running backend server.
EXPOSE 8080

# To run an npm script:
# Do not change workdir to run a backend package.json script (as the backend package.json file is stored on the project root).
# Set the workdir to '/frontend' to run a frontend package.json script
# Pass in 'npm', 'run' '<script>' as a RUN parameter or a docker-compose command parameter to run the npm script
# If no parameter is passed in then the default is that the 'start' script will run.
CMD ["npm", "run", "start"]
