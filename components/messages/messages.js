var getRepoInfo = require('git-repo-info');
var colors = require('colors');
var info = getRepoInfo();
var version_string = "1.0.0";
var testDate = new Date(info.authorDate);
var SETTINGS = require("../../settings.json");

function welcome(){
  console.log(colors.blue("================================================="));
  console.log(SETTINGS.SERVER_NAME + "!");
  console.log(colors.blue("================================================="));
  console.log("BRANCH: " + colors.yellow(info.branch));
  console.log("COMMIT: " + colors.yellow(info.commitMessage));
  console.log("DATE: " + colors.yellow(testDate));
  console.log("VERSION: " + colors.yellow((info.tag || info.abbreviatedSha)));
  console.log(colors.blue("================================================="));
}

module.exports = {
  welcome: welcome
};
