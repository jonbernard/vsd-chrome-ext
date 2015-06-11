define(["underwire", "jquery"], function (UU, $) {
	"use strict";
	UU.addModule("Chrome Event Listener", function (UU) {

		var chrome = window.chrome;

		return {
			scope: "body",

			init: function () {

				chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

					if (request && request.func) {
						if (request.func === "toggleVideos") {

							UU.broadcast({
								"type": "VSDTools-toggle-videos"
							});

						} else if (request.func.indexOf("VSDTools-z-index-map-") !== -1) {

							UU.broadcast({
								"type": request.func
							});

						} else if (request.func === "checkContentScript") {
							var popupContent = {};

							if ($("html").attr("data-asset-build")) {
								popupContent = {
										isMobile: (!$("html").hasClass("desktop")) ? true : false,
										isZIndex: ($(".vsd-tools-z-index")[0]) ? true : false,
										buildID: $("html").attr("data-asset-build").replace("build/", "") || null,
										videos: null
									};

								if ($('video')[0] && $('video')[0]) {
									popupContent.videos = {
										playing: ($('video')[0].volume !== 0) ? true : false,
										hasVideos: ($('video').length > 0) ? true : false
									};
								}
							} else {
								popupContent = false;
							}

							sendResponse({
								func: "checkContentScript",
								popupContent: popupContent
							});

						} else if (request.func === "checkHost") {

							sendResponse({
								func: "checkHost",
								host: window.location.host
							});

						}
					}
				});

			}
		};
	});
});