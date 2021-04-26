/*Used in the worklist controller for colorring the start indicators*/
sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator"],
	function (Filter, FilterOperator) {
		"use strict";
		
		/** 
		 * Tells if user answered any questions of the survey
		 * @private
		 * @param {sap.ui.model.Context} oContext The context related to the item
		 * @param {sap.ui.model.Model} oModel The model related to the item
		 * @param {string} sUserId The id of the user 
		 * @returns {boolean} true if user provided any answer, false otherwise
		 */
		var _isThereAnyAnswer = function (oContext, oModel, sUserId) {
			var sFormPath = oContext.getObject().Form.__ref,
				oForm = oModel.getProperty("/" + sFormPath),
				bAnswered = false;
			for (var n = 0; n < oForm.Questions.__list.length; n++) {
				var sQuestionPath = oForm.Questions.__list[n],
					oQuesiton = oModel.getProperty("/" + sQuestionPath);
				var oBindings = oModel.bindList("/" + sQuestionPath + "/Answers", null, null, [new Filter({
					path: "UserId",
					operator: FilterOperator.EQ,
					value1: sUserId
				}), new Filter({
					path: "QuestionId",
					operator: FilterOperator.EQ,
					value1: oQuesiton.Id
				})]);
				if (oBindings.getLength() > 0) {
					bAnswered = true;
					break;
				}
			}
			return bAnswered;
		};

		return {

			/** 
			 * Check where a survey is closed or still open to answer.
			 * @param {string} sValue The value for {i18n>txtOpensAt}
			 * @param {Date} oDateValidFrom The valid from date
			 * @param {Date} oDateValidTo The valid to date
			 * @param {string} sUserId The user id
			 * @returns {string} A translated text that shows state of the tile.
			 */
			formatTileClosed: function (sValue, oDateValidFrom, oDateValidTo, sUserId) {
				var oBundle = this.getModel("i18n").getResourceBundle(),
					sReturnString = "",
					sDateString = oDateValidTo.toLocaleDateString(),
					sDateTimeString = oDateValidTo.toLocaleTimeString(),
					oDateValidFromNew = oDateValidFrom.toLocaleDateString(),
					oDateValidFromTimeString = oDateValidFrom.toLocaleTimeString();
				var date = new Date();
				if (date > oDateValidTo) {
					//closed
					return sReturnString + oBundle.getText("txtClosedAt") + " " + sDateString + ", " + sDateTimeString;
				} else if (oDateValidFrom > date) {
					return sReturnString + oBundle.getText("txtOpensAt") + " " + oDateValidFromNew + ", " + oDateValidFromTimeString;
				} else {
					// is some question of form answered, it couldn't be answered. so set unknown finish date
					if (_isThereAnyAnswer(this.getBindingContext(), this.getModel(), sUserId)) {
						return oBundle.getText("stateUnknown");
					} else {
						return sReturnString + oBundle.getText("txtValidTo") + " " + sDateString + ", " + sDateTimeString;
					}
				}
			},

			/** 
			 * Provides a text that is shown in the footer of the tile.
			 * @param {Date} oDateDoneAt The date of finishing the survey
			 * @param {Date} oDateValidFrom The valid from date of the survey
			 * @param {Date} oDateValidTo The valid to date of the survey
			 * @param {string} sUserId The user id
			 * @returns {string} A translated text that shows status of the tile.
			 */
			formatTileFooter: function (oDateDoneAt, oDateValidFrom, oDateValidTo, sUserId) {
				var oBundle = this.getModel("i18n").getResourceBundle();
				if (oDateDoneAt) {
					return oBundle.getText("statusFinish");
				} else {
					if (_isThereAnyAnswer(this.getBindingContext(), this.getModel(), sUserId)) {
						return oBundle.getText("statusFinish");
					}
				}
				var date = new Date();
				if (date > oDateValidTo) {
					return oBundle.getText("statusInvalid");
				} else if (date < oDateValidFrom) {
					return oBundle.getText("statusNotOpenYet");
				} else {
					return oBundle.getText("statusOpen");
				}
			},

			/** 
			 * Provides a state value for the tile footer.
			 * @param {Date} oDateDoneAt The date of finishing the survey
			 * @param {Date} oDateValidFrom The valid from date of the survey
			 * @param {Date} oDateValidTo The valid to date of the survey
			 * @param {string} sUserId The user id
			 * @returns {string} A state value of sap.ui.core.ValueState.
			 */
			formatTileState: function (oDateDoneAt, oDateValidFrom, oDateValidTo, sUserId) {
				if (oDateDoneAt) {
					return "Good";
				} else {
					if (_isThereAnyAnswer(this.getBindingContext(), this.getModel(), sUserId)) {
						return "Good";
					}
				}
				var date = new Date();
				if (date < oDateValidFrom || date > oDateValidTo) {
					return "Error";
				} else if (date > oDateValidFrom) {
					return "Critical";
				}
				return "";
			}
		};
	}, /*For exporting*/ true); // <-- Enables accessing this module via global name "com.mjzsoft.Survey.model.individualFormatter"