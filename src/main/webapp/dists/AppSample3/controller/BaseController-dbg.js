sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History"],function(e,t){"use strict";var n={"sap.m.Input":"value","sap.m.Select":"selectedKey","sap.m.CheckBox":"selected","sap.m.DatePicker":"dateValue","sap.m.DateTimePicker":"value","sap.m.TextArea":"value","sap.m.Switch":"state"};return e.extend("com.mjzsoft.UserSurveys.controller.BaseController",{getRouter:function(){return this.getOwnerComponent().getRouter()},getModel:function(e){return this.getView().getModel(e)},setModel:function(e,t){return this.getView().setModel(e,t)},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},onNavBack:function(){var e=t.getInstance().getPreviousHash(),n=sap.ushell.Container.getService("CrossApplicationNavigation");if(e!==undefined||!n.isInitialNavigation()){history.go(-1)}else{this.getRouter().navTo("master",{},true)}},onInputChange:function(e){if(e){var t=e.getSource(),r=t.getBindingContext();if(r!==null){var i=function(e){var t=e.substring(1),n=e.charAt(0).toUpperCase(),r="get"+n+t;return r},a=t.getMetadata().getName(),s=r.getModel(),o=t.getBinding(n[a]).getPath(),u=o&&o.startsWith("/")?o.substring(1):o,l=r.getPath()+"/"+u,g=i(n[a]),c=t[g]();if(t.getBindingContext()){if(a==="sap.m.DatePicker"){if(c){s.setProperty(l,new Date(c))}else{s.setProperty(l,null)}}else if(a==="sap.m.DateTimePicker"){if(c){s.setProperty(l,new Date(t.getDateValue()))}else{s.setProperty(l,null)}}else{s.setProperty(l,c)}}}this._oValidator.validate(t)}},getFieldValueByType:function(e){var t=function(e){var t=e.substring(1),n=e.charAt(0).toUpperCase(),r="get"+n+t;return r},r=e.getMetadata().getName(),i=t(n[r]),a=e[i]();return a},getBatchObject:function(e,t){var n=jQuery.extend({},e);delete n.__metadata;if(t==="Form"){delete n.Icon;delete n.Questions;delete n.Surveys}else if(t==="Question"){delete n.Answers;delete n.SourceConditions;delete n.TargetConditions;delete n.Form;delete n.Options;delete n.Qtype}else if(t==="Option"){delete n.Answers;delete n.Question}return n}})});