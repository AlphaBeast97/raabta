import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./lib/db.js";
import { fs } from "fs";
import { path } from "path";

const app = express();

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Define the public directory path
const publicDir = path.join(process.cwd(), "public");

dotenv.config();
app.use(clerkMiddleware());
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.get("/health", (res) => {
  res.status(200).json({ status: "ok" });
});

// Check if the public directory exists
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
