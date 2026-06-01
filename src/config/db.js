import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://expenseUser:Expense%40123@expense-tracker-cluster.quxbqew.mongodb.net/?appName=expense-tracker-cluster"
    );
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("failed to connect database ❌", error.message);
  }
};

export default connectDB;