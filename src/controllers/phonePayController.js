import { parsePhonePePDF } from "../utils/parsers/phonePayParsers.js";

export const uploadPhonePePDF = async (req, res) => {
  try {
    const result = await parsePhonePePDF(req.file.path);

    res.json({
      success: true,
      message: "phonePay PDF parsed successfully",
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