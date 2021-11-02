/*
 * Protractor's config
 */
import { Config } from 'protractor';
import * as _ from 'lodash';
import * as path from 'path';
import { EventEmitter } from 'events';
import glob = require('glob');

const { PickleFilter, getTestCasesFromFilesystem } = require('cucumber');
const eventBroadcaster = new EventEmitter();
export const config: Config = {
  //seleniumAddress: 'http://localhost:4444/wd/hub', //Use for selenium grid
  //seleniumAddress: 'http://127.0.0.1:4444/wd/hub',
   directConnect:true,
  /**
   * Set to true to support non Angular application
   */
  ignoreSynchronization: true,
  /**
   * Set to true if you are not using async/await
   */
  SELENIUM_PROMISE_MANAGER: false,
  seleniumArgs: ['-Dwebdriver.ie.driver=node_modules/protractor/selenium/IEDriverServer.exe'],
  baseUrl: '',
  allScriptsTimeout: 10000,
  /***
   * In this capabilities object you can set any details you want for
   * a particular browser from the command line (The ones set here are defaults)
   * Example: protractor dist/config/config.js --capabilities.chrome.platform='MAC'
   */
  capabilities: {
    chrome: {
      browserName: 'chrome',
      unexpectedAlertBehaviour: 'accept',
      maxInstances: 1,
      count: 1,
      acceptInsecureCerts: true,
      'goog:chromeOptions': {
        excludeSwitches: ['enable-automation'],
        prefs: {
          'credentials_enable_service': false,
          'profile': {
            'password_manager_enabled': false,
          },
          download: {
            prompt_for_download: false,
            directory_upgrade: true,
            default_directory: path.join(process.cwd(), 'testData', 'downloads'),
          },
        },
        w3c: false,
      },
    },
    firefox: {
      browserName: 'firefox',
      shardTestFiles: true,
      maxInstances: 1,
      count: 1,
      acceptInsecureCerts: true,
    },
    ie: {
      browserName: 'internet explorer',
      unexpectedAlertBehaviour: 'accept',
      shardTestFiles: true,
      maxInstances: 1,
      count: 1,
      version: '11',
    },
    edge: {
      browserName: 'MicrosoftEdge',
      unexpectedAlertBehaviour: 'accept',
      shardTestFiles: true,
      maxInstances: 1,
      count: 1,
    },
    safari: {
      platform: 'MAC',
      browserName: 'safari', 'safari.options': { technologyPreview: false, cleanSession: true },
      unexpectedAlertBehaviour: 'accept',
      shardTestFiles: true,
      maxInstances: 1,
      count: 1,
    },
    chromeHeadless: {
      browserName: 'chrome',
      unexpectedAlertBehaviour: 'accept',
      maxInstances: 1,
      count: 1,
      chromeOptions: {
        args: ['--no-sandbox', '--headless', '--disable-gpu','--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"'],
        prefs: {
          'credentials_enable_service': false,
          'profile': {
            'password_manager_enabled': false,
          },
          download: {
            prompt_for_download: false,
            directory_upgrade: true,
            default_directory: path.join(process.cwd(), 'testData', 'downloads'),
          },
        },
        w3c: false,
        perfLoggingPrefs: {
          enableNetwork: true,
        },
      },
      loggingPrefs: {
        'performance': 'ALL',
      }
    },
    firefoxHeadless: {
      browserName: 'firefox',
      shardTestFiles: true,
      maxInstances: 1,
      count: 1,
      acceptInsecureCerts: true,
      'moz:firefoxOptions': {
        args: ['--headless'],
      },
    },
  },
  /**
   * Max sessions refers to the number of browsers allowed across a grid
   */
  maxSessions: 1,
  /**
   * Tests can be run by feature file or by scenario. This may be very useful when
   * we get to running tests by lambda, as in that case all scenarios can be run at once.
   * Note1: Running by scenario will cause visual duplication of features in reports
   * as each scenario will have it's own feature section
   * Note2: Each shard creates it's own report so if you scale up to thousands of scenarios
   * running in parallel you will have thousands of reports to be combined
   */
  isParallelByFeature: true,
  isParallelByScenario: false,
  specs: ['../../features/'],
  /*
   * Returns all feature file paths
   */
  getFeatures: function(): string[] {
    const files = glob.sync('features/**/*.feature');
    return _.sortedUniq(files);
  },
  /*
   * Use cucumber built in methods to return the list of tests to be run
   * (by scenario or feature file)
   * For more info see https://github.com/cucumber/cucumber-js/blob/master/src/cli/helpers.js
   */
  getFeaturesByTagExpression: async function(): Promise<any[]> {
    const cucumberTags = this.getCucumberCliTags();
    const cucumberFeatures = this.getFeatures();
    const self = this;
    const parallelLog = 'Parallel by: ';
    const testCases = await getTestCasesFromFilesystem({
      cwd: '',
      eventBroadcaster: eventBroadcaster,
      featurePaths: cucumberFeatures,
      order: 'defined',
      pickleFilter: new PickleFilter({
        tagExpression: cucumberTags,
      }),
    });
    const tests = [];
    if (self.isParallelByFeature && !self.isParallelByScenario) {
      console.log(parallelLog + 'Feature');
    } else {
      console.log(parallelLog + 'Scenario');
    }
    _.forEach(testCases, function(result) {
      if (self.isParallelByFeature && !self.isParallelByScenario) {
        tests.push(result.uri);
      } else {
        const lineNumber = result.pickle.locations[0].line;
        const uri = result.uri;
        const scenario = `${uri}:${lineNumber}`;
        tests.push(scenario);
      }
    });
    return _.sortedUniq(tests);
  },
  /**
   * Return the list of tags that cucumber is using for this run
   * Example Response: @demo and not @wip
   */
  getCucumberCliTags: function(): any {
    return _.get(config.cucumberOpts, 'tags') || '';
  },
  /**
   * Configures the browser
   * Assigns out a set of tests for a browser to run by instance
   */
  getMultiCapabilities: async function(): Promise<any> {
    let caps = [];
    const browsers = this.browsers.split(',');
    caps = await Promise.all(browsers.map(browserName => this.getBrowserCapabilities(browserName)));
    if (this.maxSessions === 1) {
      return this.doNotRunTestsInParallel(caps);
    } else {
      config.specs = [];
      this.specs = [];
      return await this.runTestsInParallel(caps);
    }
  },
  getBrowserCapabilities(browserName: string) {
    switch (browserName) {
      case 'chrome':
        console.log('Configuring capabilities, adding Chrome');
        return this.capabilities.chrome;
      case 'chromeHeadless':
        console.log('Configuring capabilities, adding Chrome in headless mode');
        return this.capabilities.chromeHeadless;
      case 'firefox':
        console.log('Configuring capabilities, adding Firefox');
        return this.capabilities.firefox;
      case 'firefoxHeadless':
        console.log('Configuring capabilities, adding Firefox in headless mode');
        return this.capabilities.firefoxHeadless;
      case 'edge':
        console.log('Configuring capabilities, adding Edge');
        return this.capabilities.edge;
      case 'ie':
        console.log('Configuring capabilities, adding IE');
        return this.capabilities.ie;
      case 'safari':
        console.log('Configuring capabilities, adding safari');
        return this.capabilities.safari;
    }
  },
  doNotRunTestsInParallel(capabilities: any) {
    console.log('Not running tests in parallel');
    return capabilities;
  },
  runTestsInParallel: async function(capabilities: any[]) {
    console.log('Running tests in parallel');
    const files = await this.getFeaturesByTagExpression();
    const configs = [];
    _.map(files, file => {
      _.map(capabilities, function(capability) {
        const browserConfig = {
          specs: ['../../' + file],
          shardTestFiles: false,
          maxInstances: 1,
        };
        configs.push(_.merge(browserConfig, capability));
      });
    });
    return configs;
  },
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  beforeLaunch: () => {
  },

  /**
   * Specify Cucumber options, reports formats, location of step definitions
   * 'dry-run': true will allows print out of the report without running Scenarios
   * tags: '@wip" Cucumber will ignore these files during execution
   */
  cucumberOpts: {
    //retry:'1',
    compiler: 'ts:ts-node/register',
    format: ['node_modules/cucumber-pretty', './config/allure-reporter.js:dist/output.json'],
    require: [
      '../../dist/step_definitions/**/*.js',
      '../../dist/step_definitions/*.js',
      '../../dist/support/*.js',
      '../../dist/helpers/*.js',
      '../../dist/pages/**/*.js',
    ],
    'dry-run': false,
    strict: true,
    tags: 'not @wip',
  },
  browsers: 'chrome',
  params: {
    env: 'test_env',
  },
};