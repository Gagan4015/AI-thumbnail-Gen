import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("DB Connected");
  } catch (error) {
    console.log(error);
  }
}

export default connectDB;
