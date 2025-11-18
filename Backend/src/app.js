import express from "express";
import { ENV } from "./lib/env.js";
import connectDb from "./lib/mongo.config.js";

const app = express();
const port = ENV.PORT;

// Middlewares

//Server
app.listen(port, () => {
  connectDb();
  console.log(`Server is started on port ${port}`);
});
