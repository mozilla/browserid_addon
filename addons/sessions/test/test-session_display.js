const {Cc, Ci} = require("chrome");
const {SessionDisplay} = require("session_display");
const {Helpers} = require("helpers");

let widget;
exports.setup = function() {
    if(!widget) {
        let doc = Helpers.chrome.getDocument();
        widget = SessionDisplay({
            document: doc 
        });
    }
};

exports['test creatable'] = function(test) {
    test.assertNotUndefined(widget, 'widget has been created');
};

exports['adds elements'] = function(test) {
    let box = Helpers.chrome.getElementById('identity-session-box');
    test.assertEqual(true, !!box, 'box has been added');
};

exports['login emitted when signIn button pressed'] = function(test) {
    let success = false;
    widget.on("login", function() {
        success = true;
    });

    let signIn = Helpers.chrome.getElementById('identity-session-signin');
    let evt = Helpers.chrome.simulateDOMEvent(signIn, "MouseEvents", "click");

    test.assertEqual(success, true, "login event fired on click");
};

exports['userinfo emitted when userinfo button pressed'] = function(test) {
    let success = false;
    widget.on("userinfo", function() {
        success = true;
    });

    let signIn = Helpers.chrome.getElementById('identity-session-userinfo');
    let evt = Helpers.chrome.simulateDOMEvent(signIn, "MouseEvents", "click");

    test.assertEqual(success, true, "userinfo event fired on click");
};



