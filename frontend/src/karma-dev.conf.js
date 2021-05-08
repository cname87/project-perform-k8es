/* eslint-disable @typescript-eslint/no-var-requires */
// Karma configuration file, see link for more information
// https://karma-runner.github.io/6.3/config/configuration-file.html

/* Set path to the Chrome executable */
switch (process.platform) {
  case 'linux':
    process.CHROME_BIN = '/usr/bin/google-chrome';
    break;
  case 'win32':
    process.CHROME_BIN =
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    break;
  default:
    process.CHROME_BIN = '/usr/bin/google-chrome';
    break;
}

module.exports = function main(config) {
  config.set({
    /* enable / disable watching file and executing tests whenever any file changes */
    autoWatch: true,
    /* base path that will be used to resolve all patterns (eg. files, exclude) */
    basePath: '',
    /* start these browsers
    available browser launchers: https://npmjs.org/browse/keyword/karma-launcher */
    browsers: ['Chrome'],
    /* Added to prevent slow build losing the browser */
    captureTimeout: 300000,
    client: {
      /* leave Jasmine Spec Runner output visible in browser */
      clearContext: false,
      jasmine: {
        random: false,
        seed: '4321',
        oneFailurePerSpec: true,
        failFast: true,
        timeoutInterval: 30000,
      },
    },
    /* enable / disable colors in the output (reporters and logs) */
    colors: true,
    /* Concurrency level
    how many browser should be started simultaneous */
    concurrency: Infinity,
    coverageReporter: {
      type: 'html',
      dir: require('path').join(__dirname, '../coverage'),
      reporters: ['html'],
      fixWebpackSourcePaths: true,
    },
    /* list of files / patterns to exclude */
    exclude: [],
    /* list of files / patterns to load in the browser */
    files: ['src/**/*.js'],
    /* frameworks to use
    available frameworks: https://npmjs.org/browse/keyword/karma-adapter */
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    /* level of logging
    possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG */
    logLevel: config.LOG_INFO,
    /* web server port */
    port: 9876,
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-jasmine-html-reporter',
      'karma-coverage',
      '@angular-devkit/build-angular/plugins/karma',
    ],
    /* preprocess matching files before serving them to the browser
    available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor */
    preprocessors: {
      /* source files, that you wanna generate coverage for
      do not include tests or libraries
      (these files will be instrumented by Istanbul) */
      'src/**/*.js': ['coverage'],
    },
    /* test results reporter to use
    possible values: 'dots', 'progress'
    available reporters: https://npmjs.org/browse/keyword/karma-reporter */
    reporters: ['progress', 'kjhtml', 'coverage'],
    restartOnFileChange: true,
    /* Continuous Integration mode
    if true, Karma captures browsers, runs the tests and exits */
    singleRun: false,
  });
};
