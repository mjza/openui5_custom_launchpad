sap.ui.define(["./BaseController","../model/formatter","../utils/Utils","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/MessageToast","../model/individualFormatter"],function(e,t,s,r,i,o,n){"use strict";return e.extend("com.mjzsoft.Survey.controller.Worklist",{formatter:t,onInit:function(){this._initViewModel();this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatched,this)},onPress:function(e){var t=e.getSource().getBindingContext().getObject(),s=t.FormId,r=e.getSource(),u=new i("FormId",o.EQ,s);if(e.getSource().getTileContent()[0].getFooterColor()==="Error"){n.show(this.getResourceBundle().getText("MsgInvalid"));return}this.startAppBusy();this._readQuestionsForUsers(u,r)},onNavBack:function(){history.go(-1)},onFormsRequested:function(){this.startAppBusy()},onFormsReceived:function(e){var t=e.getSource(),s=t.getFilterInfo();if(s.type==="Logical"){this.stopAppBusy()}},_onObjectMatched:function(e){this._readUserSurveySet()},_initViewModel:function(){this._oViewModel=this._initWorklistViewModel();this.setModel(this._oViewModel,"viewModel")},_initWorklistViewModel:function(){return new r({dialogBusy:true,flexBoxVisible:false,imageUrl:"",UserName:""})},_readQuestionsForUsers:function(e,t){s.readData(this.getModel(),"/QuestionSet",{},[e]).then(e=>{if(e.results.length<1){var s=this.getResourceBundle();n.show(s.getText("msgNoQuestions"));this.stopAppBusy()}else{this._navigateToObjectFromWorklist(t)}}).fail(()=>{this.stopAppBusy()})},_navigateToObjectFromWorklist:function(e){var t=e.getTileContent()[0].getFooter(),s=e.getBindingContext(),r=s.getProperty("FormId"),i=s.getProperty("UserId"),o=s.getProperty("Id"),n=0;if(this.getResourceBundle().getText("statusFinish")===t){n=1}this.getRouter().navTo("object",{objectId:r,finished:n,userID:i,sUserSurveyID:o})},_filterFlexBoxes:function(e){var t=[new i({filters:[new i("UserId",o.EQ,e),new i("Form/Deleted",o.EQ,false)],and:true})];this.byId("flexBox").getBinding("items").filter(t,"Application")},_updateView:function(){var e=this.getOwnerComponent().getCurrentUser();this._oViewModel.setProperty("/UserName",e.firstName+" "+e.lastName);this._oViewModel.setProperty("/flexBoxVisible",true);this._filterFlexBoxes(e.id)},_readUserSurveySet:function(){var e=this.getModel(),t=this.getOwnerComponent().getCurrentUser(),r="/SurveySet",n={$expand:"Form, User"},u=new i({filters:[new i("UserId",o.EQ,t.id),new i("Form/Deleted",o.EQ,false)],and:true});this.startAppBusy();s.readData(e,r,n,[u]).then(e=>{var t=e.results;this._readFormSet(t)}).fail(()=>{this.stopAppBusy()})},_readFormSet:function(e){var t=this.getModel(),r="/FormSet",n=new i({filters:[new i("Universal",o.EQ,true),new i("Deleted",o.EQ,false)],and:true});this.iNumberOfDoneRequests=0;s.readData(t,r,{},[n]).then(t=>{this._createPropertiesForSurvey(t.results,e)}).fail(()=>{this.stopAppBusy()})},_createPropertiesForSurvey:function(e,t){var s=this.getOwnerComponent(),r=s.getCurrentUser(),i="mjzsoftadd1"+(new Date).getTime(),o;for(var n=0;n<e.length;n++){var u=e[n],a=u.ValidTo,l=new Date,d=true;for(var h=0;h<t.length;h++){if(u.Id===t[h].Form.Id){d=false;break}}if(l>a){d=false}if(d){o={FormId:u.Id,UserId:""+r.id};this.iNumberOfDoneRequests++;this._createRequestForAssigningMissingSuervey(o,i)}}if(this.iNumberOfDoneRequests===0){this._updateView()}},_createRequestForAssigningMissingSuervey:function(e,t){var s=this.getModel();s.create("/SurveySet",e,{groupId:t,success:(e,t)=>{this.iNumberOfDoneRequests--;if(this.iNumberOfDoneRequests===0){this._updateView()}},error:e=>{this.iNumberOfDoneRequests--;this.stopAppBusy()}})}})});