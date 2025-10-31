import { Router } from "express";
import { dbRepository } from "../dals/user.repository.js";
import { mapProfileFromModelToApi, mapUserFromApiToModel } from "./mappers.js";
import { getOfficeContext } from "../../../db/src/db-model.js";

export const standardUserApi = Router();

standardUserApi
.get("/offices", async (req, res, next) => {
	try {
		const officeCollection = getOfficeContext();
		const offices = await officeCollection.find().toArray();

		res.json(
			offices.map((office) => ({
				id: office._id.toString(),
				name: office.name,
				country: office.country,
			}))
		);
	} catch (error) {
		next(error);
	}
})
.get("/profile", async (req, res, next) => {
	try {
		if (!req.userSession) {
            res.sendStatus(401);
            return;
        }
	
		const { id } = req.userSession;
		const standardProfile = await dbRepository.getUserById(id);
		if (standardProfile) {
			res.send(mapProfileFromModelToApi(standardProfile));
		} else {
			res.sendStatus(404);
		}
	} catch (error) {
		next(error);
	}
})
.put("/profile", async (req, res, next) => {
	try {
		if (!req.userSession) {
            res.sendStatus(401);
            return;
        }

		const { id } = req.userSession;
		const standardProfile = await dbRepository.getUserById(id);
      	if (standardProfile) {
			const userData = mapUserFromApiToModel({ 
				id, 
				...req.body,
				role: standardProfile.role
			});
        	const updated = await dbRepository.updateUser(id, userData);
        	if (updated) {
				res.sendStatus(204);
			} else {
				res.sendStatus(400);
			}
		} else {
			res.sendStatus(404);
		}
	} catch (error) {
		next(error);
	}
});
