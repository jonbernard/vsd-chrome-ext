/*jshint node:true */
module.exports = function (grunt, settings) {
	"use strict";

	var ENVIRONMENTS = {
		dev: "https://dev-005.lbidts.com/",
		test: "https://test-005.lbidts.com/",
		"int": "https://vsdpint.lbidts.com/"
	};

	var helpers = require('./helpers.js').init(grunt, settings);

	grunt.registerTask("build", "Builds mobile and desktop assets", function () {
		grunt.config('concurrent', {
			build: ['desktop:build', 'mobile:build']
		});

		grunt.task.run(["concurrent:build"]);
	});

	grunt.registerTask("release", "Prepares built assets for production", function () {
		grunt.config('concurrent', {
			release: ['desktop:release', 'mobile:release']
		});

		grunt.task.run(["concurrent:release"]);
	});

	grunt.registerTask("envstatus", "Shows status of environments", function () {
		var exec = require("shelljs").exec,
			url,
			code,
			color;

		for (var environment in ENVIRONMENTS) {
			if (ENVIRONMENTS.hasOwnProperty(environment)) {
				url = ENVIRONMENTS[environment];
				code = exec("curl -w %{http_code} -s -o /dev/null " + url, {
					silent: true
				}).output;
				color = (parseInt(code, 10) === 200) ? "green" : "red";

				console.log(grunt.log.wordlist([environment, code, url], {
					separator: ": ",
					color: color
				}));
			}
		}
	});

	grunt.registerTask("compileCSS", "Compile CSS using Libsass", function (platform, file) {
		if (file === "watch") {
			var conf = {
				sass: {
					options: {
						sourceMap: true
					},

					dev: {
						files: helpers.getScssFilesObject(platform)
					}
				},
				newer: {
					options: {
						override: function (details, include) {
							if (details.task === "sass") {
								helpers.processSCSSfiles(details, include, platform);
							} else {
								include(false);
							}
						}
					}
				}
			};

			grunt.loadNpmTasks("grunt-newer");
			grunt.loadNpmTasks("grunt-sass");
			grunt.initConfig(conf);
			grunt.task.run("newer:sass");
		} else {
			var fileObj = {};

			if (platform === "desktop" || platform === "mobile") {
				if (!file || typeof file === "string" && file.indexOf(".scss") < 0) {
					fileObj = helpers.getScssFilesObject(platform);
				} else if (file && typeof file === "string" && file.indexOf(",") > -1) {
					var fileArray = file.split(",");
					for (var i = 0; i < fileArray.length; i++) {
						fileObj[settings[platform].dist + "/style/" + fileArray[i].replace(".scss", ".css")] = settings[platform].dev + "/scss/" + fileArray[i];
					}
				} else {
					if (file.indexOf("_") < 0) {
						fileObj[settings[platform].dist + "/style/" + file.replace(".scss", ".css")] = settings[platform].dev + "/scss/" + file;
					} else {
						var fileList = helpers.getScssFilesObject(platform);

						grunt.file.write("grunt-tasks/" + platform + "/.libsass", settings[platform].dev + "/scss/" + file, {
							encoding: 'UTF-8'
						});

						for (var path in fileList) {
							if (fileList.hasOwnProperty(path)) {
								var details = {};

								details.path = fileList[path];

								helpers.processSCSSfiles(details, function (arg) {
									if (arg) {
										fileObj[details.path.replace(settings[platform].dev, settings[platform].dist).replace(".scss", ".css").replace("/scss/", "/style/")] = details.path;
									}
								}, platform);
							}
						}
					}
				}
			} else {
				var desktopObj = helpers.getScssFilesObject("desktop"),
					mobileObj = helpers.getScssFilesObject("mobile");

				fileObj = helpers.extendObjs(mobileObj, desktopObj);
			}

			var conf2 = {
				sass: {
					options: {
						sourceMap: true
					},

					dev: {
						files: fileObj
					}
				}
			};

			grunt.loadNpmTasks("grunt-sass");
			grunt.initConfig(conf2);
			grunt.task.run("sass");
		}
	});

	grunt.event.on("watch", function (action, filePath) {
		if (filePath && filePath.indexOf(".scss") > 0) {
			var platform = null;

			if (filePath.indexOf("/frontend-desktop/") > 0) {
				platform = "desktop";
			} else {
				platform = "mobile";
			}

			grunt.file.write("grunt-tasks/" + platform + "/.libsass", filePath, {
				encoding: 'UTF-8'
			});
		}
	});
};
