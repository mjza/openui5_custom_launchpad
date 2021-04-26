sap.ui.define([], function () {
	"use strict";
	return {
		"debug": false,
		"languages": [{
			"id": "en",
			"name": "English",
			"rtl": false
		}, {
			"id": "de",
			"name": "Deutsch",
			"rtl": false
		}, {
			"id": "fa",
			"name": "فارسی",
			"rtl": true
		}],
		"deviceInfo": {
			"deviceId": "17867868768",
			"deviceType": "DEVICE_TYPE_ANDROID",
			"notificationToken": "333322224444"
		},
		"serverUrl": sap.ui.require.toUrl("com/mjzsoft/Mjzsoft0Launchpad/"),
		"registerEndPoint": "api/auth/register",
		"loginEndpoint": "api/auth/login",
		"refreshEndpoint": "api/auth/refresh",
		"logoutEndpoint": "api/user/logout",
		"userEndpoint": "api/user/me",
		"forgetEndpoint": "api/auth/password/resetlink",
		"resetEndpoint": "api/auth/password/reset",
		"confirmEndpoint": "api/auth/registrationConfirmation",
		"emailInUseEndpoint": "api/auth/checkEmailInUse",
		"passwordUpdateEndpoint": "api/user/password/update"
	};
});