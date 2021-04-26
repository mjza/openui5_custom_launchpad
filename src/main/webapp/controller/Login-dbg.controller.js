sap.ui.define([
	"com/mjzsoft/Mjzsoft0Launchpad/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
	"use strict";
	return BaseController.extend("com.mjzsoft.Mjzsoft0Launchpad.controller.Login", {
		model: {
			firstname: "",
			lastname: "",
			email: "",
			user: "",
			pass: "",
			confirmPass: "",
			passConfirmed: false,
			flow: "login",
			success: null,
			error: null,
			lang: "en",
			captchaText: "",
			captcha: "",
			result: 0,
			emailInUse: false
		},
		onInit: function () {
			var targets = this.getOwnerComponent().getTargets();
			this.getOwnerComponent().getJwtAuth().hasSession(function (success) {
				if (success) {
					targets.display("TargetHome");
					return;
				}
			});
			//
			var lang = sap.ui.getCore().getConfiguration().getLanguage();
			lang = lang && lang.length >= 2 ? lang.substring(0, 2) : "en";
			this.model.lang = lang;
			this.setModel(new JSONModel(this.model), "loginView");
			//
			this.initiateValidator();
		},
		onBeforeRendering: function (oEvent) {
			BaseController.prototype.onBeforeRendering(oEvent);
		},
		onAfterRendering: function (oEvent) {
			BaseController.prototype.onAfterRendering(oEvent);
			this.bindOnChangeToInputs("Login");
			this.bindOnChangeToInputs("Register");
			this.bindOnChangeToInputs("Reset");
			this.getValidator().removeAllMessages();
		},
		getViewModel: function () {
			return this.getModel("loginView");
		},
		onChangeViewPress: function (oEvent) {
			var oIcon = oEvent.getSource();
			var sFlow = oIcon.data("key");
			var oViewModel = this.getViewModel();
			oViewModel.setProperty("/success", null);
			oViewModel.setProperty("/error", null);
			oViewModel.setProperty("/emailInUse", false);
			oViewModel.setProperty("/email", null);
			oViewModel.setProperty("/user", null);
			oViewModel.setProperty("/pass", null);
			oViewModel.setProperty("/confirmPass", null);
			oViewModel.setProperty("/passConfirmed", false);
			oViewModel.setProperty("/result", 0);
			if (sFlow === "login") {
				oViewModel.setProperty("/flow", sFlow);
			} else if (sFlow === "register") {
				this._newCaptcha();
				oViewModel.setProperty("/flow", sFlow);
			} else if (sFlow === "reset") {
				this._newCaptcha();
				oViewModel.setProperty("/flow", sFlow);
			}
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
		onLoginButtonPress: function () {
			if (!this.areFieldsValid("Login")) {
				return;
			}
			var oViewModel = this.getViewModel();
			var targets = this.getOwnerComponent().getTargets();
			sap.ui.getCore().getEventBus().publish("App", "StartAppBusy", null);
			oViewModel.setProperty("/success", null);
			oViewModel.setProperty("/error", null);
			this.getOwnerComponent().getJwtAuth().signIn(oViewModel.getProperty("/user"), oViewModel.getProperty("/pass"), function (data, textStatus,
				jqXHR) {
				sap.ui.getCore().getEventBus().publish("App", "StopAppBusy", null);
				this.getModel().setHeaders({
					Authorization: this.getOwnerComponent().getJwtAuth().getJwt()
				});
				sap.ui.getCore().getEventBus().publish("App", "StartAppBusy", null);
				targets.display("TargetHome");
			}.bind(this), function (err, textStatus, jqXHR) {
				sap.ui.getCore().getEventBus().publish("App", "StopAppBusy", null);
				var sMsg = this.extractErrorMessage(err, textStatus, jqXHR);
				oViewModel.setProperty("/error", sMsg);
			}.bind(this));
		},
		onRegisterButtonPress: function () {
			var oViewModel = this.getViewModel(),
			oInput = this.getView().byId("confirmPass");
			if (!this.areFieldsValid("Register") ||  !this._checkCaptcha()) {
				return;
			}
			if(oViewModel.getProperty("/emailInUse")){
				oInput = this.getView().byId("register_email");
				oInput.setValueState("Error");
				var sMsg = this.getResourceBundle().getText("login_errorEmailInUse");
				oViewModel.setProperty("/error", sMsg);
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
			this.getOwnerComponent().getJwtAuth().register(oViewModel.getProperty("/firstname"), oViewModel.getProperty("/lastname"), oViewModel.getProperty(
				"/email"), oViewModel.getProperty("/pass"), function (data, textStatus, jqXHR) {
				sap.ui.getCore().getEventBus().publish("App", "StopAppBusy", null);
				oViewModel.setProperty("/success", data.data);
				oViewModel.setProperty("/flow", "login");
			}.bind(this), function (err, textStatus, jqXHR) {
				sap.ui.getCore().getEventBus().publish("App", "StopAppBusy", null);
				sMsg = this.extractErrorMessage(err, textStatus, jqXHR);
				oViewModel.setProperty("/error", sMsg);
			}.bind(this));
		},
		onResetButtonPress: function () {
			if (!this.areFieldsValid("Reset") || !this._checkCaptcha()) {
				return;
			}
			var oViewModel = this.getViewModel();
			sap.ui.getCore().getEventBus().publish("App", "StartAppBusy", null);
			oViewModel.setProperty("/success", null);
			oViewModel.setProperty("/error", null);
			this.getOwnerComponent().getJwtAuth().forgetPassword(oViewModel.getProperty("/email"), function (data, textStatus, jqXHR) {
				sap.ui.getCore().getEventBus().publish("App", "StopAppBusy", null);
				oViewModel.setProperty("/success", this.getResourceBundle().getText("login_forgetPassword"));
				oViewModel.setProperty("/flow", "login");
			}.bind(this), function (err, textStatus, jqXHR) {
				sap.ui.getCore().getEventBus().publish("App", "StopAppBusy", null);
				var sMsg = this.extractErrorMessage(err, textStatus, jqXHR);
				oViewModel.setProperty("/error", sMsg);
			}.bind(this));
		},
		_checkCaptcha: function () {
			function roughScale(x, base) {
				var parsed = parseInt(x, base);
				if (isNaN(parsed)) {
					return 0;
				}
				return parsed;
			}
			var oViewModel = this.getViewModel();
			if (roughScale(oViewModel.getProperty("/captcha"), 10) !== oViewModel.getProperty("/result")) {
				oViewModel.setProperty("/error", this.getResourceBundle().getText("login_errorCaptcha"));
				this._newCaptcha();
				return false;
			}
			return true;
		},
		_newCaptcha: function () {
			var oViewModel = this.getViewModel();
			var _getRndInteger = function (min, max) {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			};
			var iNumbers = _getRndInteger(2, 4);
			var result = _getRndInteger(1, 9),
				captchaText = "" + result;
			for (var i = 1; i < iNumbers; i++) {
				var iItem = _getRndInteger(1, 9),
					iOperand = _getRndInteger(0, 1);
				if (iOperand === 0) {
					// Add
					result += iItem;
					captchaText += " + " + iItem;
				} else {
					// sub
					result -= iItem;
					captchaText += " - " + iItem;
				}
			}
			oViewModel.setProperty("/captchaText", this.getResourceBundle().getText("login_captcha", captchaText));
			oViewModel.setProperty("/captcha", "");
			oViewModel.setProperty("/result", result);
		},
		
		onSuccessStripClosed: function (oEvent) {
			var oViewModel = this.getViewModel();
			oViewModel.setProperty("/success", null);
		},
		
		onErrorStripClosed: function (oEvent) {
			var oViewModel = this.getViewModel();
			oViewModel.setProperty("/error", null);
		},
		
		onRejectButtonPress: function () {
			var oViewModel = this.getViewModel();
			oViewModel.setProperty("/success", null);
			oViewModel.setProperty("/error", null);
			oViewModel.setProperty("/flow", "login");
		},
		/**
		 *@memberOf com.mjzsoft.Mjzsoft0Launchpad.controller.Login
		 */
		onEmailChanged: function (oEvent) {
			var oViewModel = this.getViewModel();
			var oInput = oEvent.getSource(),
				sText = oInput.getValue();
			oInput.setBusy(true);	
			oViewModel.setProperty("/emailInUse", false);
			this.getOwnerComponent().getJwtAuth().checkEmailInUse(sText, function (data, textStatus, jqXHR) {
				oInput.setBusy(false);
				if(data.data === "true"){
					var sMsg = this.getResourceBundle().getText("login_errorEmailInUse");
					oViewModel.setProperty("/error", sMsg);
					oViewModel.setProperty("/emailInUse", true);
					oInput.setValueState(sap.ui.core.ValueState.Error);
				} else{
					oInput.setValueState(sap.ui.core.ValueState.None);
					oViewModel.setProperty("/emailInUse", false);
					oViewModel.setProperty("/error", null);
				}
			}.bind(this), function (err, textStatus, jqXHR) {
				oInput.setBusy(false);
			}.bind(this));
		},
		
		/** 
		 * 
		 * @param oEvent
		 */
		onConfirmPassChanged: function (oEvent) {
			var oViewModel = this.getViewModel(),
				sPassword = oViewModel.getProperty("/pass"),
				sConfirmPassword = oViewModel.getProperty("/confirmPass");
			if (sPassword !== sConfirmPassword) {
				oViewModel.setProperty("/passConfirmed", false);
			} else {
				oViewModel.setProperty("/passConfirmed", true);
			}
		}
	});
});