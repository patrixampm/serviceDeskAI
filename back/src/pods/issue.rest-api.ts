import { Router } from "express";
import multer from "multer";
import path from "path";
import { dbRepository } from "../dals/issue.repository.js";
import { dbRepository as userRepository } from "../dals/user.repository.js";
import { mapIssueFromModelToApi } from "./issue.mappers.js";
import { mapStringToObjectId } from "../helpers/mapper.helpers.js";

export const issueApi = Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/issues/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, "issue-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|gif/;
		const extname = allowedTypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetype = allowedTypes.test(file.mimetype);
		if (mimetype && extname) {
			return cb(null, true);
		}
		cb(new Error("Only image files are allowed!"));
	},
});

// Create a new issue (standard users)
issueApi.post("/", upload.single("image"), async (req, res, next) => {
	try {
		if (!req.userSession) {
			res.sendStatus(401);
			return;
		}

		const { description, priority } = req.body;

		if (!description) {
			res.status(400).json({ error: "Description is required" });
			return;
		}

		// Fetch current user data from database
		const currentUser = await userRepository.getUserById(
			req.userSession.id
		);

		if (!currentUser) {
			res.sendStatus(401);
			return;
		}

		const imageUrl = req.file
			? `/uploads/issues/${req.file.filename}`
			: undefined;

		const issueId = await dbRepository.createIssue({
			description,
			imageUrl,
			status: "open",
			priority: priority || "medium",
			createdBy: {
				userId: currentUser._id,
				name: currentUser.name,
				email: currentUser.email,
			},
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		res.status(201).json({ id: issueId });
	} catch (error) {
		next(error);
	}
});

// Get all issues (service desk users)
issueApi.get("/", async (req, res, next) => {
	try {
		if (!req.userSession) {
			res.sendStatus(401);
			return;
		}

		if (
			req.userSession.role !== "service-desk-user" &&
			req.userSession.role !== "admin-user"
		) {
			res.sendStatus(403);
			return;
		}

		const issues = await dbRepository.getAllIssues();
		const apiIssues = issues.map(mapIssueFromModelToApi);
		res.json(apiIssues);
	} catch (error) {
		next(error);
	}
});

// Get a specific issue by ID
issueApi.get("/:id", async (req, res, next) => {
	try {
		if (!req.userSession) {
			res.sendStatus(401);
			return;
		}

		const { id } = req.params;
		const issue = await dbRepository.getIssueById(id);

		if (!issue) {
			res.sendStatus(404);
			return;
		}

		if (req.userSession.role === "standard-user") {
			if (issue.createdBy.userId.toHexString() !== req.userSession.id) {
				res.sendStatus(403);
				return;
			}
		}

		res.json(mapIssueFromModelToApi(issue));
	} catch (error) {
		next(error);
	}
});

// Update an issue (service desk users)
issueApi.put("/:id", async (req, res, next) => {
	try {
		if (!req.userSession) {
			res.sendStatus(401);
			return;
		}

		if (
			req.userSession.role !== "service-desk-user" &&
			req.userSession.role !== "admin-user"
		) {
			res.sendStatus(403);
			return;
		}

		const { id } = req.params;
		const { description, status, priority, assignedTo } = req.body;

		const updates: any = {};
		if (description !== undefined) updates.description = description;
		if (status !== undefined) updates.status = status;
		if (priority !== undefined) updates.priority = priority;
		if (assignedTo !== undefined)
			updates.assignedTo = mapStringToObjectId(assignedTo);

		const updated = await dbRepository.updateIssue(id, updates);

		if (updated) {
			res.sendStatus(204);
		} else {
			res.sendStatus(404);
		}
	} catch (error) {
		next(error);
	}
});

// Delete an issue (admin only)
issueApi.delete("/:id", async (req, res, next) => {
	try {
		if (!req.userSession) {
			res.sendStatus(401);
			return;
		}

		if (req.userSession.role !== "admin-user") {
			res.sendStatus(403);
			return;
		}

		const { id } = req.params;
		const deleted = await dbRepository.deleteIssue(id);

		if (deleted) {
			res.sendStatus(204);
		} else {
			res.sendStatus(404);
		}
	} catch (error) {
		next(error);
	}
});
