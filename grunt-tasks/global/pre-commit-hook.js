/*jshint node:true */
module.exports = function (grunt) {
	"use strict";

	grunt.registerTask("global:setupGitHooks", "Installs the pre-commit hook on your local machine", function () {

		var preCommitFile = ".git/hooks/pre-commit";
		if (grunt.file.exists(preCommitFile)) {
			// backup the existing pre commit hook
			grunt.file.copy(preCommitFile, preCommitFile + ".backup");

			// remove the existing pre commit hook to add the new one
			grunt.file.delete(preCommitFile); // jshint ignore:line
		}

		var conf = {
			options: {
				startMarker: "console.log('starting global pre-commit hook...');",
				command: "PATH=" + process.env.PATH + " grunt",
				template: "grunt-tasks/global/pre-commit-hook-0.3.1.hb"
			},
			global: {
				"pre-commit": "global:commit"
			}
		};

		grunt.config("githooks", conf);
		grunt.task.run("githooks");
	});

	/**
	 * Currently checking if files are located in either grunt-tasks, frontend-desktop or frontend-mobile.
	 * Then, based on the file extensions, run the corresponding tasks.
	 */
	grunt.registerTask("global:commit", "Runs specific tasks, based on the files to be commited", function () {

		grunt.log.write("********************* start running pre-commit code quality check for desktop/mobile *********************\n");

		// stores the tasks to execute
		var tasks = [],
			flags = {}, // stores already used tasks to ensure uniqueness
			registeredTask = { // list of possible tasks
				'mobile': {
					'js': ['mobile:jshint', 'mobile:unitCommit'],
					'scss': ['mobile:compileCSS'],
					'html': ['mobile:jshint', 'mobile:unitCommit']
				},
				'desktop': {
					'js': ['desktop:jshint', 'desktop:compileJS', 'desktop:unit'],
					//'css': ['desktop:compileCSS'],
					'html': ['desktop:compileJS', 'desktop:unit']
				},
				'global': {
					'js': ['desktop:jshint']
				}
			},
			exec = require('shelljs').exec;

		exec('git status --porcelain', {
			silent: true
		}).output.split('\n').forEach(function (line) {

			var extension = line.match(/\.(\w{2,4})$/),
				platform = line.match(/frontend-(\w+)/);

			if (extension && extension.length >= 1) {
				extension = extension[1];
			}

			if (!platform) {
				// if no platform was found, check if it's in global
				if (line.match(/grunt-tasks/)) {
					platform = 'global';
				}
			} else {
				platform = platform[1];
			}

			if (extension && registeredTask.hasOwnProperty(platform)) {
				var task = registeredTask[platform][extension];
				if (!task) {
					return;
				}

				task.map(function (s) {
					if (!flags[s]) {
						flags[s] = true;
						tasks.push(s);
					}
				});

			}
		});

		console.log(tasks);
		grunt.task.run(tasks);

	});
};
