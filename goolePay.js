const fs = require("fs");
const pdf = require("pdf-parse");

const filePath = "C:/Users/mansi/Music/gpay_statement_20250901_20251130.pdf";

async function parseGooglePayStatement() {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);

  // pdfData.text usually contains all pages, but let's split manually
  const pages = pdfData.text.split(/\f/); // \f is page break

  // Merge all pages' text
  const text = pages.map((p) => p.trim()).join("\n");

  // -------------------------
  // Extract statement period
  const periodRegex = /(\d{2}[A-Za-z]+?\d{4})-(\d{2}[A-Za-z]+?\d{4})/;
  const periodMatch = text.match(periodRegex);

  const fixDate = (s) => s.replace(/(\d{2})([A-Za-z]+)(\d{4})/, "$1 $2 $3");

  const statementPeriod = {
    start: periodMatch ? fixDate(periodMatch[1]) : null,
    end: periodMatch ? fixDate(periodMatch[2]) : null,
  };

  // -------------------------
  // Extract transactions
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  const transactions = [];
  let i = 0;

  while (i < lines.length) {
    const dateMatch = lines[i].match(/^\d{2}[A-Za-z]{3},\d{4}$/);

    if (dateMatch) {
      const rawDate = lines[i];
      const fixedDate = rawDate.replace(
        /(\d{2})([A-Za-z]{3}),(\d{4})/,
        "$1 $2, $3"
      );

      const time = lines[i + 1] || null;
      const desc = lines[i + 2] || null;
      const upiMatch = lines[i + 3]?.match(/UPITransactionID:(\d+)/);
      const amountMatch = lines[i + 5]?.match(/₹([\d,\.]+)/);

      transactions.push({
        date: fixedDate,
        time,
        description: desc,
        type: desc?.includes("Paid") ? "debit" : "credit",
        upiId: upiMatch ? upiMatch[1] : null,
        amount: amountMatch ? amountMatch[1] : null,
      });

      i += 6;
    } else {
      i++;
    }
  }

  return { statementPeriod, transactions };
}

// Run
parseGooglePayStatement().then((result) => {
  console.log("Statement Period:", result.statementPeriod);
  console.log("Transactions Count:", result.transactions.length);
  console.log(result.transactions);
});
