/* When running ng e2e this file sets a proxy target dependent on whether the desired target is the production, staging (build) or local development server */

let target;
switch (process.env.E2E) {
  case 'production': {
    target = 'https://projectperform.com';
    break;
  }
  case 'staging': {
    target = 'http://backend:8080';
    break;
  }
  default: {
    target = 'http://localhost:8080';
    break;
  }
}

const config = [
  {
    context: ['/api-v1'],
    target,
    secure: false,
    logLevel: 'debug',
  },
];

module.exports = config;
