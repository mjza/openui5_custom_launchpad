sap.ui.define([
	"../conf/env",
	"sap/m/MessageToast"
], function (env, MessageToast) {
	"use strict";

	var jwt = null,
		_oSession = jQuery.sap.storage(jQuery.sap.storage.Type.session),
		_oLocal = jQuery.sap.storage(jQuery.sap.storage.Type.local),
		_ajax = function (type, url, params, fnSuccess, fnError) {
			var token = jwt;
			sap.ui.core.BusyIndicator.show(1000);
			jQuery.ajax({
				type: type,
				contentType: "application/json; charset=utf-8",
				pathInfo: null,
				data: type === "POST" ? JSON.stringify(params) : params,
				url: env.serverUrl + url,
				headers: {
					"Authorization": token
				},
				cache: false,
				dataType: "json",
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
		_post = function (url, data, fnSuccess, fnError) {
			_ajax("POST", url, data, fnSuccess, fnError);
		},
		_get = function (url, params, fnSuccess, fnError) {
			_ajax("GET", url, params, fnSuccess, fnError);
		},
		_getCurrentToken = function () {
			var sCurrentToken = _oSession.get("CurrentToken");
			return sCurrentToken !== null ? JSON.parse(sCurrentToken) : null;
		};
	// This address is used in the apps for getting the current user data	
	_oLocal.put("JwtUserEndpoint", env.userEndpoint);
	_oLocal.put("JwtServerUrl", env.serverUrl);
	//
	var oJwtAuth = {

		getJwt: function () {
			return jwt;
		},

		hasSession: function (callback) {
			var jwtAuthToken = _getCurrentToken();
			if (jwtAuthToken !== null && jwtAuthToken.expireAt > new Date().getTime()) {
				jwt = jwtAuthToken.tokenType + jwtAuthToken.accessToken;
				if (typeof callback === "function") {
					callback(true);
				}
				return true;
			} else {
				_oSession.clear();
				jwt = null;
				if (typeof callback === "function") {
					callback(false);
				}
				return false;
			}
		},

		getExpiryTime: function () {
			var iExpiry = 0;
			var jwtAuthToken = _getCurrentToken();
			if (jwtAuthToken !== null && jwtAuthToken.expireAt > new Date().getTime()) {
				iExpiry = jwtAuthToken.expireAt;
			} else {
				_oSession.clear();
				jwt = null;
			}
			return iExpiry;
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
		},

		refreshToken: function (fnSuccess, fnError) {
			if (this.hasSession()) {
				var jwtAuthToken = _getCurrentToken();
				var refreshData = {
					refreshToken: jwtAuthToken.refreshToken
				};
				var result = false;
				_post(env.refreshEndpoint, refreshData, function (_data, textStatus, jqXHR) {
					var oCurrentToken = {
						accessToken: _data.accessToken,
						refreshToken: _data.refreshToken,
						tokenType: _data.tokenType,
						expireAt: (new Date().getTime() + _data.expiryDuration)
					};
					_oSession.put("CurrentToken", JSON.stringify(oCurrentToken));
					jwt = jwtAuthToken.tokenType + jwtAuthToken.accessToken;
					if (typeof fnSuccess === "function") {
						fnSuccess(_data, textStatus, jqXHR);
					}
					result = true;
					sap.ui.getCore().getEventBus().publish("JWT", "jwtChanged", null);
				}, function (_data, textStatus, jqXHR) {
					if (typeof fnError === "function") {
						fnError(_data, textStatus, jqXHR);
					}
				});
				return result;
			} else {
				if (typeof fnError === "function") {
					fnError();
				}
				return false;
			}
		},

		register: function (sFirstName, sLastname, sEmail, sPassword, fnSuccess, fnError) {
			var userData = {
				firstName: sFirstName,
				lastName: sLastname,
				username: sEmail,
				email: sEmail,
				password: sPassword,
				registerAsAdmin: false
			};
			_post(env.registerEndPoint, userData, fnSuccess, fnError);
		},

		signIn: function (sEmail, sPassword, fnSuccess, fnError) {
			var authenticationData = {
				email: sEmail,
				password: sPassword,
				deviceInfo: env.deviceInfo
			};
			_post(env.loginEndpoint, authenticationData, function (_data, textStatus, jqXHR) {
				var oCurrentToken = {
					accessToken: _data.accessToken,
					refreshToken: _data.refreshToken,
					tokenType: _data.tokenType,
					expireAt: (new Date().getTime() + _data.expiryDuration)
				};
				_oSession.put("CurrentToken", JSON.stringify(oCurrentToken));
				if (typeof fnSuccess === "function") {
					fnSuccess(_data, textStatus, jqXHR);
				}
				sap.ui.getCore().getEventBus().publish("JWT", "jwtChanged", null);
			}, function (_err, textStatus, jqXHR) {
				_oSession.clear();
				jwt = null;
				if (typeof fnError === "function") {
					fnError(_err, textStatus, jqXHR);
				}
				sap.ui.getCore().getEventBus().publish("JWT", "jwtChanged", null);
			});
		},

		signOut: function (fnSuccess, fnError) {
			if (this.hasSession()) {
				var authenticationData = {
					deviceInfo: env.deviceInfo
				};
				_post(env.logoutEndpoint, authenticationData, function (_data, textStatus, jqXHR) {
					_oSession.clear();
					jwt = null;
					if (typeof fnSuccess === "function") {
						fnSuccess(_data, textStatus, jqXHR);
					}
					sap.ui.getCore().getEventBus().publish("JWT", "jwtChanged", null);
				}, function (_err, textStatus, jqXHR) {
					_oSession.clear();
					jwt = null;
					if (typeof fnError === "function") {
						fnError(_err, textStatus, jqXHR);
					}
					sap.ui.getCore().getEventBus().publish("JWT", "jwtChanged", null);
				});
			}
		},

		forgetPassword: function (sEmail, fnSuccess, fnError) {
			var emailData = {
				email: sEmail
			};
			_post(env.forgetEndpoint, emailData, fnSuccess, fnError);
		},

		resetPassword: function (sPassword, sConfirmPassword, sToken, fnSuccess, fnError) {
			var resetData = {
				password: sPassword,
				confirmPassword: sConfirmPassword,
				token: sToken
			};
			var result = false;
			_post(env.resetEndpoint, resetData, function (_data, textStatus, jqXHR) {
				if (typeof fnSuccess === "function") {
					fnSuccess(_data, textStatus, jqXHR);
				}
				result = true;
			}, fnError);
			return result;
		},

		confirmEmail: function (sToken, fnSuccess, fnError) {
			var sParam = "token=" + sToken;
			_get(env.confirmEndpoint, sParam, fnSuccess, fnError);
		},

		checkEmailInUse: function (sEmail, fnSuccess, fnError) {
			var sParam = "email=" + sEmail;
			_get(env.emailInUseEndpoint, sParam, fnSuccess, fnError);
		},

		updatePassword: function (sOldPassword, sNewPassword, fnSuccess, fnError) {
			if (this.hasSession()) {
				var passwordData = {
					newPassword: sNewPassword,
					oldPassword: sOldPassword
				};
				var result = false;
				_post(env.passwordUpdateEndpoint, passwordData, function (_data, textStatus, jqXHR) {
					if (typeof fnSuccess === "function") {
						fnSuccess(_data, textStatus, jqXHR);
					}
					result = true;
				}, fnError);
				return result;
			} else {
				if (typeof fnError === "function") {
					fnError();
				}
				return false;
			}
		}
	};

	return oJwtAuth;
});