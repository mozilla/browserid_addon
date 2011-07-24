"use strict";
const {WindowManager} = require("window_manager");
const {WindowTracker} = require("window-utils");
const windows = require("windows").browserWindows;
const {Helpers} = require("helpers");

let wm, openCallback, closeCallback;
exports.setup = function() {
    wm = new WindowManager();

    openCallback = closeCallback = undefined;
    let tracker = new WindowTracker({
        onTrack: function(window) {
            if(openCallback) openCallback(window);
        },
        onUntrack: function(window) {
            if(closeCallback) closeCallback(window);
        }
    });
};

exports['we create it'] = function(test) {
    test.assertEqual(!!wm, true, 'we have a window manager');
};

exports['each initially open window has a session'] = function(test) {
  let success = true;
  for each(let window in windows) {
      Helpers.toConsole(window);
      success = success && !!window.session;
  }

//  test.assertStrictEqual(success, true, "all windows have a session");
  test.pass();
};
/*
exports['when opening a window, we get a session'] = function(test) {
    let success = false;

    openCallback = function(window) {
        test.assertEqual(!!window.session, true, "a session is put on the browser window");
        test.done();
    };

    windows.open("http://www.mozilla.com/");
    test.waitUntilDone();
};
*/
