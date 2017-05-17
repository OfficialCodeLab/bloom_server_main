/*============================================================================
    Bloom Production Server!
    Developed by CodeLab
 ============================================================================*/

// These are for the welcome messages / git information
var consoleMessages = require("./components/messages/messages.js");
consoleMessages.welcome();

// Imports for running an API
var express = require('express');
var cors = require('cors');
var request = require('request');
var open = require("open");
var SETTINGS = require("./settings.json");
var run_once = require("./components/tasks/run_once.js");

// Imports for Logging library
var winston = require("winston");

/*============================================================================
    Imports for Bloom
 ============================================================================*/

console.log("Loading BLOOM imports...");

// TODO: Import all your necessary things here.
var path = require('path');
var EmailTemplates = require('swig-email-templates');
var nodemailer = require('nodemailer');
var admin = require("firebase-admin");
var rek = require('rekuire');
var moment = require('moment');
// var schedule = require('node-schedule');
var templates = new EmailTemplates({
  root: path.join(__dirname, "templates")
});


/*======================================================================*\
    Initialize Section
\*======================================================================*/

var mailLogin = rek("credentials/bloom-gmail.json");

// Set up nodemailer transporter with an account
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: mailLogin.email,
        pass: mailLogin.pass
    }
});

/*======================================================================*\
    Mailgun credentials
\*======================================================================*/

var mailgunCredentials = rek("credentials/mailgun-credentials.json");

var mailgunDomain = mailgunCredentials.baseURL;
var mailgunApiKey =mailgunCredentials.apiKey;

var mailgun = require('mailgun-js')({ apiKey: mailgunApiKey, domain: mailgunDomain });

var mailcomposer = require('mailcomposer');


/*======================================================================*\
    Set up firebase and database reference as variables
\*======================================================================*/

var serviceAccount = rek("credentials/pear-server-d23d792fe506.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pear-server.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("restricted_access/secret_document");

console.log("... done.");

console.log("Requiring BLOOM modules...");

// TODO: Require all your bloom modules here, and init if necessary.
let databaseMonitor = require("./components/modules/databaseMonitor");
databaseMonitor.init(admin, templates, transporter, mailgun, mailcomposer);

console.log("...done!");

/*============================================================================
    Configuration for Logging Library
 ============================================================================*/

winston.add(winston.transports.File, {
    filename: './logs/nodelogger.log',
    maxsize: 300000,
    maxfiles: 10
});
// winston.add(winston.transports.Console);
winston.level = 'debug';
// winston.log("This is a test!");

/*============================================================================
    Configuration for API
 ============================================================================*/

var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
    extended: false,
    limit: '10mb'
}));

app.use(bodyParser.json({
    limit: '10mb'
}));

app.use(bodyParser.raw({
    limit: '10mb'
}));

app.use(cors());

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

/*============================================================================
    Checker method to make sure all necessary folders exist
 ============================================================================*/

run_once.init();

/*============================================================================
    Launch the actual API
 ============================================================================*/

app.listen(SETTINGS.SERVER_PORT, function() {
    console.log('API Server running on port ' + SETTINGS.SERVER_PORT + '!\n');
    //Only do this once the server is running:\n

    var rest_driver = require("./components/REST/driver");

    //Launch the rest api
    rest_driver.init(app);

});
console.log("==========================================\n");
