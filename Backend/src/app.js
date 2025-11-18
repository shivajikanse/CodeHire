import express from "express";
import { ENV } from "./lib/env.js";

const app = express();
const port = ENV.PORT;

// Middlewares

//Server
app.listen(port, () => {
  console.log(`Server is started on port ${port}`);
});
