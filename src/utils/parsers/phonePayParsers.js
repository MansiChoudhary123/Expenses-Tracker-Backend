import fs from "fs";
import pdf from "pdf-parse";

export const parsePhonePePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);

    const lines = pdfData.text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    const transactions = [];
    let current = null;

    const dateRegex =
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{2},\s\d{4}$/;

    const amountRegex = /₹[\d,]+/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 🟢 New Transaction Start
      if (dateRegex.test(line)) {
        if (current) transactions.push(current);

        current = {
          date: line,
          time: "",
          type: "",
          amount: "",
          description: "",
          transactionId: "",
          utr: "",
          paidBy: ""
        };

        if (lines[i + 1]) current.time = lines[i + 1];
        continue;
      }

      if (!current) continue;

      if (line.includes("DEBIT")) current.type = "DEBIT";
      if (line.includes("CREDIT")) current.type = "CREDIT";

      if (amountRegex.test(line)) {
        current.amount = line.match(amountRegex)[0];
      }

      if (
        current.amount &&
        !current.description &&
        !line.includes("Transaction ID")
      ) {
        current.description = line;
      }

      if (line.startsWith("Transaction ID")) {
        current.transactionId = line.replace("Transaction ID", "").trim();
      }

      if (line.startsWith("UTR No.")) {
        current.utr = line.replace("UTR No.", "").trim();
      }

      if (line.startsWith("Paid by")) {
        current.paidBy = line.replace("Paid by", "").trim();
      }
    }

    if (current) transactions.push(current);

    return transactions;
  } catch (error) {
    console.error("Error parsing PDF ❌", error);
    return [];
  }
};