const {Cc, Ci} = require("chrome");
const {SessionDisplay} = require("session_display");
const {Helpers} = require("helpers");
const {Model} = require("model");

let widget, session = new Model({
  fields: ['email','status'] 
});

exports.setup = function() {
    if(!widget) {
        let doc = Helpers.chrome.getDocument();
        widget = SessionDisplay({
            document: doc,
            session: session
        });
    }
    widget.hide();
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


exports['changing the model email changes userinfo'] = function(test) {
    session.email = "shane";    
    let box = Helpers.chrome.getElementById("identity-session-userinfo");

    test.assertEqual(box.value, "shane", "update email, causes userinfo to update");
};

exports['show shows the box'] = function(test) {
    let success = false;
    widget.on('show', function() {
        success = true;
    });
    widget.show();

    let box = Helpers.chrome.getElementById("identity-session-box");
    test.assertEqual(box.hidden || box.collapsed, false, "box is neither hidden nor collapsed");
    test.assertEqual(success, true, "show event triggered");
};



exports['hide hides the box'] = function(test) {
    let success = false;
    widget.on('hide', function() {
        success = true;
    });
    widget.hide();

    let box = Helpers.chrome.getElementById("identity-session-box");
    test.assertEqual(box.hidden || box.collapsed, true, "box is either hidden nor collapsed");
    test.assertEqual(success, true, "hide event triggered");
};



exports['setting the status to login shows box'] = function(test) {
    let success = false;
    widget.on('show', function() {
        success = true;
    });

    session.status = 'login';
    test.assertEqual(success, true, 'we show the box when setting status to login');
};

exports['setting the status to none hides box'] = function(test) {
    let show = false, hide = false;
    widget.on('show', function() {
        show = true;
    });
    widget.on('hide', function() {
        hide = true;
    });

    session.status = 'login';
    session.status = 'none';
    test.assertEqual(show && hide, true, 'we hide the box when setting status to none');
};

exports['setting the status to loggedin shows box'] = function(test) {
    let success = false;
    widget.on('show', function() {
        success = true;
    });

    session.status = 'loggedin';
    test.assertEqual(success, true, 'we show the box when setting status to loggedin');
};

