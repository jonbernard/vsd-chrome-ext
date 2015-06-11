module.exports = {
	query: {
		phase: 'response',
		mimeType: 'text/html',
		as: 'string'
	},
	fn: function fixIE(rule, opts, req, resp) {
		'use strict';
		var userAgent = req.headers['user-agent'];
		if (userAgent && userAgent.match(/Gecko/)) {
			resp.string = resp.string.replace(/\<\!--\[if lt IE 9\]\>/, '');
		}
	}
};
