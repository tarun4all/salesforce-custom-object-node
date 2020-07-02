const express = require("express")
const app = express();
const http = require('http').createServer(app);
const file_system = require('fs');
const archiver = require('archiver');
const jsforce = require('jsforce');
const path = require('path');
const shell = require('shelljs');
const {
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
    cleanDump,
} = require("./utils");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public/')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/api/customObj', (req, res) => {
    const _response = res;
    const objectName = req.body.object;
    const fieldForEncryption = req.body.field;
    const GlobalfileName = "GlobalService" + objectName.replace('__','');
    const ControllerClassName = "Cntr" + objectName.replace('__','');
    const EditControllerClassName = "CntrEdit" + objectName.replace('__','');
    const TriggerName = "Tr" + objectName.replace('__','');
    const ServiceClassName = "Service" + objectName.replace('__','');
    const ListViewPageName = "VFDisplay" + objectName.replace('__','');
    const EditPageName = "VFEdit" + objectName.replace('__','');
    const isOtherEnvironment = true; //req.body.salesforceEnvironment;
    const version = req.body.version;
    const conn = new jsforce.Connection({
        version: `${version}.0`
    });//'Srivastava@123cnICBecdyZLQ7R8g5OyPHnSr'
    conn.login(req.body.email, req.body.pwd + req.body.secret, function (err, res) {
      if (err) { console.error(err); }
      
      //clear the folder for new files
    //   cleanDump();
        
      var _temp = _response;
      conn.sobject(objectName).describe(function (err, meta) {
        if (err) { console.error(err); }
        let fielsDescription = "";
        let fieldDetail = [];
        meta.fields.forEach(element => {
          if (element.name != "OwnerId" && element.name != "IsDeleted" && element.name != "CreatedDate" && element.name != "CreatedById" && element.name != "LastModifiedDate" && element.name != "LastModifiedById" && element.name != "SystemModstamp" && element.name != "LastViewedDate" && element.name != "LastReferencedDate" && element.name != "LastActivityDate") {
            let fields = {};
            fielsDescription = fielsDescription + element.name + ",";
            fields.DataType = element.type;
            fields.FieldName = element.name;
            fields.FieldLabel = element.label;
            fieldDetail.push(fields);
            console.log(element.name);
            console.log(element.type);
          }
    
        });
        const fieldsString = fielsDescription.substring(0, fielsDescription.length - 1);
        console.log(fieldDetail);
        console.log(GetControlFromType("boolean"));
        console.log(fieldsString);
        GenerateService(fieldsString, fieldForEncryption, ServiceClassName, objectName,isOtherEnvironment,version);
        GenerateGlobalService(fieldsString, fieldForEncryption, GlobalfileName, objectName,isOtherEnvironment,version);
        GenerateTrigger(TriggerName, objectName, fieldForEncryption,ServiceClassName,isOtherEnvironment,version);
        GenerateController(fieldsString, ControllerClassName, objectName,isOtherEnvironment,version,ListViewPageName);
        GenerateEditController(fieldsString, fieldForEncryption, EditControllerClassName, ServiceClassName, objectName,isOtherEnvironment,version,ListViewPageName);
        GenerateViewPage(fieldDetail, ControllerClassName, ListViewPageName,EditPageName,isOtherEnvironment,version);
        GenererateEditPage(fieldDetail, GlobalfileName, EditControllerClassName, EditPageName,fieldForEncryption,ListViewPageName,isOtherEnvironment,version); 

        const zipName = makeid(25);
        const output = shell.exec(`zip -r ./public/zip/${zipName}.zip dump `);
        console.log(output.stdout);
        setTimeout(() => {
            _temp.send({status: zipName});
        }, 1000);
      });
    });
});

app.get("/download", (req, res) => {
    var output = file_system.createWriteStream(__dirname + '/example.zip');
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
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});