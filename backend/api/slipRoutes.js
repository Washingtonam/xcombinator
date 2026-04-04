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

  return `
  <html>
  <head>
    <style>
      body {
        margin: 0;
        font-family: Arial;
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
        background: white;
        border-top: 2px solid black;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 10px;
        box-sizing: border-box;
      }

      .text-small { font-size: 8px; }
      .text-medium { font-size: 10px; }
      .text-big { font-size: 14px; font-weight: bold; }

    </style>
  </head>

  <body>

    <div class="page">

      <!-- ================= FRONT ================= -->
      <div class="card front">

        <!-- PASSPORT -->
        <img src="${data.photo}" style="
          position:absolute;
          left:8px;
          top:35px;
          width:50px;
          height:60px;
          object-fit:cover;
        "/>

        <!-- QR -->
        <img src="${qr}" style="
          position:absolute;
          right:8px;
          top:8px;
          width:50px;
        "/>

        <!-- TEXT -->
        <div style="position:absolute; left:65px; top:35px;" class="text-small">
          <div>SURNAME/NOM</div>
          <div class="text-medium">${data.surname || ""}</div>

          <div style="margin-top:4px;">GIVEN NAMES</div>
          <div class="text-medium">
            ${data.firstname || ""}, ${data.middlename || ""}
          </div>

          <div style="margin-top:4px;">
            DOB: ${data.birthdate || ""} &nbsp;&nbsp;
            SEX: ${data.gender || ""}
          </div>
        </div>

        <!-- NGA -->
        <div style="
          position:absolute;
          right:30px;
          top:70px;
          font-size:12px;
          font-weight:bold;
        ">NGA</div>

        <!-- DATE -->
        <div style="
          position:absolute;
          right:15px;
          top:85px;
          font-size:7px;
        ">
          ${new Date().toLocaleDateString("en-GB")}
        </div>

        <!-- NIN LABEL -->
        <div style="
          position:absolute;
          bottom:25px;
          left:40px;
          font-size:7px;
        ">
          National Identification Number (NIN)
        </div>

        <!-- MAIN NIN -->
        <div style="
          position:absolute;
          bottom:8px;
          left:40px;
          font-size:12px;
          font-weight:bold;
          letter-spacing:2px;
        ">
          ${formattedNIN}
        </div>

        <!-- SMALL NIN WATERMARK -->
        <div style="
          position:absolute;
          left:5px;
          top:10px;
          font-size:6px;
          transform:rotate(-25deg);
          opacity:0.4;
        ">
          ${data.nin}
        </div>

        <div style="
          position:absolute;
          right:5px;
          bottom:20px;
          font-size:6px;
          transform:rotate(25deg);
          opacity:0.4;
        ">
          ${data.nin}
        </div>

      </div>

      <!-- ================= BACK ================= -->
      <div class="card back">

        <div>
          <div style="font-size:12px; font-weight:bold;">
            DISCLAIMER
          </div>

          <div style="font-size:8px; margin-top:3px;">
            Trust, but verify
          </div>

          <div style="font-size:7px; margin-top:6px;">
            Verify credentials using approved systems.
          </div>

          <div style="font-size:9px; font-weight:bold; margin-top:8px;">
            CAUTION!
          </div>

          <div style="font-size:7px; margin-top:5px;">
            Do not copy or misuse this identity.
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