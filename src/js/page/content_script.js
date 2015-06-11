require([
	"underwire",
	"base/global",

	"module/chromeEventListener/mChromeEventListener",
	"module/toggleVideos/mToggleVideos",
	"module/zIndexMap/mZIndexMap"

], function (UU) {
	'use strict';

	if (window.location.host.indexOf("dev-") > -1 ||
		window.location.host.indexOf("test-") > -1 ||
		window.location.host.indexOf("pint.") > -1) {
		UU.startAll();
	}
});

// JB: These functions need to run after DOM load, but before javascript.

if (window.location.host.indexOf("dev-") > -1 ||
	window.location.host.indexOf("test-") > -1 ||
	window.location.host.indexOf("pint.") > -1) {
	
	// Set volume attribute before videos are rendered
	if ($("video").length > 0) {
		console.log("VSD Dev Tools >> Mute Videos");
		$('video').attr("data-volume", 0);
	}
}