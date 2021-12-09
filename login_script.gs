function appenLoginData(data) {
  var list = getNailTechLoggedIn().filter(function(row){
  if (row[LOGIN_ID] == data.id) {
    return row;
  }});
  if (list.length > 0)
    return false;
  var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LOGIN');
  var date = new Date();
  data.date = date;
  ws.appendRow([data.id, data.name, data.date, getBaseValue(date)]);

  showSaleDialog();

  return true;
}

function appenLogoutData(data) {
  var list = getNailTechLoggedOut().filter(function(row){
  if (row[LOGIN_ID] == data.id) {
    return row;
  }});
  if (list.length <= 0) {
    var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LOGOUT');
    var date = new Date();
    data.date = date;
    ws.appendRow([data.id, data.name, data.date]);
  }

  // send email
  var id = data.id;
  var nailTechConfig = getMemberConfig(id);
  var filter = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA').getDataRange().getValues().filter(function(row){
      var now = getDate(new Date());
    var date = getDate(new Date(row[DATA_DATE]));
      if (row[DATA_NAIL_TECH_ID] == id && date == now) {
        return row;
  }});
  if (nailTechConfig[TECH_EMAIL].toString() != "") {
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
      sendEmail(nailTechConfig[TECH_EMAIL], "Daily Report", table);
    }
    
  }
  
  return true;
}

function getBaseValue(date = new Date(), techId) {
  var hour = date.getHours();
  var min = date.getMinutes();
  var temp = hour.toString() + min.toString();
  var tempLateHour = LATE_HOUR.toString() + LATE_MIN.toString();
  // Logger.log(temp)
  // Logger.log(tempLateHour)
  if (temp >= tempLateHour) {
    var list = getNailTechLoggedIn();
    var minValue = 0;
    var isFirst = true;
    for (var i=0; i<list.length; i++) {
      // exception for owner & Vicky, don't wanna hardcode but don't have time
      var removeList = ["Steve", "Kelly", "Vicky"];
      if (removeList.includes(list[i][LOGIN_NAME]))
      {
        // Logger.log(list[i][LOGIN_NAME])
        continue;
      }
      
      var curValue = getTotalByMember(list[i][LOGIN_ID]);
      if (isFirst)
        minValue = curValue;
      isFirst = false;
      if (list[i][LOGIN_BASE_VALUE] > 0)
        curValue = curValue + list[i][LOGIN_BASE_VALUE];
      if (minValue > curValue)
        minValue = curValue;
    }
    return minValue;
  } 
  else
    return 0;
}

function getTotalByMember(memberId) {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA'); 
  var data = activeSheet.getDataRange().getValues();
  var now = getDate(new Date());
  var total = 0;
  var filteredRows = data.filter(function(row){

    var date = getDate(new Date(row[DATA_DATE]));
  if (row[DATA_NAIL_TECH_ID] == memberId && date == now) {
    total += row[DATA_AMOUNT];
    return row;
  }});
  return total;
}

function getTotalByMemberObj() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA'); 
  var data = activeSheet.getDataRange().getValues();
  var now = getDate(new Date());
  var obj = {};
  data.filter(function(row){
    var date = getDate(new Date(row[DATA_DATE]));
    var techId = row[DATA_NAIL_TECH_ID];
    if (date == now) {
      // if (!(techId in obj)) {
      //   obj[techId] = [0, row[DATA_NAIL_TECH]];
      // }
      if (!(techId in obj) && techId > 0) {
        obj[techId] = [0, row[DATA_NAIL_TECH]];
      }
      obj[techId][0] += row[DATA_AMOUNT];
  }});
  
  return obj;
}

function getNextTurn() {
  var members = getNailTechLoggedIn();
  var totalObj = getTotalByMemberObj();
  var arrListMember = [];
  var arrTotal = [];
  for (i = 0; i < members.length; i++) {
    if (members[i][LOGIN_ID] in totalObj)
      arrTotal.push(totalObj[members[i][LOGIN_ID]][0]);
    else
      arrTotal.push(0)
  }
  Logger.log(totalObj)
  Logger.log(members)
  Logger.log(arrTotal)
  for (var i = 0; i < members.length; i++) {
    // var curMember = getTotalByMember(members[i][LOGIN_ID]);
    var curMember = arrTotal[i];
    var curMemberName = members[i][LOGIN_NAME];

    // add current member if not existed
    if (arrListMember.indexOf(curMemberName) == -1) {
      arrListMember.push(curMemberName);
    }
    for (var j = i + 1; j < members.length; j++) {
      var nextMember = arrTotal[j];
      // check if next member is late, then add base value to the total money
      var baseValue = members[j][LOGIN_BASE_VALUE];
      if (baseValue > 0) {
        nextMember = nextMember + baseValue;
      }

      var nextMemberName = members[j][LOGIN_NAME];
      var curIndex = arrListMember.indexOf(curMemberName);
      var nextIndex = arrListMember.indexOf(nextMemberName);

      if (curMember - nextMember >= DIFF_COUNT) {
        // check if next member exists, put before the current member
        if (nextIndex == -1) {
          arrListMember = addBeforeInArray(nextMemberName, curMemberName, arrListMember);
        }
        else {
          //next member is not at its turn
          if (nextIndex > curIndex) {
            arrListMember = deleteInArray(nextIndex, arrListMember);
            arrListMember = addBeforeInArray(nextMemberName, curMemberName, arrListMember);
            
          }
        }
      }
    }
  }
  var removeList = ["Steve", "Kelly", "Vicky"];
  // var removeList = [];
  var temp = [];
    for( var i = 0; i < arrListMember.length; i++){ 
        if (!removeList.includes(arrListMember[i])) { 
            var total = 0;
            for (key in totalObj) {
              if (totalObj[key][1] == arrListMember[i])
                total = totalObj[key][0];
            }
            temp.push(arrListMember[i] + "(" + total + ")");
        }
    }

  return temp;
}


// should check is logged in when log out