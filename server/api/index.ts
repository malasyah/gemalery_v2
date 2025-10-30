import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import { createApp } from "../src/app";
import { connectMongo } from "../src/db";

const app = createApp();
const handler = serverless(app);

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
	const uri = process.env.MONGODB_URI || "";
	if (!uri) {
		res.status(500).json({ message: "MONGODB_URI not set" });
		return;
	}
	await connectMongo(uri);
	return (handler as any)(req, res);
}
