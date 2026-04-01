const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const path = require("path");

// ==============================
// 🔢 GENERATORS
// ==============================
const generateSerial = () => {
  return "NIMC-" + new Date().getFullYear() + "-" +
    Math.random().toString(36).substring(2, 10).toUpperCase();
};

const generateTrackingId = () => {
  return "TRK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
};

// ==============================
// 🧾 GENERATE ADVANCED SLIP
// ==============================
router.post("/generate-nin-slip", async (req, res) => {
  try {
    const { data, type } = req.body;

    if (!data) {
      return res.status(400).json({ message: "No data provided" });
    }

    const serial = generateSerial();
    const trackingId = generateTrackingId();

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=NIN-slip.pdf");

    doc.pipe(res);

    const green = "#006400";
    const gray = "#f2f2f2";

    const fullName = `${data.firstname} ${data.middlename || ""} ${data.surname}`;

    // =========================
    // 🏢 HEADER WITH LOGO
    // =========================
    const logoPath = path.join(__dirname, "../assets/nimc-logo.png");

    try {
      doc.image(logoPath, 40, 40, { width: 50 });
    } catch {}

    doc
      .fontSize(14)
      .text("NATIONAL IDENTITY MANAGEMENT COMMISSION", 100, 45);

    doc
      .fontSize(11)
      .text(
        type === "premium"
          ? "NIN PREMIUM SLIP"
          : type === "long"
          ? "NIN LONG SLIP"
          : "NIN DATA PAGE",
        100,
        65
      );

    // =========================
    // 🔢 SERIAL + TRACKING
    // =========================
    doc
      .fontSize(9)
      .text(`Serial No: ${serial}`, 40, 100);

    doc
      .text(`Tracking ID: ${trackingId}`, 300, 100);

    // =========================
    // 📷 PASSPORT
    // =========================
    if (data.photo) {
      try {
        const img = Buffer.from(
          data.photo.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );

        doc.image(img, 420, 120, {
          width: 100,
          height: 110,
        });
      } catch {}
    }

    // =========================
    // 📋 TABLE
    // =========================
    const drawRow = (label, value, y) => {
      doc.rect(40, y, 200, 25).fill(gray).stroke();
      doc.fillColor("black").text(label, 45, y + 7);

      doc.rect(240, y, 315, 25).stroke();
      doc.text(value || "N/A", 245, y + 7);
    };

    let y = 140;

    drawRow("Surname", data.surname, y); y += 25;
    drawRow("First Name", data.firstname, y); y += 25;
    drawRow("Middle Name", data.middlename, y); y += 25;
    drawRow("NIN", data.nin, y); y += 25;
    drawRow("Date of Birth", data.birthdate, y); y += 25;
    drawRow("Gender", data.gender, y); y += 25;
    drawRow("Phone", data.telephoneno, y); y += 25;

    if (type !== "data") {
      drawRow("Address", data.residence_address, y); y += 25;
      drawRow("State", data.residence_state, y); y += 25;
      drawRow("LGA", data.residence_lga, y); y += 25;
    }

    // =========================
    // 🔳 QR CODE
    // =========================
    const qrData = JSON.stringify({
      nin: data.nin,
      name: fullName,
      trackingId,
    });

    const qr = await QRCode.toDataURL(qrData);

    const qrBuffer = Buffer.from(
      qr.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );

    doc.image(qrBuffer, 420, y + 20, { width: 100 });

    // =========================
    // 🖊 SIGNATURE
    // =========================
    doc
      .moveTo(40, y + 120)
      .lineTo(200, y + 120)
      .stroke();

    doc.fontSize(10).text("Authorized Officer", 40, y + 125);

    // =========================
    // 🔴 STAMP
    // =========================
    const stampPath = path.join(__dirname, "../assets/stamp.png");

    try {
      doc.image(stampPath, 220, y + 90, {
        width: 100,
        opacity: 0.6,
      });
    } catch {}

    // =========================
    // 💧 WATERMARK
    // =========================
    doc
      .opacity(0.1)
      .fontSize(70)
      .rotate(45, { origin: [300, 400] })
      .text("NIMC", 100, 300)
      .rotate(-45)
      .opacity(1);

    // =========================
    // 🧾 FOOTER
    // =========================
    doc
      .fontSize(8)
      .text(
        "This slip is generated electronically and can be verified using the QR code.",
        40,
        760,
        { align: "center" }
      );

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate slip" });
  }
});

module.exports = router;