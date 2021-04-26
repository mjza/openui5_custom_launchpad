sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"../utils/Utils",
	"../utils/ControlHelper",
	"../control/InfiniteWizard",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/ValueState",
	"sap/ui/core/CustomData",
	"sap/ui/core/Item",
	"sap/m/MessageToast",
	"sap/m/RadioButtonGroup",
	"sap/m/VBox",
	"sap/m/WizardStep"
	// eslint-disable-next-line max-params	
], function (BaseController, formatter, Utils, ControlHelper, InfiniteWizard, History, JSONModel, Filter, FilterOperator,
	ValueState, CustomData, Item, MessageToast, RadioButtonGroup, VBox, WizardStep) {
	"use strict";

	// An object that contains definition of supported controlls
	const _CONTROLLS = {
		_RATINGINDICATOR: "sap.m.RatingIndicator",
		_SWITCH: "sap.m.Switch",
		_RADIOBUTTON: "sap.m.RadioButton",
		_CHECKBOX: "sap.m.CheckBox",
		_INPUT: "sap.m.Input",
		_TEXTAREA: "sap.m.TextArea",
		_SELECT: "sap.m.Select"
	};

	return BaseController.extend("com.mjzsoft.Survey.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this._oDataModel = [];
			this._aFinishedQuestions = [];
			this._initViewModel();
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this._navToWorkList();
			}
		},

		/**
		 * Event handler for Save button at the end of the wizard when user try to save it.
		 * It shows a confirmation dialog and if user presses Yes, then it will save the answers. 
		 * @param {sap.ui.base.Event} oEvent the press event of the Save button in wizard
		 * @public
		 */
		onPressCompleteWizard: function (oEvent) {
			var oBundle = this.getResourceBundle();
			Utils.showDialog(this, oBundle.getText("titleSaveDialog"), ValueState.Warning,
				oBundle.getText("txtDialogAdd"), this._collectWizardData.bind(this), true, oBundle.getText("btnYes"), true,
				oBundle.getText("btnNo"), true);
		},

		/**
		 * Collects answers of the user from Wizard and send the array of all answers for more processing.
		 * @function
		 * @private
		 */
		/* eslint-disable complexity */
		_collectWizardData: function () {
			var aFields = this._getWizardFields(),
				aUserAnswers = [];
			for (var i = 0; i < aFields.length; i++) {
				var currentFieldGroupItem = aFields[i],
					currentCustomDataItem = currentFieldGroupItem.getAggregation("customData");
				for (var j = 0; j < this._oDataModel.length; j++) {
					var sKey = currentCustomDataItem[0].getProperty("value"),
						currentQuestionInLoop = this._oDataModel[j],
						currentControlUI5ClassName = currentFieldGroupItem.getMetadata().getName();
					if (sKey !== currentQuestionInLoop.QuestionId) {
						continue;
					}
					if (currentQuestionInLoop.M) { // Multiple Choice 
						aUserAnswers.push(this._generateOptionObject(currentCustomDataItem[1].getProperty("value"), sKey, true));
						continue;
					}
					// otherwise
					switch (currentControlUI5ClassName) {
					case _CONTROLLS._INPUT:
						currentQuestionInLoop.Answer = currentFieldGroupItem.getProperty("value");
						aUserAnswers.push(currentQuestionInLoop);
						break;
					case _CONTROLLS._TEXTAREA:
						currentQuestionInLoop.Answer = currentFieldGroupItem.getProperty("value");
						aUserAnswers.push(currentQuestionInLoop);
						break;
					case _CONTROLLS._RATINGINDICATOR:
						currentQuestionInLoop.Answer = String(currentFieldGroupItem.getProperty("value"));
						aUserAnswers.push(currentQuestionInLoop);
						break;
					case _CONTROLLS._SWITCH:
						if (currentFieldGroupItem.getProperty("state")) {
							currentQuestionInLoop.Answer = "1";
						} else {
							currentQuestionInLoop.Answer = "0";
						}
						aUserAnswers.push(currentQuestionInLoop);
						break;
					case _CONTROLLS._RADIOBUTTON:
						if (currentFieldGroupItem.getProperty("selected")) {
							currentQuestionInLoop.OptionId = currentCustomDataItem[1].getProperty("value");
							aUserAnswers.push(currentQuestionInLoop);
						}
						break;
					case _CONTROLLS._SELECT:
						if (currentFieldGroupItem.getSelectedItem().getProperty("key")) {
							currentQuestionInLoop.OptionId = parseInt(currentFieldGroupItem.getSelectedItem().getProperty("key"), 10);
							aUserAnswers.push(currentQuestionInLoop);
						}
						break;
					case _CONTROLLS._CHECKBOX:
						if (currentFieldGroupItem.getProperty("selected")) {
							currentQuestionInLoop.OptionId = currentCustomDataItem[1].getProperty("value");
							aUserAnswers.push(currentQuestionInLoop);
						}
						break;
					}
				}
			}
			this._preprocressDataAndSave(aUserAnswers);
		},

		/**
		 * Event handler for changing the color of rating indicators as soon as user change number of stars.
		 * @param {sap.ui.base.Event} oEvent the change event of the rating indicator
		 * @public
		 */
		onLiveChangeRatingIndicator: function (oEvent) {
			this._oWizard.setShowNextButton(true);
		},

		/**
		 * Event handler for when user press on next in the wizard
		 * @function
		 * @public
		 * @param {sap.ui.base.Event} oEvent pattern match event in wizard next button press
		 */
		onCompleteStepInWizard: function (oEvent) {
			var sTitle = oEvent.getSource().getTitle(),
				nextQuestion,
				index = -1,
				currentUI5Class;
			for (var i = 0; i < this._aQuestions.length && index < 0; i++) {
				if (this._aQuestions[i].Question === sTitle) {
					index = i + 1;
					nextQuestion = this._aQuestions[index];
				}
			}
			if (!nextQuestion) {
				return;
			}
			currentUI5Class = nextQuestion.Qtype.Ui5Class;
			if (nextQuestion.Mandatory) {
				if (currentUI5Class === _CONTROLLS._SWITCH || currentUI5Class === _CONTROLLS._RATINGINDICATOR) {
					this._oWizard.setShowNextButton(true);
					return;
				}
				this.checkShowNextButton(currentUI5Class, index);
				return;
			}
			this._oWizard.setShowNextButton(true);
		},

		/**
		 * Checks if the NextButton can be enabled
		 * @function
		 * @public
		 * @param {String} sUI5Class current UI5 class name
		 * @param {Integer} iCurrentndex index for the item
		 */
		checkShowNextButton: function (sUI5Class, iCurrentndex) {
			var oStep = this._oWizard.getSteps()[iCurrentndex],
				oContent = oStep.getAggregation("content")[0],
				aItems = (sUI5Class === _CONTROLLS._RADIOBUTTON) ? oContent.getButtons() : oContent.getItems();
			this._oWizard.setShowNextButton(false);
			for (var i = 0; i < aItems.length; i++) {
				if (this._isControlHavingValue(aItems[i], sUI5Class)) {
					this._oWizard.setShowNextButton(true);
					break;
				}
			}
		},

		/**
		 * Event handler for when user change value in the Input and TextArea
		 * @function
		 * @public
		 * @param {sap.ui.base.Event} oEvent pattern match input live change
		 */
		onLiveChangeInput: function (oEvent) {
			var oSource = oEvent.getSource();
			if (oEvent.getParameters().newValue.length > 2) {
				this._oWizard.setShowNextButton(true);
				oSource.setValueState(ValueState.None);
			} else {
				this._oWizard.setShowNextButton(false);
				oSource.setValueStateText(this.getResourceBundle().getText("txtValueState"));
				oSource.setValueState(ValueState.Error);
			}
		},

		/**
		 * Event handler for when user change selection of some checkboxes
		 * @function
		 * @public
		 * @param {sap.ui.base.Event} oEvent pattern match checkbox selection
		 */
		onSelectCheckBox: function (oEvent) {
			var oParentControl = oEvent.getSource().getParent(),
				aItems;
			if (oParentControl) {
				aItems = oParentControl.getItems();
				for (var i = 0; i < aItems.length; i++) {
					if (aItems[i].getSelected()) {
						this._oWizard.setShowNextButton(true);
						return;
					} else {
						this._oWizard.setShowNextButton(false);
					}
				}
			}
		},

		/**
		 * Event handler for when user change selection of radio buttons
		 * @function
		 * @public
		 * @param {sap.ui.base.Event} oEvent pattern match radio button selection
		 */
		onSelectRadioButton: function (oEvent) {
			var oParentControl = oEvent.getSource().getParent(),
				aItems;
			if (oParentControl) {
				aItems = oParentControl.getButtons();
				for (var i = 0; i < aItems.length; i++) {
					if (aItems[i].getSelected()) {
						this._oWizard.setShowNextButton(true);
						return;
					} else {
						this._oWizard.setShowNextButton(false);
					}
				}
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments"),
				sFormId = oArguments.objectId,
				oModel = this.getModel(),
				sObjectPath;
			this._resetViewModelAndLocalData(oArguments);
			this._destroyWizardFromPreviousSurvey();
			this.startAppBusy();
			oModel.metadataLoaded().then(() => {
				sObjectPath = this.getModel().createKey("SurveySet", {
					Id: this._sUserSurveyID
				});
				this._bindView("/" + sObjectPath);
				this._readQuestionsSet(sFormId);
			});
		},

		/**
		 * Init and bind a view model to the view
		 * @function
		 * @private
		 */
		_initViewModel: function () {
			this._oViewModel = this._initObjectViewModel();
			this.setModel(this._oViewModel, "viewModel");
		},

		/**
		 * Generate a JSON model with initial values for view model 
		 * @function
		 * @private
		 * @return {sap.ui.model.json.JSONModel} The generated JSON model
		 */
		_initObjectViewModel: function () {
			return new JSONModel({
				userName: "",
				submitVisible: true,
				userID: "",
				icon: "",
				titState: ValueState.None,
				isSurveyFinished: false,
				FilteredQuestions: [],
				PossibleAnswers: [],
				UserAnswers: []
			});
		},

		/**
		 * Resets the view model variables as soon as user visits a new survey 
		 * @function
		 * @private
		 * @param {object} oArguments List of all arguments that are passed in the route match.
		 */
		_resetViewModelAndLocalData: function (oArguments) {
			this._oViewModel.setProperty("/isSurveyFinished", oArguments.finished === "1" ? true : false);
			this._oViewModel.setProperty("/userID", oArguments.userID);
			this._oViewModel.setProperty("/FilteredQuestions", []);
			this._oViewModel.setProperty("/PossibleAnswers", []);
			this._oViewModel.setProperty("/UserAnswers", []);
			this._aFinishedQuestions = [];
			this._sUserSurveyID = oArguments.sUserSurveyID;
		},

		/**
		 * Destroys the old wizard if exists
		 * @function
		 * @private
		 */
		_destroyWizardFromPreviousSurvey: function () {
			var aContentVerticalLayout = this.byId("idVerticalLayout").getContent();
			if (aContentVerticalLayout.length > 1) {
				if (aContentVerticalLayout[1].getMetadata().getName() === "sap.m.Wizard") {
					aContentVerticalLayout[1].destroy();
				}
			}
		},

		/**
		 * Collects and returns list of the fields in the wizard
		 * @function
		 * @private
		 * @return {array} collected fields from wizard 
		 */
		_getWizardFields: function () {
			var aReleventFields = ControlHelper.getRelevantFields(sap.ui.getCore().byFieldGroupId("fieldGroupSurvey")),
				aFields = [],
				oControlName;
			for (var i = 0; i < aReleventFields.length; i++) {
				oControlName = aReleventFields[i].getMetadata().getName();
				if (oControlName === _CONTROLLS._CHECKBOX) {
					if (aReleventFields[i].getSelected()) {
						aFields.push(aReleventFields[i]);
					}
				} else {
					aFields.push(aReleventFields[i]);
				}
			}
			return aFields;
		},

		/**
		 * Generates and returns an object for representing Option entery 
		 * @function
		 * @private
		 * @param {string} sOptionId the option id
		 * @param {string} sQuestionId the question id
		 * @param {boolean} bIsCheckBox true if it is multiple choices question or a check-box element 
		 * @return {object} An object that represent OptionSet entery
		 */
		_generateOptionObject: function (sOptionId, sQuestionId, bIsCheckBox) {
			var oAnswerObject = {
				Answer: "",
				OptionId: !sOptionId ? "" : sOptionId,
				QuestionId: sQuestionId,
				M: bIsCheckBox,
				UserId: this._oViewModel.getProperty("/userID")
			};
			return oAnswerObject;
		},

		/**
		 * Loops through the passed data and makes CREATE requests for saving answers 
		 * @function
		 * @private
		 * @param {array} aData List of user answers
		 */
		_preprocressDataAndSave: function (aData) {
			this.startAppBusy();
			var oModel = this.getModel(),
				sGroupId = "mjzsoftadd1" + new Date().getTime(),
				fnCallbackUpdate = function () {
					if (this.iNumberOfDoneRequests === 0) {
						this.stopAppBusy();
						this.getModel().setDeferredGroups(["changes"]);
						this._updateUserSurvey();
					}
				}.bind(this);
			oModel.setUseBatch(true);
			oModel.setDeferredGroups([sGroupId]);
			this.iNumberOfDoneRequests = 0;
			for (var i = 0; i < aData.length; i++) {
				var oAnswerItem = aData[i];
				delete oAnswerItem.M;
				if (oAnswerItem.OptionId === "") {
					delete oAnswerItem.OptionId;
				}
				this.iNumberOfDoneRequests++;
				this._saveAnswerForQuestion(oAnswerItem, sGroupId, fnCallbackUpdate);
			}
			oModel.submitChanges({
				groupId: sGroupId
			});
		},

		/**
		 * Receives an Answer data and try to save that in back-end 
		 * @function
		 * @private
		 * @param {object} oEntry AnswerSet object
		 * @param {string} sGroupId the groupId of the batch request
		 * @param {function} fnCallback the callback function
		 */
		_saveAnswerForQuestion: function (oEntry, sGroupId, fnCallback) {
			var oDataModel = this.getModel();
			oDataModel.create("/AnswerSet", oEntry, {
				groupId: sGroupId,
				success: (oData, oResponse) => {
					this.iNumberOfDoneRequests--;
					if (typeof fnCallback === "function") {
						fnCallback(oData, oResponse);
					}
				},
				error: (oError) => {
					this.iNumberOfDoneRequests--;
					if (typeof fnCallback === "function") {
						fnCallback(oError);
					}
				}
			});
		},

		/**
		 * Update the entry in the SurveySet that tells when the survey has been finished.  
		 * @function
		 * @private
		 */
		_updateUserSurvey: function () {
			this.startAppBusy();
			var oParams = {
					DoneAt: new Date()
				},
				oModel = this.getModel(),
				sPath = "/" + oModel.createKey("SurveySet", {
					Id: this._sUserSurveyID
				});
			oModel.setDeferredGroups(["changes"]);
			oModel.update(sPath, oParams, {
				success: () => {
					this._oWizard.destroy();
					MessageToast.show(this.getResourceBundle().getText("Success"));
					this._navToWorkList();
				},
				error: (oError) => {
					this._oWizard.destroy();
					this._navToWorkList();
				}
			});
		},

		/**
		 * Reads list of questions related to the passed FormId  
		 * @function
		 * @private
		 * @param {string} sFormId id of the intended form 
		 */
		_readQuestionsSet: function (sFormId) {
			var sEntitySet = "/QuestionSet",
				oParams = {
					"$expand": "Qtype,Form,Form/Icon"
				},
				aFilter = [new Filter({
					filters: [
						new Filter("Deleted", FilterOperator.EQ, "false"),
						new Filter("FormId", FilterOperator.EQ, parseInt(sFormId, 10))
					],
					and: true
				})];
			Utils.readData(this.getModel(), sEntitySet, oParams, aFilter).then(oData => {
					var aResult = oData.results;
					this._oViewModel.setProperty("/icon", aResult.length ? aResult[0].Form.Icon.Source : "sap-icon://survey");
					this._oViewModel.setProperty("/FilteredQuestions", aResult);
					var aQuestionIds = [];
					for (var i = 0; i < aResult.length; i++) {
						aQuestionIds.push(aResult[i].Id);
					}
					this._getPossibleAnswerSet(aQuestionIds);
				})
				.fail(() => {
					this.stopAppBusy();
					return;
				});
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			this.getView().bindElement({
				path: sObjectPath,
				parameters: {
					expand: "Form, User"
				},
				events: {
					dataRequested: () => {
						this.startAppBusy();
					},
					dataReceived: () => {
						this.stopAppBusy();
					}
				}
			});
		},

		/**
		 * Gets list of questions' Ids, and collect possible answers from OptionSet and then:
		 * If the Survey is finished, will collect the answers also and show the result for review.
		 * If the survey has not yet been done, then generate a form-wizard for the user.
		 * @function
		 * @private
		 * @param {array} aQuestionIds an array of questions' ids.
		 */
		_getPossibleAnswerSet: function (aQuestionIds) {
			if (!aQuestionIds || aQuestionIds.length === 0) {
				return;
			}
			var aQuestionsFilter = [];
			for (var i = 0; i < aQuestionIds.length; i++) {
				aQuestionsFilter.push(new Filter("QuestionId", FilterOperator.EQ, aQuestionIds[i]));
			}
			var aFilters = [new Filter({
					filters: [
						new Filter("Deleted", FilterOperator.EQ, "false"),
						new Filter({
							filters: aQuestionsFilter,
							and: false
						})
					],
					and: true
				})],
				oModel = this.getModel();
			Utils.readData(oModel, "/OptionSet", {}, aFilters).then(oData => {
				this.byId("idContainer").removeAllItems();
				if (this._oWizard) {
					this._oWizard.destroy();
				}
				this._oViewModel.setProperty("/PossibleAnswers", oData.results);
				if (this._oViewModel.getProperty("/isSurveyFinished")) {
					this._getAnswerSetForUser(aQuestionIds);
				} else {
					this._buildWizardForOpenSurvey();
				}
			});
		},

		/**
		 * Generates a wizard with questions for a not finished survey
		 * @function
		 * @private
		 */
		_buildWizardForOpenSurvey: function () {
			var oVerticalLayout = this.byId("idVerticalLayout");
			this._oWizard = new InfiniteWizard({
				finishButtonText: this.getResourceBundle().getText("btnSave"),
				complete: this.onPressCompleteWizard.bind(this)
			});
			oVerticalLayout.addContent(this._oWizard);
			this._buildWizardStepsForOpenQuestions();
		},

		/**
		 * Gets list of questions' Ids, and collect the user's answers and show the result for review.
		 * @function
		 * @private
		 * @param {array} aQuestionIds an array of questions' ids.
		 */
		_getAnswerSetForUser: function (aQuestionIds) {
			if (!aQuestionIds || aQuestionIds.length === 0) {
				return;
			}
			var aQuestionsFilter = [];
			for (var i = 0; i < aQuestionIds.length; i++) {
				aQuestionsFilter.push(new Filter("QuestionId", FilterOperator.EQ, aQuestionIds[i]));
			}
			var sEntitySet = "/AnswerSet",
				oModel = this.getModel(),
				aFilters = [new Filter({
					filters: [
						new Filter("UserId", FilterOperator.EQ, this._oViewModel.getProperty("/userID")),
						new Filter({
							filters: aQuestionsFilter,
							and: false
						})
					],
					and: true
				})],
				oParams = {
					"$expand": "User, Option, Question, Question/Qtype"
				};
			this.startAppBusy();
			Utils.readData(oModel, sEntitySet, oParams, aFilters).then(oData => {
					this._oViewModel.setProperty("/UserAnswers", oData.results);
					this._buildFormForFinishedSurveys();
				})
				.fail(() => {
					this.stopAppBusy();
				});
		},

		/**
		 * Build a form for reviwing the answers when the survey is finished. 
		 * @function
		 * @private
		 */
		_buildFormForFinishedSurveys: function () {
			var oContainer = this.byId("idContainer"),
				aQuestions = this._oViewModel.getProperty("/FilteredQuestions"),
				aQuestionsSorted = ControlHelper.sortDataStructure(aQuestions),
				aUserAnswers = this._oViewModel.getProperty("/UserAnswers");
			for (var i = 0; i < aQuestionsSorted.length; i++) {
				var currentUI5ClassName = aQuestionsSorted[i].Qtype.Ui5Class,
					isCurrentQuestionMandatory = aQuestionsSorted[i].Mandatory,
					aFields = [],
					iSelectedIndex = -1,
					aAnswers = this._extractAnswersForQuestion(aQuestionsSorted[i], aUserAnswers),
					aSubItems = this._extractMatchingOptionsWithQuestion(aQuestionsSorted[i].Id),
					aSubItemsSorted = ControlHelper.sortDataStructure(aSubItems);
				for (var j = 0; j < aSubItemsSorted.length; j++) {
					var currentOptionItem = aSubItemsSorted[j],
						bSelected = this._isOptionSelected(aAnswers, currentOptionItem.Id),
						oItem;
					if (currentUI5ClassName === _CONTROLLS._CHECKBOX) {
						oItem = this._generateNewCheckBoxControl(currentOptionItem.Answer, bSelected, false);
						aFields.push(oItem);
					}
					if (currentUI5ClassName === _CONTROLLS._RADIOBUTTON) {
						oItem = this._generateNewRadioButtonControl(currentOptionItem.Answer, bSelected, false);
						aFields.push(oItem);
					}
					if (currentUI5ClassName === _CONTROLLS._RADIOBUTTON && j === aSubItemsSorted.length - 1) {
						for (var k = 0; iSelectedIndex < 0 && k < aFields.length; k++) {
							if (aFields[k].sID === oItem.sID && aFields[k].getSelected()) { //eslint-disable-line max-depth
								iSelectedIndex = k;
							}
						}
					}
				}

				//When no Options exists for the question 
				if (aFields.length === 0) {
					var oItemsforControl = [],
						sSelectedKey;
					for (j = 0; j < aSubItemsSorted.length; j++) {
						for (k = 0; k < aAnswers.length; k++) {
							if (aAnswers[k].OptionId === aSubItemsSorted[j].Id) { //eslint-disable-line max-depth
								sSelectedKey = aSubItemsSorted[j].Id;
								break;
							}
						}
						oItemsforControl.push(new Item({
							key: aSubItemsSorted[j].Id,
							text: aSubItemsSorted[j].Answer
						}));
					}
					if (currentUI5ClassName === _CONTROLLS._SELECT) {
						// If it is a Select control (Actually a drop-down)
						aFields.push(this._generateNewSelectForFinishedSurvey(sSelectedKey, oItemsforControl));
					} else { // handle any other Control like Input, TextArea
						var oAnswer;
						if (aAnswers.length === 1) {
							oAnswer = aAnswers[0].Answer;
						}
						var oParameter = ControlHelper.generateParametersForControl(currentUI5ClassName, oAnswer, false, this);
						var oControl = ControlHelper.generateNewControl(currentUI5ClassName, oParameter, undefined, undefined,
							isCurrentQuestionMandatory);
						aFields.push(oControl);
					}
				}
				var oBox;
				if (currentUI5ClassName === _CONTROLLS._RADIOBUTTON) {
					oBox = this._generateNewRadioButtonGroup(aFields, iSelectedIndex);
				} else {
					oBox = this._generateNewVBox(aFields);
				}
				oBox.addStyleClass("sapUiLargeMarginBegin");
				oContainer.addItem(ControlHelper.generateNewPanel(i + 1, aQuestionsSorted[i].Question, [oBox]));
			}
			this.stopAppBusy();
		},

		/**
		 * Extract those answers that are related to a passed question
		 * @function
		 * @private
		 * @param {object} oQuestion the intended question
		 * @param {array} aAnswers List of users answers
		 * @return {array} selected answers
		 */
		_extractAnswersForQuestion: function (oQuestion, aAnswers) {
			var aAnswersRelatedToQuestion = [];
			for (var i = 0; i < aAnswers.length; i++) {
				if (aAnswers[i].QuestionId === oQuestion.Id) {
					aAnswersRelatedToQuestion.push(aAnswers[i]);
				}
			}
			return aAnswersRelatedToQuestion;
		},

		/**
		 * Extract those possible answers (options) that are related to a passed question id
		 * @function
		 * @private
		 * @param {integer} iId the id of the question
		 * @return {array} selected options
		 */
		_extractMatchingOptionsWithQuestion: function (iId) {
			var possibleAnswers = this._oViewModel.getProperty("/PossibleAnswers"),
				aMatchedAnswersWithQuestions = [];
			for (var i = 0; i < possibleAnswers.length; i++) {
				if (possibleAnswers[i].QuestionId === iId) {
					aMatchedAnswersWithQuestions.push(possibleAnswers[i]);
				}
			}
			return aMatchedAnswersWithQuestions;
		},

		/**
		 * If the option is selected then it returns true, otherwise false
		 * @function
		 * @private
		 * @param {array} aAnswers List of user's answers
		 * @param {array} sOptionId id of the intended option
		 * @return {boolean} if it is selected or not
		 */
		_isOptionSelected: function (aAnswers, sOptionId) {
			for (var i = 0; i < aAnswers.length; i++) {
				if (aAnswers[i].OptionId === sOptionId) {
					return true;
				}
			}
			return false;
		},

		/**
		 * Build the wizard steps for questions of the selected survey
		 * @function
		 * @private
		 */
		_buildWizardStepsForOpenQuestions: function () { // eslint-disable-line max-statements
			var aPossibleAnswersForQuestion = [],
				possibleAnswers = this._oViewModel.getProperty("/PossibleAnswers"),
				aQuestions = this._oViewModel.getProperty("/FilteredQuestions"),
				aQuestionsSorted = ControlHelper.sortDataStructure(aQuestions);
			this._oDataModel = [];
			this._aQuestions = aQuestionsSorted;
			for (var i = 0; i < aQuestionsSorted.length; i++) {
				aPossibleAnswersForQuestion = [];
				var currentQuestion = aQuestionsSorted[i],
					bCurrentQurestionMandatory = currentQuestion.Mandatory,
					currentQuestionId = currentQuestion.Id,
					currentUI5ClassName = currentQuestion.Qtype.Ui5Class,
					sRexForValidation = currentQuestion.Regex,
					aMatchedAnswersWithQuestions = this._extractMatchingOptionsWithQuestion(currentQuestionId),
					iSelectedIndex = -1,
					aSubItemsSorted = ControlHelper.sortDataStructure(aMatchedAnswersWithQuestions);
				// Managing of related child items for a question
				for (var j = 0; j < aSubItemsSorted.length; j++) {
					var isCurrentDefaultAnswer = aSubItemsSorted[j].DefaultAnswer ? true : false,
						currentAnswerForItem = aSubItemsSorted[j].Answer,
						oItem;
					if (currentUI5ClassName === _CONTROLLS._CHECKBOX) {
						oItem = this._generateNewCheckBoxControl(currentAnswerForItem, isCurrentDefaultAnswer, true);
						this._addCustomDataForControl(oItem, currentQuestionId, "ID");
						this._addCustomDataForControl(oItem, aSubItemsSorted[j].Id, "subItems");
						aPossibleAnswersForQuestion.push(oItem);
						if (bCurrentQurestionMandatory) {
							oItem.attachSelect(this.onSelectCheckBox.bind(this));
						}
					}
					if (currentUI5ClassName === _CONTROLLS._RADIOBUTTON) {
						oItem = this._generateNewRadioButtonControl(currentAnswerForItem, isCurrentDefaultAnswer, true);
						this._addCustomDataForControl(oItem, currentQuestionId, "ID");
						this._addCustomDataForControl(oItem, aSubItemsSorted[j].Id, "subItems");
						aPossibleAnswersForQuestion.push(oItem);
						if (bCurrentQurestionMandatory) {
							oItem.attachSelect(this.onSelectRadioButton.bind(this));
						}
						for (var k = 0; isCurrentDefaultAnswer && k < aPossibleAnswersForQuestion.length && iSelectedIndex < 0; k++) {
							iSelectedIndex = (aPossibleAnswersForQuestion[k].sID === oItem.sID) ? k : -1;
						}
					}
				}
				// no subFields for a question
				if (aPossibleAnswersForQuestion.length === 0) {
					var aItemsForDropDown = [],
						aItemsForDropDownSorted = [],
						oItemsforControl = [],
						sSelectedKey;
					for (j = 0; j < possibleAnswers.length; j++) {
						if (possibleAnswers[j].QuestionId === currentQuestionId) {
							aItemsForDropDown.push(possibleAnswers[j]);
						}
					}
					aItemsForDropDownSorted = ControlHelper.sortDataStructure(aItemsForDropDown);
					for (j = 0; j < aItemsForDropDownSorted.length; j++) {
						if (aItemsForDropDownSorted[j].DefaultAnswer) {
							sSelectedKey = aItemsForDropDownSorted[j].Id;
						}
						oItemsforControl.push(new Item({
							key: aItemsForDropDownSorted[j].Id,
							text: aItemsForDropDownSorted[j].Answer
						}));
					}
					if (currentUI5ClassName === _CONTROLLS._SELECT) {
						this._addCustomDataForControl(this._generateNewSelectControl(sSelectedKey, oItemsforControl), currentQuestionId, "ID");
						aPossibleAnswersForQuestion.push(this._generateNewSelectControl(sSelectedKey, oItemsforControl));
					} else {
						// manage any other Control like Input, TextArea
						var oParameter = ControlHelper.generateParametersForControl(currentUI5ClassName, undefined, true, this),
							oControl = ControlHelper.generateNewControl(currentUI5ClassName, oParameter, sRexForValidation, this._oWizard, currentQuestion.Mandatory);
						if (bCurrentQurestionMandatory) {
							this._manageMandatoryForControl(oControl, currentUI5ClassName);
						}
						this._addCustomDataForControl(oControl, currentQuestionId, "ID");
						aPossibleAnswersForQuestion.push(oControl);
					}
				}
				var oBox;
				if (currentUI5ClassName === _CONTROLLS._RADIOBUTTON) {
					if (!bCurrentQurestionMandatory) {
						aPossibleAnswersForQuestion.push(this._generateNewRadioButtonControl(this.getResourceBundle().getText("btnRadioNone"), false,
							true));
					}
					oBox = this._generateNewRadioButtonGroup(aPossibleAnswersForQuestion, iSelectedIndex);
				} else {
					oBox = this._generateNewVBox(aPossibleAnswersForQuestion);
				}
				this._oWizard.addStep(this._generateNewWizardStep(oBox, currentQuestion.Question));
				this._oDataModel.push(this._generateOptionObject(null, currentQuestionId, (currentUI5ClassName === _CONTROLLS._CHECKBOX)));
			}
			//check's if the first question possible to skip
			if (aQuestionsSorted.length > 0 && aQuestionsSorted[0].Mandatory) {
				var sClassOfFirstItem = aQuestionsSorted[0].Qtype.Ui5Class;
				if (sClassOfFirstItem === _CONTROLLS._RATINGINDICATOR || sClassOfFirstItem === _CONTROLLS._SWITCH) {
					this._oWizard.setShowNextButton(true);
				} else if (sClassOfFirstItem === _CONTROLLS._RADIOBUTTON) {
					this._getStepContentAndChecksStatus(true, sClassOfFirstItem);
				} else {
					this._getStepContentAndChecksStatus(false, sClassOfFirstItem);
				}
			}
			this.stopAppBusy();
		},

		/**
		 * Checks if the next button for the wizard can be enabled
		 * @function
		 * @private
		 * @param {boolean} bButtons isButtons 
		 * @param {String} sClassOfFirstItem name of class
		 */
		_getStepContentAndChecksStatus: function (bButtons, sClassOfFirstItem) {
			this._oWizard.setShowNextButton(false);
			var oStep0 = this._oWizard.getSteps()[0],
				oContent = oStep0.getAggregation("content")[0],
				aItems = bButtons ? oContent.getButtons() : oContent.getItems();
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i] && this._isControlHavingValue(aItems[i], sClassOfFirstItem)) {
					this._oWizard.setShowNextButton(true);
					break;
				}
			}
		},

		/**
		 * Checks if the Control has a value
		 * @function
		 * @private
		 * @param {sap.ui.base.Control} oControl a UI5 control
		 * @param {string} sUI5Class The class of the control
		 * @return {boolean} true if there is a value
		 */
		_isControlHavingValue: function (oControl, sUI5Class) {
			switch (sUI5Class) {
			case _CONTROLLS._RATINGINDICATOR:
			case _CONTROLLS._INPUT:
			case _CONTROLLS._TEXTAREA:
				return oControl.getValue() ? true : false;
			case _CONTROLLS._RADIOBUTTON:
			case _CONTROLLS._CHECKBOX:
				return oControl.getSelected() ? true : false;
			case _CONTROLLS._SELECT:
				return oControl.getEnabled() ? true : false;
			case _CONTROLLS._SWITCH:
				return true;
			}
			return false;
		},

		/**
		 * Do the steps for mandatory questions
		 * @function
		 * @private
		 * @param {sap.ui.base.Control} oControl a UI5 control
		 * @param {string} sUI5Class The class of the control
		 */
		_manageMandatoryForControl: function (oControl, sUI5Class) {
			if (sUI5Class === _CONTROLLS._TEXTAREA || sUI5Class === _CONTROLLS._INPUT) {
				oControl.attachLiveChange(this.onLiveChangeInput.bind(this));
			} else if (sUI5Class === _CONTROLLS._RATINGINDICATOR) {
				this._oWizard.setShowNextButton(true);
			}
		},

		/**
		 * Generates and return a Radio Button Group control
		 * @function
		 * @private
		 * @param {array} aPossibleAnswersForQuestion list of items
		 * @param {integer} iSelectedIndex id of the selected by default item
		 * @return {sap.ui.base.Control} generated control
		 */
		_generateNewRadioButtonGroup: function (aPossibleAnswersForQuestion, iSelectedIndex) {
			return new RadioButtonGroup({
				buttons: aPossibleAnswersForQuestion,
				selectedIndex: iSelectedIndex
			});
		},

		/**
		 * Generates and return a new VBox control
		 * @function
		 * @private
		 * @param {array} aItems some controlls to push in the content
		 * @return {sap.ui.base.Control} generated control
		 */
		_generateNewVBox: function (aItems) {
			return new VBox({
				items: aItems
			});
		},

		/**
		 * Generates and return a new WizardStep control
		 * @function
		 * @private
		 * @param {sap.ui.base.Control} oBox the generated VBox as content
		 * @param {string} sTitle title of the wizardstep 
		 * @return {sap.ui.base.Control} generated control
		 */
		_generateNewWizardStep: function (oBox, sTitle) {
			return new WizardStep({
				content: [oBox],
				title: sTitle,
				complete: this.onCompleteStepInWizard.bind(this)
			});
		},

		/**
		 * Generates and return a new checkbox control
		 * @function
		 * @private
		 * @param {string} sText The text of the control
		 * @param {boolean} bSelected true if it is selected by default
		 * @param {boolean} bEdiatble true if it is ediatble or not
		 * @return {sap.ui.base.Control} generated control
		 */
		_generateNewCheckBoxControl: function (sText, bSelected, bEdiatble) {
			return ControlHelper.generateNewControl(_CONTROLLS._CHECKBOX, {
				text: sText,
				editable: bEdiatble,
				selected: bSelected,
				fieldGroupIds: bEdiatble ? "fieldGroupSurvey" : ""
			}, undefined, undefined, false);
		},

		/**
		 * Generates and return a new radio button control
		 * @function
		 * @private
		 * @param {string} sText The text of the control
		 * @param {boolean} bSelected true if it is selected by default
		 * @param {boolean} bEdiatble true if it is editable
		 * @return {sap.ui.base.Control} generated control
		 */
		_generateNewRadioButtonControl: function (sText, bSelected, bEdiatble) {
			return ControlHelper.generateNewControl(_CONTROLLS._RADIOBUTTON, {
				text: sText,
				editable: bEdiatble,
				selected: bSelected,
				fieldGroupIds: bEdiatble ? "fieldGroupSurvey" : ""
			}, undefined, undefined, false);
		},

		/**
		 * Generates and return a new select control
		 * @function
		 * @private
		 * @param {string} sSelectedKey The key of the selected item
		 * @param {array} aItemsforControl list of items for the select
		 * @return {sap.ui.base.Control} generated control
		 */
		_generateNewSelectControl: function (sSelectedKey, aItemsforControl) {
			return ControlHelper.generateNewControl(_CONTROLLS._SELECT, {
				selectedKey: sSelectedKey,
				editable: true,
				items: aItemsforControl,
				fieldGroupIds: "fieldGroupSurvey"
			}, undefined, undefined, false);
		},

		/**
		 * Generates and return a new select control that is not editable
		 * @function
		 * @private
		 * @param {string} sSelectedKey The key of the selected item
		 * @param {array} aItemsforControl list of items
		 * @return {sap.ui.base.Control} generated control
		 */
		_generateNewSelectForFinishedSurvey: function (sSelectedKey, aItemsforControl) {
			return ControlHelper.generateNewControl(_CONTROLLS._SELECT, {
				selectedKey: sSelectedKey,
				editable: false,
				items: aItemsforControl
			}, undefined, undefined, false);
		},

		/**
		 * Assign a new custom data to the control 
		 * @function
		 * @private
		 * @param {sap.ui.base.Control} oControl intended control
		 * @param {string} sValue The value of the data
		 * @param {string} sKey The key of the data
		 */
		_addCustomDataForControl: function (oControl, sValue, sKey) {
			oControl.addCustomData(new CustomData({
				key: sKey,
				value: sValue
			}));
		},

		/**
		 * Navigating back to the worklist page. 
		 * @function
		 * @private
		 */
		_navToWorkList: function () {
			this.getRouter().navTo("worklist", {}, true);
		}
	});
});