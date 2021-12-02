function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Delil Nails')
  // .addItem('Sidebar form', 'showInsidebarform')
  // .addItem('Modal Dialog Form', 'showInmodaldialogform')
  .addItem('Sale', 'showSaleDialog')
  .addItem('Login', 'showLogin')
  .addItem('Edit', 'showEdit')
  .addItem('Report daily', 'showReportDaily')
  .addItem('Report members daily', 'showReportMembersDaily')
  .addItem('Weekly Report', 'showReportMembersWeekly')
  .addToUi();
  // startUpNotification();
}

function startUpNotification(){
  showSaleDialog();
  showLogin();
}

// OPEN THE FORM IN MODELESS DIALOG
function showSaleDialog() {
  var userForm = HtmlService.createTemplateFromFile('sale').evaluate()
  .setHeight(750)
  .setWidth(750);
  SpreadsheetApp.getUi().showModelessDialog(userForm, "SALE");
}

function showReportDaily() {
  var userForm = HtmlService.createTemplateFromFile('report').evaluate()
  .setHeight(1000)
  .setWidth(1000);
  SpreadsheetApp.getUi().showModelessDialog(userForm, "REPORT DAILY");
}

function showReportMembersDaily() {
  var userForm = HtmlService.createTemplateFromFile('report_members').evaluate()
  .setHeight(1000)
  .setWidth(1000);
  SpreadsheetApp.getUi().showModelessDialog(userForm, "REPORT MEMBERS DAILY");
}

function showEdit() {
  var userForm = HtmlService.createTemplateFromFile('edit').evaluate()
  .setHeight(1000)
  .setWidth(1000);
  SpreadsheetApp.getUi().showModelessDialog(userForm, "EDIT");
}

function showReportMembersWeekly() {
  var userForm = HtmlService.createTemplateFromFile('report_members_weekly').evaluate()
  .setHeight(1000)
  .setWidth(1000);
  SpreadsheetApp.getUi().showModelessDialog(userForm, "REPORT MEMBERS WEEKLY");
}


function showLogin() {
  var userForm = HtmlService.createTemplateFromFile('login').evaluate().setTitle('LOGIN');
  SpreadsheetApp.getUi().showSidebar(userForm);
}

function appenData(data) {
  var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA');
  var date = new Date();
  data.date = date;
  if (data.id <= 0 || data.id === "" || data.amount === "") {
    return "FAIL TO UPDATE!!!";
  }
  ws.appendRow([data.id, data.name, data.amount, data.amountPMType, data.tip, data.tipType, data.discount, data.date, Utilities.getUuid()]);
  return "Successfully updated!";
}

function appenSaleData(data) {
  var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SALE_DATA');
  var date = new Date();
  data.date = date;
  ws.appendRow([data.sale, data.salePMType, data.date]);
}

function doGet() {
  return HtmlService
      .createTemplateFromFile('main_page')
      .evaluate()
}

function onEdit(e) {
   if(e.range.getSheet().getName()=='MISC') {
    if(e.range.getA1Notation()=='A3' && e.value=="TRUE") {
      var sheet = SpreadsheetApp.getActiveSheet();
      var temp = sheet.getRange("A1").clearContent();
      temp.setValue(getNextTurn().toString());
      e.range.setValue("FALSE");
    }
  }else{
    return;
  }
}

function addUUID() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DATA');
  for (var i=2; i<180; i++) {
    var cell = activeSheet.getRange(i,9);
    cell.setValue(Utilities.getUuid());
  }
}






















