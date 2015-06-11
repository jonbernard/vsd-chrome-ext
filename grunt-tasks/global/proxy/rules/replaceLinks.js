module.exports = {
	query: {
		phase: 'response',
		mimeType: 'text/html',
		as: '$'
	},
	fn: function replaceLinks(rule, opts, req, resp) {
		'use strict';
		var $ = resp.$;
		$('a').each(function (i, elem) {
			if (elem.attribs.href) {
				elem.attribs.href = elem.attribs.href
					.replace('http[s]?://' + opts.stage, '');
			}
		});
	}
};
