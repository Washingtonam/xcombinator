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

  // =========================
  // 🎨 BACKGROUND
  // =========================
  doc.rect(0, 0, pageWidth, doc.page.height).fill("#eeeeee");
  doc.fillColor("black");

  // =========================
  // 🏢 HEADER (COAT + NIMC)
  // =========================
  const coat = path.join(__dirname, "../assets/coat.png");
  const nimc = path.join(__dirname, "../assets/nimc-logo.png");

  try {
    doc.image(coat, 120, 30, { width: 50 });
  } catch {}

  try {
    doc.image(nimc, pageWidth - 180, 30, { width: 80 });
  } catch {}

  // =========================
  // 🇳🇬 TITLE
  // =========================
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#555")
    .text("Federal Republic of Nigeria", 0, 40, {
      align: "center",
    });

  // =========================
  // 🧾 SUBTITLE
  // =========================
  doc
    .moveDown()
    .fontSize(22)
    .fillColor("#777")
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

      doc.image(img, pageWidth / 2 - 70, 120, {
        width: 140,
        height: 150,
      });
    } catch {}
  }

  // =========================
  // ✍ SIGNATURE (UNDER PHOTO)
  // =========================
  const signature = path.join(__dirname, "../assets/signature.png");

  try {
    doc.image(signature, pageWidth / 2 - 60, 280, {
      width: 120,
    });
  } catch {}

  // =========================
  // 👤 LEFT DETAILS
  // =========================
  let y = 140;
  const leftX = 60;

  const draw = (label, value) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("black")
      .text(label, leftX, y);

    doc
      .font("Helvetica")
      .text(value || "N/A", leftX + 160, y);

    y += 35;
  };

  draw("First Name:", data.firstname);
  draw("Middle Name:", data.middlename);
  draw("Last Name:", data.surname);
  draw("Date of Birth:", data.birthdate);
  draw("Gender:", data.gender);

  // =========================
  // 🔢 NIN NUMBER (BIG)
  // =========================
  const formattedNIN = (data.nin || "")
    .replace(/(\d{4})(\d{3})(\d{4})/, "$1   $2   $3");

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#888")
    .text("NIN NUMBER:", leftX, y + 10);

  doc
    .fontSize(20)
    .fillColor("#555")
    .text(formattedNIN, leftX + 180, y + 5);

  y += 60;

  draw("Tracking ID:", data.trackingId);
  draw("Residence State:", data.residence_state);
  draw("Birth State:", data.birth_state);
  draw("Address:", data.residence_address);

  // =========================
  // 📄 RIGHT SIDE (VERIFIED BLOCK)
  // =========================
  const rightX = pageWidth - 300;

  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .fillColor("green")
    .text("Verified", rightX, 150);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#444")
    .text(
      "This is a property of National Identity Management Commission (NIMC), Nigeria. If found, please return to the nearest NIMC office.",
      rightX,
      200,
      { width: 240 }
    );

  doc.moveDown();

  doc
    .text(
      "1. This NIN slip remains the property of the Federal Republic of Nigeria.\n" +
      "2. This NIN slip does not confer citizenship.\n" +
      "3. This slip is valid for lifetime and ",
      rightX,
      270,
      { width: 240 }
    );

  doc
    .fillColor("red")
    .text("DOES NOT EXPIRE", rightX + 130, 330);
}


// =======================================================
// 🟢 PREMIUM SLIP (REAL CARD STYLE)
// =======================================================
async function generatePremiumSlip(doc, data) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // =========================
  // 🖼 FRONT SIDE (CARD)
  // =========================
  const bg = path.join(__dirname, "../assets/premium-bg.png");

  try {
    doc.image(bg, 0, 0, {
      width: pageWidth,
      height: pageHeight / 2,
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

      doc.image(img, 50, 70, {
        width: 130,
        height: 150,
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

  doc.image(qrBuffer, pageWidth - 170, 40, { width: 120 });

  // =========================
  // 🧾 TEXT DETAILS
  // =========================
  doc.fillColor("#333");

  doc.fontSize(11).text("SURNAME/NOM", 220, 70);
  doc.font("Helvetica-Bold").text(data.surname || "N/A", 220, 90);

  doc.font("Helvetica").text("GIVEN NAMES/PRENOMS", 220, 120);
  doc.font("Helvetica-Bold").text(
    `${data.firstname || ""}, ${data.middlename || ""}`,
    220,
    140
  );

  doc.font("Helvetica").text("DATE OF BIRTH", 220, 180);
  doc.font("Helvetica-Bold").text(data.birthdate || "N/A", 220, 200);

  doc.font("Helvetica").text("SEX/SEXE", 400, 180);
  doc.font("Helvetica-Bold").text(data.gender || "N/A", 400, 200);

  // =========================
  // 🌍 COUNTRY + DATE
  // =========================
  doc.fontSize(18).font("Helvetica-Bold").text("NGA", pageWidth - 140, 150);

  const today = new Date().toLocaleDateString("en-GB");
  doc.fontSize(12).font("Helvetica").text("ISSUE DATE", pageWidth - 150, 180);
  doc.font("Helvetica-Bold").text(today, pageWidth - 150, 200);

  // =========================
  // 🔢 MAIN NIN (BIG)
  // =========================
  const formattedNIN = (data.nin || "")
    .replace(/(\d{4})(\d{3})(\d{4})/, "$1   $2   $3");

  doc
    .fontSize(28)
    .font("Helvetica-Bold")
    .fillColor("#444")
    .text(formattedNIN, 180, pageHeight / 2 - 60);

  // =========================
  // 🔁 SMALL NIN (REPEATED)
  // =========================
  doc.fontSize(10).fillColor("#888");

  const smallNIN = data.nin || "";

  doc.text(smallNIN, 40, 40, { rotate: 30 });
  doc.text(smallNIN, 40, 180, { rotate: -30 });

  doc.text(smallNIN, pageWidth - 200, 60, { rotate: 30 });
  doc.text(smallNIN, pageWidth - 200, 200, { rotate: -30 });

  // =========================
  // 🔻 BACK SIDE (DISCLAIMER)
  // =========================

  const startY = pageHeight / 2 + 40;

  doc
    .save()
    .rotate(180, {
      origin: [pageWidth / 2, startY + 100],
    });

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor("black")
    .text("DISCLAIMER", 0, startY, {
      align: "center",
    });

  doc
    .fontSize(12)
    .font("Helvetica-Oblique")
    .text("Trust, but verify", 0, startY + 30, {
      align: "center",
    });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      "Kindly ensure each time this ID is presented, that you verify the credentials using a Government-approved verification resource. The details on the front of this NIN slip must EXACTLY match the verification result.",
      80,
      startY + 60,
      { width: pageWidth - 160, align: "center" }
    );

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("CAUTION!", 0, startY + 120, {
      align: "center",
    });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      "If this NIN was not issued to the person presenting it, please DO NOT attempt to scan, photocopy or replicate personal data contained herein. You are only permitted to scan the barcode for identity verification.",
      80,
      startY + 150,
      { width: pageWidth - 160, align: "center" }
    );

  doc.restore();
}


// =======================================================
// 🔵 LONG SLIP (TABLE STRUCTURE)
// =======================================================
function generateLongSlip(doc, data) {
  const margin = 30;
  const pageWidth = doc.page.width - margin * 2;

  let y = 30;

  // =========================
  // 🏢 HEADER (LOGOS + TITLES)
  // =========================
  const coat = path.join(__dirname, "../assets/coat.png");
  const nimc = path.join(__dirname, "../assets/nimc-logo.png");

  try {
    doc.image(coat, margin, y, { width: 50 });
  } catch {}

  try {
    doc.image(nimc, margin + pageWidth - 70, y, { width: 60 });
  } catch {}

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("National Identity Management System", margin, y, {
      align: "center",
      width: pageWidth,
    });

  y += 22;

  doc
    .fontSize(12)
    .font("Helvetica")
    .text("Federal Republic of Nigeria", {
      align: "center",
    });

  y += 18;

  doc
    .fontSize(11)
    .text("National Identification Number Slip (NINS)", {
      align: "center",
    });

  y += 25;

  // =========================
  // 📦 TABLE SETUP
  // =========================
  const rowHeight = 45;

  const col1 = margin;
  const col2 = margin + 220;
  const col3 = margin + 440;
  const col4 = margin + 660;

  const drawCell = (x, y, w, h, label, value) => {
    doc.rect(x, y, w, h).stroke();

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(label, x + 5, y + 5);

    doc
      .font("Helvetica")
      .text(value || "N/A", x + 5, y + 22);
  };

  // =========================
  // ROW 1
  // =========================
  drawCell(col1, y, 220, rowHeight, "Tracking ID:", data.trackingId);
  drawCell(col2, y, 220, rowHeight, "Surname:", data.surname);

  doc.rect(col3, y, 220, rowHeight * 3).stroke();
  doc.font("Helvetica-Bold").text("Address:", col3 + 5, y + 5);
  doc.font("Helvetica").text(data.residence_address || "N/A", col3 + 5, y + 25);

  // =========================
  // PASSPORT (RIGHT SIDE)
  // =========================
  if (data.photo) {
    try {
      const img = Buffer.from(
        data.photo.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      doc.image(img, col4, y, {
        width: 120,
        height: 140,
      });
    } catch {}
  }

  y += rowHeight;

  // =========================
  // ROW 2
  // =========================
  drawCell(col1, y, 220, rowHeight, "NIN:", data.nin);
  drawCell(col2, y, 220, rowHeight, "First Name:", data.firstname);

  y += rowHeight;

  // =========================
  // ROW 3
  // =========================
  drawCell(col2, y, 220, rowHeight, "Middle Name:", data.middlename);

  y += rowHeight;

  // =========================
  // ROW 4
  // =========================
  drawCell(col2, y, 220, rowHeight, "Gender:", data.gender);

  y += rowHeight + 10;

  // =========================
  // 📝 NOTE SECTION
  // =========================
  doc.rect(margin, y, pageWidth, 80).stroke();

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(
      "Note: The National Identification Number (NIN) is your identity. It is confidential and may only be released for legitimate transactions.",
      margin + 10,
      y + 10,
      { width: pageWidth - 20 }
    );

  doc
    .text(
      "You will be notified when your National Identity Card is ready (for any enquiries please contact)",
      margin + 10,
      y + 35,
      { width: pageWidth - 20 }
    );

  y += 100;

  // =========================
  // 📞 FOOTER (4 BOXES)
  // =========================
  const boxWidth = pageWidth / 4;

  const footer = [
    "helpdesk@nimc.gov.ng",
    "www.nimc.gov.ng",
    "0700-CALL-NIMC\n(0700-2255-646)",
    "National Identity Management Commission\n11, Sokode Crescent, Off Dalaba Street, Zone 5 Wuse, Abuja Nigeria",
  ];

  footer.forEach((text, i) => {
    const x = margin + i * boxWidth;

    doc.rect(x, y, boxWidth, 70).stroke();

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(text, x + 10, y + 20, {
        width: boxWidth - 20,
      });
  });
}


// ==============================
module.exports = router;