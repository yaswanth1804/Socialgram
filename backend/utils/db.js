import mongoose from "mongoose";
export const connectDB = (uri) => {
  mongoose
    .connect(uri, { dbName: "social" })
    .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
    .catch((err) => {
      throw err;
    });
};
