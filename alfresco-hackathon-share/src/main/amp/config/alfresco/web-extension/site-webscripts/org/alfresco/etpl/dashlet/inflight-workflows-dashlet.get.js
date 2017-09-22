




var options = [];
var result = remote.call("/api/people?filter=");
if (result.status.code == status.STATUS_OK) {
	var rawData = JSON.parse(result);
	if (rawData && rawData.people) {
		var people = rawData.people;
		
		options.push({
			value : "select",
			label : "--Select--"
		});
		
		for (var i = 0; i < people.length; i++) {
			options.push({
				value : people[i].userName,
				label : people[i].firstName + " " + people[i].lastName
			});
		}
	}
}
var date = new Date();
var todayDate = date.toISOString();
model.jsonModel = {
	services : [
	// "alfresco/services/DashletService",
	// "alfresco/services/NotificationService",
	"alfresco/services/NavigationService", "alfresco/services/DialogService",
			"etpl/WorkflowDashletService","etpl/services/AgendaService",
			// "alfresco/services/CrudService",
			// "alfresco/services/DocumentService"
			{
				name : "alfresco/services/DocumentService",
				config : {
					pubSubScope : ""
				}
			}, {
				name : "alfresco/services/CrudService",
				config : {
					pubSubScope : ""
				}
			} ],
	rootNodeId : args.htmlid,
	// pubSubScope: instance.object.id,
	widgets : [ {
		name : "alfresco/dashlets/Dashlet",
		config : {
			additionalCssClasses : "mediumpad",
			title : "In-Flight Workflow",
			componentId : instance.object.id,
			bodyHeight : args.height,
			widgetsForToolbar : [ {
				id : "IN-FLIGHT_DASHLET_TOOLBAR",
				name : "alfresco/html/Label",
				config : {
					label : ""
				}
			} ],
			widgetsForBody : [ {
				name : "alfresco/layout/InfiniteScrollArea",
				config : {
					scrollTolerance : 200,
					widgets : [ {
						name : "alfresco/documentlibrary/AlfDocumentList",
						config : {
							useHash : false,
							useInfiniteScroll : true,
							// currentPageSize: 10,
							// rootNode: "/app:company_home/cm:sow_repo",
							// currentFilter: {
							// filter: "treenode"
							// },
							loadDataPublishTopic : "ALF_CRUD_GET_ALL",
							loadDataPublishPayload : {
								// url : "api/groups"
								// url:
								// "api/task-instances?properties=bpm_priority,bpm_status,bpm_dueDate,bpm_description&exclude=wcmwf:*&skipCount=0&maxItems=50&pooledTasks=false&state=IN_PROGRESS"
								// url :
								// "api/workflow-instances?exclude=jbpm$wcmwf:*,jbpm$wf:articleapproval,activiti$publishWebContent,jbpm$publishWebContent,jbpm$inwf:invitation-nominated,jbpm$imwf:invitation-moderated,activiti$activitiInvitationModerated,activiti$activitiInvitationNominated,activiti$activitiInvitationNominatedAddDirect&skipCount=0&maxItems=50&status=ACTIVE"
								// url :
								// "api/task-instances?properties=bpm_priority,bpm_status,bpm_dueDate,bpm_description&exclude=wcmwf:*&skipCount=0&maxItems=50"
								url : "get-all-active-workflows"
							},
							// itemsProperty: "data",
							itemsProperty : "data",
							// waitForPageWidgets: false,
							widgets : [ {
								name : "alfresco/documentlibrary/views/AlfDocumentListView",
								config : {
									additionalCssClasses : "bordered",
									widgetsForHeader : [
											{
												name : "alfresco/lists/views/layouts/HeaderCell",
												config : {
													title : "Workflow Message",
													label : "Workflow Message",
												}
											},
											{
												name : "alfresco/lists/views/layouts/HeaderCell",
												config : {
													title : "Workflow Priority",
													label : "Workflow Priority",
												}
											},
											{
												name : "alfresco/lists/views/layouts/HeaderCell",
												config : {
													title: "Workflow Due Date",
													label : "Workflow Due Date",
												}
											},
											{
												name : "alfresco/lists/views/layouts/HeaderCell",
												config : {
													title : "Tasks ID",
													label : "Tasks ID",
												}
											},

											{
												name : "alfresco/lists/views/layouts/HeaderCell",
												config : {
													title : "Task Status",
													label : "Status",
												}
											},

											{
												name : "alfresco/lists/views/layouts/HeaderCell",
												config : {
													title : "Task Owner",
													label : "Owner",
												}
											},

											{
												name : "alfresco/lists/views/layouts/HeaderCell",
												config : {
													title : "Re-assign user for task ",
													label : "Reassign",
												}
											} ],
									widgets : [ {
										name : "alfresco/lists/views/layouts/Row",
										config : {
											/*renderFilterMethod: "ALL",
					                         renderFilter: [
					                            {
					                               property: "shortName",
					                               values: ["ALFRESCO_ADMINISTRATORS"],
					                               negate: true
					                            }
					                         ],*/
											widgets : [
													{
														name : "alfresco/lists/views/layouts/Cell",
														config : {
															additionalCssClasses : "mediumpad",
															widgets : [ {
																name : "alfresco/renderers/PropertyLink",
																config : {
																	title : "Workflow Message",
																	additionalCssClasses:"propertyUnderLine",
																	propertyToRender : "workflowMessage",
																	placeHolder : "Filter by workflow id",
																	publishTopic : "ALF_NAVIGATE_TO_PAGE",
																	publishPayloadType : "PROCESS",
																	useCurrentItemAsPayload : false,
																	publishPayloadModifiers : [ "processCurrentItemTokens" ],
																	publishPayload : {
																		url : "workflow-details?workflowId={workflowId}&referrer=workflows&myWorkflowsLinkBack=true",
																		type : "SHARE_PAGE_RELATIVE",
																		target : "CURRENT"
																	}
																}
															} ]
														}
													},

													{
														name : "alfresco/lists/views/layouts/Cell",
														config : {
															additionalCssClasses : "mediumpad",
															widgets : [ {
																name : "alfresco/renderers/Property",
																config : {
																	title : "Workflow Priority",
																	propertyToRender : "priority"
																}
															} ]
														}
													},

													{
														name : "alfresco/lists/views/layouts/Cell",
														config : {
															additionalCssClasses : "mediumpad",
															widgets : [ {
																name : "alfresco/renderers/Property",
																config : {
																	title : "Workflow Due Date",
																	propertyToRender : "dueDate",
																}
															}
															]
														}
													},
													
													{
														name : "alfresco/lists/views/layouts/Cell",
														config : {
															additionalCssClasses : "mediumpad",
															widgets : [ {
																name : "alfresco/renderers/PropertyLink",
																config : {
																	title : "Task ID",
																	additionalCssClasses:"propertyUnderLine",
																	propertyToRender : "id",
																	placeHolder : "Filter by task id",
																	publishTopic : "ALF_NAVIGATE_TO_PAGE",
																	publishPayloadType : "PROCESS",
																	useCurrentItemAsPayload : false,
																	publishPayloadModifiers : [ "processCurrentItemTokens" ],
																	publishPayload : {
																		url : "task-edit?taskId=activiti${id}",
																		type : "SHARE_PAGE_RELATIVE",
																		target : "CURRENT"
																	}
																}
															} ]
														}
													},
													
													{
														name : "alfresco/lists/views/layouts/Cell",
														config : {
															additionalCssClasses : "mediumpad",
															widgets : [
																	{
																		name : "alfresco/renderers/Property",
																		config : {
																			title : "Task Status",
																			propertyToRender : "status",
																			renderOnNewLine : true
																		}
																	} ]
														}
													},
													
													{
														name : "alfresco/lists/views/layouts/Cell",
														config : {
															additionalCssClasses : "mediumpad",
															widgets : [ {
																name : "alfresco/renderers/Property",
																config : {
																	title : "Task Owner",
																	propertyToRender : "owner",
																}
															} ]
														}
													},
													
													{
														name : "alfresco/lists/views/layouts/Cell",
														config : {
															additionalCssClasses : "mediumpad",
															widgets : [ {
																//name : "alfresco/renderers/PropertyLink",
																name : "alfresco/renderers/PublishAction",
																config : {
																	title : "Re-assign user for task ",
																	//label : "Re-assign user for task ",
																	//additionalCssClasses: "propertyButton",
																	//renderedValue : "RE-ASSIGN",
																	iconClass : "category-16",
																	//highlightProperty :"True",
																	//deemphasized :true,
																	//highlightValue :"RE-ASSIGN",
																	//propertyToRender : "id",
																	useCurrentItemAsPayload : false,
																	publishTopic : "ALF_CREATE_DIALOG_REQUEST",
																	publishPayloadType : "PROCESS",
																	publishPayloadModifiers : [ "processCurrentItemTokens" ],
																	publishPayload : {
																		dialogTitle : "Workflow Message : {workflowMessage}",
																		fixedWidth : true,
																		widgetsContent : [
																				{
																					name : "alfresco/forms/Form",
																					config : {
																						okButtonLabel : "Assign",
																						okButtonPublishTopic : "ETPL_REASSIGN_TASK_TO_USER",
																						okButtonPublishPayload : {
																							taskId : "activiti${id}",
																							pubSubScope : "GROUP_USERS_"
																						},
																						okButtonPublishGlobal : true,
																						showCancelButton : false,
																						widgets : [
																						           {
																							name : "alfresco/forms/controls/Select",
																							config : {
																								label : "User",
																								description : "Select re-assignee for Task:{id}",
																								name : "userName",
																								optionsConfig : {
																									fixed : options
																								}
																							}
																						} 
																						           /*{
   id: "FILTERING_SELECT",
   name: "alfresco/forms/controls/FilteringSelect",
   config: {
      fieldId: "FILTERING_SELECT_1",
      name: "person",
      label: "Select a person",
      description: "The people options are provided by the OptionsService, but can be filtered via the ServiceStore",
      optionsConfig: {
         queryAttribute: "label",
         labelAttribute: "label",
         valueAttribute: "value",
         publishTopic: "ALF_GET_FORM_CONTROL_OPTIONS",
         publishPayload: {
            resultsProperty: "options",
            url: url.context + "/proxy/alfresco/api/people",
            itemsAttribute: "people",
            labelAttribute: "userName",
            valueAttribute: "userName"
         }
      }
   }
}*/
																						           
																						           /*{
																										name : "etpl/widgets/DynamicAutoSuggest",
																										config : {
																											label : "User",
																											description : "Select a User",
																											name : "userName",
																											optionsConfig : {
																												queryAttribute : "firstName",
																												labelAttribute : "firstName",
																												valueAttribute : "userName"
																												//fixed : options
																											}
																										}
																									}*/ ]
																					}
																				}
																				
																				]
																	}
																}
															} ]
														}
													}
													
													
													]
										}
									} ]
								}
							} ]
						}
					} ]
				}
			} ]
		}
	} ]
};	