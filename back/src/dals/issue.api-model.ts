export type IssueStatus = "open" | "in-progress" | "resolved";
export type IssuePriority = "low" | "medium" | "high";

export interface Issue {
	id: string;
	description: string;
	imageUrl?: string;
	status: IssueStatus;
	priority?: IssuePriority;
	createdBy: {
		userId: string;
		name: string;
		email: string;
	};
	assignedTo?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateIssueDto {
	description: string;
	priority?: IssuePriority;
}

export interface UpdateIssueDto {
	description?: string;
	status?: IssueStatus;
	priority?: IssuePriority;
	assignedTo?: string;
}
