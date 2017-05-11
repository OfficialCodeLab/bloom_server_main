/*============================================================================
    Bloom Production Server!
    Developed by CodeLab
 ============================================================================*/

// These are for the welcome messages / git information
let consoleMessages = require("./components/messages/messages.js");
consoleMessages.welcome();

// Imports for running an API
let express = require('express');
let cors = require('cors');
let request = require('request');
let open = require("open");
let SETTINGS = require("./settings.json");
let run_once = require("./components/tasks/run_once.js");

// Imports for Logging library
let winston = require("winston");

/*============================================================================
    Imports for Bloom
 ============================================================================*/

console.log("Loading BLOOM imports...");

// TODO: Import all your necessary things here.

console.log("... done.");

console.log("Requiring BLOOM modules...");

// TODO: Require all your bloom modules here, and init if necessary.
let databaseMonitor = require("./components/modules/databaseMonitor");
databaseMonitor.init( /* admin, templates, transporter */);

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

let app = express();
let bodyParser = require("body-parser");

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

    let rest_driver = require("./components/REST/driver");

    //Launch the rest api
    rest_driver.init(app);

});
console.log("==========================================\n");
