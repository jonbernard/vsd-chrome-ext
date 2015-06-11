require([
	"underwire",
	"base/global",

	"module/buildInfo/mBuildInfo",
	"module/popupContent/mPopupContent",
	"module/cookieEditor/mCookieEditor"

], function (UU) {
	'use strict';

	UU.startAll();

	UU.broadcast({
		"type": "VSDTools-popup-loaded"
	});
});
