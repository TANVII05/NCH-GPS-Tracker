const SECRET_KEY = "your_secret_api_key_here";
// Set this to a secure random string and use the exact same string in your Expo .env file
const MASTER_SHEET_NAME = "All Trips";

const HEADERS = [
  "Employee Name", "Employee ID", "Bike Number", "Date",
  "OUT Time", "IN Time", "Duration (mins)", "Distance (KM)",
  "Earnings (₹)", "Month", "Year", "Sync Status", "Synced At"
];

function doPost(e) {
  try {
    var body = {};
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    
    // 1. Handle live location update
    if (body.action === 'update_location') {
      var res = updateActiveLocation(body);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Handle removing active location
    if (body.action === 'remove_location') {
      var res = removeActiveLocation(body);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Handle updating settings
    if (body.action === 'update_settings') {
      var res = updateSettings(body);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 4. Save completed trip
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
    if (!masterSheet) {
      masterSheet = ss.insertSheet(MASTER_SHEET_NAME);
      masterSheet.appendRow(HEADERS);
    }

    var rowData = [
      body.employeeName || "", body.employeeId || "", body.bikeNumber || "",
      body.date || "", body.outTime || "", body.inTime || "",
      body.durationMinutes || 0, body.distanceKM || 0, body.earnings || 0,
      body.month || "", body.year || "", "Synced", new Date().toISOString()
    ];
    masterSheet.appendRow(rowData);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var action = e.parameter.action;
    
    // 1. Get active locations for Admin Portal
    if (action === 'active_locations') {
      return ContentService.createTextOutput(JSON.stringify(getActiveLocations())).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Get all trips
    if (action === 'all_trips') {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: getAllTrips() })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Get global settings
    if (action === 'get_settings') {
      return ContentService.createTextOutput(JSON.stringify(getSettings())).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid request' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// === APP SETTINGS ENGINE ===
function getSettings() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('App Settings');
  
  if (!sheet) {
    // If it doesn't exist, create it and set default rate to 4
    sheet = ss.insertSheet('App Settings');
    sheet.appendRow(["Setting Key", "Setting Value", "Last Updated"]);
    sheet.appendRow(["km_rate", "4", new Date().toISOString()]);
    return { status: 'success', data: { km_rate: 4 } };
  }
  
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  
  // Default fallback if km_rate was somehow deleted
  if (settings['km_rate'] === undefined) {
    settings['km_rate'] = 4;
  }
  
  return { status: 'success', data: settings };
}

function updateSettings(body) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('App Settings');
  
  if (!sheet) {
    sheet = ss.insertSheet('App Settings');
    sheet.appendRow(["Setting Key", "Setting Value", "Last Updated"]);
  }
  
  var data = sheet.getDataRange().getValues();
  var updated = false;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === 'km_rate') {
      sheet.getRange(i + 1, 2, 1, 2).setValues([[body.km_rate, new Date().toISOString()]]);
      updated = true;
      break;
    }
  }
  
  if (!updated) {
    sheet.appendRow(['km_rate', body.km_rate, new Date().toISOString()]);
  }
  
  return { status: 'success' };
}

// === ACTIVE LOCATION ENGINE ===
function getActiveLocations() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Active Locations');
  if (!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}

function updateActiveLocation(body) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Active Locations');
  if (!sheet) {
    sheet = ss.insertSheet('Active Locations');
    sheet.appendRow([
      "Employee ID", "Employee Name", "Bike Number", 
      "Latitude", "Longitude", "Distance (KM)", "Earnings (₹)", 
      "Trip Start Time", "Last Updated"
    ]);
  }
  
  var data = sheet.getDataRange().getValues();
  var employeeId = String(body.employeeId).trim();
  var foundRow = -1;
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() == employeeId) {
      foundRow = i + 1;
      break;
    }
  }
  
  var rowData = [
    employeeId, body.employeeName || 'Unknown', body.bikeNumber || 'N/A',
    body.latitude || 0, body.longitude || 0, body.distanceKM || 0,
    body.earnings || 0, body.tripStartTime || '', new Date().toISOString()
  ];
  
  if (foundRow !== -1) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { status: 'success' };
}

function removeActiveLocation(body) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Active Locations');
  if (!sheet) return { status: 'success' };
  
  var data = sheet.getDataRange().getValues();
  var employeeId = String(body.employeeId).trim();
  
  // Delete ALL matching rows (iterate in reverse to avoid index shifting)
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]).trim() == employeeId) {
      sheet.deleteRow(i + 1);
    }
  }
  return { status: 'success' };
}

function getAllTrips() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    result.push(obj);
  }
  return result;
}
