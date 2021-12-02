function getDate(date = new Date()) {
  var temp = Utilities.formatDate(date, "GMT-0400", "yyyyMMdd");
  return temp;
}

function getDisplayDate(date = new Date()) {
  var temp = Utilities.formatDate(date, "GMT-0400", "MM/dd/yy HH:mm");
  return temp;
}
// need to replace by GetNailTechConfigObject
function getNailTechConfig() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');  
  var list = activeSheet.getRange(2,1,activeSheet.getRange("A1").getDataRegion().getLastRow() - 1, 6).getValues();
  return list;
}

function getNailTechConfigObject() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');  
  var list = activeSheet.getRange(2,1,activeSheet.getRange("A1").getDataRegion().getLastRow() - 1, 7).getValues();
  var obj = {};
  for (var i=0; i<list.length;i++) {
    obj[list[i][TECH_ID]] = list[i];
  }
  return obj;
}

// need to replace by GetNailTechConfigObject
function getMemberConfig(nailTechId) {
  var temp = getNailTechConfig().filter(function(row) {
    if (nailTechId == row[TECH_ID]) {
      return row;
    }
  });
  if (temp.length > 0)
    return temp[0];
  else
    return [];
}

function getNailTechLoggedIn() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LOGIN');
  var data = activeSheet.getDataRange().getValues();
  var filteredRows = data.filter(function(row){
    var now = getDate(new Date());
    var date = getDate(new Date(row[LOGIN_DATE]));
  if (date === now) {
    row[LOGIN_DATE] = getDisplayDate(row[LOGIN_DATE]);
    return row;
  }});
  return filteredRows;
} 

function getNailTechLoggedOut() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LOGOUT');
  var data = activeSheet.getDataRange().getValues();
  var filteredRows = data.filter(function(row){
    var now = getDate(new Date());
    var date = getDate(new Date(row[LOGOUT_DATE]));
  if (date === now) {
    row[LOGOUT_DATE] = getDisplayDate(row[LOGOUT_DATE]);
    return row;
  }});
  return filteredRows;
} 

function getDiscountConfig() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');  
  var list = activeSheet.getRange(31,1,activeSheet.getRange("A30").getDataRegion().getLastRow() - 30,4).getValues();
  var obj = {};
  for (var i=0; i<list.length;i++) {
    obj[list[i][CONFIG_DISCOUNT_ID]] = list[i];
  }
  return obj;
}

function getDiscount(amount, discountId, discountConfig) {
  if (discountId <= 0)
    return 0;
  if (discountConfig[discountId][CONFIG_DISCOUNT_BY_PERCENT]) {
    var temp = Math.round(amount - Number((amount*discountConfig[discountId][CONFIG_DISCOUNT_VALUE]/100)));
    return amount - temp;
  }
  else {
    return discountConfig[discountId][CONFIG_DISCOUNT_VALUE];
  }
}

function getPaymetTypeConfig() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');  
  var list = activeSheet.getRange(23, 1,activeSheet.getRange("A22").getDataRegion().getLastRow() - 22,3).getValues();
  var obj = {};
  for (var i=0; i<list.length;i++) {
    obj[list[i][PAYMENT_ID]] = list[i];
  }
  return obj;
}

function getTipType(tipId, tipTypeConfig) {
  var temp = tipTypeConfig.filter(function(row) {
    if (row[TIP_ID] == tipId)
      return row;
  });
  return temp[0] != null ? temp[0] : "";
}

function getTipConfig() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');  
  var list = activeSheet.getRange(43,1,activeSheet.getRange("A42").getDataRegion().getLastRow() - 42,3).getValues();
  var obj = {};
  for (var i=0; i<list.length;i++) {
    obj[list[i][TIP_ID]] = list[i];
  }
  return obj;
}

function getSalePaymentConfig() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');  
  var list = activeSheet.getRange(50,1,activeSheet.getRange("A49").getDataRegion().getLastRow() - 49,3).getValues();
  return list;
}

// This code fetches the Google and YouTube logos, inlines them in an email
// and sends the email
function sendEmail(to, subject, htmlBody) {
  // var googleLogoUrl = "http://www.google.com/intl/en_com/images/srpr/logo3w.png";
  // var youtubeLogoUrl =
  //       "https://developers.google.com/youtube/images/YouTube_logo_standard_white.png";
  // var googleLogoBlob = UrlFetchApp
  //                        .fetch(googleLogoUrl)
  //                        .getBlob()
  //                        .setName("googleLogoBlob");
  // var youtubeLogoBlob = UrlFetchApp
  //                         .fetch(youtubeLogoUrl)
  //                         .getBlob()
  //                         .setName("youtubeLogoBlob");
  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: htmlBody,
    // inlineImages:
    //   {
    //     googleLogo: googleLogoBlob,
    //     youtubeLogo: youtubeLogoBlob
    //   }
  });
}

function getFirstDayOfWeek(date = new Date()) {
  // var curr = new Date; // get current date
  // var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
  // var last = first + 6; // last day is the first day + 6

  // var firstday = new Date(curr.setDate(first));
  // var lastday = new Date(curr.setDate(last));
  // var temp = 0;
  var first = date.getDate() - date.getDay() + 1; // First day is the day of the month - the day of the week
  return new Date(date.setDate(first));
}

function getLastDayOfWeek(date = new Date()) {
  var first = date.getDate() - date.getDay() + 1; // First day is the day of the month - the day of the week
  var last = first + 6; // last day is the first day + 6
  return new Date(date.setDate(last));
}

function addBeforeInArray(objToInsert, objExist, arr = []) {
  var arrTemp = [];
  arr.forEach(function(value) {
      if (value == objExist) {
        arrTemp.push(objToInsert);
      }
      arrTemp.push(value);
  });
  return arrTemp;
}
function addAfterInArray(objToInsert, objExist, arr = []) {
  var arrTemp = [];
  
  arr.forEach(function(value) {
      arrTemp.push(value);
      if (value == objExist) {
        arrTemp.push(objToInsert);
      }
  });
  return arrTemp;
}
function deleteInArray(index, arr = []) {
  arr.splice(index,1);
  return arr;
}

function round5(x)
{
    return Math.ceil(x/10)*10;
}

function getRowData(uuId) {
  var data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA').getDataRange().getValues().filter(function(row){
      if (row[DATA_UUID] == uuId) {
        return row;
      }});;
  if (data.length <= 0) {
    return false;
  }

  var obj = {
    id:data[0][DATA_NAIL_TECH_ID],
    name:data[0][DATA_NAIL_TECH],
    amount:data[0][DATA_AMOUNT],
    paymentType:data[0][DATA_PAYMENT_TYPE_ID],
    tip:data[0][DATA_TIP],
    tipType:data[0][DATA_TIP_TYPE_ID],
    discountType:data[0][DATA_DISCOUNT_TYPE_ID],
    date:data[0][DATA_DATE],
    uuId:data[0][DATA_UUID],
  };
  return obj;
}





































