/* eslint-disable @typescript-eslint/no-var-requires */
// Karma configuration file, see link for more information
// https://karma-runner.github.io/6.3/config/configuration-file.html

/* Set path to the Chrome executable - using Chromium from Puppeteer for GCP */
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function main(config) {
  config.set({
    autowatch: false,
    /* added to prevent slow build losing the browser */
    captureTimeout: 300000,
    client: {
      /* don't leave Jasmine Spec Runner output visible in browser */
      clearContext: true,
      jasmine: {
        random: false,
        seed: '4321',
        oneFailurePerSpec: true,
        failFast: true,
        timeoutInterval: 30000,
      },
    },
    colors: false,
    /* Note: Choose browser in angular.json configuration */
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'], // needed for GCP
        displayName: 'ChromeHeadlessNoSandbox',
      },
    },
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    logLevel: config.LOG_INFO,
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      '@angular-devkit/build-angular/plugins/karma',
    ],
    reporters: ['progress'],
    restartOnFileChange: false,
    singleRun: true,
  });
};
