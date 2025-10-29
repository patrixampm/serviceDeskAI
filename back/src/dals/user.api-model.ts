import { Role } from "../interfaces.js";

export interface User {
	id: string;
	name: string;
	email: string;
	phoneNumber?: string;
	country: string;
	office: string,
	workstation: string,
	role: Role;
}
