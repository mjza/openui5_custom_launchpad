sap.ui.define([
	"./BaseController",
	"../utils/Utils",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, Utils, JSONModel, formatter, Filter, FilterOperator, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("com.mjzsoft.UserSurveys.controller.Detail", {

		formatter: formatter,

		aGroups: [
			"newEntry"
		],

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/** 
		 * called when detail view is instantiated
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				fullscreen: false
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		/** 
		 * lifecycle method after view is rendered
		 */
		onAfterRendering: function () {
			var aDeferredGroups = this.getModel().getDeferredGroups().concat(this.aGroups);
			this.getModel().setDeferredGroups(aDeferredGroups);
		},

		/** 
		 * gets the dialog for select surveys
		 * @returns {sap.ui.core.Control} control for dialog
		 */
		getSurveySelectorDialog: function () {
			return sap.ui.xmlfragment("com.mjzsoft.UserSurveys.view.DialogSurveySelector", this);
		},

		/** 
		 * button event to add new survey
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onPressAdd: function (oEvent) {
			if (!this._SurveySelectorDialog) {
				this._SurveySelectorDialog = this.getSurveySelectorDialog();
				this.getView().addDependent(this._SurveySelectorDialog);
			}

			this._SurveySelectorDialog.setModel(this.getModel());
			this._SurveySelectorDialog.open();

			var oFilter = this._buildFilterForForms();

			//apply filter on dialog
			this._SurveySelectorDialog.getBinding("items").filter(oFilter);
		},

		/** 
		 * 'confirm' event by select of one survey in dialog to add to user surveys
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		handleCloseDialog: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			// read path of selected icon
			var sFormId = aContexts.map(function (oContext) {
				return oContext.getObject().Id;
			}).join(", ");

			var oUser = oEvent.getSource().getBindingContext().getObject();

			var oProperties = {
				UserId: oUser.Id,
				FormId: parseInt(sFormId, 10)
			};

			var oEntry = this.getBatchObject(oProperties, "Survey");

			var oDataModel = this.getModel();
			oDataModel.create("/SurveySet", oEntry, {
				groupId: "newEntry",
				success: function () {
					this.getModel().refresh(true);
				}.bind(this)
			});

			oDataModel.submitChanges({
				groupId: "newEntry"
			});
		},

		/** 
		 * button event to remove selected surveys from current user
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onPressDelete: function (oEvent) {
			var oTable = this.getView().byId("idDetailTableLocationSet");

			if (oTable.getSelectedItems().length === 0) {
				return;
			}

			var oBundle = this.getResourceBundle();
			Utils.showDialog(this, oBundle.getText("qRemoveSurveyTitle"), oBundle.getText("qRemoveSurvey"), this.onDelete.bind(this),
				true);
		},

		/** 
		 * confirmed action to delete surveys
		 */
		onDelete: function () {
			var oTable = this.getView().byId("idDetailTableLocationSet"),
				aSelected = oTable.getSelectedItems();

			var sGroupId = "mjzsoftoption" + new Date().getTime();
			this.iNumberOfDoneRequests = aSelected.length;
			var _fnCallback = function () {
				if (this.iNumberOfDoneRequests === 0) {
					this.getModel().refresh(true);
				}
			}.bind(this);

			var aDeferredGroups = this.getModel().getDeferredGroups().concat([sGroupId]);
			this.getModel().setDeferredGroups(aDeferredGroups);

			var sUserId = this.getView().getBindingContext().getObject().Id;

			// check count of answers
			var aAnsweredSurveys = [];
			for (var i = 0; i < aSelected.length; i++) {
				var oDataModel = this.getView().getModel();
				var sFormPath = aSelected[i].getBindingContext().getObject().Form.__ref;
				var oForm = oDataModel.getProperty("/" + sFormPath);

				var bAnswered = false;

				for (var n = 0; n < oForm.Questions.__list.length; n++) {
					var sQuestionPath = oForm.Questions.__list[n];

					var oQuesiton = oDataModel.getProperty("/" + sQuestionPath);

					var oBindings = oDataModel.bindList("/" + sQuestionPath + "/Answers", null, null, [new Filter({
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

				if (bAnswered) {
					aAnsweredSurveys.push({
						name: oForm.Name
					});
				}
			}

			if (aAnsweredSurveys.length > 0) {
				var sText = "";

				for (var i = 0; i < aAnsweredSurveys.length; i++) {
					sText += aAnsweredSurveys[i].name + "\n";
				}

				MessageBox.error(this.getResourceBundle().getText("errorNotRemovableSurveys", [sText]), {
					icon: MessageBox.Icon.ERROR,
					title: this.getResourceBundle().getText("errorHeader"),
					actions: [MessageBox.Action.OK]
				});

				return;
			}

			this.getModel("detailView").setProperty("/busy", true);

			var removeUserSurvey = function () {
				for (var i = 0; i < aSelected.length; i++) {
					var sPath = aSelected[i].getBindingContext().getPath();
					this._deleteRelatedItem(sPath, sGroupId, _fnCallback);
				}

				this.getModel().submitChanges({
					groupId: sGroupId
				});
			}.bind(this);

			var removeUserAnswers = function (aUserAnswers) {
				for (var i = 0; i < aUserAnswers.length; i++) {
					var sObjectPath = this.getModel().createKey("AnswerSet", {
						Id: aUserAnswers[i].Id
					});

					this._deleteRelatedItem("/" + sObjectPath, sGroupId);
				}

				removeUserSurvey();
			}.bind(this);

			var makeUserAnswersRequests = function (aQuestions) {
				var aUserAnswers = [];
				var counter = aQuestions.length;

				var sPath = this.getView().getElementBinding().getPath(),
					oObject = this.getView().getElementBinding().getModel().getObject(sPath),
					sObjectId = oObject.Id;

				for (var n = 0; n < aQuestions.length; n++) {
					var aFilters = [
						new Filter("QuestionId", FilterOperator.EQ, aQuestions[n].Id),
						new Filter("UserId", FilterOperator.EQ, sObjectId)
					];

					this.getModel().read("/AnswerSet", {
						filters: aFilters,
						success: function (oData) {
							aUserAnswers = aUserAnswers.concat(oData.results);
							counter--;

							if (counter === 0) {
								removeUserAnswers(aUserAnswers);
							}
						},
						error: function () {}
					});
				}
			}.bind(this);

			var aQuestions = [];
			var counter = aSelected.length;
			for (var i = 0; i < aSelected.length; i++) {
				var sPath = aSelected[i].getBindingContext().getPath();

				this.getModel().read("/QuestionSet", {
					filters: [new Filter("FormId", FilterOperator.EQ, this.getModel().getProperty(sPath).FormId)],
					success: function (oData) {
						aQuestions = aQuestions.concat(oData.results);
						counter--;

						if (counter === 0) {
							makeUserAnswersRequests(aQuestions);
						}
					},
					error: function () {}
				});
			}
		},

		/** 
		 * creates delete request for item
		 * @param {string} sPath item path
		 * @param {string} sGroupId groupId for changes
		 * @param {function} fnCallback function to be executed after request
		 */
		_deleteRelatedItem: function (sPath, sGroupId, fnCallback) {
			var oDataModel = this.getModel();
			oDataModel.remove(sPath, {
				groupId: sGroupId,
				success: function () {
					if (typeof fnCallback === "function") {
						this.iNumberOfDoneRequests--;
						fnCallback();
					}
				}.bind(this),
				error: function (oError) {
					if (typeof fnCallback === "function") {
						this.iNumberOfDoneRequests--;
						fnCallback();
					}
				}.bind(this)
			});
		},

		/** 
		 * enter press event for search term in list of surveys
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		handleSearch: function (oEvent) {
			this._applySearch(oEvent);
		},

		/** 
		 * live search after each change of search term
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		liveSearch: function (oEvent) {
			if (oEvent.getParameters().value.length === 0) {
				this._applySearch(oEvent);
			}
		},

		/** 
		 * search for term in surveys dialog
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		_applySearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = this._buildFilterForForms(sValue);

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilter, "Application");
		},

		/** 
		 * formatter function to calculate count of questions
		 * @param {integer} formId id of form
		 * @returns {integer} count of questions in form
		 */
		calcQuestionCount: function (formId) {
			var results = this.aQuestions.filter(function (oQuestion) {
				return oQuestion.FormId === formId && oQuestion.Deleted === false;
			});

			return results.length;
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("UserSet", {
					Id: sObjectId
				});
				this._bindView("/" + sObjectPath);

				var aFilter = [new Filter("UserId", FilterOperator.EQ, sObjectId)];

				this.getView().byId("idDetailTableLocationSet").getBinding("items").filter(aFilter);

				this.getModel("detailView").setProperty("/busy", false);

				this.getModel().read("/QuestionSet", {
					success: function (oData) {
						this.aQuestions = oData.results;
					}.bind(this)
				});
			}.bind(this));
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		/** 
		 * 'change' event for binding
		 */
		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oObject = oView.getModel().getObject(sPath),
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/title", oObject.FirstName + " " + oObject.LastName);
		},

		/** 
		 * event fired after metadata loaded
		 */
		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		/** 
		 * creates a filter for list of forms to add to user
		 * @param {string} sValue filter value for search
		 * @returns {sap.ui.model.Filter} filter for list of forms
		 */
		_buildFilterForForms: function (sValue) {
			var aTableItems = this.getView().byId("idDetailTableLocationSet").getItems();
			var oModel = this.getModel();

			var aFilters = [
				new Filter("Deleted", FilterOperator.EQ, false),
				new Filter("ValidTo", FilterOperator.GE, new Date())
			];

			// filter items, that are already added to user
			for (var i = 0; i < aTableItems.length; i++) {
				var sFormId = oModel.getProperty(aTableItems[i].getBindingContext().sPath).FormId;
				aFilters.push(new Filter("Id", FilterOperator.NE, sFormId));
			}

			// if search term is provided add as filter
			if (sValue) {
				aFilters.push(new Filter("Name", FilterOperator.Contains, sValue));
			}

			var oFilter = new Filter({
				filters: aFilters,
				and: true
			});

			return oFilter;
		},

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function () {
			var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			this.getModel("detailView").setProperty("/fullscreen", !bFullScreen);
			if (bFullScreen) {
				// reset to previous layout
				this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
			} else {
				// store current layout and go full screen
				this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
				this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			}
		},

		onPressItem: function (oEvent) {
			this.oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			var oObject = this.getView().getModel().getProperty(oEvent.getSource().getBindingContext().getPath());

			var oIntent = {
				target: {
					semanticObject: "Action",
					action: "toapp_ask_survey"
				},
				params: {
					"UserId": oObject.UserId,
					"FormId": oObject.FormId
				}
			};
			var hash = (this.oCrossAppNavigator && this.oCrossAppNavigator.hrefForExternal(oIntent)) || ""; // generate the Hash to display a Survey

			this.oCrossAppNavigator.isNavigationSupported([oIntent]).done(function (aResponses) {
				if (aResponses[0].supported === true) {
					// enable link 
					this.oCrossAppNavigator.toExternal({
						target: {
							shellHash: hash
						}
					}); // navigate to Survey application
				} else {
					// disable link 
					MessageToast.show(this.getResourceBundle().getText("errorNavigationNotSupport"));
				}
			}.bind(this)).fail(function () {
				// disable link 
				// request failed or other fatal error 
				MessageToast.show(this.getResourceBundle().getText("errorNavigationNotSupport"));
			}.bind(this));
		}
	});
});