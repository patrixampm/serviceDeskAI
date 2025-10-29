import { ObjectId } from 'mongodb';
import { getIssueContext, Issue as DbIssue } from '../../../db/src/db-model.js';
import { mapStringToObjectId } from '../helpers/mapper.helpers.js';

export interface IssueRepository {
	createIssue: (issue: Omit<DbIssue, '_id'>) => Promise<string>;
	getAllIssues: () => Promise<DbIssue[]>;
	getIssueById: (id: string) => Promise<DbIssue | null>;
	updateIssue: (id: string, updates: Partial<DbIssue>) => Promise<boolean>;
	deleteIssue: (id: string) => Promise<boolean>;
}

export const dbRepository: IssueRepository = {
	createIssue: async (issue) => {
		const result = await getIssueContext().insertOne({
			_id: new ObjectId(),
			...issue,
		});
		return result.insertedId.toHexString();
	},

	getAllIssues: async () => {
		const issues = await getIssueContext()
			.find({})
			.sort({ createdAt: -1 })
			.toArray();
		return issues;
	},

	getIssueById: async (id: string) => {
		const issue = await getIssueContext().findOne({
			_id: mapStringToObjectId(id),
		});
		return issue;
	},

	updateIssue: async (id: string, updates: Partial<DbIssue>) => {
		const result = await getIssueContext().updateOne(
			{ _id: mapStringToObjectId(id) },
			{ $set: { ...updates, updatedAt: new Date() } }
		);
		return result.modifiedCount > 0;
	},

	deleteIssue: async (id: string) => {
		const result = await getIssueContext().deleteOne({
			_id: mapStringToObjectId(id),
		});
		return result.deletedCount > 0;
	},
};
