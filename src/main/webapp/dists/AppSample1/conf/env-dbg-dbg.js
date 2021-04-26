sap.ui.define(["sap/ui/model/json/JSONModel", "sap/base/Log"], function (JSONModel, Log) {
	"use strict";
	
	/**
	 * It is face env that sets the session just for test. 
	 */
	var sURL = window.location.href,
		bDebug = sURL.includes("hana.ondemand.com/") ? true : false,
		_oLocal = jQuery.sap.storage(jQuery.sap.storage.Type.local),
		setSession = function () {
			if (bDebug) {
				try {
					var _oSession = jQuery.sap.storage(jQuery.sap.storage.Type.session);
					// get the path to the JSON file
					var sPath = jQuery.sap.getModulePath("com.mjzsoft.QuestionnaireBuilder", "/conf/token.json");
					// initialize the model with the JSON file
					var oModel = new JSONModel(sPath);
					oModel.attachRequestCompleted(null, function () {
						var oToken = oModel.getData();
						var oCurrentToken = {
							accessToken: oToken.accessToken,
							refreshToken: oToken.refreshToken,
							tokenType: oToken.tokenType,
							expireAt: (new Date().getTime() + oToken.expiryDuration)
						};
						_oSession.put("CurrentToken", JSON.stringify(oCurrentToken));
					});
				} catch (e) {
					Log.error(e);
				}
			}
		};

	var sBaseUrl;
	if (bDebug) {
		sBaseUrl = "http://localhost"; // eslint-disable-line
	} else {
		sBaseUrl = window.location.href;
		sBaseUrl = sBaseUrl.substring(0, sBaseUrl.indexOf("?"));
		sBaseUrl = sBaseUrl.substring(0, sBaseUrl.lastIndexOf("/"));
	}
	_oLocal.put("JwtServerUrl", sBaseUrl + "/");
	_oLocal.put("JwtUserEndpoint", "api/user/me");

	setSession();

	return {
		isDebugModeActivated: function () {
			return bDebug;
		}
	};
});