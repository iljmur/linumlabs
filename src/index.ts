import express from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/userRoutes";
import dotenv from "dotenv";

dotenv.config();
AppDataSource.initialize()
  .then(async () => {
    const app = express();
    app.use(bodyParser.json());
    app.use("/api", userRoutes);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
