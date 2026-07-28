/**
 * InfraMind777 Free AI Starter Program — enrollment form endpoint.
 * Scoped to this form only (not the AM777 CRM sync script).
 *
 * Setup:
 *  1. Create a Google Sheet, open Extensions -> Apps Script, paste this file in.
 *  2. Run setupSheet() once (Run menu) to create the header row. Grant permissions when prompted.
 *  3. (Optional spam guard) Project Settings -> Script Properties -> add FORM_SECRET
 *     with a random string. Set the same value as NEXT_PUBLIC_INFRAMIND_FORM_SECRET
 *     in the Next.js app's .env.local.
 *  4. Deploy -> New deployment -> Web app. Execute as: Me. Who has access: Anyone.
 *  5. Copy the deployment URL into NEXT_PUBLIC_INFRAMIND_FORM_ENDPOINT in .env.local.
 */

const SHEET_NAME = 'InfraMind777 Applications';
const HEADERS = ['Timestamp', 'Name', 'Email', 'Experience', 'Learning Style', 'Goals', 'Direction'];

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  Logger.log('InfraMind777 Applications sheet ready.');
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    const requiredSecret = PropertiesService.getScriptProperties().getProperty('FORM_SECRET');
    if (requiredSecret && body.secret !== requiredSecret) {
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }

    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      setupSheet();
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    }

    sheet.appendRow([
      new Date(),
      String(body.name || ''),
      String(body.email || ''),
      String(body.experience || ''),
      String(body.learningStyle || ''),
      String(body.goals || ''),
      String(body.direction || ''),
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
