const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");

// ==============================
// 🔢 TRACKING ID
// ==============================
const generateTrackingId = () => {
  return "TRK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
};

// ==============================
// 🧠 HTML GENERATOR
// ==============================
const generateHTML = (data, type) => {
  const fullName = `${data.firstname || ""} ${data.middlename || ""} ${data.surname || ""}`;
  const formattedNIN = (data.nin || "").replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");

  // =========================
  // 🟡 DATA SLIP
  // =========================
  if (type === "data") {
    return `
    <html>
    <body style="font-family: Arial; background:#eeeeee; padding:40px;">

      <div style="text-align:center;">
        <h2 style="margin:0;">Federal Republic of Nigeria</h2>
        <h3 style="margin-top:5px;">Verified NIN Details</h3>
      </div>

      <div style="text-align:center; margin:20px;">
        <img src="${data.photo || ""}" width="140"/>
      </div>

      <div style="margin-top:30px; font-size:14px;">
        <p><b>First Name:</b> ${data.firstname}</p>
        <p><b>Middle Name:</b> ${data.middlename}</p>
        <p><b>Surname:</b> ${data.surname}</p>
        <p><b>Date of Birth:</b> ${data.birthdate}</p>
        <p><b>Gender:</b> ${data.gender}</p>
      </div>

      <h2 style="margin-top:30px;">NIN: ${formattedNIN}</h2>

    </body>
    </html>
    `;
  }

  // =========================
  // 🟢 PREMIUM SLIP (CARD)
  // =========================
  if (type === "premium") {
    return `
    <html>
    <body style="font-family: Arial; margin:0; padding:20px;">

      <div style="width:700px; border:1px solid #000; padding:20px;">

        <div style="display:flex; justify-content:space-between;">
          <img src="${data.photo || ""}" width="130"/>
          
          <div style="text-align:right;">
            <p><b>NGA</b></p>
            <p>${new Date().toLocaleDateString("en-GB")}</p>
          </div>
        </div>

        <div style="margin-top:20px;">
          <p><b>SURNAME:</b> ${data.surname}</p>
          <p><b>GIVEN NAMES:</b> ${fullName}</p>
          <p><b>DOB:</b> ${data.birthdate}</p>
          <p><b>GENDER:</b> ${data.gender}</p>
        </div>

        <h2 style="margin-top:30px;">${formattedNIN}</h2>

        <p style="font-size:10px; margin-top:20px;">
          This card is property of NIMC. Verify before use.
        </p>

      </div>

    </body>
    </html>
    `;
  }

  // =========================
  // 🔵 LONG SLIP (TABLE)
  // =========================
  if (type === "long") {
    return `
    <html>
    <body style="font-family: Arial; padding:20px;">

      <h3 style="text-align:center;">National Identification Number Slip</h3>

      <table border="1" cellspacing="0" cellpadding="10" width="100%">
        <tr>
          <td><b>Tracking ID</b><br>${data.trackingId}</td>
          <td><b>Surname</b><br>${data.surname}</td>
          <td rowspan="3"><b>Address</b><br>${data.residence_address}</td>
        </tr>

        <tr>
          <td><b>NIN</b><br>${data.nin}</td>
          <td><b>First Name</b><br>${data.firstname}</td>
        </tr>

        <tr>
          <td></td>
          <td><b>Middle Name</b><br>${data.middlename}</td>
        </tr>

        <tr>
          <td></td>
          <td><b>Gender</b><br>${data.gender}</td>
          <td></td>
        </tr>
      </table>

      <p style="margin-top:20px; font-size:12px;">
      Note: The National Identification Number (NIN) is your identity.
      </p>

    </body>
    </html>
    `;
  }

  return `<h1>Invalid type</h1>`;
};

// ==============================
// 🚀 MAIN ROUTE
// ==============================
router.post("/generate-nin-slip", async (req, res) => {
  try {
    const { data, type } = req.body;

    if (!data || !type) {
      return res.status(400).json({ message: "Missing data or type" });
    }

    const trackingId = generateTrackingId();

    const html = generateHTML({ ...data, trackingId }, type);

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "load" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=nin-${type}-slip.pdf`,
    });

    res.send(pdf);

  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ message: "Failed to generate slip" });
  }
});

module.exports = router;