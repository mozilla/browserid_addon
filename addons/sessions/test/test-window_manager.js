"use strict";
const {WindowManager} = require("window_manager");
const {WindowTracker} = require("window-utils");
const windows = require("windows").browserWindows;
const {Helpers} = require("helpers");

let wm, openCallback;
exports.setup = function() {
    wm = new WindowManager();

    openCallback = undefined;
    windows.on("open", function(window) {
        if(openCallback) openCallback(window);
    });
};

exports['we create it'] = function(test) {
    test.assertEqual(!!wm, true, 'we have a window manager');
};

exports['each initially open window has a session'] = function(test) {
  let success = true;
  for each(let window in windows) {
      success = success && !!window.session;
  }

  test.assertStrictEqual(success, true, "all windows have a session");
};

exports['when opening a window, we get a session'] = function(test) {
    let success = false;

    openCallback = function(window) {
        test.assertEqual(!!window.session, true, "a session is put on the browser window");
        test.done();
    };

    windows.open("http://www.mozilla.com/");
    test.waitUntilDone();
};
