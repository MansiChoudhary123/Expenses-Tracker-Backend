import { parseGPay } from "./gPayParser.js";

const runTest = async () => {
  try {
    const result = await parseGPay("C:/Users/mansi/Music/gpay_statement_20250901_20251130.pdf");

    console.log("✅ PARSED RESULT:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ ERROR:", error.message);
  }
};

runTest();