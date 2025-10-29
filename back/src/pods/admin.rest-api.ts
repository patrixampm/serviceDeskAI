import { Router } from "express";
import {
	getUserContext,
	getIssueContext,
	getOfficeContext,
} from "../../../db/src/db-model.js";
import { generateSalt, hashPassword } from "../helpers/login.helpers.js";
import { ObjectId } from "mongodb";

export const adminApi = Router();

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
	if (!req.userSession || req.userSession.role !== "admin-user") {
		return res.status(403).json({ error: "Admin access required" });
	}
	next();
};

adminApi.use(requireAdmin);

// Get analytics/dashboard data
adminApi.get("/analytics", async (req, res) => {
	try {
		const userCollection = getUserContext();
		const issueCollection = getIssueContext();
		const officeCollection = getOfficeContext();

		// Get counts
		const totalUsers = await userCollection.countDocuments();
		const totalIssues = await issueCollection.countDocuments();
		const totalOffices = await officeCollection.countDocuments();

		// Get issue stats
		const openIssues = await issueCollection.countDocuments({
			status: "open",
		});
		const inProgressIssues = await issueCollection.countDocuments({
			status: "in-progress",
		});
		const resolvedIssues = await issueCollection.countDocuments({
			status: "resolved",
		});

		// Get priority stats
		const highPriority = await issueCollection.countDocuments({
			priority: "high",
		});
		const mediumPriority = await issueCollection.countDocuments({
			priority: "medium",
		});
		const lowPriority = await issueCollection.countDocuments({
			priority: "low",
		});

		// Get issues by office
		const issuesByOffice = await issueCollection
			.aggregate([
				{
					$lookup: {
						from: "users",
						localField: "createdBy.userId",
						foreignField: "_id",
						as: "user",
					},
				},
				{
					$unwind: "$user",
				},
				{
					$group: {
						_id: "$user.office",
						count: { $sum: 1 },
					},
				},
			])
			.toArray();

		// Calculate average resolution time
		const resolvedIssuesWithTime = await issueCollection
			.find({ status: "resolved" })
			.toArray();

		let avgResolutionTime = 0;
		if (resolvedIssuesWithTime.length > 0) {
			const totalTime = resolvedIssuesWithTime.reduce((acc, issue) => {
				const created = new Date(issue.createdAt).getTime();
				const updated = new Date(issue.updatedAt).getTime();
				return acc + (updated - created);
			}, 0);
			avgResolutionTime = totalTime / resolvedIssuesWithTime.length;
		}

		// Get recent issues
		const recentIssues = await issueCollection
			.find()
			.sort({ createdAt: -1 })
			.limit(10)
			.toArray();

		res.json({
			summary: {
				totalUsers,
				totalIssues,
				totalOffices,
				openIssues,
				inProgressIssues,
				resolvedIssues,
				highPriority,
				mediumPriority,
				lowPriority,
				avgResolutionTimeMs: avgResolutionTime,
			},
			issuesByOffice,
			recentIssues: recentIssues.map((issue) => ({
				id: issue._id.toString(),
				description: issue.description,
				status: issue.status,
				priority: issue.priority,
				createdBy: issue.createdBy,
				createdAt: issue.createdAt,
			})),
		});
	} catch (error) {
		console.error("Error fetching analytics:", error);
		res.status(500).json({ error: "Failed to fetch analytics" });
	}
});

// Get all users
adminApi.get("/users", async (req, res) => {
	try {
		const userCollection = getUserContext();
		const users = await userCollection.find().toArray();

		res.json(
			users.map((user) => ({
				id: user._id.toString(),
				name: user.name,
				email: user.email,
				role: user.role,
				office: user.office,
				workstation: user.workstation,
				country: user.country,
				phoneNumber: user.phoneNumber,
			}))
		);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Failed to fetch users" });
	}
});

// Create new user
adminApi.post("/users", async (req, res) => {
	try {
		const { name, email, password, role, office, workstation, country, phoneNumber } =
			req.body;

		if (!name || !email || !password || !role || !office) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		const userCollection = getUserContext();

		// Check if user already exists
		const existingUser = await userCollection.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ error: "User already exists" });
		}

		// Hash password
		const salt = await generateSalt();
		const hashedPassword = await hashPassword(password, salt);

		// Create user
		const result = await userCollection.insertOne({
			name,
			email,
			password: hashedPassword,
			salt,
			role,
			office,
			workstation: workstation || "",
			country: country || "",
			phoneNumber: phoneNumber || "",
		} as any);

		res.status(201).json({
			id: result.insertedId.toString(),
			message: "User created successfully",
		});
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({ error: "Failed to create user" });
	}
});

// Update user
adminApi.put("/users/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { name, email, role, office, workstation, country, phoneNumber } =
			req.body;

		const userCollection = getUserContext();

		const updateData: any = {};
		if (name) updateData.name = name;
		if (email) updateData.email = email;
		if (role) updateData.role = role;
		if (office) updateData.office = office;
		if (workstation !== undefined) updateData.workstation = workstation;
		if (country !== undefined) updateData.country = country;
		if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

		const result = await userCollection.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: updateData }
		);

		if (result.matchedCount === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json({ message: "User updated successfully" });
	} catch (error) {
		console.error("Error updating user:", error);
		res.status(500).json({ error: "Failed to update user" });
	}
});

// Delete user
adminApi.delete("/users/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const userCollection = getUserContext();

		const result = await userCollection.deleteOne({ _id: new ObjectId(id) });

		if (result.deletedCount === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error deleting user:", error);
		res.status(500).json({ error: "Failed to delete user" });
	}
});

// Get all offices
adminApi.get("/offices", async (req, res) => {
	try {
		const officeCollection = getOfficeContext();
		const offices = await officeCollection.find().toArray();

		res.json(
			offices.map((office) => ({
				id: office._id.toString(),
				name: office.name,
				country: office.country,
				createdAt: office.createdAt,
			}))
		);
	} catch (error) {
		console.error("Error fetching offices:", error);
		res.status(500).json({ error: "Failed to fetch offices" });
	}
});

// Create new office
adminApi.post("/offices", async (req, res) => {
	try {
		const { name, country } = req.body;

		if (!name || !country) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		const officeCollection = getOfficeContext();

		// Check if office already exists
		const existingOffice = await officeCollection.findOne({ name });
		if (existingOffice) {
			return res.status(400).json({ error: "Office already exists" });
		}

		const result = await officeCollection.insertOne({
			name,
			country,
			createdAt: new Date(),
			updatedAt: new Date(),
		} as any);

		res.status(201).json({
			id: result.insertedId.toString(),
			message: "Office created successfully",
		});
	} catch (error) {
		console.error("Error creating office:", error);
		res.status(500).json({ error: "Failed to create office" });
	}
});

// Update office
adminApi.put("/offices/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { name, country } = req.body;

		const officeCollection = getOfficeContext();

		const updateData: any = { updatedAt: new Date() };
		if (name) updateData.name = name;
		if (country) updateData.country = country;

		const result = await officeCollection.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: updateData }
		);

		if (result.matchedCount === 0) {
			return res.status(404).json({ error: "Office not found" });
		}

		res.json({ message: "Office updated successfully" });
	} catch (error) {
		console.error("Error updating office:", error);
		res.status(500).json({ error: "Failed to update office" });
	}
});

// Delete office
adminApi.delete("/offices/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const officeCollection = getOfficeContext();

		const result = await officeCollection.deleteOne({ _id: new ObjectId(id) });

		if (result.deletedCount === 0) {
			return res.status(404).json({ error: "Office not found" });
		}

		res.json({ message: "Office deleted successfully" });
	} catch (error) {
		console.error("Error deleting office:", error);
		res.status(500).json({ error: "Failed to delete office" });
	}
});
