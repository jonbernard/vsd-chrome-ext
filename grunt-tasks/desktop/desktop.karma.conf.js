// Karma configuration
// Generated on Mon Mar 24 2014 11:34:59 GMT-0400 (EDT)
/*jshint node:true */
module.exports = function (config) {
	"use strict";
	if (!config.set) {
		return;
	}

	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '../../src/main/frontend-desktop',
		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine', 'requirejs'],
		// list of files / patterns to load in the browser.
		//  - This is overwritten by Grunt task, but is included here in case grunt is not being used
		//    to kick off the test
		files: [{
				pattern: 'js/**/*.js',
				included: false
			}, {
				pattern: 'test/lib/**/*.js',
				included: false
			}, {
				pattern: 'test/spec/**/*.*',
				//pattern: 'test/spec/javascripts/service/ajax/sAjaxSpec.js',
				included: false,
				served: true
			}, {
				pattern: 'test/main.js'
			}, {
				pattern: 'test/SpecHelper.js'
			},
			'http://www.google-analytics.com/analytics.js'
		],
		// list of files to exclude
		exclude: [
			'**/*.swp'
		],
		// web server port
		port: 9876,
		// enable / disable colors in the output (reporters and logs)
		colors: true,
		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_ERROR,
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,
		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Chrome'],

		customLaunchers: { //CustomeLaunchers are used by ChromExtra plugin for karma
			chrome_with_iphone_user_agent: {
				base: 'Chrome',
				flags: ['--user-agent="Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5"']
			}
		},
		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		captureConsole: true
	});
};
