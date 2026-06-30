import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./lib/db.js";

const app = express();
dotenv.config();
app.use(clerkMiddleware());

const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
