module.exports = {
	query: {
		phase: 'response',
		mimeType: 'text/html',
		as: '$'
	},
	fn: function wrapModules(rule, opts, req, resp) {
		'use strict';
		if (!opts.split) {
			resp.string = resp.string;
			return;
		}

		var $ = resp.$;

		var $head = $('head');

		var $requireScript = $('<script>').attr('src', '/resources/js/base/require.js');
		var $requireConfig = $('<script>').attr('src', '/resources/js/requirejsconfig.js');

		$head.prepend($requireScript);
		$head.prepend($requireConfig);

		$('script').each(function (i, elem) {
			var $elem = $(elem);
			if (!$elem.attr('src')) {
				var src = elem.children[0].data;
				if (/UU/g.test(src)) {
					src = 'require(["underwire"], function(UU) {' + src + '});';
					elem.children[0].data = src;
				}
			}
		});
	}
};
