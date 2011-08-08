const {MainSession} = require("sessions/main_module");
const {MainBrowserID} = require("browserid/main_module");

exports.main = function() {
  MainSession();
//  MainBrowserID();
}

