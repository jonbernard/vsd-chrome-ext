/*

 Global dev tasks and helpers.

 these tasks allow us to simplify redundant terminal commands, git interactions, etc.

 contents:

	COMMIT
	------------------
	global:commit - git pre-commit tasks, runs both desktop and mobile pre-commit tasks
	global:setupGitHooks - setup git hooks for local development, use when working both mobile and desktop code

*/

/*jshint node:true */
module.exports = function (grunt) {
	"use strict";

	var RESOURCES_PATH = "src/main/resources",
		RESOURCES_PATH_DELIVERY = RESOURCES_PATH + "/delivery.properties",
		RESOURCES_PATH_COHERENCE = RESOURCES_PATH + "/coherence-cache-config.xml",
		RESOURCES_PATH_SESSION = RESOURCES_PATH + "/session-cache-config.xml",
		RESOURCES_PATH_JETTY = RESOURCES_PATH + "/jetty-env.xml",
		CONFIG = {
			test: {
				address: "cmh-cohnwsdev05-001.lbidts.com",
				jdbc: "jdbc:db2://cmh-db2connect-001.lbidts.com:50000/CMHSFT05",
				groupName: "cmh05"
			},
			dev: {
				address: "ket-cohnwsdev05-001.lbidts.com",
				jdbc: "jdbc:db2://cmh-db2connect-001.lbidts.com:50000/KETSFT05",
				groupName: "ket05"
			},
			"int": {
				address: "cmh-vsdpcohint-001.lbidts.com",
				jdbc: "jdbc:db2://cmh-db2connect-001.lbidts.com:50000/CMHSFI00",
				groupName: "cmhvsdint"
			}
		},
		COMMON_SOURCE = "src/main/frontend-common",
		COMMON_DIST = "src/main/webapp/resources",

		setPlatform = function (platform) {
			var mobileDevice = platform === "mobile",
				deliveryContents = grunt.file.read(RESOURCES_PATH_DELIVERY);

			deliveryContents = deliveryContents.replace(/(mobileDevice=).*/, "$1" + mobileDevice);

			// replace IP addresses with localhost to reset the file in the case it was modified
			deliveryContents = deliveryContents.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, "localhost");

			if (grunt.option("ip")) {
				deliveryContents = deliveryContents.replace(/localhost/g, getLocalIpAddress());
			}

			grunt.file.write(RESOURCES_PATH_DELIVERY, deliveryContents);
		},

		setEnvironment = function (environment) {
			var coherenceContents = grunt.file.read(RESOURCES_PATH_COHERENCE),
				sessionContents = grunt.file.read(RESOURCES_PATH_SESSION),
				jettyContents = grunt.file.read(RESOURCES_PATH_JETTY);

			coherenceContents = coherenceContents.replace(
				new RegExp(/(<address>).*?(<\/address>)/),
				"$1" + CONFIG[environment].address + "$2"
			);

			sessionContents = sessionContents.replace(
				new RegExp(/(<address>).*?(<\/address>)/),
				"$1" + CONFIG[environment].address + "$2"
			);

			jettyContents = jettyContents.replace(
				new RegExp(/(<Set name="jdbcUrl">).*?(<\/Set>)/),
				"$1" + CONFIG[environment].jdbc + "$2"
			);

			grunt.file.write(RESOURCES_PATH_COHERENCE, coherenceContents);
			grunt.file.write(RESOURCES_PATH_SESSION, sessionContents);
			grunt.file.write(RESOURCES_PATH_JETTY, jettyContents);
		},

		getLocalIpAddress = function () {
			var os = require("os"),
				ifaces = os.networkInterfaces(),
				localIpAddress = null;

			for (var dev in ifaces) {
				if (dev === "en0" || dev === "en1") {
					ifaces[dev].forEach(function (details) {
						if (details.family === "IPv4") {
							localIpAddress = details.address;
						}
					});

					if (localIpAddress) {
						break;
					}
				}
			}

			return localIpAddress;
		},

		discardResourceFileChanges = function () {
			var exec = require("child_process").exec;

			exec("git checkout -- " + RESOURCES_PATH_DELIVERY + " " + RESOURCES_PATH_COHERENCE + " " + RESOURCES_PATH_SESSION + " " + RESOURCES_PATH_JETTY);
		};

	// global:start[:mobile|desktop][:dev|test|int] (--ip=bool --release=str)
	grunt.registerTask("global:start", "start your local environment", function (platform, environment) {
		platform = platform || "desktop";
		environment = (CONFIG.hasOwnProperty(environment)) ? environment : "test";

		var open = require("open"),
			cmd = "mvn",
			args = ["-U", "clean", "jetty:run"],
			server,
			done = this.async(),
			domain = (grunt.option("ip")) ? getLocalIpAddress() : "localhost";

		if (grunt.option("release")) {
			args.push("-Drelease", "-DRelease=" + grunt.option("release"));
		}

		// hazelcast
		if (CONFIG[environment].groupName) {
			args.push("-DgroupName=" + CONFIG[environment].groupName);
		}

		// setup config
		setPlatform(platform);
		setEnvironment(environment);

		// start the server
		server = grunt.util.spawn({
			cmd: cmd,
			args: args
		});

		// print output
		server.stdout.on("data", function checkForStart(data) {

			// listen for the server to be started
			if (/Started Jetty Server/.test(data)) {
				open("https://" + domain + ":8080");

				// stop listening
				server.stdout.removeListener("data", checkForStart);
				server.stdout.pipe(process.stdout); // jshint ignore:line
			}

			process.stdout.write(data); // jshint ignore:line
		});

		// print errors
		server.on("error", function (error) {
			grunt.log.error(error);
		});

		// the grunt process stopped
		process.on("exit", function (data) { // jshint ignore:line
			discardResourceFileChanges();

			// stop the server
			server.kill();
			done(false);
		});
	});

	grunt.registerTask("global:copyCommonToMobile_crutch", "this is a temporary solution to make common asset references consistent between platforms", function () {

		var conf = {

			common: {
				expand: true,
				cwd: COMMON_DIST + '/script',
				src: 'common/**/*',
				dest: COMMON_DIST + '/mobile/script'
			}

		};

		grunt.config('copy', conf);
		grunt.task.run("copy");
	});

	grunt.registerTask("desktop:copyCommonToUnit_crutch", "this is a temporary solution to make common asset references consistent between platforms", function () {

		var conf = {

			common: {
				expand: true,
				cwd: "src/main/frontend-common/js/", //TODO: repalce w constant val
				src: '**/*',
				dest: "src/main/frontend-desktop" + '/js/common' //TODO: repalce w constant val
			}

		};

		grunt.config('copy', conf);
		grunt.task.run("copy");
	});

	grunt.registerTask("desktop:copyCommonToUnit_crutch-clean", "Removes files used in desktop:copyCommonToDesktopUnit_crutch", function () {

		var conf = {
			desktop: {
				src: [
					"src/main/frontend-desktop" + '/js/common'
				]
			}
		};

		grunt.config('clean', conf);
		grunt.task.run("clean");
	});

	grunt.registerTask("mobile:copyCommonToUnit_crutch", "this is a temporary solution to make common asset references consistent between platforms", function () {

		var conf = {

			common: {
				expand: true,
				cwd: "src/main/frontend-common/js/", //TODO: repalce w constant val
				src: '**/*',
				dest: "src/main/frontend-mobile" + '/js/common' //TODO: repalce w constant val
			}

		};

		grunt.config('copy', conf);
		grunt.task.run("copy");
	});

	grunt.registerTask("mobile:copyCommonToUnit_crutch-clean", "Removes files used in desktop:copyCommonToDesktopUnit_crutch", function () {

		var conf = {
			desktop: {
				src: [
					"src/main/frontend-mobile" + '/js/common'
				]
			}
		};

		grunt.config('clean', conf);
		grunt.task.run("clean");
	});

	grunt.registerTask('global:compileCommonJS', "Build COMMON js files from js snippets w/ source maps - requireJS", function () {
		var requireJSHelpers = require('../desktop/requirejshelpers.js').init(grunt);
		var modules = requireJSHelpers.getCommonPages(COMMON_SOURCE);

		console.log(modules);

		var conf = {
			compile: {
				options: {
					mainConfigFile: COMMON_SOURCE + '/js/requirejsconfig.js',
					baseUrl: COMMON_SOURCE + '/js',
					dir: COMMON_DIST + '/script/common',
					removeCombined: false, // files in features might depend on modules and services, so we can't remove the combined files
					optimize: 'none',
					findNestedDependencies: true,
					skipDirOptimize: false,
					keepBuildDir: true,
					modules: modules,
					preserveLicenseComments: false,
					generateSourceMaps: false
				}
			}
		};

		grunt.config('requirejs', conf);
		grunt.task.run(["requirejs", "global:copyCommonToMobile_crutch"]);

	});

};
