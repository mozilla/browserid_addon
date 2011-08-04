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

exports.teardown = function() {
    widget.teardown();
    widget = null;
};

exports["test creatable"] = function(test) {
    test.assertNotUndefined(widget, "widget has been created");
};

exports["adds elements"] = function(test) {
    let box = Helpers.chrome.getElementById("identity-session-box");
    test.assertEqual(true, !!box, "box has been added");
};

exports["Event issued whenever we click anywhere on the identity-session-box"] = function(test) {
    testClick("identity-session-signin");
    testClick("identity-session-arrow");
    testClick("identity-session-box");
    testClick("identity-session-userinfo");

    function testClick(id) {
      let success = false;
      widget.on("login", function() {
          success = true;
      });

      widget.setStatus("login");
      let signIn = Helpers.chrome.getElementById(id);
      let evt = Helpers.chrome.simulateDOMEvent(signIn, "MouseEvents", "click");

      test.assertEqual(success, true, "login event fired on click");

    }
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

exports["remove identityBox, make sure things still run"] = function(test) {
      widget.teardown();

      let doc = Helpers.chrome.getDocument();
      let ib = doc.getElementById("identity-box");
      let parent = ib.parentNode;
      let next = ib.nextSibling;

      parent.removeChild(ib);

      widget = SessionDisplay({
          document: doc,
          session: session
      });

      widget.show();
      widget.hide();

      let statusBox = doc.getElementById("identity-session-box");
      test.assertNotStrictEqual(null, statusBox, "Even without the right box to insert before, we have a status box");
      test.assertNotUndefined(statusBox.parentNode, "statusBox has a parentNode");

      parent.insertBefore(ib, next);
};

exports["on teardown, there are no buttons"] = function(test) {
    widget.teardown();
    let doc = Helpers.chrome.getDocument();
    let statusBox = doc.getElementById("identity-session-box");
    test.assertStrictEqual(null, statusBox, "after teardown there is no box");
};


