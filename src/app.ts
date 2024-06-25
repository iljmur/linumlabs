import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";

dotenv.config();

export const app = express();
app.use(bodyParser.json());
app.use("/api", userRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connection initialized");
  })
  .catch((error) => console.log(error));
