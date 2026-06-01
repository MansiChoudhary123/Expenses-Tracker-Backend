import express from "express";
import connectDB from "./config/db.js";
import gPayRoutes from '../src/routes/gPayRoutes.js'
const app = express();

connectDB();
app.use(express.json());

app.use("/api/gpay", gPayRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
