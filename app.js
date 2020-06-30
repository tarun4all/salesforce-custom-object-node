const express = require("express")
const app = express();
const http = require('http').createServer(app);
const file_system = require('fs');
const archiver = require('archiver');
const jsforce = require('jsforce');
const path = require('path');
const { notEqual } = require('assert');
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
    console.log(req.body);
    const _response = res;
    const objectName = req.body.object;
    const fieldForEncryption = req.body.field;
    const GlobalfileName = "GlobalService_" + objectName;
    const ControllerClassName = "Cntr_" + objectName;
    const EditControllerClassName = "Cntr_Edit_" + objectName;
    const TriggerName = "Tr_" + objectName;
    const ServiceClassName = "Service_" + objectName;
    const ListViewPageName = "VF_Display_" + objectName;
    const EditPageName = "VF_Edit_" + objectName;

    const conn = new jsforce.Connection({
        version: `${req.body.version}.0`
    });//'Srivastava@123cnICBecdyZLQ7R8g5OyPHnSr'
    conn.login(req.body.email, req.body.pwd + req.body.secret, function (err, res) {
      if (err) { console.error(err); }
        
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
        GenerateService(fieldsString, fieldForEncryption, ServiceClassName, objectName);
        GenerateGlobalService(fieldsString, fieldForEncryption, GlobalfileName, objectName);
        GenerateTrigger(TriggerName, objectName, fieldForEncryption);
        GenerateController(fieldsString, ControllerClassName, objectName);
        GenerateEditController(fieldsString, fieldForEncryption, EditControllerClassName, ServiceClassName, objectName);
        GenerateViewPage(fieldDetail, ControllerClassName, ListViewPageName);
        GenererateEditPage(fieldDetail, GlobalfileName, EditControllerClassName, EditPageName);

        const zipName = makeid(25);
        cleanDump();
        compressZip(zipName);
        _temp.send({status: zipName});
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
    
    // var file1 = __dirname + '/app.js';
    // archive.append(file_system.createReadStream(file1), { name: 'app.js' });
    
    // append a file from string
    // archive.append('string cheese!', { name: 'file2.txt' });
    
    // append a file from buffer
    // var buffer3 = Buffer.from('buff it!');
    // archive.append(buffer3, { name: 'file3.txt' });
    
    // append a file
    // archive.file('file1.txt', { name: 'file4.txt' });
    
    // append files from a sub-directory and naming it `new-subdir` within the archive
    // archive.directory('subdir/', 'new-subdir');
    
    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory('dump/', false);
    
    // append files from a glob pattern
    // archive.glob('subdir/*.txt');
    archive.finalize();
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});