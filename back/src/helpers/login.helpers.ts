import jwt from "jsonwebtoken";
import crypto from "crypto";
import { promisify } from "util";

export const verifyJWT = <T>(token: string, secret: string): Promise<T> =>
	new Promise<T>((resolve, reject) => {
		jwt.verify(token, secret, (error, payload) => {
			if (error) {
				reject(error);
			}

			if (payload) {
				resolve(payload as unknown as T);
			} else {
				reject();
			}
		});
	});

const randomBytes = promisify(crypto.randomBytes);
const pbkdf2 = promisify(crypto.pbkdf2);

const saltLength = 16;
export const generateSalt = async (): Promise<string> => {
	const salt = await randomBytes(saltLength);
	return salt.toString("hex");
};

const passwordLength = 64;
const digestAlgorithm = "sha512";
const iterations = 100000;
export const hashPassword = async (
	password: string,
	salt: string
): Promise<string> => {
	const hashedPassword = await pbkdf2(
		password,
		salt,
		iterations,
		passwordLength,
		digestAlgorithm
	);
	return hashedPassword.toString("hex");
};
