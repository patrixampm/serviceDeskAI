import { ObjectId } from "mongodb";
import { db } from "./db.server.js";

export type Role = "standard-user" | "service-desk-user" | "admin-user";

export interface User {
	_id: ObjectId;
	name: string;
	email: string;
	password: string;
	phoneNumber?: string;
	country: string;
	salt: string;
	role: Role;
	office: string;
	workstation: string;
}

export interface Issue {
	_id: ObjectId;
	description: string;
	imageUrl?: string;
	status: "open" | "in-progress" | "resolved";
	priority?: "low" | "medium" | "high";
	createdBy: {
		userId: ObjectId;
		name: string;
		email: string;
	};
	assignedTo?: ObjectId;
	location?: {
		latitude: number;
		longitude: number;
		accuracy?: number;
		timestamp?: Date;
	};
	aiMetadata?: {
		labels: Array<{ name: string; confidence: number }>;
		objects: Array<{ name: string; confidence: number }>;
		detectedText?: string;
		suggestedDescription?: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

export interface Office {
	_id: ObjectId;
	name: string;
	country: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ChatMessage {
	_id: ObjectId;
	conversationId: string;
	senderId: ObjectId;
	senderName: string;
	senderRole: Role;
	message: string;
	createdAt: Date;
	read: boolean;
}



export const getUserContext = () => db?.collection<User>("users");
export const getIssueContext = () => db?.collection<Issue>('issues');
export const getOfficeContext = () => db?.collection<Office>('offices');
export const getChatMessageContext = () => db?.collection<ChatMessage>('chatMessages');
