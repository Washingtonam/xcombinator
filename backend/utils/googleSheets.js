const { google } = require("googleapis");
const path = require("path");

// ==============================
// 🔐 AUTH SETUP
// ==============================
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../google-credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// ==============================
// 📊 SHEET ID
// ==============================
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// ==============================
// 🚀 MAIN FUNCTION
// ==============================
async function addToSheets({ summary, fullData }) {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // ======================
    // 📄 SUMMARY SHEET
    // ======================
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Summary!A:G",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [summary],
      },
    });

    // ======================
    // 📄 FULL DATA SHEET
    // ======================
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "FullData!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [fullData],
      },
    });

  } catch (err) {
    console.error("GOOGLE SHEETS ERROR:", err.message);
  }
}

module.exports = { addToSheets };