var app;
var cors = require('cors');
var request = require('request');

function init(express){
    app = express;

    console.log("Launching REST API...");

    //LOAD ALL MODULES HERE
    var req_all = require("./req_all.js");

    //INIT ALL MODULES HERE
    req_all.init(app);

    console.log("\nREST API Initialized.\n");
}

module.exports = {
    init: init
};
