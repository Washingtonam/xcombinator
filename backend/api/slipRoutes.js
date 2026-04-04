const express = require("express");
const router = express.Router();
const pdf = require("html-pdf-node");
const puppeteer = require("puppeteer");
const QRCode = require("qrcode");

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
  const formattedNIN = (data.nin || "")
    .replace(/(\d{4})(\d{3})(\d{4})/, "$1   $2   $3");

  return `
  <html>
  <body style="
    font-family: Arial, Helvetica, sans-serif;
    margin:0;
    background:#efefef;
  ">

  <div style="
    width:100%;
    height:540px;
    padding:20px 40px;
    box-sizing:border-box;
  ">

    <!-- HEADER -->
    <div style="
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:10px;
    ">
      <img src="https://xcombinator.com.ng/assets/coat.png" width="55"/>

      <div style="text-align:center;">
        <div style="
          font-size:22px;
          color:#666;
          font-weight:500;
        ">
          Federal Republic of Nigeria
        </div>

        <div style="
          font-size:22px;
          font-weight:700;
          margin-top:5px;
        ">
          Verified NIN Details
        </div>
      </div>

      <img src="https://xcombinator.com.ng/assets/nimc-logo.png" width="75"/>
    </div>

    <!-- MAIN GRID -->
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      margin-top:10px;
    ">

      <!-- LEFT -->
      <div style="
        width:38%;
        font-size:15px;
        line-height:2.1;
      ">
        <div><b>First Name:</b> ${data.firstname || ""}</div>
        <div><b>Middle Name:</b> ${data.middlename || ""}</div>
        <div><b>Last Name:</b> ${data.surname || ""}</div>
        <div><b>Date of Birth:</b> ${data.birthdate || ""}</div>
        <div><b>Gender:</b> ${data.gender || ""}</div>
      </div>

      <!-- CENTER -->
      <div style="
        width:24%;
        text-align:center;
      ">
        <img 
          src="${data.photo || ""}" 
          style="
            width:130px;
            height:150px;
            object-fit:cover;
          "
        />

        ${
          data.signature
            ? `<img src="${data.signature}" style="width:110px; margin-top:8px;" />`
            : ""
        }
      </div>

      <!-- RIGHT -->
      <div style="
        width:30%;
        font-size:13px;
        line-height:1.6;
      ">
        <div style="
          color:#0a8a2a;
          font-weight:700;
          font-size:22px;
          margin-bottom:5px;
        ">
          Verified
        </div>

        <div style="color:#555;">
          This is a property of National Identity Management Commission (NIMC), Nigeria.
          If found, please return to the nearest NIMC office or contact
          +234 815 769 1214, +234 815 769 1071
        </div>

        <ol style="
          margin-top:8px;
          padding-left:18px;
        ">
          <li>This NIN slip remains the property of the Federal Republic of Nigeria</li>
          <li>This NIN slip does not confer citizenship</li>
          <li>
            This NIN slip is valid for lifetime and 
            <span style="color:red; font-weight:bold;">DOES NOT EXPIRE</span>
          </li>
        </ol>
      </div>
    </div>

    <!-- NIN SECTION -->
    <div style="
      margin-top:15px;
      font-size:18px;
      letter-spacing:3px;
    ">
      <span style="
        color:#888;
        font-weight:600;
      ">
        NIN NUMBER:
      </span>

      <span style="
        margin-left:20px;
        font-weight:700;
        color:#444;
      ">
        ${formattedNIN}
      </span>
    </div>

    <!-- LOWER GRID -->
    <div style="
      display:flex;
      justify-content:space-between;
      margin-top:10px;
      font-size:14px;
      line-height:1.9;
    ">

      <div style="width:48%;">
        <div><b>Tracking ID:</b> ${data.trackingId || ""}</div>
        <div><b>Residence State:</b> ${data.residence_state || ""}</div>
        <div><b>Birth State:</b> ${data.birth_state || ""}</div>
        <div><b>Address:</b> ${data.residence_address || ""}</div>
      </div>

      <div style="width:48%;">
        <div><b>Phone Number:</b> ${data.telephoneno || ""}</div>
        <div><b>Residence:</b> ${data.residence || ""}</div>
        <div><b>LGA/Town:</b> ${data.lga || ""}</div>
        <div><b>Birth LGA:</b> ${data.birth_lga || ""}</div>
      </div>

    </div>

  </div>

  </body>
  </html>
  `;
}

// =======================================================
// 🟢 PREMIUM SLIP
// =======================================================


async function generatePremiumSlip(doc, data) {
  const QRCode = require("qrcode");

  // =========================
  // 📏 CARD DIMENSIONS (EXACT)
  // =========================
  const CARD_WIDTH = 9.1 * 28.35;   // 258pt
  const CARD_HEIGHT = 5.4 * 28.35;  // 153pt

  const startX = 40;
  const frontY = 40;
  const backY = frontY + CARD_HEIGHT + 20;

  // =========================
  // 🟢 FRONT SIDE
  // =========================

  const bg = "https://xcombinator.com.ng/assets/premium-bg.png";

  try {
    doc.image(bg, startX, frontY, {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    });
  } catch {}

  // =========================
  // 📷 PASSPORT
  // =========================
  if (data.photo) {
    try {
      const img = Buffer.from(
        data.photo.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      doc.image(img, startX + 10, frontY + 35, {
        width: 60,
        height: 70,
      });
    } catch {}
  }

  // =========================
  // 🔳 QR CODE
  // =========================
  const qr = await QRCode.toDataURL(
    JSON.stringify({
      nin: data.nin,
      name: `${data.firstname} ${data.surname}`,
    })
  );

  const qrBuffer = Buffer.from(
    qr.replace(/^data:image\/png;base64,/, ""),
    "base64"
  );

  doc.image(qrBuffer, startX + CARD_WIDTH - 70, frontY + 10, {
    width: 60,
  });

  // =========================
  // 🧾 TEXT
  // =========================
  doc.fillColor("black");

  doc.fontSize(8).text("SURNAME/NOM", startX + 80, frontY + 35);
  doc.font("Helvetica-Bold").text(data.surname, startX + 80, frontY + 45);

  doc.font("Helvetica").text("GIVEN NAMES", startX + 80, frontY + 60);
  doc.font("Helvetica-Bold").text(
    `${data.firstname}, ${data.middlename || ""}`,
    startX + 80,
    frontY + 70
  );

  doc.font("Helvetica").text("DATE OF BIRTH", startX + 80, frontY + 85);
  doc.text(data.birthdate, startX + 80, frontY + 95);

  doc.text("SEX", startX + 150, frontY + 85);
  doc.text(data.gender, startX + 150, frontY + 95);

  // =========================
  // 🌍 NGA + DATE
  // =========================
  doc.font("Helvetica-Bold").fontSize(10)
    .text("NGA", startX + CARD_WIDTH - 70, frontY + 80);

  doc.fontSize(7).text("ISSUE DATE", startX + CARD_WIDTH - 75, frontY + 95);

  doc.text(
    new Date().toLocaleDateString("en-GB"),
    startX + CARD_WIDTH - 75,
    frontY + 105
  );

  // =========================
  // 🔢 NIN
  // =========================
  const formattedNIN = (data.nin || "")
    .replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");

  doc.fontSize(8).text(
    "National Identification Number (NIN)",
    startX + 40,
    frontY + CARD_HEIGHT - 35
  );

  doc.fontSize(14).font("Helvetica-Bold").text(
    formattedNIN,
    startX + 40,
    frontY + CARD_HEIGHT - 20
  );

  // =========================
  // ⚪ BACK SIDE
  // =========================
  doc.rect(startX, backY, CARD_WIDTH, CARD_HEIGHT).stroke();

  doc.font("Helvetica-Bold").fontSize(10)
    .text("DISCLAIMER", startX, backY + 20, { align: "center", width: CARD_WIDTH });

  doc.font("Helvetica-Oblique").fontSize(8)
    .text("Trust, but verify", startX, backY + 35, {
      align: "center",
      width: CARD_WIDTH,
    });

  doc.font("Helvetica").fontSize(7).text(
    "Kindly ensure each time this ID is presented, verify using approved sources.",
    startX + 10,
    backY + 50,
    { width: CARD_WIDTH - 20, align: "center" }
  );

  doc.font("Helvetica-Bold").fontSize(9)
    .text("CAUTION!", startX, backY + 80, {
      align: "center",
      width: CARD_WIDTH,
    });

  doc.font("Helvetica").fontSize(7).text(
    "Do not scan or copy if not authorized. Use only for verification.",
    startX + 10,
    backY + 95,
    { width: CARD_WIDTH - 20, align: "center" }
  );
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