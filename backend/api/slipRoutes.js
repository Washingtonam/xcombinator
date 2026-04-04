const express = require("express");
const router = express.Router();
const pdf = require("html-pdf-node");

// ==============================
// 🔢 GENERATOR
// ==============================
const generateTrackingId = () => {
  return "TRK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
};

// ==============================
// 🚀 MAIN ROUTE
// ==============================
router.post("/generate-nin-slip", async (req, res) => {
  try {
    const { data, type } = req.body;

    if (!data) {
      return res.status(400).json({ message: "No data provided" });
    }

    const trackingId = generateTrackingId();

    let html = "";

    if (type === "data") {
      html = generateDataHTML({ ...data, trackingId });
    } else if (type === "premium") {
      html = generatePremiumHTML({ ...data, trackingId });
    } else if (type === "long") {
      html = generateLongHTML({ ...data, trackingId });
    } else {
      return res.status(400).json({ message: "Invalid slip type" });
    }

    const file = { content: html };

    const options = {
      format: "A4",
    };

    const pdfBuffer = await pdf.generatePdf(file, options);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${type}-slip.pdf`,
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ message: "Slip generation failed" });
  }
});


// =======================================================
// 🟡 DATA SLIP (CLEAN DESIGN)
// =======================================================
function generateDataHTML(data) {
  return `
  <html>
  <body style="font-family: Arial; padding: 30px; background:#f5f5f5;">
    
    <h2 style="text-align:center;">Federal Republic of Nigeria</h2>
    <h3 style="text-align:center;">Verified NIN Details</h3>

    <div style="text-align:center; margin:20px;">
      <img src="${data.photo || ""}" width="120"/>
    </div>

    <table style="width:100%; font-size:14px;">
      <tr><td><b>First Name</b></td><td>${data.firstname}</td></tr>
      <tr><td><b>Middle Name</b></td><td>${data.middlename}</td></tr>
      <tr><td><b>Surname</b></td><td>${data.surname}</td></tr>
      <tr><td><b>DOB</b></td><td>${data.birthdate}</td></tr>
      <tr><td><b>Gender</b></td><td>${data.gender}</td></tr>
      <tr><td><b>NIN</b></td><td>${data.nin}</td></tr>
    </table>

    <p style="margin-top:20px;"><b>Tracking ID:</b> ${data.trackingId}</p>

    <p style="color:green; font-size:18px;"><b>✔ Verified</b></p>

  </body>
  </html>
  `;
}


// =======================================================
// 🟢 PREMIUM SLIP (CARD STYLE)
// =======================================================
function generatePremiumHTML(data) {
  return `
  <html>
  <body style="font-family: Arial; padding:20px;">

    <div style="border:1px solid #ccc; padding:20px;">
      
      <h3>NIN Premium Slip</h3>

      <img src="${data.photo || ""}" width="120"/>

      <p><b>Name:</b> ${data.firstname} ${data.middlename}</p>
      <p><b>Surname:</b> ${data.surname}</p>
      <p><b>DOB:</b> ${data.birthdate}</p>
      <p><b>Gender:</b> ${data.gender}</p>

      <h2>${data.nin}</h2>

      <p><b>Issued:</b> ${new Date().toLocaleDateString()}</p>

      <hr/>

      <p style="font-size:12px;">
      This is a government-issued identity slip. Always verify before use.
      </p>

    </div>

  </body>
  </html>
  `;
}


// =======================================================
// 🔵 LONG SLIP (TABLE STYLE)
// =======================================================
function generateLongHTML(data) {
  return `
  <html>
  <body style="font-family: Arial; padding:20px;">

    <h3 style="text-align:center;">National Identification Number Slip</h3>

    <table border="1" cellspacing="0" cellpadding="10" width="100%">
      <tr><td><b>NIN</b></td><td>${data.nin}</td></tr>
      <tr><td><b>Surname</b></td><td>${data.surname}</td></tr>
      <tr><td><b>First Name</b></td><td>${data.firstname}</td></tr>
      <tr><td><b>Middle Name</b></td><td>${data.middlename}</td></tr>
      <tr><td><b>Gender</b></td><td>${data.gender}</td></tr>
      <tr><td><b>Tracking ID</b></td><td>${data.trackingId}</td></tr>
    </table>

    <p style="margin-top:20px;">
      The National Identification Number (NIN) is your identity.
    </p>

  </body>
  </html>
  `;
}

module.exports = router;