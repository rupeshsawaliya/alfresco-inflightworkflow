define([ "dojo/_base/declare", "alfresco/core/Core", "dojo/_base/lang",
		"alfresco/core/CoreXhr", "service/constants/Default",
		"dojo/_base/array", "alfresco/dialogs/AlfDialog",
		"dojo/string"], function(
		declare, Core, lang, CoreXhr, AlfConstants, array, AlfDialog, string) {
	return declare([ Core, CoreXhr ], {
		constructor : function agenda_services_AgendaService__constructor(args) {
			lang.mixin(this, args);
			
			this.alfSubscribe("AUTO_SELECT_FEED_REQUEST", lang.hitch(this,
					this.onAutoSelectFeedRequest));
			
		},
		// Call repo webscript and generate options for DynamicAutoSuggest component 
		onAutoSelectFeedRequest : function agenda_services_AgendaService__onAutoSelectFeedRequest(payload) {
			var lblResult = payload.labelAttribute;
			var valResult = payload.valueAttribute;
			this.serviceXhr({
				url : AlfConstants.PROXY_URI + "api/people?filter=",
	            method : "GET",				
	            alfTopic: payload.alfResponseTopic || null,
                alfResponseScope: payload.alfResponseScope,
                successCallback : function(response, originalRequestConfig){
                	
                	var result = lang.getObject("people", false, response);
	       	         var options = [];
	       	         array.forEach(result, function(res) {
	       	        	var obj = {};
	       	        	obj[payload.labelAttribute] = res[lblResult];
	       	        	obj[payload.valueAttribute] = res[valResult];
	       	        	options.push(obj);
	       	         });
	       	         payload.store.fixed=options;
                },
	            callbackScope: this
	         });
		}
	});
});
