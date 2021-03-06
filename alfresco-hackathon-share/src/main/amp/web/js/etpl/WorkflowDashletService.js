define([ "dojo/_base/declare", "alfresco/core/Core", "dojo/_base/lang",
		"alfresco/core/CoreXhr", "service/constants/Default",
		"dojo/_base/array", "alfresco/dialogs/AlfDialog"], function(
		declare, Core, lang, CoreXhr, AlfConstants, array, AlfDialog) {
	return declare([ Core, CoreXhr ], {
		
		cssRequirements: [{cssFile:"./WorkflowDashletStyle.css"}],
		
		constructor : function etpl_WorkflowDashletService__constructor(args) {
			lang.mixin(this, args);
			this.alfSubscribe("ETPL_REASSIGN_TASK_TO_USER", lang.hitch(this,
					this.reassignTaskToUser));
		},
		
		reassignTaskToUser : function etpl_WorkflowDashletService__reassignTaskToUser(
				payload) {
			
			console.log("test : " + payload);
			
			if(payload.userName !== 'select')
			{
			this.serviceXhr({
				url : AlfConstants.PROXY_URI + "api/task-instances/" + payload.taskId,
				method : "PUT",
				data : {
					pubSubScope: payload.pubSubScope,
					cm_owner: payload.userName
				},
				successCallback : this.onSuccess,
				callbackScope : this
			});
			}
		},
		
		onSuccess : function etpl_WorkflowDashletService__onSuccess(response,
			    originalRequestConfig) {

			   var pubSubScope = lang.getObject("data.pubSubScope", false,
			     originalRequestConfig);
			   if (pubSubScope == null) {
			    pubSubScope = "";
			   }
			   //alert("In sucess");
			   //alert(pubSubScope);
			   //this.alfPublish(pubSubScope + "ALF_DOCLIST_RELOAD_DATA");
			   this.alfPublish(pubSubScope + "ALF_DOCLIST_RELOAD_DATA");
			   this.alfPublish("ALF_DOCLIST_RELOAD_DATA");
			  }

	});

});