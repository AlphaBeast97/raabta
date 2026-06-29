import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";

const app = express();
dotenv.config();
app.use(clerkMiddleware());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
