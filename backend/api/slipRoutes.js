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

    if (type === "data") {
        generateDataSlip(doc, data);
      }

      if (type === "premium") {
        generatePremiumSlip(doc, data);
      }

      if (type === "long") {
        generateLongSlip(doc, data);
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

const path = require("path");

function generateDataSlip(doc, data) {
  const pageWidth = doc.page.width;

  // =========================
  // 🎨 BACKGROUND
  // =========================
  doc.rect(0, 0, pageWidth, doc.page.height)
    .fill("#f5f0dc"); // light cream

  doc.fillColor("black");

  // =========================
  // 🏢 HEADER
  // =========================
  const coatPath = path.join(__dirname, "../assets/coat.png");
  const nimcLogo = path.join(__dirname, "../assets/nimc-logo.png");

  try {
    doc.image(coatPath, 40, 30, { width: 60 });
  } catch {}

  try {
    doc.image(nimcLogo, pageWidth - 120, 30, { width: 70 });
  } catch {}

  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("Federal Republic of Nigeria", 0, 40, {
      align: "center",
    });

  // =========================
  // 🧾 TITLE
  // =========================
  doc
    .moveDown()
    .fontSize(20)
    .text("Verified NIN Details", {
      align: "center",
    });

  // =========================
  // 📷 PASSPORT (CENTER)
  // =========================
  if (data.photo) {
    try {
      const img = Buffer.from(
        data.photo.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      doc.image(img, pageWidth / 2 - 60, 120, {
        width: 120,
        height: 130,
      });
    } catch {}
  }

  // =========================
  // 👤 LEFT DETAILS
  // =========================
  let y = 140;

  const leftX = 40;

  const drawText = (label, value) => {
    doc
      .font("Helvetica-Bold")
      .text(label, leftX, y);

    doc
      .font("Helvetica")
      .text(value || "N/A", leftX + 150, y);

    y += 25;
  };

  drawText("First Name:", data.firstname);
  drawText("Middle Name:", data.middlename);
  drawText("Last Name:", data.surname);
  drawText("Date of Birth:", data.birthdate);
  drawText("Gender:", data.gender);

  // =========================
  // 🧾 NIN NUMBER (BIG)
  // =========================
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("NIN NUMBER:", leftX, y + 10);

  doc
    .fontSize(20)
    .font("Helvetica")
    .text(
      (data.nin || "00000000000").replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3"),
      leftX + 150,
      y + 5
    );

  y += 50;

  drawText("Tracking ID:", data.trackingId || "AUTO-GENERATED");
  drawText("Residence State:", data.residence_state);
  drawText("Birth State:", data.birth_state);
  drawText("Address:", data.residence_address);

  // =========================
  // 📄 RIGHT SIDE (VERIFIED)
  // =========================
  const rightX = pageWidth - 260;

  doc
    .fontSize(22)
    .fillColor("green")
    .font("Helvetica-Bold")
    .text("Verified", rightX, 160);

  doc.fillColor("black");

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      "This is a property of National Identity Management Commission (NIMC), Nigeria. If found, please return to the nearest NIMC office.",
      rightX,
      200,
      { width: 220 }
    );

  doc.moveDown();

  doc.text(
    "1. This NIN slip remains property of the Federal Republic of Nigeria.\n" +
    "2. This slip does not confer citizenship.\n" +
    "3. This slip is valid for life and DOES NOT EXPIRE.",
    rightX,
    260,
    { width: 220 }
  );

  // =========================
  // 🔳 QR CODE
  // =========================
  // (optional later if needed)

}

const QRCode = require("qrcode");
const path = require("path");

async function generatePremiumSlip(doc, data) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // =========================
  // 🖼 BACKGROUND TEMPLATE
  // =========================
  const bgPath = path.join(__dirname, "../assets/premium-bg.png");

  try {
    doc.image(bgPath, 0, 0, {
      width: pageWidth,
      height: pageHeight,
    });
  } catch (err) {
    console.log("Background not found");
  }

  // =========================
  // 📷 PASSPORT (LEFT)
  // =========================
  if (data.photo) {
    try {
      const img = Buffer.from(
        data.photo.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      doc.image(img, 60, 150, {
        width: 130,
        height: 150,
      });
    } catch {}
  }

  // =========================
  // 🔳 QR CODE (TOP RIGHT)
  // =========================
  const qrData = JSON.stringify({
    nin: data.nin,
    name: `${data.firstname} ${data.surname}`,
  });

  const qr = await QRCode.toDataURL(qrData);

  const qrBuffer = Buffer.from(
    qr.replace(/^data:image\/png;base64,/, ""),
    "base64"
  );

  doc.image(qrBuffer, pageWidth - 170, 80, { width: 120 });

  // =========================
  // 🧾 TEXT OVERLAY
  // =========================
  doc.fillColor("black");

  // SURNAME
  doc
    .fontSize(12)
    .text(data.surname || "N/A", 260, 170);

  // FIRST + MIDDLE
  doc
    .text(
      `${data.firstname || ""}, ${data.middlename || ""}`,
      260,
      210
    );

  // DOB + GENDER
  doc
    .text(data.birthdate || "N/A", 260, 260);

  doc
    .text(data.gender || "N/A", 450, 260);

  // =========================
  // 🆔 NIN BIG DISPLAY
  // =========================
  const formattedNIN = (data.nin || "00000000000")
    .replace(/(\d{4})(\d{3})(\d{4})/, "$1   $2   $3");

  doc
    .fontSize(28)
    .font("Helvetica-Bold")
    .text(formattedNIN, 180, pageHeight - 120);

  // =========================
  // 🏷 COUNTRY CODE
  // =========================
  doc
    .fontSize(16)
    .text("NGA", pageWidth - 150, 220);

  // =========================
  // 📅 ISSUE DATE
  // =========================
  const today = new Date().toLocaleDateString("en-GB");

  doc
    .fontSize(12)
    .text(today, pageWidth - 160, 270);

}

const path = require("path");

function generateLongSlip(doc, data) {
  const margin = 40;
  const pageWidth = doc.page.width - margin * 2;

  let y = 40;

  // =========================
  // 🏢 HEADER
  // =========================
  const coat = path.join(__dirname, "../assets/coat.png");
  const nimc = path.join(__dirname, "../assets/nimc-logo.png");

  try {
    doc.image(coat, margin, y, { width: 50 });
  } catch {}

  try {
    doc.image(nimc, margin + pageWidth - 80, y, { width: 60 });
  } catch {}

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("National Identity Management System", margin, y, {
      align: "center",
      width: pageWidth,
    });

  y += 20;

  doc
    .fontSize(12)
    .text("Federal Republic of Nigeria", {
      align: "center",
    });

  y += 15;

  doc
    .fontSize(11)
    .text("National Identification Number Slip (NINS)", {
      align: "center",
    });

  y += 30;

  // =========================
  // 📦 TABLE GRID
  // =========================
  const col1 = margin;
  const col2 = margin + 200;
  const col3 = margin + 400;

  const rowHeight = 40;

  const drawCell = (x, y, w, h, label, value) => {
    doc.rect(x, y, w, h).stroke();

    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(label, x + 5, y + 5);

    doc
      .font("Helvetica")
      .text(value || "N/A", x + 5, y + 20);
  };

  // ROW 1
  drawCell(col1, y, 200, rowHeight, "Tracking ID:", data.trackingId || "AUTO");
  drawCell(col2, y, 200, rowHeight, "Surname:", data.surname);
  drawCell(col3, y, 200, rowHeight * 4, "Address:", data.residence_address);

  y += rowHeight;

  // ROW 2
  drawCell(col1, y, 200, rowHeight, "NIN:", data.nin);
  drawCell(col2, y, 200, rowHeight, "First Name:", data.firstname);

  y += rowHeight;

  // ROW 3
  drawCell(col2, y, 200, rowHeight, "Middle Name:", data.middlename);

  y += rowHeight;

  // ROW 4
  drawCell(col2, y, 200, rowHeight, "Gender:", data.gender);

  // =========================
  // 📷 PASSPORT BOX
  // =========================
  if (data.photo) {
    try {
      const img = Buffer.from(
        data.photo.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      doc.image(img, col3 + 20, y - 120, {
        width: 120,
        height: 140,
      });
    } catch {}
  }

  y += 80;

  // =========================
  // 📝 NOTE SECTION
  // =========================
  doc.rect(margin, y, pageWidth, 80).stroke();

  doc
    .fontSize(9)
    .text(
      "Note: The National Identification Number (NIN) is your identity. It is confidential and may only be released for legitimate transactions.\n\nYou will be notified when your National Identity Card is ready.",
      margin + 10,
      y + 10,
      { width: pageWidth - 20 }
    );

  y += 100;

  // =========================
  // 📞 FOOTER CONTACTS
  // =========================
  const boxWidth = pageWidth / 4;

  const footerData = [
    "helpdesk@nimc.gov.ng",
    "www.nimc.gov.ng",
    "0700-CALL-NIMC",
    "NIMC HQ, Abuja",
  ];

  footerData.forEach((text, i) => {
    doc.rect(margin + i * boxWidth, y, boxWidth, 60).stroke();

    doc
      .fontSize(9)
      .text(text, margin + i * boxWidth + 10, y + 20);
  });
}

module.exports = router;