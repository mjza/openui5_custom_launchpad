sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Filter, FilterOperator) {
	"use strict";

	return {

		/**
		 * Returns number of not deleted questions of a form
		 *
		 * @public
		 * @param {array} aSurveys just expanded item passed to have the binding 
		 * @returns {number} number of not deleted questions
		 */
		formSurveyCounter: function (aSurveys) {
			var sPath = this.getBindingContext().getPath() + "/Surveys";
			var oBindings = this.getModel().bindList(sPath, null, null, [new sap.ui.model.Filter({
				path: "Form/Deleted",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: false
			})]);
			return oBindings.getLength();
		}
	};
}, /*For exporting*/ true); // <-- Enables accessing this module via global name "com.mjzsoft.UserSurveys.model.individualFormatter"