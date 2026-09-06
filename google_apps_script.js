/**
 * KQE Events — Google Apps Script for Automated Google Sheet Registration
 * 
 * INSTRUCTIONS TO SET UP:
 * 1. Open Google Sheets (https://sheets.new).
 * 2. Create a sheet with column headers in Row 1:
 *    A1: Timestamp | B1: Event Title | C1: Event ID | D1: Full Name | E1: Email | F1: Phone | G1: Year | H1: College | I1: Department
 * 3. In Google Sheets menu, click: Extensions -> Apps Script.
 * 4. Replace all code in the editor with this script.
 * 5. Click "Deploy" -> "New deployment".
 * 6. Select type: "Web app".
 * 7. Set "Execute as": "Me".
 * 8. Set "Who has access": "Anyone" (Crucial so website can submit data).
 * 9. Click "Deploy", authorize permissions, and copy the Web App URL!
 * 10. Paste the Web App URL into the website's "Google Sheet Config" inside the Registration Page!
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Event Title",
        "Event ID",
        "Full Name",
        "Email",
        "Phone Number",
        "Year of Study / Status",
        "College / Organization",
        "Department / Branch"
      ]);
      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#4285F4");
      headerRange.setFontColor("#FFFFFF");
    }

    // Append new registration row
    sheet.appendRow([
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.eventTitle || "",
      data.eventId || "",
      data.fullName || "",
      data.email || "",
      data.phone || "",
      data.year || "",
      data.college || "",
      data.branch || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("KQE Registration Webhook Endpoint Active!");
}
