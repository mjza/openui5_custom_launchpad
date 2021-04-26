sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/mjzsoft/Mjzsoft0Launchpad/js/Validator"
], function (Controller, Validator) {
	"use strict";

	return Controller.extend("com.mjzsoft.Mjzsoft0Launchpad.controller.BaseController", {
		/**
		 * Return a related control based on passed id.
		 * @public
		 * @param {string} sId
		 * @returns {sap.ui.Element} an element from view 
		 */
		getById: function (sId) {
			return sap.ui.getCore().byId(sId);
		},

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			var oModel = this.getOwnerComponent().getModel(sName);
			return oModel ? oModel : this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/** 
		 * Will publish a message for starting the busy indicator when app controller is the view manager.
		 * @public
		 * @param oEvent
		 * @returns void
		 */
		onBeforeRendering: function (oEvent) {
			sap.ui.getCore().getEventBus().publish("App", "StartAppBusy", null);
		},

		/** 
		 * Will publish a message for stopping the busy indicator when app controller is the view manager
		 * @public
		 * @param oEvent
		 * @returns void
		 */
		onAfterRendering: function (oEvent) {
			sap.ui.getCore().getEventBus().publish("App", "StopAppBusy", null);
		},

		/** 
		 * Gets the groupid and returns all the fields 
		 * @param sFieldGroupId
		 * @param oDialog
		 * @returns
		 */
		getFieldsByGroupId: function (sFieldGroupId, oDialog) {
			var aFields = oDialog ? oDialog.getControlsByFieldGroupId(sFieldGroupId) : this.getView().getControlsByFieldGroupId(sFieldGroupId);
			return aFields;
		},

		/** 
		 * bind the onInput handler to the fields
		 * @param sFieldGroupId
		 * @param oDialog
		 * @returns current class 
		 */
		bindOnChangeToInputs: function (sFieldGroupId, oDialog) {
			var aFields = this.getFieldsByGroupId(sFieldGroupId, oDialog);
			if (aFields) {
				for (var i = 0; i < aFields.length; i++) {
					if (typeof aFields[i].attachChange === "function") {
						aFields[i].attachChange(this.onInputChange, this);
					}
				}
			}
			return this;
		},

		/** 
		 * 
		 * @param oEvent
		 * @returns
		 */
		onInputChange: function (oEvent) {
			if (oEvent) {
				// When table change we do not need validation. Also the middle ware does not send any oEvent 
				var oField = oEvent.getSource(),
					oContext = oField.getBindingContext();
				if (oContext !== undefined && oContext !== null) {
					var aFieldTypes = {
							"sap.m.Input": "value",
							"sap.m.Select": "selectedKey",
							"sap.m.CheckBox": "selected",
							"sap.m.DatePicker": "dateValue",
							"sap.m.DateTimePicker": "value",
							"sap.m.TextArea": "value",
							"sap.m.Switch": "state"
						},
						fnGetFunction = function (sName) {
							var sReminder = sName.substring(1),
								sFirstLeter = sName.charAt(0).toUpperCase(),
								sFuncName = "get" + sFirstLeter + sReminder;
							return sFuncName;
						},
						sFieldType = oField.getMetadata().getName(),
						oModel = oContext.getModel(),
						sFieldPath = oField.getBinding(aFieldTypes[sFieldType]).getPath(),
						sPropertyName = (sFieldPath && sFieldPath.startsWith("/") ? sFieldPath.substring(1) : sFieldPath),
						sBindingPath = oContext.getPath() + "/" + sPropertyName,
						sFuncName = fnGetFunction(aFieldTypes[sFieldType]),
						sValue = oField[sFuncName]();
					// only applied for the fields of the main view that are bind to the default model 	
					if (oField.getBindingContext()) {
						if (sFieldType === "sap.m.DatePicker") {
							if (sValue) {
								oModel.setProperty(sBindingPath, new Date(sValue));
							} else {
								oModel.setProperty(sBindingPath, null);
							}
						} else if (sFieldType === "sap.m.DateTimePicker") {
							if (sValue) {
								oModel.setProperty(sBindingPath, new Date(oField.getDateValue()));
							} else {
								oModel.setProperty(sBindingPath, null);
							}
						} else {
							oModel.setProperty(sBindingPath, sValue);
						}
					}
				}
				// Validate input fields against root page with id 'somePage'
				this.getValidator().validate(oField);
			}
		},

		/** 
		 * Get a GroupId and tells are all the fields are valid or not!
		 * @param sFieldGroupId
		 * @param oDialog
		 * @returns
		 */
		areFieldsValid: function (sFieldGroupId, oDialog) {
			var aFields = this.getFieldsByGroupId(sFieldGroupId, oDialog),
				oValidator = this.getValidator(),
				bValid = true;
			if (aFields) {
				for (var i = 0; i < aFields.length && bValid; i++) {
					var oField = aFields[i];
					bValid = oValidator.validate(oField);
				}
			}
			return bValid;
		},

		/** 
		 * Get a GroupId and tells are all the fields are valid or not!
		 * @param sFieldGroupId
		 * @param oDialog
		 * @returns
		 */
		isFieldValid: function (oField) {
			var oValidator = this.getValidator();
			return oValidator.validate(oField);
		},

		/** 
		 * 
		 * @param oField
		 * @returns
		 */
		getFieldValueByType: function (oField) {
			var aFieldTypes = {
					"sap.m.Input": "value",
					"sap.m.Select": "selectedKey",
					"sap.m.CheckBox": "selected",
					"sap.m.DatePicker": "dateValue",
					"sap.m.DateTimePicker": "value",
					"sap.m.TextArea": "value",
					"sap.m.Switch": "state"
				},
				fnGetFunction = function (sName) {
					var sReminder = sName.substring(1),
						sFirstLeter = sName.charAt(0).toUpperCase(),
						sFuncName = "get" + sFirstLeter + sReminder;
					return sFuncName;
				},
				sFieldType = oField.getMetadata().getName(),
				sFuncName = fnGetFunction(aFieldTypes[sFieldType]),
				sValue = oField[sFuncName]();
			return sValue;
		},

		/** 
		 * 
		 */
		initiateValidator: function () {
			this._oValidator = new Validator();
			this._oValidator.removeAllMessages();
			return this._oValidator;
		},

		/** 
		 * 
		 */
		resetAllValueStates: function () {
			if (!this._oValidator) {
				this._oValidator = new Validator();
			}
			this._oValidator.removeAllMessages();
		},

		/** 
		 * 
		 * @returns
		 */
		getValidator: function () {
			if (!this._oValidator) {
				this._oValidator = new Validator();
			}
			return this._oValidator;
		},
		
		extractErrorMessage: function (err, textStatus, jqXHR) {
			var oResponse = err ? err.responseJSON : undefined,
				sMsg = this.getResourceBundle().getText("login_errorHeader") + ": ";
			if (!oResponse) {
				sMsg += this.getResourceBundle().getText("login_errorConnection");
			} else if (oResponse.error && oResponse.error.length > 0) {
				sMsg += oResponse.error + "\n";
			} else if (oResponse.message && oResponse.message.length > 0) {
				sMsg += oResponse.message + "\n";
			} else if (oResponse.data && oResponse.data.length > 0) {
				sMsg += oResponse.data + "\n";
			}
			return sMsg;
		}
	});
});