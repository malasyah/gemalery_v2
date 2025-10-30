import mongoose from "mongoose";

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any)._mongooseCache || { conn: null, promise: null };

export async function connectMongo(uri: string) {
	if (cached.conn) return cached.conn;
	if (!cached.promise) {
		cached.promise = mongoose.connect(uri).then((m) => m);
	}
	cached.conn = await cached.promise;
	(global as any)._mongooseCache = cached;
	return cached.conn;
}
