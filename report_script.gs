function getDailyMemberReport(startDate, endDate) {
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  var sDate = getDate(startDate);
  var eDate = getDate(endDate);
  // Logger.log(sDate + "-" + eDate);
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA'); 
  var data = activeSheet.getDataRange().getValues().filter(function(row){
      var date =  getDate(new Date(row[DATA_DATE]));
      if (date >= sDate && date <= eDate) {
        return row;
      }});;
  var discountConfig = getDiscountConfig();
  var paymentTypeConfig = getPaymetTypeConfig();
  var tipConfig = getTipConfig();
  var dataObj = {};
  for (var i=0; i<data.length; i++) {
    var techId = data[i][DATA_NAIL_TECH_ID];
    if (!(techId in dataObj)) {
      // create an array to store name, total, tip, obj of week days
      dataObj[techId] = {
        total: 0,
        tip: 0,
        list: [],
      }; 
      dataObj[techId].list.push(["NAME", "AMOUNT", "TYPE", "TIP", "TYPE", "DISCOUNT", "DATE"]);
    }
    var temp = [];
    temp.push(data[i][DATA_NAIL_TECH]);
    temp.push(data[i][DATA_AMOUNT]);
    temp.push(data[i][DATA_PAYMENT_TYPE_ID] > 0 ? paymentTypeConfig[data[i][DATA_PAYMENT_TYPE_ID]][PAYMENT_SHORT] : "");
    temp.push(data[i][DATA_TIP] == "" ? 0 : data[i][DATA_TIP]);
    temp.push(data[i][DATA_TIP_TYPE_ID] > 0 ? tipConfig[data[i][DATA_TIP_TYPE_ID]][TIP_SHORT] : "");
    
    var discountValue = 0;
    if (data[i][DATA_DISCOUNT_TYPE_ID] > 0) {
      discountValue = getDiscount(data[i][DATA_AMOUNT], data[i][DATA_DISCOUNT_TYPE_ID],discountConfig);

    }
    temp.push(discountValue);

    temp.push(getDisplayDate(data[i][DATA_DATE]));

    dataObj[techId].list.push(temp);

    dataObj[techId].total += data[i][DATA_AMOUNT];
    dataObj[techId].tip += Number(data[i][DATA_TIP]);
  }

  for (techId in dataObj) {
    dataObj[techId].list.push(["TOTAL", dataObj[techId].total, "", dataObj[techId].tip, "", "", ""])
  }

  return dataObj;
}

function getMemberReport(startDate, endDate) {
  //   startDate = new Date(2021, 5, 21);
  // endDate = new Date(2021, 5, 26);
  var sDate = getDate(startDate);
  var eDate = getDate(endDate);
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA'); 
  var data = activeSheet.getDataRange().getValues().filter(function(row){
      var date =  getDate(new Date(row[DATA_DATE]));
      if (date >= sDate && date <= eDate) {
        return row;
      }});;
  var techConfig = getNailTechConfigObject();
  
  var totalObject = {};
  var reportObj = {
    total: 0,
    members: [],
  };

  for (var i=0; i<data.length; i++) {
    var techId = data[i][DATA_NAIL_TECH_ID];
    var date = data[i][DATA_DATE];
    if (!(techId in totalObject)) {
      // create an array to store name, total, tip, obj of week days
      totalObject[techId] = [data[i][DATA_NAIL_TECH], 0, 0, {}]; 
    }

    var total = Number(data[i][DATA_AMOUNT]);
    var tip = Number(data[i][DATA_TIP]);
    
    totalObject[techId][1] += total;
    totalObject[techId][2] += tip;

    if (!(DAYS[date.getDay()] in totalObject[techId][3])) {
      totalObject[techId][3][DAYS[date.getDay()]] = [0, 0];
    }
    totalObject[techId][3][DAYS[date.getDay()]][0] += total;
    totalObject[techId][3][DAYS[date.getDay()]][1] += tip;

  }

  for (var key in techConfig) {
    if (!totalObject.hasOwnProperty(key)) {
      if (techConfig[key][TECH_ROLE] == 3) {
        totalObject[key] = [techConfig[key][TECH_NAME], 0, 0, {}];
      }
    } 
    var temp = [];
    if (totalObject.hasOwnProperty(key)) {
      // console.log(key + " -> " + totalObject[key]);
      // display total and tip by days of week
      var dailyObj = totalObject[key][3];
      temp.push([totalObject[key][0], "Total", "Tip"]);
      for (var day in dailyObj) {
        if (dailyObj.hasOwnProperty(day)) {
          var totalDaily = dailyObj[day][0];
          var tipDaily = dailyObj[day][1];
          temp.push([day, totalDaily, tipDaily]);
        }
      }
      var totalWeekly = totalObject[key][1];
      var tipWeekly = Math.round(totalObject[key][2]);
      temp.push(["TOTAL", totalWeekly,tipWeekly]);

      // calc weekly payment
      var techSalary = techConfig[key][TECH_SALARY];
      var techCommission = techConfig[key][TECH_COMMISSION];
      var commision = Math.round(totalWeekly * techCommission / 100);
      var cash = 0;
      var check = 0;
      if (techConfig[key][TECH_ROLE] == 1) {
        check = Math.ceil(commision + tipWeekly);
        reportObj.total += commision;
      }
      if (techConfig[key][TECH_ROLE] == 2 || techConfig[key][TECH_ROLE] == 3) {
        var cashRatio = techConfig[key][TECH_CASH_RATIO]
        cash = commision * cashRatio / 100;
        check = commision - cash + tipWeekly;
        cash = Math.ceil(cash);
        check = Math.floor(check);
        var totalPay = cash + check;
        reportObj.total += commision;
        if (cash > 20) 
        {
          cash = round5(cash);
          check = totalPay - cash;
        }
      }

      // hourly payment calc
      var totalPayPerHour = 0;
      if (techConfig[key][TECH_ROLE] == 3) {
        flag = false
        var hourlyPay = techConfig[key][TECH_HOURLY_PAY];
        var loginData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LOGIN').getDataRange().getValues().filter(function(row){
            var date =  getDate(new Date(row[LOGIN_DATE]));
            if (date >= sDate && date <= eDate) {
              if (row[LOGIN_ID] == techConfig[key][TECH_ID]) {
                return row;
              }
            }});;
        
        var logoutData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LOGOUT').getDataRange().getValues().filter(function(row){
            var date =  getDate(new Date(row[LOGIN_DATE]));
            if (date >= sDate && date <= eDate) {
              if (row[LOGIN_ID] == techConfig[key][TECH_ID]) {
                return row;
              }
            }});;
        for (var i=0;i<loginData.length;i++) {
          var loginTime = loginData[i][LOGIN_DATE];
          // if receptionist only come to do nails, don't count hour that day
          // if (loginData[i][LOGIN_PAY_BY_HOUR] != 1) {
          //   continue;
          // }

          var logoutTemp = logoutData.filter(function(row){
            var date =  getDate(new Date(row[LOGOUT_DATE]));
            if (date == getDate(loginTime)) {
                return row;
            }});;
          var logoutTime = logoutTemp.length > 0 ? logoutTemp[0][LOGOUT_DATE] : loginTime;
          var workTime = Math.abs(loginTime - logoutTime) / 36e5;

          // get total seconds between the times
          var delta = Math.abs(loginTime - logoutTime) / 1000;

          // calculate (and subtract) whole days
          var days = Math.floor(delta / 86400);
          delta -= days * 86400;

          // calculate (and subtract) whole hours
          var hours = Math.floor(delta / 3600) % 24;
          delta -= hours * 3600;

          // calculate (and subtract) whole minutes
          var minutes = Math.floor(delta / 60) % 60;
          delta -= minutes * 60;

          // what's left is seconds
          var seconds = delta % 60;  // in theory the modulus is not required

          var pay = hours * hourlyPay + (minutes/60)*hourlyPay;
          totalPayPerHour+= pay;
          
          if (totalPayPerHour > 0) {
            if (!flag) {
              flag = true
              temp.push(["", "LOGIN", "LOGOUT", "TOTAL HOURS", "PAY"]);
            }
            temp.push([DAYS[loginTime.getDay()], getDisplayDate(loginTime), getDisplayDate(logoutTime), hours + ":" + minutes, pay]);
          }
        }
      }
      // totalPayPerHour = totalPayPerHour.toFixed(2);
      reportObj.total += totalPayPerHour;
      if (techConfig[key][TECH_ROLE] == 3) {
        var t = Math.round(totalWeekly*60/100 +  tipWeekly + totalPayPerHour);
        temp.push(["TOTAL", totalWeekly*60/100 + " + "  + tipWeekly + " + " + totalPayPerHour,"","", totalPayPerHour]);
        temp.push(["PAY", t, "", "", ""]);
      }
      else {
        temp.push(["", "CHECK", "CASH"]);
        temp.push(["PAY", check, cash]);
      }

      if (temp.length > 0) {
        reportObj.members.push(temp);
      }
    }
  }
  return reportObj;
}

function getDataReport(startDate, endDate) {
  // startDate = new Date(2021, 4, 24);
  // endDate = new Date(2021, 4, 29);
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA'); 
  startDate = getDate(new Date(startDate));
  endDate = getDate(new Date(endDate));
  var data = activeSheet.getDataRange().getValues().filter(function(row){
    var date = getDate(new Date(row[DATA_DATE]));
  if (date >= startDate && date <= endDate) {
    return row;
  }});
  
  var discountConfig = getDiscountConfig();
  var objData = {
    total: 0,
    totalByCard: 0,
    totalByCash: 0,
    totalByGC: 0,
    totalByCheck: 0,
    totalDiscountCard: 0,
    totalDiscountCash: 0,
    totalDiscountGC: 0,
    totalDiscountCheck: 0,
    totalTipByCard: 0,
    totalTipByGC: 0,
    totalTipByCheck: 0,
    totalSaleByCard: 0,
    totalSaleByCash: 0,
    totalSaleByCheck: 0,
  };
  for (var i=0;i<data.length;i++) {
    // calc amount & discount
    var amount = data[i][DATA_AMOUNT];
    switch (data[i][DATA_PAYMENT_TYPE_ID]){
      case PAYMENT_CREDIT_ID:
        objData.totalByCard += amount;
        objData.totalDiscountCard += getDiscount(amount, data[i][DATA_DISCOUNT_TYPE_ID], discountConfig);
        // Logger.log(getDiscount(amount, data[i][DATA_DISCOUNT_TYPE_ID], discountConfig))
        break;
      case PAYMENT_CASH_ID:
        objData.totalByCash += amount;
        objData.totalDiscountCash += getDiscount(amount, data[i][DATA_DISCOUNT_TYPE_ID], discountConfig);
        break;
      case PAYMENT_GC_ID:
        objData.totalByGC += amount;
        objData.totalDiscountGC += getDiscount(amount, data[i][DATA_DISCOUNT_TYPE_ID], discountConfig);
        break;
      case PAYMENT_CHECK_ID:
        objData.totalByCheck += amount;
        objData.totalDiscountCheck += getDiscount(amount, data[i][DATA_DISCOUNT_TYPE_ID], discountConfig);
        break;
    }
    // calc tip
    var tip = data[i][DATA_TIP];
    switch (data[i][DATA_TIP_TYPE_ID]) {
      case TIP_BY_CARD:
        objData.totalTipByCard += tip;
        break;
      case TIP_BY_GC:
        objData.totalTipByGC += tip;
        break;
      case TIP_BY_CHECK:
        objData.totalTipByCheck += tip;
        break;
    }
  }
  // load sale data
  var saleData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SALE_DATA').getDataRange().getValues(); 
  var saleFilterRows = saleData.filter(function(row){
    var date = getDate(new Date(row[SALE_DATE]));
  if (date >= startDate && date <= endDate) {
    return row;
  }});
  for (var i=0; i<saleFilterRows.length; i++) {
    var saleAmount = saleFilterRows[i][SALE_AMOUNT];
    switch (saleFilterRows[i][SALE_PAYMENT_TYPE]) {
      case CONFIG_SALE_BY_CARD:
        objData.totalSaleByCard += saleAmount;
        break;
      case CONFIG_SALE_BY_CASH:
        objData.totalSaleByCash += saleAmount;
        break;
      case CONFIG_SALE_BY_CHECK:
        objData.totalSaleByCheck += saleAmount;
        break;
    }
  }
  objData.totalTipByCard = objData.totalTipByCard.toFixed(2);

  objData.totalByCard = objData.totalByCard + objData.totalSaleByCard - objData.totalDiscountCard;
  objData.totalByCash = objData.totalByCash + objData.totalSaleByCash - objData.totalDiscountCash;
  objData.totalByCheck = objData.totalByCheck + objData.totalSaleByCheck - objData.totalDiscountCheck;
  objData.totalByGC = objData.totalByGC - objData.totalDiscountGC;

  objData.total = objData.totalByCard + objData.totalByCash + objData.totalByCheck + objData.totalSaleByCard + objData.totalSaleByCash + objData.totalSaleByCheck;
  // Logger.log(objData)
  // objData.total = objData.total - objData.totalDiscountCard - objData.totalDiscountCash - objData.totalDiscountCheck - objData.totalByGC;
  // Logger.log(objData)
  return objData;
}

function getWeeklyReport(date) {
  var date = new Date(date);
  
  var startDate = getFirstDayOfWeek(date);
  var endDate = getLastDayOfWeek(date);

  var memberReport = getMemberReport(startDate, endDate);
  var dataReport = getDataReport(startDate, endDate);

  var temp = [];
  // no header
  if (dataReport.total > 0) {
    temp.push(["", "", ""]);
    temp.push(["Total", dataReport.total, ""]);
    temp.push(["Pay", memberReport.total, ""]);
    temp.push(["Profit", Math.round(dataReport.total - memberReport.total), ""]);

    dataReport.totalByCard > 0 ? temp.push(["Card", dataReport.totalByCard, ""]):false;
    dataReport.totalByCash > 0 ? temp.push(["Cash", dataReport.totalByCash, ""]):false;
    dataReport.totalByGC > 0 ? temp.push(["GC", dataReport.totalByGC, ""]):false;
    dataReport.totalByCheck > 0 ? temp.push(["Check", dataReport.totalByCheck, ""]):false;

    dataReport.totalTipByCard > 0 ? temp.push(["Tip in Card", dataReport.totalTipByCard, ""]):false;
    dataReport.totalTipByGC > 0 ? temp.push(["Tip in GC", dataReport.totalTipByGC, ""]):false;
    dataReport.totalTipByCheck > 0 ? temp.push(["Tip in Check", dataReport.totalTipByCheck, ""]):false;

    dataReport.totalDiscountCard > 0 ? temp.push(["Discount in Card", dataReport.totalDiscountCard, ""]):false;
    dataReport.totalDiscountCash > 0 ? temp.push(["Discount in Cash", dataReport.totalDiscountCash, ""]):false;
    dataReport.totalDiscountGC > 0 ? temp.push(["Discount in GC", dataReport.totalDiscountGC, ""]):false;
    dataReport.totalDiscountCheck > 0 ? temp.push(["Discount in Check", dataReport.totalDiscountCheck, ""]):false;

    dataReport.totalSaleByCard > 0 ? temp.push(["Sale in Card", dataReport.totalSaleByCard, ""]):false;
    dataReport.totalSaleByCash > 0 ? temp.push(["Sale in Cash", dataReport.totalSaleByCash, ""]):false;
    dataReport.totalSaleByCheck > 0 ? temp.push(["Sale in Check", dataReport.totalSaleByCheck, ""]):false;


    temp.push(["", "", ""]);
    memberReport.members.unshift(temp);
  }
  return memberReport.members;
}

function getDailyReport(date) {
  var date = new Date(date);
  var dataReport = getDataReport(date, date);
  // Logger.log(dataReport)
  if (dataReport.total <= 0)
    return [];
  var report = [];
    dataReport.total > 0 ? report.push(["Total", dataReport.total]):false;
    dataReport.totalByCard > 0 ? report.push(["Card", dataReport.totalByCard]):false;
    dataReport.totalByCash > 0 ? report.push(["Cash", dataReport.totalByCash]):false;
    dataReport.totalByGC > 0 ? report.push(["GC", dataReport.totalByGC]):false;
    dataReport.totalByCheck > 0 ? report.push(["Check", dataReport.totalByCheck]):false;

    dataReport.totalTipByCard > 0 ? report.push(["Tip in Card", dataReport.totalTipByCard]):false;
    dataReport.totalTipByGC > 0 ? report.push(["Tip in GC", dataReport.totalTipByGC]):false;
    dataReport.totalTipByCheck > 0 ? report.push(["Tip in Check", dataReport.totalTipByCheck]):false;

    dataReport.totalDiscountCard > 0 ? report.push(["Discount in Card", dataReport.totalDiscountCard]):false;
    dataReport.totalDiscountCash > 0 ? report.push(["Discount in Cash", dataReport.totalDiscountCash]):false;
    dataReport.totalDiscountGC > 0 ? report.push(["Discount in GC", dataReport.totalDiscountGC]):false;
    dataReport.totalDiscountCheck > 0 ? report.push(["Discount in Check", dataReport.totalDiscountCheck]):false;

    dataReport.totalSaleByCard > 0 ? report.push(["Sale in Card", dataReport.totalSaleByCard]):false;
    dataReport.totalSaleByCash > 0 ? report.push(["Sale in Cash", dataReport.totalSaleByCash]):false;
    dataReport.totalSaleByCheck > 0 ? report.push(["Sale in Check", dataReport.totalSaleByCheck]):false;

  return report;
}

function getReportWeely(value) {
  var value = new Date(value);
  var startDate = getFirstDayOfWeek(value);
  var endDate = getLastDayOfWeek(value);
  return reportByDay(startDate, endDate);
}














