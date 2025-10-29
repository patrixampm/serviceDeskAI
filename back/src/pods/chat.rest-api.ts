import { Router } from "express";
import { getChatMessageContext, getUserContext } from "../../../db/src/db-model.js";
import { ObjectId } from "mongodb";
import { mapStringToObjectId } from "../helpers/mapper.helpers.js";

export const chatApi = Router();

// Get conversations (for service desk/admin users)
chatApi.get("/conversations", async (req, res) => {
	try {
		const userSession = (req as any).userSession;
		
		if (!userSession) {
			return res.status(401).json({ error: "Not authenticated" });
		}

		// Only service desk and admin users can see all conversations
		if (userSession.role !== "service-desk-user" && userSession.role !== "admin-user") {
			return res.status(403).json({ error: "Access denied" });
		}

		const chatCollection = getChatMessageContext();
		
		// Get all unique conversation IDs (standard users who have sent messages)
		const conversations = await chatCollection
			.aggregate([
				{
					$group: {
						_id: "$conversationId",
						lastMessage: { $last: "$message" },
						lastMessageTime: { $last: "$createdAt" },
						unreadCount: {
							$sum: {
								$cond: [
									{
										$and: [
											{ $eq: ["$read", false] },
											{ $eq: ["$senderRole", "standard-user"] }
										]
									},
									1,
									0
								]
							}
						}
					}
				},
				{ $sort: { lastMessageTime: -1 } }
			])
			.toArray();

		// Get user details for each conversation
		const userCollection = getUserContext();
		const conversationsWithUsers = await Promise.all(
			conversations.map(async (conv) => {
				const user = await userCollection.findOne({
					_id: mapStringToObjectId(conv._id),
				});
				return {
					conversationId: conv._id,
					user: user ? {
						id: user._id.toString(),
						name: user.name,
						email: user.email,
						office: user.office,
					} : null,
					lastMessage: conv.lastMessage,
					lastMessageTime: conv.lastMessageTime,
					unreadCount: conv.unreadCount,
				};
			})
		);

		res.json(conversationsWithUsers.filter(c => c.user !== null));
	} catch (error) {
		console.error("Error fetching conversations:", error);
		res.status(500).json({ error: "Failed to fetch conversations" });
	}
});

// Get messages for a conversation (standard user - no conversation ID needed)
chatApi.get("/messages", async (req, res) => {
	try {
		const userSession = (req as any).userSession;
		
		if (!userSession) {
			return res.status(401).json({ error: "Not authenticated" });
		}

		// Standard users can only see their own conversation
		const conversationId = userSession.id;

		const chatCollection = getChatMessageContext();
		
		const messages = await chatCollection
			.find({ conversationId })
			.sort({ createdAt: 1 })
			.toArray();

		// Mark service desk messages as read for standard user
		await chatCollection.updateMany(
			{ 
				conversationId, 
				read: false,
				senderRole: { $ne: "standard-user" } 
			},
			{ $set: { read: true } }
		);

		res.json(
			messages.map((msg) => ({
				id: msg._id.toString(),
				senderId: msg.senderId.toString(),
				senderName: msg.senderName,
				senderRole: msg.senderRole,
				message: msg.message,
				createdAt: msg.createdAt,
				read: msg.read,
			}))
		);
	} catch (error) {
		console.error("Error fetching messages:", error);
		res.status(500).json({ error: "Failed to fetch messages" });
	}
});

// Get messages for a specific conversation (service desk/admin)
chatApi.get("/messages/:conversationId", async (req, res) => {
	try {
		const userSession = (req as any).userSession;
		
		if (!userSession) {
			return res.status(401).json({ error: "Not authenticated" });
		}

		const conversationId = req.params.conversationId;

		if (!conversationId) {
			return res.status(400).json({ error: "Conversation ID required" });
		}

		const chatCollection = getChatMessageContext();
		
		const messages = await chatCollection
			.find({ conversationId })
			.sort({ createdAt: 1 })
			.toArray();

		// Mark messages as read since service desk/admin is viewing
		await chatCollection.updateMany(
			{ 
				conversationId, 
				read: false,
				senderRole: "standard-user" 
			},
			{ $set: { read: true } }
		);

		res.json(
			messages.map((msg) => ({
				id: msg._id.toString(),
				senderId: msg.senderId.toString(),
				senderName: msg.senderName,
				senderRole: msg.senderRole,
				message: msg.message,
				createdAt: msg.createdAt,
				read: msg.read,
			}))
		);
	} catch (error) {
		console.error("Error fetching messages:", error);
		res.status(500).json({ error: "Failed to fetch messages" });
	}
});

// Send a message
chatApi.post("/messages", async (req, res) => {
	try {
		const userSession = (req as any).userSession;
		
		if (!userSession) {
			return res.status(401).json({ error: "Not authenticated" });
		}

		const { message, conversationId } = req.body;

		if (!message || !message.trim()) {
			return res.status(400).json({ error: "Message is required" });
		}

		const chatCollection = getChatMessageContext();
		const userCollection = getUserContext();

		// Get sender info
		const sender = await userCollection.findOne({
			_id: mapStringToObjectId(userSession.id),
		});

		if (!sender) {
			return res.status(404).json({ error: "User not found" });
		}

		// Determine conversation ID
		let finalConversationId = conversationId;
		
		if (userSession.role === "standard-user") {
			// Standard users always chat in their own conversation
			finalConversationId = userSession.id;
		} else {
			// Service desk/admin must specify which conversation
			if (!conversationId) {
				return res.status(400).json({ error: "Conversation ID required" });
			}
			finalConversationId = conversationId;
		}

		const newMessage = {
			conversationId: finalConversationId,
			senderId: mapStringToObjectId(userSession.id),
			senderName: sender.name,
			senderRole: userSession.role,
			message: message.trim(),
			createdAt: new Date(),
			read: false,
		};

		const result = await chatCollection.insertOne(newMessage as any);

		res.status(201).json({
			id: result.insertedId.toString(),
			message: "Message sent successfully",
		});
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({ error: "Failed to send message" });
	}
});

// Get unread count for current user
chatApi.get("/unread-count", async (req, res) => {
	try {
		const userSession = (req as any).userSession;
		
		if (!userSession) {
			return res.status(401).json({ error: "Not authenticated" });
		}

		const chatCollection = getChatMessageContext();

		let unreadCount = 0;

		if (userSession.role === "standard-user") {
			// Count unread messages from service desk/admin
			unreadCount = await chatCollection.countDocuments({
				conversationId: userSession.id,
				read: false,
				senderRole: { $ne: "standard-user" },
			});
		} else {
			// Count all unread messages from standard users
			unreadCount = await chatCollection.countDocuments({
				read: false,
				senderRole: "standard-user",
			});
		}

		res.json({ unreadCount });
	} catch (error) {
		console.error("Error fetching unread count:", error);
		res.status(500).json({ error: "Failed to fetch unread count" });
	}
});
