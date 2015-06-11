/*jshint node:true */
exports.init = function (grunt, settings) {
	"use strict";

	return {

		/**
		 * returns an array of templates to compile
		 */
		getTemplates: function () {
			var pages = grunt.file.expand(settings.dev + '/templates/**/*.html'),
				files = {};

			for (var page in pages) {
				if (pages.hasOwnProperty(page)) {
					var p = pages[page],
						name = p.replace(settings.dev + '/templates/', '').replace('.html', '');
					files[settings.dev + '/js/compiledTemplates/' + name + '.js'] = p;
				}
			}
			return files;
		}, // end getTemplates
		/**
		 * returns array of files to be compiled by compass
		 */
		getScssFilesArray: function () {
			var pages = grunt.file.expand(settings.dev + '/scss/**/*.scss'),
				files = [];

			for (var page in pages) {
				if (pages.hasOwnProperty(page)) {
					if (pages[page].indexOf('/_') < 1) {
						files.push(pages[page].replace('src/main/frontend-desktop', 'desktop:compileCSSFile:'));
					}
				}
			}
			return files;
		}
	};
};
