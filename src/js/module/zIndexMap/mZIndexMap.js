define(["underwire", "jquery"], function (UU, $) {
	"use strict";
	UU.addModule("zIndexMap", function (UU) {

		return {
			scope: "body",

			messages: {
				"VSDTools-z-index-map-show": function (message) {
					var items = $('*').filter(function () {
				        return $(this).css('z-index') !== 'auto';
				    }).filter(function () {
				        return $(this).css('z-index') !== '0';
				    });

				    for (var item in items) {
				    	if (items.hasOwnProperty(item) && $(items[item]) && $(items[item]).css("z-index")) {
					    	$(items[item]).prepend('<div class="vsd-tools-z-index">z-index:&nbsp;'+$(items[item]).css("z-index")+'</div>');
					    }
				    }

				},
				"VSDTools-z-index-map-hide": function (message) {
					$(".vsd-tools-z-index").remove();
				}
			}
		};
	});
});