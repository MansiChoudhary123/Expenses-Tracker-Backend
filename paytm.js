const fs = require("fs");
const pdf = require("pdf-parse");

const filePath =
  "C:/Users/mansi/Music/Paytm_UPI_Statement_17_Nov'25_-_16_Dec'25.pdf";

async function extractTransactions() {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);

  const text = pdfData.text;

  // 🔥 Extract statement date range from header
  const dateRangeMatch = text.match(/Statement for\s*([\s\S]*?)\n/);
  let statementFrom = "";
  let statementTo = "";

  // This line contains: 17 NOV'25 - 16 DEC'25
  const rangeLine = text
    .split("Paytm Statement for")[1]
    ?.split("\n")
    ?.find((l) => l.includes("-"))
    ?.trim();

  if (rangeLine) {
    const parts = rangeLine.split("-");
    statementFrom = parts[0].trim();
    statementTo = parts[1].trim();
  }

  // Extract ALL Passbook sections (all pages)
  const sections = text.split("Passbook Payments History").slice(1);
  if (!sections.length) return [];

  const history = sections.join("\n");

  // Split each transaction by date
  const blocks = history.split(/\n(?=\d{1,2}\s\w{3})/g);

  const transactions = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 4) continue;

    const date = lines[0];
    const time = lines[1];
    const description = lines[2];

    const upiId =
      block
        .match(/UPI ID:\s*(.+)/)?.[1]
        ?.trim()
        .replace("on", "") || "";

    const upiRef = block.match(/UPI Ref No:\s*(\d+)/)?.[1] || "";

    // Tag extraction
    let tag = "";
    const tagBlock = block.match(/Tag:\s*([\s\S]*?)(?=\n[A-Za-z0-9])/);
    if (tagBlock) {
      const tagLine = tagBlock[1]
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith("#"));
      if (tagLine) tag = tagLine.replace("#", "").trim();
    }

    // 🔥 Extract account by reading lines before amount
    const amountLineIndex = lines.findIndex((l) => /[+-]\sRs\./.test(l));

    let account = "";
    if (amountLineIndex > 0) {
      let i = amountLineIndex - 1;

      const accountLines = [];
      while (i >= 0 && !lines[i].startsWith("#")) {
        if (
          !lines[i].startsWith("UPI ID") &&
          !lines[i].startsWith("UPI Ref") &&
          !lines[i].startsWith("Note:")
        ) {
          accountLines.push(lines[i]);
        }
        i--;
      }

      account = accountLines.reverse().join(" ");
    }

    const amount = lines.find((l) => /[+-]\sRs\./.test(l)) || "";

    if (amount) {
      transactions.push({
        date,
        time,
        description,
        upiId,
        upiRef,
        tag,
        amount,
        account,
      });
    }
  }

  return { statementFrom, statementTo, transactions };
}

extractTransactions().then((result) => {
  console.log("\nStatement Period:");
  console.log("From:", result.statementFrom);
  console.log("To:", result.statementTo);

  console.log("\nExtracted Transactions:\n");
  console.log(result.transactions);

  fs.writeFileSync("transactions.json", JSON.stringify(result, null, 2));
  console.log("\nSaved to transactions.json");
}); 