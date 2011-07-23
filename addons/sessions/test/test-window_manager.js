let {WindowManager} = require("window_manager");
let windows = require("windows").browserWindows;

let wm;
exports.setup = function() {
    wm = new WindowManager();
};

exports['we create it'] = function(test) {
    test.assertEqual(!!wm, true, 'we have a window manager');
};

exports['when opening a window, we get a session'] = function(test) {
    let success = false;

    windows.on("open", function(window) {
        console.log("window.open");
        test.assertEqual(!!window.session, true, "a session is put on the browser window");
        test.done();
    });

    windows.open("http://www.google.com/");
    test.waitUntilDone();
};
