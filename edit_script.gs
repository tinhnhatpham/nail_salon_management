function getEditData(techId, date) {
  date = getDate(new Date(date));
  Logger.log(techId)
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA'); 
  var data = activeSheet.getDataRange().getValues().filter(function(row){
      var d =  getDate(new Date(row[DATA_DATE]));
      if (date == d && techId == row[DATA_NAIL_TECH_ID]) {
        return row;
      }});;
  Logger.log(data);
  var dataObj = {};
  for (var i=0; i<data.length; i++) {
    // var techId = data[i][DATA_NAIL_TECH_ID];
    if (!(techId in dataObj)) {
      // create an array to store name, total, tip, obj of week days
      dataObj[techId] = {
        total: 0,
        tip: 0,
        list: [],
      }; 
      dataObj[techId].list.push(["NAME", "AMOUNT", "TYPE", "TIP", "TYPE", "DISCOUNT", "DATE", "UUID"]);
    }
    var temp = [];
    temp.push(data[i][DATA_NAIL_TECH]);
    temp.push(data[i][DATA_AMOUNT]);
    temp.push(data[i][DATA_PAYMENT_TYPE_ID]);
    temp.push(data[i][DATA_TIP] == "" ? 0 : data[i][DATA_TIP]);
    temp.push(data[i][DATA_TIP_TYPE_ID]);
    temp.push(data[i][DATA_DISCOUNT_TYPE_ID]);
    temp.push(getDisplayDate(data[i][DATA_DATE]));
    temp.push(data[i][DATA_UUID]);

    dataObj[techId].list.push(temp);
  }
  return dataObj;
}

function showEditDialog(uuId) {
  // return getRowData(uuId);
  
  var userForm = HtmlService.createTemplateFromFile('modify');
  userForm.data = getRowData(uuId);
 
  
  var output = userForm.evaluate();
  output.setHeight(750);
  output.setWidth(750);
  SpreadsheetApp.getUi().showModelessDialog(output, "MODIFY");

}

function updateData(values) {
  // Log origin and modified records
  var editHistorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('EDIT_HISTORY');
  if (values.id <= 0 || values.id === "" || values.amount === "") {
    return "FAIL TO UPDATE!!!";
  }

  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA'); 
  // Get all the data from the sheet
  var data = activeSheet.getDataRange().getValues();
  
  // Get the headers and get the index of the ldap and the approval status
  // using the names you use in the headers
  var headers = data[0];
  var idIndex = headers.indexOf('NAIL_TECH_ID');
  var nameIndex = headers.indexOf('NAIL_TECH_NAME');
  var amountIndex = headers.indexOf('AMOUNT');
  var paymentTypeIndex = headers.indexOf('PAYMENT_TYPE_ID');
  var tipIndex = headers.indexOf('TIP');
  var tipTypeIndex = headers.indexOf('TIP_TYPE_ID');
  var discountIndex = headers.indexOf('DISCOUNT_TYPE_ID');
  var dateIndex = headers.indexOf('DATE');
  var uuIdIndex = headers.indexOf('UUID'); 

  // Declare the variable for the correct row number
  var sheetRow;

  // Iterate data, look for the correct row checking the ldap, start from 1 as 0==headers
  for( var i = 1 ; i < data.length; i++ )
  {
    var row = data[i];
    if(row[uuIdIndex] == values.uuId)
    { 
      // You have found the correct row, set + 1 because Sheet range starts from 1, not 0
      sheetRow = i +1;

      // Record found, save to edit history as origin
      editHistorySheet.appendRow([row[idIndex], row[nameIndex], row[amountIndex], row[paymentTypeIndex], row[tipIndex], row[tipTypeIndex], row[discountIndex], row[dateIndex], row[uuIdIndex], "ORIGIN"]);

      // We have found the row, no need to iterate further
      break;
    }
  }
  // Also set statusIndex +1, because index in array is -1 compared to index in sheet
  ++idIndex;
  ++uuIdIndex
  ++nameIndex;
  ++amountIndex;
  ++paymentTypeIndex;
  ++tipIndex;
  ++tipTypeIndex;
  ++discountIndex;

  //Set the value
  activeSheet.getRange(sheetRow, idIndex).setValue(values.id); 
  activeSheet.getRange(sheetRow, nameIndex ).setValue(values.name); 
  activeSheet.getRange(sheetRow, amountIndex ).setValue(values.amount); 
  activeSheet.getRange(sheetRow, paymentTypeIndex ).setValue(values.amountPMType);
  activeSheet.getRange(sheetRow, tipIndex ).setValue(values.tip);
  activeSheet.getRange(sheetRow, tipTypeIndex ).setValue(values.tipType);
  activeSheet.getRange(sheetRow, discountIndex ).setValue(values.discount);

  // Save the modified record to edit history
  editHistorySheet.appendRow([values.id, values.name, values.amount, values.amountPMType, values.tip, values.tipType, values.discount, new Date(), values.uuId, "MODIFIED"]);

  return "Successfully updated!";

  // var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA');
  // var date = new Date();
  // data.date = date;
  // if (data.id <= 0 || data.id === "" || data.amount === "") {
  //   return "FAIL TO UPDATE!!!";
  // }
  // ws.appendRow([data.id, data.name, data.amount, data.amountPMType, data.tip, data.tipType, data.discount, data.date, Utilities.getUuid()]);
  // return "Sccessfully updated!";
}



























