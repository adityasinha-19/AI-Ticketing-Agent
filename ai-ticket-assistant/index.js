import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ☑️");
    app.listen(port, () => {
      console.log("App is listening at Port: ", process.env.PORT);
    });
  })
  .catch((err) => {
    console.error("ERR in connecting to mongoDB", err);
    throw err;
  });
