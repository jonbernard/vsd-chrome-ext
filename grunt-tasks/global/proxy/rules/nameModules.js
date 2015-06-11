module.exports = {
	query: {
		phase: 'response',
		as: 'string',
		url: /global|page/,
		mimeType: 'application/javascript'
	},
	fn: function nameModules(rule, opts, req, resp) {
		'use strict';
		if (opts.split) {
			var grunt = require('grunt');
			var path = require('path');
			var fs = require('fs');

			// give name to anonymous modules (global / page)
			var baseName = path.basename(req.url)
				.replace(path.extname(req.url), '');

			var moduleName =
				path.dirname(path.relative('/js', req.url))
				.replace(/\\/gi, '/') + '/' + baseName;

			resp.string = resp.string.replace(
				/(define\(\[)/,
				'define(\'' + moduleName + '\', ['
			);
		}
		// have to set this before returning for whatever reason
		resp.string = resp.string;
	}
};
