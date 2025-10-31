import * as dbModel from "../../../db/src/db-model.js";
import * as apiModel from "../dals/issue.api-model.js";
import { mapObjectIdToString } from "../helpers/mapper.helpers.js";

export const mapIssueFromModelToApi = (issue: dbModel.Issue): apiModel.Issue => ({
	id: mapObjectIdToString(issue._id),
	description: issue.description,
	imageUrl: issue.imageUrl,
	status: issue.status,
	priority: issue.priority,
	createdBy: {
		userId: mapObjectIdToString(issue.createdBy.userId),
		name: issue.createdBy.name,
		email: issue.createdBy.email,
	},
	assignedTo: issue.assignedTo ? mapObjectIdToString(issue.assignedTo) : undefined,
	location: issue.location ? {
		latitude: issue.location.latitude,
		longitude: issue.location.longitude,
		accuracy: issue.location.accuracy,
		timestamp: issue.location.timestamp?.toISOString(),
	} : undefined,
	aiMetadata: issue.aiMetadata ? {
		labels: issue.aiMetadata.labels,
		objects: issue.aiMetadata.objects,
		detectedText: issue.aiMetadata.detectedText,
		suggestedDescription: issue.aiMetadata.suggestedDescription,
	} : undefined,
	createdAt: issue.createdAt.toISOString(),
	updatedAt: issue.updatedAt.toISOString(),
});
