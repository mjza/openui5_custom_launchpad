sap.ui.define([
	"com/mjzsoft/Mjzsoft0Launchpad/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.mjzsoft.Mjzsoft0Launchpad.controller.ErrorSuccess", {
		onInit: function () {

		},
		onNavToLoginButtonPress: function () {
			var sUrl = "" + window.location.href,
				sNewUrl = sUrl;
			var sRegEx = /([?&]email-confirmation-token)=([^#&]*)/g;
			var aMatches = sRegEx.exec(sUrl);
			if (aMatches && aMatches.length > 0) {
				sNewUrl = sUrl.replace(sRegEx, aMatches[1] + "=0");
			}
			sRegEx = /([?&]token)=([^#&]*)/g;
			aMatches = sRegEx.exec(sUrl);
			if (aMatches && aMatches.length > 0) {
				sNewUrl = sNewUrl.replace(sRegEx, aMatches[1] + "=0");
			}
			document.location.replace(sNewUrl);
		}
	});
});