import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./lib/db.js";

const app = express();

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

dotenv.config();
app.use(clerkMiddleware());
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.get("/health", (res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
