import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import addressRoutes from "./routes/addresses";
import checkoutRoutes from "./routes/checkout";
import orderRoutes from "./routes/orders";
import transactionRoutes from "./routes/transactions";

export function createApp() {
	const app = express();
	const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map(s => s.trim()).filter(Boolean);
	app.use(cors({
		origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
		credentials: !!(allowedOrigins && allowedOrigins.length > 0),
	}));
	app.options("*", cors());
	app.use(express.json());
	app.use(morgan("dev"));

	app.get("/health", (_req, res) => {
		return res.status(200).json({ status: "ok" });
	});

	app.use("/auth", authRoutes);
	app.use("/users", userRoutes);
	app.use("/products", productRoutes);
	app.use("/cart", cartRoutes);
	app.use("/addresses", addressRoutes);
	app.use("/checkout", checkoutRoutes);
	app.use("/orders", orderRoutes);
	app.use("/transactions", transactionRoutes);
	return app;
}
