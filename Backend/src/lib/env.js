import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

export const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
};
