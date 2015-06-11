/*

 DEVELOPMENT
 ------------------
 desktop:init                    Initializes your local environment
 desktop:start[:dev|test|int] (--ip=bool --release=str) Starts your local environment
 desktop:server:dev|test|prod    Initializes your local environment and starts the proxy for the specified target
 desktop:jshint                  Runs jshint on JS files
 desktop:watch                   Watches for changes in scss, js and handlebars templates
 desktop:sync                    Synchronizes changes in src-fewd js files to the dist folder
 desktop:clean                   Removes build folders
 desktop:beautifier              Automated clean up of common html/js formatting issues, not part of pre-commit

 TESTING
 ------------------
 desktop:unit:release|develop    Runs unit-testing
 desktop:report                  Runs an analysis tool against the JS codebase

 COMPILE
 ------------------
 desktop:compileJS               Build js files from js snippets w/ source maps
 desktop:compileCSS              Build all CSS files from SCSS files.
 desktop:compileCSS:file.scss    Build CSS from a single SCSS file. Path is relative to the styles directory.
                                 Example: grunt desktop:compileCSS:checkout/_address.scss or grunt desktop:compileCSS:checkout.scss

 desktop:compileCSSOld           Build css files from scss snippets - sequentially (redundant, deprecation suggested)

 desktop:compileTemplates        Build js files from handlebars snippets
 desktop:minifyJS                Javascript compression
 desktop:minifyCSS               CSS compression

 BUILD
 ------------------
 desktop:build                   Build static resources for local environments
 desktop:release                 Build static resources for dev/test & prod environments
 desktop:publishDocroot 		 Copy static assets from frontend-desktop over to the web accessible resources directory
 									(includes /img, /font, /sprite, /pdf, /html)

 */

/*jshint node:true */
module.exports = function (grunt, settings) {
	"use strict";

	var requireJSHelpers = require('./requirejshelpers.js').init(grunt, settings),
		helpers = require('./helpers.js').init(grunt, settings);

	grunt.registerTask("desktop:sync", "Synchronizes changes in src-fewd js files to the dist folder", function () {
		var conf = {
			templates: {
				files: [{
					src: [settings.dev + '/js/compiledTemplates'],
					dest: settings.dist + '/script/compiledTemplates'
				}, {
					cwd: settings.dev + '/js/compiledTemplates',
					src: ['**/*.js'],
					dest: settings.dist + '/script/compiledTemplates'
				}]
			}
		};

		grunt.config('sync', conf);
		grunt.task.run("sync");
	});

	grunt.registerTask("desktop:watch", "Watches for changes in scss, js and handlebars templates", function () {

		var conf = {
			scss: {
				files: [settings.dev + '/scss/**/*.scss'],
				tasks: ['compileCSS:desktop:watch'],
				options: {
					livereload: true
				}
			},
			js: {
				files: [
					settings.dev + '/js/**/*.js',
					'src/main/frontend-common/js/**/*.js',
					'!' + settings.dev + '/js/compiledTemplates/**/*.js'
				],
				tasks: ['global:compileCommonJS', 'desktop:compileJS'],
				options: {
					nospawn: true,
					livereload: true
				}
			},
			template: {
				files: [settings.dev + '/templates/**/*.html'],
				tasks: ['desktop:compileJS'],
				options: {
					nospawn: true,
					livereload: false
				}
			}
		};

		grunt.config('watch', conf);
		grunt.task.run("watch");

	});

	grunt.registerTask("desktop:unit", "Runs unit-testing", function (target) {
		var _ = require('lodash-node');
		target = target || 'release';

		var conf = {
			desktop: {
				configFile: settings.tasksPath + '/desktop.karma.conf'
			}
		};

		var coverageReporter = {
			dir: 'test/coverage',
			reporters: [{
				type: 'html'
			}, {
				type: 'text'
			}]
		};

		var tests = {
			included: false,
			served: true,
			pattern: 'test/spec/**/*.*'
				//pattern: 'test/spec/javascripts/service/ajax/sAjaxSpec.js'
		};

		var testsOption = grunt.option('tests');
		if (testsOption !== undefined && testsOption !== null) {
			console.log(testsOption);
			tests.pattern = testsOption;
		}

		var files = [
			tests, {
				pattern: 'js/**/*.js',
				included: false
			}, {
				pattern: 'test/lib/**/*.js',
				included: false
			}, {
				pattern: 'test/main.js'
			}, {
				pattern: 'test/SpecHelper.js'
			}, {
				pattern: 'http://www.google-analytics.com/analytics.js',
				included: true
			}
		];

		var targetConfig = {
			release: {
				reporters: ['progress'],
				files: files,
				singleRun: true,
				autoWatch: false,
				browsers: ['PhantomJS'],
				coverageReporter: coverageReporter
			},
			develop: {
				reporters: ['progress', 'coverage'],
				files: files,
				singleRun: false,
				autoWatch: true,
				browsers: ['PhantomJS'],
				coverageReporter: coverageReporter,
				preprocessors: {
					//source files here only.
					'**js/config/**/*.js': 'coverage',
					'**js/controller/**/*.js': 'coverage',
					'**js/core/**/*.js': 'coverage',
					'**js/model/**/*.js': 'coverage',
					'**js/module/**/*.js': 'coverage',
					'**js/page/**/*.js': 'coverage',
					'**js/service/**/*.js': 'coverage',
					'**js/utils/**/*.js': 'coverage'
				}
			},
			ci: {
				reporters: ['progress', 'coverage'],
				singleRun: true,
				autoWatch: false,
				browsers: ['PhantomJS'],
				coverageReporter: coverageReporter,
				preprocessors: {
					//source files here only.
					'**js/config/**/*.js': 'coverage',
					'**js/controller/**/*.js': 'coverage',
					'**js/core/**/*.js': 'coverage',
					'**js/model/**/*.js': 'coverage',
					'**js/module/**/*.js': 'coverage',
					'**js/page/**/*.js': 'coverage',
					'**js/service/**/*.js': 'coverage',
					'**js/utils/**/*.js': 'coverage'
				},
				files: files
			}
		};

		conf.desktop = _.assign(conf.desktop, targetConfig[target]);

		grunt.config('karma', conf);

		grunt.task.run([
			'desktop:compileTemplates',
			'desktop:copyCommonToUnit_crutch',
			'karma',
			'desktop:copyCommonToUnit_crutch-clean'
		]);
	});

	grunt.registerTask("desktop:report", "Runs an analysis tool against the JS codebase", function () {

		var files = {};
		files[settings.dev + '/report'] = settings.jsFiles;

		var conf = {
			desktop: {
				files: files
			}
		};

		grunt.config('plato', conf);
		grunt.task.run("plato");

	});

	grunt.registerTask('desktop:compileTemplates', "Precompiles js files from handlebars templates", function () {
		var conf = {
			compile: {
				options: {
					// amd: true, // Not needed because desktop:_posthHandlebars wraps the template with the define function
					namespace: false,
					wrapped: false
				},
				files: helpers.getTemplates()
			}
		};

		grunt.config('handlebars', conf);
		grunt.task.run(['desktop:cleanCompiledTemplates', 'handlebars', 'desktop:_posthHandlebars', 'desktop:sync']);
	});

	grunt.registerTask("desktop:cleanCompiledTemplates", "empty out compiledTemplates directory", function () {
		var conf = {
			build: {
				src: [
					settings.dev + "/js/compiledTemplates"
				]
			}
		};

		grunt.config("clean", conf);
		grunt.task.run("clean");
	});

	grunt.registerTask('desktop:_posthHandlebars', "Post processes the handlebar templates to adapt them to our codebase register them as partial", function () {

		var pages = grunt.file.expand(settings.dev + '/js/compiledTemplates/**/*.js');

		for (var page in pages) {
			if (pages.hasOwnProperty(page)) {
				var file = pages[page],
					content = grunt.file.read(file, {
						encoding: 'UTF-8'
					}),
					templateName = file.slice(file.lastIndexOf('/') + 1).replace('.js', '');

				content = 'define(["handlebars"], function(Handlebars){ \n' +
					'var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}; \n' +
					'templates[\'' + templateName + '\'] = template(' + content + ');' + '\n' +
					'Handlebars.registerPartial("' + templateName + '", templates["' + templateName + '"]); \n' + //everything is a partial and a template!
					'return templates["' + templateName + '"]; \n' + '});';

				grunt.file.write(file, content, {
					encoding: 'UTF-8'
				});
			}
		}
	});

	grunt.config('concurrent', {
		parallelSCSS: {
			tasks: helpers.getScssFilesArray(),
			options: {
				limit: 4
			}
		}
	});

	// grunt.registerTask('desktop:compileCSS', ['concurrent:parallelSCSS']);
	grunt.registerTask('desktop:compileCSSFile', "Build css files from scss files", function (file) {

		var conf = {
			desktop: {
				options: {
					//sourcemap: true, // not enabled for the current version of sass
					outputStyle: 'expanded',
					sassDir: settings.dev + '/scss',
					cssDir: settings.dist + '/style',
					specify: settings.dev + file
				}
			}
		};

		grunt.config('compass', conf);
		grunt.task.run("compass:desktop");
	});

	grunt.registerTask('desktop:compileCSSold', "Build css files from scss files", function (file) {

		var conf = {
			desktop: {
				options: {
					//sourcemap: true, // not enabled for the current version of sass
					outputStyle: 'expanded',
					sassDir: settings.dev + '/scss',
					cssDir: settings.dist + '/style'
				}
			}
		};

		grunt.config('compass', conf);
		grunt.task.run("compass:desktop");
	});

	grunt.registerTask('desktop:compileJS', "Build js files from js snippets w/ source maps", function () {

		var modules = requireJSHelpers.getPages();

		var conf = {
			compile: {
				options: {
					mainConfigFile: settings.dev + '/js/requirejsconfig.js',
					baseUrl: settings.dev + '/js',
					dir: settings.dist + '/script',
					removeCombined: false, // files in features might depend on modules and services, so we can't remove the combined files
					optimize: 'none',
					skipDirOptimize: true,
					keepBuildDir: true,
					modules: modules,
					preserveLicenseComments: false,
					generateSourceMaps: false
				}
			}
		};

		grunt.config('requirejs', conf);
		grunt.task.run(["desktop:compileTemplates", "requirejs"]);

	});

	grunt.registerTask("desktop:jshint", "Runs jshint on JS files", function () {

		var files = settings.jsFiles.concat([
			settings.tasksPath + '**/*.js',
			"Gruntfile.js",
			"grunt-tasks/desktop/*.js",
			"grunt-tasks/global/*.js"
		]);

		var conf = {
			desktop: files,
			options: {
				jshintrc: '.jshintrc'
			}
		};

		grunt.config('jshint', conf);
		grunt.task.run("jshint");
	});

	grunt.registerTask("desktop:minifyJS", "Javascript compression", function () {

		var conf = {
			options: {
				sourceMap: true,
				banner: '/*! <%= grunt.template.today("isoDateTime") %> */',
				drop_console: true
			},
			desktop: {
				src: 'script/**/*.js',
				dest: settings.dist,
				cwd: settings.dist,
				expand: true,
				flatten: false
			}
		};

		grunt.config('uglify', conf);
		grunt.task.run("uglify");

	});

	grunt.registerTask("desktop:minifyCSS", "CSS compression", function () {

		var conf = {
			options: {
				banner: '/*! <%= grunt.template.today("isoDateTime") %> */',
				compatibility: 'ie8',
				noAdvanced: true,
				processImport: false
			},
			desktop: {
				expand: true,
				cwd: settings.dist + '/style',
				src: ['*.css'],
				dest: settings.dist + '/style'
			}

		};

		grunt.config('cssmin', conf);
		grunt.task.run("cssmin");

	});

	grunt.registerTask("desktop:publishDocroot", "copy static assets over to the web accessible docroot", function () {

		var conf = {

			font: {
				expand: true,
				cwd: settings.dev,
				src: 'font/**/*',
				dest: settings.dist
			},
			html: {
				expand: true,
				cwd: settings.dev,
				src: 'html/**/*',
				dest: settings.dist
			},
			img: {
				expand: true,
				cwd: settings.dev,
				src: ['img/*', 'img/**/*'],
				dest: settings.dist
			},
			sprite: {
				expand: true,
				cwd: settings.dev,
				src: ['sprite/*', 'sprite/**/*'],
				dest: settings.dist
			},
			pdf: {
				expand: true,
				cwd: settings.dev,
				src: ['pdf/*', 'pdf/**/*'],
				dest: settings.dist
			} //,
			//vendor: {
			//	expand: true,
			//	cwd: settings.dev,
			//	src: ['vendor/*', 'vendor/**/*'],
			//	dest: settings.dist + '/script/vendor'
			//keeping /script here to avoid breaking any external dependencies here
			//}

		};

		grunt.config('copy', conf);
		grunt.task.run("copy");
	});

	grunt.registerTask("desktop:clean", "Removes build folders", function () {

		var conf = {
			desktop: {
				src: [
					settings.dist + '/script',
					settings.dist + '/style'
				]
			}
		};

		grunt.config('clean', conf);
		grunt.task.run("clean");
	});

	grunt.registerTask("desktop:update", "Updates dependencies and then initializes your local environment", function () {

		var shelljs = require('shelljs');
		shelljs.exec('npm update');

		grunt.task.run([
			"global:setupGitHooks",
			"desktop:build",
			"desktop:watch"
		]);
	});

	grunt.registerTask("desktop:init", "Initializes your local environment", function () {
		grunt.task.run([
			"global:setupGitHooks",
			"desktop:build",
			"desktop:watch"
		]);
	});

	grunt.registerTask("desktop:start", "start your local environment", function () {
		var task = "global:start:desktop";

		if (this.args.length) {
			task = task + ":" + this.args.join(":");
		}

		grunt.task.run(task);
	});

	grunt.registerTask("desktop:build", "Build static resources for local environments", function (arg) {

		var os = require('os'),
			_ = require('lodash-node'),
			tasks = ['desktop:jshint'],
			conf = {
				desktop: [
					"desktop:compileCSS",
					"global:compileCommonJS",
					"desktop:compileJS"
				]
			};

		conf = _.assign(grunt.config('concurrent'), conf);
		grunt.config('concurrent', conf);

		if (os.platform().match(/win32/)) {
			console.log("Windows OS detected, Concurrent task won't run.");
			tasks = tasks.concat(conf.desktop);
		} else {
			tasks.push("concurrent:desktop");
		}
		grunt.task.run(tasks);
		grunt.task.run("desktop:publishDocroot");
	});

	grunt.registerTask("desktop:release", "Build static resources for dev/test & prod environments", function (arg) {
		grunt.task.run([
			"desktop:minifyCSS",
			"desktop:minifyJS"
		]);
	});

	grunt.registerTask("desktop:beautifier", "Automated clean up of common html/js formatting issues, not part of pre-commit", function () {

		var JSConf = {
			src: settings.jsFiles.concat([
				"Gruntfile.js",
				"grunt-tasks/desktop/*.js",
				"grunt-tasks/global/*.js",
				"grunt-tasks/global/**/*.js",
				settings.dev + "/test/spec/*.js",
				settings.dev + "/test/spec/**/*.js",
				settings.dev + "/test/spec/**/**/*.js",
				settings.dev + "/html/**/*.html"
			]),
			options: {

				// Apply any changes to mobiles's beautifier task
				html: {
					braceStyle: "collapse",
					indentChar: " ",
					indentScripts: "keep",
					indentSize: 4,
					maxPreserveNewlines: 2,
					preserveNewlines: true,
					unformatted: ["a", "sub", "sup", "b", "i", "u"],
					wrapLineLength: 0
				},
				js: {
					braceStyle: "collapse",
					breakChainedMethods: false,
					e4x: false,
					evalCode: false,
					indentChar: " ",
					indentLevel: 0,
					indentCase: false,
					indentSize: 4,
					indentWithTabs: true,
					jslintHappy: true,
					keepArrayIndentation: false,
					keepFunctionIndentation: false,
					maxPreserveNewlines: 2,
					preserveNewlines: true,
					spaceBeforeConditional: true,
					spaceInParen: false,
					unescapeStrings: false,
					wrapLineLength: 0
				}
			}
		};

		grunt.config('jsbeautifier', JSConf);
		grunt.task.run("jsbeautifier");
	});

	//Left in for legacy usage support
	grunt.registerTask("desktop:compileCSS", "Compile CSS using Libsass", function (file) {
		grunt.task.run("compileCSS:desktop" + ((file) ? ":" + file : ""));
	});
}; //end module.exports
