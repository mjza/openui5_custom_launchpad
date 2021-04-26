sap.ui.define([], function () {
	"use strict";
	var _jwt = null,
		_aModels = [],
		_oSession = jQuery.sap.storage(jQuery.sap.storage.Type.session),
		_oLocal = jQuery.sap.storage(jQuery.sap.storage.Type.local),
		_ajax = function (type, url, params, fnSuccess, fnError) {
			var token = _jwt;
			sap.ui.core.BusyIndicator.show(1000);
			jQuery.ajax({
				type: type,
				contentType: "application/json; charset=utf-8",
				pathInfo: null,
				data: type === "POST" ? JSON.stringify(params) : params,
				url: _oLocal.get("JwtServerUrl") + url,
				headers: {
					"Authorization": token
				},
				cache: false,
				//dataType: "json",
				async: false,
				success: function (_data, textStatus, jqXHR) {
					sap.ui.core.BusyIndicator.hide();
					if (typeof fnSuccess === "function") {
						fnSuccess(_data, textStatus, jqXHR);
					}
				},
				error: function (_err, textStatus, jqXHR) {
					sap.ui.core.BusyIndicator.hide();
					if (typeof fnError === "function") {
						fnError(_err, textStatus, jqXHR);
					}
				}
			});
		},
		_get = function (url, params, fnSuccess, fnError) {
			_ajax("GET", url, params, fnSuccess, fnError);
		},
		_getCurrentToken = function () {
			var sCurrentToken = _oSession.get("CurrentToken");
			return sCurrentToken !== null ? JSON.parse(sCurrentToken) : null;
		},
		_updateAuthOnModel = function (sName) {
			var oModel = _aModels[sName];
			oModel.setHeaders({
				Authorization: _jwt
			});
		},
		_updateAuthOnModels = function () {
			for (var sKey in _aModels) {
				_updateAuthOnModel(sKey);
			}
		},
		_removeAuthOnModel = function (sName) {
			var oModel = _aModels[sName];
			oModel.setHeaders({
				Authorization: null
			});
		},
		_updateToken = function () {
			var jwtAuthToken = _getCurrentToken();
			if (jwtAuthToken !== null && jwtAuthToken.expireAt > new Date().getTime()) {
				var newJwt = jwtAuthToken.tokenType + jwtAuthToken.accessToken;
				if (newJwt !== _jwt) {
					_jwt = newJwt;
				}
			} else {
				_oSession.clear();
				_jwt = null;
			}
			_updateAuthOnModels();
		};
	// initialize the token	
	_updateToken();
	// listen for any changes
	sap.ui.getCore().getEventBus().subscribe("JWT", "jwtChanged", _updateToken, this);
	var oJwtAuthApp = {
		hasSession: function (callback) {
			var jwtAuthToken = _getCurrentToken();
			if (jwtAuthToken !== null && jwtAuthToken.expireAt > new Date().getTime()) {
				_jwt = jwtAuthToken.tokenType + jwtAuthToken.accessToken;
				if (typeof callback === "function") {
					callback(true);
				}
				return true;
			} else {
				_oSession.clear();
				_jwt = null;
				if (typeof callback === "function") {
					callback(false);
				}
				return false;
			}
		},
		addModel: function (oModel, sName) {
			_aModels[sName] = oModel;
			_updateAuthOnModel(sName);
		},
		removeModel: function (sName) {
			if (_aModels[sName] !== undefined) {
				_removeAuthOnModel(sName);
				delete _aModels[sName];
			}
		},
		getCurrentUser: function () {
			var oCurrentUser = null;
			if (this.hasSession()) {
				var sCurrentUser = _oSession.get("CurrentUser");
				if (sCurrentUser === null) {
					_get(_oLocal.get("JwtUserEndpoint"), null, function (_data, textStatus, jqXHR) {
						_oSession.put("CurrentUser", JSON.stringify(_data));
						oCurrentUser = _data;
					});
				} else {
					oCurrentUser = JSON.parse(sCurrentUser);
				}
			}
			return oCurrentUser;
		}
	};
	return oJwtAuthApp;
});