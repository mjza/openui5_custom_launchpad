sap.ui.define(["com/mjzsoft/QuestionnaireStatistics/controller/BaseController","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","com/mjzsoft/QuestionnaireStatistics/model/formatter"],function(e,t,a,s,n){"use strict";return e.extend("com.mjzsoft.QuestionnaireStatistics.controller.Detail",{formatter:n,aContent:[],aSurveys:[],aAnswers:[],aOptions:[],onInit:function(){var e=new t({busy:false,delay:0,atLeastSellectOneItemToAction:this.getResourceBundle().getText("atLeastSellectOneItemToAction")});this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched,this);this.setModel(e,"detailView");this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this))},readWithFilter:function(e,t,a){var s=jQuery.Deferred();if(!Array.isArray(t)){t=[t]}this.getOwnerComponent().getModel().read(e,{urlParameters:a,filters:t,success:s.resolve,error:s.reject});return s},setContentInitial:function(){this.aContent=[]},_onObjectMatched:function(e){if(!this.getOwnerComponent().getCurrentUser()||!this.getOwnerComponent().getCurrentUser().admin){this.getRouter().navTo("notAllowed",{},true);this.getModel("appView").setProperty("/layout","OneColumn")}else{var t=e.getParameter("arguments").objectId;this.getModel("appView").setProperty("/layout","TwoColumnsMidExpanded");this.getModel().metadataLoaded().then(function(){var e=this.getModel().createKey("FormSet",{Id:t});this._bindView("/"+e)}.bind(this));this.getView().getModel("detailView").setProperty("/busy",true);var n=[];n.push(new a("FormId",s.EQ,t));this.readWithFilter("/SurveySet",n,{}).then(e=>{this.setContentInitial();this.aSurveys=e.results.filter(e=>e.DoneAt!==null);this.getModel("detailView").setProperty("/UserCount",this.aSurveys.length);if(this.aSurveys.length===0){if(this.getView().byId("StatContainer").getItems().length>0){this.getView().byId("StatContainer").removeAllItems()}var n=new sap.m.Title({text:this.getResourceBundle().getText("noStatisticData"),wrapping:true}).addStyleClass("sapUiResponsiveMargin").addStyleClass("boldText");this.getView().byId("StatContainer").addItem(n);this.getView().getModel("detailView").setProperty("/busy",false);return}var r=[];r.push(new a("FormId",s.EQ,t));r.push(new a("Deleted",s.EQ,false));var i={$expand:"Qtype"};this.readWithFilter("/QuestionSet",r,i).then(e=>{var t=e.results;var n=[];t.forEach(function(e){n.push(new a("QuestionId",s.EQ,e.Id))});var r=[];this.aSurveys.forEach(function(e){r.push(new a("UserId",s.EQ,e.UserId))});if(n.length===0||r.length===0){return}var i=new a({filters:[new a({filters:n,and:false}),new a({filters:r,and:false})],and:true});this.readWithFilter("/AnswerSet",i,{$expand:"Question,Option"}).then(e=>{this.aAnswers=e.results;this.readWithFilter("/OptionSet",[],{$expand:"Question"}).then(e=>{this.aOptions=e.results;this.constructContent(t)}).fail(()=>{})}).fail(()=>{})}).fail(()=>{})}).fail(()=>{});sap.ui.getCore().getEventBus().publish("_refreshMasterSelection","formId",{formId:t})}},getOptionsForQuestionId:function(e){var t=[];for(var a=0;a<this.aOptions.length;a++){if(this.aOptions[a].QuestionId===e&&this.aOptions[a].Deleted===false){t.push(this.aOptions[a])}}return t},getAnswersForQuestionId:function(e){var t=[];for(var a=0;a<this.aAnswers.length;a++){if(this.aAnswers[a].Question.Id===e){t.push(this.aAnswers[a])}}return t},handleTypes:function(e,t,a,s){var n=a.Qtype.Id;var r={};var i=false;switch(n){case"QT1":r=this.constructRatingIndicator(e);break;case"QT2":r=this.constructDonutChart(e);if(r){i=true}break;case"QT3":r=this.constructBarChart(e,t);break;case"QT4":r=this.constructBarChart(e,t);break;case"QT5":r=this.constructFreeTextList(e);break;case"QT6":r=this.constructFreeTextList(e);break;case"QT7":r=this.constructBarChart(e,t);break;default:break}this.addToViewArray(a,r,i,s)},constructContent:function(e){e.sort(function(e,t){return e.Sequence-t.Sequence});if(this.getView().byId("StatContainer").getItems().length>0){this.getView().byId("StatContainer").removeAllItems()}var t=new sap.m.Title({text:this.getResourceBundle().getText("labelUserStatistic"),wrapping:true}).addStyleClass("sapUiResponsiveMargin").addStyleClass("boldText");this.aContent.push(t);t=new sap.m.Title({text:this.getResourceBundle().getText("labelUsersComplete",[this.getModel("detailView").getProperty("/UserCount")]),wrapping:true}).addStyleClass("sapUiResponsiveMargin");this.aContent.push(t);this.aContent.push(this.getDoneStatistic());t=new sap.m.Title({text:this.getResourceBundle().getText("labelAnswerStatistic"),wrapping:true}).addStyleClass("sapUiResponsiveMargin").addStyleClass("boldText");this.aContent.push(t);for(var a=0;a<e.length;a++){var s=e[a].Id;var n=this.getAnswersForQuestionId(s);if(n[0]&&n[0].Answer===""){this.handleTypes(n,this.getOptionsForQuestionId(s),e[a],a)}else{this.handleTypes(n,undefined,e[a],a)}}this.aContent.forEach(e=>this.getView().byId("StatContainer").addItem(e));this.getModel("detailView").setProperty("/busy",false)},getDoneStatistic:function(){this.aSurveys=this.aSurveys.sort((e,t)=>new Date(e.DoneAt)-new Date(t.DoneAt));var e=[];for(var t=0;t<this.aSurveys.length;t++){var a=new Date(this.aSurveys[t].DoneAt).toLocaleDateString();var s=e.filter(e=>e.DoneDate===a);if(s.length>0){s[0].count++}else{e.push({DoneDate:a,count:1})}}var n={config:{height:"400px",width:"100%",uiConfig:{applicationSet:"fiori"},vizProperties:{title:{text:this.getResourceBundle().getText("labelUserCompletion")}}},userCompletion:{icon:"sap-icon://vertical-bar-chart",title:"Bar Chart",dataset:{dimensions:[{name:this.getResourceBundle().getText("labelReadyOn"),value:"{DoneDate}"}],measures:[{name:this.getResourceBundle().getText("labelUserCount"),value:"{count}"}],data:{path:"/"}},feedItems:[{uid:"valueAxis",type:"Measure",values:[this.getResourceBundle().getText("labelUserCount")]},{uid:"categoryAxis",type:"Dimension",values:[this.getResourceBundle().getText("labelReadyOn")]}],vizType:"column"}};var r=n.userCompletion;var i=new sap.suite.ui.commons.ChartContainerContent({icon:r.icon,title:r.title,content:this._createVizFrame(r,n,e)});var o=new sap.suite.ui.commons.ChartContainer;o.addStyleClass("vizFrameBackground");o.addContent(i);return o},_createVizFrame:function(e,a,s){var n=new sap.viz.ui5.controls.VizFrame(a.config);var r=new t;r.setData(s);var i=new sap.viz.ui5.data.FlattenedDataset(e.dataset);n.setDataset(i);n.setModel(r);this._addFeedItems(n,e.feedItems);n.setVizType(e.vizType);return n},_addFeedItems:function(e,t){for(var a=0;a<t.length;a++){e.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem(t[a]))}},addToViewArray:function(e,t,a=false,s){var n=new sap.m.FlexBox({height:a?"10rem":"auto",alignItems:"Center",justifyContent:"Start",items:[t]}).addStyleClass("sapUiResponsiveMargin");var r=new sap.m.Title({text:s+1+". "+e.Question+(e.Mandatory?"*":""),wrapping:true}).addStyleClass("sapUiResponsiveMargin").addStyleClass("boldText");this.aContent.push(r);this.aContent.push(n)},constructFreeTextList:function(e){var a=[];var s={};for(var n=0;n<e.length;n++){a.push(e[n].Answer)}a.forEach(function(e){s[e]=(s[e]||0)+1});s=Object.entries(s);var r=[new sap.m.Column({header:new sap.m.ObjectIdentifier({title:this.getResourceBundle().getText("colComment")}),width:"auto",visible:true}),new sap.m.Column({header:new sap.m.ObjectIdentifier({title:this.getResourceBundle().getText("colCount")}),width:"100px",visible:true})];var i=new t;i.setData({columns:r,rows:s});var o=new sap.m.Table;o.setModel(i);o.bindAggregation("columns","/columns",function(e,t){var a=t.getObject().getAggregation("header").getProperty("title");return new sap.m.Column({header:new sap.m.Label({text:a}),width:t.getObject().getProperty("width")})});o.bindItems("/rows",function(e,t){var a=t.getObject();var s=new sap.m.ColumnListItem;var n=new sap.m.TextArea({width:"100%",value:a[0],editable:false,enabled:false});n.addStyleClass("transparentBackground");s.addCell(n);s.addCell(new sap.m.Label({text:a[1],design:"Bold"}));return s});var l=new sap.m.VBox;l.addStyleClass("lightGrayBorder");l.addItem(o);return l},constructBarChart:function(e=[],t=[]){var a=t.filter(e=>e.Deleted===false).map(e=>e.Id);e=e.filter(e=>a.includes(e.OptionId));var s=new sap.suite.ui.microchart.InteractiveBarChart({displayedBars:t.length,selectionEnabled:false});var n;for(var r=0;r<t.length;r++){n=0;for(var i=0;i<e.length;i++){if(e[i].SelectedAnswer.Id===t[r].Id){n++}}t[r].count=n}for(var o=0;o<t.length;o++){t[o].percentage=t[o].count/e.length*100}for(var l=0;l<t.length;l++){var d=new sap.suite.ui.microchart.InteractiveBarChartBar({color:sap.m.ValueColor.Neutral,label:t[l].Answer,value:t[l].count,displayedValue:this.formatNumber(t[l].percentage)+"%"});s.addBar(d)}s.addStyleClass("greenBar");return s},formatNumber:function(e){return(Math.round(e*100)/100).toFixed(2)},constructDonutChart:function(e){if(!e||e.length<=0){return null}var t=new sap.suite.ui.microchart.InteractiveDonutChart({selectionEnabled:false});t.setDisplayedSegments(2);var a=0;var s=0;for(var n=0;n<e.length;n++){if(e[n].Answer==="1"){a++}else if(e[n].Answer==="0"){s++}}var r=a/e.length*100;var i=s/e.length*100;var o=new sap.suite.ui.microchart.InteractiveDonutChartSegment({color:sap.m.ValueColor.Good,label:this.getResourceBundle().getText("yesCount",[a]),value:a,displayedValue:this.formatNumber(r)+"%"});t.addSegment(o);o=new sap.suite.ui.microchart.InteractiveDonutChartSegment({color:sap.m.ValueColor.Error,label:this.getResourceBundle().getText("noCount",[s]),value:s,displayedValue:this.formatNumber(i)+"%"});t.addSegment(o);return t},constructRatingIndicator:function(e){var t=[];for(var a=1;a<6;a++){var s=e.filter(e=>e.Answer===a.toString());var n=new sap.m.Label({text:s.length,design:"Bold"});var r=new sap.m.RatingIndicator({maxValue:5,value:a,displayOnly:false,enabled:false}).addStyleClass("sapUiTinyMarginEnd");if(a===1){r.addStyleClass("redStar")}else if(a===2){r.addStyleClass("orangeStar")}else if(a===3){r.addStyleClass("yellowStar")}else if(a===4){r.addStyleClass("lightGreenStar")}else if(a===5){r.addStyleClass("darkGreenStar")}t.push(new sap.m.HBox({items:[r,n]}).addStyleClass("sapUiTinyMarginBottom"))}var i=new sap.m.VBox({items:[t]});return i},_bindView:function(e){var t=this.getModel("detailView");this.getModel("appView").setProperty("/FlexBoxDirection","Column");this.getView().bindElement({path:e,events:{change:this._onBindingChange.bind(this),dataRequested:function(){t.setProperty("/busy",true)},dataReceived:function(){}}})},_onBindingChange:function(){var e=this.getView(),t=e.getElementBinding();if(!t.getBoundContext()){this.getRouter().getTargets().display("detailObjectNotFound");return}},_onMetadataLoaded:function(){var e=this.getModel("detailView");e.setProperty("/delay",0);e.setProperty("/busy",true)},onCloseDetailPress:function(){sap.ui.getCore().getEventBus().publish("_deselectMasterSelection","detailClose",{});this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen",false);this.getRouter().navTo("master")},toggleFullScreen:function(){var e=this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen",!e);if(e){this.getModel("appView").setProperty("/layout",this.getModel("appView").getProperty("/previousLayout"))}else{this.getModel("appView").setProperty("/previousLayout",this.getModel("appView").getProperty("/layout"));this.getModel("appView").setProperty("/layout","MidColumnFullScreen")}}})});