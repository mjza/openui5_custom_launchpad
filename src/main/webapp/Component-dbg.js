sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/mjzsoft/Mjzsoft0Launchpad/model/models",
	"com/mjzsoft/Mjzsoft0Launchpad/js/jwtAuth",
	"com/mjzsoft/Mjzsoft0Launchpad/conf/env"
], function (UIComponent, Device, models, jwtAuth, env) {
	"use strict";

	return UIComponent.extend("com.mjzsoft.Mjzsoft0Launchpad.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// enable routing
			this.getRouter().initialize();
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the language model
			this.setModel(models.createLanguageModel(), "languages");
			//
			if (this._checkEmailConfirmation() && this._checkPasswordReset()) {
				var targets = this.getTargets();
				jwtAuth.hasSession(function (success) {
					if (!success) {
						targets.display("TargetLogin");
						return;
					}
					this.getModel().setHeaders({
						Authorization: jwtAuth.getJwt()
					});
					targets.display("TargetHome");
				}.bind(this));
			}
		},

		/** 
		 * Check email confirmation token
		 * @constructor 
		 */
		_checkEmailConfirmation: function () {
			var sUrl = "" + window.location.href;
			var sRegEx = /([?&]email-confirmation-token)=([^#&]*)/g;
			var aMatches = sRegEx.exec(sUrl);
			var bNavigate = true;
			if (aMatches && aMatches.length > 0) {
				var sEmailConfirmationToken = aMatches[2];
				if (sEmailConfirmationToken !== "0") {
					sRegEx = /([?&]token)=([^#&]*)/g;
					aMatches = sRegEx.exec(sUrl);
					if (aMatches && aMatches.length > 0) {
						var sToken = aMatches[2];
						var targets = this.getTargets();
						jwtAuth.confirmEmail(sToken, function (data, textStatus, jqXHR) {
							targets.display("TargetSuccess");
							bNavigate = false;
						}, function (data, textStatus, jqXHR) {
							targets.display("TargetError");
							bNavigate = false;
						});
					}
				}
			}
			return bNavigate;
		},

		_checkPasswordReset: function () {
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
						var targets = this.getTargets();
						targets.display("TargetPasswordReset");
						bNavigate = false;
					}
				}
			}
			return bNavigate;
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ListSelector and ErrorHandler are destroyed.
		 * @public
		 * @override
		 */
		destroy: function () {
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		/** 
		 * Provides access to jwtAuth object 
		 * @returns
		 */
		getJwtAuth: function () {
			return jwtAuth;
		}
	});
});