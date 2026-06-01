import fs from "fs";
import pdf from "pdf-parse";

export const parseGPay = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);

    // Split pages /f is used to page break. splits pdf into pages.
    // We split pages to clean and process each page properly,
    // then join them back into a consistent formatted text.
    // Because raw text may have:messy spacingbroken structure,inconsistent formatting.Your parser may break because:extra spaces,inconsistent line breaks
    const pages = pdfData.text.split(/\f/);
    const text = pages.map((p) => p.trim()).join("\n");

    // -------------------------
    // Extract statement period regex to match date period
    const periodRegex = /(\d{2}[A-Za-z]+?\d{4})-(\d{2}[A-Za-z]+?\d{4})/;
    const periodMatch = text.match(periodRegex);

    const fixDate = (s) =>
      s.replace(/(\d{2})([A-Za-z]+)(\d{4})/, "$1 $2 $3");

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
          amount: amountMatch
            ? Number(amountMatch[1].replace(/,/g, ""))
            : null,
        });

        i += 6;
      } else {
        i++;
      }
    }

    return {
      source: "gpay",
      statementPeriod,
      totalTransactions: transactions.length,
      transactions,
    };
  } catch (error) {
    console.error("GPay Parser Error:", error.message);
    throw new Error("Failed to parse Google Pay PDF");
  }
};