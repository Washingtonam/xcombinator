const express = require("express");
const router = express.Router();
const pdf = require("html-pdf-node");
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

    // ✅ FIXED (IMPORTANT)
    if (type === "data") {
      html = generateDataHTML({ ...data, trackingId });
    } 
    else if (type === "premium") {
      html = await generatePremiumSlipHTML({ ...data, trackingId });
    } 
    else if (type === "long") {
      html = generateLongHTML({ ...data, trackingId });
    } 
    else {
      return res.status(400).json({ message: "Invalid slip type" });
    }

    if (!html || html.length < 50) {
      return res.status(500).json({ message: "HTML generation failed" });
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
    console.error("🔥 PDF ERROR:", error);
    res.status(500).json({ message: "Slip generation failed" });
  }
});


// =======================================================
// 🟡 DATA SLIP (CLEAN + ALIGNED)
// =======================================================
function generateDataHTML(data) {
  const formattedNIN = (data.nin || "")
    .replace(/(\d{4})(\d{3})(\d{4})/, "$1   $2   $3");

  return `
  <html>
  <body style="font-family: Arial; margin:0; background:#efefef;">

  <div style="padding:25px 40px;">

    <div style="display:flex; justify-content:space-between; align-items:center;">
      <img src="https://xcombinator.com.ng/assets/coat.png" width="55"/>
      
      <div style="text-align:center;">
        <div style="font-size:22px; color:#666;">Federal Republic of Nigeria</div>
        <div style="font-size:22px; font-weight:bold;">Verified NIN Details</div>
      </div>

      <img src="https://xcombinator.com.ng/assets/nimc-logo.png" width="70"/>
    </div>

    <div style="display:flex; margin-top:20px;">

      <div style="width:40%; font-size:15px; line-height:2;">
        <div><b>First Name:</b> ${data.firstname}</div>
        <div><b>Middle Name:</b> ${data.middlename}</div>
        <div><b>Last Name:</b> ${data.surname}</div>
        <div><b>Date of Birth:</b> ${data.birthdate}</div>
        <div><b>Gender:</b> ${data.gender}</div>
      </div>

      <div style="width:25%; text-align:center;">
        <img src="${data.photo}" style="width:120px;height:140px;object-fit:cover"/>
        ${data.signature ? `<img src="${data.signature}" style="width:100px;margin-top:5px"/>` : ""}
      </div>

      <div style="width:35%; font-size:13px;">
        <div style="color:green;font-size:22px;font-weight:bold;">Verified</div>

        <div style="margin-top:5px;">
          This is a property of NIMC Nigeria. If found, return to nearest office.
        </div>

        <ul>
          <li>Property of Nigeria</li>
          <li>Does not confer citizenship</li>
          <li><span style="color:red;">DOES NOT EXPIRE</span></li>
        </ul>
      </div>

    </div>

    <div style="margin-top:15px;font-size:18px;">
      <b>NIN NUMBER:</b> ${formattedNIN}
    </div>

  </div>

  </body>
  </html>
  `;
}


// =======================================================
// 🟢 PREMIUM SLIP (FIXED + SPLIT FRONT/BACK)
// =======================================================
async function generatePremiumSlipHTML(data) {
  const QRCode = require("qrcode");

  const qr = await QRCode.toDataURL(
    JSON.stringify({
      nin: data.nin,
      name: `${data.firstname} ${data.surname}`,
    })
  );

  const formattedNIN = (data.nin || "")
    .replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");

  const issueDate = new Date().toLocaleDateString("en-GB");

  return `
  <html>
  <head>
    <style>
      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
      }

      .page {
        width: 9.1cm;
        margin: auto;
      }

      .card {
        width: 9.1cm;
        height: 5.4cm;
        position: relative;
        overflow: hidden;
      }

      .front {
        background: url('https://xcombinator.com.ng/assets/premium-bg.png') no-repeat center/cover;
      }

      .back {
        border: 1px solid black;
        transform: rotate(180deg);
        padding: 12px;
        box-sizing: border-box;
      }

      .label {
        font-size: 6.5px;
        color: #222;
      }

      .value {
        font-size: 9px;
        font-weight: bold;
      }

      .nin-label {
        font-size: 7px;
      }

      .nin-main {
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 2px;
      }

    </style>
  </head>

  <body>

  <div class="page">

    <!-- ================= FRONT ================= -->
    <div class="card front">

      <!-- HEADER -->
      <div style="
        position:absolute;
        top:5px;
        left:10px;
        font-size:10px;
        font-weight:bold;
        color:#0b7d2b;
      ">
        FEDERAL REPUBLIC OF NIGERIA
      </div>

      <div style="
        position:absolute;
        top:16px;
        left:10px;
        font-size:8.5px;
        font-weight:bold;
      ">
        DIGITAL NIN SLIP
      </div>

      <!-- PASSPORT -->
      <img src="${data.photo}" style="
        position:absolute;
        left:10px;
        top:28px;
        width:58px;
        height:68px;
        object-fit:cover;
        border:1px solid #ccc;
      "/>

      <!-- QR -->
      <img src="${qr}" style="
        position:absolute;
        right:8px;
        top:8px;
        width:62px;
      "/>

      <!-- DETAILS BLOCK -->
      <div style="
        position:absolute;
        left:75px;
        top:28px;
        width:120px;
      ">

        <div class="label">SURNAME/NOM</div>
        <div class="value">${data.surname || ""}</div>

        <div class="label" style="margin-top:3px;">GIVEN NAMES/PRENOMS</div>
        <div class="value">
          ${data.firstname || ""}, ${data.middlename || ""}
        </div>

        <div class="label" style="margin-top:3px;">DATE OF BIRTH</div>
        <div class="value">${data.birthdate || ""}</div>

      </div>

      <!-- SEX -->
      <div style="
        position:absolute;
        left:75px;
        top:82px;
      ">
        <span class="label">SEX/SEXE</span><br/>
        <span class="value">${data.gender || ""}</span>
      </div>

      <!-- NGA + DATE -->
      <div style="
        position:absolute;
        right:28px;
        top:72px;
        font-size:12px;
        font-weight:bold;
      ">NGA</div>

      <div style="
        position:absolute;
        right:15px;
        top:88px;
        font-size:6.5px;
      ">
        ISSUE DATE
      </div>

      <div style="
        position:absolute;
        right:15px;
        top:98px;
        font-size:8px;
        font-weight:bold;
      ">
        ${issueDate}
      </div>

      <!-- NIN LABEL -->
      <div style="
        position:absolute;
        bottom:30px;
        left:40px;
      " class="nin-label">
        National Identification Number (NIN)
      </div>

      <!-- MAIN NIN -->
      <div style="
        position:absolute;
        bottom:10px;
        left:40px;
      " class="nin-main">
        ${formattedNIN}
      </div>

      <!-- WATERMARK NIN (4 POSITIONS) -->
      <div style="position:absolute; left:4px; top:14px; font-size:6px; transform:rotate(-30deg); opacity:0.4;">
        ${data.nin}
      </div>

      <div style="position:absolute; left:4px; bottom:18px; font-size:6px; transform:rotate(30deg); opacity:0.4;">
        ${data.nin}
      </div>

      <div style="position:absolute; right:4px; top:18px; font-size:6px; transform:rotate(30deg); opacity:0.4;">
        ${data.nin}
      </div>

      <div style="position:absolute; right:4px; bottom:15px; font-size:6px; transform:rotate(-30deg); opacity:0.4;">
        ${data.nin}
      </div>

    </div>

    <!-- ================= BACK ================= -->
    <div class="card back">

      <div style="text-align:center;">

        <div style="font-size:15px; font-weight:bold;">
          DISCLAIMER
        </div>

        <div style="font-size:10px; margin-top:4px;">
          Trust, but verify
        </div>

        <div style="font-size:9px; margin-top:10px; line-height:1.4;">
          Kindly ensure each time this ID is presented, that you verify the 
          credentials using a Government-approved verification resource.
          The details on the front of this NIN slip must EXACTLY match 
          the verification result.
        </div>

        <div style="font-size:12px; font-weight:bold; margin-top:12px;">
          CAUTION!
        </div>

        <div style="font-size:9px; margin-top:8px; line-height:1.4;">
          If this NIN was not issued to the person presenting it, please DO NOT 
          attempt to scan, photocopy or replicate personal data contained herein.
          You are only permitted to scan the barcode for identity verification.
        </div>

      </div>

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
  <body style="font-family:Arial;padding:20px;">

    <div style="display:flex;justify-content:space-between;">
      <img src="https://xcombinator.com.ng/assets/coat.png" width="50"/>
      <img src="https://xcombinator.com.ng/assets/nimc-logo.png" width="70"/>
    </div>

    <h3 style="text-align:center;">National Identification Number Slip</h3>

    <table border="1" cellpadding="10" width="100%">
      <tr><td>NIN</td><td>${data.nin}</td></tr>
      <tr><td>Surname</td><td>${data.surname}</td></tr>
      <tr><td>First Name</td><td>${data.firstname}</td></tr>
      <tr><td>Middle Name</td><td>${data.middlename}</td></tr>
      <tr><td>Gender</td><td>${data.gender}</td></tr>
      <tr><td>Tracking ID</td><td>${data.trackingId}</td></tr>
    </table>

    <p style="margin-top:20px;">
      The NIN is your identity. Keep it secure.
    </p>

  </body>
  </html>
  `;
}

module.exports = router;