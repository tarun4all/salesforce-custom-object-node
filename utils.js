const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

function GenerateController(fieldsString, ControllerClassName, objectName,isOtherEnvironment,version) {
    let extension=".apxc";
    if(!isOtherEnvironment){
        extension=".cls";
        GenerateClsMetaFile(ControllerClassName,version);
    }
    
    let controllerClassFile = "./dump/" + ControllerClassName + extension;
    let createStream = fs.createWriteStream(controllerClassFile);

    fs.appendFileSync(controllerClassFile, "public class " + ControllerClassName + " { \n\n");

    fs.appendFileSync(controllerClassFile, "    public List<" + objectName + "> notes{get;set;} \n\n");
    fs.appendFileSync(controllerClassFile, "    public " + ControllerClassName + "() \n");
    fs.appendFileSync(controllerClassFile, "    { \n");
    fs.appendFileSync(controllerClassFile, "        note=new " + objectName + "(); \n");
    fs.appendFileSync(controllerClassFile, "        notes=[select " + fieldsString + ",CreatedBy.Name from " + objectName + " order by id DESC limit 1000]; \n");
    fs.appendFileSync(controllerClassFile, "    } \n\n");

    fs.appendFileSync(controllerClassFile, "    public PageReference InsertData() \n");
    fs.appendFileSync(controllerClassFile, "    { \n");
    fs.appendFileSync(controllerClassFile, "        insert note; \n");
    fs.appendFileSync(controllerClassFile, "        return null; \n");
    fs.appendFileSync(controllerClassFile, "    } \n\n");

    fs.appendFileSync(controllerClassFile, "    public " + objectName + " note {get;set;} \n");
    fs.appendFileSync(controllerClassFile, "} \n");
}

function GenerateTrigger(TriggerName, objectName, fieldForEncryption,ServiceClassName,isOtherEnvironment,version) {
let extension=".apxt";
if(!isOtherEnvironment){
    extension=".trigger"
    GenerateTriggerMetaFile(TriggerName,version);
}
let trFileName = "./dump/" + TriggerName + extension;
let createStream = fs.createWriteStream(trFileName);

fs.appendFileSync(trFileName, "trigger " + TriggerName + " on " + objectName + " (after insert, after update) { \n");
fs.appendFileSync(trFileName, "     for(" + objectName + " n : Trigger.New) { \n");
fs.appendFileSync(trFileName, "         try { \n");
fs.appendFileSync(trFileName, "             " + ServiceClassName + ".encrypt(n.Id,n." + fieldForEncryption + "); \n");
fs.appendFileSync(trFileName, "             } catch( System.AsyncException e ) {} \n");
fs.appendFileSync(trFileName, "         }  \n");
fs.appendFileSync(trFileName, "}  \n");

}

function GenerateViewPage(fieldDetail, ControllerClassName, ListViewPageName,EditPageName,isOtherEnvironment,version) {

    var extension=".vfp";
    if(!isOtherEnvironment){
        extension=".page";
        GeneratePageMetaFile(ListViewPageName,version);
    }

    let ListView = "./dump/" + ListViewPageName + extension;
    let createStream = fs.createWriteStream(ListView);
    let count=1;

fs.appendFileSync(ListView, '<apex:page controller="'+ControllerClassName+'" showHeader="true" sidebar="false" standardStylesheets="false" applyHtmlTag="true" applyBodyTag="false" docType="html-5.0"> \n');
fs.appendFileSync(ListView, '<html> \n');
fs.appendFileSync(ListView, '<head> \n');
fs.appendFileSync(ListView, '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"></link> \n');
fs.appendFileSync(ListView,'<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>\n');
fs.appendFileSync(ListView, '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script> \n');
fs.appendFileSync(ListView, '<style> \n');
fs.appendFileSync(ListView, '.panel-primary>.panel-heading { \n');
fs.appendFileSync(ListView, 'color: #353535; \n');
fs.appendFileSync(ListView, 'background-color: #daedf3; \n');
fs.appendFileSync(ListView, 'border-color: #337ab7; \n');
fs.appendFileSync(ListView, 'font-size: 16px;');
fs.appendFileSync(ListView, 'font-weight: bold; \n');
fs.appendFileSync(ListView, '} \n');
fs.appendFileSync(ListView, '.close { \n');
fs.appendFileSync(ListView, ' float: right; \n');
fs.appendFileSync(ListView, 'font-size: 21px; \n');
fs.appendFileSync(ListView, 'font-weight: 700; \n');
fs.appendFileSync(ListView, 'line-height: 1; \n');
fs.appendFileSync(ListView, 'color: #000; \n');
fs.appendFileSync(ListView, 'text-shadow: 0 1px 0 #fff; \n');
fs.appendFileSync(ListView, 'filter: alpha(opacity=20); \n');
fs.appendFileSync(ListView, 'opacity: 1.2 !important; \n');
fs.appendFileSync(ListView, '} \n');
fs.appendFileSync(ListView, '</style> \n');
fs.appendFileSync(ListView, '</head> \n');
fs.appendFileSync(ListView, '<body> \n');
fs.appendFileSync(ListView, '<apex:form styleClass="form-horizontal"> \n');
fs.appendFileSync(ListView, '<div class="col-md-12" style="padding-top:10px;padding-bottom:10px"> \n');
fs.appendFileSync(ListView, '<div class="panel panel-primary"> \n');
fs.appendFileSync(ListView, '<div class="panel-heading">Notes <button type="button" class="btn btn-info" data-toggle="modal" data-target="#myModal" style="float: right;"> \n');
fs.appendFileSync(ListView, '<span class="glyphicon glyphicon-plus-sign" /> New</button></div> \n');
fs.appendFileSync(ListView, '<div class="panel-body"> \n');
fs.appendFileSync(ListView, '<apex:outputPanel id="contactTable"> \n');
fs.appendFileSync(ListView, '<table class="table table-condensed" id="tblNote"> \n');
fs.appendFileSync(ListView, '<tr> \n');
fieldDetail.forEach(h => {
    if(h.FieldName.toLowerCase()!= "id"){
        fs.appendFileSync(ListView, '<th>' + h.FieldLabel + '</th> \n');
    }   
});
fs.appendFileSync(ListView, '<th>Action</th> \n');
fs.appendFileSync(ListView, '</tr> \n');
fs.appendFileSync(ListView, ' <apex:repeat value="{!notes}" var="n"> \n');
fs.appendFileSync(ListView, ' <tr> \n');
fieldDetail.forEach(e => {
    if (e.FieldName.toLowerCase()!= "id") {
        if(count<=1){
            count++;
            fs.appendFileSync(ListView, '<td> \n');
            fs.appendFileSync(ListView, '<apex:outputField value="{!n.' + e.FieldName + '}" /> \n');
            fs.appendFileSync(ListView, '<span style="display:none;">{!n.Id}</span> \n');
            fs.appendFileSync(ListView, '<span style="display:none;">{!n.CreatedBy.Name}</span>\n');
            fs.appendFileSync(ListView, '</td> \n');
           
        }
        else{
            fs.appendFileSync(ListView, '<td> \n');
            fs.appendFileSync(ListView, '<apex:outputField value="{!n.' + e.FieldName + '}" /> \n');
            fs.appendFileSync(ListView, '</td> \n');
        }
    }
   
});
fs.appendFileSync(ListView, '<td> \n');
fs.appendFileSync(ListView, '<button type="button" class="btn btn-info btnEdit"><span class="glyphicon glyphicon-pencil" /> Edit</button> \n');
fs.appendFileSync(ListView, '</td> \n');
fs.appendFileSync(ListView, '</tr> \n');
fs.appendFileSync(ListView, '</apex:repeat> \n');
fs.appendFileSync(ListView, '</table> \n');
fs.appendFileSync(ListView, '</apex:outputPanel>\n');
fs.appendFileSync(ListView, '</div> \n');
fs.appendFileSync(ListView, '</div>   \n');
fs.appendFileSync(ListView, '</div> \n');
fs.appendFileSync(ListView, "<script> $('.btnEdit').click(function(){ var id = $(this).closest('tr').find('td span:eq(1)').text(); var user = $(this).closest('tr').find('td span:eq(2)').text(); window.parent.location.href='/apex/"+EditPageName+"?id='+id+'&&user='+user; });</script> \n");
fs.appendFileSync(ListView, '<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">\n');
fs.appendFileSync(ListView, '<div class="modal-dialog" role="document">\n');
fs.appendFileSync(ListView, '  <div class="modal-content">\n');
fs.appendFileSync(ListView, '    <div class="modal-header" style="background-color:#daedf3;">\n');
fs.appendFileSync(ListView, '      <h4 class="modal-title" id="exampleModalLabel">New Note</h4>\n');
fs.appendFileSync(ListView, '      <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n');
fs.appendFileSync(ListView, '        <span aria-hidden="true">&times;</span>\n');
fs.appendFileSync(ListView, '     </button>\n');
fs.appendFileSync(ListView, '    </div>\n');
fs.appendFileSync(ListView, '    <div class="modal-body">\n');
fieldDetail.forEach(d => {
    if(d.FieldName.toLowerCase()!="id"){
        fs.appendFileSync(ListView, '           <div class="form-group">\n');
        fs.appendFileSync(ListView, '                      <label class="col-md-2 control-label" for="' + d.FieldLabel + '">' + d.FieldLabel + '</label>\n');
        fs.appendFileSync(ListView, '                      <div class="col-md-10">\n');
        fs.appendFileSync(ListView, '                         <apex:' + GetControlFromType(d.DataType) + ' value="{!note.' + d.FieldName + ' }" styleClass="form-control" />\n');
        fs.appendFileSync(ListView, '                      </div>\n');
        fs.appendFileSync(ListView, '                  </div>\n');
    }  
});
fs.appendFileSync(ListView, '    </div>\n');
fs.appendFileSync(ListView, '    <div class="modal-footer">\n');
fs.appendFileSync(ListView, '      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n');
fs.appendFileSync(ListView, ' 	<apex:commandButton value="Save Data" action="{!InsertData}" oncomplete="window.top.location.reload()"/>\n');
fs.appendFileSync(ListView, '   </div>\n');
fs.appendFileSync(ListView, '  </div>\n');
fs.appendFileSync(ListView, '</div>\n');
fs.appendFileSync(ListView, '</div>\n');
fs.appendFileSync(ListView, '</apex:form> \n');
fs.appendFileSync(ListView, '</body> \n');
fs.appendFileSync(ListView, '</html> \n');
fs.appendFileSync(ListView, '</apex:page> \n');
}

function GenerateEditController(fieldsString, fieldForEncryption, EditControllerClassName, ServiceClassName, objectName,isOtherEnvironment,version,ListViewPageName) {

    let extension=".apxc";
    if(!isOtherEnvironment){
        extension=".cls";
        GenerateClsMetaFile(EditControllerClassName,version);
    }

    var editController = "./dump/" + EditControllerClassName + extension;
    var createStream = fs.createWriteStream(editController);

fs.appendFileSync(editController, "public class " + EditControllerClassName + " { \n\n");
fs.appendFileSync(editController, "     private " + objectName + " note {get;set;} \n");
fs.appendFileSync(editController, "     private String decryptedBody; \n");
fs.appendFileSync(editController, "     private String reportMessage; \n");
fs.appendFileSync(editController, "     private boolean hasEncryptedData; \n");
fs.appendFileSync(editController, "     private String user; \n\n");
fs.appendFileSync(editController,"      private boolean isUnAuthorized;\n");
fs.appendFileSync(editController, "     public " + EditControllerClassName + "() { \n");
fs.appendFileSync(editController, "     user=ApexPages.currentPage().getParameters().get('user'); \n");
fs.appendFileSync(editController, "     note = [SELECT "+fieldsString+",CreatedBy.Name FROM " + objectName + " WHERE Id = :ApexPages.currentPage().getParameters().get('id')]; \n");
fs.appendFileSync(editController, "     if(note."+fieldForEncryption+".contains('sd@') && note."+fieldForEncryption+".contains('@sd')) { \n");
fs.appendFileSync(editController, "     hasEncryptedData=true; \n");
fs.appendFileSync(editController, "     } else { \n");
fs.appendFileSync(editController, "     hasEncryptedData = false; \n");
fs.appendFileSync(editController, "         } \n");
fs.appendFileSync(editController, "     } \n\n");

fs.appendFileSync(editController, "     public " + objectName + " getNote() { \n");
fs.appendFileSync(editController, "         return note; \n");
fs.appendFileSync(editController, "     } \n\n");

fs.appendFileSync(editController, "     public String getDecryptedBody() { \n");
fs.appendFileSync(editController, "         return decryptedBody; \n");
fs.appendFileSync(editController, "     } \n\n");


fs.appendFileSync(editController, "     public String getReportMessage() { \n");
fs.appendFileSync(editController, "         return reportMessage; \n");
fs.appendFileSync(editController, "     } \n\n");

fs.appendFileSync(editController, "     public boolean getHasEncryptedData() { \n");
fs.appendFileSync(editController, "         return hasEncryptedData; \n");
fs.appendFileSync(editController, "     } \n\n");

fs.appendFileSync(editController, "     public boolean getisUnAuthorized() { \n");
fs.appendFileSync(editController, "         return isUnAuthorized; \n");
fs.appendFileSync(editController, "     } \n\n");

fs.appendFileSync(editController, "     public PageReference decryptAuth() {\n");
fs.appendFileSync(editController, "         decryptedBody = "+ServiceClassName+".decrypt(user, note."+fieldForEncryption+");\n");
fs.appendFileSync(editController, "         if(decryptedBody==' Not authorized for decryption of this sensitive data.')\n");
fs.appendFileSync(editController, "         isUnAuthorized=true;\n");
fs.appendFileSync(editController, "         return null;\n");
fs.appendFileSync(editController, "     }\n\n");

fs.appendFileSync(editController, "     public PageReference decryptNoAuth() {\n");
fs.appendFileSync(editController, "         decryptedBody = " + ServiceClassName + ".decrypt(user, note."+fieldForEncryption+");\n");
fs.appendFileSync(editController, "         if(decryptedBody==' Not authorized for decryption of this sensitive data.')\n");
fs.appendFileSync(editController, "         isUnAuthorized=true;\n");
fs.appendFileSync(editController, "         return null; \n");
fs.appendFileSync(editController, "     }\n\n");

fs.appendFileSync(editController, "     public PageReference init()\n");
fs.appendFileSync(editController, "     {\n");
fs.appendFileSync(editController, "         decryptedBody = " + ServiceClassName + ".decrypt(user, note."+fieldForEncryption+");\n");
fs.appendFileSync(editController, "         if(decryptedBody=='Not authorized for decryption of this sensitive data.')\n");
fs.appendFileSync(editController, "         {\n");
fs.appendFileSync(editController, "             isUnAuthorized=true;\n");
fs.appendFileSync(editController, "             hasEncryptedData=false;\n");
fs.appendFileSync(editController, "         }\n");
fs.appendFileSync(editController, " 	    return null;\n ");
fs.appendFileSync(editController, "     }\n\n");

fs.appendFileSync(editController, "     public PageReference reportFalsePositive() {\n");
fs.appendFileSync(editController, "         " + ServiceClassName + ".reportFalsePositive(note);\n");
fs.appendFileSync(editController, "         reportMessage = 'Thank you for reporting this.';\n");
fs.appendFileSync(editController, "         return null; \n");
fs.appendFileSync(editController, "     }\n\n");

fs.appendFileSync(editController, "     public PageReference reportFalseNegative() {\n");
fs.appendFileSync(editController, "         " + ServiceClassName + ".reportFalseNegative(note);\n");
fs.appendFileSync(editController, "         reportMessage = 'Thank you for alerting us to this sensitive data.';\n");
fs.appendFileSync(editController, "         return null;\n");
fs.appendFileSync(editController, "     }\n\n");

fs.appendFileSync(editController, "     public PageReference wrongPermission() {\n");
fs.appendFileSync(editController, "         string reason='I am an admin';\n");
fs.appendFileSync(editController, "         " + ServiceClassName + ".WrongPermission(note.Id,reason);\n");
fs.appendFileSync(editController, "         reportMessage = 'Thank you for alerting us.'; \n");
fs.appendFileSync(editController, "         return null;        \n");
fs.appendFileSync(editController, "     }\n\n");

fs.appendFileSync(editController, "     public PageReference save() {\n");
fs.appendFileSync(editController, "         update note;\n");
fs.appendFileSync(editController, "         return null;\n");
fs.appendFileSync(editController, "     }\n");

fs.appendFileSync(editController," public PageReference DeleteRecord() {  \n");  
fs.appendFileSync(editController,"   delete note;\n");
fs.appendFileSync(editController,"String returnUrl = '/apex/"+ListViewPageName+"';\n");
fs.appendFileSync(editController,"PageReference retVal = new PageReference(returnUrl);\n");
fs.appendFileSync(editController,"return retVal;\n");
fs.appendFileSync(editController,"}\n");

fs.appendFileSync(editController, "}\n");
}


function GetControlFromType(dataType) {
    console.log(dataType);
var result = "";
switch (dataType.toLowerCase()) {
    case "boolean":
    result = "inputCheckbox";
    break;

    case "picklist":
    result = "selectList";
    break;

    case "string":
    result = "inputField";
    break;

    case "id":
    result = "Id";
    break;

    default:
    result = "inputField";
}
console.log("returning"+result);
return result;
}


function GenerateService(fieldsString, fieldForEncryption, ServiceClassName, objectName,isOtherEnvironment,version) {

    let extension=".apxc";
    if(!isOtherEnvironment){
        extension=".cls";
        GenerateClsMetaFile(ServiceClassName,version);
    }

    let serviceFile = "./dump/" + ServiceClassName + extension;
    let createStream = fs.createWriteStream(serviceFile);
createStream.end();
fs.appendFileSync(serviceFile, "public class "+ServiceClassName+" {\n\n");
fs.appendFileSync(serviceFile, "    public static boolean firstRun = true;\n");
fs.appendFileSync(serviceFile, "	private static String serviceHost = 'https://gols1.simplata.com/api'; \n");
fs.appendFileSync(serviceFile, "    private static final String PREFIX = 'sd@';\n");
fs.appendFileSync(serviceFile, "    private static final String SUFFIX = '@sd';\n");
fs.appendFileSync(serviceFile, "    private static final String SHARED_PARAMS = '&app=sfsc'\n");
fs.appendFileSync(serviceFile, "        + '&v=0.1.0'\n");
fs.appendFileSync(serviceFile, "        + '&app_unique_name=integration-test-1'\n");
fs.appendFileSync(serviceFile, "        + '&api_key=1957-9164-4593-7482';\n\n");

fs.appendFileSync(serviceFile, "    @future(callout=true)\n");
fs.appendFileSync(serviceFile, "    public static void encrypt(Id id,String " + fieldForEncryption.replace('__','') + ") {  \n");
fs.appendFileSync(serviceFile, "        /* TODO: Need to sanitize for HTML encoding */\n");
fs.appendFileSync(serviceFile, "        String postData = 'user=bruce' + SHARED_PARAMS + '&data='+" + fieldForEncryption.replace('__','') + ";\n");
fs.appendFileSync(serviceFile, "        String url = serviceHost + '/tokenize';\n");
fs.appendFileSync(serviceFile, "        Map<String, Object> results = callService(url, postData);\n");
fs.appendFileSync(serviceFile, "        Map<String, Object> response =(Map<String, Object>) results.get('response');\n");

fs.appendFileSync(serviceFile, "        Boolean matched = (Boolean)response.get('matched');\n");
fs.appendFileSync(serviceFile, "        if( matched ) {\n");
fs.appendFileSync(serviceFile, "            String processedBody = (String)response.get('data');\n");
fs.appendFileSync(serviceFile, "            system.debug('processbody'+processedBody);\n");
fs.appendFileSync(serviceFile, "            " + objectName + " n = [SELECT " + fieldsString + " FROM " + objectName + " WHERE Id = :id LIMIT 1];\n");
fs.appendFileSync(serviceFile, "            n." + fieldForEncryption + " = processedBody;\n");
fs.appendFileSync(serviceFile, "            update n;\n");
fs.appendFileSync(serviceFile, "        }\n");
fs.appendFileSync(serviceFile, "    }\n\n");

fs.appendFileSync(serviceFile, "	    public static string DataEncryption(string noteBody) \n");
fs.appendFileSync(serviceFile, "        {  \n");
fs.appendFileSync(serviceFile, "         	String processedBody='';\n");
fs.appendFileSync(serviceFile, "            /* TODO: Need to sanitize for HTML encoding */\n");
fs.appendFileSync(serviceFile, "            String postData = 'user=bruce' + SHARED_PARAMS + '&data='+noteBody;\n");
fs.appendFileSync(serviceFile, "            String url = serviceHost + '/tokenize';\n");
fs.appendFileSync(serviceFile, "            Map<String, Object> results = callService(url, postData);\n");
fs.appendFileSync(serviceFile, "            Map<String, Object> response =(Map<String, Object>) results.get('response');\n");
fs.appendFileSync(serviceFile, "        	system.debug(response);\n");
fs.appendFileSync(serviceFile, "            Boolean matched = (Boolean)response.get('matched');\n");
fs.appendFileSync(serviceFile, "            if( matched ) {\n");
fs.appendFileSync(serviceFile, "                processedBody = (String)response.get('data');\n");
fs.appendFileSync(serviceFile, "            }\n");
fs.appendFileSync(serviceFile, "            return processedBody;\n");
fs.appendFileSync(serviceFile, "    }\n\n");

fs.appendFileSync(serviceFile, "    public static String decrypt(String user, String encryptedData) {\n");
fs.appendFileSync(serviceFile, "        /* TODO: Need to sanitize for HTML encoding */\n");
fs.appendFileSync(serviceFile, "        String postData = 'user=' + user + SHARED_PARAMS + '&data='+encryptedData;\n");
fs.appendFileSync(serviceFile, "        String url = serviceHost + '/detokenize/';\n");
fs.appendFileSync(serviceFile, "        Map<String, Object> results = callService(url, postData);\n");
fs.appendFileSync(serviceFile, "        Map<String, Object> response =(Map<String, Object>) results.get('response');\n");
fs.appendFileSync(serviceFile, "        String status = (String)response.get('status');\n");
fs.appendFileSync(serviceFile, "        if( status == 'authorized') {\n");
fs.appendFileSync(serviceFile, "        	String decryptedData = (String)response.get('data');   \n");
fs.appendFileSync(serviceFile, "	        return decryptedData;\n");
fs.appendFileSync(serviceFile, "        } else {\n");
fs.appendFileSync(serviceFile, "            return 'Not authorized for decryption of this sensitive data.';\n");
fs.appendFileSync(serviceFile, "        }\n");
fs.appendFileSync(serviceFile, "	}\n");
fs.appendFileSync(serviceFile, "    public static void reportFalsePositive(" + objectName + " n) {\n");
fs.appendFileSync(serviceFile, "        String postData = 'user=bruce' + SHARED_PARAMS + '&data='+n." + fieldForEncryption + ";\n");
fs.appendFileSync(serviceFile, "        String url = serviceHost + '/false_positive/';\n");
fs.appendFileSync(serviceFile, "        callService(url, postData);\n");
fs.appendFileSync(serviceFile, "    }\n\n");

fs.appendFileSync(serviceFile, "    public static void reportFalseNegative(" + objectName + " n) {\n");
fs.appendFileSync(serviceFile, "        String postData = 'user=bruce' + SHARED_PARAMS\n");
fs.appendFileSync(serviceFile, "            + '&data_type=Note'\n");
fs.appendFileSync(serviceFile, "           + '&data_id=' + n.Id\n");
fs.appendFileSync(serviceFile, "            + '&data=' + n." + fieldForEncryption + ";\n");
fs.appendFileSync(serviceFile, "        String url = serviceHost + '/false_negative/';\n");
fs.appendFileSync(serviceFile, "        callService(url, postData);\n");
fs.appendFileSync(serviceFile, "    }\n\n");

fs.appendFileSync(serviceFile, "    public static void WrongPermission(String id,String reason) \n");
fs.appendFileSync(serviceFile, "    {\n");
fs.appendFileSync(serviceFile, "        " + objectName + " n = [SELECT " + fieldsString + " from " + objectName + " WHERE Id = :id LIMIT 1];\n");
fs.appendFileSync(serviceFile, "        String postData = 'user=bruce' + SHARED_PARAMS + '&data=' + n." + fieldForEncryption + "+'&reason='+reason;\n");
fs.appendFileSync(serviceFile, "        String url = serviceHost + '/wrong_permission/';\n");
fs.appendFileSync(serviceFile, "        callService(url, postData);  \n");
fs.appendFileSync(serviceFile, "    }\n\n");

fs.appendFileSync(serviceFile, "	private static Map<String, Object> callService(String url, String postData) {\n");
fs.appendFileSync(serviceFile, "        system.debug(postData);\n");
fs.appendFileSync(serviceFile, "        system.debug(url);\n");
fs.appendFileSync(serviceFile, "        HttpRequest req = new HttpRequest();\n");
fs.appendFileSync(serviceFile, "        req = new HttpRequest();\n");
fs.appendFileSync(serviceFile, "        req.setEndpoint(url);\n");
fs.appendFileSync(serviceFile, "        req.setMethod('POST');\n");
fs.appendFileSync(serviceFile, "        req.setBody(postData);\n");
fs.appendFileSync(serviceFile, "        req.setTimeout(10000);\n");
fs.appendFileSync(serviceFile, "        Http http = new Http();\n");
fs.appendFileSync(serviceFile, "        HttpResponse res = http.send(req);\n");
fs.appendFileSync(serviceFile, "        system.debug('response'+res);\n");
fs.appendFileSync(serviceFile, "        Map<String, Object> results = null;\n");
fs.appendFileSync(serviceFile, "        if (res.getStatusCode() == 200) {\n");
fs.appendFileSync(serviceFile, "            // Deserialize the JSON string into collections of primitive data types.\n");
fs.appendFileSync(serviceFile, "            results = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());\n");
fs.appendFileSync(serviceFile, "            return results;\n");
fs.appendFileSync(serviceFile, "        }\n");
fs.appendFileSync(serviceFile, "        else\n");
fs.appendFileSync(serviceFile, "        {\n");
fs.appendFileSync(serviceFile, "          	return callService(url,postData);      \n");
fs.appendFileSync(serviceFile, "        }\n");
fs.appendFileSync(serviceFile, "    }    \n");
fs.appendFileSync(serviceFile, "}\n");
}

function GenererateEditPage(fieldDetail, GlobalfileName, EditControllerClassName, EditPageName,fieldForEncryption,ListViewPageName,isOtherEnvironment,version) {


    var extension=".vfp";
    if(!isOtherEnvironment){
        extension=".page";
        GeneratePageMetaFile(EditPageName,version);
    }

    let editPage = "./dump/" + EditPageName + extension;
    let createStream = fs.createWriteStream(editPage);
fs.appendFileSync(editPage, '<apex:page controller="'+EditControllerClassName+'" showHeader="true" sidebar="false" standardStylesheets="false"\n');
fs.appendFileSync(editPage, '    applyHtmlTag="true" applyBodyTag="false" docType="html-5.0">\n');
fs.appendFileSync(editPage, '   <html>\n');
fs.appendFileSync(editPage, '<head>\n');
fs.appendFileSync(editPage, '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"></link>\n');
fs.appendFileSync(editPage, '  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>\n');
fs.appendFileSync(editPage, '  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>\n');
fs.appendFileSync(editPage, '  <apex:includeScript value="/soap/ajax/36.0/connection.js"/>\n');
fs.appendFileSync(editPage, '  <apex:includeScript value="/soap/ajax/36.0/apex.js"/>\n');
fs.appendFileSync(editPage, '  <style>\n');
fs.appendFileSync(editPage, '  .panel-primary>.panel-heading {\n');
fs.appendFileSync(editPage, '    color: #353535;\n');
fs.appendFileSync(editPage, '    background-color: #daedf3;\n');
fs.appendFileSync(editPage, '    border-color: #337ab7;\n');
fs.appendFileSync(editPage, '    font-size: 16px;\n');
fs.appendFileSync(editPage, '    font-weight: bold;\n');
fs.appendFileSync(editPage, '}\n');
fs.appendFileSync(editPage, '    .close {\n');
fs.appendFileSync(editPage, '    float: right;\n');
fs.appendFileSync(editPage, '    font-size: 21px;\n');
fs.appendFileSync(editPage, '    font-weight: 700;\n');
fs.appendFileSync(editPage, '    line-height: 1;\n');
fs.appendFileSync(editPage, '    color: #000;\n');
fs.appendFileSync(editPage, '    text-shadow: 0 1px 0 #fff;\n');
fs.appendFileSync(editPage, '    filter: alpha(opacity=20);\n');
fs.appendFileSync(editPage, '    opacity: 1.2 !important;\n');
fs.appendFileSync(editPage, '}\n');
fs.appendFileSync(editPage, '  </style>\n');
fs.appendFileSync(editPage, '</head>\n');
fs.appendFileSync(editPage, '<body>\n');
fs.appendFileSync(editPage, '<input type="hidden" value="{!hasEncryptedData}" id="hiddenValue" />\n');
fs.appendFileSync(editPage, '<div class="col-md-7" style="padding-top:10px;padding-bottom:10px">\n');
fs.appendFileSync(editPage, '<div class="panel panel-primary">\n');
fs.appendFileSync(editPage, '          <div class="panel-heading">Detail</div>\n');
fs.appendFileSync(editPage, '          <div class="panel-body">\n');
fs.appendFileSync(editPage, '          	<apex:form styleClass="form-horizontal">\n');
fs.appendFileSync(editPage, '                            <input type="hidden" value="{!note.Id }" id="Id" />\n');
fs.appendFileSync(editPage, '                            <input type="hidden" value="{!note.CreatedBy.Name }" id="CreatedBy" />\n');
fs.appendFileSync(editPage, '                            <input type="hidden" value="{!note.'+fieldForEncryption+' }" id="Body" />\n');
fieldDetail.forEach(e => {

    if(e.FieldName.toLowerCase()!="id"){
        fs.appendFileSync(editPage, '                    <div class="form-group">\n');
        fs.appendFileSync(editPage, '                        <label class="col-md-2 control-label" for="' + e.FieldLabel + '">' + e.FieldLabel + '</label>\n');
        fs.appendFileSync(editPage, '                        <div class="col-md-10">\n');
        fs.appendFileSync(editPage, '                            <apex:' + GetControlFromType(e.DataType) + ' value="{!note.' + e.FieldName + ' }" styleClass="form-control" />\n');
        fs.appendFileSync(editPage, '                        </div>\n');
        fs.appendFileSync(editPage, '                    </div>\n');
    }
   
    
});
fs.appendFileSync(editPage, '                    <div class="form-group">\n');
fs.appendFileSync(editPage, '                        <div class="col-md-12 col-md-offset-2">\n');
fs.appendFileSync(editPage, '                            <apex:commandButton styleclass="btn btn-primary" value="Save" action="{!save}" />\n');
fs.appendFileSync(editPage, '                            <button type="button" class="btn btn-success" id="btnCancel">Cancel</button>\n');
fs.appendFileSync(editPage,'                             <apex:commandButton styleclass="btn btn-primary" value="Delete" action="{!DeleteRecord}" />\n');
fs.appendFileSync(editPage, '                            <button type="button" id="btnSensitiveData" class="btn btn-success">This Data Is Sensitive</button>\n');
fs.appendFileSync(editPage, '                            <button type="button" id="btnDisplaySensitiveDataBruce" class="btn btn-success">Display Sensitive Data(Bruce)</button>\n');
fs.appendFileSync(editPage, '                            <button type="button" id="btnDisplaySensitiveDataCurrentUser" class="btn btn-success">Display Sensitive Data(Current User)</button>\n');
fs.appendFileSync(editPage, '                        </div>\n');
fs.appendFileSync(editPage, '                    </div>\n');
fs.appendFileSync(editPage, '                </apex:form>\n');
fs.appendFileSync(editPage, '          </div>\n');
fs.appendFileSync(editPage, '    </div>       \n');
fs.appendFileSync(editPage, '</div>\n');
fs.appendFileSync(editPage, '<div class="modal fade" id="DisplaySenstivieInfo" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">\n');
fs.appendFileSync(editPage, '  <div class="modal-dialog" role="document">\n');
fs.appendFileSync(editPage, '    <div class="modal-content">\n');
fs.appendFileSync(editPage, '      <div class="modal-header" style="background-color:#daedf3">\n');
fs.appendFileSync(editPage, '        <h4 class="modal-title" id="exampleModalLabel">Sensitive Data</h4>\n');
fs.appendFileSync(editPage, '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n');
fs.appendFileSync(editPage, '          <span aria-hidden="true">&times;</span>\n');
fs.appendFileSync(editPage, '        </button>\n');
fs.appendFileSync(editPage, '      </div>\n');
fs.appendFileSync(editPage, '      <div class="modal-body">\n');
fs.appendFileSync(editPage, '        <div class="form-group">\n');
fs.appendFileSync(editPage, '          <div class="col-md-12">\n');
fs.appendFileSync(editPage, '              <p id="SensitiveDataResult"></p>\n');
fs.appendFileSync(editPage, '              <p id="DataIsNotSensitiveResult"></p>\n');
fs.appendFileSync(editPage, '            </div>  \n');
fs.appendFileSync(editPage, '        </div>\n');
fs.appendFileSync(editPage, '      </div>\n');
fs.appendFileSync(editPage, '      <div class="modal-footer">\n');
fs.appendFileSync(editPage, "       <button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>\n");
fs.appendFileSync(editPage, "       <button type='button' style='display:none' id='btnNotSensitive' class='btn btn-primary'>This Data Isn't Sensitive</button>\n");
fs.appendFileSync(editPage, '        <button type="button" style="display:none" id="IShouldHaveAccess" class="btn btn-primary">I Should Have Access To This Data</button>\n');
fs.appendFileSync(editPage, '      </div>\n');
fs.appendFileSync(editPage, '    </div>\n');
fs.appendFileSync(editPage, '  </div>\n');
fs.appendFileSync(editPage, '</div>\n');
fs.appendFileSync(editPage, '<script type="text/javascript">\n');
fs.appendFileSync(editPage, '    $(document).ready(function(){\n');
fs.appendFileSync(editPage, '        var IsTrue=$("#hiddenValue").val();\n');
fs.appendFileSync(editPage, '       	if(IsTrue=="true"){\n');
fs.appendFileSync(editPage, '        	$("#btnSensitiveData").hide();\n');
fs.appendFileSync(editPage, '        }\n');
fs.appendFileSync(editPage, '        else{\n');
fs.appendFileSync(editPage, '            $("#btnDisplaySensitiveDataBruce").hide();\n');
fs.appendFileSync(editPage, '            $("#btnDisplaySensitiveDataCurrentUser").hide();\n');
fs.appendFileSync(editPage, '        }\n');
fs.appendFileSync(editPage, '    });\n');
fs.appendFileSync(editPage, '    $("#IShouldHaveAccess").click(function(){\n');
fs.appendFileSync(editPage, "     	sforce.connection.sessionId = '{!$Api.Session_ID}'; \n");
fs.appendFileSync(editPage, '        $("#DataIsNotSensitiveResult").text("");\n');
fs.appendFileSync(editPage, '    	try {\n');
fs.appendFileSync(editPage, '           var Reason="I Am Admin"; \n');
fs.appendFileSync(editPage, '           var result = sforce.apex.execute("' + GlobalfileName + '","WrongPermission",{id:$("#Id").val(),reason:Reason});\n');
fs.appendFileSync(editPage, '           $("#DataIsNotSensitiveResult").text(result);\n');
fs.appendFileSync(editPage, '        } catch(e) {\n');
fs.appendFileSync(editPage, "         alert('Exception'+e)\n");
fs.appendFileSync(editPage, '        }\n');
fs.appendFileSync(editPage, '    });\n');


fs.appendFileSync(editPage, '    $("#btnSensitiveData").click(function(){\n');
fs.appendFileSync(editPage, "         $('#SensitiveDataResult').text('');\n");
fs.appendFileSync(editPage, "       sforce.connection.sessionId = '{!$Api.Session_ID}';\n");
fs.appendFileSync(editPage, '       try {\n');
fs.appendFileSync(editPage, '         var result = sforce.apex.execute("' + GlobalfileName + '","reportFalseNegative",{id:$("#Id").val()});\n');
fs.appendFileSync(editPage, '         $("#SensitiveDataResult").text(result);\n');
fs.appendFileSync(editPage, "          $('#DisplaySenstivieInfo').modal('show');\n");
fs.appendFileSync(editPage, '      } catch(e) {\n');
fs.appendFileSync(editPage, "       alert('Exception'+e)\n");
fs.appendFileSync(editPage, '    }\n');
fs.appendFileSync(editPage, ' });\n');


fs.appendFileSync(editPage, '    $("#btnNotSensitive").click(function(){\n');
fs.appendFileSync(editPage, "         $('#DataIsNotSensitiveResult').text('')\n");
fs.appendFileSync(editPage, "       sforce.connection.sessionId = '{!$Api.Session_ID}';\n");
fs.appendFileSync(editPage, '       try {\n');
fs.appendFileSync(editPage, '         var result = sforce.apex.execute("' + GlobalfileName + '","reportFalsePositive",{id:$("#Id").val()});\n');
fs.appendFileSync(editPage, '         $("#DataIsNotSensitiveResult").text(result);\n');
fs.appendFileSync(editPage, '      } catch(e) {\n');
fs.appendFileSync(editPage, "       alert('Exception'+e)\n");
fs.appendFileSync(editPage, '    }\n');
fs.appendFileSync(editPage, ' });\n');
fs.appendFileSync(editPage, '$("#btnDisplaySensitiveDataBruce").click(function(){ \n');
fs.appendFileSync(editPage, "    	$('#DataIsNotSensitiveResult').text('');\n");
fs.appendFileSync(editPage, "  $('#SensitiveDataResult').text('');\n");
fs.appendFileSync(editPage, "	sforce.connection.sessionId = '{!$Api.Session_ID}'\n");
fs.appendFileSync(editPage, 'try {\n');
fs.appendFileSync(editPage, '   var data=$("#Body").val();\n');
fs.appendFileSync(editPage, '   var result = sforce.apex.execute("' + GlobalfileName + '","decrypt",{user:"bruce",encryptedData:data});\n');
fs.appendFileSync(editPage, '  if(result!="Not authorized for decryption of this sensitive data."){\n');
fs.appendFileSync(editPage, '           $("#IShouldHaveAccess").hide();\n');
fs.appendFileSync(editPage, '         	$("#btnNotSensitive").show();\n');
fs.appendFileSync(editPage, '          }\n');
fs.appendFileSync(editPage, '         else{\n');
fs.appendFileSync(editPage, '$("#IShouldHaveAccess").show();\n');
fs.appendFileSync(editPage, '$("#btnNotSensitive").hide();\n');
fs.appendFileSync(editPage, '}\n');
fs.appendFileSync(editPage, '//if(data.indexOf("sd@")!=-1){\n');
fs.appendFileSync(editPage, '//	alert("contain");\n');
fs.appendFileSync(editPage, '//}\n');
fs.appendFileSync(editPage, '$("#SensitiveDataResult").text(result);\n');
fs.appendFileSync(editPage, "$('#DisplaySenstivieInfo').modal('show');\n");
fs.appendFileSync(editPage, '} catch(e) {\n');
fs.appendFileSync(editPage, "alert('Exception'+e)\n");
fs.appendFileSync(editPage, '}\n');
fs.appendFileSync(editPage, '});\n');
fs.appendFileSync(editPage, '$("#btnEdit").click(function(){ \n');
fs.appendFileSync(editPage, 'window.parent.location.href="/apex/'+EditPageName+'";  \n');
fs.appendFileSync(editPage, '});\n');

fs.appendFileSync(editPage, '$("#btnCancel").click(function(){ \n');
fs.appendFileSync(editPage, 'window.parent.location.href="/apex/'+ListViewPageName+'";  \n');
fs.appendFileSync(editPage, '});\n');

fs.appendFileSync(editPage, '$("#btnDisplaySensitiveDataCurrentUser").click(function(){ \n');
fs.appendFileSync(editPage, " $('#DataIsNotSensitiveResult').text('');\n");
fs.appendFileSync(editPage, "$('#SensitiveDataResult').text('');\n");
fs.appendFileSync(editPage, "sforce.connection.sessionId = '{!$Api.Session_ID}';\n");
fs.appendFileSync(editPage, '  try {\n');
fs.appendFileSync(editPage, '  var result = sforce.apex.execute("'+GlobalfileName+'","decrypt",{user:$("#CreatedBy").val(),encryptedData:$("#Body").val()});\n');
fs.appendFileSync(editPage, '  if(result!="Not authorized for decryption of this sensitive data."){\n');
fs.appendFileSync(editPage, ' $("#IShouldHaveAccess").hide();\n');
fs.appendFileSync(editPage, '$("#btnNotSensitive").show();\n');
fs.appendFileSync(editPage, '}\n');
fs.appendFileSync(editPage, ' else{\n');
fs.appendFileSync(editPage, ' $("#IShouldHaveAccess").show();\n');
fs.appendFileSync(editPage, '$("#btnNotSensitive").hide();\n');
fs.appendFileSync(editPage, '}\n');
fs.appendFileSync(editPage, '$("#SensitiveDataResult").text(result);\n');
fs.appendFileSync(editPage, " $('#DisplaySenstivieInfo').modal('show');\n");
fs.appendFileSync(editPage, '} catch(e) {\n');
fs.appendFileSync(editPage, "alert('Exception'+e)\n");
fs.appendFileSync(editPage, '}\n');
//window.open("/apex/VFPage1?id={!note.Id}&&user={!note.CreatedBy.Name}", "MsgWindow", "toolbar=no,scrollbars=yes,resizable=yes,top=200,left=500,width=400,height=400,status=no");
fs.appendFileSync(editPage, '});\n');
fs.appendFileSync(editPage, '</script>   \n');
fs.appendFileSync(editPage, '</body>\n');
fs.appendFileSync(editPage, '</html>\n');
fs.appendFileSync(editPage, '</apex:page>\n');
}

function GenerateGlobalService(fieldsString, fieldForEncryption, GlobalfileName, objectName,isOtherEnvironment,version) {

    let extension=".apxc";
    if(!isOtherEnvironment) {
        extension=".cls";
        GenerateClsMetaFile(GlobalfileName,version);
    }
    let Globalfile = "./dump/" + GlobalfileName + extension;
    let createStream = fs.createWriteStream(Globalfile);

fs.appendFileSync(Globalfile, "global class "+GlobalfileName+" {\n\n");
fs.appendFileSync(Globalfile, "     public static boolean firstRun = true;\n");
fs.appendFileSync(Globalfile, "	    private static String serviceHost = 'https://gols1.simplata.com/api'; \n");
fs.appendFileSync(Globalfile, "     private static final String PREFIX = 'sd@';\n");
fs.appendFileSync(Globalfile, "     private static final String SUFFIX = '@sd';\n");
fs.appendFileSync(Globalfile, "     private static final String SHARED_PARAMS = '&app=sfsc'\n");
fs.appendFileSync(Globalfile, "        + '&v=0.1.0'\n");
fs.appendFileSync(Globalfile, "        + '&app_unique_name=integration-test-1'\n");
fs.appendFileSync(Globalfile, "        + '&api_key=1957-9164-4593-7482';\n\n");


fs.appendFileSync(Globalfile, "     WebService static string decrypt(String user, String encryptedData) \n");
fs.appendFileSync(Globalfile, "     {  \n");
fs.appendFileSync(Globalfile, "         String processedBody='';\n");
fs.appendFileSync(Globalfile, "         /* TODO: Need to sanitize for HTML encoding */\n");
fs.appendFileSync(Globalfile, "         String postData = 'user=bruce' + SHARED_PARAMS + '&data=' + encryptedData;\n");
fs.appendFileSync(Globalfile, "         String url = serviceHost + '/detokenize';\n");
fs.appendFileSync(Globalfile, "         Map<String, Object> results = callService(url, postData);\n");
fs.appendFileSync(Globalfile, "         Map<String, Object> response =(Map<String, Object>) results.get('response');\n");
fs.appendFileSync(Globalfile, "         String status = (String)response.get('status');\n");
fs.appendFileSync(Globalfile, "         if( status == 'authorized') {\n");
fs.appendFileSync(Globalfile, "         String decryptedData = (String)response.get('data');  \n");
fs.appendFileSync(Globalfile, "         return decryptedData;\n");
fs.appendFileSync(Globalfile, "         }   else {\n");
fs.appendFileSync(Globalfile, "             return 'Not authorized for decryption of this sensitive data.';\n");
fs.appendFileSync(Globalfile, "         }\n");
fs.appendFileSync(Globalfile, "     }\n\n");

fs.appendFileSync(Globalfile, "     WebService static string reportFalsePositive(Id id) \n");
fs.appendFileSync(Globalfile, "     {\n");
fs.appendFileSync(Globalfile, "         string result='';\n");
fs.appendFileSync(Globalfile, "         " + objectName + " n = [SELECT " + fieldsString + " FROM " + objectName + " WHERE Id = :id LIMIT 1];\n");
fs.appendFileSync(Globalfile, "         String postData = 'user=bruce' + SHARED_PARAMS + '&data=' + n." + fieldForEncryption + ";\n");
fs.appendFileSync(Globalfile, "         String url = serviceHost + '/false_positive/';\n");
fs.appendFileSync(Globalfile, "         callService(url, postData);\n");
fs.appendFileSync(Globalfile, "         result='Thank you for reporting this.';\n");
fs.appendFileSync(Globalfile, "         return result;\n");
fs.appendFileSync(Globalfile, "     }\n\n");

fs.appendFileSync(Globalfile, "     WebService static string reportFalseNegative(Id id) \n");
fs.appendFileSync(Globalfile, "     {\n");
fs.appendFileSync(Globalfile, "         string result='';\n");
fs.appendFileSync(Globalfile, "         " + objectName + " n = [SELECT " + fieldsString + " FROM " + objectName + " WHERE Id = :id LIMIT 1];\n");
fs.appendFileSync(Globalfile, "         String postData = 'user=bruce' + SHARED_PARAMS + '&data_type="+objectName+"&data_id="+objectName+".id &data=' + n." + fieldForEncryption + ";\n");
fs.appendFileSync(Globalfile, "         String url = serviceHost + '/false_positive/';\n");
fs.appendFileSync(Globalfile, "         callService(url, postData);\n");
fs.appendFileSync(Globalfile, "         result='Thank you for reporting this.';\n");
fs.appendFileSync(Globalfile, "         return result;\n");
fs.appendFileSync(Globalfile, "     }\n\n");

fs.appendFileSync(Globalfile, "    WebService static string WrongPermission(String id,String reason) \n");
fs.appendFileSync(Globalfile, "    {\n");
fs.appendFileSync(Globalfile, "         string result='';\n");
fs.appendFileSync(Globalfile, "        " + objectName + " n = [SELECT " + fieldsString + " from " + objectName + " WHERE Id = :id LIMIT 1];\n");
fs.appendFileSync(Globalfile, "        String postData = 'user=bruce' + SHARED_PARAMS + '&data='+n." + fieldForEncryption + "+'&reason='+reason;\n");
fs.appendFileSync(Globalfile, "        String url = serviceHost + '/wrong_permission/';\n");
fs.appendFileSync(Globalfile, "        Map<String, Object> results=callService(url, postData);\n");
fs.appendFileSync(Globalfile, "        if(results!=null)\n");
fs.appendFileSync(Globalfile, "        {\n");
fs.appendFileSync(Globalfile, "          result='Thank you for reporting this.';\n");
fs.appendFileSync(Globalfile, "        }\n");
fs.appendFileSync(Globalfile, "        else\n");
fs.appendFileSync(Globalfile, "        {\n");
fs.appendFileSync(Globalfile, "          result='Something Went Wrong';\n");
fs.appendFileSync(Globalfile, "        }\n");
fs.appendFileSync(Globalfile, "          return result;\n");
fs.appendFileSync(Globalfile, "    }\n\n");


fs.appendFileSync(Globalfile, "private static Map<String, Object> callService(String url, String postData) {\n");
        
fs.appendFileSync(Globalfile, "   HttpRequest req = new HttpRequest();\n");
fs.appendFileSync(Globalfile, "    req = new HttpRequest();\n");
fs.appendFileSync(Globalfile, "    req.setEndpoint(url);\n");
fs.appendFileSync(Globalfile, "    req.setMethod('POST');\n");
fs.appendFileSync(Globalfile, "    req.setBody(postData);\n");
fs.appendFileSync(Globalfile, "    req.setTimeout(10000);\n");
    
fs.appendFileSync(Globalfile, "    Http http = new Http();\n");
fs.appendFileSync(Globalfile, "    HttpResponse res = http.send(req);\n");
fs.appendFileSync(Globalfile, "    system.debug('response='+res);\n");
fs.appendFileSync(Globalfile, "    Map<String, Object> results = null;\n");
fs.appendFileSync(Globalfile, "    if (res.getStatusCode() == 200) {\n");
fs.appendFileSync(Globalfile, "        // Deserialize the JSON string into collections of primitive data types.\n");
fs.appendFileSync(Globalfile, "        results = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());\n");
fs.appendFileSync(Globalfile, "    }\n");
fs.appendFileSync(Globalfile, "    return results;\n");
fs.appendFileSync(Globalfile, "}\n");
fs.appendFileSync(Globalfile, "}\n");
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function compressZip(zipName) {
    var output = fs.createWriteStream(__dirname + `/public/zip/${zipName}.zip`);
    var archive = archiver('zip', {
        zlib: { level: 9 }
    });
    
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    
    output.on('end', function() {
        console.log('Data has been drained');
    });
    
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            console.log(err);
        }
    });
    
    archive.on('error', function(err) {
        console.log(err);
    });
    
    archive.pipe(output);
    archive.directory('dump/', false);
    archive.finalize();
}

function GenerateClsMetaFile(metaFileName,version){
let FileName = "./dump/" + metaFileName + ".cls-meta.xml";
var createStream = fs.createWriteStream(FileName);
createStream.end();
fs.appendFileSync(FileName, "<?xml version='1.0' encoding='UTF-8'?>\n");
fs.appendFileSync(FileName, "<ApexClass xmlns='http://soap.sforce.com/2006/04/metadata'>\n");
fs.appendFileSync(FileName, "    <apiVersion>"+version+"</apiVersion>\n");
fs.appendFileSync(FileName, "    <status>Active</status>\n");
fs.appendFileSync(FileName, "</ApexClass>\n");
}

function GenerateTriggerMetaFile(metaFileName,version){
    let FileName = "./dump/" + metaFileName + ".trigger-meta.xml";
    let createStream = fs.createWriteStream(FileName);
    createStream.end();
    fs.appendFileSync(FileName, "<?xml version='1.0' encoding='UTF-8'?>\n");
    fs.appendFileSync(FileName, "<ApexTrigger xmlns='http://soap.sforce.com/2006/04/metadata'>\n");
    fs.appendFileSync(FileName, "    <apiVersion>"+version+"</apiVersion>\n");
    fs.appendFileSync(FileName, "    <status>Active</status>\n");
    fs.appendFileSync(FileName, "</ApexTrigger>\n");
}

function GeneratePageMetaFile(metaFileName,version){
        let FileName = "./dump/" + metaFileName + ".page-meta.xml";
        let createStream = fs.createWriteStream(FileName);
        createStream.end();

        fs.appendFileSync(FileName, '<?xml version="1.0" encoding="UTF-8"?>\n');
        fs.appendFileSync(FileName, '<ApexPage xmlns="http://soap.sforce.com/2006/04/metadata">\n');
        fs.appendFileSync(FileName, '   <apiVersion>48.0</apiVersion>\n');
        fs.appendFileSync(FileName, '   <availableInTouch>false</availableInTouch>\n');
        fs.appendFileSync(FileName, '  <confirmationTokenRequired>false</confirmationTokenRequired>\n');
        fs.appendFileSync(FileName, '   <label>'+metaFileName+'</label>\n');
        fs.appendFileSync(FileName, '   <packageVersions>\n');
        fs.appendFileSync(FileName, '       <majorNumber>1</majorNumber>\n');
        fs.appendFileSync(FileName, '       <minorNumber>19</minorNumber>\n');
        fs.appendFileSync(FileName, '       <namespace>sf_chttr_apps</namespace>\n');
        fs.appendFileSync(FileName, '   </packageVersions>\n');
        fs.appendFileSync(FileName, '   <packageVersions>\n');
        fs.appendFileSync(FileName, '       <majorNumber>1</majorNumber>\n');
        fs.appendFileSync(FileName, '       <minorNumber>7</minorNumber>\n');
        fs.appendFileSync(FileName, '     <namespace>sf_com_apps</namespace>\n');
        fs.appendFileSync(FileName, '  </packageVersions>\n');
        fs.appendFileSync(FileName, '</ApexPage>\n');


      
}

function cleanDump(directory = "dump") {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
          });
        }
    });
}

module.exports = {
    GenerateController,
    GenerateTrigger,
    GenerateViewPage,
    GenerateEditController,
    GetControlFromType,
    GenerateService,
    GenererateEditPage,
    GenerateGlobalService,
    makeid,
    compressZip,
    GenerateTriggerMetaFile,
    GenerateClsMetaFile,
    GeneratePageMetaFile,
    cleanDump,
}