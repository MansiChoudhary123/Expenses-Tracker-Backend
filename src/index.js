import express from "express";
import connectDB from "./config/db.js";
import gPayRoutes from "../src/routes/gPayRoutes.js";
import phonePayRoutes from "./routes/phonePayRoute.js";
const app = express();
import dotenv from "dotenv";
dotenv.config();
connectDB();
app.use(express.json());

app.use("/api/gpay", gPayRoutes);
app.use("/api/phonePay", phonePayRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
