/*jshint node:true */
exports.init = function (grunt, settings) {
	"use strict";

	return {
		getScssFilesObject: function (platform) {
			var styleSheets = grunt.file.expand([settings[platform].dev + "/scss/**/*.scss"]),
				files = {};

			for (var styleSheet in styleSheets) {
				if (styleSheets.hasOwnProperty(styleSheet) && styleSheets[styleSheet].indexOf('/_') < 1) {
					var scss = styleSheets[styleSheet],
						css = scss.replace(settings[platform].dev, settings[platform].dist).replace("/scss/", "/style/").replace(".scss", ".css");

					files[css] = scss;
				}
			}

			return files;
		},

		processSCSSfiles: function (details, include, platform) {
			var fileSystem = require("fs"),
				changed = grunt.file.read("grunt-tasks/" + platform + "/.libsass", {
					encoding: 'UTF-8'
				});

			if (changed && changed.indexOf("_") > 0) {
				var fileName = JSON.stringify(changed.match(/_[a-zA-Z0-9-\.]+\.s?scss/g)).replace(".scss", "").replace(/[_\[\]"]+/g, ""),
					regex = new RegExp("@import.*" + fileName + "|" + fileName + ".*@import", "g"),
					content = grunt.file.read(details.path, {
						encoding: 'UTF-8'
					});

				if (regex.test(content)) {
					return include(true);
				} else {
					return include(false);
				}
			} else {
				var time = details.time,
					sync = fileSystem.statSync(details.path);

				if (sync.mtime > time) {
					return include(true);
				} else {
					return include(false);
				}
			}
		},

		extendObjs: function (defaults, options) {
			var extended = {},
				prop;

			for (prop in defaults) {
				if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
					extended[prop] = defaults[prop];
				}
			}

			for (prop in options) {
				if (Object.prototype.hasOwnProperty.call(options, prop)) {
					extended[prop] = options[prop];
				}
			}

			return extended;
		}
	};
};
