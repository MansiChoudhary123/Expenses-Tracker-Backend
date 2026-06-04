import express from "express";
import multer from "multer";
import { uploadPhonePePDF } from "../controllers/phonePayController.js";

const router = express.Router();

// file upload config
const upload = multer({ dest: "uploads/" });

// API route
router.post("/upload", upload.single("file"), uploadPhonePePDF);

export default router;