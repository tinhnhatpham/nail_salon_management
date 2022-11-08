function getDate(date = new Date()) {
  var temp = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyyMMdd");
  return temp;
}

function getDisplayDate(date = new Date()) {
  var temp = Utilities.formatDate(date, Session.getScriptTimeZone(), "MM/dd/yy HH:mm");
  var a = Session.getScriptTimeZone()
  return temp;
}
// need to replace by GetNailTechConfigObject
function getNailTechConfig() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');  
  var list = activeSheet.getRange(2,1,activeSheet.getRange("A1").getDataRegion().getLastRow() - 1, 8).getValues().sort(function(a,b){return a[TECH_LOGIN_ORDER] - b[TECH_LOGIN_ORDER];});
  return list;
}

function getNailTechConfigObject() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');  
  var list = activeSheet.getRange(2,1,activeSheet.getRange("A1").getDataRegion().getLastRow() - 1, 9).getValues();
  var obj = {};
  for (var i=0; i<list.length;i++) {
    obj[list[i][TECH_ID]] = list[i];
  }
  return obj;
}

function getAdminConfig() {
  // var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ADMIN');  
  // var list = activeSheet.getRange(2,1,activeSheet.getRange("A1").getDataRegion().getLastRow() - 1, 1).getValues();
  // var obj = {};
  // for (var i=0; i<list.length;i++) {
  //   obj[list[i][TECH_ID]] = list[i];
  // }
  // return obj;
}

// need to replace by GetNailTechConfigObject
function getMemberConfig(nailTechId) {
  // var temp = getNailTechConfig().filter(function(row) {
  //   if (nailTechId == row[TECH_ID]) {
  //     return row;
  //   }
  // });

  // if (temp.length > 0) {
  //   Logger.log(temp[0]);
  //   return temp[0];
  // }
  // else
  //   return [];

  techConfig = getNailTechConfigObject();
  if (techConfig.hasOwnProperty(nailTechId)) {
    return techConfig[nailTechId];
  }
  else {
    return [];
  }
}

function getNailTechLoggedIn() {
  // var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LOGIN');
  // var data = activeSheet.getDataRange().getValues();
  var data = getLastNumOfRows(sheetName = 'LOGIN', numOfRows = 30)
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
  // var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LOGOUT');
  // var data = activeSheet.getDataRange().getValues();
  var data = getLastNumOfRows(sheetName = 'LOGOUT', numOfRows = 30)
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
  var list = activeSheet.getRange(94,1,activeSheet.getRange("A93").getDataRegion().getLastRow() - 93,4).getValues();
  // Logger.log(list)
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
  var list = activeSheet.getRange(86, 1,activeSheet.getRange("A85").getDataRegion().getLastRow() - 85,3).getValues();
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
  var list = activeSheet.getRange(106,1,activeSheet.getRange("A105").getDataRegion().getLastRow() - 105,3).getValues();
  var obj = {};
  for (var i=0; i<list.length;i++) {
    obj[list[i][TIP_ID]] = list[i];
  }
  return obj;
}

function getSalePaymentConfig() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');  
  var list = activeSheet.getRange(113,1,activeSheet.getRange("A112").getDataRegion().getLastRow() - 112,3).getValues();
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
  try {
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
  catch (e){
    Logger.log(e)
  }
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

function autoSendRerportDaily() {

  var techConfig = getNailTechConfigObject()
  
  var filter = getLastNumOfRows().filter(function(row){
        var now = getDate(new Date());
      var date = getDate(new Date(row[DATA_DATE]));
        if (date == now) {
          return row;
    }});
  
  var obj = {}
  for (var i=0; i<filter.length; i++) {
    var row = filter[i]
    if (!(row[DATA_NAIL_TECH_ID] in obj)) {
      obj[row[DATA_NAIL_TECH_ID]] = []
    }
    obj[row[DATA_NAIL_TECH_ID]].push(row);
  }

  for (var techId in obj) {
      // if (techId != 2) {
      //   continue;
      // }
      var table = "<html><body><br><table border=1><tr><th>Amount</th><th>Tip</th><th>Date</th></tr></br>";

      //the body of the table is build in 2D (two foor loops)
      var total = 0;
      var totalTip = 0;
      for (var i = 0; i < obj[techId].length; i++){
          cells = obj[techId][i]; //puts each cell in an array position
          table = table + "<tr></tr>";
          table = table + "<td>"+ cells[DATA_AMOUNT] +"</td>";
          table = table + "<td>"+ cells[DATA_TIP] +"</td>";
          table = table + "<td>"+ getDisplayDate(cells[DATA_DATE]) +"</td>";
          total += Number(cells[DATA_AMOUNT]);
          totalTip += Number(cells[DATA_TIP]);
      }
      table = table + "<tr></tr>";
      table = table + "<td><b>"+ total +"</b></td>";
      table = table + "<td><b>"+ totalTip +"</b></td>";
      table = table + "<td>"+ "" +"</td>";

      table=table+"</table></body></html>";
      var email = techConfig[techId][TECH_EMAIL];
      if (email != "") {
        sendEmail(techConfig[techId][TECH_EMAIL], "Daily Report", table);
      }
  }
}

function sendEmailReportDaily(data) {
  nailTechId = data.id;
  selectDate = data.date;
  
  var nailTechConfig = getNailTechConfigObject();
  
  if (!nailTechConfig.hasOwnProperty(nailTechId)) {
    return "Please select nail tech!";
  }

  techConfig = nailTechConfig[nailTechId];
  var filter = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA').getDataRange().getValues().filter(function(row){
      var now = getDate(new Date(selectDate));
      var date = getDate(new Date(row[DATA_DATE]));
        if (row[DATA_NAIL_TECH_ID] == nailTechId && date == now) {
          return row;
    }});
    if (techConfig[TECH_EMAIL].toString() != "") {
      if (filter.length > 0) {
        var table = "<html><body><br><table border=1><tr><th>Amount</th><th>Tip</th><th>Date</th></tr></br>";

        //the body of the table is build in 2D (two foor loops)
        var total = 0;
        var totalTip = 0;
        for (var i = 0; i < filter.length; i++){
            cells = filter[i]; //puts each cell in an array position
            table = table + "<tr></tr>";
            table = table + "<td>"+ cells[DATA_AMOUNT] +"</td>";
            table = table + "<td>"+ cells[DATA_TIP] +"</td>";
            table = table + "<td>"+ getDisplayDate(cells[DATA_DATE]) +"</td>";
            total += Number(cells[DATA_AMOUNT]);
            totalTip += Number(cells[DATA_TIP]);
        }
        table = table + "<tr></tr>";
        table = table + "<td><b>"+ total +"</b></td>";
        table = table + "<td><b>"+ totalTip +"</b></td>";
        table = table + "<td>"+ "" +"</td>";

        table=table+"</table></body></html>";
        // Logger.log(table);
        sendEmail(techConfig[TECH_EMAIL], "Daily Report", table);
      }
    }
    return "Email was sent!"
}

function test() {
  // var data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA').getDataRange()
  // lastRow = data.getLastRow()
   var email = Session.getActiveUser().getEmail();
  Logger.log(email);
}

function getDataByRows(sheetName, startIndex, endIndex) {
  var data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA').getRange(-1, 2, 5).getValues();
  for (var row in data) {
    for (var col in data[row]) {
      Logger.log(data[row][col]);
    }
  }
}

function getLastNumOfRows(sheetName = 'DATA', numOfRows = 150) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var row = sheet.getLastRow() - numOfRows + 1;
  var col = sheet.getLastColumn();
  if (row < 0) {
    row = 0
  }
  var data = sheet.getRange(row, 1, numOfRows, col).getValues();
  return data;
}
































