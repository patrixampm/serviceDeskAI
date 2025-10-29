import { MongoClient, Db } from "mongodb";

export let db: Db;
let client: MongoClient;

export const connect = async (connectionURI: string) => {
	client = new MongoClient(connectionURI);
	await client.connect();
	db = client.db();
};

export const disconnect = async () => {
	await client.close();
};
