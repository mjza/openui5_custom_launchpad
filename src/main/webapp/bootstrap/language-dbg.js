(function () {
	"use strict";
	var queryString = window.location.search,
		urlParams = new URLSearchParams(queryString),
		sLang = urlParams.get("sap-language");
	if (!sLang) { // if the language is not set, then set it!
		var sNextLang = "en";
		var sUrl = "" + window.location.href,
			sNewUrl = sUrl;
		if (sUrl.indexOf("?") > 0) {
			sNewUrl = sUrl.replace("?", "?sap-language=" + sNextLang + "&");
		} else if (sUrl.indexOf(".html") > 0) {
			sNewUrl = sUrl.replace(".html", ".html?sap-language=" + sNextLang);
		} else if (sUrl.indexOf("#") > 0) {
			sNewUrl = sUrl.replace("#", "?sap-language=" + sNextLang + "#");
		} else if (sUrl.endsWith("/")) {
			sNewUrl = sUrl + "?sap-language=" + sNextLang;
		} else {
			sNewUrl = sUrl + "/?sap-language=" + sNextLang;
		}
		document.location.replace(sNewUrl);
	} else if (sLang.length >= 2 && sLang.toLowerCase().substring(0, 2) === "fa") {
		sap.ui.loader.config({
			map: {
				"*": {
					"sap/m/messagebundle": "com/mjzsoft/Mjzsoft0Launchpad/i18n/sap/m/fa/messagebundle",
					"sap/ui/core/messagebundle": "com/mjzsoft/Mjzsoft0Launchpad/i18n/sap/ui/core/fa/messagebundle",
					"sap/ui/layout/messagebundle": "com/mjzsoft/Mjzsoft0Launchpad/i18n/sap/ui/layout/fa/messagebundle"
				}
			},
			paths: {
				"com/mjzsoft/Mjzsoft0Launchpad": "./"
			}
		});
	}
}());