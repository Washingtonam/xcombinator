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
      printBackground: true,
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
// 🟡 DATA SLIP
// =======================================================
function generateDataHTML(data) {
  return `
  <html>
  <body style="font-family: Arial; padding:30px; background:#f5f0dc;">

    <!-- HEADER -->
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <img src="https://xcombinator.com.ng/assets/coat.png" width="60"/>
      <img src="https://xcombinator.com.ng/assets/nimc-logo.png" width="90"/>
    </div>

    <h2 style="text-align:center; margin-top:10px;">Federal Republic of Nigeria</h2>
    <h3 style="text-align:center;">Verified NIN Details</h3>

    <!-- PHOTO -->
    <div style="text-align:center; margin:20px;">
      <img src="${data.photo || ""}" width="130" height="150"/>
    </div>

    <!-- DETAILS -->
    <table style="width:100%; font-size:14px; margin-top:20px;">
      <tr><td><b>First Name:</b></td><td>${data.firstname}</td></tr>
      <tr><td><b>Middle Name:</b></td><td>${data.middlename}</td></tr>
      <tr><td><b>Surname:</b></td><td>${data.surname}</td></tr>
      <tr><td><b>Date of Birth:</b></td><td>${data.birthdate}</td></tr>
      <tr><td><b>Gender:</b></td><td>${data.gender}</td></tr>
    </table>

    <!-- NIN -->
    <h2 style="margin-top:20px;">
      NIN: ${data.nin}
    </h2>

    <!-- TRACKING -->
    <p><b>Tracking ID:</b> ${data.trackingId}</p>

    <!-- VERIFIED -->
    <h2 style="color:green;">✔ VERIFIED</h2>

    <!-- FOOTER -->
    <p style="font-size:12px;">
      This slip remains property of the Federal Republic of Nigeria and does not expire.
    </p>

  </body>
  </html>
  `;
}


// =======================================================
// 🟢 PREMIUM SLIP
// =======================================================
function generatePremiumHTML(data) {
  return `
  <html>
  <body style="margin:0; font-family:Arial;">

    <div style="position:relative; width:100%; height:520px;">

      <!-- BACKGROUND -->
      <img 
        src="https://xcombinator.com.ng/assets/premium-bg.png"
        style="
          position:absolute;
          width:100%;
          height:100%;
          top:0;
          left:0;
          object-fit:cover;
          z-index:0;
        "
      />

      <!-- CONTENT -->
      <div style="position:relative; z-index:2; padding:30px;">

        <!-- PHOTO -->
        <img src="${data.photo || ""}" width="120" height="140"/>

        <!-- DETAILS -->
        <div style="margin-top:20px;">
          <p><b>Surname:</b> ${data.surname}</p>
          <p><b>First Name:</b> ${data.firstname}</p>
          <p><b>Middle Name:</b> ${data.middlename}</p>
          <p><b>DOB:</b> ${data.birthdate}</p>
          <p><b>Gender:</b> ${data.gender}</p>
        </div>

        <!-- NIN -->
        <h2 style="margin-top:20px;">${data.nin}</h2>

        <!-- ISSUE DATE -->
        <p><b>Issued:</b> ${new Date().toLocaleDateString()}</p>

      </div>

    </div>

  </body>
  </html>
  `;
}


// =======================================================
// 🔵 LONG SLIP
// =======================================================
function generateLongHTML(data) {
  return `
  <html>
  <body style="font-family:Arial; padding:20px;">

    <!-- HEADER -->
    <div style="display:flex; justify-content:space-between;">
      <img src="https://xcombinator.com.ng/assets/coat.png" width="50"/>
      <img src="https://xcombinator.com.ng/assets/nimc-logo.png" width="70"/>
    </div>

    <h3 style="text-align:center;">National Identification Number Slip</h3>

    <!-- TABLE -->
    <table border="1" cellspacing="0" cellpadding="10" width="100%">
      <tr><td><b>NIN</b></td><td>${data.nin}</td></tr>
      <tr><td><b>Surname</b></td><td>${data.surname}</td></tr>
      <tr><td><b>First Name</b></td><td>${data.firstname}</td></tr>
      <tr><td><b>Middle Name</b></td><td>${data.middlename}</td></tr>
      <tr><td><b>Gender</b></td><td>${data.gender}</td></tr>
      <tr><td><b>Tracking ID</b></td><td>${data.trackingId}</td></tr>
    </table>

    <!-- NOTE -->
    <p style="margin-top:20px;">
      The National Identification Number (NIN) is your identity. It is confidential and must only be used for legitimate transactions.
    </p>

    <!-- FOOTER -->
    <div style="margin-top:20px; font-size:12px;">
      <p>www.nimc.gov.ng</p>
      <p>0700-CALL-NIMC</p>
      <p>NIMC HQ, Abuja</p>
    </div>

  </body>
  </html>
  `;
}

module.exports = router;