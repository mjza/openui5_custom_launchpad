sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"../utils/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"../model/individualFormatter" /*It is needed, otherwise in the xml view it is not accessible*/
], function (BaseController, formatter, Utils, JSONModel, Filter, FilterOperator, MessageToast) {

	"use strict";

	return BaseController.extend("com.mjzsoft.Survey.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this._initViewModel();
			this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when a tile gets pressed
		 * @param {sap.ui.base.Event} oEvent the tile press event
		 * @public
		 */
		onPress: function (oEvent) {
			var oObject = oEvent.getSource().getBindingContext().getObject(),
				sFormID = oObject.FormId,
				oSource = oEvent.getSource(),
				oFilter = new Filter("FormId", FilterOperator.EQ, sFormID);
			if (oEvent.getSource().getTileContent()[0].getFooterColor() === "Error") {
				MessageToast.show(this.getResourceBundle().getText("MsgInvalid"));
				return;
			}
			this.startAppBusy();
			this._readQuestionsForUsers(oFilter, oSource);
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
		onNavBack: function () {
			// eslint-disable-next-line sap-no-history-manipulation
			//remove ADD.View from history
			history.go(-1); // eslint-disable-line
		},

		onFormsRequested: function () {
			this.startAppBusy();
		},

		onFormsReceived: function (oEvent) {
			var oODataListBinding = oEvent.getSource(),
				oFilterInfo = oODataListBinding.getFilterInfo();
			if (oFilterInfo.type === "Logical") { // Does not apply to the first filter that has UserId = 0!
				this.stopAppBusy();
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Handler for OnObjectMatched event for this view 
		 * @param {sap.ui.base.Event} oEvent the route match event
		 * @function
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			this._readUserSurveySet();
		},

		/**
		 * Init and bind a view model to the view
		 * @function
		 * @private
		 */
		_initViewModel: function () {
			this._oViewModel = this._initWorklistViewModel();
			this.setModel(this._oViewModel, "viewModel");
		},

		/**
		 * Generate a JSON model with initial values for view model 
		 * @function
		 * @private
		 * @return {sap.ui.model.json.JSONModel} The generated JSON model
		 */
		_initWorklistViewModel: function () {
			return new JSONModel({
				dialogBusy: true,
				flexBoxVisible: false,
				imageUrl: "",
				UserName: ""
			});
		},

		/**
		 * Check if the survey does have any question or not! 
		 * Shows a message if no question exist, navigate to object page if has some questions
		 * @function
		 * @private
		 * @param {sap.ui.model.Filter} oFilter the filtering based on user
		 * @param {sap.ui.base.Control} oSource the pressed tile 
		 */
		_readQuestionsForUsers: function (oFilter, oSource) {
			Utils.readData(this.getModel(), "/QuestionSet", {}, [oFilter]).then(oData => {
					if (oData.results.length < 1) {
						// there are no questions for this survey
						var oBundle = this.getResourceBundle();
						MessageToast.show(oBundle.getText("msgNoQuestions"));
						this.stopAppBusy();
					} else {
						this._navigateToObjectFromWorklist(oSource);
					}
				})
				.fail(() => {
					this.stopAppBusy();
				});
		},

		/**
		 * Navigates to the object page to show the form
		 * @function
		 * @private
		 * @param {sap.ui.base.Control} oItem the pressed tile 
		 */
		_navigateToObjectFromWorklist: function (oItem) {
			var sFooterText = oItem.getTileContent()[0].getFooter(),
				oBindingContext = oItem.getBindingContext(),
				sFormId = oBindingContext.getProperty("FormId"),
				sUserId = oBindingContext.getProperty("UserId"),
				sUserSurveyId = oBindingContext.getProperty("Id"),
				bFinished = 0;
			// checks if the surveyis done
			if (this.getResourceBundle().getText("statusFinish") === sFooterText) {
				bFinished = 1;
			}
			this.getRouter().navTo("object", {
				objectId: sFormId,
				finished: bFinished,
				userID: sUserId,
				sUserSurveyID: sUserSurveyId
			});
		},

		/**
		 * Shows the survey that are related to the current user
		 * @function
		 * @private
		 * @param {string} sUserId the Id of the user 
		 */
		_filterFlexBoxes: function (sUserId) {
			var aFilter = [new Filter({
				filters: [
					new Filter("UserId", FilterOperator.EQ, sUserId),
					new Filter("Form/Deleted", FilterOperator.EQ, false)
				],
				and: true
			})];
			this.byId("flexBox").getBinding("items").filter(aFilter, "Application");
		},

		/**
		 * Shows the user name and its tiles, as soon as data are ready. 
		 * @function
		 * @private
		 */
		_updateView: function () {
			var oUser = this.getOwnerComponent().getCurrentUser();
			this._oViewModel.setProperty("/UserName", oUser.firstName + " " + oUser.lastName);
			this._oViewModel.setProperty("/flexBoxVisible", true);
			this._filterFlexBoxes(oUser.id);
		},

		/**
		 * Reads list of the survey of the current user and passes them to 
		 * _readFormSet function to assign all the public surveys that are missing 
		 * and not yet assigned to the user
		 * @function
		 * @private
		 */
		_readUserSurveySet: function () {
			var oModel = this.getModel(),
				oUser = this.getOwnerComponent().getCurrentUser(),
				sEntitySet = "/SurveySet",
				oParams = {
					"$expand": "Form, User"
				},
				aFilter = new Filter({
					filters: [
						new Filter("UserId", FilterOperator.EQ, oUser.id),
						new Filter("Form/Deleted", FilterOperator.EQ, false)
					],
					and: true
				});
			this.startAppBusy();
			Utils.readData(oModel, sEntitySet, oParams, [aFilter]).then(oData => {
					var aSurveys = oData.results;
					// Pass the list of surveys, to assign the missing public surveys
					this._readFormSet(aSurveys);
				})
				.fail(() => {
					this.stopAppBusy();
				});
		},

		/**
		 * Reads list of all public forms and makes a create  
		 * request to assign thoes that have not yet assigned to the user
		 * @function
		 * @private
		 * @param {array} aSurveys list of already assigned survey to the user
		 */
		_readFormSet: function (aSurveys) {
			var oModel = this.getModel(),
				sEntitySet = "/FormSet",
				aFilter = new Filter({
					filters: [
						new Filter("Universal", FilterOperator.EQ, true),
						new Filter("Deleted", FilterOperator.EQ, false)
					],
					and: true
				});
			this.iNumberOfDoneRequests = 0;
			Utils.readData(oModel, sEntitySet, {}, [aFilter]).then(oData => {
					this._createPropertiesForSurvey(oData.results, aSurveys);
				})
				.fail(() => {
					this.stopAppBusy();
				});
		},

		/**
		 * Gets list of all public forms and all assigned user surveys and create  
		 * request to assign thoes that have not yet assigned to the user
		 * @function
		 * @private
		 * @param {array} aForms list of already public forms
		 * @param {array} aSurveys list of already assigned survey to the user
		 */
		_createPropertiesForSurvey: function (aForms, aSurveys) {
			var oComponent = this.getOwnerComponent(),
				oUser = oComponent.getCurrentUser(),
				sGroupId = "mjzsoftadd1" + new Date().getTime(),
				oProperties;
			for (var i = 0; i < aForms.length; i++) {
				var currentItem = aForms[i],
					validTo = currentItem.ValidTo,
					today = new Date(),
					bValid = true;
				for (var b = 0; b < aSurveys.length; b++) {
					if (currentItem.Id === aSurveys[b].Form.Id) {
						bValid = false;
						break;
					}
				}
				if (today > validTo) {
					bValid = false;
				}
				if (bValid) {
					oProperties = {
						"FormId": currentItem.Id,
						"UserId": "" + oUser.id
					};
					this.iNumberOfDoneRequests++;
					this._createRequestForAssigningMissingSuervey(oProperties, sGroupId);
				}
			}
			if (this.iNumberOfDoneRequests === 0) {
				this._updateView();
			}
		},

		/**
		 * Create a CREATE request for assigning the missing survey to the user.
		 * @function
		 * @private
		 * @param {object} oEntry the propertise for sending create request to SurveySet
		 * @param {string} sGroupId group Id for batch request
		 */
		_createRequestForAssigningMissingSuervey: function (oEntry, sGroupId) {
			var oDataModel = this.getModel();
			oDataModel.create("/SurveySet", oEntry, {
				groupId: sGroupId,
				success: (oData, oResponse) => {
					this.iNumberOfDoneRequests--;
					if (this.iNumberOfDoneRequests === 0) {
						this._updateView();
					}
				},
				error: (oError) => {
					this.iNumberOfDoneRequests--;
					this.stopAppBusy();
				}
			});
		}
	});
});