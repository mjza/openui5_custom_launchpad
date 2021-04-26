sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox",
	"../js/XML2JSON"
], function (UI5Object, MessageBox, XML2JSON) {
	"use strict";

	return UI5Object.extend("com.mjzsoft.QuestionnaireBuilder.controller.ErrorHandler", {

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias com.mjzsoft.QuestionnaireBuilder.controller.ErrorHandler
		 */
		constructor: function (oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oComponent = oComponent;
			this._oModel = oComponent.getModel();
			this._bMessageOpen = false;
			this._sErrorText = this._oResourceBundle.getText("errorText");

			this._oModel.attachMetadataFailed(function (oEvent) {
				var oParams = oEvent.getParameters();
				this._showServiceError(oParams.response);
			}, this);

			this._oModel.attachRequestFailed(function (oEvent) {
				var oParams = oEvent.getParameters();
				// An entity that was not found in the service is also throwing a 404 error in oData.
				// We already cover this case with a notFound target so we skip it here.
				// A request that cannot be sent to the server is a technical error that we have to handle though
				if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf(
						"Cannot POST") === 0)) {
					this._showServiceError(oParams.response);
				}
			}, this);
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 * @param {object} oDetails a technical error to be displayed on request
		 * @private
		 */
		_showServiceError: function (oDetails) {
			if (this._bMessageOpen) {
				return;
			}
			try {
				var oMessage = JSON.parse(oDetails.responseText);
				try {
					var aMessages = oMessage.error.innererror.errordetails,
						sMessage = oDetails.statusText + " (" + oDetails.statusCode + ") <br/>";
					for (var i = 0; i < aMessages.length; i++) {
						sMessage += "<br/> Code(" + aMessages[i].code + ") : " + aMessages[i].message;
					}
					if (aMessages.length === 0) {
						sMessage += oMessage.error.message.value;
					}
					var oResolution = oMessage.error.innererror.Error_Resolution;
					if (oResolution && oResolution.SAP_Transaction) {
						sMessage += "<br/>" + oResolution.SAP_Transaction;
					}
				} catch (e) {
					sMessage = oDetails.statusText + " (" + oDetails.statusCode + ") <br/>" + oMessage.error.message.value;
				}
			} catch (e) {
				//
				var x2js = new XML2JSON.X2JS();
				oMessage = x2js.xml_str2json(oDetails.responseText);
				try {
					sMessage = oDetails.statusText + " (" + oDetails.statusCode + ") \n\n" + oMessage.error.message.__text;
					sMessage += "<br/><br/>" + oMessage.error.innererror.Error_Resolution.SAP_Transaction;
				} catch (ee) {
					sMessage = oDetails.statusText + " (" + oDetails.statusCode + ") \n\n" + oDetails.responseText;
				}
			}
			this._bMessageOpen = true;
			var iCode = parseInt(oDetails.statusCode, 10);
			if (iCode < 500 && iCode >= 400) {
				MessageBox.error(
					this._oResourceBundle.getText("error400TypeResponse"), {
						id: "serviceErrorMessageBox",
						details: sMessage ? sMessage : oDetails,
						icon: sap.m.MessageBox.Icon.WARNING,
						styleClass: this._oComponent.getContentDensityClass(),
						actions: [MessageBox.Action.CLOSE],
						onClose: function () {
							this._bMessageOpen = false;
						}.bind(this)
					}
				);
			} else {
				MessageBox.error(
					this._oResourceBundle.getText("errorResponse"), {
						id: "serviceErrorMessageBox",
						details: sMessage ? sMessage : oDetails,
						icon: sap.m.MessageBox.Icon.WARNING,
						styleClass: this._oComponent.getContentDensityClass(),
						actions: [MessageBox.Action.CLOSE],
						onClose: function () {
							this._bMessageOpen = false;
						}.bind(this)
					}
				);
			}
		}
	});
});