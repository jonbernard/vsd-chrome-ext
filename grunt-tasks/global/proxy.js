/**
Proxies static files from a selected host
grunt desktop:server:dev|test|prod
    --host={{ip}} creates the local server with the provided IP instead of localhost
*/
module.exports = function (grunt) {
	"use strict";
	var hostnameFile = './hostname',
		requirejsPath = 'src/main/frontend-desktop/js',
		isMobile = false;

	var updateHost = grunt.option('host');
	var split = grunt.option('split');
	var proxyMedia = !!grunt.option('media');

	// create hostname file or read if exists
	// this way its not checked in all the time
	if (updateHost || !grunt.file.exists(hostnameFile)) {
		var newHost = typeof updateHost !== 'boolean' && updateHost || 'localhost';
		grunt.file.write(hostnameFile, newHost);
	}

	var hostname = grunt.file.read(hostnameFile);

	var config = {
		connect: {
			server: {
				options: {
					port: 9000,
					hostname: '*',
					livereload: true,
					base: [
						'src/main/webapp',
						'src/main/frontend-<%=environment %>'
					]
				}
			}
		},

		hoxy: {
			options: {
				port: 9001,
				connectPort: 9000,
				host: '*',
				requirejsPath: requirejsPath
			},
			local: {
				options: {
					isLocal: true,
					protocol: 'https',
					stage: 'localhost:8080',
					media: 'dm-dev-005.lbidts.com'
				}
			},
			prod: {
				options: {
					protocol: 'https',
					stage: 'www.victoriassecret.com',
					media: 'dm.victoriassecret.com'
				}
			},
			release: {
				options: {
					protocol: 'https',
					stage: 'vsdpint.lbidts.com',
					media: 'dm-vsdpint.lbidts.com'
				}
			},
			test: {
				options: {
					protocol: 'https',
					stage: 'test-005.lbidts.com',
					media: 'dm-test-005.lbidts.com'
				}
			},
			dev: {
				options: {
					protocol: 'https',
					stage: 'dev-005.lbidts.com',
					media: 'dm-dev-005.lbidts.com'
				}
			}
		}
	};

	// reloading config above
	grunt.config('hoxy', config.hoxy);

	grunt.registerMultiTask('hoxy', 'proxy to a remote server', function (target) {

		console.log('---------');
		console.log('---------');
		console.log('---------');
		console.log('---------');

		var hoxy = require('hoxy'),
			_ = require('lodash-node');

		var Interceptor = require('./proxy/interceptor');

		var relativeCwd = 'grunt-tasks/global';

		var opts = this.options({
			isMobile: isMobile,
			split: split,
			targetHost: hostname,
			targetPort: 80,
			protocol: 'http',
			rules: [
				relativeCwd + '/proxy/rules/**/*.js',
				'rules/**/*.js'
			],
			templates: [
				relativeCwd + '/proxy/rules/templates/**/*.htm',
				'rules/templates/**/*.htm'
			],
			proxyMedia: proxyMedia
		});

		var ruleFiles = grunt.file.expand(opts.rules);
		var templateFiles = grunt.file.expand(opts.templates);

		var mapReplacementTemplates = function (replacement) {
			return {
				find: new RegExp(_.template(replacement.find, opts), replacement.flags),
				replace: _.template(replacement.replace, opts)
			};
		};

		opts.rules = _.map(ruleFiles, function (ruleFile) {
			var rule = require('../../' + ruleFile.slice(0, ruleFile.length - 3));
			if (rule.query && (rule.fn || rule.replacements)) {
				rule.replacements = _.map(rule.replacements, mapReplacementTemplates);
				return rule;
			}
		});

		opts.templates = _.transform(templateFiles, function (result, templateFile) {
			var templateExp = /.+\/templates\/(.+)\.htm/gi;
			var templateName = templateFile.replace(templateExp, '$1');
			result[templateName] = grunt.file.read(templateFile);
		});

		grunt.config.data.connect.server.options.open =
			_.template('http://<%=targetHost %>:<%=port %>', opts);

		var proxy = new hoxy.Proxy({
			reverse: _.template('<%=protocol %>://<%=stage %>', opts)
		});

		opts.getTemplate = function (name) {
			if (!_.has(opts.templates, name)) {
				return null;
			}
			return opts.templates[name];
		};

		opts.proxy = proxy;

		// configure log levels
		proxy.log('info error warn debug', function (message) {
			console.log(message);
		});

		console.info('loaded rules:', _.pluck(opts.rules, 'fn'));
		console.info('loaded templates:', _.keys(opts.templates));
		// apply rules
		new Interceptor(proxy).apply(opts);

		// listen...
		proxy.listen(9001);

		grunt.task.run([
			'connect:server'
		]);
	});

	var mapTask = function (target, item) {
		return target + item;
	};

	var getTasks = function (target, environment) {
		config.connect.server.options.base = config.connect.server.options.base.map(function (item) {
			return grunt.template.process(item, {
				data: {
					environment: environment
				}
			});
		});

		var buildTasks = [];

		if (split) {
			config.connect.server.options.base =
				config.connect.server.options.base.reverse();
			buildTasks = [
				'compileCSS',
				'compileTemplates'
			];
		} else {
			buildTasks.push('build');
		}

		grunt.config('connect', config.connect);

		var tasks = buildTasks.map(mapTask.bind(this, environment + ':'));
		tasks = tasks.concat([
			'hoxy:' + target,
			environment + ':watch'
		]);
		return tasks;
	};

	grunt.registerTask('desktop:server', function (target) {
		target = target || 'dev';
		var tasks = getTasks(target, 'desktop');
		console.log(tasks);
		grunt.task.run(tasks);
	});

	grunt.registerTask('mobile:server', function (target) {
		isMobile = true;
		target = target || 'dev';
		var tasks = getTasks(target, 'mobile');
		console.log(tasks);
		grunt.task.run(tasks);
	});

	grunt.registerTask('server', function (target) {
		grunt.task.run([
			'desktop:server:' + target
		]);
	});
};
