var fs = require("fs");

function init(pass_express) {

    var app = pass_express;

    allObject(app);
    singleObject(app);
}

function allObject(app){
  app.get('/endpoint', function(req, resMain) {

      console.log("Received GET for YOUR QUERY HERE - Multiple");
      console.log("PROTOCOL: " + req.protocol + '://' + req.get('host') + req.originalUrl + "\n");

      var query = "SELECT SOMETHING FROM SOMETHING_ELSE";
      createQuery(query, function(res) {
          var sendMeBack = {};

          sendMeBack['model-name'] = res.records;

          // fs.writeFileSync("datafiles/sf_output.json", JSON.stringify(sendMeBack, null, 4));

          resMain.send(sendMeBack);
      }, function(error){});
  });
}

function singleObject(app){
    app.get('/endpoint/:Id', function(req, resMain) {
        console.log("Received GET for YOUR QUERY HERE - Single");
        console.log("PROTOCOL: " + req.protocol + '://' + req.get('host') + req.originalUrl + "\n");
        // console.log("====================================");
        // res.send("This is successful!");
        var query = "SELECT SOMETHING FROM SOMETHING_ELSE WHERE Id = '" + req.params.Id + "'";
        createQuery(query, function(res){

            var sendMeBack = {};
            sendMeBack['model-name'] = res.records;
            // fs.writeFileSync("datafiles/sf_output.json", JSON.stringify(sendMeBack, null, 4));
            resMain.send(sendMeBack);

        }, function(error){});
    });
}



module.exports = {
    init: init
};
