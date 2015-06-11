module.exports = {
	query: {
		phase: 'request',
		method: 'POST',
		as: 'params',
		url: 'metrics'
	},
	fn: function outputMetrics(rule, opts, req, resp, done) {
		'use strict';

		var metrics = JSON.stringify(req.params, null, 4);
		var logMessage = [
			'\nmetrics post: ',
			'---------------------',
			metrics,
			'---------------------\n'
		];
		console.log(logMessage.join('\n'));
		resp.statusCode = 200;

		done();
	}
};
