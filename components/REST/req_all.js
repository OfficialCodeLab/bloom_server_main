var fs = require("fs");

function init(pass_express) {

    allObject(pass_express);
    // singleObject(app);

    console.log("WILDCARD MODULE LAUNCHED");
}

function allObject(app){
  app.post('/', function(req, resMain) {

      console.log("Received GET for YOUR QUERY HERE - Multiple");
      console.log("PROTOCOL: " + req.protocol + '://' + req.get('host') + req.originalUrl + "\n");
      // console.log("Printing request body: \n" + prettify(req.body));

      var form_type = capitalize(req.body.dayForm.monitor_type);

      //Write the file
      var filepath = "datafiles/";
      var filename = form_type + "_" + generateFilename();

      fs.writeFile(filepath + filename, prettify(req.body), function(){
          console.log("Wrote file: " + filepath + filename);
      });

      resMain.send("POST RECEIVED!")
  });
}

function prettify(input){
  return JSON.stringify(input, null, 4);
}

function generateFilename(form_type){

    var input = (new Date());
    var year = padNumbers(input.getFullYear().toString());
    var month = padNumbers((input.getMonth() + 1).toString());
    var day = padNumbers(input.getDate().toString());
    var hours = padNumbers(input.getHours().toString());
    var minutes = padNumbers(input.getMinutes().toString());
    var seconds = padNumbers(input.getSeconds().toString());

    function padNumbers(input, paddingAmount) {
        var padding;
        var returnMe = "";
        if (!paddingAmount) {
            padding = 2;
        } else {
            padding = paddingAmount;
        }
        // console.log("Length: " + input.toString().length);
        if (input.length < padding) {

            var zerosToAdd = padding - input.length;
            for (i = 0; i < zerosToAdd; i++) {
                returnMe += "0";
            }
        }
        returnMe += input;
        return returnMe;
    }

    return year + "_" + month + "_" + day + "h" + hours + "m" + minutes + "s" + seconds + ".json";
}

function capitalize(input){
    var returnMe;
    try {
        returnMe = input.charAt(0).toString().toUpperCase() + input.substring(1);
    } catch (ex){
        returnMe = "ERROR";
    }
    return returnMe;
}


module.exports = {
    init: init
};
