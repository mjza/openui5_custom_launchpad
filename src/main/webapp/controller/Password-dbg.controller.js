sap.ui.define([
	"com/mjzsoft/Mjzsoft0Launchpad/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
	"use strict";
	return BaseController.extend("com.mjzsoft.Mjzsoft0Launchpad.controller.Password", {
		model: {
			resetToken: undefined,
			newPass: undefined,
			confirmNewPass: undefined,
			passConfirmed: false,
			success: null,
			error: null,
			lang: "en"
		},

		onInit: function () {
			var lang = sap.ui.getCore().getConfiguration().getLanguage();
			lang = lang && lang.length >= 2 ? lang.substring(0, 2) : "en";
			this.model.lang = lang;
			this.setModel(new JSONModel(this.model), "passwordView");
			//
			this.initiateValidator();
		},

		onBeforeRendering: function (oEvent) {
			BaseController.prototype.onBeforeRendering(oEvent);
			if (this._readToken()) {
				sap.ui.getCore().getEventBus().publish("App", "StartAppBusy", null);
				var targets = this.getOwnerComponent().getTargets();
				targets.display("TargetLogin");
				return;
			}
		},

		onAfterRendering: function (oEvent) {
			BaseController.prototype.onAfterRendering(oEvent);
			this.bindOnChangeToInputs("Password");
			this.getValidator().removeAllMessages();

		},

		_readToken: function () {
			var sUrl = "" + window.location.href;
			var sRegEx = /([?&]password-reset-token)=([^#&]*)/g;
			var aMatches = sRegEx.exec(sUrl);
			var bNavigate = true;
			if (aMatches && aMatches.length > 0) {
				var sPasswordResetToken = aMatches[2];
				if (sPasswordResetToken !== "0") {
					sRegEx = /([?&]token)=([^#&]*)/g;
					aMatches = sRegEx.exec(sUrl);
					if (aMatches && aMatches.length > 0) {
						var sToken = aMatches[2];
						this.model.resetToken = sToken;
						bNavigate = false;
					}
				}
			}
			return bNavigate;
		},

		getViewModel: function () {
			return this.getModel("passwordView");
		},

		onLanguageChange: function (oEvent) {
			sap.ui.getCore().getEventBus().publish("App", "StartAppBusy", null);
			var sNextLang = oEvent.getSource().getSelectedKey();
			var sUrl = "" + window.location.href,
				sNewUrl = sUrl;
			var sRegEx = /([?&]sap-language)=([^#&]*)/g;
			var aMatches = sRegEx.exec(sUrl);
			if (aMatches && aMatches.length > 0) {
				sNewUrl = sUrl.replace(sRegEx, aMatches[1] + "=" + sNextLang);
			} else if (sUrl.indexOf("?") > 0) {
				sNewUrl = sUrl.replace("?", "?sap-language=" + sNextLang + "&");
			} else {
				sNewUrl = sUrl.replace("index.html", "index.html?sap-language=" + sNextLang + "&");
			}
			sap.m.URLHelper.redirect(sNewUrl, false);
		},

		onConfirmPassChanged: function (oEvent) {
			var oViewModel = this.getViewModel(),
				sNewPassword = oViewModel.getProperty("/newPass"),
				sConfirmNewPassword = oViewModel.getProperty("/confirmNewPass");
			if (sNewPassword !== sConfirmNewPassword) {
				oViewModel.setProperty("/passConfirmed", false);
			} else {
				oViewModel.setProperty("/passConfirmed", true);
			}
		},

		onPasswordResetButtonPress: function () {
			var oViewModel = this.getViewModel(),
				sToken = oViewModel.getProperty("/resetToken"),
				sNewPassword = oViewModel.getProperty("/newPass"),
				sConfirmNewPassword = oViewModel.getProperty("/confirmNewPass"),
				oInput = this.getView().byId("confirmNewPass");
			if (!this.areFieldsValid("Password")) {
				return;
			}
			if (!oViewModel.getProperty("/passConfirmed")) {
				oInput.setValueState(sap.ui.core.ValueState.Error);
				return;
			}
			oInput.setValueState(sap.ui.core.ValueState.None);
			sap.ui.getCore().getEventBus().publish("App", "StartAppBusy", null);
			oViewModel.setProperty("/success", null);
			oViewModel.setProperty("/error", null);
			this.getOwnerComponent().getJwtAuth().resetPassword(sNewPassword, sConfirmNewPassword, sToken, function (data, textStatus, jqXHR) {
				sap.ui.getCore().getEventBus().publish("App", "StartAppBusy", null);
				var sUrl = "" + window.location.href,
					sNewUrl = sUrl;
				var sRegEx = /([?&]password-reset-token)=([^#&]*)/g;
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
			}.bind(this), function (err, textStatus, jqXHR) {
				sap.ui.getCore().getEventBus().publish("App", "StopAppBusy", null);
				var sMsg = this.extractErrorMessage(err, textStatus, jqXHR);
				oViewModel.setProperty("/error", sMsg);
			}.bind(this));
		},

		onSuccessStripClosed: function (oEvent) {
			this.getViewModel().setProperty("/success", null);
		},

		onErrorStripClosed: function (oEvent) {
			this.getViewModel().setProperty("/error", null);
		},

		onRejectButtonPress: function () {
			var targets = this.getOwnerComponent().getTargets();
			targets.display("TargetLogin");
		}
	});
});