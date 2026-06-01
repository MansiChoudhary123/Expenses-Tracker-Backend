import { parseGPay } from "../utils/parsers/gPayParser.js";

export const uploadGPayPDF = async (req, res) => {
  try {
    const result = await parseGPay(req.file.path);

    res.json({
      success: true,
      message: "GPay PDF parsed successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error parsing GPay PDF",
    });
  }
};