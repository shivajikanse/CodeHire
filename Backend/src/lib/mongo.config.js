import mongoose, { connect } from "mongoose";
import { ENV } from "./env.js";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(ENV.DB_URL, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    });
    console.log("Connected to Database: ", conn.connection.host);
  } catch (error) {
    console.log("Erroe message :", error);
    process.exit(1); // 1 means failure ;
  }
};

export default connectDb;
