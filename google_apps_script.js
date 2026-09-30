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
  var amount = 149;
  if (courseId !== 'AGENTIC_AI') {
    amount = 149; 
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
    data.amount || 149,
    signature,
    data.couponCode || ""
  ]);

  // Send the confirmation email
  sendRegistrationEmail(data, paymentId, orderId, data.amount || 149);

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

  // Send the confirmation email
  sendRegistrationEmail(data, null, null, 0);

  return ContentService
    .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput("KQE Registration & Payment Webhook Endpoint Active!");
}

function sendRegistrationEmail(data, paymentId, orderId, amount) {
  try {
    var subject = "✅ Registration Confirmed - " + data.eventTitle;
    
    var whatsappLink = "https://chat.whatsapp.com/ExRCwpN5nB0ExDkvctSzYB?s=cl&p=a&mlu=4&ilr=4";
    var whatsappQR = "https://res.cloudinary.com/dwv8kc9vb/image/upload/v1790786082/GAKQEPC_QR_ywjoiq.jpg";
    
    var paymentDetailsHtml = "";
    if (paymentId) {
      paymentDetailsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr>
            <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eeeeee; background-color: #f8f9fa; color: #5F6368; font-weight: 600; width: 40%;">Order ID</th>
            <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eeeeee; color: #1A1A2E; font-weight: 500;">` + orderId + `</td>
          </tr>
          <tr>
            <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eeeeee; background-color: #f8f9fa; color: #5F6368; font-weight: 600;">Payment ID</th>
            <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eeeeee; color: #1A1A2E; font-weight: 500;">` + paymentId + `</td>
          </tr>
          <tr>
            <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eeeeee; background-color: #f8f9fa; color: #5F6368; font-weight: 600;">Amount Paid</th>
            <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eeeeee; color: #1A1A2E; font-weight: 500;">₹` + (amount || 0) + `</td>
          </tr>
        </table>
      `;
    } else {
       paymentDetailsHtml = `
        <div style="background-color: #e3f2fd; border-left: 5px solid #2196F3; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
          <p style="margin: 0; color: #0d47a1; font-weight: bold;">Status: 100% Scholarship / Free Registration Applied</p>
        </div>
      `;
    }

    var htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #333333;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">Kaizen Q Events</h1>
        </div>
        
        <div style="padding: 40px 30px;">
          <div style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1A1A2E;">Hello ` + (data.fullName || "Learner") + `,</div>
          
          <div style="background-color: #e8f5e9; border-left: 5px solid #34A853; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 18px;">🎉 Registration Successful!</h2>
            <p style="margin: 0; color: #1b5e20; font-size: 15px; line-height: 1.5;">You are officially registered for <strong>` + data.eventTitle + `</strong>. We are thrilled to have you join us.</p>
          </div>

          ` + paymentDetailsHtml + `

          <div style="background-color: #fff8e1; border: 1px solid #ffe082; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; color: #f57f17; font-size: 20px;">📱 Action Required: Join WhatsApp Group</h3>
            <p style="margin: 0 0 20px 0; color: #5d4037; font-size: 15px;">All course updates, session links, and announcements will be shared exclusively in our WhatsApp community.</p>
            
            <a href="` + whatsappLink + `" style="display: inline-block; background-color: #25D366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 211, 102, 0.3);">Join WhatsApp Group Now</a>
            
            <p style="margin: 20px 0 10px 0; font-size: 14px; color: #795548;">Or scan the QR code below:</p>
            <br>
            <img src="` + whatsappQR + `" alt="WhatsApp QR" style="width: 150px; height: 150px; border-radius: 8px; border: 2px solid #ffe082;">
          </div>

          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #1967d2; font-size: 18px;">Welcome to the Kaizen Q Family! 🚀</h3>
            <p style="margin: 0; color: #3c4043; line-height: 1.6; font-size: 15px;">Get ready to elevate your career, master new technologies, and build the future with us!</p>
          </div>
        </div>
        
        <div style="background-color: #f1f3f4; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #5f6368; font-size: 13px;">&copy; ` + new Date().getFullYear() + ` Kaizen Q Events. All rights reserved.</p>
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
}
