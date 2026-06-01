import express from "express";
import multer from "multer";
import { uploadGPayPDF } from "../controllers/gPayController.js";

const router = express.Router();

// file upload config
const upload = multer({ dest: "uploads/" });

// API
router.post("/upload", upload.single("file"), uploadGPayPDF);

export default router;