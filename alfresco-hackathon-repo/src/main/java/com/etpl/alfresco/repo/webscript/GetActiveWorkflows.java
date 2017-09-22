package com.etpl.alfresco.repo.webscript;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.repo.web.scripts.workflow.WorkflowModelBuilder;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.MutableAuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.workflow.WorkflowInstance;
import org.alfresco.service.cmr.workflow.WorkflowService;
import org.alfresco.service.namespace.NamespaceService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


/**
 * 
 * Get all active workflows and active tasks
 * @author Khushbu, Pradip
 *
 */
public class GetActiveWorkflows extends DeclarativeWebScript {

	private Log logger = LogFactory.getLog(GetActiveWorkflows.class);
	private ServiceRegistry serviceRegistry;

	public ServiceRegistry getServiceRegistry() {
		return serviceRegistry;
	}

	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}

	/**
	 * 
	 * Backend webscript which is responsible to get all active workflows and active tasks
	 * 
	 */
	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		Map<String, Object> modelData = new HashMap<>();
		Map<String, Object> jsonResponse = new HashMap<>();
		List<WorkflowInstance> activeWorkflows = getServiceRegistry().getWorkflowService().getActiveWorkflows();
		List<Map<String, Object>> activeTaskList = new ArrayList<>();
		WorkflowModelBuilder workflowModelBuilder = getWorkflowBuilder();
		
		for (WorkflowInstance workflowInstance : activeWorkflows) {
			
			String workflowInstanceId = workflowInstance.getId();
			try {
				Map<String, Object> allTasks = workflowModelBuilder.buildDetailed(workflowInstance, Boolean.TRUE);
				if (allTasks.size() > 0) {

					Gson gsonObj = new Gson();
					String jsonStr = gsonObj.toJson(allTasks);
					JsonElement jelement = new JsonParser().parse(jsonStr);
					JsonObject jobject = jelement.getAsJsonObject();

					activeTaskList.addAll(parseTask(jobject));
					logger.info("Number of Active tasks of workflow instance : " + activeTaskList.size());
				} else {
					logger.debug("No active tasks found for workflow instance : " + workflowInstanceId);
				}
			} catch (AccessDeniedException e) {
				logger.error("You are not allowed to view this workflow : " + workflowInstanceId);
			}
			


		}

		logger.info("Number of active workflows : " + activeTaskList.size());
		jsonResponse.put("data", activeTaskList);
		Gson gson = new GsonBuilder().create();
		modelData.put("data", gson.toJson(jsonResponse));
		return modelData;
	}

	/**
	 * 
	 * @return a workflowBuilder object so that we can get all the details of a workflow
	 */
	private WorkflowModelBuilder getWorkflowBuilder() {
		NamespaceService namespaceService = getServiceRegistry().getNamespaceService();
		NodeService nodeService = getServiceRegistry().getNodeService();
		MutableAuthenticationService authenticationService = getServiceRegistry().getAuthenticationService();
		PersonService personService = getServiceRegistry().getPersonService();
		WorkflowService workflowService = getServiceRegistry().getWorkflowService();
		DictionaryService dictionaryService = getServiceRegistry().getDictionaryService();

		return new WorkflowModelBuilder(namespaceService, nodeService, authenticationService, personService,
				workflowService, dictionaryService);
	}

	/**
	 * 
	 * @param jobject all tasks
	 * @return specific properties of a tasks
	 */
	public List<Map<String, Object>> parseTask(JsonObject jobject) {
		List<Map<String, Object>> allTasksList = new ArrayList<>();
		JsonArray jarray = jobject.getAsJsonArray("tasks");
		Map<String, Object> taskDetails = new HashMap<>();
		for (JsonElement jsonElement : jarray) {
			JsonObject taskObject = jsonElement.getAsJsonObject();
			
			//get outcome of atsk
			String outcome = "";
			try {
				outcome = taskObject.get("outcome").toString();
				taskDetails.put("outcome", outcome);
			} catch (NullPointerException e) {
				logger.info("Outcome is null, because the task is an active task.");
			}
			
			//get title
			String title = taskObject.get("title").getAsString();
			taskDetails.put("title", title);

			// get owner of task
			String taskOwner = "";
			taskObject = jsonElement.getAsJsonObject();
			JsonElement ownerObject = taskObject.get("owner");
			if (taskObject.get("isPooled").getAsBoolean() && ownerObject == null) {
				taskOwner = "Not Yet Claimed";
			} else {
				taskOwner = ownerObject.getAsJsonObject().get("firstName").getAsString() + " "
						+ ownerObject.getAsJsonObject().get("lastName").getAsString();
			}
			taskDetails.put("owner", taskOwner);


			taskObject = jsonElement.getAsJsonObject();
			JsonElement propertyLabels = taskObject.get("propertyLabels");
			
			// get status			
			String status = propertyLabels.getAsJsonObject().get("bpm_status").getAsString();
			taskDetails.put("status", status);

			// get priority
			String priority = propertyLabels.getAsJsonObject().get("bpm_priority").getAsString();
			taskDetails.put("priority", priority);

			// get due Date
			String parseDate = "(None)";
			taskObject = jsonElement.getAsJsonObject();
			JsonElement properties = taskObject.get("properties");
			if (properties.getAsJsonObject().get("bpm_dueDate") != null) {
				String dueDate = properties.getAsJsonObject().get("bpm_dueDate").getAsString();
				parseDate = parseDate(dueDate);
			}
			taskDetails.put("dueDate", parseDate);

			
			// get workflow message
			taskObject = jsonElement.getAsJsonObject();
			JsonElement workflowMessageObject = taskObject.get("workflowInstance");
			String workflowMessage = "";
			if (!workflowMessageObject.getAsJsonObject().get("message").getAsString().isEmpty()) {
				workflowMessage = workflowMessageObject.getAsJsonObject().get("message").getAsString();
			}
			else
			{
				workflowMessage = "(No Message)";
			}
			taskDetails.put("workflowMessage", workflowMessage);

			// get workflow id
			String workflowId = workflowMessageObject.getAsJsonObject().get("id").getAsString();
			taskDetails.put("workflowId", workflowId);

			// get task id
			taskObject = jsonElement.getAsJsonObject();
			String taskId = taskObject.get("id").getAsString();
			taskDetails.put("id", taskId.substring(taskId.indexOf('$') + 1));

			if (outcome.isEmpty()) {
				allTasksList.add(taskDetails);
			}
			taskDetails = new HashMap<>();
		}
		return allTasksList;
	}

	public String parseDate(String dateStringToParse) {
		
		DateTimeFormatter timeFormatter = DateTimeFormatter.ISO_DATE_TIME;
		TemporalAccessor accessor = timeFormatter.parse(dateStringToParse);
		Date date = Date.from(Instant.from(accessor));

		return new SimpleDateFormat("MM-dd-yyyy").format(date);
	}
}
