const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const path = require("path");

// ==============================
// 🔢 GENERATORS
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

    const doc = new PDFDocument({ size: "A4", margin: 0 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=nin-${type}-slip.pdf`
    );

    doc.pipe(res);

    // =========================
    // 🎯 SELECT SLIP ENGINE
    // =========================
    if (type === "data") {
      generateDataSlip(doc, { ...data, trackingId });
    } 
    else if (type === "premium") {
      await generatePremiumSlip(doc, { ...data, trackingId });
    } 
    else if (type === "long") {
      generateLongSlip(doc, { ...data, trackingId });
    } 
    else {
      doc.fontSize(20).text("Invalid slip type", 100, 100);
    }

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate slip" });
  }
});


// =======================================================
// 🟡 DATA SLIP (CLEAN + MODERN)
// =======================================================
function generateDataSlip(doc, data) {
  const pageWidth = doc.page.width;

  doc.rect(0, 0, pageWidth, doc.page.height).fill("#f5f0dc");
  doc.fillColor("black");

  const coat = path.join(__dirname, "../assets/coat.png");
  const nimc = path.join(__dirname, "../assets/nimc-logo.png");

  try { doc.image(coat, 40, 30, { width: 60 }); } catch {}
  try { doc.image(nimc, pageWidth - 120, 30, { width: 70 }); } catch {}

  doc.fontSize(18).font("Helvetica-Bold")
    .text("Federal Republic of Nigeria", 0, 40, { align: "center" });

  doc.moveDown().fontSize(20)
    .text("Verified NIN Details", { align: "center" });

  // Passport
  if (data.photo) {
    try {
      const img = Buffer.from(data.photo.replace(/^data:image\/\w+;base64,/, ""), "base64");
      doc.image(img, pageWidth / 2 - 60, 120, { width: 120, height: 130 });
    } catch {}
  }

  let y = 140;
  const leftX = 40;

  const draw = (label, value) => {
    doc.font("Helvetica-Bold").text(label, leftX, y);
    doc.font("Helvetica").text(value || "N/A", leftX + 150, y);
    y += 25;
  };

  draw("First Name:", data.firstname);
  draw("Middle Name:", data.middlename);
  draw("Last Name:", data.surname);
  draw("Date of Birth:", data.birthdate);
  draw("Gender:", data.gender);

  doc.fontSize(14).font("Helvetica-Bold")
    .text("NIN NUMBER:", leftX, y + 10);

  doc.fontSize(20)
    .text((data.nin || "").replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3"), leftX + 150, y + 5);

  y += 50;

  draw("Tracking ID:", data.trackingId);
  draw("Residence State:", data.residence_state);
  draw("Birth State:", data.birth_state);
  draw("Address:", data.residence_address);

  const rightX = pageWidth - 260;

  doc.fillColor("green").fontSize(22).text("Verified", rightX, 160);
  doc.fillColor("black").fontSize(9)
    .text("Official NIMC document. Valid for lifetime.", rightX, 200, { width: 220 });
}


// =======================================================
// 🟢 PREMIUM SLIP (REAL CARD STYLE)
// =======================================================
async function generatePremiumSlip(doc, data) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const bg = path.join(__dirname, "../assets/premium-bg.png");

  try {
    doc.image(bg, 0, 0, { width: pageWidth, height: pageHeight });
  } catch {}

  // Passport
  if (data.photo) {
    try {
      const img = Buffer.from(data.photo.replace(/^data:image\/\w+;base64,/, ""), "base64");
      doc.image(img, 60, 150, { width: 130, height: 150 });
    } catch {}
  }

  // QR
  const qr = await QRCode.toDataURL(JSON.stringify({
    nin: data.nin,
    name: `${data.firstname} ${data.surname}`
  }));

  const qrBuffer = Buffer.from(qr.replace(/^data:image\/png;base64,/, ""), "base64");
  doc.image(qrBuffer, pageWidth - 170, 80, { width: 120 });

  // Text
  doc.fontSize(12).fillColor("black");
  doc.text(data.surname, 260, 170);
  doc.text(`${data.firstname}, ${data.middlename}`, 260, 210);
  doc.text(data.birthdate, 260, 260);
  doc.text(data.gender, 450, 260);

  // NIN
  const formatted = (data.nin || "").replace(/(\d{4})(\d{3})(\d{4})/, "$1   $2   $3");

  doc.fontSize(28).font("Helvetica-Bold")
    .text(formatted, 180, pageHeight - 120);

  doc.fontSize(14).text("NGA", pageWidth - 150, 220);

  const today = new Date().toLocaleDateString("en-GB");
  doc.text(today, pageWidth - 160, 270);
}


// =======================================================
// 🔵 LONG SLIP (TABLE STRUCTURE)
// =======================================================
function generateLongSlip(doc, data) {
  const margin = 40;
  const width = doc.page.width - margin * 2;
  let y = 40;

  const coat = path.join(__dirname, "../assets/coat.png");
  const nimc = path.join(__dirname, "../assets/nimc-logo.png");

  try { doc.image(coat, margin, y, { width: 50 }); } catch {}
  try { doc.image(nimc, margin + width - 80, y, { width: 60 }); } catch {}

  doc.fontSize(16).font("Helvetica-Bold")
    .text("National Identity Management System", margin, y, { align: "center", width });

  y += 20;

  doc.fontSize(12).text("Federal Republic of Nigeria", { align: "center" });
  y += 15;
  doc.fontSize(11).text("National Identification Number Slip (NINS)", { align: "center" });

  y += 30;

  const draw = (x, y, w, h, label, value) => {
    doc.rect(x, y, w, h).stroke();
    doc.fontSize(9).font("Helvetica-Bold").text(label, x + 5, y + 5);
    doc.font("Helvetica").text(value || "N/A", x + 5, y + 20);
  };

  draw(margin, y, 200, 40, "Tracking ID:", data.trackingId);
  draw(margin + 200, y, 200, 40, "Surname:", data.surname);
  draw(margin + 400, y, 200, 160, "Address:", data.residence_address);

  y += 40;

  draw(margin, y, 200, 40, "NIN:", data.nin);
  draw(margin + 200, y, 200, 40, "First Name:", data.firstname);

  y += 40;

  draw(margin + 200, y, 200, 40, "Middle Name:", data.middlename);

  y += 40;

  draw(margin + 200, y, 200, 40, "Gender:", data.gender);

  if (data.photo) {
    try {
      const img = Buffer.from(data.photo.replace(/^data:image\/\w+;base64,/, ""), "base64");
      doc.image(img, margin + 420, y - 120, { width: 120, height: 140 });
    } catch {}
  }

  y += 80;

  doc.rect(margin, y, width, 80).stroke();

  doc.fontSize(9).text(
    "Note: The National Identification Number (NIN) is your identity.",
    margin + 10,
    y + 10,
    { width: width - 20 }
  );
}


// ==============================
module.exports = router;