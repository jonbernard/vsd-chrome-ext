/*jshint node:true */
exports.init = function (grunt, settings) {
	"use strict";

	return {

		/**
		 * Returns an array of RequireJs modules to compile
		 * [ {name: 'module.js', exclude: ['base/global.js'] } ]
		 */
		getPages: function () {
			var pages = grunt.file.expand([settings.dev + '/js/page/**/*.js', settings.dev + '/js/vendor/*.min.js']),
				files = [],
				exclude = ['metric.min'],
				globalIncluded = false;

			for (var page in pages) {
				if (pages.hasOwnProperty(page)) {
					var p = pages[page],
						name = p.slice(p.lastIndexOf('/') + 1, p.length - 3),
						folder = p.split('/');

					folder = folder[folder.length - 2];
					var moduleName = folder + '/' + name;
					// checks if the base/global module will need to be recompiled
					if (moduleName === 'base/global') {
						globalIncluded = true;
					}

					if (exclude.indexOf(name) === -1) {
						files.push({
							name: moduleName,
							exclude: (name !== 'global' && folder !== 'vendor') ? ['base/global'] : []
						});

					}
				}
			}

			// if the base/global module hasn't been captured for recompilation, manually add it.
			// this prevents an issue where this module would be traced 1 time for each dependency
			if (files.length > 0 && !globalIncluded) {
				files.push({
					name: 'base/global'
				});
			}

			console.log("FILES!", files);
			return files;
		}, // end getPages
		getMobilePages: function () {
			var pages = grunt.file.expand([settings.dev + '/js/page/**/*.js', settings.dev + '/vendor/*.min.js']),
				files = [],
				exclude = ['metric.min'],
				globalIncluded = false;

			for (var page in pages) {
				if (pages.hasOwnProperty(page)) {
					var p = pages[page],
						name = p.slice(p.lastIndexOf('/') + 1, p.length - 3),
						folder = p.split('/');

					folder = folder[folder.length - 2];
					var moduleName = folder + '/' + name;
					// checks if the base/global module will need to be recompiled
					if (moduleName === 'page/global' || moduleName === 'page/global.T28CDEF') {
						globalIncluded = true;
					}

					if (exclude.indexOf(name) === -1) {
						files.push({
							name: moduleName,
							exclude: (name !== 'global' && name !== 'global.T28CDEF' && folder !== 'vendor') ? ['page/global', 'page/global.T28CDEF'] : []
						});

					}
				}
			}

			// if the base/global module hasn't been captured for recompilation, manually add it.
			// this prevents an issue where this module would be traced 1 time for each dependency
			// if(files.length > 0 && !globalIncluded){
			/* files.push({ name: 'base/global' });    */
			//}

			return files;
		}, // end getPages
		getCommonPages: function (srcdev) {
				var pages = grunt.file.expand([srcdev + '/js/service/*.js']),
					files = [],
					exclude = ['metric.min'];
				/*,
				                globalIncluded = false;*/

				for (var page in pages) {
					if (pages.hasOwnProperty(page)) {
						var p = pages[page],
							name = p.slice(p.lastIndexOf('/') + 1, p.length - 3),
							folder = p.split('/');

						folder = folder[folder.length - 2];
						var moduleName = folder + '/' + name;
						// checks if the base/global module will need to be recompiled
						/*  if(moduleName === 'base/global'){ globalIncluded = true; }*/

						if (exclude.indexOf(name) === -1) {
							files.push({
								name: moduleName
									/*                            exclude: (name !== 'global' && folder !== 'vendor') ? ['base/global'] : []*/
							});

						}
					}
				}

				// if the base/global module hasn't been captured for recompilation, manually add it.
				// this prevents an issue where this module would be traced 1 time for each dependency
				// if(files.length > 0 && !globalIncluded){
				/* files.push({ name: 'base/global' });    */
				//}

				return files;
			} // end getPages
	};
};
