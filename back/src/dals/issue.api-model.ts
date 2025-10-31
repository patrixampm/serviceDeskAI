export type IssueStatus = "open" | "in-progress" | "resolved";
export type IssuePriority = "low" | "medium" | "high";

export interface IssueLocation {
	latitude: number;
	longitude: number;
	accuracy?: number;
	timestamp?: string;
}

export interface AIMetadata {
	labels: Array<{ name: string; confidence: number }>;
	objects: Array<{ name: string; confidence: number }>;
	detectedText?: string;
	suggestedDescription?: string;
}

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
	location?: IssueLocation;
	aiMetadata?: AIMetadata;
	createdAt: string;
	updatedAt: string;
}

export interface CreateIssueDto {
	description: string;
	priority?: IssuePriority;
	location?: IssueLocation;
}

export interface UpdateIssueDto {
	description?: string;
	status?: IssueStatus;
	priority?: IssuePriority;
	assignedTo?: string;
}
