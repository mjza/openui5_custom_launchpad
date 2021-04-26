/*global de */

sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},

		/** 
		 * gets the path to icon
		 * @param {string} sValue icon data
		 * @returns {string} path to icon
		 */
		icon: function (sValue) {
			return sValue && sValue !== "" ? sValue : jQuery.sap.getModulePath("com/mjzsoft/UserSurveys/images") + "/Person.png";
		},

		userSurveyTableMode: function () {
			var oCurrentUser = this.getOwnerComponent().getCurrentUser();

			return oCurrentUser && oCurrentUser.admin ? "MultiSelect" : "None";
		},

		userSurveyTableItemType: function (sUserId) {
			var oCurrentUser = this.getOwnerComponent().getCurrentUser();

			return oCurrentUser && oCurrentUser.admin && oCurrentUser.id !== parseInt(sUserId, 10) ? "Inactive" : "Navigation";
		},

		userSurveyTableButtonVisible: function () {
			var oCurrentUser = this.getOwnerComponent().getCurrentUser();

			return oCurrentUser && oCurrentUser.admin;
		}
	};
});

// to access binding info of selected view field is new object required
jQuery.sap.declare("com.mjzsoft.UserSurveys.model.Formatter");

com.mjzsoft.UserSurveys.model.Formatter = {

	/** 
	 * colors the text value to success color
	 * @param {string} sValue current text value
	 * @returns {string} displayed text value
	 */
	successValue: function (sValue) {
		this.addStyleClass("successDate");
		//	this.setValueState(sap.ui.core.ValueState.Success);
		return sValue;
	},

	/** 
	 * colors value to current state of survey
	 * @param {string} sValue current date value
	 * @param {Date} sDateFrom date from
	 * @param {Date} sDateTo date to
	 * @param {string} sUserId who has this survey
	 * @returns {string} display value
	 */
	doneValue: function (sValue, sDateFrom, sDateTo, sUserId) {
		// removes previous styles
		this.removeStyleClass("doneDate");
		this.removeStyleClass("openDate");
		this.removeStyleClass("closedDate");

		var sNewValue;

		if (sValue !== "") {
			sNewValue = sValue;
			this.addStyleClass("doneDate");
		} else {
			if (new Date() > sDateTo) {
				sNewValue = this.getModel("i18n").getResourceBundle().getText("stateClosed");
				this.addStyleClass("closedDate");
			} else if (new Date() < sDateFrom) {
				sNewValue = this.getModel("i18n").getResourceBundle().getText("stateNotOpenYet");
				this.addStyleClass("closedDate");
			} else {
				// case if item removed from table
				if (this.getBindingContext().getObject() === undefined) {
					sNewValue = this.getModel("i18n").getResourceBundle().getText("stateUnknown");
					this.addStyleClass("doneDate");
				} else {
					var sFormPath = this.getBindingContext().getObject().Form.__ref;
					var oForm = this.getModel().getProperty("/" + sFormPath);

					// check if some answers exists
					var bAnswered = false;
					for (var n = 0; n < oForm.Questions.__list.length; n++) {
						var sQuestionPath = oForm.Questions.__list[n];

						var oQuesiton = this.getModel().getProperty("/" + sQuestionPath);

						var oBindings = this.getModel().bindList("/" + sQuestionPath + "/Answers", null, null, [new sap.ui.model.Filter({
							path: "UserId",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: sUserId
						}), new sap.ui.model.Filter({
							path: "QuestionId",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oQuesiton.Id
						})]);

						if (oBindings.getLength() > 0) {
							bAnswered = true;
							break;
						}
					}

					// is some question of form answered, it couldn't be answered. so set unknown finish date
					if (bAnswered) {
						sNewValue = this.getModel("i18n").getResourceBundle().getText("stateUnknown");
						this.addStyleClass("doneDate");
					} else {
						sNewValue = this.getModel("i18n").getResourceBundle().getText("stateOpen");
						this.addStyleClass("openDate");
					}
				}
			}
		}

		return sNewValue;
	}
};