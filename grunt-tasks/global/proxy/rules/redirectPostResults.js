module.exports = {
	query: {
		phase: 'response',
		method: 'POST',
		statusCode: 302
	},
	fn: function redirectPostResults(rule, opts, req, resp, done) {
		'use strict';
		var location = resp.headers.location;
		if (location) {
			location = location.replace('https', 'http')
				.replace(opts.stage, opts.targetHost + ':' + opts.port);
			resp.headers.location = location;
		}
		done();
	}
};
