import { parseGPay } from "./parsers/gPayParser.js";

export const parsePDFByType = async (type, filePath) => {
  switch (type) {
    case "gpay":
      return await parseGPay(filePath);

    default:
      throw new Error("Unsupported PDF type");
  }
};