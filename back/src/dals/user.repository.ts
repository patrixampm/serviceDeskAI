import { getUserContext, User } from '../../../db/src/db-model.js';
import { hashPassword } from '../helpers/login.helpers.js';
import { mapStringToObjectId } from '../helpers/mapper.helpers.js';
import * as apiModel from "../dals/user.api-model.js";

export interface UserRepository {
  getUserByEmailAndPassword: (email: string, password: string) => Promise<User | null>;
  getUserById: (id: string) => Promise<User | null>;
  updateUser: (id: string, user: Partial<User>) => Promise<boolean>;
}


export const dbRepository: UserRepository = {
  getUserByEmailAndPassword: async (email: string, password: string) => {
    const user = await getUserContext().findOne({
      email,
    });

	if (!user) return null;
    const hashedPassword = await hashPassword(password, user?.salt);
    return user?.password === hashedPassword
      ? ({
          _id: user._id,
		  name: user.name,
          email: user.email,
		  phoneNumber: user.phoneNumber,
		  country: user.country,
          role: user.role,
        } as User)
      : null;
  },

  getUserById: async (id: string) => {
    const user = await getUserContext().findOne({
      _id: mapStringToObjectId(id),
    });

    if (!user) return null;
    
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      country: user.country,
      office: user.office,
      workstation: user.workstation,
      role: user.role,
    } as User;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    const result = await getUserContext().updateOne(
      { _id: mapStringToObjectId(id) },
      { $set: userData }
    );
    return result.modifiedCount > 0;
  },
};
