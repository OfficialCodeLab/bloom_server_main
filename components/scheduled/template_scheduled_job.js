var spawn = require("child_process").spawn,
    child;
var child_process = require("child_process");

/*===================================================================
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
===================================================================*/
var schedule = require('node-schedule');
var logs = {
    "log" : function(loglevel, input){
        console.log(loglevel.toUpperCase + ": " + input);
    }
};

var run_at_every_x_minute = 59;

function init(logger, callback) {
    logs = logger;
    console.log();
    logs.log("info", "Starting Scheduled Job...");

    var rule = new schedule.RecurrenceRule();
    rule.minute = run_at_every_x_minute;

    var j = schedule.scheduleJob(rule, function() {
        //Your scheduled function here

    });//End of schedule rule
    callback(run_at_every_x_minute);

}

function logAll(logging_text) {
    logs.log("debug", "" + logging_text);
}

module.exports = {
    init: init
};
