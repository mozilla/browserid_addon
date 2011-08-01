const {Cc, Ci} = require("chrome");
const {SessionDisplay} = require("session_display");
const {Helpers} = require("helpers");
const {Session} = require("session");
const {CookieMonster} = require("cookie_monster");

let widget, session = new Session({
  host: "www.mozilla.com",
  cookieManager: new CookieMonster()
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

exports["test creatable"] = function(test) {
    test.assertNotUndefined(widget, "widget has been created");
};

exports["adds elements"] = function(test) {
    let box = Helpers.chrome.getElementById("identity-session-box");
    test.assertEqual(true, !!box, "box has been added");
};

exports["login emitted when signIn button pressed"] = function(test) {
    let success = false;
    widget.on("login", function() {
        success = true;
    });

    let signIn = Helpers.chrome.getElementById("identity-session-signin");
    let evt = Helpers.chrome.simulateDOMEvent(signIn, "MouseEvents", "click");

    test.assertEqual(success, true, "login event fired on click");
};

exports["userinfo emitted when userinfo button pressed"] = function(test) {
    let success = false;
    widget.on("userinfo", function() {
        success = true;
    });

    let signIn = Helpers.chrome.getElementById("identity-session-userinfo");
    let evt = Helpers.chrome.simulateDOMEvent(signIn, "MouseEvents", "click");

    test.assertEqual(success, true, "userinfo event fired on click");
};


exports["show shows the box"] = function(test) {
    let success = false;
    widget.on("show", function() {
        success = true;
    });
    widget.show();

    let box = Helpers.chrome.getElementById("identity-session-box");
    test.assertEqual(box.hidden || box.collapsed, false, "box is neither hidden nor collapsed");
    test.assertEqual(success, true, "show event triggered");
};



exports["hide hides the box"] = function(test) {
    let success = false;
    widget.on("hide", function() {
        success = true;
    });
    widget.hide();

    let box = Helpers.chrome.getElementById("identity-session-box");
    test.assertEqual(box.hidden || box.collapsed, true, "box is either hidden nor collapsed");
    test.assertEqual(success, true, "hide event triggered");
};


exports["setting no sessions hides the box"] = function(test) {
    let success = false;
    widget.on("hide", function() {
        success = true;
    });

    session.sessions = undefined;
    test.assertStrictEqual(success, true, "Setting no sessions hides the box");

};

exports["setting a the sessions to an empty array shows the box"] = function(test) {
    let success = false;
    widget.on("show", function() {
        success = true;
    });

    session.sessions = [];
    test.assertStrictEqual(success, true, "Setting a session shows the box");
};

exports["setting a session shows the box, updates userinfo"] = function(test) {
    let success = false;
    widget.on("show", function() {
        success = true;
    });

    session.sessions = [{
        email: "shane"
    }];
    test.assertStrictEqual(success, true, "Setting a session shows the box");

    let box = Helpers.chrome.getElementById("identity-session-userinfo");

    test.assertEqual(box.value, "shane", "update email, causes userinfo to update");
};


