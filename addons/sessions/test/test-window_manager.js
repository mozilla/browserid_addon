const {WindowManager} = require("window_manager");
const {WindowTracker} = require("window-utils");
const windows = require("windows").browserWindows;

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

/*exports['each initially open window has a window manager'] = function(test) {
  let success = true;
  for each(let window in windows) {
      success = success && !!window.wm;
  }

  test.assertStrictEqual(success, true, "all windows have a window manager");
};

/*
exports['when opening a window, we get a session'] = function(test) {
    let success = false;

    openCallback = function(window) {
        test.assertEqual(!!window.session, true, "a session is put on the browser window");
        test.done();
    };

    windows.open("http://www.google.com/");
    test.waitUntilDone();
};
*/
