const fs = require("fs");
const pdf = require("pdf-parse");

const filePath = "C:/Users/mansi/Music/PhonePe_Statement_Nov2025_Dec2025.pdf";

async function extractTransactions() {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);

  // Save raw PDF text
  fs.writeFileSync("raw-text.txt", pdfData.text);

  // Split PDF text into non-empty trimmed lines
  const lines = pdfData.text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // -------------------------
  // Read statement header (first 2 lines before transaction table)
  const headerLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("Transaction Statement for")) {
      headerLines.push(lines[i]);      // Statement title
      if (lines[i + 1]) headerLines.push(lines[i + 1]); // Date range
      break;
    }
  }

  console.log("Statement Header:");
  console.log(headerLines.join("\n"));
  fs.writeFileSync("phonepe-header.txt", headerLines.join("\n"));

  // -------------------------
  // Existing transaction parsing code
  const transactions = [];
  let current = null;

   const dateRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{2},\s\d{4}$/;
    const amountRegex = /₹[\d,]+/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

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

    if (current.amount && !current.description && !line.includes("Transaction ID")) {
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
}

extractTransactions().then((tx) => {
  console.log(tx);
  fs.writeFileSync("phonepe-transactions.json", JSON.stringify(tx, null, 2));
});
