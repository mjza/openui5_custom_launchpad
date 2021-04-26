sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,t){"use strict";return{initEmptyJSONModel:function(){return new e},createDeviceModel:function(){var i=new e(t);i.setDefaultBindingMode("OneWay");return i},createFLPModel:function(){var t=jQuery.sap.getObject("sap.ushell.Container.getUser"),i=t?t().isJamActive():false,a=new e({isShareInJamActive:i});a.setDefaultBindingMode("OneWay");return a},initAppViewModel:function(){return new e({busy:true,FlexBoxDirection:"Row",delay:0,layout:"OneColumn",previousLayout:"",actionButtonsInfo:{midColumn:{fullScreen:false}}})},initMasterViewModel:function(t){return new e({isFilterBarVisible:false,filterBarLabel:"",delay:0,title:t.getResourceBundle().getText("masterTitleCount",[0]),noDataText:t.getResourceBundle().getText("masterListNoDataText"),groupBy:"None",busy:false,FlexBoxDirection:"Row",allResources:""})},initDetailViewModel:function(){return new e({busy:false,delay:0,deleteBtnEnabled:false,tableBusy:false,filterBtnEnabled:true,groupBtnEnabled:true,sortBtnEnabled:true,bLocatioinTableVisible:false,bUserTableVisible:false,sFilter:"#Car",bUserTableBusy:false,title:"",LocationSearch:"",UserSearch:""})},initObjectViewModel:function(){return new e({titleDisplay:"",editBtnVisible:false,saveBtnVisible:false,cancelBtnVisible:false,viewMode:true,busy:false,EditMode:false,showFooter:true,showAdd:false,title:"",fullscreen:false,validMailState:sap.ui.core.ValueState.None,validDisplayNameState:sap.ui.core.ValueState.None,image:""})},initUserObjectViewModel:function(){return new e({title:"",viewMode:true,busy:false,icon:"",addMode:false,image:"",selectedKey:"1"})}}});