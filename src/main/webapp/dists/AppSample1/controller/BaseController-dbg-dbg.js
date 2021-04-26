sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"com/mjzsoft/QuestionnaireBuilder/js/Validator"
], function (Controller, History, Validator) {
	"use strict";

	/**
	 * List of properties that each type has
	 */
	var aFieldTypes = {
		"sap.m.Input": "value",
		"sap.m.Select": "selectedKey",
		"sap.m.CheckBox": "selected",
		"sap.m.DatePicker": "dateValue",
		"sap.m.DateTimePicker": "value",
		"sap.m.TextArea": "value",
		"sap.m.Switch": "state"
	};

	return Controller.extend("com.mjzsoft.QuestionnaireBuilder.controller.BaseController", {

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for getting the app view model
		 * @public
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getAppViewModel: function () {
			return this.getModel("appView");
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
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		},

		/** 
		 * Binds the `onInputChange` function to the `change` event of the input!
		 * @param {string} sFieldGroupId the fieldGroup of a set of inputs 
		 * @param {sap.m.Dialog} oDialog the elements are placed in a dialog!
		 */
		bindOnChangeToInputs: function (sFieldGroupId, oDialog) {
			var aFields = oDialog ? oDialog.getControlsByFieldGroupId(sFieldGroupId) : this.getView().getControlsByFieldGroupId(sFieldGroupId);
			if (aFields) {
				for (var i = 0; i < aFields.length; i++) {
					if (typeof aFields[i].attachChange === "function") {
						aFields[i].attachChange(this.onInputChange, this);
					}
				}
			}
		},

		/** 
		 * The event handler for input change event.
		 * Evaluate the input of the input and show error in the value state
		 * @param {	sap.ui.base.Event} oEvent corresponding event to the change event
		 */
		onInputChange: function (oEvent) {
			if (oEvent) {
				// When table change we do not need validation. Also the middle ware does not send any oEvent 
				var oField = oEvent.getSource(),
					oContext = oField.getBindingContext();
				if (oContext !== null) {
					var fnGetFunction = function (sName) {
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
							if (sValue) { // eslint-disable-line
								oModel.setProperty(sBindingPath, new Date(sValue));
							} else {
								oModel.setProperty(sBindingPath, null);
							}
						} else if (sFieldType === "sap.m.DateTimePicker") {
							if (sValue) { // eslint-disable-line
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
				this._oValidator.validate(oField);
			}
		},

		/** 
		 * Returns the value of the passed field based on its type
		 * @param {sap.ui.core.Element} oField The intended field 
		 * @returns {any} value of the main value keeper property 
		 */
		getFieldValueByType: function (oField) {
			var fnGetFunction = function (sName) {
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
		 * initiates the validator
		 */
		initiateValidator: function () {
			this._oValidator = new Validator();
		},

		/** 
		 * Resets all the value states in the view.
		 */
		resetAllValueStates: function () {
			if (!this._oValidator) {
				this._oValidator = new Validator();
			}
			this._oValidator.removeAllMessages();
		},

		/** 
		 * Returns the validator object, 
		 * If it does not exist, will create one
		 * @returns {Validator} validator object
		 */
		getValidator: function () {
			if (!this._oValidator) {
				this._oValidator = new Validator();
			}
			return this._oValidator;
		},

		/** 
		 * Copies one object in another one deeply
		 * @param {object} oTarget the target object that must be extended
		 * @param {object} oSource the source object that contains data
		 */
		objectCopier: function (oTarget, oSource) {
			for (var sKey in oSource) {
				if (oSource[sKey] !== undefined) {
					if (typeof oSource[sKey] === "object" && !(oSource[sKey] instanceof Date)) {
						if (!oTarget[sKey]) {
							oTarget[sKey] = {};
						}
						this.objectCopier(oTarget[sKey], oSource[sKey]);
					} else {
						if (typeof oSource[sKey] === "string" && oSource[sKey].length > 0) { // Copy string
							oTarget[sKey] = oSource[sKey];
						} else if (typeof oSource[sKey] === "string") { // Remove the empty string
							delete oTarget[sKey];
						} else if (oSource[sKey] !== undefined || oSource[sKey] !== null) { // if it is not null or undefined in source then copy it.
							oTarget[sKey] = oSource[sKey];
						} else {
							delete oTarget[sKey];
						}
					}
				}
			}
		},

		/** 
		 * Modifies the passed object for passing through the batch request
		 * @param {object} oObject the entity object
		 * @param {string} sType name of the entity type
		 * @returns {object} modified object data will be passed
		 */
		getBatchObject: function (oObject, sType) {
			var oData = jQuery.extend({}, oObject);
			delete oData.__metadata;
			if (sType === "Form") {
				delete oData.Icon;
				delete oData.Questions;
				delete oData.Surveys;
				delete oData.IconSrc;
			} else if (sType === "Question") {
				delete oData.Answers;
				delete oData.SourceConditions;
				delete oData.TargetConditions;
				delete oData.Form;
				delete oData.Options;
				delete oData.Qtype;
			} else if (sType === "Option") {
				delete oData.Answers;
				delete oData.Question;
			}
			return oData;
		}
	});
});