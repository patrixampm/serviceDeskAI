import * as userModel from "../../../db/src/db-model.js";
import { mapObjectIdToString } from "../helpers/mapper.helpers.js";
import * as apiModel from "../dals/user.api-model.js";

export const mapProfileFromModelToApi = (
	profile: userModel.User
): apiModel.User => ({
	id: mapObjectIdToString(profile._id),
	name: profile.name,
	email: profile.email,
	phoneNumber: profile?.phoneNumber,
	country: profile.country,
	office: profile.office,
	workstation: profile.workstation,
	role: profile.role,
});

export const mapUserFromApiToModel = (
	profile: apiModel.User
): Partial<userModel.User> => ({
	name: profile.name,
	email: profile.email,
	phoneNumber: profile?.phoneNumber,
	country: profile.country,
	office: profile.office,
	workstation: profile.workstation,
	role: profile.role,
});
