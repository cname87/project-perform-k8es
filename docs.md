# Documentation

## Architecture

Diagram of ingress, microservices etc
Explanation each component
Design of frontend and backend

## Configuration

### Backend microservice configuration

The backend microservice application is configured by means of process.env environment global variables that are loaded via either .env files or a configmaps.yaml file in the Helm chart.  The .env files are loaded via backend/src/utils/src/loadEnvFile.ts.

There are three different environments to consider:

1. Development
The development environment is used for development and test.  It is set if process.env.NODE_ENV is not set to either 'staging' or 'production' when app.ts is called, i.e. it is the default configuration.  The development environment is configured via the .envDevelopment file.

2. Staging
The staging environment is used during cloud build for unit test.  It is set if process.env.NODE_ENV is set to 'staging' when app.ts is called.  The staging environment is configured via the .envStaging file.

3. Production etc - .env & configmaps
The production environment is used when running from the production cluster.  It is set if process.env.NODE_ENV is set to 'production' when app.ts is called.  The production environment is configured via the configmaps.yaml file in the Helm chart stored in the pp-chart directory.

## Development

Creation of a test cluster
Note ssl certificate only on one cluster
=> Use of port-mapping
Use of Skaffold
How to delete a cluster
Note need to delete certificate separately

## Deployment

Creation of the production cluster
Note time taken to set up ssl

First time deployment
How a git-triggered upgrade works
