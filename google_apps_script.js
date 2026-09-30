/**
 * KQE Events — Google Apps Script for Automated Google Sheet Registration & Razorpay
 * 
 * INSTRUCTIONS TO SET UP:
 * 1. Open Google Sheets (https://sheets.new).
 * 2. Rename the first sheet tab to "Registrations".
 * 3. In Google Sheets menu, click: Extensions -> Apps Script.
 * 4. Replace all code in the editor with this script.
 * 5. Go to Project Settings (Gear icon) -> Script Properties:
 *    Add RAZORPAY_KEY_ID = rzp_live_TeebVffQrS2gfO (or test key)
 *    Add RAZORPAY_KEY_SECRET = QI5fkpqv95GcC6w6ikLWIJ5Z (or test secret)
 * 6. Click "Deploy" -> "New deployment".
 * 7. Select type: "Web app".
 * 8. Set "Execute as": "Me".
 * 9. Set "Who has access": "Anyone" (Crucial so website can submit data).
 * 10. Click "Deploy", authorize permissions, and copy the Web App URL!
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === 'createOrder') {
      return handleCreateOrder(data);
    } else if (action === 'verifyPayment') {
      return handleVerifyPayment(data);
    } else {
      // Default to standard free registration
      return handleRegistration(data);
    }

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleCreateOrder(data) {
  var courseId = data.eventId;
  
  // Hardcoded price based on course, can be updated later
  var amount = 1;
  if (courseId !== 'AGENTIC_AI') {
    amount = 1; 
  }

  var keyId = PropertiesService.getScriptProperties().getProperty('RAZORPAY_KEY_ID');
  var keySecret = PropertiesService.getScriptProperties().getProperty('RAZORPAY_KEY_SECRET');

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials missing from Script Properties");
  }

  // Create Razorpay Order
  var payload = {
    "amount": amount * 100, // in paise
    "currency": "INR",
    "receipt": "receipt_" + new Date().getTime(),
    "payment_capture": 1
  };

  var options = {
    "method": "post",
    "headers": {
      "Authorization": "Basic " + Utilities.base64Encode(keyId + ":" + keySecret)
    },
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
  var orderResult = JSON.parse(response.getContentText());

  if (orderResult.error) {
    throw new Error(orderResult.error.description);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ "result": "success", "orderId": orderResult.id, "amount": amount }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleVerifyPayment(data) {
  var keySecret = PropertiesService.getScriptProperties().getProperty('RAZORPAY_KEY_SECRET');
  
  var orderId = data.razorpay_order_id;
  var paymentId = data.razorpay_payment_id;
  var signature = data.razorpay_signature;

  var generatedSignature = Utilities.computeHmacSha256Signature(orderId + "|" + paymentId, keySecret);
  var generatedSignatureHex = generatedSignature.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  if (generatedSignatureHex !== signature) {
    throw new Error("Invalid Payment Signature");
  }

  // Payment is verified, save to single "Registrations" sheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var regSheet = ss.getSheetByName("Registrations");
  if (!regSheet) {
    regSheet = ss.insertSheet("Registrations");
  }
  
  // Auto-create headers if sheet is empty
  if (regSheet.getLastRow() === 0) {
    regSheet.appendRow([
      "Timestamp", "Event Title", "Event ID", "Full Name", "Email", "Phone", 
      "Year", "College", "Department", "Status", "Payment ID", "Order ID", "Amount", "Signature", "Coupon Code"
    ]);
  }

  regSheet.appendRow([
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    data.eventTitle || "",
    data.eventId || "",
    data.fullName || "",
    data.email || "",
    data.phone || "",
    data.year || "",
    data.college || "",
    data.branch || "",
    "PAID",
    paymentId,
    orderId,
    data.amount || 1,
    signature,
    data.couponCode || ""
  ]);

  // Send Attractive Confirmation Email
  try {
    var subject = "Registration Confirmed: " + data.eventTitle;
    var htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f7f6;
        color: #333333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      }
      .header {
        background: linear-gradient(135deg, #4285F4 0%, #34A853 100%);
        padding: 30px 20px;
        text-align: center;
        color: white;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 1px;
      }
      .content {
        padding: 40px 30px;
      }
      .greeting {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #1A1A2E;
      }
      .success-box {
        background-color: #e8f5e9;
        border-left: 5px solid #34A853;
        padding: 20px;
        border-radius: 4px;
        margin-bottom: 30px;
      }
      .success-box h2 {
        margin: 0 0 10px 0;
        color: #2e7d32;
        font-size: 18px;
      }
      .success-box p {
        margin: 0;
        color: #1b5e20;
        font-size: 15px;
      }
      .details-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      .details-table th, .details-table td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #eeeeee;
      }
      .details-table th {
        background-color: #f8f9fa;
        color: #5F6368;
        font-weight: 600;
        width: 40%;
      }
      .details-table td {
        color: #1A1A2E;
        font-weight: 500;
      }
      .about-us {
        background-color: #e8f0fe;
        padding: 25px;
        border-radius: 8px;
        text-align: center;
      }
      .about-us h3 {
        margin: 0 0 15px 0;
        color: #1967d2;
        font-size: 18px;
      }
      .about-us p {
        margin: 0 0 10px 0;
        color: #3c4043;
        line-height: 1.6;
        font-size: 15px;
      }
      .footer {
        background-color: #f8f9fa;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #eeeeee;
      }
      .footer p {
        margin: 0;
        color: #9AA0A6;
        font-size: 13px;
      }
      @media only screen and (max-width: 600px) {
        .container {
          margin: 20px 15px;
          width: auto;
        }
        .content {
          padding: 30px 20px;
        }
      }
    </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kaizen Q Events</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ` + data.fullName + `,</div>
          
          <div class="success-box">
            <h2>🎉 Successfully Completed Payment!</h2>
            <p>Your registration for <strong>` + data.eventTitle + `</strong> is confirmed. We are thrilled to have you join us.</p>
          </div>

          <table class="details-table">
            <tr>
              <th>Order ID</th>
              <td>` + orderId + `</td>
            </tr>
            <tr>
              <th>Payment ID</th>
              <td>` + paymentId + `</td>
            </tr>
            <tr>
              <th>Amount Paid</th>
              <td>₹` + (data.amount || 1) + `</td>
            </tr>
            <tr>
              <th>Email Address</th>
              <td>` + data.email + `</td>
            </tr>
          </table>

          <div class="about-us">
            <h3>Welcome to the Kaizen Q Family! 🚀</h3>
            <p>At Kaizen Q, we believe in continuous improvement and empowering individuals with cutting-edge technological skills.</p>
            <p>Our workshops and bootcamps are designed to bridge the gap between theory and real-world application. Get ready to elevate your career, master new technologies, and build the future with us!</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ` + new Date().getFullYear() + ` Kaizen Q Events. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    if (data.email) {
      MailApp.sendEmail({
        to: data.email,
        subject: subject,
        htmlBody: htmlBody
      });
    }
  } catch (e) {
    console.log("Email failed", e);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ "result": "success", "message": "Payment verified and registration saved." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRegistration(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Registrations") || ss.getActiveSheet();
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "Event Title", "Event ID", "Full Name", "Email", "Phone", 
      "Year", "College", "Department", "Status", "Payment ID", "Order ID", "Amount", "Signature", "Coupon Code"
    ]);
  }

  var status = "REGISTERED (FREE)";
  if (data.couponCode && data.couponCode.trim().toUpperCase() === "KQEAG2k26") {
    status = "REGISTERED (100% OFF VIA COUPON)";
  }

  sheet.appendRow([
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    data.eventTitle || "",
    data.eventId || "",
    data.fullName || "",
    data.email || "",
    data.phone || "",
    data.year || "",
    data.college || "",
    data.branch || "",
    status,
    "", "", "", "",
    data.couponCode || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput("KQE Registration & Payment Webhook Endpoint Active!");
}
