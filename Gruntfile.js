/*jshint node:true */
module.exports = function (grunt) {
	"use strict";

	// build process version. Bump it each time a change is being made.
	var version = "0.3.8";
	grunt.log.ok("FEWD Build Process v" + version);

	// Load grunt tasks automatically
	require("load-grunt-tasks")(grunt);
	require("time-grunt")(grunt);

	var pkgName = grunt.file.readJSON('package.json').name,
		// manifestVersion = grunt.file.readJSON('src/manifest.json').version,
		settings = {
			dev: "src",
			dist: "webapp/"+pkgName,
			tasksPath: "grunt-tasks/desktop",
			jsFiles: "src/js/page/*.js"
		};
		settings.desktop = settings;

	var requireJSHelpers = require("./grunt-tasks/desktop/requirejshelpers.js").init(grunt, settings),
		helpers = require("./grunt-tasks/desktop/helpers.js").init(grunt, settings);

	// Load grunt modules.
	require("./grunt-tasks/global/global.js")(grunt, settings);
	require("./grunt-tasks/global/pre-commit-hook.js")(grunt);

	grunt.config("concurrent", {
		parallelSCSS: {
			tasks: helpers.getScssFilesArray(),
			options: {
				limit: 4
			}
		}
	});

	grunt.registerTask("desktop:compileCSS", "Compile CSS using Libsass", function (file) {
		grunt.task.run("compileCSS:desktop" + ((file) ? ":" + file : ""));
	});

	grunt.registerTask('desktop:compileJS', "Build js files from js snippets w/ source maps", function () {

		var modules = requireJSHelpers.getPages();

		var conf = {
			compile: {
				options: {
					mainConfigFile: settings.dev + "/js/requirejsconfig.js",
					baseUrl: settings.dev + "/js",
					dir: settings.dist + "/script",
					removeCombined: false, // files in features might depend on modules and services, so we can't remove the combined files
					optimize: "none",
					skipDirOptimize: true,
					keepBuildDir: true,
					modules: modules,
					preserveLicenseComments: false,
					generateSourceMaps: false
				}
			}
		};

		grunt.config("requirejs", conf);
		grunt.task.run(["desktop:compileTemplates", "requirejs"]);
		//grunt.task.run(["desktop:compileTemplates", "requirejs"]);

	});

	grunt.registerTask("desktop:publishDocroot", "copy static assets over to the web accessible docroot", function () {

		var conf = {

			font: {
				expand: true,
				cwd: settings.dev,
				src: "font/**/*",
				dest: settings.dist
			},
			html: {
				expand: true,
				cwd: settings.dev,
				src: "html/**/*",
				dest: settings.dist
			},
			img: {
				expand: true,
				cwd: settings.dev,
				src: ["img/*", "img/**/*"],
				dest: settings.dist
			},
			manifest: {
				expand: true,
				cwd: settings.dev,
				src: ["manifest.json"],
				dest: settings.dist
			}

		},
		confClean = {
			build: {
				src: [
					settings.dist + "/script/*",
					settings.dist + "/script/base/*",
					"!" + settings.dist + "/script/base",
					"!" + settings.dist + "/script/base/global.js",
					"!" + settings.dist + "/script/base/handlebars.runtime.js",
					"!" + settings.dist + "/script/base/jquery-1.11.2.js",
					"!" + settings.dist + "/script/base/require.js",
					"!" + settings.dist + "/script/base/underwire.js",
					"!" + settings.dist + "/script/page"
				]
			}
		};

		grunt.config("copy", conf);
		grunt.task.run("copy");

		grunt.config("clean", confClean);
		grunt.task.run("clean");
	});

	grunt.registerTask("desktop:init", "Build static resources for local environments", function (init) {
		grunt.task.run("desktop:build:init");
	});

	grunt.registerTask("desktop:cliInstall", "Build static resources for local environments", function (init) {
		grunt.config("exec", {
			loadChromeCLI: {
				cmd: 'brew install chrome-cli',

	            callback: function (error, stdout, stderr) {
	                grunt.log.write('stdout: ' + stdout);
	                grunt.log.write('stderr: ' + stderr);
	                if (error !== null) {
	                    grunt.log.error('exec error: ' + error);
	                }
	            }
	        }
	    });
		grunt.task.run("exec");
	});

	grunt.registerTask("desktop:build", "Build static resources for local environments", function (init) {
		grunt.config("exec", {
			loadChromeCLI: {
				cmd: 'brew ls --versions chrome-cli',

				callback: function (error, stdout, stderr) {
					if (!init && stdout.indexOf("chrome-cli") === -1) {
						grunt.task.run("desktop:cliInstall");
					}
				}
			}
		});
		grunt.task.run("exec");

		var os = require("os"),
			_ = require("lodash-node"),
			tasks = ['desktop:jshint'],
			conf = {
				desktop: [
					"desktop:compileCSS",
					"desktop:compileJS"
				]
			};

		conf = _.assign(grunt.config("concurrent"), conf);
		grunt.config("concurrent", conf);

		if (os.platform().match(/win32/)) {
			console.log("Windows OS detected, Concurrent task won't run.");
			tasks = tasks.concat(conf.desktop);
		} else {
			tasks.push("concurrent:desktop");
		}
		grunt.task.run(tasks);
		grunt.task.run("desktop:publishDocroot");
		grunt.task.run("desktop:updateFile");
		if (!init) {
			grunt.task.run("desktop:refreshExtensions");
		}

	});

	grunt.registerTask("desktop:jshint", "Runs jshint on JS files", function () {

		var conf = {
			desktop: ["src/js/**/*.js", "src/js/**/**/*.js", "!src/js/base/*.js", "!src/js/compiledTemplates/*.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		};

		grunt.config("jshint", conf);
		grunt.task.run("jshint");

	});

	grunt.registerTask("desktop:watch", "Watches for changes in scss, js and handlebars templates", function () {

		var conf = {
			scss: {
				files: [settings.dev + "/scss/**/*.scss"],
				tasks: ["compileCSS:desktop:watch", "desktop:refreshExtensions"],
				options: {
					livereload: true
				}
			},
			js: {
				files: [
					settings.dev + "/js/**/*.js",
					"!" + settings.dev + "/js/compiledTemplates/**/*.js"
				],
				tasks: ["desktop:jshint", "desktop:compileJS", "desktop:refreshExtensions"],
				options: {
					nospawn: true,
					livereload: true
				}
			},
			files: {
				files: [
					settings.dev + "/font/**/*",
					settings.dev + "/html/*",
					settings.dev + "/html/**/*",
					settings.dev + "/img/*",
					settings.dev + "/img/**/*"
				],
				tasks: ["desktop:publishDocroot", "desktop:refreshExtensions"],
				options: {
					nospawn: true,
					livereload: false
				}
			}
		};

		grunt.config("watch", conf);
		grunt.task.run("watch");

	});

	grunt.registerTask("desktop:updateFile", "runs a replace on the update.xml file to allow for autoupdates of the extension", function () {

		var pkg = grunt.file.readJSON("package.json"),
			manifest = grunt.file.readJSON("src/manifest.json"),
			config = {
			      dist: {
			        options: {
			          patterns: [
			            {
			              match: /INSERT_LATEST_EXTENSION_VERSION/g,
			              replacement: manifest.version
			            }
			          ]
			        },
			        files: [
			          {expand: true, flatten: true, src: ["updates.xml"], dest: "webapp/"}
			        ]
			      }
			};

		grunt.config("replace", config);
		grunt.task.run("replace");

	});

	grunt.registerTask("desktop:wait", "runs ", function (extTabID, exec) {

		var conf = {
	        options: {
	            delay: 1000
	        },
	        pause: {      
	            options: {
	                after : function() {
	                    if (exec) {
		                    if (exec === "reload") {
								grunt.config("exec", {reloadExtensionPage: 'chrome-cli reload -t ' + extTabID});
								grunt.task.run("exec");
		                    } else if (exec === "close") {
								grunt.config("exec", {closeExtensionPage: 'chrome-cli close -t ' + extTabID});
								grunt.task.run("exec");
		                    }
		                }
	                }
	            }
	        }
	    };

		grunt.config("wait", conf);
		grunt.task.run("wait");
	});

	grunt.registerTask("desktop:refreshExtensions", "runs ", function () {

		var configCompress = {
			      openTab: {
			        options: {
			          //verbose: true,
			          startCheck: function(stdout, stderr) {

			          	var extTabID = stdout.split(/\n/)[0].substring(4);

			          	grunt.log.writeln("Extension Tab ID: "+extTabID+";");

						grunt.task.run("desktop:wait:"+extTabID+":reload");

						grunt.task.run("desktop:wait:"+extTabID+":close");

			            return true;
			          }
			        },
			        cmd: "chrome-cli",
			        args: ["open", "chrome://extensions", "-n"]
			      }
			};

		grunt.config("external_daemon", configCompress);
		grunt.task.run("external_daemon");

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
		grunt.task.run(['desktop:cleanCompiledTemplates', 'handlebars', 'desktop:_posthHandlebars']);
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

};
