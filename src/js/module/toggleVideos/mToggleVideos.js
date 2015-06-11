define(["underwire", "jquery"], function (UU, $) {
	"use strict";
	UU.addModule("Toggle Autoplay Videos", function (UU) {
		
		var _toggleVideos = function (pauseVideos) {
			var videos = $("video");
			if (videos.length > 0) {
				console.log("VSD Dev Tools >> Videos Found. Toggling.");
				for ( var i = 0; i < videos.length; i++ ) {
					var $this = videos[i];
					if ($this.volume !== 0 || pauseVideos === true) {
						$this.volume = 0;
						$this.pause();
					} else {
						$this.volume = ".66";
						$this.play();
					}
				}
				videos.prop("muted", false);
			}
		};

		return {
			scope: "body",

			messages: {
				"VSDTools-toggle-videos": function (message) {
					_toggleVideos();
				}
			},

			init: function () {
				_toggleVideos(true);
			}
		};
	});
});