import dotenv from "dotenv";
import mongoose from "mongoose";
import { createApp } from "./app";

dotenv.config();

const app = createApp();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI = process.env.MONGODB_URI || "";

async function start() {
	try {
		if (!MONGODB_URI) {
			throw new Error("MONGODB_URI is not set in environment");
		}
		await mongoose.connect(MONGODB_URI);
		app.listen(PORT, () => {
			console.log(`Server listening on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error("Failed to start server:", err);
		process.exit(1);
	}
}

start();
