import "./load-env.js";
import { connect, disconnect } from "../../db/src/db.server.js";
import { getUserContext, getOfficeContext } from "../../db/src/db-model.js";
import { generateSalt, hashPassword } from "./helpers/login.helpers.js";
import { ENV } from "./core/index.js";

const seedDatabase = async () => {
	console.log("Seeding database...");

	await connect(ENV.MONGODB_URI);

	const userCollection = getUserContext();
	const officeCollection = getOfficeContext();

	// Check if data already exists
	const existingUsers = await userCollection.countDocuments();
	if (existingUsers > 0) {
		console.log("Database already has users. Skipping seed.");
		await disconnect();
		return;
	}

	// Create offices first
	const offices = [
		{
			name: "Malaga",
			country: "Spain",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			name: "Zambujeira do Mar",
			country: "Portugal",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			name: "Val Nord",
			country: "Andorra",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	await officeCollection.insertMany(offices as any);
	console.log("Created offices: Malaga, Zambujeira do Mar, Val Nord");

	// Create users
	const users = [
		{
			name: "Juan",
			email: "standard@test.com",
			password: "password123",
			phoneNumber: "+1234567890",
			country: "Spain",
			office: "Malaga",
			workstation: "C1R1S4",
			role: "standard-user" as const,
		},
		{
			name: "Francisca",
			email: "servicedesk@test.com",
			password: "password123",
			phoneNumber: "+1234567891",
			country: "Portugal",
			office: "Zambujeira do Mar",
			workstation: "C8R3S2",
			role: "service-desk-user" as const,
		},
		{
			name: "Antonio",
			email: "admin@test.com",
			password: "password123",
			phoneNumber: "+1234567892",
			country: "Andorra",
			office: "Val Nord",
			workstation: "C2R1S6",
			role: "admin-user" as const,
		},
	];

	for (const user of users) {
		const salt = await generateSalt();
		const hashedPassword = await hashPassword(user.password, salt);

		await userCollection.insertOne({
			name: user.name,
			email: user.email,
			password: hashedPassword,
			phoneNumber: user.phoneNumber,
			country: user.country,
			office: user.office,
			workstation: user.workstation,
			salt: salt,
			role: user.role,
		} as any);

		console.log(`Created ${user.role}: ${user.email}`);
	}

	console.log("Seeding complete!");
	await disconnect();
};

seedDatabase().catch((error) => {
	console.error("Seeding failed:", error);
	process.exit(1);
});
