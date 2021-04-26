sap.ui.define([
	"com/mjzsoft/QuestionnaireStatistics/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/mjzsoft/QuestionnaireStatistics/model/formatter"
], function (BaseController, JSONModel, Filter, FilterOperator, formatter) {
	"use strict";

	return BaseController.extend("com.mjzsoft.QuestionnaireStatistics.controller.Detail", {

		formatter: formatter,
		aContent: [], // UI items. Charts, tables etc. for each question
		aSurveys: [], // all completed user surveys for the form
		aAnswers: [], // all answers to not deleted questions for the form
		aOptions: [], // all existing options

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the detail controller is instantiated. It sets up lifecycle tasks.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				atLeastSellectOneItemToAction: this.getResourceBundle().getText("atLeastSellectOneItemToAction")
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * creates data request to backend
		 * @param {string} sPath property path
		 * @param {array} aFilter list of filters
		 * @param {object} oParams request parameters
		 */
		readWithFilter: function (sPath, aFilter, oParams) {
			var oPromise = jQuery.Deferred();
			//to be safe:
			if (!Array.isArray(aFilter)) {
				aFilter = [aFilter];
			}
			this.getOwnerComponent().getModel().read(sPath, {
				urlParameters: oParams,
				filters: aFilter,
				success: oPromise.resolve,
				error: oPromise.reject
			});
			return oPromise;
		},

		/**
		 * resets content
		 */
		setContentInitial: function () {
			//this.getView().byId("StatContainer").removeAllItems();
			this.aContent = [];
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
			if (!this.getOwnerComponent().getCurrentUser() || !this.getOwnerComponent().getCurrentUser().admin) {
				this.getRouter().navTo("notAllowed", {}, true);
				this.getModel("appView").setProperty("/layout", "OneColumn");
			} else {
				var sObjectId = oEvent.getParameter("arguments").objectId;

				this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
				this.getModel().metadataLoaded().then(function () {
					// used for header view
					var sObjectPath = this.getModel().createKey("FormSet", {
						Id: sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));

				//set View Busy:
				this.getView().getModel("detailView").setProperty("/busy", true);

				var aUserSurveyFilters = [];
				aUserSurveyFilters.push(new Filter("FormId", FilterOperator.EQ, sObjectId));

				// read for surveys for current form
				this.readWithFilter("/SurveySet", aUserSurveyFilters, {}).then(oDataSurveys => {
					this.setContentInitial();

					// set this global to use later
					this.aSurveys = oDataSurveys.results.filter(item => item.DoneAt !== null);

					this.getModel("detailView").setProperty("/UserCount", this.aSurveys.length);

					if (this.aSurveys.length === 0) {
						if (this.getView().byId("StatContainer").getItems().length > 0) {
							this.getView().byId("StatContainer").removeAllItems();
						}

						var oTitle = new sap.m.Title({
							text: this.getResourceBundle().getText("noStatisticData"),
							wrapping: true
						}).addStyleClass("sapUiResponsiveMargin").addStyleClass("boldText");
						this.getView().byId("StatContainer").addItem(oTitle);
						this.getView().getModel("detailView").setProperty("/busy", false);
						return;
					}

					var aQuestionsFilters = [];
					aQuestionsFilters.push(new Filter("FormId", FilterOperator.EQ, sObjectId));
					aQuestionsFilters.push(new Filter("Deleted", FilterOperator.EQ, false));

					var oParams = {
						"$expand": "Qtype"
					};

					// read for questions for current form
					this.readWithFilter("/QuestionSet", aQuestionsFilters, oParams).then(oDataQuestions => {
						var aQuestions = oDataQuestions.results;

						// we need only answers belong to questions of form
						var aQuestionsFilter = [];
						aQuestions.forEach(function (oQuestion) {
							aQuestionsFilter.push(new Filter("QuestionId", FilterOperator.EQ, oQuestion.Id));
						});

						// we also need only answers, that was maked by users, that have done the survey
						var aUsersFilters = [];
						this.aSurveys.forEach(function (oSurvey) {
							aUsersFilters.push(new Filter("UserId", FilterOperator.EQ, oSurvey.UserId));
						});

						if (aQuestionsFilter.length === 0 || aUsersFilters.length === 0) {
							return;
						}

						// (answer of question of form: QuestionId or QuestionId) and (answer of user with ready survey: UserId or UserId)
						var oOrFilter = new Filter({
							filters: [new Filter({
								filters: aQuestionsFilter,
								and: false
							}), new Filter({
								filters: aUsersFilters,
								and: false
							})],
							and: true
						});

						// read for answers for all questions of current form
						this.readWithFilter("/AnswerSet", oOrFilter, {
							"$expand": "Question,Option"
						}).then(oDataAnswers => {
							// set this global to use later
							this.aAnswers = oDataAnswers.results;

							// read for all existing options
							this.readWithFilter("/OptionSet", [], {
								"$expand": "Question"
							}).then(oDataOptions => {
								// set this global to use later
								this.aOptions = oDataOptions.results;

								// now all needed data is received
								// create the content for questions of form
								this.constructContent(aQuestions);
							}).fail(() => {
								//do exception handling
							});

						}).fail(() => {
							//do exception handling
						});
					}).fail(() => {
						//do exception handling
					});
				}).fail(() => {
					//do exception handling
				});

				// refresh selection on master
				sap.ui.getCore().getEventBus().publish("_refreshMasterSelection", "formId", {
					formId: sObjectId
				});
			}
		},

		/**
		 * filters options by questionId
		 * @param {integer} questionId question id to filter on options
		 * returns {array} filteres options
		 */
		getOptionsForQuestionId: function (questionId) {
			var aOptions = [];
			for (var i = 0; i < this.aOptions.length; i++) {
				if (this.aOptions[i].QuestionId === questionId && this.aOptions[i].Deleted === false) {
					aOptions.push(this.aOptions[i]);
				}
			}
			return aOptions;
		},

		/**
		 * filters answers by questionId
		 * @param {integer} questionId question id to filter on answers
		 * returns {array} filteres answers
		 */
		getAnswersForQuestionId: function (questionId) {
			var aAnswers = [];
			for (var i = 0; i < this.aAnswers.length; i++) {
				if (this.aAnswers[i].Question.Id === questionId) {
					aAnswers.push(this.aAnswers[i]);
				}
			}
			return aAnswers;
		},

		/**
		 * based on question type creates a chart
		 * @param {array} aAnswers answers related to question
		 * @param {array} aOptions optinos related to question
		 * @param {object} oQuestion current question
		 * @param {integer} iNumber number of question, started with 0
		 */
		handleTypes: function (aAnswers, aOptions, oQuestion, iNumber) {
			var questionType = oQuestion.Qtype.Id;
			var oItem = {};
			var bDonut = false;
			switch (questionType) {
			case "QT1":
				// 5-Star
				oItem = this.constructRatingIndicator(aAnswers);
				break;
			case "QT2":
				// Yes/No
				oItem = this.constructDonutChart(aAnswers);
				if (oItem) {
					bDonut = true;
				}
				break;
			case "QT3":
				// Single Select
				oItem = this.constructBarChart(aAnswers, aOptions);
				break;
			case "QT4":
				// Multiple Choice
				oItem = this.constructBarChart(aAnswers, aOptions);
				break;
			case "QT5":
				// Simple Short Question
				oItem = this.constructFreeTextList(aAnswers);
				break;
			case "QT6":
				// Simple Long Question
				oItem = this.constructFreeTextList(aAnswers);
				break;
			case "QT7":
				// Drop Down List
				oItem = this.constructBarChart(aAnswers, aOptions);
				break;
			default:
				// falls keine der case-Klauseln mit expression übereinstimmt
				break;
			}

			// oItem is the constructed content for the flexbox
			this.addToViewArray(oQuestion, oItem, bDonut, iNumber);
		},

		/**
		 * builds charts for all questions
		 * @param {array} aQuestions questions of form
		 */
		constructContent: function (aQuestions) {
			// sort questions by sequence
			aQuestions.sort(function (a, b) {
				return a.Sequence - b.Sequence;
			});

			// clear UI content
			if (this.getView().byId("StatContainer").getItems().length > 0) {
				this.getView().byId("StatContainer").removeAllItems();
			}

			// create user statistic part
			var oTitle = new sap.m.Title({
				text: this.getResourceBundle().getText("labelUserStatistic"),
				wrapping: true
			}).addStyleClass("sapUiResponsiveMargin").addStyleClass("boldText");
			this.aContent.push(oTitle);

			oTitle = new sap.m.Title({
				text: this.getResourceBundle().getText("labelUsersComplete", [this.getModel("detailView").getProperty("/UserCount")]),
				wrapping: true
			}).addStyleClass("sapUiResponsiveMargin");
			this.aContent.push(oTitle);

			this.aContent.push(this.getDoneStatistic());

			// create answer statistic part
			oTitle = new sap.m.Title({
				text: this.getResourceBundle().getText("labelAnswerStatistic"),
				wrapping: true
			}).addStyleClass("sapUiResponsiveMargin").addStyleClass("boldText");
			this.aContent.push(oTitle);

			// create UI content for each question
			for (var i = 0; i < aQuestions.length; i++) {
				var questionId = aQuestions[i].Id;

				var aAnswers = this.getAnswersForQuestionId(questionId);

				//depending on the Type of the Answer
				if (aAnswers[0] && aAnswers[0].Answer === "") {
					this.handleTypes(aAnswers, this.getOptionsForQuestionId(questionId), aQuestions[i], i);
				} else {
					// use aUserAnswerSet.Answer;
					this.handleTypes(aAnswers, /*PossibleAnswersSet not needed?*/ undefined, aQuestions[i], i);
				}
			}

			// add all content items to view
			this.aContent.forEach((obj) => this.getView().byId("StatContainer").addItem(obj));

			this.getModel("detailView").setProperty("/busy", false);
		},

		/**
		 * creates chart for user completion
		 * returns {sap.suite.ui.commons.ChartContainer} chart for user completions per day
		 */
		getDoneStatistic: function () {
			// sort surveys by date of done
			this.aSurveys = this.aSurveys.sort((a, b) => new Date(a.DoneAt) - new Date(b.DoneAt));

			var chartValues = [];

			for (var i = 0; i < this.aSurveys.length; i++) {
				var doneDate = new Date(this.aSurveys[i].DoneAt).toLocaleDateString();

				// find entry for DoneAt in array used for display
				var chartItem = chartValues.filter(oChartItem => oChartItem.DoneDate === doneDate);

				if (chartItem.length > 0) {
					chartItem[0].count++;
				} else {
					chartValues.push({
						DoneDate: doneDate,
						count: 1
					});
				}
			}

			var vizFrames = {
				config: {
					height: "400px",
					width: "100%",
					uiConfig: {
						applicationSet: "fiori"
					},
					vizProperties: {
						title: {
							text: this.getResourceBundle().getText("labelUserCompletion")
						}
					}
				},
				userCompletion: {
					icon: "sap-icon://vertical-bar-chart",
					title: "Bar Chart",
					dataset: {
						dimensions: [{
							name: this.getResourceBundle().getText("labelReadyOn"),
							value: "{DoneDate}"
						}],
						measures: [{
							name: this.getResourceBundle().getText("labelUserCount"),
							value: "{count}"
						}],
						data: {
							path: "/"
						}
					},
					feedItems: [{
						uid: "valueAxis",
						type: "Measure",
						values: [this.getResourceBundle().getText("labelUserCount")]
					}, {
						uid: "categoryAxis",
						type: "Dimension",
						values: [this.getResourceBundle().getText("labelReadyOn")]
					}],
					vizType: "column"
				}
			};

			var oCountryVizFrame = vizFrames.userCompletion;

			var oContent = new sap.suite.ui.commons.ChartContainerContent({
				icon: oCountryVizFrame.icon,
				title: oCountryVizFrame.title,
				content: this._createVizFrame(oCountryVizFrame, vizFrames, chartValues)
			});

			var smartChart = new sap.suite.ui.commons.ChartContainer();
			smartChart.addStyleClass("vizFrameBackground");
			smartChart.addContent(oContent);

			return smartChart;
		},

		/**
		 * Creates a Viz Frame based on the passed config.
		 *
		 * @param {object} vizFrameConfig Viz Frame config
		 * @returns {sap.viz.ui5.controls.VizFrame} Created Viz Frame
		 */
		_createVizFrame: function (vizFrameConfig, vizFrames, chartValues) {
			var oVizFrame = new sap.viz.ui5.controls.VizFrame(vizFrames.config);
			var oModel = new JSONModel();
			oModel.setData(chartValues);
			var oDataSet = new sap.viz.ui5.data.FlattenedDataset(vizFrameConfig.dataset);

			oVizFrame.setDataset(oDataSet);
			oVizFrame.setModel(oModel);
			this._addFeedItems(oVizFrame, vizFrameConfig.feedItems);
			oVizFrame.setVizType(vizFrameConfig.vizType);
			return oVizFrame;
		},

		/**
		 * Adds the passed feed items to the passed Viz Frame.
		 *
		 * @private
		 * @param {sap.viz.ui5.controls.VizFrame} vizFrame Viz Frame to add feed items to
		 * @param {object[]} feedItems Feed items to add
		 */
		_addFeedItems: function (vizFrame, feedItems) {
			for (var i = 0; i < feedItems.length; i++) {
				vizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem(feedItems[i]));
			}
		},

		/**
		 * adds chart to view content
		 * @param {object} oQuestion current question
		 * @param {object} oItem chart container
		 * @param {bool} bForDonut identicates, if chart is donut or not
		 * @param {integer} iNumber number of question, started with 0
		 */
		addToViewArray: function (oQuestion, oItem, bForDonut = false, iNumber) {
			var oFlexBox = new sap.m.FlexBox({
				height: (bForDonut ? "10rem" : "auto"),
				alignItems: "Center",
				justifyContent: "Start",
				items: [oItem]
			}).addStyleClass("sapUiResponsiveMargin");

			var oTitle = new sap.m.Title({
				text: (iNumber + 1) + ". " + oQuestion.Question + (oQuestion.Mandatory ? "*" : ""),
				wrapping: true
			}).addStyleClass("sapUiResponsiveMargin").addStyleClass("boldText");
			this.aContent.push(oTitle);
			this.aContent.push(oFlexBox);
		},

		/**
		 * creates table for 'Simple Short' and 'Simple Long' question type
		 * @param {array} aAnswers answers related to question
		 * returns {sap.m.VBox} VBox contained a Table
		 */
		constructFreeTextList: function (aAnswers) {
			var aUserAnswersSet = [];
			var counts = {};

			for (var c1 = 0; c1 < aAnswers.length; c1++) {
				aUserAnswersSet.push(aAnswers[c1].Answer);
			}
			aUserAnswersSet.forEach(function (x) {
				counts[x] = (counts[x] || 0) + 1;
			});
			counts = Object.entries(counts);

			var aColumns = [
				new sap.m.Column({
					header: new sap.m.ObjectIdentifier({
						title: this.getResourceBundle().getText("colComment")
					}),
					width: "auto",
					visible: true
				}),
				new sap.m.Column({
					header: new sap.m.ObjectIdentifier({
						title: this.getResourceBundle().getText("colCount")
					}),
					width: "100px",
					visible: true
				})
			];

			var oTableModel = new JSONModel();
			oTableModel.setData({
				columns: aColumns,
				rows: counts
			});

			var oTable = new sap.m.Table();
			oTable.setModel(oTableModel);

			oTable.bindAggregation("columns", "/columns", function (index, context) {
				var sColumnname = context.getObject().getAggregation("header").getProperty("title");

				return new sap.m.Column({
					header: new sap.m.Label({
						text: sColumnname
					}),
					width: context.getObject().getProperty("width")
				});
			});

			oTable.bindItems("/rows", function (index, context) {
				var obj = context.getObject();
				var row = new sap.m.ColumnListItem();

				var textView = new sap.m.TextArea({
					width: "100%",
					value: obj[0],
					editable: false,
					enabled: false
				});
				textView.addStyleClass("transparentBackground");

				row.addCell(textView);
				row.addCell(new sap.m.Label({
					text: obj[1],
					design: "Bold"
				}));
				return row;
			});

			var vBox = new sap.m.VBox();
			vBox.addStyleClass("lightGrayBorder");
			vBox.addItem(oTable);

			return vBox;
		},

		/**
		 * creates chart for 'Single Select', 'Multiple Choise' or 'Drop Down List' question type
		 * @param {array} aAnswers answers related to question
		 * @param {array} aOptions options related to question
		 * returns {sap.suite.ui.microchart.InteractiveBarChart} chart for question type
		 */
		constructBarChart: function (aAnswers = [], aOptions = []) {
			var aOptionIds = aOptions.filter(oOption => oOption.Deleted === false).map(oOption => oOption.Id);
			aAnswers = aAnswers.filter(oAnswer => aOptionIds.includes(oAnswer.OptionId));

			//BarChart:
			var oBarChart = new sap.suite.ui.microchart.InteractiveBarChart({
				displayedBars: aOptions.length, //default is 3
				selectionEnabled: false
			});
			var counter;
			for (var c1 = 0; c1 < aOptions.length; c1++) {
				counter = 0;
				for (var c2 = 0; c2 < aAnswers.length; c2++) {
					if (aAnswers[c2].SelectedAnswer.Id === aOptions[c1].Id) {
						counter++;
					}
				}
				aOptions[c1].count = counter;
			}

			//Calc percentage
			for (var c3 = 0; c3 < aOptions.length; c3++) {
				aOptions[c3].percentage = aOptions[c3].count / aAnswers.length * 100;
			}

			for (var i = 0; i < aOptions.length; i++) {
				var oBar = new sap.suite.ui.microchart.InteractiveBarChartBar({
					color: sap.m.ValueColor.Neutral, //Error, Critical, Good
					label: aOptions[i].Answer,
					value: aOptions[i].count,
					displayedValue: this.formatNumber(aOptions[i].percentage) + "%"
				});
				oBarChart.addBar(oBar);
			}

			oBarChart.addStyleClass("greenBar");

			return oBarChart;
		},

		/**
		 * rounds number to 2 digits
		 * @param {double} number value
		 * returns {double} rounded value to 2 digits
		 */
		formatNumber: function (number) {
			return (Math.round(number * 100) / 100).toFixed(2);
		},

		/**
		 * creates chart for 'Yes/No' question type
		 * @param {array} aAnswers answers related to question
		 * returns {sap.suite.ui.microchart.InteractiveDonutChart} chart for question type
		 */
		constructDonutChart: function (aAnswers) {
			if (!aAnswers || aAnswers.length <= 0) {
				return null;
			}
			//DonutChart:
			var oDonutChart = new sap.suite.ui.microchart.InteractiveDonutChart({
				selectionEnabled: false
			});
			oDonutChart.setDisplayedSegments(2); //default is 3, this is yes/no there are 2

			var yesCount = 0;
			var noCount = 0;
			for (var i = 0; i < aAnswers.length; i++) {
				if (aAnswers[i].Answer === "1") {
					yesCount++;
				} else if (aAnswers[i].Answer === "0") {
					noCount++;
				}
			}

			//Calc percentage
			var yesPerc = yesCount / aAnswers.length * 100;
			var noPerc = noCount / aAnswers.length * 100;

			var oSegment = new sap.suite.ui.microchart.InteractiveDonutChartSegment({
				color: sap.m.ValueColor.Good, //Error, Critical, Good
				label: this.getResourceBundle().getText("yesCount", [yesCount]),
				value: yesCount,
				displayedValue: this.formatNumber(yesPerc) + "%"
			});
			oDonutChart.addSegment(oSegment);

			oSegment = new sap.suite.ui.microchart.InteractiveDonutChartSegment({
				color: sap.m.ValueColor.Error, //Error, Critical, Good
				label: this.getResourceBundle().getText("noCount", [noCount]),
				value: noCount,
				displayedValue: this.formatNumber(noPerc) + "%"
			});
			oDonutChart.addSegment(oSegment);

			return oDonutChart;
		},

		/**
		 * creates chart for '5-star' question type
		 * @param {array} aAnswers answers related to question
		 * returns {sap.m.VBox} VBox contained RatindIndicator
		 */
		constructRatingIndicator: function (aAnswers) {
			//number of possible Answers = 5
			var oItems = [];
			for (var cnt = 1; cnt < 6; cnt++) {
				var result = aAnswers.filter(oAnswer => oAnswer.Answer === cnt.toString());
				var oLabel = new sap.m.Label({
					text: result.length,
					design: "Bold"
				});
				var oRatingIndicator = new sap.m.RatingIndicator({
					maxValue: 5,
					value: cnt,
					displayOnly: false,
					enabled: false
				}).addStyleClass("sapUiTinyMarginEnd");

				// set color for RatingIndicator
				if (cnt === 1) {
					oRatingIndicator.addStyleClass("redStar");
				} else if (cnt === 2) {
					oRatingIndicator.addStyleClass("orangeStar");
				} else if (cnt === 3) {
					oRatingIndicator.addStyleClass("yellowStar");
				} else if (cnt === 4) {
					oRatingIndicator.addStyleClass("lightGreenStar");
				} else if (cnt === 5) {
					oRatingIndicator.addStyleClass("darkGreenStar");
				}

				oItems.push(
					new sap.m.HBox({
						items: [oRatingIndicator, oLabel]
					}).addStyleClass("sapUiTinyMarginBottom")
				);
			}
			var oVBox = new sap.m.VBox({
				items: [oItems]
			});
			return oVBox;
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
			this.getModel("appView").setProperty("/FlexBoxDirection", "Column");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			// oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						// oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		/** 
		 * event fired by 'change' of binding
		 */
		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				return;
			}
		},

		/** 
		 * event fired by as soon as metadata loaded
		 */
		_onMetadataLoaded: function () {
			var oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
		},

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function () {
			sap.ui.getCore().getEventBus().publish("_deselectMasterSelection", "detailClose", {});
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getRouter().navTo("master");
		},

		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function () {
			var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (bFullScreen) {
				// reset to previous layout
				this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
			} else {
				// store current layout and go full screen
				this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
				this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			}
		}
	});
});