// ============================================
// DNA VENDOR PAGE - GOOGLE APPS SCRIPT BACKEND
// ============================================

const SPREADSHEET_ID = "1087dwmhk12RM-YFRYxKO2VEO2DPIkTRjNbhokm9GDJA";
const SHEET_NAME = "DNA";

// ============================================
// MAIN FUNCTION - Handle requests
// ============================================

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    if (action === "getProductos") {
      return getProductos();
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: "Acción no reconocida" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// FUNCTION: Get all products from DNA sheet
// ============================================

function getProductos() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    // Skip header row
    const productos = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Only include rows with data
      if (row[0] && row[1] && row[2]) {
        productos.push({
          categoria: row[0],      // Column A
          nombre: row[1],         // Column B
          precio: parseFloat(row[2]) || 0,  // Column C
          cantidad: parseInt(row[3]) || 0   // Column D
        });
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, data: productos })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
