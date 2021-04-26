sap.ui.define([
	"./BaseController",
	"../utils/Utils",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"../model/JsonModelManager"
], function (BaseController, Utils, formatter, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, Fragment, JsonModelManager) {
	"use strict";
	return BaseController.extend("com.mjzsoft.QuestionnaireBuilder.controller.ObjectDetail", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when the detail controller is instantiated.
		 * @public
		 */
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.mjzsoft.QuestionnaireBuilder.view.ObjectDetail
		 */
		onInit: function () {
			var oViewModel = this._initViewModel();
			this.setModel(oViewModel, "objectDetailView");
			this.getRouter().getRoute("objectDetail").attachBeforeMatched(this._onBeforeMatched, this);
			this.getRouter().getRoute("objectDetail").attachPatternMatched(this._onObjectMatched, this);
			//for creating new Items
			this.getRouter().getRoute("createObject").attachBeforeMatched(this._onBeforeMatched, this);
			this.getRouter().getRoute("createObject").attachPatternMatched(this._onCreateObjectMatched, this);
			this.initiateValidator();
			this._oValidator = this.getValidator();
			this._oValidator.removeAllMessages();
			this._iNextId = -1;
			this._oOptionsManager = new JsonModelManager("ObjectOptionsModel", "OptionSet", this.getOptionsComparator);
			this._oOptionsManager.createModel(this);
		},
		/** 
		 * lifecycle method after view is rendered
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onAfterRendering: function (oEvent) {
			// trigger the change of items 
			this.bindOnChangeToInputs("fieldGroupItem");
		},
		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */
		/** 
		 * button click event on close view
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onPressCloseObjectPage: function (oEvent) {
			sap.ui.getCore().getEventBus().publish("_deselectDetailSelection", "objectDetailClose", {});
			if (this.getView().getModel("objectDetailView").getProperty("/editMode")) {
				var bChanged = this.getModel().hasPendingChanges();
				var oBundle = this.getResourceBundle();

				var aDeletedItems = this._oOptionsManager.getDeletedItems(),
					aUpdatedItems = this._oOptionsManager.getUpdatedItems(),
					aCreatedItems = this._oOptionsManager.getCreatedItems();

				if (bChanged || aDeletedItems.length > 0 || aUpdatedItems.length > 0 || aCreatedItems.length > 0) {
					Utils.showDialog(this, oBundle.getText("TitDialogClose"), oBundle.getText("closeViewInEditMode"), this.onCloseView.bind(this),
						true, undefined, "", "");
				} else {
					this.onCloseView();
				}
			} else {
				this._navFromDetailObjectToDetail();
			}
		},
		/** 
		 * button click event to edit the bound object
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onPressEdit: function (oEvent) {
			this._oValidator = this.getValidator();
			this._oValidator.removeAllMessages();
			var oViewModel = this.getView().getModel("objectDetailView");
			oViewModel.setProperty("/editMode", true);
			this.getModel("appView").setProperty("/editMode", true);
			oViewModel.setProperty("/createMode", false);
			var selectField = this.getView().byId("questionTypeSelectId");
			if (selectField.getSelectedKey() === "QT3" || selectField.getSelectedKey() === "QT4" || selectField.getSelectedKey() === "QT7") {
				oViewModel.setProperty("/tableEditMode", true);
			} else {
				oViewModel.setProperty("/tableEditMode", false);
			}
		},
		/** 
		 * button click event to save the changes on bound object
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onPressSaveEdit: function (oEvent) {
			var bChanged = this.getModel().hasPendingChanges();
			var oBundle = this.getResourceBundle();

			var aDeletedItems = this._oOptionsManager.getDeletedItems(),
				aUpdatedItems = this._oOptionsManager.getUpdatedItems(),
				aCreatedItems = this._oOptionsManager.getCreatedItems();

			if (bChanged || aDeletedItems.length > 0 || aUpdatedItems.length > 0 || aCreatedItems.length > 0) {
				if (this._oValidator.validate(this.byId("objectDetailFormId")) && this._oValidator.validate(this.byId("tableAnswers"))) {
					if (this.checkAnswers()) {
						if (this._checkQuestionRequirements()) {
							Utils.showDialog(this, oBundle.getText("saveMsg"), oBundle.getText("saveBtnMsg"), this.onSaveDialog.bind(this), true, undefined,
								oBundle.getText("BtnNo"), oBundle.getText("BtnYes"));
						} else {
							MessageBox.show(oBundle.getText("atleastTwoPossibleAnswersError"), {
								icon: MessageBox.Icon.ERROR,
								title: oBundle.getText("errorHeader"),
								actions: [MessageBox.Action.OK],
								onClose: function (oAction) {}
							});
						}
					} else {
						MessageBox.show(oBundle.getText("MsgToastOptionsEmpty"), {
							icon: MessageBox.Icon.ERROR,
							title: oBundle.getText("errorHeader"),
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {}
						});
					}
				}
			} else {
				var oViewModel = this.getView().getModel("objectDetailView");
				oViewModel.setProperty("/editMode", false);
				this.getModel("appView").setProperty("/editMode", false);
				oViewModel.setProperty("/tableEditMode", false);

				var oTable = this.getView().byId("tableAnswers");
				oTable.removeSelections();
			}
		},
		/** 
		 * button click event to cancel the changes
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onPressCancel: function (oEvent) {
			var oBundle = this.getResourceBundle();
			var bChanged = this.getModel().hasPendingChanges();

			var aDeletedItems = this._oOptionsManager.getDeletedItems(),
				aUpdatedItems = this._oOptionsManager.getUpdatedItems(),
				aCreatedItems = this._oOptionsManager.getCreatedItems();

			if (this.getView().getModel("objectDetailView").getProperty("/showAdd") === true) {
				if (bChanged || aDeletedItems.length > 0 || aUpdatedItems.length > 0 || aCreatedItems.length > 0) {
					Utils.showDialog(this, oBundle.getText("TitDialogCancel"), oBundle.getText("TxtDialogCancel"), this.onCancelNewItem.bind(this),
						true, undefined, "", "");
				} else {
					this.onCancelNewItem();
				}
			} else {
				if (bChanged || aDeletedItems.length > 0 || aUpdatedItems.length > 0 || aCreatedItems.length > 0) {
					Utils.showDialog(this, oBundle.getText("TitDialogCancel"), oBundle.getText("TxtDialogCancel"), this.onCancelItemEdit.bind(this),
						true, undefined, oBundle.getText("BtnNo"), oBundle.getText("BtnYes"));
				} else {
					this.onCancelItemEdit();
				}
			}
		},
		/** 
		 * 'change' event on QuestionType select
		 * @param {sap.ui.base.Event} oEvent the route match event 
		 */
		onQuestionTypeSelectChange: function (oEvent) {
			var oSource = oEvent.getSource();
			if (oSource.getSelectedKey() === "QT4" || oSource.getSelectedKey() === "QT3" || oSource.getSelectedKey() === "QT7") {
				this.getView().getModel("objectDetailView").setProperty("/tableEditMode", true);
				this.getView().getModel("objectDetailView").setProperty("/questionWithOptions", true);
			} else {
				this.getView().getModel("objectDetailView").setProperty("/tableEditMode", false);
				this.getView().getModel("objectDetailView").setProperty("/questionWithOptions", false);
				var oTable = this.getView().byId("tableAnswers");
				var aItems = oTable.getItems();
				if (aItems.length > 0) {
					var aRemoveItems = [];
					for (var i = 0; i < aItems.length; i++) {
						var oItem = aItems[i].getBindingContext("ObjectOptionsModel").getObject();
						if (oItem.Id > 0) {
							oItem.Deleted = true;
							oItem = this.getBatchObject(oItem, "Option");
							this._oOptionsManager.updateEntry(oItem);
						} else {
							aRemoveItems.push(oItem);
						}
					}
					this._oOptionsManager.deleteItemsFromModel(this, aRemoveItems);
				}
			}
			if (oSource.getSelectedKey() === "QT1" || oSource.getSelectedKey() === "QT2") {
				this.getView().getModel("objectDetailView").setProperty("/isMandatoryVisible", false);
			} else {
				this.getView().getModel("objectDetailView").setProperty("/isMandatoryVisible", true);
			}
		},
		/** 
		 * button press event for add new option
		 * @param {sap.ui.base.Event} oEvent the route match event
		 */
		tableAddBtnPress: function (oEvent) {
			var oTable = this.getView().byId("tableAnswers");
			var oBindingContext = this.getView().getBindingContext();
			var sId = this._sId ? this._sId : -1;
			if (oBindingContext) {
				sId = oBindingContext.getObject().Id;
			}
			var iSeqNum = 1;
			if (oTable.getItems().length > 0) {
				iSeqNum = Math.max.apply(Math, oTable.getItems().map(function (o) {
					return o.getBindingContext("ObjectOptionsModel").getObject().Sequence;
				}));
				iSeqNum++;
			}
			this._oOptionsManager.addToMiddlewareJsonModel(this, [{
				"Id": this.getNextId(),
				"QuestionId": sId,
				"Sequence": iSeqNum,
				"Deleted": false,
				"Answer": "",
				"DefaultAnswer": false,
				"Value": 1
			}]);
		},
		/** 
		 * button press event for delete selected options
		 * @param {sap.ui.base.Event} oEvent the route match event
		 */
		tableDelBtnPress: function (oEvent) {
			var oTable = this.getView().byId("tableAnswers"),
				aSelectedContexts = oTable.getSelectedContexts("ObjectOptionsModel");
			if (aSelectedContexts.length === 0 && oTable.getItems().length > 0) {
				MessageBox.error(this.getResourceBundle().getText("atLeastSellectOneItemToAction"), {
					icon: MessageBox.Icon.ERROR,
					title: this.getResourceBundle().getText("errorHeader"),
					actions: [MessageBox.Action.OK]
				});
				return;
			} else if (oTable.getItems().length > 0) {
				var oOptionsModel = this.getModel(this._oOptionsManager.getModelName());
				var aItems = [];
				for (var i = 0; i < aSelectedContexts.length; i++) {
					var oItem = oOptionsModel.getProperty(aSelectedContexts[i].getPath());
					if (oItem.Id > 0) {
						oItem.Deleted = true;
						oItem = this.getBatchObject(oItem, "Option");
						this._oOptionsManager.updateEntry(oItem);
					} else {
						aItems.push(oItem);
					}
				}
				this._oOptionsManager.deleteItemsFromModel(this, aItems);
				oTable.getBinding("items").refresh(true);
				oTable.removeSelections();
			}
		},
		/** 
		 * An event handler that runs validation on the input on change event
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onOptionAnswerChange: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("ObjectOptionsModel"),
				oEntry = jQuery.extend({}, oContext.getObject());
			// update model value
			var oModel = oContext.getModel("ObjectOptionsModel");
			oModel.setProperty(oContext.getPath() + "/Answer", oEntry.Answer);
			this._oOptionsManager.updateEntry(oEntry);
		},
		/** 
		 * An event handler for DefaultAnswer CheckBox
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onOptionDefaultChange: function (oEvent) {
			var isSelected = oEvent.getSource().getSelected();
			var oContext = oEvent.getSource().getBindingContext("ObjectOptionsModel"),
				oEntry = jQuery.extend({}, oContext.getObject());
			oEntry.DefaultAnswer = isSelected;
			// update model value
			var oModel = oContext.getModel("ObjectOptionsModel");
			oModel.setProperty(oContext.getPath() + "/DefaultAnswer", isSelected);
			this._oOptionsManager.updateEntry(oEntry);
		},
		/** 
		 * button event on table item to switch item with next up one
		 * @param {sap.ui.base.Event} oEvent the route match event
		 */
		tableUpBtnPress: function (oEvent) {
			var oTable = this.getView().byId("tableAnswers");
			var oItem = oEvent.getSource().getBindingContext("ObjectOptionsModel").getObject();
			// find item position
			var iItemPosition = -1;
			for (var i = 0; i < oTable.getItems().length; i++) {
				if (oTable.getItems()[i].getBindingContext("ObjectOptionsModel").getObject().Id === oItem.Id) {
					iItemPosition = i;
					break;
				}
			}
			// check item position to switch
			var iIndexSwitch = iItemPosition - 1;
			if (iIndexSwitch === -1) {
				iIndexSwitch = oTable.getItems().length - 1;
			}
			var oSwitchObject = oTable.getItems()[iIndexSwitch].getBindingContext("ObjectOptionsModel").getObject();
			// update UI values
			var iTempIndex = oItem.Sequence;
			oItem.Sequence = oSwitchObject.Sequence;
			oSwitchObject.Sequence = iTempIndex;
			// add updates to model manager to update on backend
			oItem = this.getBatchObject(oItem, "Option");
			oSwitchObject = this.getBatchObject(oSwitchObject, "Option");
			this._oOptionsManager.updateEntry(oItem);
			this._oOptionsManager.updateEntry(oSwitchObject);
			// refresh UI
			oTable.getBinding("items").refresh(true);
		},
		/** 
		 * button event on table item to switch item with next down one
		 * @param {sap.ui.base.Event} oEvent the route match event
		 */
		tableDownBtnPress: function (oEvent) {
			var oTable = this.getView().byId("tableAnswers");
			var oItem = oEvent.getSource().getBindingContext("ObjectOptionsModel").getObject();
			// find item position
			var iItemPosition = -1;
			for (var i = 0; i < oTable.getItems().length; i++) {
				if (oTable.getItems()[i].getBindingContext("ObjectOptionsModel").getObject().Id === oItem.Id) {
					iItemPosition = i;
					break;
				}
			}
			// check item position to switch
			var iIndexSwitch = iItemPosition + 1;
			if (iIndexSwitch >= oTable.getItems().length) {
				iIndexSwitch = 0;
			}
			var oSwitchObject = oTable.getItems()[iIndexSwitch].getBindingContext("ObjectOptionsModel").getObject();
			// update UI values
			var iTempIndex = oItem.Sequence;
			oItem.Sequence = oSwitchObject.Sequence;
			oSwitchObject.Sequence = iTempIndex;
			// add updates to model manager to update on backend
			oItem = this.getBatchObject(oItem, "Option");
			oSwitchObject = this.getBatchObject(oSwitchObject, "Option");
			this._oOptionsManager.updateEntry(oItem);
			this._oOptionsManager.updateEntry(oSwitchObject);
			// refresh UI
			oTable.getBinding("items").refresh(true);
		},
		/* =========================================================== */
		/* private methods		                                       */
		/* =========================================================== */
		/** 
		 * fired before some 
		 */
		_onBeforeMatched: function () {
			if (this.getView()) {
				this.getView().unbindElement();
				this.getView().unbindObject();
				this.getView().setBindingContext(null);
				var oTable = this.getView().byId("tableAnswers");
				oTable.destroyItems();
			}
			this.getView().getModel("objectDetailView").setProperty("/title", "");
		},
		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			if (!this.getOwnerComponent().getCurrentUser() || !this.getOwnerComponent().getCurrentUser().admin) {
				this.getRouter().navTo("notAllowed", {}, true);
				this.getModel("appView").setProperty("/layout", "OneColumn");
			} else {
				this._sId = parseInt(oEvent.getParameter("arguments").Id, 10);
				this._sFormId = parseInt(oEvent.getParameter("arguments").objectId, 10);
				var oViewModel = this.getView().getModel("objectDetailView");
				oViewModel.setProperty("/editMode", false);
				oViewModel.setProperty("/createMode", false);
				oViewModel.setProperty("/tableEditMode", false);
				// update second page for case if the view was opened with F5 refresh
				sap.ui.getCore().getEventBus().publish("_refreshDetail", "objectId", {
					objectId: this._sFormId
				});
				sap.ui.getCore().getEventBus().publish("_refreshDetailSelection", "questionId", {
					questionId: this._sId
				});
				// also update the master view
				sap.ui.getCore().getEventBus().publish("_refreshMasterSelection", "formId", {
					formId: this._sFormId
				});
				this.getModel("appView").setProperty("/layout", "ThreeColumnsEndExpanded");
				this._refreshDetailObjects();
			}
		},
		/** 
		 * fired, when new question will be created
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		_onCreateObjectMatched: function (oEvent) {
			this._sObjectId = null;
			this._sFormId = parseInt(oEvent.getParameter("arguments").objectId, 10);
			var oViewModel = this.getView().getModel("objectDetailView");
			oViewModel.setProperty("/busy", true);
			oViewModel.setProperty("/editMode", true);
			oViewModel.setProperty("/createMode", true);
			oViewModel.setProperty("/isMandatoryVisible", false);
			// the fist item is 5star
			this.getModel("appView").setProperty("/editMode", true);
			oViewModel.setProperty("/tableEditMode", false);
			// the fist item is 5star
			oViewModel.setProperty("/questionWithOptions", false);
			// the fist item is 5star
			oViewModel.setProperty("/showAdd", true);
			oViewModel.setProperty("/title", this.getResourceBundle().getText("createViewTitle"));
			// update second page for case if the view was opened with F5 refresh
			sap.ui.getCore().getEventBus().publish("_refreshDetail", "objectId", {
				objectId: this._sFormId
			});
			// no detail selection update, because the object is new
			// also update the master view
			sap.ui.getCore().getEventBus().publish("_refreshMasterSelection", "formId", {
				formId: this._sFormId
			});
			this.getModel("appView").setProperty("/layout", "ThreeColumnsEndExpanded");
			this.getModel().metadataLoaded().then(function () {
				this.getModel().read("/QuestionSet", {
					filters: [new Filter("FormId", FilterOperator.EQ, this._sFormId)],
					sorters: [new sap.ui.model.Sorter("Sequence", false)],
					success: function (oData, oResponse) {
						var maxOrder = Math.max.apply(Math, oData.results.map(function (o) {
							return o.Sequence;
						}));
						if (maxOrder < 1) {
							maxOrder = 0;
						}
						this.resetCreatedOContext("QuestionSet");
						this._oContext = this.getModel().createEntry("QuestionSet", {
							properties: {
								Id: -1,
								QtypeId: "QT1",
								FormId: this._sFormId,
								Sequence: maxOrder + 1,
								RandomWeight: 1,
								Mandatory: false,
								Deleted: false
							}
						});
						this.getView().setBindingContext(this._oContext);
						this.getView().getModel("objectDetailView").setProperty("/busy", false);
						this._oOptionsManager.updateData(this, this._getOptionFilters());
					}.bind(this),
					error: function (oError) {
						MessageToast.show(this.getResourceBundle().getText("errorHeader"));
					}.bind(this)
				});
			}.bind(this));
		},
		/** 
		 * returns the initial model for view
		 * @returns {sap.ui.model.json.JSONModel} model for view
		 */
		_initViewModel: function () {
			return new JSONModel({
				title: "",
				editMode: false,
				busy: false
			});
		},
		/** 
		 * resets view to init state if QuestionId is provided
		 * @private
		 */
		_refreshDetailObjects: function () {
			if (this._sId) {
				this.getModel().metadataLoaded().then(function () {
					this._sObjectId = this._sId;
					var oViewModel = this.getView().getModel("objectDetailView");
					oViewModel.setProperty("/sObjectId", this._sObjectId);
					oViewModel.setProperty("/EditMode", true);
					oViewModel.setProperty("/showAdd", false);
					oViewModel.setProperty("/title", this.getResourceBundle().getText("detailViewTitle"));
					this._sObjectPath = this.getModel().createKey("QuestionSet", {
						Id: this._sId
					});
					this._bindView("/" + this._sObjectPath);
					this.resetCreatedOContext("QuestionSet");
					this._oOptionsManager.updateData(this, this._getOptionFilters());
				}.bind(this));
			} else {
				//nav back 
				return;
			}
		},
		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			this.getView().getModel("objectDetailView").setProperty("/busy", false);
			this.getView().bindElement({
				path: sObjectPath,
				parameteres: {
					"$expand": "Form,Form/Icon"
				},
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						this.getView().getModel("objectDetailView").setProperty("/busy", true);
					}.bind(this),
					dataReceived: function () {
						this.getView().getModel("objectDetailView").setProperty("/busy", false);
					}.bind(this)
				}
			});
		},
		/** 
		 * fired when binding changed
		 */
		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				return;
			}
			var sPath = oElementBinding.getPath();
			var oQuestion = oView.getModel().getObject(sPath);
			this._sObjectId = oQuestion.Id;
			if (oQuestion.QtypeId === "QT3" || oQuestion.QtypeId === "QT4" || oQuestion.QtypeId === "QT7") {
				oView.getModel("objectDetailView").setProperty("/questionWithOptions", true);
			} else {
				oView.getModel("objectDetailView").setProperty("/questionWithOptions", false);
			}
			if (oQuestion.QtypeId === "QT1" || oQuestion.QtypeId === "QT2") {
				this.getModel("objectDetailView").setProperty("/isMandatoryVisible", false);
			} else {
				this.getModel("objectDetailView").setProperty("/isMandatoryVisible", true);
			}
			var oTable = this.getView().byId("tableAnswers");
			oTable.getBinding("items").refresh(true);
		},
		/** 
		 * internal method called at the end of save an entry
		 * @private
		 */
		_refreshViews: function () {
			sap.ui.getCore().getEventBus().publish("_questionCountChange", {
				questionId: this._sObjectId
			});
			sap.ui.getCore().getEventBus().publish("_formChange", {
				formId: this._sFormId
			});
			this.getRouter().navTo("objectDetail", {
				objectId: this._sFormId,
				Id: this._sObjectId
			}, true);
		},
		/** 
		 * reset view by removing previous entry and creating of new one
		 * @param {String} sSetName name of the set to set
		 * @param {Object} mParameters entry parameters to set
		 */
		resetCreatedOContext: function (sSetName, mParameters) {
			var oDataModel = this.getModel(),
				oParameters;
			oParameters = mParameters ? mParameters : {};
			oParameters.refreshAfterChange = false;
			if (this._oContext !== null) {
				oDataModel.deleteCreatedEntry(this._oContext);
				this._oContext = null;
			}
			oDataModel.setDeferredGroups(["changes"]);
		},
		/** 
		 * returns the state of table items
		 * @returns {boolean} valid state of options
		 */
		checkAnswers: function () {
			var oTable = this.getView().byId("tableAnswers");
			var aItems = oTable.getItems();
			var bValid = true;
			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i].getBindingContext("ObjectOptionsModel").getObject();
				if (oItem.Answer.length === 0) {
					bValid = false;
					break;
				}
			}
			return bValid;
		},
		/** 
		 * internal method to save the edited entry
		 * @private 
		 */
		_saveChangedObject: function () {
			var oDataModel = this.getModel(),
				sGroupId = "mjzsoftadd" + new Date().getTime();
			this.getView().getModel("objectDetailView").setProperty("/busy", true);
			oDataModel.setUseBatch(true);
			oDataModel.setDeferredGroups([sGroupId]);
			this.createOptionOdataRequests(sGroupId);
			if (this.getModel().hasPendingChanges()) {
				var oEntry = this.getView().getBindingContext().getObject();
				oEntry = this.getBatchObject(oEntry, "Question");
				var sObjectPath = this.getView().getElementBinding().getPath();
				oDataModel.update(sObjectPath, oEntry, {
					success: function () {
						MessageToast.show(this.getResourceBundle().getText("successUpdateMessage"));
						this.getView().getModel("objectDetailView").setProperty("/busy", false);
						oDataModel.setDeferredGroups(["changes"]);
						this._refreshViews();
					}.bind(this),
					error: function (oError) {
						MessageToast.show(this.getResourceBundle().getText("errorUpdateMessage"));
						this.getView().getModel("objectDetailView").setProperty("/busy", false);
					}.bind(this)
				});
			}
			oDataModel.submitChanges({
				groupId: sGroupId,
				success: function () {
					MessageToast.show(this.getResourceBundle().getText("successUpdateMessage"));
					this.getView().getModel("objectDetailView").setProperty("/busy", false);
					oDataModel.setDeferredGroups(["changes"]);
					this._refreshViews();
				}.bind(this),
				error: function (oError) {
					MessageToast.show(this.getResourceBundle().getText("errorUpdateMessage"));
					this.getView().getModel("objectDetailView").setProperty("/busy", false);
				}.bind(this)
			});
		},
		/** 
		 * internal method to save the new entry
		 * @private 
		 */
		_saveNewObject: function () {
			var oEntry = this._oContext.getObject();
			oEntry = this.getBatchObject(oEntry, "Question");
			for (var sKey in oEntry) {
				if (oEntry[sKey] === undefined) {
					oEntry[sKey] = "";
				}
			}
			oEntry.QtypeId = this.getView().byId("questionTypeSelectId").getSelectedKey();
			oEntry.FormId = this._sFormId;
			var oDataModel = this.getModel(),
				sGroupId = "mjzsoftadd" + new Date().getTime();
			this.getView().getModel("objectDetailView").setProperty("/busy", true);
			oDataModel.setUseBatch(true);
			oDataModel.setDeferredGroups([sGroupId]);
			oDataModel.create("/QuestionSet", oEntry, {
				success: function (_oData, _oResponse) {
					this._sObjectId = _oData.Id;
					var oOptionsResult = this.createOptionOdataRequests(sGroupId, this._sObjectId);
					if (oOptionsResult.changesExist) {
						oDataModel.submitChanges({
							groupId: sGroupId,
							success: function () {
								MessageToast.show(this.getResourceBundle().getText("successUpdateMessage"));
								this.getView().getModel("objectDetailView").setProperty("/busy", false);
								oDataModel.setDeferredGroups(["changes"]);
								this._refreshViews();
							}.bind(this),
							error: function (oError) {
								MessageToast.show(this.getResourceBundle().getText("errorCreationMessage"));
								this.getView().getModel("objectDetailView").setProperty("/busy", false);
							}.bind(this)
						});
					} else {
						MessageToast.show(this.getResourceBundle().getText("successUpdateMessage"));
						this.getView().getModel("objectDetailView").setProperty("/busy", false);
						oDataModel.setDeferredGroups(["changes"]);
						this._refreshViews();
					}
				}.bind(this),
				error: function (oError) {
					MessageToast.show(this.getResourceBundle().getText("errorCreationMessage"));
					this.getView().getModel("objectDetailView").setProperty("/busy", false);
				}.bind(this)
			});
		},
		/** 
		 * nav back to Detail-View
		 */
		_navFromDetailObjectToDetail: function () {
			var oViewModel = this.getView().getModel("objectDetailView");
			oViewModel.setProperty("/showAdd", false);
			oViewModel.setProperty("/busy", false);
			sap.ui.core.BusyIndicator.hide();
			//	this._clearAddView();
			this.getView().unbindElement();
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getRouter().navTo("object", {
				objectId: this._sFormId
			});
		},
		/** 
		 * id for new created option
		 * @returns {integer} negative number
		 */
		getNextId: function () {
			return this._iNextId--;
		},
		/** 
		 * returns filter for options to current bound object
		 * @returns {sap.ui.model.Filter} filter for options
		 */
		_getOptionFilters: function () {
			var oBindingContext = this.getView().getBindingContext();
			var id = 0;
			if (oBindingContext) {
				id = this.getView().getModel().getProperty(oBindingContext.getPath()).Id;
			}
			if (id === 0) {
				// read id from uri
				var uri = window.location.href;
				var aSplitted = uri.split("/");
				var sLastParam = aSplitted[aSplitted.length - 1];
				if (!isNaN(sLastParam)) {
					id = parseInt(sLastParam, 10);
				}
			}
			return new Filter({
				filters: [
					new Filter("QuestionId", FilterOperator.EQ, id),
					new Filter("Deleted", FilterOperator.EQ, false)
				],
				and: true
			});
		},
		/** 
		 * comparator for entries
		 * @param {object} oItemA entry1
		 * @param {object} oItemB entry2
		 * @returns {boolean} true - entries are equal, false  otherwise
		 */
		getOptionsComparator: function (oItemA, oItemB) {
			if (oItemA.Id === oItemB.Id) {
				return true;
			}
			return false;
		},
		/** 
		 * creates OData requests to maked changes
		 * @param {string} sGroupId id for changes
		 * @param {string} sObjectId id of current parent, data belong to
		 * @returns {string} id of group with changes
		 */
		createOptionOdataRequests: function (sGroupId, sObjectId) {
			var sPath = "/OptionSet";
			var oDataModel = this.getView().getModel();
			var aDeletedItems = this._oOptionsManager.getDeletedItems(),
				aUpdatedItems = this._oOptionsManager.getUpdatedItems(),
				aCreatedItems = this._oOptionsManager.getCreatedItems();
			oDataModel.setDeferredGroups([sGroupId]);
			for (var i = 0; i < aCreatedItems.length; i++) {
				var oCreatedItem = aCreatedItems[i];
				// update id for case items was created in creation mode
				oCreatedItem.QuestionId = sObjectId ? sObjectId : oCreatedItem.QuestionId;
				oCreatedItem = this.getBatchObject(oCreatedItem, "Option");
				oDataModel.create(sPath, oCreatedItem, {
					groupId: sGroupId
				});
			}
			for (var n = 0; n < aDeletedItems.length; n++) {
				var oDeletedItem = aDeletedItems[n];
				var sDeletedItemPath = oDataModel.createKey(sPath, {
					Id: oDeletedItem.Id
				});
				oDataModel.remove(sDeletedItemPath, {
					groupId: sGroupId
				});
			}
			for (var m = 0; m < aUpdatedItems.length; m++) {
				var oUpdatedItem = aUpdatedItems[m];
				oUpdatedItem = this.getBatchObject(oUpdatedItem, "Option");
				var sUpdatedItemPath = oDataModel.createKey(sPath, {
					Id: oUpdatedItem.Id
				});
				oDataModel.update(sUpdatedItemPath, oUpdatedItem, {
					groupId: sGroupId
				});
			}
			return {
				groupId: sGroupId,
				changesExist: aCreatedItems !== 0 || aUpdatedItems !== 0 || aDeletedItems !== 0
			};
		},
		/** 
		 * returns default filter for Questions
		 * @returns {array} list of filters
		 */
		_getInitialFilter: function () {
			return new Filter({
				filters: [
					new Filter("QuestionId", FilterOperator.EQ, this._sObjectId),
					new Filter("Deleted", FilterOperator.EQ, false)
				],
				and: true
			});
		},
		/** 
		 * check question type and possible answers
		 * @returns {boolean} true - valid, false -o therwise
		 */
		_checkQuestionRequirements: function () {
			if (this.getView().getBindingContext()) {
				var obj = this.getView().getBindingContext().getObject(),
					sQT = obj.QtypeId;
				if (sQT === "QT3" || sQT === "QT4" || sQT === "QT7") {
					var oTable = this.getView().byId("tableAnswers");
					var aTableItems = oTable.getItems();
					if (aTableItems.length < 2) {
						return false;
					} else {
						return true;
					}
				} else {
					return true;
				}
			} else {
				return false;
			}
		},
		/** 
		 * callback function to close the view
		 */
		onCloseView: function () {
			this.getModel("appView").setProperty("/editMode", false);
			this._navFromDetailObjectToDetail();
		},
		/** 
		 * callback function after new item was cancelled
		 */
		onCancelNewItem: function () {
			MessageToast.show(this.getResourceBundle().getText("MsgToastCanceled"));
			this.getModel("appView").setProperty("/editMode", false);
			this._navFromDetailObjectToDetail();
		},
		/** 
		 * cancel action of cancel changes event
		 */
		onCancelItemEdit: function () {
			MessageToast.show(this.getResourceBundle().getText("MsgToastCanceled"));
			var oViewModel = this.getView().getModel("objectDetailView");
			oViewModel.setProperty("/editMode", false);
			this.getModel("appView").setProperty("/editMode", false);
			oViewModel.setProperty("/tableEditMode", false);
			this.getView().getModel().resetChanges();
			this.getView().unbindElement();
			this._refreshDetailObjects();
		},
		/** 
		 * save action of save changes event
		 */
		onSaveDialog: function () {
			var oViewModel = this.getView().getModel("objectDetailView");
			oViewModel.setProperty("/editMode", false);
			this.getModel("appView").setProperty("/editMode", false);
			oViewModel.setProperty("/tableEditMode", false);
			if (this._sObjectId) {
				this._saveChangedObject();
			} else {
				this._saveNewObject();
			}
			var oTable = this.getView().byId("tableAnswers");
			oTable.removeSelections();
		},

		/**
		 * Handler to show select dialog 
		 * @param {sap.ui.base.Event} oEvent pattern match event valueHelpRequested 
		 * @memberOf com.mjzsoft.QuestionnaireBuilder.controller.ObjectDetail
		 */
		onRegexValueHelpPressed: function (oEvent) {
			if (!this._oRegexDialog) {
				Fragment.load({
					name: "com.mjzsoft.QuestionnaireBuilder.view.fragment.DialogRegexSelector",
					controller: this
				}).then(function (oDialog) {
					this._oRegexDialog = oDialog;
					this._oRegexDialog.setModel(this.getView().getModel());
					this.getView().addDependent(this._oRegexDialog);
					this._oRegexDialog.open();
				}.bind(this));
			} else {
				this._oRegexDialog.open();
			}
		},

		/**
		 * Refresh the list when user removes all search string 
		 * @param {sap.ui.base.Event} oEvent search data
		 */
		onRegexDialogLiveSearch: function (oEvent) {
			if (oEvent.getParameter("value").length === 0) {
				this.onRegexDialogSearch(oEvent);
			}
		},

		/**
		 * Handler to response search on dialog 
		 * @param {sap.ui.base.Event} oEvent pattern match event search 
		 * @memberOf com.mjzsoft.QuestionnaireBuilder.controller.ObjectDetail
		 */
		onRegexDialogSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},

		/**
		 * Handler to response select dialog close or selection 
		 * @param {sap.ui.base.Event} oEvent pattern match event dialog close
		 * @memberOf com.mjzsoft.QuestionnaireBuilder.controller.ObjectDetail
		 */
		onRegexDialogClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var oObject = aContexts[0].getObject(),
					oModel = this.getModel(),
					sPath = this.getView().getBindingContext().getPath();
				oModel.setProperty(sPath + "/Regex", oObject.Expression);
			}
			oEvent.getSource().getBinding("items").filter([]);
		}
	});
});