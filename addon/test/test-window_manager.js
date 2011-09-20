"use strict";
const {WindowManager} = require("sessions/window_manager");
const {WindowTracker} = require("window-utils");
const windows = require("windows").browserWindows;
const {Helpers} = require("helpers");
const self = require("self");
const stylesheetURI = self.data.url("sessions/styles/identity-sessions.css");

let wm, openCallback;
let windowOpenHandler = function(window) {
    if(openCallback) openCallback(window);
}
exports.setup = function() {
    windows.on("open", windowOpenHandler);
    wm = new WindowManager();
    openCallback = undefined;
};

exports.teardown = function() {
  windows.removeListener("open", windowOpenHandler);
  wm.teardown();
  wm = null;
};

exports['we create it'] = function(test) {
    test.assertEqual(!!wm, true, 'we have a window manager');
};

exports['each initially open window has a session'] = function(test) {
  for each(let win in windows) {
      let success = !!win.session;
      test.assertStrictEqual(success, true, "all wins have a session");

      /*console.log("looking for stylesheet: " + stylesheetURI);
      let hasStylesheet = Helpers.chrome.stylesheetExists(stylesheetURI, win.document);
      test.assertEqual(hasStylesheet, true, "win has stylesheet");
    */
  }
};

exports['when opening a window, we get a session, stylesheet'] = function(test) {
    let success = false;

    openCallback = function(win) {
        test.assertEqual(!!win.session, true, "a session is put on the browser win");
        /*let hasStylesheet = Helpers.chrome.stylesheetExists(stylesheetURI, win.document);
        test.assertEqual(hasStylesheet, true, "window has stylesheet");
        */
        test.done();
    };

    windows.open("http://www.mozilla.com/");
    test.waitUntilDone();
};

/*exports["when clicking login, login event is triggered"] = function(test) {
    let window;
    wm.on("login", function(activeWindow) {
        window = activeWindow;
    });

    let el = Helpers.chrome.getElementById("identity-session-signin");
    Helpers.chrome.simulateDOMEvent(el, "MouseEvents", "click");
    test.assertStrictEqual(!!window, true, "login was triggered, we have a window"); 
};
*/
