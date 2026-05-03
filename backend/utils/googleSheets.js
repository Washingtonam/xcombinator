const { google } = require("googleapis");

// ==============================
// 🔐 AUTH (ENV-BASED - SAFE)
// ==============================
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// ==============================
// 📊 SHEET ID
// ==============================
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// ==============================
// 🚀 MAIN FUNCTION
// ==============================
async function addToSheets({ summary, fullData }) {
  try {
    // ======================
    // 📄 SUMMARY SHEET
    // ======================
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Summary!A:H",
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
      range: "FullData!A:B",
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